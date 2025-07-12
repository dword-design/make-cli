import pathLib from 'node:path';

import { expect, test } from '@playwright/test';
import endent from 'endent';
import { execaCommand } from 'execa';
import fs from 'fs-extra';

test('action', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'cli.ts'),
    endent`
      import self from '../../src';

      self({ action: () => console.log('foo') });
    `,
  );

  const { stdout } = await execaCommand('tsx cli.ts', { cwd });
  expect(stdout).toEqual('foo');
});

test('arguments: mandatory', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'cli.ts'),
    endent`
      import self from '../../src';

      self({
        arguments: '<first> <second>',
        action: (first, second) => { console.log(first); console.log(second) },
      });
    `,
  );

  const { stdout } = await execaCommand('tsx cli.ts foo bar', { cwd });

  expect(stdout).toEqual(endent`
    foo
    bar
  `);
});

test('arguments: optional not set', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'cli.ts'),
    endent`
      import self from '../../src';

      self({
        arguments: '[arg]',
        action: arg => console.log(arg),
      });
    `,
  );

  const { stdout } = await execaCommand('tsx cli.ts', { cwd });
  expect(stdout).toEqual('undefined');
});

test('arguments: optional set', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'cli.ts'),
    endent`
      import self from '../../src';

      self({
        arguments: '[arg]',
        action: arg => console.log(arg),
      });
    `,
  );

  const { stdout } = await execaCommand('tsx cli.ts foo', { cwd });
  expect(stdout).toEqual('foo');
});

test('async error', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'cli.ts'),
    endent`
      import self from '../../src';

      try {
        await self({
          action: async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
            throw new Error('foo');
          },
        });
      } catch (error) {
        console.log(error.message);
        process.exit(1);
      }
    `,
  );

  await expect(execaCommand('tsx cli.ts', { cwd })).rejects.toThrow('foo');
});

test('commands: arguments', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'cli.ts'),
    endent`
      import self from '../../src';

      self({
        commands: [
          {
            name: 'build',
            arguments: '<arg>',
            handler: arg => console.log(arg)
          }
        ],
      });
    `,
  );

  const { stdout } = await execaCommand('tsx cli.ts build foo', { cwd });
  expect(stdout).toEqual('foo');
});

test('commands: default', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'cli.ts'),
    endent`
      import self from '../../src';

      self({
        commands: [
          {
            name: 'build',
            handler: () => console.log('foo'),
          }
        ],
        defaultCommandName: 'build',
      });
    `,
  );

  const { stdout } = await execaCommand('tsx cli.ts', { cwd });
  expect(stdout).toEqual('foo');
});

test('commands: object', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'cli.ts'),
    endent`
      import self from '../../src';

      await self({
        commands: {
          foo: { description: 'foo description' },
          bar: { description: 'bar description' },
        },
      });
    `,
  );

  const { stdout } = await execaCommand('tsx cli.ts --help', { cwd });

  expect(stdout).toEqual(endent`
    Usage: cli [options] [command]

    Options:
      -h, --help      display help for command

    Commands:
      foo             foo description
      bar             bar description
      help [command]  display help for command
  `);
});

test('commands: options', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'cli.ts'),
    endent`
      import self from '../../src';

      self({
        commands: [
          {
            name: 'build',
            options: [
              { name: '--value <value>' },
            ],
            handler: options => console.log(options.value),
          }
        ],
      });
    `,
  );

  const { stdout } = await execaCommand('tsx cli.ts build --value foo', {
    cwd,
  });

  expect(stdout).toEqual('foo');
});

test('commands: valid', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'cli.ts'),
    endent`
      import self from '../../src';

      self({
        commands: [
          {
            name: 'build',
            handler: () => console.log('foo'),
          }
        ],
      });
    `,
  );

  const { stdout } = await execaCommand('tsx cli.ts build', { cwd });
  expect(stdout).toEqual('foo');
});

test('help', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'cli.ts'),
    endent`
      import self from '../../src';

      self({
        version: '0.1.0',
        name: 'the name',
        usage: 'the usage',
        commands: [
          {
            name: 'build',
            description: 'Builds the app',
          },
        ],
      });
    `,
  );

  const { stdout } = await execaCommand('tsx cli.ts --help', { cwd });

  expect(stdout).toEqual(endent`
    Usage: the name the usage

    Options:
      -V, --version   output the version number
      -h, --help      display help for command

    Commands:
      build           Builds the app
      help [command]  display help for command
  `);
});

test('option choices', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'cli.ts'),
    endent`
      import self from '../../src';

      self({
        options: [
          { name: '-f, --foo <foo>', choices: ['bar', 'baz'] },
        ],
      });
    `,
  );

  await expect(execaCommand('tsx cli.ts --foo xyz', { cwd })).rejects.toThrow(
    "error: option '-f, --foo <foo>' argument 'xyz' is invalid. Allowed choices are bar, baz.",
  );
});

test('options', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'cli.ts'),
    endent`
      import self from '../../src';

      self({
        options: [
          { name: '--value <value>' },
        ],
        action: options => console.log(options.value),
      });
    `,
  );

  const { stdout } = await execaCommand('tsx cli.ts --value foo', { cwd });
  expect(stdout).toEqual('foo');
});

test('options: object', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'cli.ts'),
    endent`
      import self from '../../src';

      await self({
        options: {
          '-y, --yes': { description: 'foo bar' },
        },
      });
    `,
  );

  const { stdout } = await execaCommand('tsx cli.ts --help', { cwd });

  expect(stdout).toEqual(endent`
    Usage: cli [options]

    Options:
      -y, --yes   foo bar
      -h, --help  display help for command
  `);
});

test('unknown option', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'cli.ts'),
    endent`
      import self from '../../src';

      self({
        allowUnknownOption: true,
        action: (options, command) => console.log(command.args),
      });
    `,
  );

  const { stdout } = await execaCommand('tsx cli.ts --foo', { cwd });
  expect(stdout).toEqual("[ '--foo' ]");
});

test('version', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'cli.ts'),
    endent`
      import self from '../../src';

      self({ version: '0.1.0' });
    `,
  );

  const { stdout } = await execaCommand('tsx cli.ts --version', { cwd });
  expect(stdout).toEqual('0.1.0');
});
