import { context } from "./context";
import { prefix } from "./common";
import { extend } from "../helper";

export interface MarkConfig {
    scale?: number;
    unit?: string;
    colorFormat?: string;
    artboardOrder?: string;
    order: string;
    exportInfluenceRect: boolean;
    exportOption: boolean;
    colors: any;
    sizes: any;
    spacings: any;
    properties: "color" | "border";
    isHidden: boolean;
    isLocked:boolean;
}

export function getConfigs(): MarkConfig {
    var configsData = /*this.*/context.UIMetadata.objectForKey(/*this.*/prefix);
    return JSON.parse(configsData);
}
export function setConfigs(newConfigs) {
    var configsData;
    newConfigs.timestamp = new Date().getTime();
    configsData = /*this.*/extend(newConfigs, /*this.*/getConfigs() || {});
    /*this.*/context.UIMetadata.setObject_forKey(JSON.stringify(configsData), /*this.*/prefix);

    return configsData;
}
export function removeConfigs() {
    /*this.*/context.UIMetadata.setObject_forKey(null, /*this.*/prefix);
}