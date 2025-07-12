import terser from '@rollup/plugin-terser';

export default [
  // UMD build (for browsers, global window.Registry)
  {
    input: 'Registry.js',
    output: {
      name: 'Registry',
      file: 'dist/registry.js',
      format: 'umd',
      exports: 'named'
    }
  },
  // Minified UMD build (for CDN)
  {
    input: 'Registry.js',
    output: {
      name: 'Registry',
      file: 'dist/registry.min.js',
      format: 'umd',
      exports: 'named'
    },
    plugins: [terser()]
  },
  // ESM build (for modern bundlers)
  {
    input: 'Registry.js',
    output: {
      file: 'dist/registry.esm.js',
      format: 'es',
      exports: 'named'
    }
  }
];
