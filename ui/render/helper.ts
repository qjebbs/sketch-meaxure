import { configs } from "../configs";
import { localize, project, timestamp } from "../common";

export function unit() {
    let unitsData = [{
        units: [{
            name: localize('Standard'),
            unit: 'px',
            scale: 1
        }]
    },
    {
        name: localize('iOS Devices'),
        units: [{
            name: localize('Points') + ' @1x',
            unit: 'pt',
            scale: 1
        },
        {
            name: localize('Retina') + ' @2x',
            unit: 'pt',
            scale: 2
        },
        {
            name: localize('Retina HD') + ' @3x',
            unit: 'pt',
            scale: 3
        }
        ]
    },
    {
        name: localize('Android Devices'),
        units: [{
            name: 'LDPI @0.75x',
            unit: 'dp/sp',
            scale: .75
        },
        {
            name: 'MDPI @1x',
            unit: 'dp/sp',
            scale: 1
        },
        {
            name: 'HDPI @1.5x',
            unit: 'dp/sp',
            scale: 1.5
        },
        {
            name: 'XHDPI @2x',
            unit: 'dp/sp',
            scale: 2
        },
        {
            name: 'XXHDPI @3x',
            unit: 'dp/sp',
            scale: 3
        },
        {
            name: 'XXXHDPI @4x',
            unit: 'dp/sp',
            scale: 4
        }
        ]
    },
    {
        name: localize('Web View'),
        units: [{
            name: 'CSS Rem 12px',
            unit: 'rem',
            scale: 12
        },
        {
            name: 'CSS Rem 14px',
            unit: 'rem',
            scale: 14
        },
        {
            name: 'CSS Rem 16px',
            unit: 'rem',
            scale: 16
        }
        ]
    }
    ];
    let unitHtml = [];
    let unitList = [];
    let unitCurrent = '';
    let hasCurrent = '';
    unitsData.forEach(data => {
        if (data.name) unitList.push('<li class="sub-title">' + localize(data.name) + '</li>');
        data.units.forEach(
            unit => {
                var checked = '';
                // if(unit.scale == configs.scale){
                if (unit.unit == configs.unit && unit.scale == configs.scale) {
                    checked = ' checked="checked"';
                    hasCurrent = localize(unit.name);
                }
                unitList.push('<li><label><input type="radio" name="resolution" data-name="' + localize(unit.name) + '" data-unit="' + unit.unit + '" data-scale="' + unit.scale + '"' + checked + '><span>' + localize(unit.name) + '</span></label></li>');
                // }
            }
        );
    })
    if (!hasCurrent) {
        unitCurrent = '<li><label><input type="radio" name="resolution" data-name="' + localize('Custom') + ' (' + configs.scale + ', ' + configs.unit + ')" data-unit="' + configs.unit + '" data-scale="' + configs.scale + '" checked="checked"><span>' + localize('Custom') + ' (' + configs.scale + ', ' + configs.unit + ')</span></label></li>';
        hasCurrent = localize('Custom') + ' (' + configs.scale + ', ' + configs.unit + ')';
    }
    unitHtml.push(
        '<div class="overlay"></div>',
        '<h3>' + localize('Design resolution') + '</h3>',
        '<p>' + hasCurrent + '</p>',
        '<ul>',
        unitCurrent,
        unitList.join(''),
        '</ul>'
    );
    document.querySelector('#unit').innerHTML = unitHtml.join('');
}

export function colors() {
    if (!project.colors) {
        return false;
    }
    if (!project.colorNames) project.colorNames = {};
    var colorListHTML = [];
    colorListHTML.push('<ul class="color-list">');
    project.colors.forEach((color, index) => {
        project.colorNames[color.color['argb-hex']] = color.name;
        colorListHTML.push(
            '<li id="color-' + index + '" data-color="' + encodeURI(JSON.stringify(color.color)) + '">',
            '<em><i style="background:' + color.color['css-rgba'] + '"></i></em>',
            '<div>',
            '<h3>' + color.name + '</h3>',
            '<small>' + color.color[configs.colorFormat] + '</small>',
            '</div>',
            '</li>');
    });
    colorListHTML.push('</ul>');
    if (project.colors.length > 0) {
        document.querySelector('#colors').innerHTML = colorListHTML.join('');
    }
    return this;
}

export function notes() {
    var notesHTML = [];
    configs.current.notes.forEach(
        (note, index) => {
            notesHTML.push(
                '<div class="note" data-index="' + (index + 1) + '" style="left: ' + zoomSize(note.rect.x) + 'px; top: ' + zoomSize(note.rect.y) + 'px;"><div style="white-space:nowrap;display:none;">' + note.note + '</div></div>');
        }
    )
    document.querySelector('#notes').innerHTML = notesHTML.join('');
}

export function zoomSize(size: number) {
    return size * configs.zoom;
}

export function screen() {
    var imageData = (configs.current.imageBase64) ? configs.current.imageBase64 : configs.current.imagePath + '?' + timestamp;

    let screen = document.querySelector('#screen') as HTMLElement;
    if (!configs.maxSize) {
        var screenSize = (configs.current.width > configs.current.height) ?
            configs.current.width :
            configs.current.height;
        let viewer = document.querySelector('.screen-viewer');
        let artboardSize = (viewer.clientWidth > viewer.clientHeight) ?
            viewer.clientWidth :
            viewer.clientHeight;
        configs.maxSize = (screenSize > artboardSize) ? screenSize * 5 : artboardSize * 5;

        screen.parentElement.style.width = configs.maxSize + 'px';
        screen.parentElement.style.height = configs.maxSize + 'px';

        var scrollMaxX = configs.maxSize - viewer.clientWidth,
            scrollMaxY = configs.maxSize - viewer.clientHeight,
            scrollLeft = .5 * scrollMaxX,
            scrollTop = .5 * scrollMaxY;

        viewer.scrollLeft = scrollLeft;
        viewer.scrollTop = scrollTop;
    }
    screen.style.width = zoomSize(configs.current.width) + 'px';
    screen.style.height = zoomSize(configs.current.height) + 'px';
    screen.style.background = '#FFF url(' + imageData + ') no-repeat';
    screen.style.backgroundSize = zoomSize(configs.current.width) + 'px ' + zoomSize(configs.current.height) + 'px';
    screen.style.marginLeft = -zoomSize(configs.current.width / 2) + 'px';
    screen.style.marginTop = -zoomSize(configs.current.height / 2) + 'px';
}

export function layers() {
    let layersHTML = [];
    configs.current.layers.forEach(
        (layer, index) => {
            var x = zoomSize(layer.rect.x),
                y = zoomSize(layer.rect.y),
                width = zoomSize(layer.rect.width),
                height = zoomSize(layer.rect.height),
                classNames = ['layer'];

            classNames.push('layer-' + layer.objectID);
            if (configs.selectedIndex == index) classNames.push('selected');
            layersHTML.push([
                '<div id="layer-' + index + '" class="' + classNames.join(' ') + '" data-index="' + index + '" percentage-width="' + percentageSize(layer.rect.width, configs.current.width) + '" percentage-height="' + percentageSize(layer.rect.height, configs.current.height) + '" data-width="' + unitSize(layer.rect.width) + '" data-height="' + unitSize(layer.rect.height) + '" style="left: ' + x + 'px; top: ' + y + 'px; width: ' + width + 'px; height: ' + height + 'px;">',
                '<i class="tl"></i><i class="tr"></i><i class="bl"></i><i class="br"></i>',
                '<b class="et h"></b><b class="er v"></b><b class="eb h"></b><b class="el v"></b>',
                '</div>'
            ].join(''));
        }
    )
    document.querySelector('#layers').innerHTML = layersHTML.join('');
}

export function percentageSize(size: number, size2: number) {
    return (Math.round(size / size2 * 1000) / 10) + "%";
}
export function unitSize(length: number, isText?: boolean) {
    length = Math.round(length / configs.scale * 100) / 100;
    let units = configs.unit.split("/");
    let unit = units[0];
    if (units.length > 1 && isText) {
        unit = units[1];
    }
    return length + unit;
}

export function locationHash(options) {
    if (options) {
        var objHash = {},
            arrHash = [];
        Object.keys(options).forEach(key => {
            let value = options[key];
            if (/[a-z]+/.test(key) && !isNaN(value)) {
                objHash[key] = parseInt(value);
                arrHash.push(key + value);
            }
        });
        window.history.replaceState(undefined, undefined, '#' + arrHash.join('-'));
        return objHash;
    } else {
        var objHash = {},
            hash = window.location.hash.replace(/[\#\-]([a-z]+)([\d]+)/ig, function (match, key, value) {
                objHash[key] = parseInt(value);
                return '';
            });
        return objHash;
    }
}

let msgTimeout;
export function message(msg) {
    let message = document.querySelector('#message') as HTMLDivElement;
    message.innerText = msg;
    message.style.display = 'inherit';
    if (msgTimeout) {
        clearTimeout(msgTimeout);
        msgTimeout = undefined;
    }
    msgTimeout = setTimeout(() => message.style.display = 'none', 1000);
}