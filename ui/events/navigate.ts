import { project, state, localize } from "../common";
import { hideDistance } from "./distance";
import { layers, MapArtboardIDToIndex } from "../render/layers";
import { notes } from "../render/notes";
import { message } from "../render/helper";
import { updateScreen } from "../render/screen";

export function gotoArtboard(para: number | string): void {
    let index: number;
    if (typeof para == 'number') {
        index = para;
    } else {
        index = MapArtboardIDToIndex[para];
        if (index < 0) {
            message(localize('Target artboard not exported.'));
            return;
        }
    }
    if (state.artboardIndex == index) return;
    // clear flows animation before switch
    let flows = document.querySelector('#flows') as HTMLDivElement;
    flows.classList.remove('show-flows');
    state.maxSize = undefined;
    state.artboardIndex = index;
    state.selectedIndex = undefined;
    state.current = project.artboards[state.artboardIndex];
    hideDistance();
    updateScreen();
    layers();
    notes();
    document.querySelector('.active')?.classList.remove('active');
    document.querySelector('#artboard-' + index)?.classList.add('active');
    let hash = '#' + state.artboardIndex;
    if (window.location.hash != hash) window.location.hash = hash;
}

export function navigateByURLHash() {
    gotoArtboard(getIndexFromHash());
}

function getIndexFromHash(): number {
    let hash = window.location.hash;
    if (!hash) return 0;
    let indexStr = hash.substring(1);
    let idx = Number(indexStr);
    if (isNaN(idx)) return 0;
    return idx;
}
