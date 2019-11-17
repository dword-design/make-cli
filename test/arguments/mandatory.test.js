import { endent } from '@functions'
import runCli from '../run-cli'

export default () => runCli({
  optionsString: endent`{
    arguments: '<first> <second>',
    action: (first, second) => { console.log(first); console.log(second) },
  }`,
  arguments: ['foo', 'bar'],
  check: 'foo\nbar\n',
})
