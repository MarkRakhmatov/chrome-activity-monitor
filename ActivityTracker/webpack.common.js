const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const filename = ext => `[name].${ext}`;

module.exports = {
    entry: {
        popup: path.join(__dirname, './src/js/popup.ts'),
        background: path.join(__dirname, './src/js/background.ts'),
        modal: path.join(__dirname, './src/js/modal.ts'),
        options: path.join(__dirname, './src/js/options.ts')
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader']
            },
            {
                test: /\.(scss)$/,
                use: [{
                    loader: 'style-loader'
                }, {
                    loader: 'css-loader'
                }, {
                    loader: 'postcss-loader',
                    options: {
                        postcssOptions: {
                            plugins: function () {
                                return [
                                    require('autoprefixer')
                                ];
                            }
                        }
                    }
                }, {
                    loader: 'sass-loader'
                }]
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [
        new CleanWebpackPlugin({cleanStaleWebpackAssets: false}),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src', 'popup.html'),
            filename: 'popup.html',
            chunks: ['popup']
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src', 'options.html'),
            filename: 'options.html',
            chunks: ['options']
        }),
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
