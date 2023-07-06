import React from 'react'
import { PDFViewer } from '@react-pdf/renderer';
import './receipt/styles.css'

function TempReceiptGen({dangerousData}) {
   return(
      <PDFViewer>
         <div dangerouslySetInnerHTML={{__html: dangerousData}} />
      </PDFViewer>
   )
}

export default TempReceiptGen