import external from 'rollup-plugin-auto-external';
import resolve from '@rollup/plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

const extensions = ['.js', '.jsx', '.ts'];

const coreConfig = {
  plugins: [
    external(),
    resolve({
      extensions,
    }),
    babel({
      extensions,
      exclude: /node_modules/,
    }),
    commonjs(),
    (process.env.NODE_ENV === 'production' && terser()),
  ],
  external: [
  ],
};

const cliConfig = (src) => ({
  input: src,
  output: {
    dir: 'bin',
    format: 'cjs',
    banner: '#!/usr/bin/env node',
  },
  ...coreConfig,
});

const config = (src, dist) => ({
  input: src,
  output: {
    file: dist,
    format: 'cjs',
  },
  ...coreConfig,
});

export default [
  cliConfig('lib/nuxtron.ts'),
  cliConfig('lib/nuxtron-init.ts'),
  cliConfig('lib/nuxtron-dev.ts'),
  cliConfig('lib/nuxtron-build.ts'),
  cliConfig('lib/nuxtron-list.ts'),
  config('lib/webpack/build.production.ts', 'bin/webpack/build.production.js'),
];