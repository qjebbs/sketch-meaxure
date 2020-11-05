// Copyright 2020 Jebbs. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

import { getResourcePath } from "../helpers/helper";

let currentLang = '';
let I18N: { [key: string]: string } = {};

export function getLanguageScript(): string {
    if (!currentLang) initialize();
    return `I18N['${currentLang}'] = ${JSON.stringify(I18N[currentLang])}`;
}

export function getLanguageObject(): { [key: string]: string } {
    if (!currentLang) initialize();
    return I18N;
}

export function localize(str: string, ...data) {
    if (!currentLang) initialize();
    str = (I18N[currentLang] && I18N[currentLang][str]) ? I18N[currentLang][str] : str;
    let idx = -1;
    return str.replace(/\%\@/gi, function () {
        idx++;
        return data[idx];
    });
}

function initialize() {
    let aliases = {
        "zh-Hans": "zh-cn",
        "zh-Hant": "zh-tw"
    }
    let macOSVersion = NSDictionary.dictionaryWithContentsOfFile("/System/Library/CoreServices/SystemVersion.plist").objectForKey("ProductVersion") + "";
    let sysLanguage = NSUserDefaults.standardUserDefaults().objectForKey("AppleLanguages").objectAtIndex(0);
    currentLang = (macOSVersion >= "10.12") ? sysLanguage.split("-").slice(0, -1).join("-") : sysLanguage;
    currentLang = aliases[currentLang];
    let langFile = getResourcePath() + "/i18n/" + currentLang + ".json";
    if (!NSFileManager.defaultManager().fileExistsAtPath(langFile)) {
        return "";
    }
    let language = NSString.stringWithContentsOfFile_encoding_error(langFile, 4, nil) as string;
    I18N[currentLang] = JSON.parse(language);
}