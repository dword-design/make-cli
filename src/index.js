import { compact, join, mapValues, values } from '@dword-design/functions';
import { Command, Option } from 'commander';

const applyOptions = (program, options = []) => {
  if (!Array.isArray(options)) {
    options =
      options |> mapValues((option, name) => ({ name, ...option })) |> values;
  }

  for (const option of options) {
    const commanderOptions = new Option(
      option.name,
      option.description,
      option.defaultValue,
    );

    if (option.choices) {
      commanderOptions.choices(option.choices);
    }

    program.addOption(commanderOptions);
  }
};

export default (config = {}) => {
  config = { commands: [], options: [], ...config };

  if (!Array.isArray(config.commands)) {
    config.commands =
      config.commands
      |> mapValues((command, name) => ({ name, ...command }))
      |> values;
  }

  const program = new Command();

  if (config.version) {
    program.version(config.version);
  }

  if (config.name) {
    program.name(config.name);
  }

  if (config.usage) {
    program.usage(config.usage);
  }

  if (config.arguments) {
    program.arguments(config.arguments);
  }

  if (config.allowUnknownOption) {
    program.allowUnknownOption();
  }

  applyOptions(program, config.options);

  if (config.action) {
    program.action(config.action);
  }

  for (const command of config.commands) {
    const cmd = program.command(
      [command.name, command.arguments] |> compact |> join(' '),
    );

    cmd.description(command.description);
    cmd.action(command.handler);
    applyOptions(cmd, command.options);
  }

  if (config.defaultCommandName && process.argv.length <= 2) {
    return config.commands
      .find(command => command.name === config.defaultCommandName)
      .handler();
  }

  if (config.commands.length > 0) {
    program.on('command:*', () => program.help());
  }

  return program.parseAsync(process.argv);
};
