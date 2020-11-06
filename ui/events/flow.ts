import { gotoArtboard, updateURLHash, historyBackUntilAnotherArtboard } from "./navigate";
import { getEventTarget, removeSelected } from "./helper";
import { updateScreen } from "../render/screen";
import { hideNavBar } from "./tab";
import { alignElement, Edge } from "./alignElement";

export var flowMode = undefined;

export function flowEvents() {
    flowModeSwitchEvents();
    flowClickEvents();
}

function flowClickEvents() {
    let flows = document.querySelector('#flows') as HTMLDivElement;
    flows.addEventListener('click', function (event) {
        removeSelected();
        hideNavBar();
        let target = getEventTarget(flows, event, '.flow');
        if (!target) {
            flows.classList.remove('show-flows');
            setTimeout(() => {
                flows.classList.add('show-flows');
            }, 0);
            event.stopPropagation();
            return;
        }
        let id = target.dataset.flowTarget;
        if (id == 'back') {
            historyBackUntilAnotherArtboard();
        } else {
            gotoArtboard(id);
        }
        event.stopPropagation();
    });
}

function flowModeSwitchEvents() {
    document.querySelector('#flow-mode').addEventListener('change', function () {
        setFlowMode((this as HTMLInputElement).checked);
        updateURLHash();
    })
}

export function setFlowMode(enabled: boolean) {
    flowMode = enabled;
    let viewer = document.querySelector('.screen-viewer') as HTMLDivElement;
    let screen = document.querySelector('#screen') as HTMLDivElement;
    let selectedTabArtboards = document.querySelector('.icon-artboards') as HTMLDivElement;
    let showNavbar = document.querySelector('.navbar') as HTMLDivElement;
    let currentRect = screen.getBoundingClientRect();
    let inputFlowMode = document.querySelector('#flow-mode') as HTMLInputElement;
    // set checked won't trigge change event
    inputFlowMode.checked = enabled;
    let hideOnFLow = [
        '#layers',
        '#unit',
        '.header-left [data-id="slices"]',
        '.header-left [data-id="colors"]',
        '.header-right',
        '#artboards .flow-starts',
    ];
    let showOnFlow = [
        '#flows',
        '#artboards .flow-starts',
    ]
    const hideOnFLowDisplay = flowMode ? 'none' : '';
    const showOnFLowDisplay = flowMode ? '' : 'none';
    hideOnFLow.forEach(s => {
        let el = document.querySelector(s) as HTMLElement;
        if (el) el.style.display = hideOnFLowDisplay;
    })
    showOnFlow.forEach(s => {
        let el = document.querySelector(s) as HTMLElement;
        if (el) el.style.display = showOnFLowDisplay;
    })
    if (flowMode) {
        screen.classList.add('flow');
        removeSelected();
        hideNavBar();
    } else {
        screen.classList.remove('flow');
        selectedTabArtboards.classList.add('current');
        showNavbar.classList.add('on');
    }
    updateScreen();
    alignElement({
        scroller: viewer,
        target: screen,
        toRect: currentRect,
        fromEdge: Edge.hcenter | Edge.vtop,
        toEdge: Edge.hcenter | Edge.vtop
    });
}
