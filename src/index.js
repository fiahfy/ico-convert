import Jimp from 'jimp'
import Ico from './ico'
import Icns from './icns'

const icoConvertFromBuffer = async (buffer) => {
  const image = await Jimp.read(buffer)
  if (image.getMIME() !== Jimp.MIME_PNG) {
    throw new TypeError('Image must be png format')
  }
  if (image.getWidth() !== image.getHeight()) {
    console.warn('Warning: Image should be squre')
  }
  if (image.getWidth() < 256 || image.getHeight() < 256) {
    console.warn('Warning: Image should be 256x256 pixels or more')
  }

  const ico = new Ico()
  for (let size of Ico.supportedSizes) {
    const img = image.clone().resize(size, size)
    const buf = await img.getBufferAsync(Jimp.MIME_PNG)
    await ico.appendImage(buf)
  }

  return ico.data
}

const icoConvertFromBuffers = async (buffers) => {
  const ico = new Ico()
  const sizes = []
  for (let buffer of buffers) {
    const image = await Jimp.read(buffer)
    if (image.getMIME() !== Jimp.MIME_PNG) {
      throw new TypeError('Image must be png format')
    }
    if (image.getWidth() !== image.getHeight()) {
      throw new TypeError('Image must be squre')
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
    throw new TypeError('No valid images')
  }

  const missingSizes = Ico.supportedSizes.filter((size) => !sizes.includes(size))
  if (missingSizes) {
    const pixels = missingSizes.map((size) => `${size}x${size}`).join(', ')
    console.warn(`Warning: Missing pixels (${pixels})`)
  }

  return ico.data
}

export const icoConvert = async (buffer) => {
  if (Buffer.isBuffer(buffer)) {
    return icoConvertFromBuffer(buffer)
  } else if (Array.isArray(buffer)) {
    return icoConvertFromBuffers(buffer)
  } else {
    throw new TypeError('Image must be Buffer or Array')
  }
}

const icnsConvertFromBuffer = async (buffer) => {
  const image = await Jimp.read(buffer)
  if (image.getMIME() !== Jimp.MIME_PNG) {
    throw new TypeError('Image must be png format')
  }
  if (image.getWidth() !== image.getHeight()) {
    console.warn('Warning: Image should be squre')
  }
  if (image.getWidth() < 1024 || image.getHeight() < 1024) {
    console.warn('Warning: Image should be 1024x1024 pixels or more')
  }

  const icns = new Icns()
  for (let { osType, size } of Icns.supportedTypes) {
    const img = image.clone().resize(size, size)
    const buf = await img.getBufferAsync(Jimp.MIME_PNG)
    await icns.appendImage(buf, osType)
  }

  return icns.data
}

const icnsConvertFromBuffers = async (buffers) => {
  const icns = new Icns()
  const sizes = []
  for (let buffer of buffers) {
    const image = await Jimp.read(buffer)
    if (image.getMIME() !== Jimp.MIME_PNG) {
      throw new TypeError('Image must be png format')
    }
    if (image.getWidth() !== image.getHeight()) {
      throw new TypeError('Image must be squre')
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
    throw new TypeError('No valid images')
  }

  const missingSizes = Icns.supportedSizes.filter((size) => !sizes.includes(size))
  if (missingSizes.length) {
    const pixels = missingSizes.map((size) => `${size}x${size}`).join(', ')
    console.warn(`Warning: Missing pixels (${pixels})`)
  }

  return icns.data
}

export const icnsConvert = async (buffer) => {
  if (Buffer.isBuffer(buffer)) {
    return icnsConvertFromBuffer(buffer)
  } else if (Array.isArray(buffer)) {
    return icnsConvertFromBuffers(buffer)
  } else {
    throw new TypeError('Image must be Buffer or Array')
  }
}

export default icoConvert
