import { state } from "../common";
import { localize } from "../common";
export function unit() {
    let unitsData = [
        {
            name: localize('Device switch'),
            units: [
                { name: localize('Web View') + ' - px', unit: 'px', scale: 1 },
                { name: localize('iOS Devices') + ' - pt', unit: 'pt', scale: 1 },
                { name: localize('Android Devices') + ' - dp/sp', unit: 'dp/sp', scale: 1 },
            ]
        },
        {
            name: localize('Convert to pixels'),
            units: [
                { name: 'IOS ' + localize('Points') + ' @1x', unit: 'px', scale: 1 },
                { name: 'IOS ' + localize('Retina') + ' @2x', unit: 'px', scale: 2 },
                { name: 'IOS ' + localize('Retina HD') + ' @3x', unit: 'px', scale: 3 },
                { name: 'Android LDPI @0.75x', unit: 'px', scale: .75 },
                { name: 'Android MDPI @1x', unit: 'px', scale: 1 },
                { name: 'Android HDPI @1.5x', unit: 'px', scale: 1.5 },
                { name: 'Android XHDPI @2x', unit: 'px', scale: 2 },
                { name: 'Android XXHDPI @3x', unit: 'px', scale: 3 },
                { name: 'Android XXXHDPI @4x', unit: 'px', scale: 4 }
            ]
        },
        {
            name: localize('Convert to others'),
            units: [
                { name: 'CSS Rem 8px', unit: 'rem', scale: 1 / 8 },
                { name: 'CSS Rem 10px', unit: 'rem', scale: 1 / 10 },
                { name: 'CSS Rem 12px', unit: 'rem', scale: 1 / 12 },
                { name: 'CSS Rem 14px', unit: 'rem', scale: 1 / 14 },
                { name: 'CSS Rem 16px', unit: 'rem', scale: 1 / 16 },
                { name: 'Ubuntu Grid', unit: 'gu', scale: 1 / 27 }
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
            if (!hasCurrent && unit.unit == state.unit) {
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
    // if (!hasCurrent) {
    //     unitCurrent = '<li><label><input type="radio" name="resolution" data-name="' + localize('Custom') +
    //         ' (' + state.scale + ', ' + state.unit + ')" data-unit="' + state.unit +
    //         '" data-scale="' + state.scale +
    //         '" checked="checked"><span>' + localize('Custom') + ' (' + state.scale + ', ' + state.unit + ')</span></label></li>';
    //     hasCurrent = localize('Custom') + ' (' + state.scale + ', ' + state.unit + ')';
    // }
    unitHtml.push('<div class="overlay"></div>', '<h3>' + localize('Unit switch') +
        '</h3>', '<p>' + hasCurrent + '</p>', '<ul>', unitCurrent, unitList.join(''), '</ul>');
    document.querySelector('#unit').innerHTML = unitHtml.join('');
}
