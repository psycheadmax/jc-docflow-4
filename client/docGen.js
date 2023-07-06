import {saveAs} from 'file-saver'
import {Document, Packer, Paragraph, TextRun} from 'docx'
import tempObjection from './docTemplates/tempObjection';


function docGen(state) {
    const doc = tempObjection(state)
    // or
    
    saveDoc(doc, 'generatedDoc.doc')

}

function saveDoc(doc, fileName) {
    const mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    Packer.toBlob(doc).then(blob => {
        const docblob = blob.slice(0, blob.size, mimeType)
        saveAs(docblob, fileName)
    })
}

// function saveDoc(doc, fileName) {
//     Packer.toBuffer(doc).then((buffer) => {
//         fs.writeFileSync(fileName, buffer)
//     })
// }

// function saveDoc(doc, fileName) {
//     const mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
//     Packer.toBlob(doc).then(blob => {
//         const docBlob = blob.slice(0, blob.size, mimeType)
//         writeFileSync(fileName, docBlob)
//     })
// }

export default docGen;
