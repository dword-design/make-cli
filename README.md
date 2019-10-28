<!--@h1([pkg.name])-->
# make-cli
<!--/@-->

<!--@shields('npm', 'travis', 'coveralls', 'deps')-->
[![npm version](https://img.shields.io/npm/v/make-cli.svg)](https://www.npmjs.com/package/make-cli) [![Build Status](https://img.shields.io/travis/dword-design/make-cli/master.svg)](https://travis-ci.org/dword-design/make-cli) [![Coverage Status](https://img.shields.io/coveralls/dword-design/make-cli/master.svg)](https://coveralls.io/r/dword-design/make-cli?branch=master) [![dependency status](https://img.shields.io/david/dword-design/make-cli.svg)](https://david-dm.org/dword-design/make-cli)
<!--/@-->

<!--@pkg.description-->
Build command line tools declaratively with a configuration object and a single function call. Based on Commander.js
<!--/@-->

## Installation

```sh
# via NPM
npm install --save make-cli

# via Yarn
yarn add make-cli
```

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

<!--@license()-->
## License

MIT © Sebastian Landwehr
<!--/@-->
