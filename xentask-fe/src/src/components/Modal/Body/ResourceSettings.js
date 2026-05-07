import FieldsInput from "../../Fields/FieldsInput";
import FieldsAssignees from "../../Fields/FieldsAssignees";
import StatusSettings2 from "./StatusSettings2";
import { useRef, useEffect, useState, useContext } from "react";
import { DataContext } from '../../Contexts/DataContext';
import { ucFirst } from "../../../Utils/Utils";
import Alerts from '../../Alerts';
import axios from 'axios';

const ResourceSettings = ({ options, closeModal, openModal }) => {

    //  Global Data For The User
    const {
        globalData,
        updateSpaceByKey,
        updateListByKey,
        updateFolderByKey,
        refreshSpaces
    } = useContext(DataContext);


    /**
     * id - The Resource ID Hash
     * type - The Resource We're Currently Handling space, list, folder 
     */
    const { id, type, spaceParent, folderParent } = options;

    const statusRef = useRef(null);

    const [resourceData, setResourceData] = useState(null);

    const [isDelete, setIsDelete] = useState(false);

    const [savingStatus, setSavingStatus] = useState(false);


    // Load The Space Data
    useEffect(() => {

        async function fetchResourceData() {

            try {

                const response = await axios.get(`https://${globalData.api_url}/${type}/${id}`, { withCredentials: true });

                if (response.data) setResourceData(response.data);

            } catch (error) {

                console.error(error);
            }

        }

        // Call the fetchUserData function after the component mounts
        fetchResourceData();

    }, []); // Empty dependency array means this effect will only run once after the initial render


    //  Save The Space Statuses
    const saveStatuses = async () => {

        //  Don't Allow User To Submit Again Till The Operation Is Completed
        setSavingStatus(true);

        const statuses = statusRef.current.getItems();

        let { containers, deleted } = statuses;

        //  Creates A Flat Map To Compare Previous Values To Now
        let _flatMap = {};

        resourceData.statuses.forEach(item => {

            //console.log(item);

            _flatMap[item.hash] = {
                name: item.name,
                color: item.color,
                type: item.type,
                order_index: item.order_index,
            }
        })

        // Format Data To Send To Server
        let _changes = {
            updates: [],
            added: [],
            deleted: deleted.map(item => item.replace("item-", "")),
        }

        containers.forEach(container => {

            //  This Is The DB ENUM keyname
            let _enum = container.keyName;
            let _items = container.items;

            _items.forEach( ( item, index ) => {

                item.id = item.id.replace("item-", "");

                let _original = _flatMap[item.id];

                try {
                    //  This Means The Item Came From The Database And Is Not New
                    //  Check If Anything Changed 
                    if (item.isImported) {

                        //  If Any Of THe Changes Were Made We Need To Update It
                        if (

                            item.name != _original.name ||
                            item.color != _original.color ||
                            index != _original.order_index ||
                            _enum != _original.type

                        ) {

                            /*
                                console.log( "Title Changed", item.title !== _original.name );
                                console.log( "Color Changed",  item.color !== _original.color );
                                console.log( "Index Changed",  index != _original.order_index, index, _original.order_index   );
                                console.log( "Type Changed",  _enum !== _original.type  );
                                console.log( "Original", _original   );
                            */

                            item.order_index = index;
                            item.type = _enum;
                            _changes.updates.push(item);

                        }

                    } else {

                        item.order_index = index;
                        item.type = _enum;
                        _changes.added.push(item);

                    }

                } catch(e){
                    
                    console.log("This is breaking",item);
                    console.log("This is breaking",item);
                    console.log("This is breaking",e);
                }
            });

        });

        console.log("Changes", _changes);

        //   Make Sure We Have Changes To Send
        let _shouldUpdate = false;

        for (let key in _changes) {
            if (_changes[key].length > 0) _shouldUpdate = true;
        }

        if (_shouldUpdate) {

            // Send To API To Process The Statuses
            try {

                // Update The Statuses Changes
                const response = await axios.post(`https://${globalData.api_url}/space/${id}/bulkStatusesUpdate`, JSON.stringify(_changes), { withCredentials: true });

                // Then Fetch And Update The Statuses Array With The New Ones
                if (response.status === 200) {

                    try {
                        // Make A Request To Fetch The New Statuses
                        const statusesResponse = await axios.get(`https://${globalData.api_url}/space/${id}/getStatuses`, { withCredentials: true });

                        if (statusesResponse.status === 200) {

                            console.log(statusesResponse);

                            let _newData = statusesResponse.data;

                            // Update the resourceData state
                            setResourceData((prevData) => ({
                                ...prevData,
                                statuses: _newData,
                            }));

                            setSavingStatus(false);

                        } else {

                            console.error(`Failed to fetch new statuses: ${statusesResponse.status}`);

                        }

                    } catch (error) {
                        console.error('Error fetching new statuses:', error);
                    }

                } else {
                    console.error(`Failed to update statuses: ${response.status}`);
                }

            } catch (error) {
                console.error('Error updating statuses:', error);
            }

        } else {

            console.log("No Changes To Send");
            setSavingStatus(false);
        }
    }

    const saveData = (keyName, value) => {

        console.log("Saving Data", keyName, value, type, spaceParent, folderParent);

        let data = {};
        data[keyName] = value;

        data = JSON.stringify(data);

        //  Make's Sure The Data Isn't Empty Nor THe Same As Before 
        if (value.trim !== '' && value !== resourceData[keyName]) {

            try {

                axios.put(`https://${globalData.api_url}/${type}/${id}`, data, { withCredentials: true })
                    .then(response => {

                        //  Choose What To Update Based On The Type 
                        switch (type) {

                            case ('space'):
                                updateSpaceByKey(id, keyName, value);
                                break;

                            case ('list'):
                                updateListByKey(spaceParent, id, keyName, value, ((folderParent && folderParent !== spaceParent) ? folderParent : null));
                                break;

                            case ('folder'):
                                updateFolderByKey(spaceParent, id, keyName, value);
                                break;

                        }

                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });

            } catch (error) {

                console.log(error);
            }

        }

    }

    const triggerAlert = () => setIsDelete(true);

    const deleteResource = async () => {

        try {

            const response = await axios.delete(`https://${globalData.api_url}/${type}/${id}`, { withCredentials: true });

            if (response.status == 200) {

                refreshSpaces();
                closeModal();
            }

        } catch (error) {
            console.log(error.response ? error.response.data : error.message); // Log error details
        }

        setIsDelete(false);

    };

    const creatorTpl = () => {

        let _user = globalData.WORKSPACE_USERS.find( e => e.id == resourceData.created_by);

        return (
            <div className="d-flex justify-content">
            <span
                className="circle-user"
                style={{
                    backgroundColor: _user.color ? _user.color : '#7C4DFF',
                    borderRadius: '50%',
                    width: '33px',
                    height: '33px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'white',
                    position: 'relative',
                    marginRight: '5px', // Spacing between circle and label
                }}
            >
                {_user.initials}
            </span>
                <p className="mt-1">{_user.full_name}</p>
            </div>
        )

    }

    return (
        <>
            {
                resourceData ? (
                    <>
                        <nav>
                            <div className="nav nav-tabs" id="space-nav-tabs" role="tablist">
                                <button className="nav-link active" id="space-general-btn" data-bs-toggle="tab" data-bs-target="#space-general-tab" type="button" role="tab" aria-selected="true">{ucFirst(type)} Settings</button>

                                {
                                    type == 'space' && (
                                        <button className="nav-link" id="space-status-btn" data-bs-toggle="tab" data-bs-target="#space-status-tab" type="button" role="tab" aria-selected="false">Task Statuses</button>
                                    )
                                }
                            </div>
                        </nav>

                        <div className="tab-content" id="nav-tabContent">

                            <div className="tab-pane fade show active" id="space-general-tab" role="tabpanel" aria-labelledby="space-general-btn">
                                <div>
                                    <div className="mt-4">
                                        <label className="form-label"><u>{ucFirst(type)} Name</u></label>
                                        <FieldsInput type={'text'} value={resourceData.name} callBack={saveData} required={true} keyName="name" />
                                    </div>


                                    {
                                        type == 'space' && (
                                            <div className="mt-4">
                                                <label className="form-label"><u>Description</u></label>
                                                <FieldsInput type={'text'} value={resourceData.description} callBack={saveData} keyName="description" />
                                            </div>
                                        )
                                    }

                                    <div className="mt-4">
                                        <label className="form-label"><u>Creator</u></label>
                                        {creatorTpl()}

                                    </div>
                                </div>

                                <div className="row mt-2">
                                    <button className="btn btn-primary"

                                        onClick={() => openModal("Edit Custom Fields", { compProps: { form: 'editCustomFields', type: "space" } }, { modalSize: 'modal-xxl', scrollable: true, modalBodyHeight: "53em" })}
                                    >
                                        Edit Custom Fields
                                    </button>
                                    <button type="button" className="btn btn-danger mt-2" onClick={triggerAlert}>Delete {ucFirst(type)}</button>
                                </div>
                            </div>

                            {
                                type == 'space' && (
                                    <div className="tab-pane fade" id="space-status-tab" role="tabpanel" aria-labelledby="space-status-btn">

                                        <StatusSettings2 data={resourceData.statuses} ref={statusRef} />
                                        <div className="mt-2 row">
                                            {
                                                !savingStatus ? (
                                                    <button className="btn btn-success" onClick={saveStatuses}>Save Changes</button>
                                                ) : (

                                                    <button className="btn btn-danger" type="button" disabled>
                                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                        <span>Saving...</span>
                                                    </button>
                                                )
                                            }
                                        </div>
                                    </div>
                                )
                            }

                        </div>
                    </>

                ) : (

                    <div className="placeholder-glow">
                        <div>
                            <div className="mt-4">
                                <span className="placeholder col-2" />
                                <span className="form-control placeholder col-12" />
                            </div>

                            <div className="mt-4">
                                <span className="placeholder col-2" />
                                <span className="form-control placeholder col-12" />
                            </div>
                            <div className="mt-4">
                                <span className="placeholder col-2" />
                                <span className="form-control placeholder col-12" />
                            </div>
                        </div>

                        <div className="row mt-2">
                            <a className="btn btn-primary disabled placeholder col-12" aria-disabled="true"></a>
                            <a className="btn btn-danger mt-2 disabled placeholder col-12" aria-disabled="true"></a>
                        </div>
                    </div>
                )
            }

            <Alerts header={"Warning"} showAlert={isDelete} confirmAction={deleteResource} cancelAction={() => setIsDelete(false)} hasOverlay={true}>
                <p>
                    You're About To Delete A Space.<br />
                    If You'd Like To Complete This Action, Please
                    Press The Confirm Button.
                </p>
            </Alerts>

        </>
    );
}

export default ResourceSettings;
