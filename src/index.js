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

class Ico {
  constructor () {
    this.images = []
    this.iconDir = new IconDir()
  }
  static get dibHeaderSize () {
    return 40
  }
  get header () {
    const buf = Buffer.alloc(IconDir.size)
    buf.writeUInt16LE(this.iconDir.reserved, 0)
    buf.writeUInt16LE(this.iconDir.type, 2)
    buf.writeUInt16LE(this.iconDir.count, 4)
    return buf
  }
  get imageDirectories () {
    return this.iconDir.entries.map((entry) => {
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
  }
  get imageData () {
    const { list, totalLength } = this.images.reduce((carry, image) => {
      const bitmap = image.bitmap
      const width = bitmap.width
      const height = bitmap.height * 2
      const bpp = bitmap.bpp * 8
      const size = 0
      const data = bitmap.data

      const buf = Buffer.alloc(Ico.dibHeaderSize + bitmap.data.length)
      buf.writeUInt32LE(Ico.dibHeaderSize, 0)
      buf.writeInt32LE(width, 4)
      buf.writeInt32LE(height, 8)
      buf.writeUInt16LE(1, 12)
      buf.writeUInt16LE(bpp, 14)
      buf.writeUInt32LE(0, 16)
      buf.writeUInt32LE(size, 20)
      buf.writeInt32LE(0, 24)
      buf.writeInt32LE(0, 28)
      buf.writeUInt32LE(0, 32)
      buf.writeUInt32LE(0, 36)

      for (let x = 0; x < width; x++) {
        for (let y = 0; y < bitmap.height; y++) {
          let pos = (y * width + x) * bitmap.bpp
          const r = data.readUInt8(pos)
          const g = data.readUInt8(pos + 1)
          const b = data.readUInt8(pos + 2)
          const a = data.readUInt8(pos + 3)
          pos += Ico.dibHeaderSize
          buf.writeUInt8(b, pos)
          buf.writeUInt8(g, pos + 1)
          buf.writeUInt8(r, pos + 2)
          buf.writeUInt8(a, pos + 3)
        }
      }

      return {
        list: [...carry.list, buf],
        totalLength: carry.totalLength + buf.length
      }
    }, { list: [], totalLength: 0 })

    return Buffer.concat(list, totalLength)
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

    this.iconDir.count++
    this.iconDir.entries.push(entry)
  }
  get buffer () {
    const list = [this.header, ...this.imageDirectories, this.imageData]
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
// console.log(Buffer.alloc(8))
// console.log(new ArrayBuffer(8))
// export default icoConvert
