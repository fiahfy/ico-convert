import fs from 'fs'
import path from 'path'
import program from 'commander'
import pkg from '../package.json'
import icoConvert from '.'

const main = async () => {
  program
    .version(pkg.version)
    .usage('[options] <source> <target>')
    .parse(process.argv)

  const [source, target] = program.args

  if (!source || !target) {
    program.help()
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
}

main().catch((e) => {
  console.error(e.message)
})
