export function confirm(title: string, prompt: string, defaultButton?: string, alternateButton?: string): boolean {
    defaultButton = defaultButton || 'OK';
    alternateButton = alternateButton || 'Cancel';
    let alert = NSAlert.alertWithMessageText_defaultButton_alternateButton_otherButton_informativeTextWithFormat(title, defaultButton, alternateButton, '', prompt)
    var response = alert.runModal();
    if (response == NSAlertDefaultReturn) {
        return true;
    }
    return false;
}