<!--@h1([pkg.name])-->
# cli-mate
<!--/@-->

<!--@shields('npm', 'travis', 'coveralls')-->
[![npm version](https://img.shields.io/npm/v/cli-mate.svg)](https://www.npmjs.com/package/cli-mate) [![Build Status](https://img.shields.io/travis/dword-design/cli-mate/master.svg)](https://travis-ci.org/dword-design/cli-mate) [![Coverage Status](https://img.shields.io/coveralls/dword-design/cli-mate/master.svg)](https://coveralls.io/r/dword-design/cli-mate?branch=master)
<!--/@-->

<!--@pkg.description-->
Build command line tools declaratively with a configuration object and a single function call. Based on Commander.js
<!--/@-->

## Installation

```sh
# via NPM
npm install --save cli-mate

# via Yarn
yarn add cli-mate
```

## Usage

First the CLI has to be implemented:

```js
#!/usr/bin/env node

const cliMate = require('cli-mate')

cliMate({
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

cliMate({
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

<!--@license()-->
## License

MIT © Sebastian Landwehr
<!--/@-->
