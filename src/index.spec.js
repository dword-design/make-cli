import { endent, property } from '@dword-design/functions'
import { execaCommand } from 'execa'
import fs from 'fs-extra'
import withLocalTmpDir from 'with-local-tmp-dir'

const outputCliFile = content =>
  fs.outputFile(
    'cli.js',
    endent`
      #!/usr/bin/env node

      import self from '../src/index.js'

      ${content}
    `,
    { mode: '755' },
  )

export default {
  action: async () => {
    await outputCliFile("self({ action: () => console.log('foo') })")
    expect(execaCommand('./cli.js') |> await |> property('stdout')).toEqual(
      'foo',
    )
  },
  async afterEach() {
    await this.resetWithLocalTmpDir()
  },
  'arguments: mandatory': async () => {
    await outputCliFile(endent`
      self({
        arguments: '<first> <second>',
        action: (first, second) => { console.log(first); console.log(second) },
      })
    `)
    expect(execaCommand('./cli.js foo bar') |> await |> property('stdout'))
      .toEqual(endent`
        foo
        bar
      `)
  },
  'arguments: optional not set': async () => {
    await outputCliFile(endent`
      self({
        arguments: '[arg]',
        action: arg => console.log(arg),
      })
    `)
    expect(execaCommand('./cli.js') |> await |> property('stdout')).toEqual(
      'undefined',
    )
  },
  'arguments: optional set': async () => {
    await outputCliFile(endent`
      self({
        arguments: '[arg]',
        action: arg => console.log(arg),
      })
    `)
    expect(execaCommand('./cli.js foo') |> await |> property('stdout')).toEqual(
      'foo',
    )
  },
  'async error': async () => {
    await outputCliFile(endent`
      const run = async () => {
        try {
          await self({
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
    `)
    await expect(execaCommand('./cli.js')).rejects.toThrow('foo')
  },
  async beforeEach() {
    this.resetWithLocalTmpDir = await withLocalTmpDir()
  },
  'commands: arguments': async () => {
    await outputCliFile(endent`
      self({
        commands: [
          {
            name: 'build',
            arguments: '<arg>',
            handler: arg => console.log(arg)
          }
        ],
      })
    `)
    expect(
      execaCommand('./cli.js build foo') |> await |> property('stdout'),
    ).toEqual('foo')
  },
  'commands: default': async () => {
    await outputCliFile(endent`
      self({
        commands: [
          {
            name: 'build',
            handler: () => console.log('foo'),
          }
        ],
        defaultCommandName: 'build',
      })
    `)
    expect(execaCommand('./cli.js') |> await |> property('stdout')).toEqual(
      'foo',
    )
  },
  'commands: object': async () => {
    await outputCliFile(endent`
      await self({
        commands: {
          foo: { description: 'foo description' },
          bar: { description: 'bar description' },
        },
      })
    `)
    expect(execaCommand('./cli.js --help') |> await |> property('stdout'))
      .toEqual(endent`
        Usage: cli [options] [command]

        Options:
          -h, --help      display help for command

        Commands:
          foo             foo description
          bar             bar description
          help [command]  display help for command
      `)
  },
  'commands: options': async () => {
    await outputCliFile(endent`
      self({
        commands: [
          {
            name: 'build',
            options: [
              { name: '--value <value>' },
            ],
            handler: options => console.log(options.value),
          }
        ],
      })
    `)
    expect(
      execaCommand('./cli.js build --value foo') |> await |> property('stdout'),
    ).toEqual('foo')
  },
  'commands: valid': async () => {
    await outputCliFile(endent`
      self({
        commands: [
          {
            name: 'build',
            handler: () => console.log('foo'),
          }
        ],
      })
    `)
    expect(
      execaCommand('./cli.js build') |> await |> property('stdout'),
    ).toEqual('foo')
  },
  help: async () => {
    await outputCliFile(endent`
      self({
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
    `)
    expect(execaCommand('./cli.js --help') |> await |> property('stdout'))
      .toEqual(endent`
        Usage: the name the usage

        Options:
          -V, --version   output the version number
          -h, --help      display help for command

        Commands:
          build           Builds the app
          help [command]  display help for command
      `)
  },
  'option choices': async () => {
    await outputCliFile(endent`
      self({
        options: [
          { name: '-f, --foo <foo>', choices: ['bar', 'baz'] },
        ],
      })
    `)
    await expect(execaCommand('./cli.js --foo xyz')).rejects.toThrow(
      "error: option '-f, --foo <foo>' argument 'xyz' is invalid. Allowed choices are bar, baz.",
    )
  },
  options: async () => {
    await outputCliFile(endent`
      self({
        options: [
          { name: '--value <value>' },
        ],
        action: options => console.log(options.value),
      })
    `)
    expect(
      execaCommand('./cli.js --value foo') |> await |> property('stdout'),
    ).toEqual('foo')
  },
  'options: object': async () => {
    await outputCliFile(endent`
      await self({
        options: {
          '-y, --yes': { description: 'foo bar' },
        },
      })
    `)
    expect(execaCommand('./cli.js --help') |> await |> property('stdout'))
      .toEqual(endent`
        Usage: cli [options]

        Options:
          -y, --yes   foo bar
          -h, --help  display help for command
      `)
  },
  'unknown option': async () => {
    await outputCliFile(endent`
      self({
        allowUnknownOption: true,
        action: (options, command) => console.log(command.args),
      })
    `)
    expect(
      execaCommand('./cli.js --foo') |> await |> property('stdout'),
    ).toEqual("[ '--foo' ]")
  },
  version: async () => {
    await outputCliFile("self({ version: '0.1.0' })")
    expect(
      execaCommand('./cli.js --version') |> await |> property('stdout'),
    ).toEqual('0.1.0')
  },
}
