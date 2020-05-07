import { configs } from "../configs";
import { SMRect } from "../../src/meaxure/interfaces";

export function getEventTargetFromSelector(event: Event, selector: string): HTMLElement {
    let selection = document.querySelectorAll(selector);
    let current = event.target as HTMLElement;
    while (current) {
        for (let el of selection) {
            if (el === current) {
                return current;
            }
        }
        current = current.parentElement;
    }
    return undefined;
}

export function getIndex(element: HTMLElement): number {
    return parseInt(element.dataset.index);
}

export function mouseoutLayer() {
    document.querySelector('.hover')?.classList.remove('hover');
    (document.querySelector('#rulers') as HTMLElement).style.display = 'none';
}

export function selectedLayer() {
    if (configs.selectedIndex == undefined) return false;
    document.querySelector('.selected')?.classList.remove('selected');
    document.querySelector('#layer-' + configs.selectedIndex).classList.add('selected');
    (document.querySelector('#rulers') as HTMLElement).style.display = 'none';
}


export function removeSelected() {
    if (configs.selectedIndex === undefined) return false;
    document.querySelector('#layer-' + /**this.**/configs.selectedIndex).classList.remove('selected');
    (document.querySelector('#rulers') as HTMLElement).style.display = 'none';
}

export function scaleSize(length: number) {
    return Math.round(length / configs.scale * 10) / 10;
}

export function getIntersection(a: SMRect, b: SMRect): SMRect {
    let x1 = Math.max(a.x, b.x);
    let y1 = Math.max(a.y, b.y);
    let x2 = Math.min(a.x + a.width, b.x + b.width);
    let y2 = Math.min(a.y + a.height, b.y + b.height);
    let width = x2 - x1;
    let height = y2 - y1;
    if (width < 0 || height < 0) {
        // no intersection
        return undefined;
    }
    return {
        x: x1,
        y: y1,
        width: width,
        height: height,
    }
}

export function clickElement(element: HTMLDivElement) {
    let e = document.createEvent("MouseEvents");
    e.initEvent("click", true, true);
    element.dispatchEvent(e);
}
