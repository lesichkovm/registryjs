import terser from '@rollup/plugin-terser';

export default [
  // UMD build (for browsers, global window.Registry)
  {
    input: 'src/index.js',
    output: {
      name: 'Registry',
      file: 'dist/registry.js',
      format: 'umd',
      exports: 'default'
    }
  },
  // Minified UMD build (for CDN)
  {
    input: 'src/index.js',
    output: {
      name: 'Registry',
      file: 'dist/registry.min.js',
      format: 'umd',
      exports: 'default'
    },
    plugins: [terser()]
  },
  // ESM build (for modern bundlers)
  {
    input: 'src/index.js',
    output: {
      file: 'dist/registry.esm.js',
      format: 'es',
      exports: 'default'
    }
  }
];
