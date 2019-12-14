import { endent } from '@dword-design/functions'
import runCli from '../run-cli'

export default () => runCli({
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
})
