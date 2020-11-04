// Copyright 2020 Jebbs. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

import { sketch } from "../../sketch";

export class ConfigsMaster {
    private _document;
    constructor(document) {
        this._document = document;
    }
    /**
     * Design resolution, 2 represents @2x
     */
    get resolution(): number {
        return this._readDocumentSetting<number>('scale', 1);
    }
    /**
     * Design resolution, 2 represents @2x
     */
    set resolution(value: number) {
        this._setDocumentSetting<number>('scale', value);
    }
    get units(): string {
        return this._readDocumentSetting<string>('units', "px");
    }
    set units(value: string) {
        this._setDocumentSetting<string>('units', value);
    }
    get format(): string {
        return this._readDocumentSetting<string>('format', "color-hex");
    }
    set format(value: string) {
        this._setDocumentSetting<string>('format', value);
    }
    get properties(): string[] {
        return this._readSessionVariable<string[]>('properties', []);
    }
    set properties(value: string[]) {
        this._setSessionVariable<string[]>('properties', value);
    }
    get byInfluence(): boolean {
        return this._readSessionVariable<boolean>('byInfluence', false);
    }
    set byInfluence(value: boolean) {
        this._setSessionVariable<boolean>('byInfluence', value);
    }
    get byPercentage(): boolean {
        return this._readSessionVariable<boolean>('byPercentage', false);
    }
    set byPercentage(value: boolean) {
        this._setSessionVariable<boolean>('byPercentage', value);
    }
    private _readDocumentSetting<T>(field: string, defaultValue: T): T {
        let value = sketch.Settings.documentSettingForKey<T>(this._document, field);
        // logger.debug(`read config: "${field}"=${value}`);
        if (value === undefined) {
            // logger.debug(`use default ${defaultValue} for "${field}"`);
            return defaultValue;
        }
        return value;
    }
    private _setDocumentSetting<T>(field: string, value: T) {
        sketch.Settings.setDocumentSettingForKey(this._document, field, value);
    }
    private _readSessionVariable<T>(field: string, defaultValue: T): T {
        let value = sketch.Settings.sessionVariable<T>(field);
        // logger.debug(`read config: "${field}"=${value}`);
        if (value === undefined) {
            // logger.debug(`use default ${defaultValue} for "${field}"`);
            return defaultValue;
        }
        return value;
    }
    private _setSessionVariable<T>(field: string, value: T) {
        sketch.Settings.setSessionVariable(field, value);
    }
}