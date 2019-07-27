# @fiahfy/ico-convert

> Convert PNG to [ICO file format](https://en.wikipedia.org/wiki/ICO_(file_format)).


## Installation
```
npm install @fiahfy/ico-convert
```


## Usage
```js
import fs from 'fs'
import icoConvert from '@fiahfy/ico-convert'

const buf = fs.readFileSync('input.png') // image must be squre, 256x256 pixels or larger
icoConvert(buf).then((data) => {
  fs.writeFileSync('output.ico', data)
})
```

### Specify images by size
```js
const bufs = [
  fs.readFileSync('16x16.png'),
  fs.readFileSync('24x24.png'),
  fs.readFileSync('32x32.png'),
  fs.readFileSync('48x48.png'),
  fs.readFileSync('64x64.png'),
  fs.readFileSync('128x128.png'),
  fs.readFileSync('256x256.png')
]
icoConvert(bufs).then((data) => {
  fs.writeFileSync('output.ico', data)
})
```


## CLI
```
ico-convert icon.png
```
