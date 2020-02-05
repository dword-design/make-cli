const applyOptions = (program, options = []) => options.forEach(({ name, description, defaultValue }) => program.option(name, description, defaultValue))

export default ({ version, name, usage, arguments: args, options, action, commands = [], defaultCommandName } = {}) => {

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
    ({ name, arguments: args, description, options, handler }) => applyOptions(
      program
        .command(`${name}${args !== '' ? ` ${args}` : ''}`)
        .description(description)
        .action(handler),
      options,
    ),
  )

  if (defaultCommandName !== undefined && process.argv.length <= 2) {
    return commands.find(({ name }) => name === defaultCommandName).handler()
  } else {
    if (commands.length > 0) {
      program.on('command:*', () => program.help())
    }

    return program.parse(process.argv)
  }
}
