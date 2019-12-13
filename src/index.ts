import sharp from 'sharp'
import { Ico, IcoImage } from '@fiahfy/ico'

const convertFromBuffer = async (buffer: Buffer): Promise<Buffer> => {
  const image = sharp(buffer)
  const { width, height } = await image.metadata()
  if (!width || !height || width !== height) {
    throw new TypeError('Image should be squre')
  }
  if (width < 256 || height < 256) {
    console.warn('Warning: Image should be 256x256 pixels or more')
  }

  const ico = new Ico()
  for (const size of Ico.supportedIconSizes) {
    const cloned = image.clone().resize(size, size)
    const buf = await cloned.png().toBuffer()
    ico.append(IcoImage.fromPNG(buf))
  }

  return ico.data
}

const convertFromBuffers = async (buffers: Buffer[]): Promise<Buffer> => {
  const ico = new Ico()
  const sizes: number[] = []
  for (const buffer of buffers) {
    const image = sharp(buffer)
    const { width, height } = await image.metadata()
    if (!width || !height || width !== height) {
      throw new TypeError('Image should be squre')
    }

    const size = width
    if (!Ico.supportedIconSizes.includes(size)) {
      throw new TypeError(`Warning: No supported pixels (${size}x${size})`)
    }
    sizes.push(size)

    const buf = await image.png().toBuffer()
    ico.append(IcoImage.fromPNG(buf))
  }

  if (!sizes.length) {
    throw new TypeError('No valid images')
  }

  const missingSizes = Ico.supportedIconSizes.filter(
    (size) => !sizes.includes(size)
  )
  if (missingSizes.length) {
    const pixels = missingSizes.map((size) => `${size}x${size}`).join(', ')
    console.warn(`Warning: Missing pixels (${pixels})`)
  }

  return ico.data
}

export const convert = async (buffer: Buffer | Buffer[]): Promise<Buffer> => {
  if (Buffer.isBuffer(buffer)) {
    return convertFromBuffer(buffer)
  } else if (Array.isArray(buffer)) {
    return convertFromBuffers(buffer)
  } else {
    throw new TypeError('Image must be Buffer or Buffer Array')
  }
}
