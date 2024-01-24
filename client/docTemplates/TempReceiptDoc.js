import React, { useState, useEffect, forwardRef } from 'react'
import './TempReceiptForm.css'

function Page({receiptData}) {
    return(       
        <div className="table-receipt">
                <table className="fixed">
                    <col width="5.9%"></col>
                    <col width="4.8%"></col>
                    <col width="9.1%"></col>
                    <col width="9.1%"></col>
                    <col width="9.1%"></col>
                    <col width="3.8%"></col>
                    <col width="4.3%"></col>
                    <col width="3.2%"></col>
                    <col width="2.2%"></col>
                    <col width="3.8%"></col>
                    <col width="5.9%"></col>
                    <col width="1.1%"></col>
                    <col width="1.1%"></col>
                    <col width="2.2%"></col>
                    <col width="5.9%"></col>
                    <col width="5%"></col>
                    <col width="5.7%"></col>
                    <col width="2.7%"></col>
                    <col width="3.8%"></col>
                    <col width="6.5%"></col>
                    <col width="5.8%"></col>
                <tr>
                    <td colSpan="5"></td>
                    <td colSpan="6" className="ko1">Унифицированная форма № КО-1</td>
                    <td rowSpan="28" className="cutline"></td>
                    <td rowSpan="28"></td>
                    <td rowSpan="3" colSpan="8" className="undercell centertext bold">{receiptData.docProps.organization}</td>
                </tr>
                <tr>
                    <td colSpan="5"></td>
                    <td colSpan="6" className="ko1">Утверждено постановлением Госкомстата</td>
                </tr>
                <tr>
                    <td colSpan="5"></td>
                    <td colSpan="6" className="ko1">России от 18.08.98г №88</td>
                </tr>
                <tr>
                    <td colSpan="11"></td>
                    <td colSpan="8" className="sign">организация</td>
                </tr>
                <tr>
                    <td colSpan="8"></td>
                    <td colSpan="3" className="wholecell centertext">Код</td>
                    <td colSpan="8"></td>
                </tr>
                <tr>
                    <td colSpan="5"></td>
                    <td colSpan="3" className="">Форма по ОКУД</td>
                    <td colSpan="3" className="wholecell centertext">0310001</td>
                    <td colSpan="8" className="centertext bold">КВИТАНЦИЯ</td>
                </tr>
                <tr>
                    <td colSpan="5" className="undercell centertext bold">{receiptData.docProps.organization}</td>
                    <td colSpan="3">Форма по ОКПО</td>
                    <td colSpan="3" className="wholecell"></td>
                    <td colSpan="8"></td>
                </tr>
                <tr>
                    <td colSpan="5" className="sign">организация</td>
                    <td colSpan="6"></td>
                    <td colSpan="6">к приходному кассовому ордеру</td>
                    <td colSpan="2" className="undercell centertext">{receiptData.number}</td>
                </tr>
                <tr>
                    <td colSpan="5" className="undercell centertext"></td>
                    <td colSpan="6"></td>
                    <td colSpan="2">от</td>
                    <td colSpan="5" className="undercell centertext">{receiptData.date}</td>
                    <td colSpan="1"></td>
                </tr>
                <tr>
                    <td colSpan="5" className="sign">структурное подразделение</td>
                    <td></td>
                    <td colSpan="3" className="wholecell centertext">Номер документа</td>
                    <td colSpan="2" className="wholecell centertext">Дата составления</td>
                    <td colSpan="2">Принято от</td>
                    <td colSpan="6" className="undercell bold italic">{receiptData.docProps.lastNameGenitive}</td>
                </tr>
                <tr>
                    <td colSpan="6" className="centertext bold">ПРИХОДНЫЙ КАССОВЫЙ ОРДЕР</td>
                    <td colSpan="3" className="wholecell centertext">{receiptData.number}</td>
                    <td colSpan="2" className="wholecell centertext">{receiptData.date}</td>
                    <td colSpan="8" className="undercell centertext bold italic">{receiptData.docProps.firstNameGenitive} {receiptData.docProps.middleNameGenitive}</td>
                </tr>
                <tr>
                    <td colSpan="11"></td>
                    <td colSpan="2">Основание:</td>
                    <td colSpan="6"></td>
                </tr>
                <tr>
                    <td rowSpan="2" className="wholecell centertext">Дебет</td>
                    <td colSpan="4" className="wholecell centertext">Кредит</td>
                    <td colSpan="2" rowSpan="2" className="wholecell centertext">Cумма, руб. коп.</td>
                    <td colSpan="3" rowSpan="2" className="wholecell centertext">Код целевого назаначения</td>
                    <td rowSpan="2" className="wholecell centertext"></td>
                    <td colSpan="8" rowSpan="2" className="reason italic">{receiptData.docProps.reason}</td>
                </tr>
                <tr>
                    <td className="wholecell centertext"></td>
                    <td className="wholecell centertext">код структурного подразделения</td>
                    <td className="wholecell centertext">корреспон- дирующий счет, субсчет</td>
                    <td className="wholecell centertext">код аналитического учета</td>
                </tr>
                <tr>
                    <td className="wholecell centertext"></td>
                    <td className="wholecell centertext"></td>
                    <td className="wholecell centertext"></td>
                    <td className="wholecell centertext"></td>
                    <td className="wholecell centertext"></td>
                    <td colSpan="2" className="wholecell centertext bold">{receiptData.sum}</td>
                    <td colSpan="3" className="wholecell centertext"></td>
                    <td className="wholecell centertext"></td>
                    <td colSpan="2">Сумма</td>
                    <td colSpan="3" className=" undercell centertext bold">{receiptData.sum}</td>
                    <td className="centertext">руб.</td>
                    <td className="undercell centertext bold">00</td>
                    <td className="centertext">коп.</td>
                </tr>
                <tr>
                    <td colSpan="11"></td>
                    <td colSpan="3"></td>
                    <td colSpan="2" className="sign">цифрами</td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td colSpan="11"></td>
                    <td colSpan="8" className="undercell centertext italic">{receiptData.sumLetters}</td>
                </tr>
                <tr>
                    <td colSpan="2">Принято от</td>
                    <td colSpan="9" className="undercell centertext bold italic">{receiptData.docProps.lastNameGenitive} {receiptData.docProps.firstNameGenitive} {receiptData.docProps.middleNameGenitive}</td>
                    <td colSpan="8" className="undercell sign">прописью</td>
                </tr>
                <tr>
                    <td colSpan="2">Основание</td>
                    <td colSpan="9" rowSpan="2" className="reason italic">{receiptData.docProps.reason}</td>
                    <td colSpan="8" className="undercell">-------</td>
                </tr>
                <tr>
                    <td colSpan="2"></td>
                    <td colSpan="4" className="undercell centertext">-------</td>
                    <td>руб.</td>
                    <td className="undercell centertext">00</td>
                    <td>коп.</td>
                    <td></td>
                </tr>
                <tr>
                    <td>Сумма</td>
                    <td colSpan="10" className="undercell centertext italic">{receiptData.sumLetters}</td>
                    <td colSpan="3">В том числе</td>
                    <td colSpan="5" className="undercell centertext">без НДС</td>
                </tr>
                <tr>
                    <td colSpan="6" className="undercell centertext"></td>
                    <td>руб.</td>
                    <td colSpan="3" className="undercell centertext">00</td>
                    <td>коп.</td>
                    <td colSpan="8"></td>
                </tr>
                <tr>
                    <td colSpan="2">В том числе</td>
                    <td colSpan="9" className="undercell centertext">без НДС</td>
                    <td colSpan="8"></td>
                </tr>
                <tr>
                    <td colSpan="2">Приложение</td>
                    <td colSpan="9" className="undercell centertext">{receiptData.docProps.attachment}</td>
                    <td colSpan="2"></td>
                    <td colSpan="6">М.П. (штампа)</td>
                </tr>
                <tr>
                    <td colSpan="3">Главный бухгалтер</td>
                    <td colSpan="2" className="undercell centertext"></td>
                    <td colSpan="3" className="undercell centertext">{receiptData.docProps.mainAccountant}</td>
                    <td colSpan="3"></td>
                    <td colSpan="3">Гл. бухгалтер</td>
                    <td colSpan="2" className="undercell centertext"></td>
                    <td colSpan="3" className="undercell centertext">{receiptData.docProps.mainAccountant}</td>
                </tr>
                <tr>
                    <td colSpan="3"></td>
                    <td colSpan="2" className="sign">подпись</td>
                    <td colSpan="3" className="sign">расшифровка подписи</td>
                    <td colSpan="3"></td>
                    <td colSpan="3"></td>
                    <td colSpan="2" className="sign">подпись</td>
                    <td colSpan="3" className="sign">расшифровка подписи</td>
                </tr>
                <tr>
                    <td colSpan="3">Получил кассир</td>
                    <td colSpan="2" className="undercell centertext"></td>
                    <td colSpan="3" className="undercell centertext">{receiptData.docProps.cashier}</td>
                    <td colSpan="3"></td>
                    <td colSpan="3">Кассир</td>
                    <td colSpan="2" className="undercell centertext"></td>
                    <td colSpan="3" className="undercell centertext">{receiptData.docProps.cashier}</td>
                </tr>
                <tr className="dotline">
                    <td colSpan="3"></td>
                    <td colSpan="2" className="sign">подпись</td>
                    <td colSpan="3" className="sign">расшифровка подписи</td>
                    <td colSpan="3"></td>
                    <td colSpan="3"></td>
                    <td colSpan="2" className="sign">подпись</td>
                    <td colSpan="3" className="sign">расшифровка подписи</td>
                </tr>
            </table>    
        </div>
    )
}

const TempReceiptDoc = forwardRef(({receiptData}, ref) => {
    return(
            <div ref={ref}>
                <Page receiptData={receiptData} />
                <Page receiptData={receiptData} />
            </div>
    )
})

export { TempReceiptDoc }
