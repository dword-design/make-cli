import { endent, mapValues } from '@dword-design/functions'
import { execa } from 'execa'
import fs from 'fs-extra'
import withLocalTmpDir from 'with-local-tmp-dir'

const runTest = config => () =>
  withLocalTmpDir(async () => {
    const callString =
      typeof config.callString === 'function'
        ? config.callString
        : () => config.callString

    const test =
      typeof config.test === 'function'
        ? config.test
        : stdout => expect(stdout).toEqual(config.test)
    await Promise.all([
      fs.outputFile(
        'cli.js',
        endent`
          #!/usr/bin/env node

          import makeCli from '../src/index.js'
          import fs from 'fs-extra'

          ${callString()}
        `,
        { mode: '755' },
      ),
      fs.outputFile('package.json', JSON.stringify({ type: 'module' })),
    ])
    try {
      const output = await execa('./cli.js', config.arguments, { all: true })
      await test(output.all)
    } catch (error) {
      await test(error.all)
    }
  })

export default {
  action: {
    callString: "makeCli({ action: () => console.log('foo') })",
    test: 'foo',
  },
  'arguments: mandatory': {
    arguments: ['foo', 'bar'],
    callString: endent`
      makeCli({
        arguments: '<first> <second>',
        action: (first, second) => { console.log(first); console.log(second) },
      })
    `,
    test: 'foo\nbar',
  },
  'arguments: optional not set': {
    callString: endent`
      makeCli({
        arguments: '[arg]',
        action: arg => console.log(arg),
      })
    `,
    test: 'undefined',
  },
  'arguments: optional set': {
    arguments: ['foo'],
    callString: endent`
      makeCli({
        arguments: '[arg]',
        action: arg => console.log(arg),
      })
    `,
    test: 'foo',
  },
  'async error': {
    callString: endent`
      const run = async () => {
        try {
          await makeCli({
            action: async () => {
              await new Promise(resolve => setTimeout(resolve, 100))
              throw new Error('foo')
            },
          })
        } catch (error) {
          console.log(error.message)
          process.exit(1)
        }
      }
      run()
    `,
    test: 'foo',
  },
  'commands: arguments': {
    arguments: ['build', 'foo'],
    callString: () => {
      const outputFileExpression = "fs.outputFile(`${arg}.txt`, '')"

      return endent`
        makeCli({
          commands: [
            {
              name: 'build',
              arguments: '<arg>',
              handler: arg => ${outputFileExpression},
            }
          ],
        })
      `
    },
    test: async () => expect(await fs.exists('foo.txt')).toBeTruthy(),
  },
  'commands: default': {
    callString: endent`
      makeCli({
        commands: [
          {
            name: 'build',
            handler: () => console.log('foo'),
          }
        ],
        defaultCommandName: 'build',
      })
    `,
    test: 'foo',
  },
  'commands: options': {
    arguments: ['build', '--value', 'foo'],
    callString: () => {
      const outputFileExpression = "fs.outputFile(`${value}.txt`, '')"

      return endent`
        makeCli({
          commands: [
            {
              name: 'build',
              options: [
                { name: '--value <value>' },
              ],
              handler: ({ value }) => ${outputFileExpression},
            }
          ],
        })
      `
    },
    test: async () => expect(await fs.exists('foo.txt')).toBeTruthy(),
  },
  'commands: valid': {
    arguments: ['build'],
    callString: () => endent`
      makeCli({
        commands: [
          {
            name: 'build',
            handler: () => fs.outputFile('foo.txt', ''),
          }
        ],
      })
    `,
    test: async () => expect(await fs.exists('foo.txt')).toBeTruthy(),
  },
  help: {
    arguments: ['--help'],
    callString: endent`
      makeCli({
        version: '0.1.0',
        name: 'the name',
        usage: 'the usage',
        commands: [
          {
            name: 'build',
            description: 'Builds the app',
          },
        ],
      })
    `,
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
  'option choices': {
    arguments: ['--foo', 'xyz'],
    callString: endent`
      makeCli({
        options: [
          { name: '-f, --foo <foo>', choices: ['bar', 'baz'] },
        ],
      })
    `,
    test: "error: option '-f, --foo <foo>' argument 'xyz' is invalid. Allowed choices are bar, baz.",
  },
  options: {
    arguments: ['--value', 'foo'],
    callString: () => {
      const outputFileExpression = "fs.outputFile(`${value}.txt`, '')"

      return endent`
        makeCli({
          options: [
            { name: '--value <value>' },
          ],
          action: ({ value }) => ${outputFileExpression},
        })
      `
    },
    test: async () => expect(await fs.exists('foo.txt')).toBeTruthy(),
  },
  'unknown option': {
    arguments: ['--foo'],
    callString: endent`
      makeCli({
        allowUnknownOption: true,
        action: (options, command) => console.log(command.args),
      })
    `,
    test: "[ '--foo' ]",
  },
  version: {
    arguments: ['--version'],
    callString: "makeCli({ version: '0.1.0' })",
    test: '0.1.0',
  },
} |> mapValues(runTest)
