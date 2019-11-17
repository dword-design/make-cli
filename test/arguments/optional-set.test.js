import { endent } from '@functions'
import runCli from '../run-cli'

export default () => runCli({
  optionsString: endent`{
    arguments: '[arg]',
    action: arg => console.log(arg),
  }`,
  arguments: ['foo'],
  check: 'foo\n',
})
