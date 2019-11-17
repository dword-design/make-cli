import { endent } from '@functions'
import expect from 'expect'
import { exists } from 'fs'
import runCli from '../run-cli'

export default () => runCli({
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
})
