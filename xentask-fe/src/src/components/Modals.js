/**
 * This Component Will Handle Different Actions Throughout Our App 
 * And Will Be Universal Throughout
 * 
 * Currently Will Handle Things Like
 * - Creating New Workspace
 * - Creating New Lists
 * - Creating New Folders
 * - Creating New Tasks
 * 
 */

import { useState, useEffect, useRef } from 'react';
import CkEditor from './Fields/CkEditor';
import CustomFields from './CustomFields';
import FieldsAttachments from './Fields/FieldsAttachments';
import FieldsBasic from './Fields/FieldsBasic';
import CheckListContainer from './Fields/CheckList/CheckListContainer';


const Modals = () => {

    const [activeForm, setActiveForm] = useState("");
    const [title, setTitle] = useState("");
    const [modalSize, setSize] = useState("");

    //let title = '';

    // Bootstrap CSS Size ex: modal-xl, modal-md
    //let modalSize = 'modal-xl';

    useEffect(() => {

        const modalElement = document.getElementById("createModal");

        modalElement.addEventListener("show.bs.modal", (event) => {

            let btnData = JSON.parse(event.relatedTarget.getAttribute("data-modal-create"));

            setActiveForm(renderForm(btnData.type));

            setTitle(btnData.title);

        });

    }, []);

    /**
     * Returns A Form Depending On The Button coming in
     * 
     */
    const renderForm = (formType) => {

        let text = formType.charAt(0).toUpperCase() + formType.slice(1);

        switch (formType) {

            case "workspace":
            case "list":
                return (
                    <div className="modal-body">
                        <form>
                            <div className="mb-3">
                                <label for="folderInput" className="form-label">{text} Name</label>
                                <input type="text" className="form-control" id="folderInput" />
                                <div className="form-text">Give A Unique Name For Your New {text}</div>
                            </div>
                            <button type="submit" className="btn btn-primary">Submit</button>
                        </form>
                    </div>
                );
                break;

            case "folder":

                return (
                    <div className="modal-body">
                        <form>
                            <div className="mb-3">
                                <label for="taskInput" className="form-label">Task Name</label>
                                <input type="text" className="form-control" id="taskInput" />
                                <div className="form-text">Give A Unique Name For Your New Task</div>

                            </div>
                            <button type="submit" className="btn btn-primary">Submit</button>
                        </form>
                    </div>
                );
                break;

            case "task":

                setSize('modal-xl');
                
                return (

                    <div className="modal-body">

                        
                    </div>
                    
                );

                break;

            // Add more cases for other forms as needed
            default:
                return null;

        }

    };

    /*const proceedAndClose = () => {
        onProceed();
        onClose();
    };*/

    return (
        <>
        <Modal.Header closeButton onHide={closeModal}>
        <Modal.Title>{modalProps.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        
        </Modal.Body>
        <Modal.Footer>
        {modalProps.footer}
        </Modal.Footer>
        </>

    );
};

export default Modals;
/*
        <div className="modal fade" id="createModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div className={`modal-dialog modal-dialog-scrollable ${modalSize}`}>
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id="exampleModalLabel">{title}</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    {activeForm}
                </div>
            </div>

        </div>
*/