import { getEventTarget } from "./helper";
import { state } from "../common";
import { screen } from "../render/screen";
import { layers } from "../render/layers";
import { notes } from "../render/notes";
import { zoom } from "../render/zoom";
import { hideDistance } from "./distance";

export function zoomEvents() {
    let zoomer = document.querySelector('#zoom') as HTMLElement;
    zoomer.addEventListener('click', event => {
        let target = getEventTarget(zoomer, event, '.zoom-in:not(disabled), .zoom-out:not(disabled)');
        if (!target) return;
        if (target.classList.contains('zoom-in')) {
            state.zoom -= .25;
        } else {
            state.zoom += .25;
        }
        zoomRender();
        event.stopPropagation();
    });
}

export function zoomRender() {
    state.targetIndex = undefined;
    (document.querySelector('#rulers') as HTMLElement).style.display = 'none';
    hideDistance();
    zoom();
    screen();
    document.querySelectorAll('#layers, #notes').forEach(e => e.innerHTML = '');
    setTimeout(function () {
        layers();
        notes();
    }, 150);
}