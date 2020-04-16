// Copyright 2020 Jebbs. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

import { LayerData, ArtboardData, SMType } from "../interfaces";
import { tempCreatedLayers } from ".";
import { getLayerData } from "./layerData";

export function getSymbol(artboard: Artboard, layer: SymbolInstance, layerData: LayerData, data: ArtboardData, byInfluence: boolean) {
    if (layerData.type != SMType.symbol) return;
    let master = layer.master
    let masterID = master.id;

    layerData.objectID = masterID;

    if (master.exportFormats.length || master.allSubLayers().length < 2) return;
    let tempInstance = layer.duplicate() as SymbolInstance;
    // do not trigger layer re-arrange from 3rd-party plugins, e.g.: Anima
    tempInstance.hidden = true;
    let tempGroup = tempInstance.detach({ recursively: false });
    tempCreatedLayers.push(tempGroup);

    let masterAllLayers = master.allSubLayers();
    let instanceAllLayers = tempGroup.allSubLayers();
    if (masterAllLayers.length < instanceAllLayers.length) {
        // console.log('insert undefined into masterAllLayers[1] as master backgroud layer');
        masterAllLayers.splice(1, 0, undefined);
    }
    for (let i = 0; i < instanceAllLayers.length; i++) {
        let instanceLayer = instanceAllLayers[i];
        let masterLayer = masterAllLayers[i];
        // console.log(instanceLayer.name + ":" + (masterLayer ? masterLayer.name : 'undefined'));
        getLayerData(artboard, instanceLayer, data, byInfluence, masterLayer);
    }
    tempGroup.remove();
}