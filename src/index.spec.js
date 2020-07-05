import { endent, mapValues } from '@dword-design/functions'
import execa from 'execa'
import { exists, outputFile } from 'fs-extra'
import withLocalTmpDir from 'with-local-tmp-dir'

const runTest = config => () =>
  withLocalTmpDir(async () => {
    const optionsString =
      typeof config.optionsString === 'function'
        ? config.optionsString
        : () => config.optionsString
    const test =
      typeof config.test === 'function'
        ? config.test
        : stdout => expect(stdout).toEqual(config.test)
    await outputFile(
      'cli.js',
      endent`
      #!/usr/bin/env node

      const makeCli = require('../src')
      const { outputFile } = require('fs-extra')

      makeCli(${optionsString()})
    `,
      { mode: '755' }
    )
    try {
      const output = await execa('./cli.js', config.arguments, { all: true })
      await test(output.all)
    } catch (error) {
      if (error.all !== undefined) {
        console.error(error.all)
      }
      throw error
    }
  })

export default {
  action: {
    optionsString: "{ action: () => console.log('foo') }",
    test: 'foo',
  },
  'arguments: mandatory': {
    arguments: ['foo', 'bar'],
    optionsString: endent`{
      arguments: '<first> <second>',
      action: (first, second) => { console.log(first); console.log(second) },
    }`,
    test: 'foo\nbar',
  },
  'arguments: optional not set': {
    optionsString: endent`{
      arguments: '[arg]',
      action: arg => console.log(arg),
    }`,
    test: 'undefined',
  },
  'arguments: optional set': {
    arguments: ['foo'],
    optionsString: endent`{
      arguments: '[arg]',
      action: arg => console.log(arg),
    }`,
    test: 'foo',
  },
  'commands: arguments': {
    arguments: ['build', 'foo'],
    optionsString: () => {
      const outputFileExpression = "outputFile(`${arg}.txt`, '')"
      return endent`{
        commands: [
          {
            name: 'build',
            arguments: '<arg>',
            handler: arg => ${outputFileExpression},
          }
        ],
      }`
    },
    test: async () => expect(await exists('foo.txt')).toBeTruthy(),
  },
  'commands: default': {
    optionsString: endent`{
      commands: [
        {
          name: 'build',
          handler: () => console.log('foo'),
        }
      ],
      defaultCommandName: 'build',
    }`,
    test: 'foo',
  },
  'commands: options': {
    arguments: ['build', '--value', 'foo'],
    optionsString: () => {
      const outputFileExpression = "outputFile(`${value}.txt`, '')"
      return endent`{
        commands: [
          {
            name: 'build',
            options: [
              { name: '--value <value>' },
            ],
            handler: ({ value }) => ${outputFileExpression},
          }
        ],
      }`
    },
    test: async () => expect(await exists('foo.txt')).toBeTruthy(),
  },
  'commands: valid': {
    arguments: ['build'],
    optionsString: () => endent`{
      commands: [
        {
          name: 'build',
          handler: () => outputFile('foo.txt', ''),
        }
      ],
    }`,
    test: async () => expect(await exists('foo.txt')).toBeTruthy(),
  },
  help: {
    arguments: ['--help'],
    optionsString: endent`{
      version: '0.1.0',
      name: 'the name',
      usage: 'the usage',
      commands: [
        {
          name: 'build',
          description: 'Builds the app',
        },
      ],
    }`,
    test: endent`
      Usage: the name the usage

      Options:
        -V, --version   output the version number
        -h, --help      display help for command

      Commands:
        build           Builds the app
        help [command]  display help for command
    `,
  },
  options: {
    arguments: ['--value', 'foo'],
    optionsString: () => {
      const outputFileExpression = "outputFile(`${value}.txt`, '')"
      return endent`{
        options: [
          { name: '--value <value>' },
        ],
        action: ({ value }) => ${outputFileExpression},
      }`
    },
    test: async () => expect(await exists('foo.txt')).toBeTruthy(),
  },
  version: {
    arguments: ['--version'],
    optionsString: "{ version: '0.1.0' }",
    test: '0.1.0',
  },
} |> mapValues(runTest)
