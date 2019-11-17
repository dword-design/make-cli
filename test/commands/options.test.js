import { endent } from '@functions'
import expect from 'expect'
import { exists } from 'fs'
import runCli from '../run-cli'

export default () => runCli({
  optionsString: () => {
    const outputFileExpression = 'outputFile(`${value}.txt`, \'\')'
    return endent`{
      commands: [
        {
          name: 'build',
          options: [
            { name: '--value <value>' },
          ],
          handler: ({ value }) => ${outputFileExpression},
        }
      ],
    }`
  },
  arguments: ['build', '--value', 'foo'],
  check: async () => expect(await exists('foo.txt')).toBeTruthy(),
})
