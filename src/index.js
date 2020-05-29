import { compact, join } from '@dword-design/functions'

const applyOptions = (program, options = []) =>
  options.forEach(({ name, description, defaultValue }) =>
    program.option(name, description, defaultValue)
  )

export default ({
  version,
  name,
  usage,
  arguments: args,
  options,
  action,
  commands = [],
  defaultCommandName,
} = {}) => {
  const program = require('commander')

  if (version !== undefined) {
    program.version(version)
  }

  if (name !== undefined) {
    program.name(name)
  }

  if (usage !== undefined) {
    program.usage(usage)
  }

  if (args !== undefined) {
    program.arguments(args)
  }

  applyOptions(program, options)

  if (action !== undefined) {
    program.action(action)
  }

  commands.forEach(
    ({
      name: commandName,
      arguments: commandArgs,
      description,
      options: commandOptions,
      handler,
    }) =>
      applyOptions(
        program
          .command([commandName, commandArgs] |> compact |> join(' '))
          .description(description)
          .action(handler),
        commandOptions
      )
  )

  if (defaultCommandName !== undefined && process.argv.length <= 2) {
    return commands
      .find(command => command.name === defaultCommandName)
      .handler()
  }
  if (commands.length > 0) {
    program.on('command:*', () => program.help())
  }

  return program.parse(process.argv)
}
