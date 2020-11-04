import { LayerData, SMFlow } from "../interfaces";
import { sketch } from "../../sketch";

export function getFlow(layer: Layer, layerData: LayerData): SMFlow {
    if (!layer.flow) return;
    layerData.flow = <SMFlow>{
        targetId: layer.flow.targetId == sketch.Flow.BackTarget ? 'back' : layer.flow.targetId,
        animationType: layer.flow.animationType,
    }
}