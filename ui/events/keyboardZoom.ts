import { clickElement } from "./helper";
import { configs } from "../configs";
import { zoomRender } from "./zoom";

export function keyboardZoomEvents() {
    window.addEventListener('keydown', event => {
        // control or command key
        if (!event.ctrlKey && !event.metaKey) return;
        switch (event.which) {
            case 187:
                if (configs.zoom < 4) clickElement(
                    document.querySelector('.zoom-out')
                );
                event.preventDefault();
                return false;
            case 189:
                if (configs.zoom > .25) clickElement(
                    document.querySelector('.zoom-in')
                );
                event.preventDefault();
                return false;
            case 48:
                configs.maxSize = undefined;
                configs.zoom = 1;
                zoomRender();
                event.preventDefault();
                return false;
            default:
                break;
        }
    });
}