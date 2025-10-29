const path = require('path');

module.exports = {
    mode: 'production',
    optimization: {
        minimize: false
    },
    entry: path.resolve(__dirname, 'src', 'project.js'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'project.js',
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
                            ['@babel/preset-env', { modules: 'commonjs',
                                "targets": {
                                    "node": "current"
                                }
                             }]
                        ]
                    }
                }
            }
        ]
    },
    resolve: {
        extensions: ['.js']
    },
    devtool: 'source-map',
};