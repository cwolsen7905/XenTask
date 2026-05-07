import { useRef, useState, useContext } from "react";
import CkEditor from '../CkEditor';
import { DataContext } from '../../Contexts/DataContext';
import { useUI } from '../../Contexts/UIContext';
import axios from 'axios';

const FieldsComments = ({ taskInternalId, taskId, addComment, getEditRef, editMode, editId, cancelEdit, updateComment }) => {

    const { globalData } = useContext(DataContext);
    const { showToastNotification } = useUI();

    const [isEditorActive, setIsEditorActive] = useState(false);
    const [commentData, setCommentData] = useState('');           // Mostly Used When A User Selects A Comment To Edit

    const editorRef = useRef(null);

    var cancelChangeHTML = '';

    // Grab The Editors Ref
    const returnEditorRef = (ref) => {

        editorRef.current = ref;

        //  Apply Any Changes To The Editors height here
        //  https://stackoverflow.com/questions/46559354/how-to-set-the-height-of-ckeditor-5-classic-editor
        /*editorRef.current.editing.view.change((writer) => {

            writer.setStyle(
                "height",
                "140px",
                editorRef.current.editing.view.document.getRoot()
            );

            writer.setStyle(
                "max-height",
                "260px",
                editorRef.current.editing.view.document.getRoot()
            );

        });*/

        getEditRef(ref);

    }

    const handleSubmit = async() => {

        if( editorRef.current.editing.view.getDomRoot().innerText.trim() !== '') {

            var htmlContent = editorRef.current.getData();

            if (!editMode) {

                let _data = {
                    user_id: globalData.USER.id,
                    text: htmlContent,
                    notify_all: false
                }
                
                try {

                    let _url = `https://${globalData.api_url}/task/${taskId}/comment`;

                    const response = await axios.post( _url, JSON.stringify( _data ), { withCredentials: true } );

                    if( response.status == 200 ) {

                        /**
                         * Send The Contents To Server So We Can Get The Comment Id Returned And Bind It Here
                         */
                        let newComment = {
                            id: response.data.comment_hash,
                            html_text: htmlContent,
                            user: response.data.user,
                            date_created: response.data.date_created,
                        }

                        addComment(newComment);

                        showToastNotification({
                            type: 'success',
                            message: "Your Comment Has Been Submitted"
                        });
                    }

                } catch (error) {

                    console.error(error);
                    
                    showToastNotification({
                        type: 'danger',
                        message: "There Was A Problem Submitting Your Comment"
                    });

                }

            } else {

                let _data = {
                    user_id: globalData.USER.id,
                    text: htmlContent,
                    notify_all: false,
                }
                
                try {

                    let _url = `https://${globalData.api_url}/comment/${editId}`;

                    const response = await axios.put( _url, JSON.stringify( _data ), { withCredentials: true } );

                    if( response.status == 200 ) {
                        updateComment(htmlContent);
                    }

                } catch (error) {

                    console.error(error);

                }
            }

            // Reset The Editor 
            editorRef.current.setData('');

        } 
    }

    const editorSettings = {

        returnRef: returnEditorRef, // Gets The Editor Reference So We Can Directly Modify It Here
        status: isEditorActive,
        editorData: commentData,    // Keeps The Editor Always Updated With The Current Description

    }

    return (
        <>
            <div className="mb-2">
                <CkEditor
                    props={editorSettings}
                    onUpdateEditorData={handleSubmit}
                />
            </div>

            <div>
                <button className="btn btn-success me-1" onClick={handleSubmit}>{editMode ? 'Save' : 'Submit'}</button>
                {
                    editMode && (
                        <button className="btn btn-danger" onClick={() => { cancelEdit(); editorRef.current.setData(''); }}>Cancel</button>
                    )}
            </div>

        </>
    );

};

export default FieldsComments;