const child_process = require('child_process');
const webpack = require('webpack');
const CORE_MODULES = [
    'buffer',
    'console',
    'events',
    'os',
    'path',
    'process',
    'querystring',
    'stream',
    'string_decoder',
    'timers',
    'util',
]
const compiler = webpack({
    mode: 'production',
    entry: {
        index: './src/playground/index.ts',
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            loader: 'ts-loader',
            // options: {
            //     configFile: "playground.tsconfig.json"
            // },
            exclude: /node_modules/
        }]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    externals: [
        (context, request, callback) => {
            // sketch API
            if (/^sketch\//.test(request) || request === 'sketch') {
                return callback(null, `commonjs ${request}`)
            }
            // core modules shipped in Sketch
            if (CORE_MODULES.indexOf(request) !== -1) {
                return callback(null, `commonjs ${request}`)
            }
            return callback()
        },
    ],
    output: {
        path: __dirname,
        filename: '[name]_bundle.js',
        library: 'e',
    },
});
console.log(new Date().toLocaleString() + ' Compiling...');
const outputFileSystem = new webpack.MemoryOutputFileSystem()
compiler.outputFileSystem = outputFileSystem;
compiler.run((err, stats) => {
    if (stats.hasErrors()) {
        console.log(stats.toJson().errors)
        return;
    }
    let content = outputFileSystem.readFileSync(__dirname + '/index_bundle.js').toString();
    content = `(function(){${content};return e})()`;
    // console.log(content)
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