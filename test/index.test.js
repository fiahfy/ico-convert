import fs from 'fs'
import icoConvert from '../src'

describe('ico convert', () => {
  test('should work', async () => {
    const buf = fs.readFileSync('./test/sample.png')
    const result = await icoConvert(buf)
    expect(result).toBeTruthy()
  })

  test('should work with buffer array', async () => {
    console.warn = jest.fn()
    const bufs = [fs.readFileSync('./test/sample.png')]
    const result = await icoConvert(bufs)
    expect(result).toBeTruthy()
  })

  test('should throw error', () => {
    const src = './test/sample.png'
    expect(icoConvert(src)).rejects.toThrowError(TypeError)
  })
})
