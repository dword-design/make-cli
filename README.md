<!-- TITLE/ -->
# make-cli
<!-- /TITLE -->

<!-- BADGES/ -->
[![NPM version](https://img.shields.io/npm/v/make-cli.svg)](https://npmjs.org/package/make-cli)
![Linux macOS Windows compatible](https://img.shields.io/badge/os-linux%20%7C%C2%A0macos%20%7C%C2%A0windows-blue)
[![Build status](https://img.shields.io/github/workflow/status/dword-design/make-cli/build)](https://github.com/dword-design/make-cli/actions)
[![Coverage status](https://img.shields.io/coveralls/dword-design/make-cli)](https://coveralls.io/github/dword-design/make-cli)
[![Dependency status](https://img.shields.io/david/dword-design/make-cli)](https://david-dm.org/dword-design/make-cli)
![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen)

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/dword-design/make-cli)
<!-- /BADGES -->

<!-- DESCRIPTION/ -->
Build command line tools declaratively with a configuration object and a single function call. Based on Commander.js
<!-- /DESCRIPTION -->

<!-- INSTALL/ -->
## Install

```bash
# NPM
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
    },
  ],
  action: (remote, extra, { value }) => { /* Do stuff with the parameters */ },
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
      action: (remote, { yes }) => { /* push the stuff */ },
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

For more information see the [Commander.js](https://www.npmjs.com/package/commander) website.

<!-- LICENSE/ -->
## License

Unless stated otherwise all works are:

Copyright &copy; Sebastian Landwehr <info@dword-design.de>

and licensed under:

[MIT License](https://opensource.org/licenses/MIT)
<!-- /LICENSE -->
