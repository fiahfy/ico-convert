import fs from 'fs'
import Jimp from 'jimp'
import Ico from './ico'
import Icns from './icns'

const icoConvertFromSource = async (source, destination) => {
  const image = await Jimp.read(source)
  if (image.getMIME() !== Jimp.MIME_PNG) {
    throw new TypeError('Source must be png format')
  }
  if (image.getWidth() !== image.getHeight()) {
    console.warn('Warning: Source should be squre')
  }
  if (image.getWidth() < 256 || image.getHeight() < 256) {
    console.warn('Warning: Source should be 256x256 pixels or more')
  }

  const ico = new Ico()
  for (let size of Ico.supportedSizes) {
    const img = image.clone().resize(size, size)
    const buf = await img.getBufferAsync(Jimp.MIME_PNG)
    await ico.appendImage(buf)
  }

  fs.writeFileSync(destination, ico.data)
}

const icoConvertFromSources = async (sources, destination) => {
  const ico = new Ico()
  const sizes = []
  for (let source of sources) {
    const image = await Jimp.read(source)
    if (image.getMIME() !== Jimp.MIME_PNG) {
      throw new TypeError('Source must be png format')
    }
    if (image.getWidth() !== image.getHeight()) {
      throw new TypeError('Source must be squre')
    }

    const size = image.getWidth()
    if (!Ico.supportedSizes.includes(size)) {
      throw new TypeError(`Warning: No supported pixels (${size}x${size})`)
    }
    sizes.push(size)

    const buf = await image.getBufferAsync(Jimp.MIME_PNG)
    await ico.appendImage(buf)
  }

  if (!sizes.length) {
    throw new TypeError('No valid sources')
  }

  const missingSizes = Ico.supportedSizes.filter((size) => !sizes.includes(size))
  if (missingSizes) {
    const pixels = missingSizes.map((size) => `${size}x${size}`).join(', ')
    console.warn(`Warning: Missing pixels (${pixels})`)
  }

  fs.writeFileSync(destination, ico.data)
}

export const icoConvert = async (source, destination) => {
  if (typeof source === 'string') {
    await icoConvertFromSource(source, destination)
  } else if (Array.isArray(source)) {
    await icoConvertFromSources(source, destination)
  } else {
    throw new TypeError('source must be String or Array')
  }
}

const icnsConvertFromSource = async (source, destination) => {
  const image = await Jimp.read(source)
  if (image.getMIME() !== Jimp.MIME_PNG) {
    throw new TypeError('Source must be png format')
  }
  if (image.getWidth() !== image.getHeight()) {
    console.warn('Warning: Source should be squre')
  }
  if (image.getWidth() < 1024 || image.getHeight() < 1024) {
    console.warn('Warning: Source should be 1024x1024 pixels or more')
  }

  const icns = new Icns()
  for (let { osType, size } of Icns.supportedTypes) {
    const img = image.clone().resize(size, size)
    const buf = await img.getBufferAsync(Jimp.MIME_PNG)
    await icns.appendImage(buf, osType)
  }

  fs.writeFileSync(destination, icns.data)
}

const icnsConvertFromSources = async (sources, destination) => {
  const icns = new Icns()
  const sizes = []
  for (let source of sources) {
    const image = await Jimp.read(source)
    if (image.getMIME() !== Jimp.MIME_PNG) {
      throw new TypeError('Source must be png format')
    }
    if (image.getWidth() !== image.getHeight()) {
      throw new TypeError('Source must be squre')
    }

    const size = image.getWidth()
    const types = Icns.supportedTypes.filter((type) => type.size === size)
    if (!types) {
      throw new TypeError(`Warning: No supported pixels (${size}x${size})`)
    }
    sizes.push(size)

    const buf = await image.getBufferAsync(Jimp.MIME_PNG)
    for (let { osType } of types) {
      await icns.appendImage(buf, osType)
    }
  }

  if (!sizes.length) {
    throw new TypeError('No valid sources')
  }

  const missingSizes = Icns.supportedSizes.filter((size) => !sizes.includes(size))
  if (missingSizes.length) {
    const pixels = missingSizes.map((size) => `${size}x${size}`).join(', ')
    console.warn(`Warning: Missing pixels (${pixels})`)
  }

  fs.writeFileSync(destination, icns.data)
}

export const icnsConvert = async (source, destination) => {
  if (typeof source === 'string') {
    await icnsConvertFromSource(source, destination)
  } else if (Array.isArray(source)) {
    await icnsConvertFromSources(source, destination)
  } else {
    throw new TypeError('source must be String or Array')
  }
}

// const icoRevert = (source, destination) => {
//   const buf = fs.readFileSync('./example/sample.ico')
//   const ico = new Ico(buf)
//   console.log(ico)
//   console.log(ico.data.length)

//   const buf2 = fs.readFileSync('./example/sample.icns')
//   const icns = new Icns(buf2)
//   console.log(icns)
//   console.log(icns.data.length)

//   let text = `<html><head><style>
//   table {
//     border-collapse: collapse;
//     border: 1px solid red;
// }
// </style></head><body>`
//   for (let iconImage of icns.iconImages) {
//     if (['ic04', 'ic05'].includes(iconImage.osType)) {
//       let data = iconImage.data.slice(4, iconImage.data.length)
//       data = decode(data, { icns: true })
//       const p = iconImage.osType === 'ic04' ? 1 : 2
//       text += '<table>'
//       for (let y = 0; y < 16 * p; y++) {
//         text += '<tr>'
//         for (let x = 0; x < 16 * p; x++) {
//           const a = data.readUInt8(y * 16 * p + x)
//           const r = data.readUInt8(y * 16 * p + x + 256 * Math.pow(p, 2))
//           const g = data.readUInt8(y * 16 * p + x + 256 * Math.pow(p, 2) * 2)
//           const b = data.readUInt8(y * 16 * p + x + 256 * Math.pow(p, 2) * 3)
//           text += `<td style="background-color: rgba(${r},${g},${b},${(a / 256)});">`
//         }
//         text += '</tr>'
//       }
//       text += '</table>'
//     } else {
//       fs.writeFileSync('./example/decoded_icon_' + iconImage.osType + '.png', iconImage.data)
//     }
//   }
//   fs.writeFileSync('./example/decoded_icon.html', text, { encoding: 'utf8' })
//   text += '</body></html>'
// }
(async () => {
  // await icnsConvert('/Users/daisuke.toshinai/Downloads/images/88_31_logo1.png', './example/test.icns')
  await icnsConvert([
    '/Users/daisuke.toshinai/Documents/project/fiahfy/ico-convert/example/icns_ic11.png'
    // '/Users/daisuke.toshinai/Documents/project/fiahfy/ico-convert/example/icns_ic12.png',
    // '/Users/daisuke.toshinai/Documents/project/fiahfy/ico-convert/example/icns_ic07.png',
    // '/Users/daisuke.toshinai/Documents/project/fiahfy/ico-convert/example/icns_ic08.png',
    // '/Users/daisuke.toshinai/Downloads/images/88_31_logo1.png'
  ], './example/test2.icns')
  // icoRevert()
})()

// export default icoConvert
