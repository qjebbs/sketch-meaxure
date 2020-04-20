export function showFiles(files: string[]): void {
    let fileURLs = files.map(f => NSURL.fileURLWithPath(f));
    NSWorkspace.sharedWorkspace().activateFileViewerSelectingURLs(fileURLs);
}