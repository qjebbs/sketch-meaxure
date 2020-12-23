// Copyright 2020 Jebbs. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

import { SMColorAsset } from "../interfaces";
import { parseColor } from "../helpers/styles";

export function getDocumentColors(document: Document): SMColorAsset[] {
    return document.swatches.map(s => ({
        name: s.name,
        color: parseColor(s.color),
    }));
}