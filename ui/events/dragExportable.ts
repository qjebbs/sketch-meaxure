import { getEventTarget } from "./helper";

export function dragExportableEvents() {
    document.body.addEventListener('dragstart', function (event) {
        let target = getEventTarget(document.body, event, '.exportable img')
        if (!target) return;
        target.style.width = 'auto';
        target.style.height = 'auto';
        let rect = target.getBoundingClientRect();
        let left = event.pageX - rect.left - target.offsetWidth / 2;
        let top = event.pageY - rect.top - target.offsetHeight / 2;
        target.style.left = left + 'px';
        target.style.top = top + 'px';
    });
    document.body.addEventListener('dragend', function (event) {
        let target = getEventTarget(document.body, event, '.exportable img')
        if (!target) return;
        target.style.left = '0';
        target.style.top = '0';
        target.style.width = '100%';
        target.style.height = '100%';
    });
}