import { state } from "../common";
import { localize } from "../common";
export function unit() {
    let unitsData = [
        {
            units: [
                { name: localize('Standard'), unit: 'px', scale: 1 }
            ]
        },
        {
            name: localize('iOS Devices'),
            units: [
                { name: localize('Points') + ' @1x', unit: 'pt', scale: 1 },
                { name: localize('Retina') + ' @2x', unit: 'pt', scale: 2 },
                { name: localize('Retina HD') + ' @3x', unit: 'pt', scale: 3 }
            ]
        },
        {
            name: localize('Android Devices'),
            units: [
                { name: 'LDPI @0.75x', unit: 'dp/sp', scale: .75 },
                { name: 'MDPI @1x', unit: 'dp/sp', scale: 1 },
                { name: 'HDPI @1.5x', unit: 'dp/sp', scale: 1.5 },
                { name: 'XHDPI @2x', unit: 'dp/sp', scale: 2 },
                { name: 'XXHDPI @3x', unit: 'dp/sp', scale: 3 },
                { name: 'XXXHDPI @4x', unit: 'dp/sp', scale: 4 }
            ]
        },
        {
            name: localize('Web View'),
            units: [
                { name: 'CSS Rem 12px', unit: 'rem', scale: 12 },
                { name: 'CSS Rem 14px', unit: 'rem', scale: 14 },
                { name: 'CSS Rem 16px', unit: 'rem', scale: 16 }
            ]
        }
    ];
    let unitHtml = [];
    let unitList = [];
    let unitCurrent = '';
    let hasCurrent = '';
    unitsData.forEach(data => {
        if (data.name) unitList.push('<li class="sub-title">' + localize(data.name) + '</li>');
        data.units.forEach(unit => {
            var checked = '';
            if (unit.unit == state.unit && unit.scale == state.scale) {
                checked = ' checked="checked"';
                hasCurrent = localize(unit.name);
            }
            unitList.push(
                '<li><label><input type="radio" name="resolution" data-name="' + localize(unit.name) +
                '" data-unit="' + unit.unit +
                '" data-scale="' + unit.scale + '"' + checked +
                '><span>' + localize(unit.name) + '</span></label></li>');
        });
    });
    if (!hasCurrent) {
        unitCurrent = '<li><label><input type="radio" name="resolution" data-name="' + localize('Custom') +
            ' (' + state.scale + ', ' + state.unit + ')" data-unit="' + state.unit +
            '" data-scale="' + state.scale +
            '" checked="checked"><span>' + localize('Custom') + ' (' + state.scale + ', ' + state.unit + ')</span></label></li>';
        hasCurrent = localize('Custom') + ' (' + state.scale + ', ' + state.unit + ')';
    }
    unitHtml.push('<div class="overlay"></div>', '<h3>' + localize('Design resolution') +
        '</h3>', '<p>' + hasCurrent + '</p>', '<ul>', unitCurrent, unitList.join(''), '</ul>');
    document.querySelector('#unit').innerHTML = unitHtml.join('');
}
