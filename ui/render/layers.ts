import { state } from "../common";
import { zoomSize, percentageSize, unitSize } from "./helper";
export function layers() {
    let layersHTML = [];
    state.current.layers.forEach((layer, index) => {
        var x = zoomSize(layer.rect.x), y = zoomSize(layer.rect.y), width = zoomSize(layer.rect.width), height = zoomSize(layer.rect.height), classNames = ['layer'];
        classNames.push('layer-' + layer.objectID);
        if (state.selectedIndex == index)
            classNames.push('selected');
        layersHTML.push([
            '<div id="layer-' + index + '" class="' + classNames.join(' ') + '" data-index="' + index + '" percentage-width="' + percentageSize(layer.rect.width, state.current.width) + '" percentage-height="' + percentageSize(layer.rect.height, state.current.height) + '" data-width="' + unitSize(layer.rect.width) + '" data-height="' + unitSize(layer.rect.height) + '" style="left: ' + x + 'px; top: ' + y + 'px; width: ' + width + 'px; height: ' + height + 'px;">',
            '<i class="tl"></i><i class="tr"></i><i class="bl"></i><i class="br"></i>',
            '<b class="et h"></b><b class="er v"></b><b class="eb h"></b><b class="el v"></b>',
            '</div>'
        ].join(''));
    });
    document.querySelector('#layers').innerHTML = layersHTML.join('');
}
