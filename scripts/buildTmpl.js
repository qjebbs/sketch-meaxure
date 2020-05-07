'use strict';
let path = require('path');
let process = require('process');
let skpmConfig = require('../package.json').skpm;
const webpack = require('webpack');

const compiler = webpack(getUIConfig({}));
compiler.run((err, stats) => {
    if (stats.hasErrors()) {
        throw new Error(stats.toJson().errors);
    }
});

function getCommonConfig() {
    let debug = !!process.env.DEBUG;
    return {
        mode: debug ? 'development' : 'production',
        devtool: debug ? 'source-map' : undefined,
        module: {
            rules: [{
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }]
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js']
        }
    }
}

function getUIConfig(config) {
    return Object.assign(getCommonConfig({}), {
        name: "index",
        entry: {
            index: './ui/index.ts',
        },
        output: {
            path: path.resolve(skpmConfig.main, 'Contents', 'Resources', 'assets'),
            filename: "index.js"
        },
    });
}