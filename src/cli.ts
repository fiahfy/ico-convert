#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import meow from 'meow'
import { convert } from '.'

const main = async (): Promise<void> => {
  const cli = meow(
    `
	Usage: ico-convert [options] <source> [target]

	Options:
    -v, --version  output the version number
    -h, --help     output usage information

	Examples:
    $ ico-convert icon.png
    $ ico-convert icon.png icon.ico
    $ ico-convert icons/
    $ ico-convert icons/ icon.ico
`,
    {
      flags: {
        help: {
          type: 'boolean',
          alias: 'h',
        },
        version: {
          type: 'boolean',
          alias: 'v',
        },
      },
    }
  )

  if (cli.flags.version) {
    return cli.showVersion()
  }
  if (cli.flags.help) {
    return cli.showHelp()
  }

  const source = cli.input[0]
  let target = cli.input[1]

  if (!source) {
    return cli.showHelp()
  }

  if (!target) {
    const parsed = path.parse(source)
    delete parsed.base
    parsed.ext = '.ico'
    target = path.format(parsed)
  }

  const stat = fs.statSync(source)
  let buf
  if (stat.isDirectory()) {
    buf = fs.readdirSync(source).map((filename) => {
      return fs.readFileSync(path.join(source, filename))
    })
  } else {
    buf = fs.readFileSync(source)
  }

  const data = await convert(buf)
  fs.writeFileSync(target, data)

  console.log(`Output ${path.resolve(target)}`)
}

main().catch((e) => {
  console.error(e)
})
