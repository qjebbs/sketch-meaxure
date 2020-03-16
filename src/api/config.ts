import { logger } from "./logger";
import { deepEqual } from "./helper";
export type OptionArtboardOrder = 'artboard-rows' | 'artboard-cols' | 'layer-order';

export class ConfigsMaster {
    private _prefix = "SMX3Configs";
    private _configCache = undefined;
    private _document;
    constructor(document) {
        this._document = document;
    }
    get scale(): number {
        return this._read<number>('scale', 1);
    }
    set scale(value: number) {
        this._set<number>('scale', value);
    }
    get artboardOrder(): OptionArtboardOrder {
        return this._read<OptionArtboardOrder>('artboardOrder', "artboard-rows");
    }
    set artboardOrder(value: OptionArtboardOrder) {
        this._set<OptionArtboardOrder>('artboardOrder', value);
    }
    get units(): string {
        return this._read<string>('units', "px");
    }
    set units(value: string) {
        this._set<string>('units', value);
    }
    get format(): string {
        return this._read<string>('format', "color-hex");
    }
    set format(value: string) {
        this._set<string>('format', value);
    }
    get properties(): string[] {
        return this._read<string[]>('properties', []);
    }
    set properties(value: string[]) {
        this._set<string[]>('properties', value);
    }
    get byInfluence(): boolean {
        return this._read<boolean>('byInfluence', false);
    }
    set byInfluence(value: boolean) {
        this._set<boolean>('byInfluence', value);
    }
    get byPercentage(): boolean {
        return this._read<boolean>('byPercentage', false);
    }
    set byPercentage(value: boolean) {
        this._set<boolean>('byPercentage', value);
    }
    get isLocked(): boolean {
        return this._read<boolean>('isLocked', false);
    }
    set isLocked(value: boolean) {
        this._set<boolean>('isLocked', value);
    }
    get isHidden(): boolean {
        return this._read<boolean>('isHidden', false);
    }
    set isHidden(value: boolean) {
        this._set<boolean>('isHidden', value);
    }
    clear() {
        this.store.removeObjectForKey(this._prefix);
    }
    private get store() {
        return this._document.mutableUIMetadata();
    }
    private _read<T>(field: string, defaultValue: T): T {
        if (this._configCache === undefined) {
            this._configCache = JSON.parse(this.store.objectForKey(this._prefix));
            logger.debug("read config storage:", this._configCache);
            if (this._configCache === null) this._configCache = {};
        }
        let value = this._configCache[field];
        logger.debug(`read config: "${field}"=${value}`);
        if (value === undefined) {
            logger.debug(`use default ${defaultValue} for "${field}"`);
            return defaultValue;
        }
        return value;
    }
    private _set<T>(field: string, value: T) {
        if (deepEqual(this._configCache[field], value)) return;
        this._configCache[field] = value;
        logger.debug(`save to storage due to: "${field}"=>${value}`);
        this._saveCacheToStorage();
    }
    private _saveCacheToStorage() {
        this.store.setObject_forKey(JSON.stringify(this._configCache), this._prefix)
    }
}