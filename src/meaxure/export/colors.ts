import { SMColor } from "../interfaces";
import { parseColor } from "../helpers/styles";

export function getDocumentColors(document: Document): { name: string, color: SMColor }[] {
    return document.colors.map(colorAsset => ({
        name: colorAsset.name,
        color: parseColor(colorAsset.color),
    }));
}