import fs from 'fs'
import Ico from '../src/ico'

describe('ico', () => {
  describe('read', () => {
    test('should work', async () => {
      const buf = fs.readFileSync('./test/sample.ico')
      const ico = await Ico.read(buf)
      expect(ico.iconDir.count).toBe(7)
      expect(ico.iconDir.entries.length).toBe(7)
      expect(ico.iconImages.length).toBe(7)
    })
  })

  describe('toBuffer', () => {
    test('should work', () => {
      const ico = new Ico()
      expect(ico.toBuffer().length).toBeGreaterThan(0)
    })
  })

  describe('addImage', () => {
    test('should work', async () => {
      const buf = fs.readFileSync('./test/256x256.png')
      const ico = new Ico()
      expect(ico.iconDir.count).toBe(0)
      expect(ico.iconDir.entries.length).toBe(0)
      expect(ico.iconImages.length).toBe(0)
      await ico.addImage(buf)
      expect(ico.iconDir.count).toBe(1)
      expect(ico.iconDir.entries.length).toBe(1)
      expect(ico.iconImages.length).toBe(1)
      await ico.addImage(buf)
      expect(ico.iconDir.count).toBe(2)
      expect(ico.iconDir.entries.length).toBe(2)
      expect(ico.iconImages.length).toBe(2)
    })
    test('should throw error when not PNG format', () => {
      const buf = fs.readFileSync('./test/256x256.jpg')
      const ico = new Ico()
      expect(ico.addImage(buf)).rejects.toThrowError(TypeError)
    })
  })
})
