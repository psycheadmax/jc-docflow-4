import React, { Component } from 'react';
import { EditorState, convertToRaw, convertFromRaw, convertFromHTML } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import '../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import draftToHtml from 'draftjs-to-html';
// import htmlToDraft from 'html-to-draftjs';
import htmlDocx from 'html-docx-js'
import { saveAs } from 'file-saver';

import { connect } from 'react-redux';
import { captureActionCreator,
    addressPhoneUpdateActionCreator,
    birthPassportUpdateActionCreator,
    removeActionCreator
 } from '../store/personReducer';

// const content = {"entityMap":{},"blocks":[{"key":"637gr","text":"Initialized from content state.","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}]}
const content = {
    "entityMap": {},
    "blocks": [
      {
        "key": "637gr",
        "text": "Lorem ipsum dolor sit amet %ФАМИЛИЯ% adipisicing elit. Ullam fuga quibusdam natus exercitationem consequuntur, minus earum nihil cupiditate, laudantium numquam fugit corporis dolorem. Aspernatur fuga sunt, consequuntur consectetur rem ullam.",
        "type": "unstyled",
        "depth": 0,
        "inlineStyleRanges": [],
        "entityRanges": [],
        "data": {}
      },
      {
        "key": "637gs",
        "text": "Lorem ipsum dolor sit amet %ИМЯ% adipisicing elit. Ullam fuga quibusdam natus exercitationem consequuntur, minus earum nihil cupiditate, laudantium numquam fugit corporis dolorem. Aspernatur fuga sunt, consequuntur consectetur rem ullam.",
        "type": "unstyled",
        "depth": 0,
        "inlineStyleRanges": [],
        "entityRanges": [],
        "data": {}
      },
      {
        "key": "637gt",
        "text": "Lorem ipsum dolor sit amet %ОТЧЕСТВО% adipisicing elit. Ullam fuga quibusdam natus exercitationem consequuntur, minus earum nihil cupiditate, laudantium numquam fugit corporis dolorem. Aspernatur fuga sunt, consequuntur consectetur rem ullam.",
        "type": "unstyled",
        "depth": 0,
        "inlineStyleRanges": [],
        "entityRanges": [],
        "data": {}
      }
    ]
  }

const tokens = [
    ["%ФАМИЛИЯ%", "Петров"],
    ["%ИМЯ%", "Петр"],
    ["%ОТЧЕСТВО%", "Петрович"]
] // TODO get and show possible tokens for current person

class TempAnyDoc extends Component {
  constructor(props) {
    super(props);
    const contentState = convertFromRaw(content);
    console.log('contentState:')
    console.log(contentState)

    this.state = {
      editorState: EditorState.createWithContent(contentState),
      stringHTML: ''
    };
    
    this.renderCompToString = this.renderCompToString.bind(this)
    this.callSave = this.callSave.bind(this)
    this.replaceTokens = this.replaceTokens.bind(this)
}

    componentDidMount() {
        this.renderCompToString()
    }

  onEditorStateChange = (editorState) => {
    this.setState({
      editorState,
    });
    setTimeout(() => {
        this.renderCompToString()
    }, 1000);
};

renderCompToString() {
    this.setState({
        ...this.state,
        stringHTML: draftToHtml(convertToRaw(this.state.editorState.getCurrentContent()))
    })
}

replaceTokens(e) {
    e.preventDefault()
    let data = this.state.stringHTML
    tokens.forEach(element => {
        data = data.replaceAll(element[0], element[1])
    })
    this.setState({
        ...this.state,
        stringHTML: data
    })
    //  TODO mark right and wrong expressions
}

callSave(e) {
    e.preventDefault()
    let stringHTMLFinal = `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <title>Document</title>
        </head>
    <body>`
    stringHTMLFinal += this.state.stringHTML
    stringHTMLFinal += `
    </body>
    </html>
    `
    console.log(this.state.editorState)
    console.log(this.state.editorState.getCurrentContent())
    const converted = htmlDocx.asBlob(stringHTMLFinal)
    saveAs(converted, 'tempanydoc-test.docx')
}

  render() {
    console.log('this.props:')
    console.log(this.props)
    const { editorState } = this.state;
    return (
        <>
        <Editor
            editorState={editorState}
            wrapperClassName="demo-wrapper"
            editorClassName="demo-editor"
            onEditorStateChange={this.onEditorStateChange}
        />
        <textarea name="" id="textarea" cols="150" rows="1" resizable="true" value={this.state.stringHTML} readOnly></textarea>
        <button className="btn btn-danger btn-md btn-block" type="submit" onClick={this.replaceTokens} >Замена</button>
        <button className="btn btn-danger btn-md btn-block" type="submit" onClick={this.callSave} >ВВорт</button>
        </>
    )
  }
}

const mapStateToProps = (state, ownProps) => { 
    console.log('state:')
    console.log(state)
    console.log('ownProps:')
    console.log(ownProps)
    return {
        person: state
    }
 }
// const mapDisptachToProps = {
//     captureActionCreator
// }

export default connect(mapStateToProps)(TempAnyDoc)
export { TempAnyDoc }