// template strings to import to generator

// variables
// fio
// addr
// courtDocNum

// const TEMPLATE_NAME 'Возражения Воркутинские ТЭЦ'

// header
// const HEADER_TO
// const HEADER_FROM
// const HEADER_FROM_ADDR

// title
// const TITLE

// body
// const BODY = []

// ask
// const ASK_TITLE = []
// const ASK_LIST = []

// attachment
// const ATT_TITLE = []
// const ATT_LIST = []

import { AlignmentType, convertInchesToTwip, Document, HeadingLevel, LevelFormat, UnderlineType } from 'docx'

export const headIndent = 3.15
export const textIndent = 0.5
export const textSize = 24

const docStyles = {
    // default: {
    //     heading1: {
    //         run: {
    //             size: 28,
    //             bold: true,
    //             italics: true,
    //             color: "FF0000",
    //         },
    //         paragraph: {
    //             spacing: {
    //                 after: 120,
    //             },
    //         },
    //     },
    //     heading2: {
    //         run: {
    //             size: 26,
    //             bold: true,
    //             underline: {
    //                 type: UnderlineType.DOUBLE,
    //                 color: "FF0000",
    //             },
    //         },
    //         paragraph: {
    //             spacing: {
    //                 before: 240,
    //                 after: 120,
    //             },
    //         },
    //     },
    //     listParagraph: {
    //         run: {
    //             color: "#FF0000",
    //         },
    //     },
    // },
    paragraphStyles: [
        {
            id: "headerTo",
            name: "Header TO",
            basedOn: "Normal",
            next: "Normal",
            run: {
                size: textSize,
                bold: true,
            },
            paragraph: {
                indent: {
                    left: convertInchesToTwip(headIndent),
                },
                spacing: {
                    line: 276,
                },
            },
        },
        {
            id: "headerFrom",
            name: "Header FROM",
            basedOn: "Normal",
            next: "Normal",
            run: {
                size: textSize,
                bold: true,
            },
            paragraph: {
                indent: {
                    left: convertInchesToTwip(headIndent),
                },
                spacing: {
                    line: 276,
                },
            },
        },
        {
            id: "headerFromAddr",
            name: "Header FROM Address",
            basedOn: "Normal",
            next: "Normal",
            run: {
                size: textSize
            },
            paragraph: {
                indent: {
                    left: convertInchesToTwip(headIndent),
                },
                spacing: {
                    line: 276,
                },
            },
        },
        {
            id: "emptyPar",
            name: "Empty Paragraph",
            basedOn: "Normal",
            next: "Normal",
            run: {
                size: 10
            },
            paragraph: {
                spacing: {
                    line: 276,
                    before: 24,
                    after: 24
                }
            },
        },
        {
            id: "title",
            name: "Title",
            basedOn: "Normal",
            next: "Normal",
            run: {
                size: textSize,
                bold: true,
            },
            paragraph: {
                spacing: {
                    line: 276,
                    before: 24,
                    after: 24
                },
                alignment: AlignmentType.CENTER
            },
        },
        {
            id: "body",
            name: "Body",
            basedOn: "Normal",
            next: "Normal",
            run: {
                size: textSize
            },
            paragraph: {
                // leftTabStop: 2268,
                indent: {
                    leftTabStop: convertInchesToTwip(textIndent)
                    // left: convertInchesToTwip(textIndent),
                },
                spacing: {
                    line: 276,
                },
                alignment: AlignmentType.JUSTIFIED
            },
        },
        {
            id: "askTitle",
            name: "Ask title",
            basedOn: "Normal",
            next: "Normal",
            run: {
                size: textSize,
                bold: true,
            },
            paragraph: {
                spacing: {
                    line: 276,
                    before: 24,
                    after: 24
                },
                alignment: AlignmentType.CENTER
            },
        },
        {
            id: "askList",
            name: "Ask list",
            basedOn: "Normal",
            next: "Normal",
            run: {
                size: textSize,
            },
            paragraph: {
                spacing: {
                    line: 276,
                    before: 24,
                    after: 24
                },
                alignment: AlignmentType.JUSTIFIED
            },
        },
        {
            id: "attTitle",
            name: "Attachments title",
            basedOn: "Normal",
            next: "Normal",
            run: {
                size: textSize,
                bold: true,
            },
            paragraph: {
                spacing: {
                    line: 276,
                    before: 24,
                    after: 24
                },
                alignment: AlignmentType.CENTER
            },
        },
        {
            id: "attList",
            name: "Attachments list",
            basedOn: "Normal",
            next: "Normal",
            run: {
                size: textSize,
            },
            paragraph: {
                spacing: {
                    line: 276,
                    before: 24,
                    after: 24
                },
            },
            alignment: AlignmentType.JUSTIFIED
        },
        {
            id: "footer",
            name: "Footer",
            basedOn: "Normal",
            next: "Normal",
            run: {
                size: textSize,
            },
            paragraph: {
                spacing: {
                    line: 276,
                    before: 24,
                    after: 24
                },
            },
        },
// attachment
// const ATT_TITLE = []
// const ATT_LIST = []
        {
            id: "wellSpaced",
            name: "Well Spaced",
            basedOn: "Normal",
            quickFormat: true,
            paragraph: {
                spacing: { line: 276, before: 20 * 72 * 0.1, after: 20 * 72 * 0.05 },
            },
        },
        {
            id: "strikeUnderline",
            name: "Strike Underline",
            basedOn: "Normal",
            quickFormat: true,
            run: {
                strike: true,
                underline: {
                    type: UnderlineType.SINGLE,
                },
            },
        },
    ],
    characterStyles: [
        {
            id: "strikeUnderlineCharacter",
            name: "Strike Underline",
            basedOn: "Normal",
            quickFormat: true,
            run: {
                strike: true,
                underline: {
                    type: UnderlineType.SINGLE,
                },
            },
        },
    ],
}

export default docStyles