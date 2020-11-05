// Copyright 2020 Jebbs. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

import { sketch } from "../../sketch";
import { newStopwatch, getResourcePath } from "./helper";
import { createWebviewPanel } from "../../webviewPanel";
import { logger } from "../common/logger";
import { localize } from "../common/language";

const MARK_V1 = /^(OVERLAY|WIDTH|HEIGHT|TOP|RIGHT|BOTTOM|LEFT|VERTICAL|HORIZONTAL|NOTE|PROPERTY)#/;
const MARK_V2 = /^#(?:width|height|spacing|coordinate|overlay|properties|note)/;

export async function renameOldMarkers() {
    if (!sketch.UI.confirm(
        'Rename Old Markers',
        'Rename markers created by Sketch Measure, so that this plugin can manage them.' + '\n\n' +
        'Would you like to continue?'
    )) return;
    let stopwatch = newStopwatch();
    let processingPanel = createWebviewPanel({
        url: getResourcePath() + "/panel/processing.html",
        width: 304,
        height: 104,
    });
    processingPanel.show();
    let doc = sketch.getSelectedDocument();
    for (let i = 0; i < doc.pages.length; i++) {
        let page = doc.pages[i];
        for (let j = 0; j < page.layers.length; j++) {
            let artboard = page.layers[j] as Artboard;
            let taskError: Error;
            await processingArtboard(artboard)
                .catch(err => taskError = err);
            if (taskError) {
                logger.error(taskError);
                return;
            }
            processingPanel.postMessage('process', {
                percentage: Math.round((i + (j + 1) / page.layers.length) / doc.pages.length * 100),
                text: localize("Processing artboard %@ of %@", i + 1, doc.pages.length)
            });
        }
    }
    processingPanel.close();
    sketch.UI.message(`All markers are renamed, takes ${stopwatch.elpased() / 1000} seconds.`);
}
function processingArtboard(artboard: Artboard) {
    return new Promise<boolean>((resolve, reject) => {
        for (let layer of artboard.getAllChildren()) {
            renameIfIsMarker(layer);
        }
        resolve(true);
    });
}

export function renameIfIsMarker(layer: Layer) {
    if (layer.type !== sketch.Types.Group) return;
    if (renameMarkerV1(layer)) return;
    renameMarkerV2(layer);
}

function renameMarkerV2(mark: Layer): boolean {
    if (!MARK_V2.test(mark.name)) return false;
    mark.name = '#meaxure-' + mark.name.substring(1);
    return true;
}
function renameMarkerV1(mark: Layer): boolean {
    let match: RegExpExecArray = MARK_V1.exec(mark.name);
    if (!match) return false;
    let leftPart = '';
    switch (match[1]) {
        case 'WIDTH':
            leftPart = 'width-bottom';
            break;
        case 'HEIGHT':
            leftPart = 'height-left';
            break;
        case 'TOP':
            leftPart = 'spacing-top';
            break;
        case 'RIGHT':
            leftPart = 'spacing-right';
            break;
        case 'BOTTOM':
            leftPart = 'spacing-bottom';
            break;
        case 'LEFT':
            leftPart = 'spacing-left';
            break;
        case 'VERTICAL':
            leftPart = 'spacing-left';
            break;
        case 'HORIZONTAL':
            leftPart = 'spacing-left';
            break;
        case 'NOTE':
            leftPart = 'note';
            break;
        case 'PROPERTY':
            leftPart = 'properties';
            break;
        case 'OVERLAY':
            leftPart = 'overlay';
            break;

        default:
            break;
    }
    mark.name = '#meaxure-' + leftPart + '-' + mark.name.split('#')[1];
    return true;
}