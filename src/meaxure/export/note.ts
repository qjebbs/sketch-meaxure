import { SMNote } from "../../api/interfaces";
import { sketch } from "../../sketch";
import { toHTMLEncode } from "../../api/helper";
import { emojiToEntities } from "../../api/api";

export function makeNote(layer: Layer, artboard: Artboard): SMNote {
    if (!layer || layer.type != sketch.Types.Group || ! /#note-/.test(layer.name)) return undefined;
    let textLayer: Text;
    let layers = layer.allSubLayers();
    for (let layer of layers) {
        if (layer.type == sketch.Types.Text) {
            textLayer = layer as Text;
            break;
        }
    }
    layer.hidden = true;
    return <SMNote>{
        rect: layer.frame.changeBasis({ from: layer.parent, to: artboard }),
        note: toHTMLEncode(emojiToEntities(textLayer.text).replace(/\n/g, "<br>")),
    };
}