import { state } from "../common";

export function zoomSize(size: number) {
    return size * state.zoom;
}

export function percentageSize(size: number, size2: number) {
    return (Math.round(size / size2 * 1000) / 10) + "%";
}

export function unitSize(length: number, isText?: boolean) {
    length = Math.round(length / state.scale * 100) / 100;
    let units = state.unit.split("/");
    let unit = units[0];
    if (units.length > 1 && isText) {
        unit = units[1];
    }
    return length + unit;
}

export function locationHash(options) {
    if (options) {
        var objHash = {},
            arrHash = [];
        Object.keys(options).forEach(key => {
            let value = options[key];
            if (/[a-z]+/.test(key) && !isNaN(value)) {
                objHash[key] = parseInt(value);
                arrHash.push(key + value);
            }
        });
        window.history.replaceState(undefined, undefined, '#' + arrHash.join('-'));
        return objHash;
    } else {
        var objHash = {},
            hash = window.location.hash.replace(/[\#\-]([a-z]+)([\d]+)/ig, function (match, key, value) {
                objHash[key] = parseInt(value);
                return '';
            });
        return objHash;
    }
}

let msgTimeout;
export function message(msg) {
    let message = document.querySelector('#message') as HTMLDivElement;
    message.innerText = msg;
    message.style.display = 'inherit';
    if (msgTimeout) {
        clearTimeout(msgTimeout);
        msgTimeout = undefined;
    }
    msgTimeout = setTimeout(() => message.style.display = 'none', 1000);
}