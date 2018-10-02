import fs from 'fs'
import Ico from '../src/ico'

describe('ico', () => {
  describe('constructor', () => {
    test('should work', async () => {
      const ico = new Ico()
      expect(ico.iconDir.count).toBe(0)
      expect(ico.iconDir.entries.length).toBe(0)
      expect(ico.iconImages.length).toBe(0)
    })

    test('should work with buffer', async () => {
      const buf = fs.readFileSync('./test/sample.ico')
      const ico = new Ico(buf)
      expect(ico.iconDir.count).toBe(7)
      expect(ico.iconDir.entries.length).toBe(7)
      expect(ico.iconImages.length).toBe(7)
    })
  })

  describe('data property', () => {
    test('should work', () => {
      const ico = new Ico()
      expect(ico.data.length).toBeGreaterThan(0)
      ico.data = fs.readFileSync('./test/sample.ico')
      expect(ico.iconDir.count).toBe(7)
      expect(ico.iconDir.entries.length).toBe(7)
      expect(ico.iconImages.length).toBe(7)
    })
  })

  describe('appendImage', () => {
    test('should work', async () => {
      const buf = fs.readFileSync('./test/sample.png')
      const ico = new Ico()
      expect(ico.iconDir.count).toBe(0)
      expect(ico.iconDir.entries.length).toBe(0)
      expect(ico.iconImages.length).toBe(0)
      await ico.appendImage(buf)
      expect(ico.iconDir.count).toBe(1)
      expect(ico.iconDir.entries.length).toBe(1)
      expect(ico.iconImages.length).toBe(1)
      await ico.appendImage(buf)
      expect(ico.iconDir.count).toBe(2)
      expect(ico.iconDir.entries.length).toBe(2)
      expect(ico.iconImages.length).toBe(2)
    })

    test('should throw error if buffer is not PNG format', () => {
      const buf = fs.readFileSync('./test/sample.jpg')
      const ico = new Ico()
      expect(ico.appendImage(buf)).rejects.toThrowError(TypeError)
    })
  })
})
