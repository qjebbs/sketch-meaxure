import { clickElement } from "../helper";
import { state } from "../../common";
import { zoomRender } from "../zoom";

export function keyboardZoomEvents() {
    window.addEventListener('keydown', event => {
        // control or command key
        if (!event.ctrlKey && !event.metaKey) return;
        switch (event.which) {
            case 187:
                if (state.zoom < 4) clickElement(
                    document.querySelector('.zoom-out')
                );
                event.preventDefault();
                return false;
            case 189:
                if (state.zoom > .25) clickElement(
                    document.querySelector('.zoom-in')
                );
                event.preventDefault();
                return false;
            case 48:
                zoomRender(1);
                event.preventDefault();
                return false;
            default:
                break;
        }
    });
}