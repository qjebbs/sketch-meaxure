import { getEventTargetFromSelector } from "./helper";
import { configs } from "../configs";
import { layers } from "../render/helper";
import { inspector } from "../render/inspector";
import { slices } from "../render/slices";


export function unitEvents() {
    let unit = document.querySelector('#unit') as HTMLElement;
    unit.addEventListener('change', event => {
        let target = getEventTargetFromSelector(event, 'input[name=resolution]');
        if (!target) return;
        let checked = unit.querySelector('input[name=resolution]:checked') as HTMLElement;
        configs.unit = checked.dataset.unit;
        configs.scale = Number(checked.dataset.scale);
        layers();
        inspector();
        unit.blur();
        unit.querySelector('p').innerText = checked.dataset.name;
        slices();
    })
    unit.addEventListener('click', event => {
        let target = getEventTargetFromSelector(event, 'h3, .overlay');
        if (!target) return;
        unit.blur();
    });
}