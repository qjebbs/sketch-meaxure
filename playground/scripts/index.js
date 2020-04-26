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
console.log(new Date().toLocaleString() + ' Compiling...');
const outputFileSystem = new webpack.MemoryOutputFileSystem()
compiler.outputFileSystem = outputFileSystem;
compiler.run((err, stats) => {
    let content = outputFileSystem.readFileSync(__dirname + '/index_bundle.js').toString();
    console.log(new Date().toLocaleString() + ' Minifying script...');
    content = uglifyjs.minify(content, {
        mangle: {
            debug: ''
        },
        fromString: true,
    }).code;
    console.log(new Date().toLocaleString() + ' Running...');
    let returns = child_process.spawnSync('sh', [
        __dirname + '/sketchRunScript.sh',
        encodeURIComponent(content)
    ]);
    if (returns.stdout && returns.stdout.length) {
        console.log(new Date().toLocaleString() + ' Done with output:');
        console.log(indent(returns.stdout.toString(), 2));
    } else {
        console.log(new Date().toLocaleString() + ' Done.');
    }
});

function indent(content, indentCount) {
    return content.split('\n')
        .map(line => ' '.repeat(indentCount) + line)
        .join('\n');
}