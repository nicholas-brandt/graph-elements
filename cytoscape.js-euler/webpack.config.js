import path from 'path';
import pkg from './package.json' with { type: "json" };

const url = new URL(import.meta.url);

let config = {
    devtool: 'inline-source-map',
    entry: './src/index.js',
    output: {
        path: path.dirname(url.pathname),
        filename: pkg.name + '.js',
        library: {
            type: 'module'
        }
    },
    experiments: {
        outputModule: true
    }
};
export default config;
