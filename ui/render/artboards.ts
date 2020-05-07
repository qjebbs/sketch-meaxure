import { project, timestamp, localize } from "../common";
import { configs } from "../configs";

export function artboards() {
    let artboardListHTML = [];
    let pagesSelect = [];
    let pagesData: {
        [key: string]: {
            name: string,
            objectID: string,
            count: number
        }
    } = {};
    artboardListHTML.push('<ul class="artboard-list">');
    project.artboards.forEach((artboard, index) => {
        if (!pagesData[artboard.pageObjectID]) {
            pagesData[artboard.pageObjectID] = {
                name: artboard.pageName,
                objectID: artboard.pageObjectID,
                count: 0
            };
        }
        pagesData[artboard.pageObjectID].count++;
        var classNames = (configs.artboardIndex == index && !artboard.fileName) ? ' active' : '',
            fileName = (artboard.fileName) ? ' data-file="' + artboard.fileName + '"' : '',
            imageData = (artboard.imageBase64) ? artboard.imageBase64 : artboard.imagePath + '?' + timestamp;
        artboardListHTML.push(
            '<li id="artboard-' + index + '"' + fileName + ' class="artboard' + classNames + '" data-page-id="' + artboard.pageObjectID + '" data-id="' + artboard.objectID + '" data-index="' + index + '" >',
            '<picture class="preview-img" data-name="' + artboard.name + '">',
            '<img alt="' + artboard.name + '" src="' + imageData + '">',
            '</picture>',
            '<div>',
            '<h3>' + artboard.name + '</h3>',
            '<small>' + artboard.pageName + '</small>',
            '</div>',
            '</li>'
        );
    })
    artboardListHTML.push('</ul>');
    pagesSelect.push('<div class="pages-select" tabindex="0">');
    pagesSelect.push('<h3>' + localize('All artboards') + ' <em>(' + project.artboards.length + ')</em></h3>');
    pagesSelect.push('<ul class="page-list">');
    pagesSelect.push('<li><label><input type="radio" name="page" value="all" checked="checked"><span>' + localize('All artboards') + ' <em>(' + project.artboards.length + ')</em></span></label></li>');

    Object.keys(pagesData).forEach(
        objectID => {
            let artboard = pagesData[objectID];
            pagesSelect.push('<li><label><input type="radio" name="page" value="' + artboard.objectID + '"><span>' + artboard.name + ' <em>(' + artboard.count + ')</em></span></label></li>');
        }
    );
    pagesSelect.push('</ul>');
    pagesSelect.push('</div>');

    document.querySelector('#artboards').innerHTML = [pagesSelect.join(''), artboardListHTML.join('')].join('');
    return this;
}