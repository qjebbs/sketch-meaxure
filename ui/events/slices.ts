import { clickElement } from "./helper";
import { message } from "../render/helper";
import { localize } from "../common";
import { eventDelegate } from "./delegate";

export function sliceEvents() {
    let slices = document.querySelector('#slices') as HTMLDivElement;
    eventDelegate(slices, 'mouseover', 'li', function (event) {
        document.querySelectorAll('.layer-' + this.dataset.objectid)
            .forEach(div => div.classList.add('has-slice'));
    });
    eventDelegate(slices, 'mouseout', 'li', function (event) {
        document.querySelectorAll('.has-slice')
            .forEach(div => div.classList.remove('has-slice'));
    });
    eventDelegate(slices, 'click', 'li', function (event) {
        let layercls = '.layer-' + this.dataset.objectid;
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
