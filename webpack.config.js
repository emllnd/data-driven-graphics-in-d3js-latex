const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    mode: 'development',
    entry: {
        main: './src/index.ts',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node-modules/
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'd3v6-ts-playground',
            filename: 'index.html',
            chunks: ['main']
        }),
        new CopyWebpackPlugin({
        patterns: [
                { from: "data_files", to: "data_files" },
            ],
        }),
    ],
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './dist'
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    }
}