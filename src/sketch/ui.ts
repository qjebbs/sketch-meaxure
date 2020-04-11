// Copyright 2020 Jebbs. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

import { sketch } from ".";

declare module 'sketch/sketch' {
    namespace _Sketch {
        interface UI {
            savePanel(title: string, nameFieldLabel: string, prompt: string, canCreateDirectories: boolean, fileName: string): string;
        }
    }
}

export function extendUI() {
    let target = sketch.UI;
    target.savePanel = function (
        title: string,
        nameFieldLabel: string,
        prompt: string,
        canCreateDirectories: boolean,
        fileName: string
    ): string {
        let savePanel = NSSavePanel.savePanel();

        savePanel.setTitle(title);
        savePanel.setNameFieldLabel(nameFieldLabel);
        savePanel.setPrompt(prompt);
        savePanel.setCanCreateDirectories(canCreateDirectories);
        savePanel.setNameFieldStringValue(fileName);

        if (savePanel.runModal() != NSOKButton) {
            return undefined;
        }
        return savePanel.URL().path();
    }
}