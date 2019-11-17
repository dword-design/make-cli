import { endent } from '@functions'
import expect from 'expect'
import { exists } from 'fs'
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
