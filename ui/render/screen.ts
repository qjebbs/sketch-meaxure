import { state } from "../common";
import { timestamp } from "../common";
import { zoomSize } from "./helper";
import { flowMode } from "../events/flow";

export function updateScreen() {
    let imageData = (state.current.imageBase64) ? state.current.imageBase64 : state.current.imagePath + '?' + timestamp;
    let screen = document.querySelector('#screen') as HTMLElement;
    let viewerInner = screen.parentElement;
    screen.style.width = zoomSize(state.current.width) + 'px';
    screen.style.height = zoomSize(state.current.height) + 'px';
    screen.style.background = '#FFF url(' + imageData + ') no-repeat';
    screen.style.backgroundSize = zoomSize(state.current.width) + 'px ' + zoomSize(state.current.height) + 'px';
    if (flowMode) {
        viewerInner.style.width = zoomSize(state.current.width) + 'px';
        viewerInner.style.height = zoomSize(state.current.height) + 'px';
        screen.style.marginLeft = -zoomSize(state.current.width / 2) + 'px';
        screen.style.marginTop = -zoomSize(state.current.height / 2) + 'px';
        screen.style.marginLeft = '0';
        screen.style.marginTop = '0';
        document.querySelector('.screen-viewer').scrollTop = 0;
        return;
    }
    if (!state.maxSize) {
        // reset screen
        let screenSize = (state.current.width > state.current.height) ?
            state.current.width :
            state.current.height;
        let viewer = document.querySelector('.screen-viewer');
        let artboardSize = (viewer.clientWidth > viewer.clientHeight) ?
            viewer.clientWidth :
            viewer.clientHeight;
        state.maxSize = (screenSize > artboardSize) ? screenSize * 5 : artboardSize * 5;
        viewerInner.style.width = state.maxSize + 'px';
        viewerInner.style.height = state.maxSize + 'px';
        let scrollMaxX = state.maxSize - viewer.clientWidth;
        let scrollMaxY = state.maxSize - viewer.clientHeight;
        let scrollLeft = .5 * scrollMaxX;
        let scrollTop = .5 * scrollMaxY;
        viewer.scrollLeft = scrollLeft;
        viewer.scrollTop = scrollTop;
    }
    screen.style.marginLeft = -zoomSize(state.current.width / 2) + 'px';
    screen.style.marginTop = -zoomSize(state.current.height / 2) + 'px';
}
