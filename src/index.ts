import defu from '@dword-design/defu';
import {
  Command as CommanderCommand,
  Option as CommanderOption,
} from 'commander';
import { compact } from 'lodash-es';
import pIsPromise from 'p-is-promise';

export type HandlerInput = (...args: unknown[]) => unknown;

export type Handler = (...args: unknown[]) => void | Promise<void>;

export type Option = {
  name: string;
  description?: string;
  defaultValue?: unknown;
  choices?: string[];
};

export type Command = {
  name: string;
  arguments?: string;
  description?: string;
  handler: Handler;
  options: Option[];
};

export type Config = {
  version?: string;
  name?: string;
  commands: Command[];
  options: Option[];
  arguments?: string;
  usage?: string;
  allowUnknownOption: boolean;
  action?: Handler;
  defaultCommandName?: string;
};

export type CommandObjectInput = Omit<Command, 'options' | 'handler'> & {
  options?: OptionsInput;
  handler: HandlerInput;
};

export type CommandObjectInObjectInput = Omit<CommandObjectInput, 'name'> &
  Partial<Pick<CommandObjectInput, 'name'>>;

export type CommandInObjectInput = CommandObjectInObjectInput | HandlerInput;

export type CommandsInput =
  | CommandObjectInput[]
  | Record<string, CommandInObjectInput>;

export type OptionInObjectInput = Omit<Option, 'name'> &
  Partial<Pick<Option, 'name'>>;

export type OptionsInput = Option[] | Record<string, OptionInObjectInput>;
type ConfigInput = Omit<Partial<Config>, 'commands' | 'options' | 'action'> & {
  commands?: CommandsInput;
  options?: OptionsInput;
  action?: HandlerInput;
};

const applyOptions = (program, options: Option[] = []) => {
  for (const option of options) {
    const commanderOption = new CommanderOption(
      option.name,
      option.description,
    );

    commanderOption.default(option.defaultValue);

    if (option.choices) {
      commanderOption.choices(option.choices);
    }

    program.addOption(commanderOption);
  }
};

const getNormalizedOptions = (options?: OptionsInput): Option[] => {
  if (options === undefined) {
    return [];
  }

  if (Array.isArray(options)) {
    return options;
  }

  return Object.entries(options).map(([name, option]) =>
    defu(option, { name }),
  );
};

const getNormalizedCommands = (commands?: CommandsInput): Command[] => {
  if (commands === undefined) {
    return [];
  }

  if (Array.isArray(commands)) {
    return commands.map(command => ({
      ...command,
      handler: ignoreReturn(command.handler),
      options: getNormalizedOptions(command.options),
    }));
  }

  return Object.entries(commands).map(([name, command]) => ({
    name,
    ...(typeof command === 'function'
      ? { handler: ignoreReturn(command), options: [] }
      : {
          ...command,
          handler: ignoreReturn(command.handler),
          options: getNormalizedOptions(command.options),
        }),
  }));
};

const ignoreReturn =
  func =>
  (...args) => {
    const result = func(...args);

    if (pIsPromise(result)) {
      return Promise.resolve();
    }
  };

export default (configInput: ConfigInput = {}) => {
  const config: Config = defu(
    {
      ...configInput,
      commands: getNormalizedCommands(configInput.commands),
      options: getNormalizedOptions(configInput.options),
      ...(configInput.action && { action: ignoreReturn(configInput.action) }),
    },
    { allowUnknownOption: false },
  );

  const program = new CommanderCommand();

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
