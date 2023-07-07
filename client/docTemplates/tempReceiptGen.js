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

// DELETE jTHIS COMMENT LATER ust for changes to capitalize first letter

export default TempReceiptGen