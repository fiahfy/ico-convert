import fs from 'fs'
import { icoConvert, icnsConvert } from '../src'

describe('ico convert', () => {
  test('should work', async () => {
    const buf = fs.readFileSync('./test/sample.png')
    const result = await icoConvert(buf)
    expect(result).toHaveLength(6822)
  })
})

describe('icns convert', () => {
  test('should work', async () => {
    jest.setTimeout(30000)
    const buf = fs.readFileSync('./test/sample.png')
    const result = await icnsConvert(buf)
    expect(result).toHaveLength(39826)
  })
})
