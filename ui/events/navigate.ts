import { project, state, localize } from "../common";
import { layers, MapArtboardIDToIndex } from "../render/layers";
import { notes } from "../render/notes";
import { message } from "../render/helper";
import { updateScreen } from "../render/screen";
import { flowMode, setFlowMode } from "./flow";
import { removeSelected } from "./helper";
import { setShouldBackToAnother } from "./hashChange";

export function gotoArtboard(para: number | string, updateHash: boolean = true): void {
    setShouldBackToAnother(false);
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
    removeSelected();
    state.artboardIndex = index;
    state.selectedIndex = undefined;
    state.current = project.artboards[state.artboardIndex];
    updateScreen(true);
    layers();
    notes();
    document.querySelectorAll('.active').forEach(e => e.classList.remove('active'));
    document.querySelector('#artboard-' + index)?.classList.add('active');
    document.querySelector('#startpoint-' + index)?.classList.add('active');
    if (updateHash) updateURLHash();
    document.title = state.current.name + ' - Sketch MeaXure';
}

export function navigateByURLHash(updateHash: boolean = true) {
    let setting = parseURLHash();
    gotoArtboard(setting.artboardIndex, false);
    if (flowMode !== setting.flowMode) {
        setFlowMode(setting.flowMode)
    }
    if (updateHash) updateURLHash();
}

export function updateURLHash() {
    let hash = getURLHash();
    if (window.location.hash == hash) return;
    window.location.hash = hash;
}

export function historyBackUntilAnotherArtboard() {
    setShouldBackToAnother(true);
    history.back();
}

export function getURLHash(): string {
    return `#${flowMode ? 'p' : 's'}${state.artboardIndex}`;
}

export function parseURLHash() {
    let result = {
        flowMode: false,
        artboardIndex: 0,
    }
    /**
     *  #<s|p>[index]  
      s: specification mode  
      p: prototype mode  
      index: artboard index
     */
    let hash = window.location.hash;
    result.flowMode = hash.substr(1, 1) === 'p';
    result.artboardIndex = Number(hash.substr(2));
    if (isNaN(result.artboardIndex)) result.artboardIndex = 0;
    return result;
}
