import Jimp from 'jimp'

const iconDirSize = 6
const iconDirEntrySize = 16
const bitmapInfoHeaderSize = 40

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
}

class RGBQuad { // eslint-disable-line no-unused-vars
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
}

class BitmapInfoHeader {
  constructor ({
    size = bitmapInfoHeaderSize,
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
}

export default class Ico {
  constructor () {
    this.iconDir = new IconDir()
    this.iconImages = []
  }
  static async read (buffer) {
    const iconDir = Ico._readIconDir(buffer)
    const iconImages = await Ico._readIconImages(buffer, iconDir)
    const icon = new Ico()
    icon.iconDir = iconDir
    icon.iconImages = iconImages
    return icon
  }
  static _readIconDir (buffer) {
    let pos = 0
    const iconDir = new IconDir()
    iconDir.reserved = buffer.readUInt16LE(pos)
    iconDir.type = buffer.readUInt16LE(pos + 2)
    iconDir.count = buffer.readUInt16LE(pos + 4)
    pos += iconDirSize
    for (let i = 0; i < iconDir.count; i++) {
      const entry = new IconDirEntry()
      entry.width = buffer.readUInt8(pos)
      entry.height = buffer.readUInt8(pos + 1)
      entry.colorCount = buffer.readUInt8(pos + 2)
      entry.reserved = buffer.readUInt8(pos + 3)
      entry.planes = buffer.readUInt16LE(pos + 4)
      entry.bitCount = buffer.readUInt16LE(pos + 6)
      entry.bytesInRes = buffer.readUInt32LE(pos + 8)
      entry.imageOffset = buffer.readUInt32LE(pos + 12)
      iconDir.entries.push(entry)
      pos += iconDirEntrySize
    }
    return iconDir
  }
  static async _readIconImages (buffer, iconDir) {
    const iconImages = []
    for (let i = 0; i < iconDir.count; i++) {
      const entry = iconDir.entries[i]
      let { imageOffset: pos, bytesInRes: size } = entry
      try {
        const data = buffer.slice(pos, pos + size)
        const im = await Jimp.read(data)
        // PNG format
        if (im.getMIME() === Jimp.MIME_PNG) {
          iconImages.push(data)
          continue
        }
      } catch (e) {
        //
      }

      const image = new IconImage()
      image.header.size = buffer.readUInt32LE(pos)
      image.header.width = buffer.readInt32LE(pos + 4)
      image.header.height = buffer.readInt32LE(pos + 8)
      image.header.planes = buffer.readUInt16LE(pos + 12)
      image.header.bitCount = buffer.readUInt16LE(pos + 14)
      image.header.compression = buffer.readUInt32LE(pos + 16)
      image.header.sizeImage = buffer.readUInt32LE(pos + 20)
      image.header.xPelsPerMeter = buffer.readInt32LE(pos + 24)
      image.header.yPelsPerMeter = buffer.readInt32LE(pos + 28)
      image.header.clrUsed = buffer.readUInt32LE(pos + 32)
      image.header.clrImportant = buffer.readUInt32LE(pos + 36)

      pos += bitmapInfoHeaderSize
      size -= bitmapInfoHeaderSize

      // TODO: 1,2,4,8 bpp
      // no colors when bpp is 16 or more
      for (let i = 0; i < size; i++) {
        const xor = buffer.readUInt8(pos++)
        image.xor.push(xor)
      }

      iconImages.push(image)
    }
    return iconImages
  }
  _iconDirToBuffer () {
    const iconDir = Buffer.alloc(iconDirSize)
    iconDir.writeUInt16LE(this.iconDir.reserved, 0)
    iconDir.writeUInt16LE(this.iconDir.type, 2)
    iconDir.writeUInt16LE(this.iconDir.count, 4)

    const entries = this.iconDir.entries.map((entry) => {
      const buf = Buffer.alloc(iconDirEntrySize)
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
  _iconImageToBuffers () {
    return this.iconImages.map((image) => {
      // PNG format
      if (Buffer.isBuffer(image)) {
        return image
      }

      const header = Buffer.alloc(bitmapInfoHeaderSize)
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
        const buf = Buffer.alloc(4)
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
  _createIconImage (bitmap) {
    const width = bitmap.width
    const height = bitmap.height * 2 // image + mask
    const planes = 1
    const bitCount = bitmap.bpp * 8
    const header = new BitmapInfoHeader({ width, height, planes, bitCount })

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

    return new IconImage({ header, xor })
  }
  _resetIconDir () {
    this.iconDir.count = this.iconDir.entries.length

    let imageOffset = iconDirSize + iconDirEntrySize * this.iconDir.entries.length
    this.iconDir.entries = this.iconDir.entries.map((entry) => {
      entry.imageOffset = imageOffset
      imageOffset += entry.bytesInRes
      return entry
    })
  }
  toBuffer () {
    const list = [this._iconDirToBuffer(), ...this._iconImageToBuffers()]
    const totalLength = list.reduce((carry, buf) => carry + buf.length, 0)
    return Buffer.concat(list, totalLength)
  }
  async appendImage (buffer, { bitmap: useBitmap } = { bitmap: true }) {
    const image = await Jimp.read(buffer)
    if (image.getMIME() !== Jimp.MIME_PNG) {
      throw new TypeError('Image must be png format')
    }

    const bitmap = image.bitmap
    const width = bitmap.width > 255 ? 0 : bitmap.width
    const height = bitmap.height > 255 ? 0 : bitmap.height
    const planes = 1
    const bitCount = bitmap.bpp * 8
    const bytesInRes = useBitmap ? bitmapInfoHeaderSize + bitmap.data.length : buffer.length

    // Add icon dir entry
    const entry = new IconDirEntry({ width, height, planes, bitCount, bytesInRes })
    this.iconDir.entries.push(entry)

    // Add icon image
    const iconImage = useBitmap ? this._createIconImage(bitmap) : buffer
    this.iconImages.push(iconImage)

    // Reset icon dir data
    this._resetIconDir()
  }
  insertImage (index, buffer, { bitmap: useBitmap } = { bitmap: true }) {
    // this.iconDir.entries.splice(index, 1)
    // this.iconImages.splice(index, 1)

    // Reset icon dir data
    this._resetIconDir()
  }
  removeImage (index) {
    this.iconDir.entries.splice(index, 1)
    this.iconImages.splice(index, 1)

    // Reset icon dir data
    this._resetIconDir()
  }
}
