import { getEventTarget } from "./helper";
import { configs } from "../configs";
import { screen, layers, notes } from "../render/helper";
import { zoom } from "../render/zoom";
import { hideDistance } from "./distance";

export function zoomEvents() {
    let zoomer = document.querySelector('#zoom') as HTMLElement;
    zoomer.addEventListener('click', event => {
        let target = getEventTarget(zoomer, event, '.zoom-in:not(disabled), .zoom-out:not(disabled)');
        if (!target) return;
        if (target.classList.contains('zoom-in')) {
            configs.zoom -= .25;
        } else {
            configs.zoom += .25;
        }
        zoomRender();
        event.stopPropagation();
    });
}

export function zoomRender() {
    configs.targetIndex = undefined;
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