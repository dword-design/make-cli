import runCli from './run-cli'

export default () => runCli({
  optionsString: '{ version: \'0.1.0\' }',
  arguments: ['--version'],
  check: '0.1.0\n',
})
