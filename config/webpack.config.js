const nodeExternals = require('webpack-node-externals');
const GeneratePackageJsonPlugin = require('generate-package-json-webpack-plugin');
const path = require('path');

const rootDir = path.resolve(__dirname, "..");
const srcDir = path.resolve(rootDir, "src");

const basePackageValues = {
    "name": "crawl",
    "version": "1.0.0",
    "main": "./index.js",
    "dependencies": []
}

module.exports = {
    entry: path.resolve(srcDir, 'function.ts'),
    target: 'node',
    externals: [nodeExternals()],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            configFile: path.resolve(rootDir, 'tsconfig.json')
                        }
                    }
                ]
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.sql', '.wasm', '.mjs', '.js', '.json'],
    },
    plugins: [
        new GeneratePackageJsonPlugin(basePackageValues, path.resolve(rootDir, "package.json"))
    ],
    output: {
        filename: 'index.js',
        path: path.resolve(rootDir, 'dist'),
    },
};
