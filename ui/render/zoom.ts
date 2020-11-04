import { state } from "../common";
export function zoom() {
    var zoomText = state.zoom * 100 + '%', inDisabled = (state.zoom <= .25) ? ' disabled="disabled"' : '', outDisabled = (state.zoom >= 4) ? ' disabled="disabled"' : '';
    document.querySelector('#zoom').innerHTML = [
        '<button class="zoom-in"' + inDisabled + '></button>',
        '<label class="zoom-text">' + zoomText + '</label>',
        '<button class="zoom-out"' + outDisabled + '></button>'
    ].join('');
}
