// Copyright 2020 Jebbs. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

import { SMColor } from "../interfaces";
import { parseColor } from "../helpers/styles";

export function getDocumentColors(document: Document): { name: string, color: SMColor }[] {
    return document.colors.map(colorAsset => ({
        name: colorAsset.name,
        color: parseColor(colorAsset.color),
    }));
}