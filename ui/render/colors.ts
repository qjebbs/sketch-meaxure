import { state } from "../common";
import { project } from "../common";
export function colors() {
    if (!project.colors) {
        return false;
    }
    if (!project.colorNames)
        project.colorNames = {};
    var colorListHTML = [];
    colorListHTML.push('<ul class="color-list">');
    project.colors.forEach((color, index) => {
        project.colorNames[color.color['argb-hex']] = color.name;
        colorListHTML.push('<li id="color-' + index + '" data-color="' + encodeURI(JSON.stringify(color.color)) + '">', '<em><i style="background:' + color.color['css-rgba'] + '"></i></em>', '<div>', '<h3>' + color.name + '</h3>', '<small>' + color.color[state.colorFormat] + '</small>', '</div>', '</li>');
    });
    colorListHTML.push('</ul>');
    if (project.colors.length > 0) {
        document.querySelector('#colors').innerHTML = colorListHTML.join('');
    }
}
