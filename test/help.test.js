import { endent } from '@functions'
import runCli from './run-cli'

export default () => runCli({
  optionsString: endent`{
    version: '0.1.0',
    name: 'the name',
    usage: 'the usage',
    commands: [
      {
        name: 'build',
        description: 'Builds the app',
      },
    ],
  }`,
  arguments: ['--help'],
  check: 'Usage: the name the usage\n\nOptions:\n  -V, --version  output the version number\n  -h, --help     output usage information\n\nCommands:\n  build          Builds the app\n',
})
