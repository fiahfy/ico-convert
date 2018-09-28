import fs from 'fs'
import { encode, decode } from '@fiahfy/packbits'

const iconHeaderSize = 8

class IconHeader {
  constructor ({
    identifier = 'icns',
    bytes = 0
  } = {}) {
    this.identifier = identifier
    this.bytes = bytes
  }
}

class IconImage {
  constructor ({
    osType = '',
    bytes = 0,
    data = null
  } = {}) {
    this.osType = osType
    this.bytes = bytes
    this.data = data
  }
}

export default class Icns {
  constructor () {
    this.iconHeader = new IconHeader()
    this.iconImages = []
  }
  static async read (buf) {
    const iconHeader = Icns._readIconHeader(buf)
    const iconImages = Icns._readIconImages(buf, iconHeader)
    const icon = new Icns()
    icon.iconHeader = iconHeader
    icon.iconImages = iconImages
    return icon
  }
  static _readIconHeader (buf) {
    const iconHeader = new IconHeader()
    iconHeader.identifier = buf.toString('ascii', 0, 4)
    iconHeader.bytes = buf.readUInt32BE(4)
    return iconHeader
  }
  static _readIconImages (buf, iconHeader) {
    const images = []
    let pos = iconHeaderSize
    while (pos < iconHeader.bytes) {
      const iconImage = new IconImage()
      iconImage.osType = buf.toString('ascii', pos, pos + 4)
      iconImage.bytes = buf.readUInt32BE(pos + 4)
      iconImage.data = buf.slice(pos + 8 + 4, pos + iconImage.bytes)
      images.push(iconImage)
      pos += iconImage.bytes
    }
    return images
  }
  // _iconDirToBuffer () {
  //   const iconDir = Buffer.alloc(iconDirSize)
  //   iconDir.writeUInt16LE(this.iconDir.reserved, 0)
  //   iconDir.writeUInt16LE(this.iconDir.type, 2)
  //   iconDir.writeUInt16LE(this.iconDir.count, 4)

  //   const entries = this.iconDir.entries.map((entry) => {
  //     const buf = Buffer.alloc(iconDirEntrySize)
  //     buf.writeUInt8(entry.width, 0)
  //     buf.writeUInt8(entry.height, 1)
  //     buf.writeUInt8(entry.colorCount, 2)
  //     buf.writeUInt8(entry.reserved, 3)
  //     buf.writeUInt16LE(entry.planes, 4)
  //     buf.writeUInt16LE(entry.bitCount, 6)
  //     buf.writeUInt32LE(entry.bytesInRes, 8)
  //     buf.writeUInt32LE(entry.imageOffset, 12)
  //     return buf
  //   })

  //   const list = [iconDir, ...entries]
  //   const totalLength = list.reduce((carry, buf) => carry + buf.length, 0)

  //   return Buffer.concat(list, totalLength)
  // }
  // _iconImageToBuffers () {
  //   return this.iconImages.map((image) => {
  //     // PNG format
  //     if (Buffer.isBuffer(image)) {
  //       return image
  //     }

  //     const header = Buffer.alloc(bitmapInfoHeaderSize)
  //     header.writeUInt32LE(image.header.size, 0)
  //     header.writeInt32LE(image.header.width, 4)
  //     header.writeInt32LE(image.header.height, 8)
  //     header.writeUInt16LE(image.header.planes, 12)
  //     header.writeUInt16LE(image.header.bitCount, 14)
  //     header.writeUInt32LE(image.header.compression, 16)
  //     header.writeUInt32LE(image.header.sizeImage, 20)
  //     header.writeInt32LE(image.header.xPelsPerMeter, 24)
  //     header.writeInt32LE(image.header.yPelsPerMeter, 28)
  //     header.writeUInt32LE(image.header.clrUsed, 32)
  //     header.writeUInt32LE(image.header.clrImportant, 36)

  //     const colors = image.colors.map((color) => {
  //       const buf = Buffer.alloc(4)
  //       buf.writeUInt8(color.blue, 0)
  //       buf.writeUInt8(color.green, 1)
  //       buf.writeUInt8(color.red, 2)
  //       buf.writeUInt8(color.reserved, 3)
  //       return buf
  //     })

  //     const images = image.xor.map((image) => {
  //       const buf = Buffer.alloc(1)
  //       buf.writeUInt8(image, 0)
  //       return buf
  //     })

  //     const masks = image.and.map((image) => {
  //       const buf = Buffer.alloc(1)
  //       buf.writeUInt8(image, 0)
  //       return buf
  //     })

  //     const list = [header, ...colors, ...images, ...masks]
  //     const totalLength = list.reduce((carry, buf) => carry + buf.length, 0)

  //     return Buffer.concat(list, totalLength)
  //   })
  // }
  // _createIconImage (bitmap) {
  //   const width = bitmap.width
  //   const height = bitmap.height * 2 // image + mask
  //   const planes = 1
  //   const bitCount = bitmap.bpp * 8
  //   const header = new BitmapInfoHeader({ width, height, planes, bitCount })

  //   const xor = []
  //   // Convert Top/Left to Bottom/Left
  //   for (let y = bitmap.height - 1; y >= 0; y--) {
  //     for (let x = 0; x < bitmap.width; x++) {
  //       // RGBA to BGRA
  //       const pos = (y * bitmap.width + x) * bitmap.bpp
  //       const red = bitmap.data.readUInt8(pos)
  //       const green = bitmap.data.readUInt8(pos + 1)
  //       const blue = bitmap.data.readUInt8(pos + 2)
  //       const alpha = bitmap.data.readUInt8(pos + 3)
  //       xor.push(blue)
  //       xor.push(green)
  //       xor.push(red)
  //       xor.push(alpha)
  //     }
  //   }

  //   return new IconImage({ header, xor })
  // }
  // toBuffer () {
  //   const list = [this._iconDirToBuffer(), ...this._iconImageToBuffers()]
  //   const totalLength = list.reduce((carry, buf) => carry + buf.length, 0)
  //   return Buffer.concat(list, totalLength)
  // }
  // async addImage (buf, { bitmap: useBitmap } = { bitmap: true }) {
  //   const image = await Jimp.read(buf)
  //   if (image.getMIME() !== Jimp.MIME_PNG) {
  //     throw new TypeError('Image must be png format')
  //   }

  //   const bitmap = image.bitmap
  //   const width = bitmap.width > 255 ? 0 : bitmap.width
  //   const height = bitmap.height > 255 ? 0 : bitmap.height
  //   const planes = 1
  //   const bitCount = bitmap.bpp * 8
  //   const bytesInRes = useBitmap ? bitmapInfoHeaderSize + bitmap.data.length : buf.length

  //   // Update imageOffset for entries, and calculate next imageOffset
  //   let imageOffset = iconDirSize + iconDirEntrySize * (this.iconDir.entries.length + 1)
  //   this.iconDir.entries = this.iconDir.entries.map((entry) => {
  //     entry.imageOffset = imageOffset
  //     imageOffset += entry.bytesInRes
  //     return entry
  //   })

  //   // Add icon dir entry
  //   const entry = new IconDirEntry({ width, height, planes, bitCount, bytesInRes, imageOffset })
  //   this.iconDir.count++
  //   this.iconDir.entries.push(entry)

  //   // Add icon image
  //   const iconImage = useBitmap ? this._createIconImage(bitmap) : buf
  //   this.iconImages.push(iconImage)
  // }
}
