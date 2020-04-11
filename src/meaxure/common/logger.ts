// Copyright 2020 Jebbs. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

import { sketch } from "../../sketch";

export enum LOGGER_LEVEL {
    DEBUG = 1,
    INFO,
    WARN,
    ERROR,
    DISABLED,
};

export class Logger {
    private _log_level = LOGGER_LEVEL.INFO;
    constructor(logLevel) {
        if (logLevel) this._log_level = logLevel;
    }
    get logLevel() {
        return this._log_level;
    }
    set logLevel(val: LOGGER_LEVEL) {
        this._log_level = val;
    }
    log(level: LOGGER_LEVEL, ...msgs) {
        if (level < this._log_level) return;
        let time = new Date().toLocaleString();
        console.log(`${time} [${LOGGER_LEVEL[level]}] `, ...msgs);
    }
    debug(...msgs) {
        this.log(LOGGER_LEVEL.DEBUG, ...msgs);
    }
    info(...msgs) {
        sketch.UI.message(msgs.join(' '));
        this.log(LOGGER_LEVEL.INFO, ...msgs);
    }
    warn(...msgs) {
        sketch.UI.message(msgs.join(' '));
        this.log(LOGGER_LEVEL.WARN, ...msgs);
    }
    error(...msgs) {
        sketch.UI.alert('Sketch MeaXure', msgs.join(' '));
        this.log(LOGGER_LEVEL.ERROR, ...msgs);
    }
}

export const logger = new Logger(LOGGER_LEVEL.WARN);
