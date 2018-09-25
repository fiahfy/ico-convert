import fs from 'fs'
import Jimp from 'jimp'

const sizes = [16, 24, 32, 48, 64, 128, 256]

class IconDir {
  constructor ({
    reserved = 0,
    type = 1,
    count = 0,
    entries = []
  } = {}) {
    this.reserved = reserved
    this.type = type
    this.count = count
    this.entries = entries
  }
  static get size () {
    return 6
  }
}

class IconDirEntry {
  constructor ({
    width = 0,
    height = 0,
    colorCount = 0,
    reserved = 0,
    planes = 0,
    bitCount = 0,
    bytesInRes = 0,
    imageOffset = 0
  } = {}) {
    this.width = width
    this.height = height
    this.colorCount = colorCount
    this.reserved = reserved
    this.planes = planes
    this.bitCount = bitCount
    this.bytesInRes = bytesInRes
    this.imageOffset = imageOffset
  }
  static get size () {
    return 16
  }
}

class IconImage {
  constructor ({
    header = new BitmapInfoHeader(),
    colors = [],
    xor = [],
    and = []
  } = {}) {
    this.header = header
    this.colors = colors
    this.xor = xor
    this.and = and
  }
  static get size () {
    return 40
  }
}

class RGBQuad {
  constructor ({
    blue = 0,
    green = 0,
    red = 0,
    reserved = 0
  } = {}) {
    this.blue = blue
    this.green = green
    this.red = red
    this.reserved = reserved
  }
  static get size () {
    return 4
  }
}

class BitmapInfoHeader {
  constructor ({
    size = BitmapInfoHeader.size,
    width = 0,
    height = 0,
    planes = 0,
    bitCount = 0,
    compression = 0,
    sizeImage = 0,
    xPelsPerMeter = 0,
    yPelsPerMeter = 0,
    clrUsed = 0,
    clrImportant = 0
  } = {}) {
    this.size = size
    this.width = width
    this.height = height
    this.planes = planes
    this.bitCount = bitCount
    this.compression = compression
    this.sizeImage = sizeImage
    this.xPelsPerMeter = xPelsPerMeter
    this.yPelsPerMeter = yPelsPerMeter
    this.clrUsed = clrUsed
    this.clrImportant = clrImportant
  }
  static get size () {
    return 40
  }
}

class Ico {
  constructor () {
    this.images = []
    this.iconDir = new IconDir()
    this.iconImages = []
  }
  static read (buf) {
    const ico = new Ico()
    const iconDir = new IconDir()
    iconDir.reserved = buf.readUInt16LE(0)
    iconDir.type = buf.readUInt16LE(2)
    iconDir.count = buf.readUInt16LE(4)
    let pos = IconDir.size
    for (let i = 0; i < iconDir.count; i++) {
      const entry = new IconDirEntry()
      entry.width = buf.readUInt8(pos)
      entry.height = buf.readUInt8(pos + 1)
      entry.colorCount = buf.readUInt8(pos + 2)
      entry.reserved = buf.readUInt8(pos + 3)
      entry.planes = buf.readUInt16LE(pos + 4)
      entry.bitCount = buf.readUInt16LE(pos + 6)
      entry.bytesInRes = buf.readUInt32LE(pos + 8)
      entry.imageOffset = buf.readUInt32LE(pos + 12)
      iconDir.entries.push(entry)
      pos += IconDirEntry.size
    }
    ico.iconDir = iconDir

    const iconImages = []
    for (let i = 0; i < iconDir.count; i++) {
      pos = ico.iconDir.entries[i].imageOffset
      console.log(ico.iconDir.entries[i])
      const image = new IconImage()
      image.header.size = buf.readUInt32LE(pos)
      image.header.width = buf.readInt32LE(pos + 4)
      image.header.height = buf.readInt32LE(pos + 8)
      image.header.planes = buf.readUInt16LE(pos + 12)
      image.header.bitCount = buf.readUInt16LE(pos + 14)
      image.header.compression = buf.readUInt32LE(pos + 16)
      image.header.sizeImage = buf.readUInt32LE(pos + 20)
      image.header.xPelsPerMeter = buf.readInt32LE(pos + 24)
      image.header.yPelsPerMeter = buf.readInt32LE(pos + 28)
      image.header.clrUsed = buf.readUInt32LE(pos + 32)
      image.header.clrImportant = buf.readUInt32LE(pos + 36)
      console.log(image)
      pos += IconImage.size
      for (let i = 0; i < image.header.sizeImage; i++) {
        const xor = buf.readUInt8(pos++)
        image.xor.push(xor)
      }
      console.log('end = ' + pos)
      iconImages.push(image)
    }
    ico.iconImages = iconImages

    console.log(ico)
    // ico.iconDir.entries.forEach((e) => console.log(e))
  }
  get iconDirBuffer () {
    const iconDir = Buffer.alloc(IconDir.size)
    iconDir.writeUInt16LE(this.iconDir.reserved, 0)
    iconDir.writeUInt16LE(this.iconDir.type, 2)
    iconDir.writeUInt16LE(this.iconDir.count, 4)

    const entries = this.iconDir.entries.map((entry) => {
      const buf = Buffer.alloc(IconDirEntry.size)
      buf.writeUInt8(entry.width, 0)
      buf.writeUInt8(entry.height, 1)
      buf.writeUInt8(entry.colorCount, 2)
      buf.writeUInt8(entry.reserved, 3)
      buf.writeUInt16LE(entry.planes, 4)
      buf.writeUInt16LE(entry.bitCount, 6)
      buf.writeUInt32LE(entry.bytesInRes, 8)
      buf.writeUInt32LE(entry.imageOffset, 12)
      return buf
    })

    const list = [iconDir, ...entries]
    const totalLength = list.reduce((carry, buf) => carry + buf.length, 0)

    return Buffer.concat(list, totalLength)
  }
  get iconImageBuffers () {
    return this.iconImages.map((image) => {
      const header = Buffer.alloc(IconImage.size)
      header.writeUInt32LE(image.header.size, 0)
      header.writeInt32LE(image.header.width, 4)
      header.writeInt32LE(image.header.height, 8)
      header.writeUInt16LE(image.header.planes, 12)
      header.writeUInt16LE(image.header.bitCount, 14)
      header.writeUInt32LE(image.header.compression, 16)
      header.writeUInt32LE(image.header.sizeImage, 20)
      header.writeInt32LE(image.header.xPelsPerMeter, 24)
      header.writeInt32LE(image.header.yPelsPerMeter, 28)
      header.writeUInt32LE(image.header.clrUsed, 32)
      header.writeUInt32LE(image.header.clrImportant, 36)

      const colors = image.colors.map((color) => {
        const buf = Buffer.alloc(RGBQuad.size)
        buf.writeUInt8(color.blue, 0)
        buf.writeUInt8(color.green, 1)
        buf.writeUInt8(color.red, 2)
        buf.writeUInt8(color.reserved, 3)
        return buf
      })

      const images = image.xor.map((image) => {
        const buf = Buffer.alloc(1)
        buf.writeUInt8(image, 0)
        return buf
      })

      const masks = image.and.map((image) => {
        const buf = Buffer.alloc(1)
        buf.writeUInt8(image, 0)
        return buf
      })

      const list = [header, ...colors, ...images, ...masks]
      const totalLength = list.reduce((carry, buf) => carry + buf.length, 0)

      return Buffer.concat(list, totalLength)
    })
  }
  async addImage (buf) {
    const image = await Jimp.read(buf)
    this.images.push(image)

    const bitmap = image.bitmap
    const width = bitmap.width > 255 ? 0 : bitmap.width
    const height = bitmap.height > 255 ? 0 : bitmap.height
    const planes = 1
    const bitCount = bitmap.bpp * 8
    const bytesInRes = bitmap.data.length + 40

    let imageOffset = IconDir.size + IconDirEntry.size * (this.iconDir.entries.length + 1)
    this.iconDir.entries = this.iconDir.entries.map((entry) => {
      entry.imageOffset = imageOffset
      imageOffset += entry.bytesInRes
      return entry
    })

    const entry = new IconDirEntry({ width, height, planes, bitCount, bytesInRes, imageOffset })

    const header = new BitmapInfoHeader({ width: bitmap.width, height: bitmap.height * 2, planes, bitCount })
    const xor = []
    // Convert Top/Left to Bottom/Left
    for (let y = bitmap.height - 1; y >= 0; y--) {
      for (let x = 0; x < bitmap.width; x++) {
        // RGBA to BGRA
        const pos = (y * bitmap.width + x) * bitmap.bpp
        const red = bitmap.data.readUInt8(pos)
        const green = bitmap.data.readUInt8(pos + 1)
        const blue = bitmap.data.readUInt8(pos + 2)
        const alpha = bitmap.data.readUInt8(pos + 3)
        xor.push(blue)
        xor.push(green)
        xor.push(red)
        xor.push(alpha)
      }
    }
    const iconImage = new IconImage({ header, xor })

    this.iconDir.count++
    this.iconDir.entries.push(entry)
    this.iconImages.push(iconImage)
  }
  get buffer () {
    const list = [this.iconDirBuffer, ...this.iconImageBuffers]
    const totalLength = list.reduce((carry, buf) => carry + buf.length, 0)
    return Buffer.concat(list, totalLength)
  }
}

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
    await ico.addImage(buf)
  }))
  // images.forEach(async (image) => {
  //   const buf = await image.getBufferAsync(Jimp.MIME_PNG)
  //   ico.addImage(buf)
  // })

  // console.log(ico)
  // console.log(ico.header)
  // console.log(ico.imageDirectories)
  // console.log(ico.buffer)
  fs.writeFileSync(destination, ico.buffer)
}

icoConvert('./example/icon.png', './example/icon.ico')

// const buf = fs.readFileSync('./example/sample.ico')
// Ico.read(buf)

// console.log(Buffer.alloc(8))
// console.log(new ArrayBuffer(8))
// export default icoConvert
