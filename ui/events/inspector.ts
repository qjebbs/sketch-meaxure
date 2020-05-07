import { getEventTargetFromSelector } from "./helper";
import { configs } from "../configs";
import { colors } from "../render/helper";

export function inspectorEvents() {
    let formats = ['color-hex', 'argb-hex', 'css-rgba', 'ui-color'];
    let inspector = document.querySelector('#inspector') as HTMLElement;
    inspector.addEventListener('click', event => {
        let target = getEventTargetFromSelector(event, '.color label');
        if (!target) return;
        let current = formats.indexOf(configs.colorFormat)
        let next = (current + 1) % formats.length;
        configs.colorFormat = formats[next];
        // changeColorFormat();
        var self = this;
        document.querySelectorAll('.color input').forEach((i: HTMLInputElement) => {
            let colors = JSON.parse(decodeURI(i.dataset.color));
            i.value = colors[configs.colorFormat];
        })
        colors();
    });
    inspector.addEventListener('dblclick', event => {
        let target = getEventTargetFromSelector(event, 'input, textarea') as HTMLInputElement;
        if (!target) return;
        target.select();
    });
}
