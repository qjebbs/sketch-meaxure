import { configs } from "../configs";
import { getIndex, mouseoutLayer, selectedLayer, removeSelected, getEventTargetFromSelector } from "./helper";
import { inspector } from "../render/inspector";
import { distance, hideDistance } from "./distance";
import { mouseoverLayer } from "./mouseoverLayer";
import { SMRect } from "../../src/meaxure/interfaces";

export function layerEvents() {
    document.body.addEventListener('click', function (event) {
        let target = event.target as HTMLElement;
        if (getEventTargetFromSelector(event, 'header, #inspector, .navbar')) {
            event.stopPropagation();
            return;
        }
        if (document.querySelector('.screen-viewer').classList.contains('moving-screen')) {
            return;
        }
        if (target.classList.contains('layer') || target.classList.contains('slice-layer')) {
            var selected = (!target.classList.contains('slice-layer')) ?
                target :
                document.querySelector('.layer-' + target.attributes['data-objectid']) as HTMLElement;
            configs.selectedIndex = getIndex(selected);
            hideDistance();
            mouseoutLayer();
            selectedLayer();
            inspector();
            return;
        }
        removeSelected();
        hideDistance();
        document.querySelector('#inspector').classList.remove('active');
        configs.selectedIndex = undefined;
        configs.tempTargetRect = undefined;
    });
    document.body.addEventListener('mousemove', function (event) {
        if (document.querySelector('.screen-viewer').classList.contains('moving-screen'))
            return;
        mouseoutLayer();
        hideDistance();
        let target = event.target as HTMLElement;
        if (target.classList.contains('screen-viewer') || target.classList.contains('screen-viewer-inner')) {
            configs.tempTargetRect = getEdgeRect(event);
            configs.targetIndex = undefined;
            distance();
        } else if (target.classList.contains('layer')) {
            configs.targetIndex = getIndex(event.target as HTMLElement);
            configs.tempTargetRect = undefined;
            mouseoverLayer();
            distance();
        } else {
            configs.tempTargetRect = undefined;
        }
    });
}

function getEdgeRect(event: MouseEvent): SMRect {
    let screen = document.querySelector('#screen') as HTMLElement;
    let rect = screen.getBoundingClientRect();
    let x = (event.pageX - rect.left) / configs.zoom;
    let y = (event.pageY - rect.top) / configs.zoom;
    let width = 10;
    let height = 10;
    let xScope = (x >= 0 && x <= configs.current.width);
    let yScope = (y >= 0 && y <= configs.current.height);
    // left and top
    if (x <= 0 && y <= 0) {
        x = -10;
        y = -10;
    }
    // right and top
    else if (x >= configs.current.width && y <= 0) {
        x = configs.current.width;
        y = -10;
    }
    // right and bottom
    else if (x >= configs.current.width && y >= configs.current.height) {
        x = configs.current.width;
        y = configs.current.height;
    }
    // left and bottom
    else if (x <= 0 && y >= configs.current.height) {
        x = -10;
        y = configs.current.height;
    }
    // top
    else if (y <= 0 && xScope) {
        x = 0;
        y = -10;
        width = configs.current.width;
    }
    // right
    else if (x >= configs.current.width && yScope) {
        x = configs.current.width;
        y = 0;
        height = configs.current.height;
    }
    // bottom
    else if (y >= configs.current.height && xScope) {
        x = 0;
        y = configs.current.height;
        width = configs.current.width;
    }
    // left
    else if (x <= 0 && yScope) {
        x = -10;
        y = 0;
        height = configs.current.height;
    }
    if (xScope && yScope) {
        x = 0;
        y = 0;
        width = configs.current.width;
        height = configs.current.height;
    }
    return {
        x: x,
        y: y,
        width: width,
        height: height,
    }
}