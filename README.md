<!-- TITLE/ -->

<h1>make-cli</h1>

<!-- /TITLE -->


<!-- BADGES/ -->

<span class="badge-npmversion"><a href="https://npmjs.org/package/make-cli" title="View this project on NPM"><img src="https://img.shields.io/npm/v/make-cli.svg" alt="NPM version" /></a></span>
<span class="badge-travisci"><a href="http://travis-ci.org/dword-design/make-cli" title="Check this project's build status on TravisCI"><img src="https://img.shields.io/travis/dword-design/make-cli/master.svg" alt="Travis CI Build Status" /></a></span>
<span class="badge-coveralls"><a href="https://coveralls.io/r/dword-design/make-cli" title="View this project's coverage on Coveralls"><img src="https://img.shields.io/coveralls/dword-design/make-cli.svg" alt="Coveralls Coverage Status" /></a></span>
<span class="badge-daviddm"><a href="https://david-dm.org/dword-design/make-cli" title="View the status of this project's dependencies on DavidDM"><img src="https://img.shields.io/david/dword-design/make-cli.svg" alt="Dependency Status" /></a></span>
<span class="badge-shields"><a href="https://img.shields.io/badge/renovate-enabled-brightgreen.svg"><img src="https://img.shields.io/badge/renovate-enabled-brightgreen.svg" /></a></span>

<!-- /BADGES -->


<!-- DESCRIPTION/ -->

Build command line tools declaratively with a configuration object and a single function call. Based on Commander.js

<!-- /DESCRIPTION -->


<!-- INSTALL/ -->

<h2>Install</h2>

<a href="https://npmjs.com" title="npm is a package manager for javascript"><h3>npm</h3></a>
<ul>
<li>Install: <code>npm install --save make-cli</code></li>
<li>Import: <code>import * as pkg from ('make-cli')</code></li>
<li>Require: <code>const pkg = require('make-cli')</code></li>
</ul>

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

<h2>License</h2>

Unless stated otherwise all works are:

<ul><li>Copyright &copy; Sebastian Landwehr</li></ul>

and licensed under:

<ul><li><a href="http://spdx.org/licenses/MIT.html">MIT License</a></li></ul>

<!-- /LICENSE -->
