import { getIndex } from "./helper";
import { eventDelegate } from "./delegate";
import { gotoArtboard } from "./navigate";

export function artboardsEvents() {
    let artboardsList = document.querySelector('#artboards') as HTMLElement;
    eventDelegate(artboardsList, 'click', '.artboard', function (event) {
        let index = getIndex(this);
        gotoArtboard(index);
    });
    eventDelegate(artboardsList, 'change', 'input[name=page]', function (event) {
        var pObjectID = (document.querySelector('.page-list input[name=page]:checked') as HTMLInputElement).value;
        document.querySelector('.pages-select h3')
            .innerHTML = this.parentElement.querySelector('span').innerHTML;
        document.querySelectorAll('.artboard-list li').forEach((li: HTMLElement) => {
            if (pObjectID == 'all' || li.getAttribute('data-page-id') == pObjectID) {
                li.style.display = '';
            } else {
                li.style.display = 'none';
            }
        });
        (document.querySelector('.pages-select') as HTMLElement).blur();
        event.stopPropagation();
    });
}