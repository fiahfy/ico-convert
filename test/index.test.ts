import fs from 'fs'
import { convert } from '../src'

describe('ico convert', () => {
  test('should work', async () => {
    const buf = fs.readFileSync('./test/sample.png')
    const result = await convert(buf)
    expect(result).toBeTruthy()
  })

  test('should work with buffer array', async () => {
    console.warn = jest.fn()
    const bufs = [fs.readFileSync('./test/sample.png')]
    const result = await convert(bufs)
    expect(result).toBeTruthy()
  })

  test('should throw error', () => {
    const src = './test/sample.png' as any // eslint-disable-line @typescript-eslint/no-explicit-any
    expect(convert(src)).rejects.toThrowError(TypeError)
  })
})
