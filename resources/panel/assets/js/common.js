var I18N = {};
var _ = function (str, ...data) {
    if (I18N[str]) str = I18N[str];
    let idx = -1;
    return str.replace(/\%\@/gi, function () {
        idx++;
        return data[idx];
    });
}

function loadLanguage(obj) {
    if (obj && obj instanceof Object) I18N = obj;
}

function onInitOK() {
    $(document)
        .on('contextmenu', function (event) {
            return false;
        })
        .keypress(function (event) {
            var eventObj = event || e,
                keyCode = eventObj.keyCode || eventObj.which;

            if (keyCode == 13) {
                event.stopPropagation();
                $('#submit:not(:disabled)').click();
                return false;
            }
        });
}

function lookupItemInput(x, y) {
    var elem = document.elementFromPoint(x, y);
    $(elem).click();
}

function showError(error) {
    if (error instanceof Error) {
        $('html').html(`
        <body style="-webkit-user-select:auto; padding:10px; background:#333; color:white; word-wrap:break-word; word-break:break-all;">
            <p>
            ${error.name}: ${error.message}
            </p>
            <p></p>
            <p>
            ${parseStack(error.stack)}
            </p>
        </body>
        `);
    } else {
        $('html').html(`
        <body style="-webkit-user-select:auto; padding:10px; background:#333; color:white; word-wrap:break-word; word-break:break-all;">
            <p>
            ${JSON.stringify(error)}
            </p>
        </body>
        `);
    }

    function parseStack(stack) {
        return stack.split('\n')
            .map(line => parseStackLine(line))
            .map(line => `${line}<br/>`)
            .join('\n');
    }

    function parseStackLine(line) {
        let hasFnName = line.indexOf('@') >= 0;
        return line.replace(/@?file:\/\/.+\//, hasFnName ? '@' : '');
    }
}