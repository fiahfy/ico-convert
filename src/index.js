import fs from 'fs'
import Jimp from 'jimp'
import Ico from './ico'

const sizes = [16, 24, 32, 48, 64, 128, 256]

const icoConvert = async (source, destination) => {
  const image = await Jimp.read(source)
  if (image.getMIME() !== Jimp.MIME_PNG) {
    throw new Error('Source must be png format')
  }
  if (image.getWidth() !== 256 || image.getHeight() !== 256) {
    // throw new Error('Source must be 256x256 pixels')
  }
  const images = sizes.map((size) => image.clone().resize(size, size))

  const ico = new Ico()

  await Promise.all(images.map(async (image) => {
    const buf = await image.getBufferAsync(Jimp.MIME_PNG)
    await ico.addImage(buf, { bitmap: false })
  }))

  fs.writeFileSync(destination, ico.toBuffer())
  console.log(ico.iconDir.entries)
}

// const icoRevert = async (source, destination) => {
//   const buf = fs.readFileSync(source)
//   const ico = await Ico.read(buf)
//   fs.writeFileSync(destination, ico.toBuffer())
// }

icoConvert('./test/256x256.png', './test/sample.ico')
// icoRevert('./example/sample.ico', './example/sample_new.ico')

// export default icoConvert
