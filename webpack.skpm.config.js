'use strict';
let fs = require('fs');
let path = require('path');
let process = require('process');
/**
 * Function that mutates original webpack config.
 * Supports asynchronous changes when promise is returned.
 *
 * @param {object} config - original webpack config.
 * @param {boolean} isPluginCommand - wether the config is for a plugin command or an asset
 **/
module.exports = function (config, isPluginCommand) {
    /** you can change config here **/
    if (!isPluginCommand) return;
    let debug = !!process.env.DEBUG;
    if (!debug) {
        let dir = 'sketch-meaxure.sketchplugin/Contents/Sketch';
        fs.readdirSync(dir).forEach(file => {
            if (file.endsWith('.js.map')) {
                console.log('remove js map file', file);
                fs.unlinkSync(path.resolve(dir, file));
            }
        })
    }
    config.mode = debug ? 'development' : 'production';
    config.entry = {
        mark: './src/index.ts',
    };
    config.module = {
        rules: [{
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/
        }]
    };
    config.resolve = {
        extensions: ['.tsx', '.ts', '.js']
    }
    // config.output = {
    //     path: path.resolve(__dirname, skpmConfig.main, 'Contents', 'Sketch'),
    //     filename: '[name]_bundle.js'
    // }
}