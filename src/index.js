import { compact, join } from '@dword-design/functions'

const applyOptions = (program, options = []) =>
  options.forEach(option =>
    program.option(option.name, option.description, option.defaultValue)
  )

export default (config = {}) => {
  config = { commands: [], options: [], ...config }
  const program = require('commander')
  if (config.version) {
    program.version(config.version)
  }
  if (config.name) {
    program.name(config.name)
  }
  if (config.usage) {
    program.usage(config.usage)
  }
  if (config.arguments) {
    program.arguments(config.arguments)
  }
  applyOptions(program, config.options)
  if (config.action) {
    program.action(config.action)
  }
  config.commands.forEach(command => {
    const cmd = program.command(
      [command.name, command.arguments] |> compact |> join(' ')
    )
    cmd.description(command.description)
    cmd.action(command.handler)
    applyOptions(cmd, command.options)
  })
  if (config.defaultCommandName && process.argv.length <= 2) {
    return config.commands
      .find(command => command.name === config.defaultCommandName)
      .handler()
  }
  if (config.commands.length > 0) {
    program.on('command:*', () => program.help())
  }
  return program.parse(process.argv)
}
