import { localize, ProjectData, init } from "../common";
import { artboards } from "./artboards";
import { slices } from "./slices";
import { colors } from "./colors";
import { unit } from "./unit";
import { zoom } from "./zoom";
import { events } from "../events";
import { navigateByURLHash } from "../events/navigate";

export function render(data: ProjectData) {
    init(data);
    document.querySelector('#app').innerHTML = [
        '<header>',
        '<div class="header-left">',
        '<ul class="tab">',
        '<li class="icon-artboards current" data-id="artboards"></li>',
        '<li class="icon-slices" data-id="slices"></li>',
        '<li class="icon-colors" data-id="colors"></li>',
        '</ul>',
        '</div>',
        '<div class="header-center">',
        '<div id="zoom" class="zoom-widget"></div>',
        '<div class="flow-mode">',
        `<label for="flow-mode">${localize('FLOW')}</label>`,
        `<div class="slidebox" title="${localize('Keyboard shortcut')}: f">`,
        '<input id="flow-mode" type="checkbox" name="flow-mode">',
        '<label for="flow-mode"></label>',
        '</div>',
        '</div>',
        '<h1></h1>',
        '<div class="show-notes">',
        `<label for="show-notes">${localize('NOTES')}</label>`,
        `<div class="slidebox" title="${localize('Keyboard shortcut')}: n">`,
        '<input id="show-notes" type="checkbox" name="show-notes" checked="checked">',
        '<label for="show-notes"></label>',
        '</div>',
        '</div>',
        '</div>',
        '<div class="header-right"><div id="unit" class="unit-box" tabindex="0">XHDPI @2x (dp/sp)</div></div>',
        '</header>',
        '<main>',
        '<aside class="navbar on">',
        '<section id="artboards"></section>',
        `<section id="slices" style="display: none;"><div class="empty">${localize('No slices added!')}</div></section>`,
        `<section id="colors" style="display: none;"><div class="empty">${localize('No colors added!')}</div></section>`,
        '</aside>',
        '<section class="screen-viewer">',
        '<div class="screen-viewer-inner">',
        '<div id="screen" class="screen">',
        '<div id="rulers" style="display:none;">',
        '<div id="rv" class="ruler v"></div>',
        '<div id="rh" class="ruler h"></div>',
        '</div>',
        '<div id="flows"></div>',
        '<div id="layers"></div>',
        '<div id="notes"></div>',
        '<div id="td" class="distance v" style="display:none;"><div data-height="3"></div></div>',
        '<div id="rd" class="distance h" style="display:none;"><div data-width=""></div></div>',
        '<div id="bd" class="distance v" style="display:none;"><div data-height=""></div></div>',
        '<div id="ld" class="distance h" style="display:none;"><div data-width=""></div></div>',
        '</div>',
        '</div>',
        '<div class="overlay"></div>',
        '</section>',
        '<aside id="inspector" class="inspector"></aside>',
        '</main>',
        '<div id="message" class="message"></div>',
        '<div id="cursor" class="cursor" style="display: none;"></div>'
    ].join('');
    zoom();
    unit();
    artboards();
    slices();
    colors();
    events();
    navigateByURLHash(false);
}
