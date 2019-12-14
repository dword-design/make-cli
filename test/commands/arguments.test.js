import { endent } from '@dword-design/functions'
import expect from 'expect'
import { exists } from 'fs-extra'
import runCli from '../run-cli'

export default () => runCli({
  optionsString: () => {
    const outputFileExpression = 'outputFile(`${arg}.txt`, \'\')'
    return endent`{
      commands: [
        {
          name: 'build',
          arguments: '<arg>',
          handler: arg => ${outputFileExpression},
        }
      ],
    }`
  },
  arguments: ['build', 'foo'],
  check: async () => expect(await exists('foo.txt')).toBeTruthy(),
})
