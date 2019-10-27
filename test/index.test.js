import { spawn } from 'child-process-promise'
import { writeFile, exists } from 'fs-extra'
import { endent } from '@functions'
import withLocalTmpDir from 'with-local-tmp-dir'
import { join } from 'path'

const runCli = async ({ optionsString: _optionsString, arguments: args = [], check: _check }) => withLocalTmpDir(async path => {

  const optionsString = typeof _optionsString === 'function' ? _optionsString : () => _optionsString
  const check = typeof _check === 'function' ? _check : ({ stdout }) => expect(stdout).toEqual(_check)

  await writeFile(
    join(path, 'cli.js'),
    endent`
      #!/usr/bin/env node

      const makeCli = require('make-cli')
      const { writeFile } = require('fs-extra')
      const { join } = require('path')

      makeCli(${optionsString(path)})
    `,
    { mode: '755' },
  )

  try {
    const { stdout } = await spawn(join(path, 'cli.js'), args, { capture: ['stdout', 'stderr'] })

    await check({ path, stdout })

  } catch (error) {
    if (error.stderr !== undefined) {
      console.error(error.stderr)
    }
    throw error
  }
})

describe('index', () => {

  it('action', async () => runCli({
    optionsString: '{ action: () => console.log(\'foo\') }',
    check: 'foo\n',
  }))

  describe('arguments', () => {

    it('mandatory', async () => runCli({
      optionsString: endent`{
        arguments: '<first> <second>',
        action: (first, second) => { console.log(first); console.log(second) },
      }`,
      arguments: ['foo', 'bar'],
      check: 'foo\nbar\n',
    }))

    it('optional set', async () => runCli({
      optionsString: endent`{
        arguments: '[arg]',
        action: arg => console.log(arg),
      }`,
      arguments: ['foo'],
      check: 'foo\n',
    }))

    it('optional not set', async () => runCli({
      optionsString: endent`{
        arguments: '[arg]',
        action: arg => console.log(arg),
      }`,
      check: 'undefined\n',
    }))
  })

  it('options', async () => runCli({
    optionsString: path => {
      const writeFileExpression = `writeFile(join('${path}', \`\${value}.txt\`), '')`
      return endent`{
        options: [
          { name: '--value <value>' },
        ],
        action: ({ value }) => ${writeFileExpression},
      }`
    },
    arguments: ['--value', 'foo'],
    check: async ({ path }) => expect(await exists(join(path, 'foo.txt'))).toBeTruthy(),
  }))

  describe('commands', () => {

    it('command', async () => runCli({
      optionsString: path => endent`{
        commands: [
          {
            name: 'build',
            handler: () => writeFile(join('${path}', 'foo.txt'), ''),
          }
        ],
      }`,
      arguments: ['build'],
      check: async ({ path }) => expect(await exists(join(path, 'foo.txt'))).toBeTruthy(),
    }))

    it('arguments', async () => runCli({
      optionsString: path => {
        const writeFileExpression = `writeFile(join('${path}', \`\${arg}.txt\`), '')`
        return endent`{
          commands: [
            {
              name: 'build',
              arguments: '<arg>',
              handler: arg => ${writeFileExpression},
            }
          ],
        }`
      },
      arguments: ['build', 'foo'],
      check: async ({ path }) => expect(await exists(join(path, 'foo.txt'))).toBeTruthy(),
    }))

    it('options', async () => runCli({
      optionsString: path => {
        const writeFileExpression = `writeFile(join('${path}', \`\${value}.txt\`), '')`
        return endent`{
          commands: [
            {
              name: 'build',
              options: [
                { name: '--value <value>' },
              ],
              handler: ({ value }) => ${writeFileExpression},
            }
          ],
        }`
      },
      arguments: ['build', '--value', 'foo'],
      check: async ({ path }) => expect(await exists(join(path, 'foo.txt'))).toBeTruthy(),
    }))

    it('default command', async () => runCli({
      optionsString: endent`{
        commands: [
          {
            name: 'build',
            handler: () => console.log('foo'),
          }
        ],
        defaultCommandName: 'build',
      }`,
      check: 'foo\n',
    }))
  })

  it('help', async () => runCli({
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
    check: 'Usage: the name the usage\n\nOptions:\n  -V, --version  output the version number\n  -h, --help     output usage information\n\nCommands:\n  build          Builds the app\n',
  }))

  it('version', async () => runCli({
    optionsString: '{ version: \'0.1.0\' }',
    arguments: ['--version'],
    check: '0.1.0\n',
  }))
})
