// import resolve from 'rollup-plugin-node-resolve'
// import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import json from 'rollup-plugin-json'
import pkg from './package.json'

export default [{
  input: 'src/index.js',
  output: [{
    file: pkg.main,
    format: 'cjs'
  }, {
    file: pkg.module,
    format: 'esm'
  }],
  external: [
    'fs',
    'file-type',
    'jimp',
    '@fiahfy/packbits',
    '@babel/runtime/regenerator',
    '@babel/runtime/helpers/asyncToGenerator',
    '@babel/runtime/helpers/classCallCheck',
    '@babel/runtime/helpers/createClass',
    '@babel/runtime/helpers/toConsumableArray'
  ],
  plugins: [
    // resolve(),
    // commonjs(),
    babel({
      exclude: 'node_modules/**',
      runtimeHelpers: true
    })
  ]
},
{
  input: 'src/cli.js',
  output: {
    file: './dist/cli.js',
    format: 'cjs',
    banner: '#!/usr/bin/env node'
  },
  external: [
    '.',
    'fs',
    'path',
    'commander',
    '@babel/runtime/regenerator',
    '@babel/runtime/helpers/slicedToArray',
    '@babel/runtime/helpers/asyncToGenerator'
  ],
  plugins: [
    // resolve(),
    // commonjs(),
    json(),
    babel({
      exclude: 'node_modules/**',
      runtimeHelpers: true
    })
  ]
}]
