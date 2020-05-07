import { state } from "../common";
import { timestamp } from "../common";
import { zoomSize } from "./helper";

export function screen() {
    let imageData = (state.current.imageBase64) ? state.current.imageBase64 : state.current.imagePath + '?' + timestamp;
    let screen = document.querySelector('#screen') as HTMLElement;
    if (!state.maxSize) {
        let screenSize = (state.current.width > state.current.height) ?
            state.current.width :
            state.current.height;
        let viewer = document.querySelector('.screen-viewer');
        let artboardSize = (viewer.clientWidth > viewer.clientHeight) ?
            viewer.clientWidth :
            viewer.clientHeight;
        state.maxSize = (screenSize > artboardSize) ? screenSize * 5 : artboardSize * 5;
        screen.parentElement.style.width = state.maxSize + 'px';
        screen.parentElement.style.height = state.maxSize + 'px';
        let scrollMaxX = state.maxSize - viewer.clientWidth;
        let scrollMaxY = state.maxSize - viewer.clientHeight;
        let scrollLeft = .5 * scrollMaxX;
        let scrollTop = .5 * scrollMaxY;
        viewer.scrollLeft = scrollLeft;
        viewer.scrollTop = scrollTop;
    }
    screen.style.width = zoomSize(state.current.width) + 'px';
    screen.style.height = zoomSize(state.current.height) + 'px';
    screen.style.background = '#FFF url(' + imageData + ') no-repeat';
    screen.style.backgroundSize = zoomSize(state.current.width) + 'px ' + zoomSize(state.current.height) + 'px';
    screen.style.marginLeft = -zoomSize(state.current.width / 2) + 'px';
    screen.style.marginTop = -zoomSize(state.current.height / 2) + 'px';
}
