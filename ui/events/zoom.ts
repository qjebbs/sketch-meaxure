import { state } from "../common";
import { updateScreen } from "../render/screen";
import { layers } from "../render/layers";
import { notes } from "../render/notes";
import { zoom } from "../render/zoom";
import { hideDistance } from "./distance";
import { eventDelegate } from "./delegate";
import { alignElement, Edge } from "./alignElement";

export function zoomEvents() {
    let zoomer = document.querySelector('#zoom') as HTMLElement;
    eventDelegate(zoomer, 'click', '.zoom-in:not(disabled), .zoom-out:not(disabled)', function (event) {
        if (this.classList.contains('zoom-in')) {
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
    let viewer = document.querySelector('.screen-viewer') as HTMLDivElement;
    let screen = document.querySelector('#screen') as HTMLDivElement;
    let currentRect = screen.getBoundingClientRect();
    zoom();
    updateScreen();
    alignElement({
        scroller: viewer,
        target: screen,
        toRect: currentRect,
        fromEdge: Edge.hleft | Edge.vtop,
        toEdge: Edge.hleft | Edge.vtop,
    })
    document.querySelectorAll('#layers, #notes').forEach(e => e.innerHTML = '');
    setTimeout(function () {
        layers();
        notes();
    }, 150);
}