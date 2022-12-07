oclif-hello-world
=================

oclif example Hello World CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![CircleCI](https://circleci.com/gh/oclif/hello-world/tree/main.svg?style=shield)](https://circleci.com/gh/oclif/hello-world/tree/main)
[![Downloads/week](https://img.shields.io/npm/dw/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![License](https://img.shields.io/npm/l/oclif-hello-world.svg)](https://github.com/oclif/hello-world/blob/main/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g linkandtink
$ linktink COMMAND
running command...
$ linktink (--version)
linkandtink/0.0.0 darwin-arm64 node-v16.17.0
$ linktink --help [COMMAND]
USAGE
  $ linktink COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`linktink hello PERSON`](#linktink-hello-person)
* [`linktink hello world`](#linktink-hello-world)
* [`linktink help [COMMAND]`](#linktink-help-command)
* [`linktink plugins`](#linktink-plugins)
* [`linktink plugins:install PLUGIN...`](#linktink-pluginsinstall-plugin)
* [`linktink plugins:inspect PLUGIN...`](#linktink-pluginsinspect-plugin)
* [`linktink plugins:install PLUGIN...`](#linktink-pluginsinstall-plugin-1)
* [`linktink plugins:link PLUGIN`](#linktink-pluginslink-plugin)
* [`linktink plugins:uninstall PLUGIN...`](#linktink-pluginsuninstall-plugin)
* [`linktink plugins:uninstall PLUGIN...`](#linktink-pluginsuninstall-plugin-1)
* [`linktink plugins:uninstall PLUGIN...`](#linktink-pluginsuninstall-plugin-2)
* [`linktink plugins update`](#linktink-plugins-update)

## `linktink hello PERSON`

Say hello

```
USAGE
  $ linktink hello [PERSON] -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ oex hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [dist/commands/hello/index.ts](https://github.com/chetzof/linktink/blob/v0.0.0/dist/commands/hello/index.ts)_

## `linktink hello world`

Say hello world

```
USAGE
  $ linktink hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ linktink hello world
  hello world! (./src/commands/hello/world.ts)
```

## `linktink help [COMMAND]`

Display help for linktink.

```
USAGE
  $ linktink help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for linktink.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.19/src/commands/help.ts)_

## `linktink plugins`

List installed plugins.

```
USAGE
  $ linktink plugins [--core]

FLAGS
  --core  Show core plugins.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ linktink plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.1.7/src/commands/plugins/index.ts)_

## `linktink plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ linktink plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ linktink plugins add

EXAMPLES
  $ linktink plugins:install myplugin 

  $ linktink plugins:install https://github.com/someuser/someplugin

  $ linktink plugins:install someuser/someplugin
```

## `linktink plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ linktink plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ linktink plugins:inspect myplugin
```

## `linktink plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ linktink plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ linktink plugins add

EXAMPLES
  $ linktink plugins:install myplugin 

  $ linktink plugins:install https://github.com/someuser/someplugin

  $ linktink plugins:install someuser/someplugin
```

## `linktink plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ linktink plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ linktink plugins:link myplugin
```

## `linktink plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ linktink plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ linktink plugins unlink
  $ linktink plugins remove
```

## `linktink plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ linktink plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ linktink plugins unlink
  $ linktink plugins remove
```

## `linktink plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ linktink plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ linktink plugins unlink
  $ linktink plugins remove
```

## `linktink plugins update`

Update installed plugins.

```
USAGE
  $ linktink plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```
<!-- commandsstop -->
