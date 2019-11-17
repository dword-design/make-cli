import runCli from './run-cli'

export default () => runCli({
  optionsString: '{ action: () => console.log(\'foo\') }',
  check: 'foo\n',
})
