import { Modal } from 'react-bootstrap';
import { useState } from 'react';
import TaskCreate from './Body/TaskCreate';
import ResourceSettings from './Body/ResourceSettings';
import NewWorkspaceResource from './Body/NewWorkspaceResource';
import EditCustomFields from './Body/CustomFieldEditor/EditCustomFields';
import WorkspaceSettings from './Body/WorkspaceSettings/WorkspaceSettings';
import NewTableFilters  from './Body/NewTableFilters';
import ShareTableFilter from './Body/ShareTableFilter';
import GlobalSearch from './Body/GlobalSearch';
import TableResource from './Body/TableResource/TableResource';
import Contact from './Body/Contact';

/**
 * 
 * @param {*} options This Is Whatever Is Passed Through Comp Props During
 *                    The openModal Function 
 * @returns 
 */
const GenericModal = ( options = {} ) => {

    let { modalBodyHeight } = options;

    var styles = {}

    if( modalBodyHeight ) styles['minHeight'] = modalBodyHeight;  

    function getBody() {

        const { form, closeModal, openModal } = options;

        switch (form) {

            //  Handles The Modal Body For Creating Resources
            case "workspace":
            case "space":
            case "list":
            case "folder":
                return <NewWorkspaceResource options={options} closeModal={closeModal} />;

            case "settings":
                //  This Is The Global Modal For Space, Folders, List Modifications
                return <ResourceSettings options={options} closeModal={closeModal} openModal={openModal} />
       
            case "editCustomFields":
                return <EditCustomFields  closeModal={closeModal}/>
 
            case "contact":
                return <Contact closeModal={closeModal}/>

            case "workspaceSettings":
                return <WorkspaceSettings openModal={openModal} tab={options.tab}/>

            case "filters":
                return <NewTableFilters 
                            filters={options.filters} 
                            list={options.list} 
                            update={options.update} 
                            closeModal={closeModal} 
                            ext={options.ext}
                            callBack={options.callBack}
                        />

            case "shareFilter":
                return (
                        <ShareTableFilter 
                            list={options.list}
                            hash={options.hash}
                            closeModal={closeModal}
                        />
                    )  

            case "globalSearch":
                return(
                    <GlobalSearch 
                        closeModal={closeModal}
                        openModal={openModal}
                    />
                )          
            
            case "newTable":
                return(
                    <TableResource />
                )  

                
        }
    }

    return (
        <Modal.Body style={styles}>
            { getBody() }
        </Modal.Body>
    );
}

export default GenericModal;