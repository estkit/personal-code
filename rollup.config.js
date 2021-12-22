import typescript from '@rollup/plugin-typescript';
import dts from "rollup-plugin-dts";
import pkg from './package.json';

const entry = ["src/index.ts"];

// https://rollupjs.org/guide/en/#configuration-files
export default [
    {
        input: entry,
        plugins: [typescript()],
        output: [
            { file: pkg.module, format: 'esm', sourcemap: true },
            { file: pkg.main, format: "cjs", sourcemap: true },
            { file: pkg.browser, format: "umd", sourcemap: true, name: "EstonianPersonalCode", exports: "named" }
        ]
    },
    {
        input: entry,
        plugins: [dts()],
        output: [{ file: pkg.types, format: "es" }]
    }
];