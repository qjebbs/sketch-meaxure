import { gotoArtboard } from "./navigate";
import { getEventTarget, removeSelected } from "./helper";
import { updateScreen } from "../render/screen";
import { state } from "../common";
import { hideNavBar } from "./tab";

export var flowMode = false;

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
            history.back();
        } else {
            gotoArtboard(id);
        }
        event.stopPropagation();
    });
}

function flowModeSwitchEvents() {
    let screen = document.querySelector('#screen') as HTMLDivElement;
    let hideOnFLow = [
        '#layers',
        '#unit',
        '.header-left [data-id="slices"]',
        '.header-left [data-id="colors"]',
        '.header-right',
    ];
    let showOnFlow = [
        '#flows',
    ]
    document.querySelector('#flow-mode').addEventListener('change', function () {
        flowMode = (this as HTMLInputElement).checked;
        const hideOnFLowDisplay = flowMode ? 'none' : 'inherit';
        const showOnFLowDisplay = flowMode ? 'inherit' : 'none';
        hideOnFLow.forEach(s => {
            (document.querySelector(s) as HTMLElement).style.display = hideOnFLowDisplay;
        })
        showOnFlow.forEach(s => {
            (document.querySelector(s) as HTMLElement).style.display = showOnFLowDisplay;
        })
        state.maxSize = undefined;
        removeSelected();
        hideNavBar();
        updateScreen();
        if (flowMode) {
            screen.classList.add('flow');
        } else {
            screen.classList.remove('flow');
        }
    })
}