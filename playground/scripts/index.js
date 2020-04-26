process.chdir(__dirname);
const child_process = require('child_process');
const webpack = require('webpack');
const uglifyjs = require('uglify-js2');
const compiler = webpack({
    mode: 'development',
    entry: {
        index: '../index.ts',
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            loader: 'ts-loader',
            options: {
                configFile: "playground.tsconfig.json"
            },
            exclude: /node_modules/
        }]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    output: {
        path: __dirname,
        filename: '[name]_bundle.js',
    },
});
const outputFileSystem = new webpack.MemoryOutputFileSystem()
compiler.outputFileSystem = outputFileSystem;
compiler.run((err, stats) => {
    let content = outputFileSystem.readFileSync(__dirname + '/index_bundle.js').toString();
    content = uglifyjs.minify(content, {
        mangle: false,
        fromString: true,
    }).code;
    let returns = child_process.spawnSync('sh', [
        __dirname + '/sketchRunScript.sh',
        encodeURIComponent(content)
    ]);
    if (returns.stdout && returns.stdout.length) {
        console.log(returns.stdout.toString());
    }
});