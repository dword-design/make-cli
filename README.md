<!-- TITLE/ -->
# make-cli
<!-- /TITLE -->

<!-- BADGES/ -->
  <p>
    <a href="https://npmjs.org/package/make-cli">
      <img
        src="https://img.shields.io/npm/v/make-cli.svg"
        alt="npm version"
      >
    </a><img src="https://img.shields.io/badge/os-linux%20%7C%C2%A0macos%20%7C%C2%A0windows-blue" alt="Linux macOS Windows compatible"><a href="https://github.com/dword-design/make-cli/actions">
      <img
        src="https://github.com/dword-design/make-cli/workflows/build/badge.svg"
        alt="Build status"
      >
    </a><a href="https://codecov.io/gh/dword-design/make-cli">
      <img
        src="https://codecov.io/gh/dword-design/make-cli/branch/master/graph/badge.svg"
        alt="Coverage status"
      >
    </a><a href="https://david-dm.org/dword-design/make-cli">
      <img src="https://img.shields.io/david/dword-design/make-cli" alt="Dependency status">
    </a><img src="https://img.shields.io/badge/renovate-enabled-brightgreen" alt="Renovate enabled"><br/><a href="https://gitpod.io/#https://github.com/dword-design/make-cli">
      <img
        src="https://gitpod.io/button/open-in-gitpod.svg"
        alt="Open in Gitpod"
        width="114"
      >
    </a><a href="https://www.buymeacoffee.com/dword">
      <img
        src="https://www.buymeacoffee.com/assets/img/guidelines/download-assets-sm-2.svg"
        alt="Buy Me a Coffee"
        width="114"
      >
    </a><a href="https://paypal.me/SebastianLandwehr">
      <img
        src="https://sebastianlandwehr.com/images/paypal.svg"
        alt="PayPal"
        width="163"
      >
    </a><a href="https://www.patreon.com/dworddesign">
      <img
        src="https://sebastianlandwehr.com/images/patreon.svg"
        alt="Patreon"
        width="163"
      >
    </a>
</p>
<!-- /BADGES -->

<!-- DESCRIPTION/ -->
Super easy declarative CLI framework with a single configuration object and a single function call.
<!-- /DESCRIPTION -->

There are so many command line interface libraries around that it's hard to find the right one for your needs. But there aren't many that expose a single function with a single config object like most other Node.js packages do. That's why there is `make-cli`! Call a single function, pass a single config object and you're good to go.

Based on [Commander.js](https://github.com/tj/commander.js) and supports most of its features. In case you're missing something, feel free to open up an [issue](https://github.com/dword-design/make-cli/issues).

<!-- INSTALL/ -->
## Install

```bash
# npm
$ npm install make-cli

# Yarn
$ yarn add make-cli
```
<!-- /INSTALL -->

## Usage

Create a `.js` file with Shebang and import `make-cli`. Then configure your command line tool like so:

```js
// cli.js

#!/usr/bin/env node

import makeCli from 'make-cli'

makeCli({
  version: '0.1.0',
  name: 'my-cli',
  usage: 'Usage description here',
  arguments: '<remote> [extra]',
  options: [
    {
      name: '-y, --yes',
      description: 'Skip questions',
    },
    {
      name: '--value <value>',
      description: 'Specifies the value',
      defaultValue: 'foo',
      choices: ['foo', 'bar'],
    },
  ],
  action: (remote, extra, options) => {
    // options.value and options.yes
    // contain the options.
  },
})
```

Give it execution rights via `chmod +x cli.js`.

Then you can call it via the shell of your choice:

```bash
$ ./cli.js --yes
$ ./cli.js foo
$ ./cli.js --help
$ ./cli.js --version
```

When publishing your command line tool via NPM, you'll probably want to add the file to the [bin](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#bin) property, so it's installed to `node_modules/.bin`.

```json
{
  "name": "my-cli",
  "bin": "./cli.js"
}
```

### Subcommands

It is possible to define subcommands like so:

```js
makeCli({
  commands: [
    {
      name: 'push',
      description: 'Pushes to the repo',
      arguments: '<remote>',
      options: [
        {
          name: '-y, --yes',
        },
      ],
      handler: (remote, options) => { /* push the stuff */ },
    },
    {
      name: 'pull',
      // ...
    },
  ],
})
```

Then you can call it:

```bash
$ ./cli.js push origin
```

### Declaring options and commands as objects

Instead of an array you can declare options and commands as objects, which is sometimes more convenient:

```js
makeCli({
  options: [
    '-y, --yes': { description: 'Skip questions' },
    '--value <value>': {
      description: 'Specifies the value',
      defaultValue: 'foo',
      choices: ['foo', 'bar'],
    },
  ],
  commands: {
    push: {
      description: 'Pushes to the repo',
      arguments: '<remote>',
      options: [
        {
          name: '-y, --yes',
        },
      ],
      handler: (remote, options) => { /* ... */ },
    },
    pull: () => { /* ... */ },
  }
})
```

### Unknown options

You can also allow to pass unknown options, which are then available in the action like so:

```js
#!/usr/bin/env node

import makeCli from 'make-cli'

makeCli({
  // ...
  allowUnknownOption: true,
  options: [
    {
      name: '-y, --yes',
      description: 'Skip questions',
    },
  ],
  action: (options, command) => {
    // options.yes = true
    // command.args = ['--foo']
  },
})
```

If you now run `$ ./cli.js --yes --foo`, `command.args` will contain `['--foo']`.

<!-- LICENSE/ -->
## Contribute

Are you missing something or want to contribute? Feel free to file an [issue](https://github.com/dword-design/make-cli/issues) or a [pull request](https://github.com/dword-design/make-cli/pulls)! ⚙️

## Support

Hey, I am Sebastian Landwehr, a freelance web developer, and I love developing web apps and open source packages. If you want to support me so that I can keep packages up to date and build more helpful tools, you can donate here:

<p>
  <a href="https://www.buymeacoffee.com/dword">
    <img
      src="https://www.buymeacoffee.com/assets/img/guidelines/download-assets-sm-2.svg"
      alt="Buy Me a Coffee"
      width="114"
    >
  </a>&nbsp;If you want to send me a one time donation. The coffee is pretty good 😊.<br/>
  <a href="https://paypal.me/SebastianLandwehr">
    <img
      src="https://sebastianlandwehr.com/images/paypal.svg"
      alt="PayPal"
      width="163"
    >
  </a>&nbsp;Also for one time donations if you like PayPal.<br/>
  <a href="https://www.patreon.com/dworddesign">
    <img
      src="https://sebastianlandwehr.com/images/patreon.svg"
      alt="Patreon"
      width="163"
    >
  </a>&nbsp;Here you can support me regularly, which is great so I can steadily work on projects.
</p>

Thanks a lot for your support! ❤️

## License

[MIT License](https://opensource.org/license/mit/) © [Sebastian Landwehr](https://sebastianlandwehr.com)
<!-- /LICENSE -->
