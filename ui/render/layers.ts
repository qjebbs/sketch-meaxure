import { state, project } from "../common";
import { zoomSize, percentageSize, unitSize } from "./helper";
import { SMType } from "../../src/meaxure/interfaces";

export var MapArtboardIDToIndex: { [key: string]: number } = undefined;
export function layers() {
    specLayers();
    flowLayers();
}

function specLayers() {
    let layersHTML = [];
    state.current.layers.forEach((layer, index) => {
        if (layer.type == SMType.group || layer.type == SMType.hotspot) return;
        let x = zoomSize(layer.rect.x);
        let y = zoomSize(layer.rect.y);
        let width = zoomSize(layer.rect.width);
        let height = zoomSize(layer.rect.height);
        let classNames = ['layer'];
        classNames.push('layer-' + layer.objectID);
        if (state.selectedIndex == index) classNames.push('selected');
        layersHTML.push([`
<div id="layer-${index}" 
    class="${classNames.join(' ')}" data-index="${index}" 
    percentage-width="${percentageSize(layer.rect.width, state.current.width)}" 
    percentage-height="${percentageSize(layer.rect.height, state.current.height)}" 
    data-width="${unitSize(layer.rect.width)}" 
    data-height="${unitSize(layer.rect.height)}" 
    style="left: ${x}px; top: ${y}px; width: ${width}px; height: ${height}px;"
>
    <i class="tl"></i><i class="tr"></i><i class="bl"></i><i class="br"></i>
    <b class="et h"></b><b class="er v"></b><b class="eb h"></b><b class="el v"></b>
</div>`].join(''));
    });
    document.querySelector('#layers').innerHTML = layersHTML.join('');
}

function flowLayers() {
    MapArtboardIDToIndex = project.artboards.reduce((p, c, i) => {
        p[c.objectID] = i;
        return p;
    }, { 'back': -1 });
    let layersHTML = [];
    state.current.layers.filter(layer => layer.flow && MapArtboardIDToIndex[layer.flow.targetId] !== undefined)
        .forEach((layer, index) => {
            let x = zoomSize(layer.rect.x);
            let y = zoomSize(layer.rect.y);
            let width = zoomSize(layer.rect.width);
            let height = zoomSize(layer.rect.height);
            let classNames = ['flow'];
            layersHTML.push([`
<div class="${classNames.join(' ')}"
    data-flow-target="${layer.flow.targetId}"
    style="left: ${x}px; top: ${y}px; width: ${width}px; height: ${height}px;"
></div>`].join(''));
        });
    document.querySelector('#flows').innerHTML = layersHTML.join('');
}