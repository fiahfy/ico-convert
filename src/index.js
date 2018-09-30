import fs from 'fs'
import Jimp from 'jimp'
import Ico from './ico'
import Icns from './icns'
import { encode, decode } from '@fiahfy/packbits'

const icoConvert = async (source) => {
  const image = await Jimp.read(source)
  if (image.getMIME() !== Jimp.MIME_PNG) {
    throw new Error('Source must be png format')
  }
  if (image.getWidth() !== 256 || image.getHeight() !== 256) {
    // throw new Error('Source must be 256x256 pixels')
  }

  const ico = new Ico()
  for (let size of Ico.supportedSizes) {
    const img = image.clone().resize(size, size)
    const buf = await img.getBufferAsync(Jimp.MIME_PNG)
    await ico.appendImage(buf, { bitmap: true })
  }
  console.log(ico)
  fs.writeFileSync('./example/sample.ico', ico.data)

  const icns = new Icns()
  for (let { osType, size } of Icns.supportedTypes) {
    const img = image.clone().resize(size, size)
    const buf = await img.getBufferAsync(Jimp.MIME_PNG)
    await icns.appendImage(buf, osType)
  }
  console.log(icns)
  fs.writeFileSync('./example/sample.icns', icns.data)
}

const icoRevert = (source, destination) => {
  const buf = fs.readFileSync('./example/sample.ico')
  const ico = new Ico(buf)
  console.log(ico)
  console.log(ico.data.length)

  const buf2 = fs.readFileSync('./example/sample.icns')
  const icns = new Icns(buf2)
  console.log(icns)
  console.log(icns.data.length)

  let text = `<html><head><style>
  table {
    border-collapse: collapse;
    border: 1px solid red;
}
</style></head><body>`
  for (let iconImage of icns.iconImages) {
    if (['ic04', 'ic05'].includes(iconImage.osType)) {
      let data = iconImage.data.slice(4, iconImage.data.length)
      data = decode(data, { icns: true })
      const p = iconImage.osType === 'ic04' ? 1 : 2
      text += '<table>'
      for (let y = 0; y < 16 * p; y++) {
        text += '<tr>'
        for (let x = 0; x < 16 * p; x++) {
          const a = data.readUInt8(y * 16 * p + x)
          const r = data.readUInt8(y * 16 * p + x + 256 * Math.pow(p, 2))
          const g = data.readUInt8(y * 16 * p + x + 256 * Math.pow(p, 2) * 2)
          const b = data.readUInt8(y * 16 * p + x + 256 * Math.pow(p, 2) * 3)
          text += `<td style="background-color: rgba(${r},${g},${b},${(a / 256)});">`
        }
        text += '</tr>'
      }
      text += '</table>'
    } else {
      fs.writeFileSync('./example/decoded_icon_' + iconImage.osType + '.png', iconImage.data)
    }
  }
  fs.writeFileSync('./example/decoded_icon.html', text, { encoding: 'utf8' })
  text += '</body></html>'
}
(async () => {
  await icoConvert('./test/256x256.png')
  icoRevert()
})()

// export default icoConvert
