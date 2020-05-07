import { getEventTarget, clickElement } from "./helper";
import { message } from "../render/helper";
import { localize } from "../common";

export function sliceEvents() {
    let slices = document.querySelector('#slices') as HTMLDivElement;
    slices.addEventListener('mouseover', event => {
        let target = getEventTarget(slices, event, 'li');
        if (!target) return;
        document.querySelectorAll('.layer-' + target.dataset.objectid)
            .forEach(div => div.classList.add('has-slice'));
    });
    slices.addEventListener('mouseout', event => {
        let target = getEventTarget(slices, event, 'li');
        if (!target) return;
        document.querySelectorAll('.has-slice')
            .forEach(div => div.classList.remove('has-slice'));
    });
    slices.addEventListener('click', event => {
        let target = getEventTarget(slices, event, 'li');
        if (!target) return;
        let layercls = '.layer-' + target.dataset.objectid;
        let instances = document.querySelectorAll(layercls);
        let instance = instances[0] as HTMLDivElement;
        if (!instances.length) {
            message(localize('The slice not in current artboard.'));
            return;
        }
        let offsets = instance.getBoundingClientRect()
        let viewer = document.querySelector('.screen-viewer') as HTMLDivElement;
        let scrolls = {
            left: viewer.scrollLeft,
            top: viewer.scrollTop,
        };
        let sizes = {
            width: instance.clientWidth,
            height: instance.clientHeight
        };
        let viewerSizes = {
            width: viewer.clientWidth,
            height: viewer.clientHeight
        };
        viewer.scrollLeft = (offsets.left + scrolls.left) - ((viewerSizes.width - sizes.width) / 2);
        viewer.scrollTop = (offsets.top + scrolls.top - 60) - ((viewerSizes.height - sizes.height) / 2);
        clickElement(instance);
    });
}
