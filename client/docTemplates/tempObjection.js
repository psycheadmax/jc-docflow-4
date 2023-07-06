import {Document, Paragraph, TextRun, AlignmentType, TabStopType, convertInchesToTwip} from 'docx'
import docStyles from './docStyles'
import {headIndent, textIndent, textSize} from './docStyles'

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
// const ASK = []

// attachment
// const ATT = []

function tempObjection(state) {
    const doc = new Document({
        creator: 'jc',
        title: `${state.lastName} ${state.firstName} - возражения`,
        styles: docStyles,
        sections: [
            {
                properties: {},
                children: [
                    new Paragraph({
                        text: `Мировому судье`,
                        style: 'headerTo'
                    }),
                    new Paragraph({
                        text: `Северного судебного участка г. Воркуты РК`,
                        style: 'headerTo'
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `${state.lastName} ${state.firstName},`,
                                bold: true
                            }),
                            new TextRun({
                                text: `24.12.1990 г.р., зарегистрирован по месту жительства по адресу: 169926, г. Воркута, ул. Цементнозаводская, д. 5, кв. 35`
                            })
                        ],
                        style: 'headerFrom'
                    }),
                    new Paragraph({
                        text: ``,
                        style: 'emptyPar'
                    }),
                    new Paragraph({
                        text: `ВОЗРАЖЕНИЯ`,
                        style: 'title'
                    }),
                    new Paragraph({
                        text: `относительно исполнения судебного приказа № 2-4074/2022`,
                        style: 'title'
                    }),
                    new Paragraph({
                        text: ``,
                        style: 'emptyPar'
                    }),
                    new Paragraph({
                        children: [new TextRun(`\tСудебным приказом мирового судьи Северного судебного участка г. Воркуты РК № 2-4074/2022 с меня взысканы денежные средства, а также государственная пошлина.
По адресу моей регистрации по месту жительства (г. Воркута, ул. Цементнозаводская, д. 5, кв. 35) копия названного судебного приказа не направлялась и до сих пор не получена мной.
Кроме того, на дату его вынесения – 25.07.2022 – я, находился за пределами г. Воркуты.
Так, 21.03.2021 я выехал из г. Воркуты в г. Новый Уренгой с пересадкой в г. Кирове.
Вернулся в г. Воркуту я только 29.07.2022 – копии проездных документов прилагаю.
\tО факте вынесения судебного приказа я узнал только 29.09.2022, получив постановление судебного пристава от 29.09.2022 возбуждении исполнительного производства.
Изложенные обстоятельства свидетельствуют о том, что я не имел объективной возможности своевременно получить копию указанного судебного приказа по месту своей регистрации.
Считаю предъявленный взыскателем размер задолженности необоснованно исчисленным, а требования – спорными.
На основании изложенного и в соответствии со ст.128, 129 ГПК РФ`)],
                        tabStops: [{
                            type: TabStopType.LEFT,
                            position: convertInchesToTwip(textIndent/2),
                            }],
                        style: 'body'
                    }),
                    new Paragraph({
                        text: `прошу:`,
                        style: 'askTitle'
                    }),
                    new Paragraph({
                        text: `отменить судебный приказ мирового судьи Северного судебного участка г. Воркуты РК № 2-4074/2022 и отозвать его с исполнения из ОСП по г. Воркуте УФССП России по РК, а из ИФНС по г. Воркуте РК – исполнительный лист на взыскание государственной пошлины.`,
                        bullet:{level: 0},
                        style: 'askList'
                    }),
                    new Paragraph({
                        text: `восстановить срок на подачу возражений относительно исполнения судебного приказа мирового судьи Северного судебного участка г. Воркуты РК № 2-4074/2022 в связи с тем, что его копия до настоящего времени по месту моей регистрации по месту жительства (г. Воркута, ул. Цементнозаводская, д. 5, кв. 35) не направлялась и не могла быть мной получена по нему в связи с моим выездом за пределы г. Воркуты в период с 21.03.2021 по 29.07.2022;`,
                        bullet:{level: 0},
                        style: 'askList'
                    }),
                    new Paragraph({
                        text: `отменить судебный приказ мирового судьи Северного судебного участка г. Воркуты РК № 2-4074/2022 и отозвать его с исполнения из ОСП по г. Воркуте УФССП России по РК, а из ИФНС по г. Воркуте РК – исполнительный лист на взыскание государственной пошлины.`,
                        bullet:{level: 0},
                        style: 'askList'
                    }),
                    new Paragraph({
                        text: `Приложение:`,
                        style: 'attTitle'
                    }),
                    new Paragraph({
                        text: `Копия возражений для взыскателя.`,
                        style: 'attList'
                    }),
                    new Paragraph({
                        text: `Копия страниц паспорта, подтверждающая регистрацию по месту жительства по адресу: г. Воркута, ул. Цементнозаводская, д. 5, кв. 35).`,
                        style: 'attList'
                    }),
                    new Paragraph({
                        text: `Бланк проездного документа № 72013441184611, подтверждающего выезд из Воркуты 21.03.2021 по маршруту Воркута-Киров.`,
                        style: 'attList'
                    }),
                    new Paragraph({
                        text: `Бланк проездного документа № 72063441184810, подтверждающего выезд из Кирова 22.03.2022 по маршруту Киров-Новый Уренгой.`,
                        style: 'attList'
                    }),
                    new Paragraph({
                        text: `Копия электронного билета по маршруту Саратов-Ртищево от 26.07.2022.`,
                        style: 'attList'
                    }),
                    new Paragraph({
                        text: `Копия электронного билета по маршруту Ртищево-Воркута от 29.07.2022.`,
                        style: 'attList'
                    }),
                    new Paragraph({
                        text: `Копия постановления СПИ от 29.09.2022.`,
                        style: 'attList'
                    }),
                    new Paragraph({
                        children: [new TextRun(`06.10.2022\tИ.Р. Ахметов`)],
                        tabStops: [{
                            type: TabStopType.RIGHT,
                            position: convertInchesToTwip(textIndent*13),
                        }],
                        style: 'footer'
                    }),
                ]
            }
            
        ]
    })
    return doc
}

export default tempObjection;
