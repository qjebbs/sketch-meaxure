import { SMColor } from "../../api/interfaces";
import { parseColor } from "../../api/styles";

export function getDocumentColors(document: Document): { name: string, color: SMColor }[] {
    return document.colors.map(colorAsset => ({
        name: colorAsset.name,
        color: parseColor(colorAsset.color),
    }));
}