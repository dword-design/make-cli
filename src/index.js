const { forIn, reduce, find } = require('lodash')

module.exports = ({ args, action, commands = [], defaultCommandName } = {}) => {

  const program = require('commander')

  if (args !== undefined) {
    program.arguments(args)
  }
  if (action !== undefined) {
    program.action(action)
  }

  forIn(
    commands,
    ({ name, description, options, handler }) => reduce(
      options,
      (command, { name, description, defaultValue }) => command.option(name, description, defaultValue),
      program
        .command(name)
        .description(description)
        .action(handler),
    )
  )

  if (defaultCommandName !== undefined && process.argv.length <= 2) {
    return find(commands, { name: defaultCommandName }).handler()
  } else {
    if (commands.length > 0) {
      program.on('command:*', () => program.help())
    }

    return program.parse(process.argv)
  }
}
