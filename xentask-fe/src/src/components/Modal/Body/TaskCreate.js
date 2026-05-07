import CkEditor from '../../Fields/CkEditor';
import CustomFields from '../../CustomFields';
import FieldsAttachments from '../../Fields/FieldsAttachments';
import FieldsBasic from '../../Fields/FieldsBasic';
import CheckListContainer from '../../Fields/CheckList/CheckListContainer';
import FieldsListSelection from '../../Fields/FieldsListSelection';
import { useState, useEffect, useRef, useContext } from 'react';
import { DataContext } from '../../Contexts/DataContext';
import { useUI } from '../../Contexts/UIContext';
import { Modal } from 'react-bootstrap';
import axios from 'axios';

/**
 * 
 * @param {string} listId - The List ID To Create For
 * @param {string} parentId - This Occurs During The Task View When Creating A Task And Want To Assign A Parent To The New Task
 * @param {funtion} endAction - CallBack Function To Dictate What Happens At The End Of Task Create
 * @returns 
 */
const TaskCreate = ({ listId, parentId, endAction }) => { //, callBack

    console.log("parentId",listId);

    //  Generate Task Fields 
    const { globalData } = useContext(DataContext);
    const { showToastNotification, openModal } = useUI();
    const [selectedListId, setSelectedListId] = useState(listId || null);
    const [listData, setListData] = useState(null);
    const [taskName, setTaskName] = useState('');
    const [errorFields, setErrorFields] = useState([]);

    const checkListRef = useRef(null);
    const customFieldsRef = useRef(null);
    const basicFieldsRef = useRef(null);
    const attachmentRef = useRef(null);
    const descriptionRef = useRef(null);

    const getDescriptionRef = (refId) => {
        descriptionRef.current = refId;
        //console.log(`Settign Comment Ref From Task Modal To:`, descriptionRef.current);
    }

    const buildListDropdownData = (spaces) => {

        console.log("buildListDropdownData",selectedListId);

        let value = "";

        const options = Object.values(spaces).map(space => ({
            id: space.id,
            name: space.name,
            type: 'space',
            submenu: [
                ...Object.values(space.lists || {}).map(list => {
                    if (selectedListId === list.id) {
                        value = list.name;
                    }
                    return {
                        id: list.id,
                        name: list.name,
                        type: 'list'
                    };
                }),
                ...Object.values(space.folders || {}).map(folder => ({
                    id: folder.id,
                    name: folder.name,
                    type: 'folder',
                    submenu: Object.values(folder.lists || {}).map(list => {
                        if (selectedListId === list.id) {
                            value = list.name;
                        }
                        return {
                            id: list.id,
                            name: list.name,
                            type: 'list'
                        };
                    })
                }))
            ]
        }));

        //console.log("Selected List Name",value);

        return {
            value,
            options
        };
    };

    const listDropdown = buildListDropdownData(globalData.SPACES)

    //  Callback Function To Get The Selected List ID
    const getSelectedList = (listId) => setSelectedListId(listId);

    //  Function To Create The Task
    const createTask = async (e) => {

        e.preventDefault();

        //  Verify That All Required Custom Fields Are Filled Out If Not Highlight Them
        let _customFields = (customFieldsRef.current.getItems());

        //console.log(_customFields);
        let _errors = [];

        _customFields.forEach((item) => {

            if (
                item.required && (
                    item.value == '' ||
                    item.value == null ||
                    item.value == undefined
                )
            ) {
                console.log(item.value);
                _errors.push(item.hash);
            }

        })

        if (_errors.length > 0) {

            setErrorFields(_errors);


            showToastNotification({
                type: 'danger',
                message: "All Required Custom Fields Must Have A Value."
            });

            return;
        }

        if (_errors.length == 0) {

            try {
                const formData = new FormData();
                formData.append('taskName', taskName);
                formData.append('checkList', JSON.stringify(checkListRef.current.getItems()));
                formData.append('customFields', JSON.stringify(customFieldsRef.current.getItems()));
                formData.append('basicFields', JSON.stringify(basicFieldsRef.current.getItems()));
                formData.append('description', descriptionRef.current.getData());
                let _attachments = attachmentRef.current.getItems();
                if (parentId) formData.append('parentId', parentId);
                // Append each file to the formData
                _attachments.forEach(file => {
                    formData.append('attachments[]', file);
                });

                // Send the formData to your PHP backend using Axios
                const response = await axios.post(`https://${globalData.api_url}/list/${selectedListId}/createTask`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    withCredentials: true
                });

                if (response.status == 200) {

                    //console.log('Response:', response.data);

                    //  This Is Passed From The Main Component That Called Us
                    //  Usually Used To Refresh Tasks
                    //if( callBack ) callBack();

                    descriptionRef.current.setData('');
                    setTaskName('');
                    setListData(null);
                    getListData();

                    //  Return The Selected List And The Response On Task Creation
                    //  This Info Is Used On Subtask Creation As Well
                    if (endAction) endAction({
                        list_id: selectedListId,
                        info: response.data
                    });

                    showToastNotification({
                        type: 'success',
                        message: "New Task Has Been Created",
                        bodyContent: (
                            <>
                                <button type="button" className="btn btn-primary btn-sm"
                                    onClick={() => {
                                        //  Opens The Task View Modal
                                        openModal(
                                            "View Task",
                                            {
                                                type: 'taskView',
                                                compProps: {
                                                    taskId: response.data.task_id,
                                                    listId: selectedListId,
                                                    taskName: response.data.task_name,
                                                }
                                            },
                                            {
                                                modalSize: 'modal-xxl',
                                                scrollable: true,
                                            },
                                            {
                                                /*
                                                // When The Modal Closes Refresh The Tasks In
                                                // The Current List View
                                                close: () => {
                                                    //  Upon Closing Refresh The Table For Any Changes
                                                    refreshTasks(id);
                                                    //  Also Reset The Url back to the list
                                                    window.history.pushState({}, '', `/lists/${id}`);
                                                },*/
                                            }
                                        );

                                        window.history.pushState({}, '', `/task/${response.data.task_id}`);
                                    }}
                                >Go To Task</button>
                            </>
                        )

                    });

                }

            } catch (error) {
                console.error('Error:', error);
            }
        }
    }

    //  Fetch Data Whenever The Selected List Id Changes
    useEffect(() => {

        if (selectedListId) getListData();

    }, [selectedListId]);


    const getListData = async () => {

        let _url = `https://${globalData.api_url}/list/${selectedListId}`;

        try {

            const response = await axios.get(_url, { withCredentials: true });
            //console.log("ListData Response: ", response.data);
            setListData(response.data);

        } catch (error) {

            console.error(error);

        }

    }

    return (

        <Modal.Body>

            <form onSubmit={(e) => createTask(e)}>

                <div className="d-flex justify-content-center mb-3">
                    <FieldsListSelection data={listDropdown} callBack={getSelectedList} />
                </div>

                <div className="mb-3">

                    <input
                        type="text"
                        className="form-control mb-3"
                        id="taskInput"
                        placeholder="Give A Name For Your Task"
                        value={taskName}
                        onChange={(e) => setTaskName(e.target.value)}
                        required
                    />

                    <CkEditor props={{ returnRef: getDescriptionRef }} />

                </div>

                {(selectedListId && listData !== null) && (
                    <>
                        <FieldsBasic createTask={true} data={listData} ref={basicFieldsRef} />
                        <nav>
                            <div className="nav nav-tabs" role="tablist">
                                <button className="nav-link active" id="create-task-custom-fields" data-bs-toggle="tab" data-bs-target="#create-task-custom-fields-tab" type="button" role="tab" aria-controls="create-task-custom-fields-tab" aria-selected="true">Custom Fields</button>
                                <button className="nav-link" id="create-task-check-list" data-bs-toggle="tab" data-bs-target="#create-task-checklist-tab" type="button" role="tab" aria-controls="create-task-checklist-tab" aria-selected="false">Checklist</button>
                            </div>
                        </nav>
                        <div className="tab-content" id="nav-tabContent">
                            <div className="tab-pane fade show active" id="create-task-custom-fields-tab" role="tabpanel" aria-labelledby="create-task-custom-fields">
                                <CustomFields createTask={true} data={listData.customFields} ref={customFieldsRef} errors={errorFields} />
                            </div>
                            <div className="tab-pane fade" id="create-task-checklist-tab" role="tabpanel" aria-labelledby="create-task-check-list">
                                <CheckListContainer ref={checkListRef} createTask={true} />
                            </div>
                        </div>
                        <div>
                            <FieldsAttachments createTask={true} ref={attachmentRef} />
                        </div>
                        <div className="d-grid gap-2">
                            <button
                                type="submit"
                                className="btn btn-primary mt-2 mb-2"
                            >
                                Create Task
                            </button>
                        </div>
                    </>
                )}

            </form>

        </Modal.Body>
    );

}

export default TaskCreate;