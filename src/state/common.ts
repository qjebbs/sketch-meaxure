export const prefix = "SMConfigs2",
    BorderPositions = ["center", "inside", "outside"],
    FillTypes = ["color", "gradient"],
    GradientTypes = ["linear", "radial", "angular"],
    ShadowTypes = ["outer", "inner"],
    TextAligns = ["left", "right", "center", "justify", "left"],
    ResizingType = ["stretch", "corner", "resize", "float"],
    colorNames = {},
    emojiRegExp = new RegExp('(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])', 'g'),
    regexNames = /(?:\#(?:width|height|spacing|properties)-(?:left|right|center|top|bottom|middle|horizontal|vertical))|(?:\#(?:coordinate|overlay))|(?:OVERLAY|WIDTH|HEIGHT|TOP|RIGHT|BOTTOM|LEFT|VERTICAL|HORIZONTAL|NOTE|PROPERTY|LITE)\#/,
    colors = {
        coordinate: {
            shape: {
                r: .29,
                g: .56,
                b: .89,
                a: 1
            },
            text: {
                r: 1,
                g: 1,
                b: 1,
                a: 1
            }
        },
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