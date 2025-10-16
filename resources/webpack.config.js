const path = require('path');

module.exports = {
    mode: 'production',
    entry: path.resolve(__dirname, 'src', 'project.js'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'project.packed.js',
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                        presets: [
                            '@babel/preset-env'
                        ]
                    }
                }
            }
        ]
    },
    resolve: {
        extensions: ['.js']
    },
    devtool: 'source-map'
};