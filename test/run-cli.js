import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import { outputFile } from 'fs'
import { endent } from '@functions'
import { spawn } from 'child_process'
import { resolve } from 'path'

export default async ({ optionsString: _optionsString, arguments: args = [], check: _check }) => withLocalTmpDir(__dirname, async () => {

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
    const { stdout } = await spawn(resolve('cli.js'), args, { capture: ['stdout', 'stderr'] })

    await check(stdout)

  } catch (error) {
    if (error.stderr !== undefined) {
      console.error(error.stderr)
    }
    throw error
  }
})
