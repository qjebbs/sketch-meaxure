import { getEventTarget } from "./helper";
import { state } from "../common";
import { layers } from "../render/layers";
import { inspector } from "../render/inspector";
import { slices } from "../render/slices";


export function unitEvents() {
    let unit = document.querySelector('#unit') as HTMLElement;
    unit.addEventListener('change', event => {
        let target = getEventTarget(unit, event, 'input[name=resolution]');
        if (!target) return;
        let checked = unit.querySelector('input[name=resolution]:checked') as HTMLElement;
        state.unit = checked.dataset.unit;
        state.scale = Number(checked.dataset.scale);
        layers();
        inspector();
        unit.blur();
        unit.querySelector('p').innerText = checked.dataset.name;
        slices();
    })
    unit.addEventListener('click', event => {
        let target = getEventTarget(unit, event, 'h3, .overlay');
        if (!target) return;
        unit.blur();
    });
}