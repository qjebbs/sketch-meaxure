import { context } from "./context";

let I18N = {};
let webI18N = {
    "zh-Hans": "zh-cn",
    "zh-Hant": "zh-tw"
}
let macOSVersion = NSDictionary.dictionaryWithContentsOfFile("/System/Library/CoreServices/SystemVersion.plist").objectForKey("ProductVersion") + "";
let lang = NSUserDefaults.standardUserDefaults().objectForKey("AppleLanguages").objectAtIndex(0);

export function initLanguage(): string {
    lang = (macOSVersion >= "10.12") ? lang.split("-").slice(0, -1).join("-") : lang;
    let langFile = context.resourcesRoot + "/i18n/" + lang + ".json";
    if (!NSFileManager.defaultManager().fileExistsAtPath(langFile)) {
        return "";
    }
    let language = "";
    language = NSString.stringWithContentsOfFile_encoding_error(langFile, 4, nil);
    I18N[lang] = JSON.parse(language);
    return `I18N['${webI18N[lang]}'] = ${language}`;
}

export function localize(str, data?) {
    var str = (I18N[lang] && I18N[lang][str]) ? I18N[lang][str] : str,
        idx = -1;
    return str.replace(/\%\@/gi, function () {
        idx++;
        return data[idx];
    });
}