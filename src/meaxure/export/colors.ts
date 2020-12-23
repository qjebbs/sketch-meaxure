// Copyright 2020 Jebbs. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

import { SMColorAsset } from "../interfaces";
import { parseColor } from "../helpers/styles";

export function getDocumentColors(document: Document): SMColorAsset[] {
    let sw = document.swatches;
    if (sw && sw.length) return sw.map(s => ({
        name: s.name,
        color: parseColor(s.color),
    }));
    return [];
}
