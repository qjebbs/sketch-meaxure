import { state } from "../common";
import { updateScreen } from "../render/screen";
import { layers } from "../render/layers";
import { notes } from "../render/notes";
import { zoom as updateZoomControls } from "../render/zoom";
import { hideDistance } from "./distance";
import { eventDelegate } from "./delegate";
import { alignElement, Edge } from "./alignElement";

export function zoomEvents() {
    let zoomer = document.querySelector('#zoom') as HTMLElement;
    eventDelegate(zoomer, 'click', '.zoom-in:not(disabled), .zoom-out:not(disabled)', function (event) {
        if (this.classList.contains('zoom-in')) {
            zoomRender(state.zoom - .25);
        } else {
            zoomRender(state.zoom + .25);
        }
        event.stopPropagation();
    });
}

export function zoomRender(val: number) {
    state.targetIndex = undefined;
    (document.querySelector('#rulers') as HTMLElement).style.display = 'none';
    hideDistance();
    let viewer = document.querySelector('.screen-viewer') as HTMLDivElement;
    let screen = document.querySelector('#screen') as HTMLDivElement;
    let currentRect = screen.getBoundingClientRect();
    let screenPoint = screenPointOnViewerCenter(viewer, screen);
    let screenPoint2 = <Point>{
        x: screenPoint.x * val / state.zoom,
        y: screenPoint.y * val / state.zoom,
    };
    state.zoom = val;
    updateZoomControls();
    updateScreen();
    alignElement({
        scroller: viewer,
        target: screen,
        toRect: currentRect,
        fromEdge: Edge.hleft | Edge.vtop,
        toEdge: Edge.hleft | Edge.vtop,
    })
    viewer.scrollLeft += screenPoint2.x - screenPoint.x;
    viewer.scrollTop += screenPoint2.y - screenPoint.y;
    document.querySelectorAll('#layers, #notes').forEach(e => e.innerHTML = '');
    setTimeout(function () {
        layers();
        notes();
    }, 150);
}

interface Point {
    x: number,
    y: number,
}

function screenPointOnViewerCenter(viewer: HTMLDivElement, screen: HTMLDivElement): Point {
    let viewerRect = viewer.getBoundingClientRect();
    let screenRect = screen.getBoundingClientRect();
    let viewerCenter = <Point>{
        x: viewerRect.x + viewerRect.width / 2,
        y: viewerRect.y + viewerRect.height / 2,
    }
    return {
        x: viewerCenter.x - screenRect.x,
        y: viewerCenter.y - screenRect.y,
    }
}