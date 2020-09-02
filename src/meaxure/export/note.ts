// Copyright 2020 Jebbs. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

import { SMNote } from "../interfaces";
import { sketch } from "../../sketch";
import { toHTMLEncode, emojiToEntities } from "../helpers/helper";

export function makeNote(layer: Layer, artboard: Artboard, symbolLayer?: Layer): SMNote {
    if (!layer || layer.type != sketch.Types.Group || !layer.name.startsWith('#meaxure-note-')) return undefined;
    let textLayers = sketch.find<Text>('Text', layer as Group);
    if (!textLayers.length) return undefined;
    let textLayer: Text = textLayers[0];
    if (!layer.hidden) layer.hidden = true;
    if (symbolLayer && !symbolLayer.hidden) symbolLayer.hidden = true;
    return <SMNote>{
        rect: layer.frame.changeBasis({ from: layer.parent as Group, to: artboard }),
        note: toHTMLEncode(emojiToEntities(textLayer.text)).replace(/\n/g, "<br>"),
    };
}