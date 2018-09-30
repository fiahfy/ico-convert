// import { encode, decode } from '@fiahfy/packbits'
import Jimp from 'jimp'

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
  constructor (buffer) {
    this.iconHeader = new IconHeader()
    this.iconImages = []
    if (buffer) {
      this.data = buffer
    }
  }
  static get supportedTypes () {
    return [
      { osType: 'ic04', size: 16, format: 'ARGB' },
      { osType: 'ic05', size: 32, format: 'ARGB' },
      { osType: 'ic07', size: 128, format: 'PNG' },
      { osType: 'ic08', size: 256, format: 'PNG' },
      { osType: 'ic09', size: 512, format: 'PNG' },
      { osType: 'ic10', size: 1024, format: 'PNG' },
      { osType: 'ic11', size: 32, format: 'PNG' },
      { osType: 'ic12', size: 64, format: 'PNG' },
      { osType: 'ic13', size: 256, format: 'PNG' },
      { osType: 'ic14', size: 512, format: 'PNG' }
    ]
  }
  get _iconHeaderData () {
    const buf = Buffer.alloc(iconHeaderSize)
    buf.write(this.iconHeader.identifier, 0, 4, 'ascii')
    buf.writeUInt32BE(this.iconHeader.bytes, 4)
    return buf
  }
  set _iconHeaderData (buffer) {
    const iconHeader = new IconHeader()
    iconHeader.identifier = buffer.toString('ascii', 0, 4)
    iconHeader.bytes = buffer.readUInt32BE(4)
    this.iconHeader = iconHeader
  }
  get _iconImagesData () {
    return this.iconImages.map((image) => {
      const buf = Buffer.alloc(8)
      buf.write(image.osType, 0, 4, 'ascii')
      buf.writeUInt32BE(image.bytes, 4)

      const list = [buf, image.data]
      const totalLength = list.reduce((carry, buf) => carry + buf.length, 0)

      return Buffer.concat(list, totalLength)
    })
  }
  set _iconImagesData (buffer) {
    const iconImages = []
    let pos = iconHeaderSize
    while (pos < this.iconHeader.bytes) {
      const iconImage = new IconImage()
      iconImage.osType = buffer.toString('ascii', pos, pos + 4)
      iconImage.bytes = buffer.readUInt32BE(pos + 4)
      iconImage.data = buffer.slice(pos + 8, pos + iconImage.bytes)
      iconImages.push(iconImage)
      pos += iconImage.bytes
    }
    this.iconImages = iconImages
  }
  get data () {
    const list = [this._iconHeaderData, ...this._iconImagesData]
    const totalLength = list.reduce((carry, buf) => carry + buf.length, 0)
    return Buffer.concat(list, totalLength)
  }
  set data (buffer) {
    this._iconHeaderData = buffer
    this._iconImagesData = buffer
  }
  _resetIconHeader () {
    this.iconHeader.bytes = this.iconImages.reduce((carry, image) => carry + image.bytes, 0)
  }
  async appendImage (buffer, osType) {
    await this.insertImage(buffer, osType, this.iconImages.length)
  }
  async insertImage (buffer, osType, index) {
    const image = await Jimp.read(buffer)
    if (image.getMIME() !== Jimp.MIME_PNG) {
      throw new TypeError('Image must be png format')
    }

    const bytes = buffer.length + 8
    const data = buffer
    const iconImage = new IconImage({ osType, bytes, data })
    this.iconImages[index] = iconImage

    this._resetIconHeader()
  }
  removeImage (index) {
    this.iconImages.splice(index, 1)

    this._resetIconHeader()
  }
}
