import { ArtboardData } from "../../api/interfaces"; import { sketch } from "../../sketch";
import { tempCreatedLayers } from ".";
import { getLayerData } from "./layerData";

export function getTextFragment(artboard: Artboard, layer: Text, data: ArtboardData) {
    if (layer.type != sketch.Types.Text) return;
    let fragments = layer.getFragments();
    if (fragments.length < 2) return;
    let maxLineHeight = Math.max(...fragments.map(f => f.style.lineHeight));
    let textFrame = layer.frame;
    let offsetFragmentsX = 0;
    let offsetFragmentsY = 0;
    for (let fragment of fragments) {
        let subText = new sketch.Text({ text: fragment.text, parent: layer.parent });
        tempCreatedLayers.push(subText);
        subText.style = fragment.style;
        subText.style.lineHeight = maxLineHeight;
        subText.frame.x = textFrame.x + offsetFragmentsX;
        subText.frame.y = textFrame.y + offsetFragmentsY;
        offsetFragmentsX += subText.frame.width;
        if (offsetFragmentsX > textFrame.width) {
            offsetFragmentsX -= textFrame.width;
            offsetFragmentsY += maxLineHeight;
        }
        // TODO: improve for wrapped fragment text
        getLayerData(
            artboard,
            subText,
            data,
            false
        );
        subText.remove();
    }
}
