import { configs } from "../configs";
export function zoom() {
    var zoomText = configs.zoom * 100 + '%', inDisabled = (configs.zoom <= .25) ? ' disabled="disabled"' : '', outDisabled = (configs.zoom >= 4) ? ' disabled="disabled"' : '';
    document.querySelector('#zoom').innerHTML = [
        '<button class="zoom-in"' + inDisabled + '></button>',
        '<label class="zoom-text">' + zoomText + '</label>',
        '<button class="zoom-out"' + outDisabled + '></button>'
    ].join('');
}
