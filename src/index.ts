import { Command, Option } from 'commander';
import { compact } from 'lodash-es';

type Handler = (...args: unknown[]) => void | Promise<void>;

interface ConfigInput {
  version?: string;
  name?: string;
  commands?: Array<{ name: string, arguments?: string, description?: string, handler: Handler }>;
  options?: Array<{ name: string, description?: string, defaultValue?: string }>;
  arguments?: string;
  usage?: string;
  allowUnknownOption?: boolean;
  action?: Handler;
  defaultCommandName?: string;
};

const applyOptions = (program, options = []) => {
  if (!Array.isArray(options)) {
    options = Object.entries(options).map(([name, option]) => ({
      name,
      ...option,
    }));
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

export default (config: ConfigInput = {}) => {
  config = { commands: [], options: [], ...config };

  if (!Array.isArray(config.commands)) {
    config.commands = Object.entries(config.commands).map(
      ([name, command]) => ({ name, ...command }),
    );
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
      compact([command.name, command.arguments]).join(' '),
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
