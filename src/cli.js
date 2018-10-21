import fs from 'fs'
import path from 'path'
import program from 'commander'
import pkg from '../package.json'
import icoConvert from '.'

const main = async () => {
  program
    .version(pkg.version)
    .description(pkg.description)
    .usage('[options] source [target]')
    .on('--help', () => {
      console.log(`
Examples:

  $ ico-convert icon.png
  $ ico-convert icons/
`)
    })
    .parse(process.argv)

  let [source, target] = program.args

  if (!source) {
    program.help()
  }
  if (!target) {
    const parsed = path.parse(source)
    delete parsed.base
    parsed.ext = '.ico'
    target = path.format(parsed)
  }

  const stat = fs.statSync(source)
  let arg
  if (stat.isDirectory()) {
    arg = fs.readdirSync(source).map((filename) => {
      return fs.readFileSync(path.join(source, filename))
    })
  } else {
    arg = fs.readFileSync(source)
  }
  const result = await icoConvert(arg)
  fs.writeFileSync(target, result)
  console.log(`Output ${path.resolve(target)}`)
}

main().catch((e) => {
  console.error(e)
})
