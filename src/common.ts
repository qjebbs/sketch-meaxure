import { logger } from "./logger";
import { context } from "./context";

export let prefix = "SMConfigs2",
    regexNames = /(?:\#(?:width|height|spacing|properties)-(?:left|right|center|top|bottom|middle|horizontal|vertical))|(?:\#(?:coordinate|overlay))|(?:OVERLAY|WIDTH|HEIGHT|TOP|RIGHT|BOTTOM|LEFT|VERTICAL|HORIZONTAL|NOTE|PROPERTY|LITE)\#/,
    colors = {
        overlay: {
            layer: {
                r: 1,
                g: 0.333333,
                b: 0,
                a: 0.3
            },
            text: {
                r: 1,
                g: 1,
                b: 1,
                a: 1
            }
        },
        size: {
            layer: {
                r: 1,
                g: 0.333333,
                b: 0,
                a: 1
            },
            text: {
                r: 1,
                g: 1,
                b: 1,
                a: 1
            }
        },
        spacing: {
            layer: {
                r: 0.313725,
                g: 0.890196,
                b: 0.760784,
                a: 1
            },
            text: {
                r: 1,
                g: 1,
                b: 1,
                a: 1
            }
        },
        property: {
            layer: {
                r: 0.960784,
                g: 0.650980,
                b: 0.137255,
                a: 1
            },
            text: {
                r: 1,
                g: 1,
                b: 1,
                a: 1
            }
        },
        lite: {
            layer: {
                r: 0.564706,
                g: 0.074510,
                b: 0.996078,
                a: 1
            },
            text: {
                r: 1,
                g: 1,
                b: 1,
                a: 1
            }
        },
        note: {
            layer: {
                r: 1,
                g: 0.988235,
                b: 0.862745,
                a: 1
            },
            border: {
                r: 0.8,
                g: 0.8,
                b: 0.8,
                a: 1
            },
            text: {
                r: 0.333333,
                g: 0.333333,
                b: 0.333333,
                a: 1
            }
        }
    }