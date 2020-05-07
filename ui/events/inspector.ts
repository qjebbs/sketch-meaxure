import { getEventTarget } from "./helper";
import { state } from "../common";
import { colors } from "../render/colors";

export function inspectorEvents() {
    let formats = ['color-hex', 'argb-hex', 'css-rgba', 'ui-color'];
    let inspector = document.querySelector('#inspector') as HTMLElement;
    inspector.addEventListener('click', event => {
        let target = getEventTarget(inspector, event, '.color label');
        if (!target) return;
        let current = formats.indexOf(state.colorFormat)
        let next = (current + 1) % formats.length;
        state.colorFormat = formats[next];
        document.querySelectorAll('.color input').forEach((i: HTMLInputElement) => {
            let colors = JSON.parse(decodeURI(i.dataset.color));
            i.value = colors[state.colorFormat];
        })
        colors();
    });
    inspector.addEventListener('dblclick', event => {
        let target = getEventTarget(inspector, event, 'input, textarea') as HTMLInputElement;
        if (!target) return;
        target.select();
    });
}
