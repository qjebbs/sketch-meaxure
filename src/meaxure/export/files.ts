import { extend } from "../../api/helper";
import { toJSString } from "../../api/api";
import { SMExportFormat } from "../../api/interfaces";
import { sketch } from "../../sketch";
import { context } from "../../state/context";

export function exportImage(layer: Layer, format: SMExportFormat, path: string, name: string) {
    let document = context.document;
    let slice = MSExportRequest.exportRequestsFromExportableLayer(layer.sketchObject).firstObject();
    let savePathName = [];

    slice.scale = format.scale;
    slice.format = format.format;

    savePathName.push(
        path,
        "/",
        format.prefix,
        name,
        format.suffix,
        ".",
        format.format
    );
    let savePath = savePathName.join("");

    document.saveArtboardOrSlice_toFile(slice, savePath);
    return savePath;
}

export function exportImage2(layer: Layer, format: SMExportFormat, path: string, name: string) {
    let savePath = [
        path, "/",
        format.prefix, name, format.suffix,
        ".", format.format
    ].join("");
    // cannot use sketch.export because it's option.output is a directory, 
    // we don't have a chance to specify the filename,
    // the filename is unpredictable.
    sketch.export(layer,{
        output: savePath,
        formats: format.format,
        scales: format.scale.toString(),
    })
    return savePath;
}

export function writeFile(options) {
    
    options = extend(options, {
        content: "Type something!",
        path: toJSString(NSTemporaryDirectory()),
        fileName: "temp.txt"
    })
    let content = NSString.stringWithString(options.content),
        savePathName = [];

    NSFileManager
        .defaultManager()
        .createDirectoryAtPath_withIntermediateDirectories_attributes_error(options.path, true, nil, nil);

    savePathName.push(
        options.path,
        "/",
        options.fileName
    );
    let savePath = savePathName.join("");

    content.writeToFile_atomically_encoding_error(savePath, false, 4, null);
}

export function buildTemplate(content, data) {
    content = content.replace(new RegExp("\\<\\!\\-\\-\\s([^\\s\\-\\-\\>]+)\\s\\-\\-\\>", "gi"), function ($0, $1) {
        if ($1 in data) {
            return data[$1];
        } else {
            return $0;
        }
    });
    return content;
}