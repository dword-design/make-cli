import withLocalTmpDir from 'with-local-tmp-dir'
import { outputFile, exists } from 'fs-extra'
import { endent } from '@dword-design/functions'
import execa from 'execa'

const runCli = async ({ optionsString: _optionsString, arguments: args = [], check: _check }) => withLocalTmpDir(async () => {

  const optionsString = typeof _optionsString === 'function' ? _optionsString : () => _optionsString
  const check = typeof _check === 'function' ? _check : stdout => expect(stdout).toEqual(_check)

  await outputFile(
    'cli.js',
    endent`
      #!/usr/bin/env node

      const makeCli = require('make-cli')
      const { outputFile } = require('fs-extra')

      makeCli(${optionsString()})
    `,
    { mode: '755' },
  )

  try {
    const { all } = await execa('./cli.js', args, { all: true })

    await check(all)

  } catch (error) {
    if (error.all !== undefined) {
      console.error(error.all)
    }
    throw error
  }
})

export default {
  action: () => runCli({
    optionsString: '{ action: () => console.log(\'foo\') }',
    check: 'foo',
  }),
  'arguments: mandatory': () => runCli({
    optionsString: endent`{
      arguments: '<first> <second>',
      action: (first, second) => { console.log(first); console.log(second) },
    }`,
    arguments: ['foo', 'bar'],
    check: 'foo\nbar',
  }),
  'arguments: optional not set': () => runCli({
    optionsString: endent`{
      arguments: '[arg]',
      action: arg => console.log(arg),
    }`,
    check: 'undefined',
  }),
  'arguments: optional set': () => runCli({
    optionsString: endent`{
      arguments: '[arg]',
      action: arg => console.log(arg),
    }`,
    arguments: ['foo'],
    check: 'foo',
  }),
  'commands: arguments': () => runCli({
    optionsString: () => {
      const outputFileExpression = 'outputFile(`${arg}.txt`, \'\')'
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
    check: async () => expect(await exists('foo.txt')).toBeTruthy(),
  }),
  'commands: default': () => runCli({
    optionsString: endent`{
      commands: [
        {
          name: 'build',
          handler: () => console.log('foo'),
        }
      ],
      defaultCommandName: 'build',
    }`,
    check: 'foo',
  }),
  'commands: options': () => runCli({
    optionsString: () => {
      const outputFileExpression = 'outputFile(`${value}.txt`, \'\')'
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
    check: async () => expect(await exists('foo.txt')).toBeTruthy(),
  }),
  'commands: valid': () => runCli({
    optionsString: () => endent`{
      commands: [
        {
          name: 'build',
          handler: () => outputFile('foo.txt', ''),
        }
      ],
    }`,
    arguments: ['build'],
    check: async () => expect(await exists('foo.txt')).toBeTruthy(),
  }),
  help: () => runCli({
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
    check: 'Usage: the name the usage\n\nOptions:\n  -V, --version  output the version number\n  -h, --help     output usage information\n\nCommands:\n  build          Builds the app',
  }),
  options: () => runCli({
    optionsString: () => {
      const outputFileExpression = 'outputFile(`${value}.txt`, \'\')'
      return endent`{
        options: [
          { name: '--value <value>' },
        ],
        action: ({ value }) => ${outputFileExpression},
      }`
    },
    arguments: ['--value', 'foo'],
    check: async () => expect(await exists('foo.txt')).toBeTruthy(),
  }),
  version: () => runCli({
    optionsString: '{ version: \'0.1.0\' }',
    arguments: ['--version'],
    check: '0.1.0',
  }),
}
