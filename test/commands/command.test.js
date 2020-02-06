import { endent } from '@dword-design/functions'
import { exists } from 'fs-extra'
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
