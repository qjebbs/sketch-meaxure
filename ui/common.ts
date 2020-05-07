export var I18N = {};
export var lang = navigator.language.toLocaleLowerCase();
export var timestamp = new Date().getTime();

export function localize(str) {
    return (I18N[lang] && I18N[lang][str]) ? I18N[lang][str] : str;
}

import { ExportData } from '../src/meaxure/interfaces'
import { configs } from './configs';

export type ProjectData = ExportData & { colorNames: { [key: string]: string }, language: any }

export let project: ProjectData = <ProjectData>{};

export function init(data: ProjectData): void {
    configs.scale = data.scale;
    configs.colorFormat = data.colorFormat;
    configs.unit = data.unit;
    I18N = data.language || {};
    project = data;
}
