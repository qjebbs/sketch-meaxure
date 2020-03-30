import { LayerData, ArtboardData } from "../../api/interfaces";
import { tempCreatedLayers } from ".";
import { getLayerData } from "./layerData";

export function getSymbol(artboard: Artboard, layer: SymbolInstance, layerData: LayerData, data: ArtboardData, byInfluence: boolean) {
    if (layerData.type != "symbol") return;
    let master = layer.master
    let masterID = master.id;

    layerData.objectID = masterID;

    if (master.exportFormats.length || master.allSubLayers().length < 2) return;
    let tempInstance = layer.duplicate() as SymbolInstance;
    let tempGroup = tempInstance.detach({ recursively: false });
    tempCreatedLayers.push(tempGroup);

    let idx = 0;
    let masterAllLayers = master.allSubLayers();
    let instanceAllLayers = tempGroup.allSubLayers();
    let hasSymbolBackgroud = masterAllLayers.length < instanceAllLayers.length;

    for (let instanceLayer of instanceAllLayers) {
        let masterLayer: Layer = undefined;
        if (!hasSymbolBackgroud) {
            masterLayer = masterAllLayers[idx]
        } else {
            switch (idx) {
                case 0:
                    masterLayer = masterAllLayers[0];
                    break;
                case 1:
                    break;
                default:
                    masterLayer = masterAllLayers[idx - 1];
                    break;
            }
        }
        if (!masterLayer) continue;
        if (instanceLayer) {
            getLayerData(
                artboard,
                instanceLayer,
                data,
                byInfluence,
                masterLayer
            );
        }
        idx++
    }
    tempGroup.remove();
}