// import resolve from 'rollup-plugin-node-resolve'
// import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import pkg from './package.json'

export default {
  input: 'src/index.js',
  output: [{
    file: pkg.main,
    format: 'cjs'
  }, {
    file: pkg.module,
    format: 'esm'
  }],
  external: [
    'jimp',
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
}
