// Copyright 2020 Jebbs. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

import { LayerData, ArtboardData, SMType } from "../interfaces";
import { stopwatch } from ".";
import { getLayerData } from "./layerData";
import { tempLayers } from "./tempLayers";

export function getSymbol(artboard: Artboard, layer: SymbolInstance, layerData: LayerData, data: ArtboardData, byInfluence: boolean) {
    if (layerData.type != SMType.symbol) return;
    // symbol instance of none, #4
    if (!layer.master) return;
    let master = layer.master
    let masterID = master.id;

    layerData.objectID = masterID;

    if (master.exportFormats.length || master.allSubLayers().length < 2) return;
    let tempInstance = layer.duplicate() as SymbolInstance;
    // do not trigger layer re-arrange from 3rd-party plugins, e.g.: Anima
    tempInstance.parent = artboard;
    tempInstance.frame = layer.frame.changeBasis({ from: layer.parent as Group, to: artboard });
    let tempGroup = tempInstance.detach({ recursively: false });
    tempLayers.add(tempGroup);

    let masterAllLayers = master.allSubLayers();
    let instanceAllLayers = tempGroup.allSubLayers();
    if (masterAllLayers.length < instanceAllLayers.length) {
        // console.log('insert undefined into masterAllLayers[1] as master backgroud layer');
        masterAllLayers.splice(1, 0, undefined);
    }
    // stopwatch.tik('create temp detached symbol');
    for (let i = 0; i < instanceAllLayers.length; i++) {
        let instanceLayer = instanceAllLayers[i];
        let masterLayer = masterAllLayers[i];
        // console.log(instanceLayer.name + ":" + (masterLayer ? masterLayer.name : 'undefined'));
        getLayerData(artboard, instanceLayer, data, byInfluence, masterLayer);
    }
    tempGroup.remove();
}