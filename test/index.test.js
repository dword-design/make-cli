const cliMate = require('this')
const { spawn } = require('child-process-promise')
const { writeFile, exists } = require('fs-extra')
const endent = require('endent')
const withLocalTmpDir = require('with-local-tmp-dir')
const { join } = require('path')

const runCli = async ({ optionsString: _optionsString, arguments: args = [], check: _check }) => withLocalTmpDir(async path => {

  const optionsString = typeof _optionsString === 'function' ? _optionsString : () => _optionsString
  const check = typeof _check === 'function' ? _check : ({ stdout }) => expect(stdout).toEqual(_check)

  await writeFile(
    join(path, 'cli.js'),
    endent`
      #!/usr/bin/env node

      const cliMate = require('this')
      const { writeFile } = require('fs-extra')
      const { join } = require('path')

      cliMate(${optionsString(path)})
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

test('action', async () => runCli({
  optionsString: "{ action: () => console.log('foo') }",
  check: 'foo\n',
}))

describe('arguments', () => {

  test('mandatory', async () => runCli({
    optionsString: endent`{
      arguments: '<first> <second>',
      action: (first, second) => { console.log(first); console.log(second) },
    }`,
    arguments: ['foo', 'bar'],
    check: 'foo\nbar\n',
  }))

  test('optional set', async () => runCli({
    optionsString: endent`{
      arguments: '[arg]',
      action: arg => console.log(arg),
    }`,
    arguments: ['foo'],
    check: 'foo\n',
  }))

  test('optional not set', async () => runCli({
    optionsString: endent`{
      arguments: '[arg]',
      action: arg => console.log(arg),
    }`,
    check: 'undefined\n',
  }))
})

test('options', async () => runCli({
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

  test('command', async () => runCli({
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

  test('arguments', async () => runCli({
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

  test('options', async () => runCli({
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

  test('default command', async () => runCli({
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

test('help', async () => runCli({
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

test('version', async () => runCli({
  optionsString: "{ version: '0.1.0' }",
  arguments: ['--version'],
  check: '0.1.0\n',
}))
