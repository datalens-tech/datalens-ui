const path = require('path');

module.exports = {
    entry: './src/server/components/charts-engine/components/processor/isolated-sandbox/interop/bundled-libs.ts',
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    experiments: {
        outputModule: true,
    },
    output: {
        filename: 'bundled-libs.js',
        path: path.resolve(__dirname, 'ce-dist'),
        chunkFormat: 'commonjs',
        module: true,
        library: {
            name: 'dist',
            type: 'commonjs',
        },
    },
};
