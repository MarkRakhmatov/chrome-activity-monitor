const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const filename = ext => `[name].${ext}`;

module.exports = {
    entry: {
        popup: './src/js/popup.ts',
        background: './src/js/background.ts',
        modal: './src/js/modal.ts',
        options: './src/js/options.ts'
    },
    module: {
        rules: [{test: /\.ts?$/, use: 'ts-loader', exclude: /node_modules/},
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader']
            },],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [
        new CleanWebpackPlugin({cleanStaleWebpackAssets: false}),
        new HtmlWebpackPlugin({template: 'src/popup.html'}),
        new HtmlWebpackPlugin({template: 'src/options.html'}),
        new CopyWebpackPlugin({
            patterns: [
                {from: './src/manifest.json'},
                {from: './src/img/icon16.png'},
                {from: './src/img/icon32.png'},
                {from: './src/img/icon48.png'},
                {from: './src/img/icon128.png'},
            ],
        }),
        new MiniCssExtractPlugin({
            filename: filename('css')
        })
    ],
    output: {filename: '[name].js', path: path.resolve(__dirname, 'dist')},
};
