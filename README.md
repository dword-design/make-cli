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
        height="32"
      >
    </a><a href="https://www.buymeacoffee.com/dword">
      <img
        src="https://www.buymeacoffee.com/assets/img/guidelines/download-assets-sm-2.svg"
        alt="Buy Me a Coffee"
        height="32"
      >
    </a><a href="https://paypal.me/SebastianLandwehr">
      <img
        src="https://sebastianlandwehr.com/images/paypal.svg"
        alt="PayPal"
        height="32"
      >
    </a><a href="https://www.patreon.com/dworddesign">
      <img
        src="https://sebastianlandwehr.com/images/patreon.svg"
        alt="Patreon"
        height="32"
      >
    </a>
</p>
<!-- /BADGES -->

<!-- DESCRIPTION/ -->
Build command line tools declaratively with a configuration object and a single function call. Based on Commander.js.
<!-- /DESCRIPTION -->

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

First the CLI has to be implemented:

```js
#!/usr/bin/env node

const makeCli = require('make-cli')

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

// It is also possible to define sub-commands

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
      action: (remote, options) => { /* push the stuff */ },
    },
    {
      name: 'pull',
      // ...
    },
  ],
})
```

Then it can be called like so:

```bash
$ my-cli push origin --yes
$ my-cli pull origin
$ my-cli --help
$ my-cli --version
```

You can also allow to pass unknown options and those are then available in the action like so:

```js
#!/usr/bin/env node

const makeCli = require('make-cli')

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

If you now run `my-cli --yes --foo`, `command.args` will contain `['--foo']`.

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
      height="32"
    >
  </a>&nbsp;If you want to send me a one time donation. The coffee is pretty good 😊.<br/>
  <a href="https://paypal.me/SebastianLandwehr">
    <img
      src="https://sebastianlandwehr.com/images/paypal.svg"
      alt="PayPal"
      height="32"
    >
  </a>&nbsp;Also for one time donations if you like PayPal.<br/>
  <a href="https://www.patreon.com/dworddesign">
    <img
      src="https://sebastianlandwehr.com/images/patreon.svg"
      alt="Patreon"
      height="32"
    >
  </a>&nbsp;Here you can support me regularly, which is great so I can steadily work on projects.
</p>

Thanks a lot for your support! ❤️

## License

[MIT License](https://opensource.org/licenses/MIT) © [Sebastian Landwehr](https://sebastianlandwehr.com)
<!-- /LICENSE -->
