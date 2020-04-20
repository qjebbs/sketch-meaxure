// Copyright 2020 Jebbs. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

import { sketch } from "..";
import { savePanel } from "./savePanel";
import { confirm } from "./confirm";
import { showFiles } from "./finder";

declare module 'sketch/sketch' {
    namespace _Sketch {
        interface UI {
            savePanel(title: string, nameFieldLabel: string, prompt: string, canCreateDirectories: boolean, fileName: string): string;
            confirm(title: string, prompt: string, defaultButton?: string, alternateButton?: string): boolean;
            showFiles(files: string[]): void;
        }
    }
}

export function extendUI() {
    let target = sketch.UI;
    target.savePanel = savePanel;
    target.confirm = confirm;
    target.showFiles = showFiles;
}