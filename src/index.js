import Jimp from 'jimp'

const sizes = [16, 24, 32, 48, 64, 128, 256]

class Ico {
  constructor () {
    this.images = []
  }
  get numberOfImages () {
    return this.images.length
  }
  addImage (buf) {
    this.images.push(buf)
  }
  getHeader () {
    const buf = Buffer.alloc(6)
    buf.writeUInt16LE(0, 0) // Reserved. Must always be 0.
    buf.writeUInt16LE(1, 2) // Specifies image type: 1 for icon (.ICO) image, 2 for cursor (.CUR) image. Other values are invalid.
    buf.writeUInt16LE(this.numberOfImages, 4) // Specifies number of images in the file.
    return buf
  }
  toBuffer () {
    return this.getHeader()
  }
}

const icoConvert = async (source) => {
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
    ico.addImage(buf)
  }))
  // images.forEach(async (image) => {
  //   const buf = await image.getBufferAsync(Jimp.MIME_PNG)
  //   ico.addImage(buf)
  // })

  console.log(ico)
  console.log(ico.toBuffer())
}

icoConvert('./example/icon.png')
// export default icoConvert
