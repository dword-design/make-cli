const { forIn, reduce, find } = require('lodash')

module.exports = ({ commands = [], defaultCommandName } = {}) => {

  const program = require('commander')

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
    program.on('command:*', () => program.help())

    return program.parse(process.argv)
  }
}
