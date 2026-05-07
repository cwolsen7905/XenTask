import React, { useState, useRef, useContext } from 'react';
import CkEditor from './CkEditor';
import axios from 'axios';
import { DataContext } from '../Contexts/DataContext';

const FieldsDescription = ({ description, taskId, getEditRef }) => {

  const { globalData } = useContext(DataContext);
  const [isEditorActive, setIsEditorActive] = useState(false);
  const [descriptData, setDescriptData] = useState(description);
  const descriptionDiv = useRef(null);
  const editorRef = useRef(null);

  /**
   * Makes The Editor Active For Modification Will Save a Copy Of The 
   * Current HTML Contents Too
   */
  const handleEditorClick = () => setIsEditorActive(true);

  /**
   * Saves The Contents When The Button Is Pressed 
   * Also Sends It Back To The
   */
  const saveChanges = async () => {

    // Retrieve HTML content
    var htmlContent = editorRef.current.getData();

    try {

      let _url = `https://${globalData.api_url}/task/${taskId}/description`;

      let _data = {
        description: htmlContent
      };

      const response = await axios.put( _url, JSON.stringify(_data), { withCredentials: true } );

      if( response.status == 200 ) {

        //  Reset The Editor To Display The New Content
        setDescriptData(htmlContent);

        //  Set The Editor To False To Display The New Updated Contents
        setIsEditorActive(false);

      }

    } catch (error) {
      console.error(error);
    }

  

  }


  // The Edit button 
  const editContents = () => handleEditorClick();

  // Will Just Set The Editor To Inactive State And Display What Was There Before Without Changes
  const cancelChanges = () => setIsEditorActive(false);

  // Grab The Editors Ref
  const returnEditorRef = (ref) => {
    editorRef.current = ref;
    getEditRef(ref);
    //  Apply Any Changes To The Editors height here
    //  https://stackoverflow.com/questions/46559354/how-to-set-the-height-of-ckeditor-5-classic-editor
    /*editorRef.current.editing.view.change((writer) => {

      writer.setStyle(
        "height",
        "200px",
        editorRef.current.editing.view.document.getRoot()
      );

    });*/

  }

  const editorSettings = {

    returnRef: returnEditorRef, // Gets The Editor Reference So We Can Directly Modify It Here
    status: isEditorActive,
    editorData: descriptData,   // Keeps The Editor Always Updated With The Current Description

  }

  return (

    <div className="card mb-2">

      <div className="card-header">Description

        {

          isEditorActive ? (

            <div className="float-end">
              <button className="btn btn-success me-1" onClick={saveChanges}>Save</button>
              <button className="btn btn-danger" onClick={cancelChanges}>Cancel</button>
            </div>

          ) : (

            <div className="float-end">
              <button className="btn btn-primary me-1" onClick={editContents}>Edit</button>
            </div>

          )

        }

      </div>

      <div className="card-body" onClick={handleEditorClick}>

        {
          isEditorActive ? (
            <CkEditor props={editorSettings} />
          ) : (
            <div className="form-control ck-content"
              style={{ minHeight: 200 }}
              dangerouslySetInnerHTML={{ __html: descriptData }}
              ref={descriptionDiv}
            />
          )
        }

      </div>

      <div className="card-footer">
        {
          isEditorActive && (
            <div className="d-flex justify-content-center mt-2">
              <button className="btn btn-success me-1" onClick={saveChanges}>Save</button>
              <button className="btn btn-danger" onClick={cancelChanges}>Cancel</button>
            </div>
          )
        }
      </div>

    </div>
  );
};

export default FieldsDescription;