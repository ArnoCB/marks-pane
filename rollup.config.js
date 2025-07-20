import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/marks.ts',
  output: [
    {
      file: 'dist/marks-pane.umd.js',
      format: 'umd',
      name: 'MarksPane',
      sourcemap: true,
    },
    {
      file: 'dist/marks-pane.esm.js',
      format: 'esm',
      sourcemap: true,
    }
  ],
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript({ tsconfig: './tsconfig.rollup.json' })
  ]
};
