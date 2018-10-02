import Jimp from 'jimp'
import Ico from './ico'

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

export default async (buffer) => {
  if (Buffer.isBuffer(buffer)) {
    return icoConvertFromBuffer(buffer)
  } else if (Array.isArray(buffer)) {
    return icoConvertFromBuffers(buffer)
  } else {
    throw new TypeError('Image must be Buffer or Array')
  }
}
