import { state } from "../../common";
import { renderCodeTemplate } from "./codeTemplate";
import { renderProperties } from "./properties";
import { renderShadows } from "./shadows";
import { renderBorders } from "./borders";
import { renderFont } from "./font";
import { renderExportable } from "./exportable";
import { renderFills } from "./fills";

export function inspector() {
    if (state.selectedIndex === undefined ||
        (!state.current && !state.current.layers && !state.current.layers[state.selectedIndex])
    ) return false;
    let layerData = state.current.layers[state.selectedIndex];
    let html = [
        '<h2>' + layerData.name + '</h2>',
        renderProperties(layerData),
        renderFills(layerData),
        renderFont(layerData),
        renderBorders(layerData),
        renderShadows(layerData),
        renderCodeTemplate(layerData),
        renderExportable(layerData),
    ];
    let inspector = document.querySelector('#inspector');
    inspector.classList.add('active');
    inspector.innerHTML = html.join('');

    // select previously used tab
    let li = inspector.querySelector('[data-codeType=' + state.codeType + ']') as HTMLElement;
    if (li) {
        li.classList.add('select');
        inspector.querySelector("#" + li.getAttribute('data-id')).classList.add('select');
    }
    document.querySelectorAll('#code-tab li').forEach(
        li => li.addEventListener('click', function () {
            let target = this as HTMLElement;
            let id = target.getAttribute('data-id');
            state.codeType = target.getAttribute('data-codeType');
            target.parentElement.querySelector('li.select').classList.remove('select');
            target.classList.add('select');
            inspector.querySelector('div.item.select')?.classList.remove('select');
            inspector.querySelector("#" + id).classList.add('select');
        })
    );
}
