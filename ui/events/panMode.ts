import { mouseoutLayer } from "./helper";
import { hideDistance } from "./distance";

export var panMode = false;
export function panModeEvents() {
    let moving = false;
    let moveData;
    window.addEventListener('keydown', event => {
        if (event.which !== 32) return;
        document.getElementById('cursor').style.display = '';
        document.querySelector('.screen-viewer').classList.add('moving-screen');
        mouseoutLayer();
        hideDistance();
        panMode = true;
        event.preventDefault();
    });
    window.addEventListener('keyup', event => {
        if (event.which !== 32) return;
        document.getElementById('cursor').style.display = 'none';
        document.getElementById('cursor').classList.remove('moving');
        document.querySelector('.screen-viewer').classList.remove('moving-screen');
        panMode = false;
        moving = false;
        event.preventDefault();
    });
    window.addEventListener('mousemove', event => {
        let cursor = document.getElementById('cursor');
        cursor.style.left = event.clientX + 'px';
        cursor.style.top = event.clientY + 'px';
        if (!moving) return;
        let viewer = document.querySelector('.screen-viewer');
        viewer.scrollLeft = (moveData.x - event.clientX) + moveData.scrollLeft;
        viewer.scrollTop = (moveData.y - event.clientY) + moveData.scrollTop;
        event.preventDefault();
    });
    window.addEventListener('mousedown', event => {
        if (!panMode) return;
        let cursor = document.getElementById('cursor');
        let viewer = document.querySelector('.screen-viewer');
        cursor.classList.add('moving');
        moveData = {
            x: event.clientX,
            y: event.clientY,
            scrollLeft: viewer.scrollLeft,
            scrollTop: viewer.scrollTop,
        }
        moving = true;
        event.preventDefault();
    });
    window.addEventListener('mouseup', event => {
        if (!panMode || !moving) return;
        let cursor = document.getElementById('cursor');
        let viewer = document.querySelector('.screen-viewer');
        viewer.classList.remove('moving-screen');
        cursor.classList.remove('moving');
        moving = false;
        event.preventDefault();
    });
}
