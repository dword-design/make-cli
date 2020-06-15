import withLocalTmpDir from 'with-local-tmp-dir'
import { outputFile, exists } from 'fs-extra'
import { endent, mapValues } from '@dword-design/functions'
import execa from 'execa'

const runTest = ({
  optionsString: _optionsString,
  arguments: args = [],
  test: _test,
}) => () =>
  withLocalTmpDir(async () => {
    const optionsString =
      typeof _optionsString === 'function'
        ? _optionsString
        : () => _optionsString
    const test =
      typeof _test === 'function'
        ? _test
        : stdout => expect(stdout).toEqual(_test)

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
      const { all } = await execa('./cli.js', args, { all: true })

      await test(all)
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
    optionsString: endent`{
      arguments: '<first> <second>',
      action: (first, second) => { console.log(first); console.log(second) },
    }`,
    arguments: ['foo', 'bar'],
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
    optionsString: endent`{
      arguments: '[arg]',
      action: arg => console.log(arg),
    }`,
    arguments: ['foo'],
    test: 'foo',
  },
  'commands: arguments': {
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
    arguments: ['build', 'foo'],
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
    arguments: ['build', '--value', 'foo'],
    test: async () => expect(await exists('foo.txt')).toBeTruthy(),
  },
  'commands: valid': {
    optionsString: () => endent`{
      commands: [
        {
          name: 'build',
          handler: () => outputFile('foo.txt', ''),
        }
      ],
    }`,
    arguments: ['build'],
    test: async () => expect(await exists('foo.txt')).toBeTruthy(),
  },
  help: {
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
    arguments: ['--help'],
    test:
      'Usage: the name the usage\n\nOptions:\n  -V, --version  output the version number\n  -h, --help     output usage information\n\nCommands:\n  build          Builds the app',
  },
  options: {
    optionsString: () => {
      const outputFileExpression = "outputFile(`${value}.txt`, '')"
      return endent`{
        options: [
          { name: '--value <value>' },
        ],
        action: ({ value }) => ${outputFileExpression},
      }`
    },
    arguments: ['--value', 'foo'],
    test: async () => expect(await exists('foo.txt')).toBeTruthy(),
  },
  version: {
    optionsString: "{ version: '0.1.0' }",
    arguments: ['--version'],
    test: '0.1.0',
  },
} |> mapValues(runTest)
