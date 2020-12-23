// Copyright 2020 Jebbs. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

import { getResourcePath } from "../helpers/helper";

let aliases = {
    "zh-Hans": "zh-cn",
    "zh-Hant": "zh-tw"
}

let caches: { [key: string]: Object } = {};

export function getLanguage(): Object | null {
    return loadLanguage(getLangCode());
}

export function getAllLanguage(): { [key: string]: Object } {
    let all: { [key: string]: Object } = {}
    for (let v of Object.values(aliases)) {
        let lang = loadLanguage(v);
        if (lang) all[v] = lang;
    }
    return all;
}

export function localize(str: string, ...data) {
    let langs = loadLanguage(getLangCode());
    if (langs && langs[str]) {
        str = langs[str];
    }
    let idx = -1;
    return str.replace(/\%\@/gi, function () {
        idx++;
        return data[idx];
    });
}

function loadLanguage(code: string): Object | null {
    if (!code) return null;
    if (caches[code] !== undefined) {
        return caches[code];
    }
    let langFile = getResourcePath() + "/i18n/" + code + ".json";
    if (!NSFileManager.defaultManager().fileExistsAtPath(langFile)) {
        return null;
    }
    let language = NSString.stringWithContentsOfFile_encoding_error(langFile, 4, nil) as string;
    return caches[code] = JSON.parse(language);
}

function getLangCode(): string {
    let sysLanguage = String(NSUserDefaults.standardUserDefaults().objectForKey("AppleLanguages").objectAtIndex(0)).toLowerCase();
    for (let key of Object.keys(aliases)) {
        let lkey = key.toLowerCase();
        if (sysLanguage.startsWith(lkey)) {
            return aliases[key];
        }
    }
    return "";
}