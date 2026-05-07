import { useState, useEffect, useRef, useContext } from 'react';
import { Form } from 'react-bootstrap';
import CustomFields from '../../../CustomFields';
import FieldsInput from '../../../Fields/FieldsInput';
import FieldsDescription from '../../../Fields/FieldsDescription';
import FieldsComments from '../../../Fields/Comments/FieldsComments';
import CommentsCard from '../../../Fields/Comments/CommentsCard';
import FieldsAttachments from '../../../Fields/FieldsAttachments';
import FieldsBasic from '../../../Fields/FieldsBasic';
import CheckListContainer from '../../../Fields/CheckList/CheckListContainer';
import TaskViewPlaceHolder from './TaskViewPlaceholder';
import { useUI } from '../../../Contexts/UIContext';
import { DataContext } from '../../../Contexts/DataContext';
import axios from 'axios';

const TaskModalTabs = ({ taskId, addTaskView }) => {

    const { globalData } = useContext(DataContext);

    const { showToastNotification } = useUI();

    const [taskData, setTaskData] = useState(false);

    //  Passed To BasicFields Components
    const [basicData, setBasicData] = useState([]);

    //  Comment Section Modifications
    const [comments, setComments] = useState([]);
    const [editModeActive, setEditModeState] = useState(false);
    const [editId, setEditId] = useState(null);

    const commentRef = useRef(null);    // This Will Get The Comment Editor Ref So We Can Modify The Inner Contents Here If Needed
    const descriptionRef = useRef(null);    // This Will Get The Comment Editor Ref So We Can Modify The Inner Contents Here If Needed

    //  Fetch Task Information And Start Loading It
    useEffect(() => {

        const fetchTaskData = async () => {

            try {

                let _url = `https://${globalData.api_url}/task/${taskId}`;

                const response = await axios.get(_url, { withCredentials: true });

                if (response.status == 200) {

                    setTaskData( response.data );

                    let _data = response.data;

                    let _basicData = {
                        ..._data.basic,
                        statuses: [..._data.statuses],
                    }

                    setBasicData( _basicData );
                    
                }

            } catch (error) {

                console.error(error);

            }
        }

        fetchTaskData();

    }, []);

    //  Fetch Comments Data
    useEffect(() => {

        const fetchTaskComments = async () => {

            try {

                let _url = `https://${globalData.api_url}/task/${taskId}/comment`;

                const response = await axios.get(_url, { withCredentials: true });

                if (response.status == 200) {
                    setComments(response.data);
                }

            } catch (error) {

                console.error(error);

            }
        }

        fetchTaskComments();

    }, []);

    //  Handles Content Resizing
    useEffect(() => {
        const resizeColumns = () => {
            const cols = document.querySelectorAll('.resize.horizontal');
            let startX;
            let startWidth;
            let isResizing = false;

            const onMouseDown = (e) => {
                const rightHandle = e.target.closest('.resize-handle.right');
                const leftHandle = e.target.closest('.resize-handle.left');

                if (rightHandle || leftHandle) {
                    startX = e.clientX;
                    startWidth = cols[0].offsetWidth;
                    isResizing = true;

                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp);
                }
            };

            const onMouseMove = (e) => {
                if (!isResizing) return;

                const diffX = e.clientX - startX;
                const newWidth = startWidth + diffX;

                const parentContainer = cols[0].parentElement;
                const parentWidth = parentContainer.offsetWidth;

                const minWidthPercent = 30;
                const minWidth = (minWidthPercent / 100) * parentWidth;
                const maxWidth = parentWidth - minWidth;

                const adjustedWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);

                cols.forEach((col) => {
                    col.style.width = `${adjustedWidth}px`;
                });
            };

            const onMouseUp = () => {
                isResizing = false;
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousedown', onMouseDown);
        };

        if (taskData) {
            resizeColumns();
        }

    }, [taskData]);

    const setEditMode = (commentId, mode) => {

        setEditModeState(mode);

        if (mode == true) {
            let comment = comments.find(obj => obj.id === commentId);
            commentRef.current.setData(comment.html_text);
            setEditId(commentId);
        }
    }

    const updateComment = (newText) => {

        // Probably Should Update The DB Here Along With The Edit Timestamp
        let _comments = [...comments];
        let _comment = _comments.find(obj => obj.id === editId);

        //  If The User Is Editing But Deletes The Comment Or It Doesn't Exist Anymore
        //  Do Nothing
        if (_comment) {
            _comment.html_text = newText;
            setComments(_comments);
        }

        // Reset Edit Mode Properties
        setEditMode(false);
        setEditId(null);
    }

    // Function to update the array in the parent component
    const addComment = (newValue) => {

        setComments((prevArray) => [...prevArray, newValue]);

    };

    const deleteComment = async (commentId) => {

        // Create a new array without the comment to be deleted
        const updatedComments = comments.filter(obj => obj.id !== commentId);

        try {

            let _url = `https://${globalData.api_url}/comment/${commentId}`;

            const response = await axios.delete(_url, { withCredentials: true });

            if (response.status == 200) {
                setComments(updatedComments);
            }

        } catch (error) {

            console.error(error);

        }

    };

    const getCommentRef = (refId) => {
        commentRef.current = refId;
        //console.log(`Settign Comment Ref From Task Modal To:`, commentRef.current);
    }

    const getDescriptionRef = (refId) => {
        descriptionRef.current = refId;
    }

    //  Add A New Task To The Modals Tab For The Subtask
    const addNewTab = (task_id, task_name) => {

        addTaskView({
            info:{
                task_id: task_id,
                task_name: task_name
            }
        });
    }


    const removeSubtask = async (subtask_id) => {

        try {

            let _url = `https://${globalData.api_url}/task/${subtask_id}/subtask`;

            const response = await axios.delete(_url, { withCredentials: true });

            if (response.status == 200) {

                // Copy the current state
                const updatedBasicData = { ...basicData };

                delete updatedBasicData.subtasks[subtask_id];

                setBasicData(updatedBasicData);

                showToastNotification({
                    type: 'success',
                    message: "Successfully Removed Subtask",
                });
            }

        } catch (error) {

            showToastNotification({
                type: 'danger',
                message: error.response.data.err_string,
            });

        }
    }

    return (
        <div className="row mb-2">

            {/* Task Info Pane */}
            {
                taskData ? (
                    <>
                        <div className="col-xl-6 resize horizontal" style={{ minWidth: 35 + '%' }}>

                            <div className="taskPaneScroll">

                                {/* Task Basics */}
                                {
                                    basicData.parent_uuid &&
                                    <span className="btn btn-link" onClick={() => addNewTab(basicData.parent_uuid, basicData.parent_uuid )}><h4>Parent Task: {basicData.parent_uuid}</h4></span>

                                }
                                <div className="card mb-2">

                                    <div className="card-header">
                                        <span><i className="fas fa-chart-area me-1"></i>Basic Details</span>
                                        {/*<button className="btn btn-sm btn-danger float-end">Delete</button>*/}
                                    </div>

                                    <FieldsBasic data={basicData} taskId={taskId} setBasicData={setBasicData}/>



                                </div>
                                {/* Description Area */}
                                <FieldsDescription taskId={taskId} description={basicData.description} getEditRef={getDescriptionRef} />

                                {/* Extra Task Data */}
                                <div className="card mb-2">

                                    <div className="card-header">
                                        <i className="fas fa-chart-area me-1"></i>
                                        Details
                                    </div>

                                    <div className="card-body">

                                        <nav>
                                            <div className="nav nav-tabs" id="nav-tab" role="tablist">
                                                <button className="nav-link active" id={`nav-customfields-tab-${taskId}`} data-bs-toggle="tab" data-bs-target={`#nav-customfields-${taskId}`} type="button" role="tab" aria-controls={`nav-customfields-${taskId}`} aria-selected="true">Details</button>
                                                <button className="nav-link" id={`nav-subtasks-tab-${taskId}`} data-bs-toggle="tab" data-bs-target={`#nav-subtasks-${taskId}`} type="button" role="tab" aria-controls={`nav-subtasks-${taskId}`} aria-selected="false">Subtasks</button>
                                                <button className="nav-link" id={`nav-checklist-tab-${taskId}`} data-bs-toggle="tab" data-bs-target={`#nav-checklist-${taskId}`} type="button" role="tab" aria-controls={`nav-checklist-${taskId}`} aria-selected="false">Action Items</button>
                                                {/*<button className="nav-link" id={`nav-billable-tab-${taskId}`} data-bs-toggle="tab" data-bs-target={`#nav-billable-${taskId}`} type="button" role="tab" aria-controls={`nav-billable-${taskId}`} aria-selected="false">Billable Items</button>
                                                */}
                                            </div>
                                        </nav>

                                        <div className="tab-content" id="nav-tabContent">

                                            {/* Custom Fields */}
                                            <div className="tab-pane fade show active" id={`nav-customfields-${taskId}`} role="tabpanel" aria-labelledby={`nav-customfields-tab-${taskId}`}>

                                                <div className="card mb-2">
                                                    <h5 className="card-header">Custom Fields</h5>
                                                    <div className="card-body">
                                                        <CustomFields taskId={taskId} data={taskData.custom_fields} values={taskData.custom_field_values} />
                                                    </div>
                                                </div>

                                                { taskId && <FieldsAttachments taskId={taskId}/>}
                                                

                                            </div>

                                            {/* Subtasks */}
                                            <div className="tab-pane fade" id={`nav-subtasks-${taskId}`} role="tabpanel" aria-labelledby={`nav-subtasks-tab-${taskId}`}>
                                                <div className="card mb-2">
                                                    <div className="card-header"><i className="fas fa-chart-area me-1"></i>History</div>

                                                    <div className="card-body">
                                                        <table className="table">
                                                            <thead>
                                                                <tr>
                                                                    <th>Subtask Name</th>
                                                                    <th></th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {
                                                                    Object.keys(basicData.subtasks).length > 0 && (
                                                                        Object.entries(basicData.subtasks).map(([task_id, task_name]) => (
                                                                          
                                                                                <tr key={task_id}>
                                                                                    <td><span className="btn btn-link" onClick={() => addNewTab(task_id, task_name)}>{task_name}</span></td>
                                                                                    <td><button className="btn btn-outline-danger" onClick={() => removeSubtask(task_id)}>Remove Subtask</button></td>
                                                                                </tr>
                                                                          
                                                                        ))
                                                                    )
                                                                }
                                                            </tbody>
                                                        </table>

                                                    </div>
                                                </div>
                                            </div>

                                            {/* Lists */}
                                            <div className="tab-pane fade" id={`nav-checklist-${taskId}`} role="tabpanel" aria-labelledby={`nav-checklist-tab-${taskId}`}>
                                                <CheckListContainer data={taskData.checklists} taskId={taskId} createTask={false} />
                                            </div>

                                            {/* Billable */}
                                            <div className="tab-pane fade" id={`nav-billable-${taskId}`} role="tabpanel" aria-labelledby={`nav-billable-tab-${taskId}`}>

                                                <div className="p-2">
                                                    <button className="btn btn-success btn-sm me-2">Add An Item</button>
                                                    <button className="btn btn-primary btn-sm">Create Invoice</button>
                                                </div>

                                                <div className="card mb-3">
                                                    <div className="card-header"><i className="fas fa-chart-area me-1"></i>Billable Items</div>
                                                    <div className="card-body">

                                                        <table className="table">
                                                            <thead>
                                                                <tr>
                                                                    <th>Item</th>
                                                                    <th>Value</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>

                                                                <tr>
                                                                    <td>
                                                                        <Form.Check
                                                                            //key={index}
                                                                            type="checkbox"
                                                                            label="Item 1"//{item}
                                                                        //id={`checkbox-${index}`}
                                                                        />
                                                                    </td>
                                                                    <td ><FieldsInput options={{ type: 'currency', value: '1500.00', currency: '$' }} /></td>
                                                                </tr>

                                                                <tr>
                                                                    <td>
                                                                        <Form.Check
                                                                            //key={index}
                                                                            type="checkbox"
                                                                            label="Item 2"//{item}
                                                                        //id={`checkbox-${index}`}
                                                                        />
                                                                    </td>
                                                                    <td ><FieldsInput options={{ type: 'currency', value: '1500.00', currency: '$' }} /></td>
                                                                </tr>

                                                                <tr>
                                                                    <td>
                                                                        <Form.Check
                                                                            //key={index}
                                                                            type="checkbox"
                                                                            label="Item 3"//{item}
                                                                        //id={`checkbox-${index}`}
                                                                        />
                                                                    </td>
                                                                    <td ><FieldsInput options={{ type: 'currency', value: '1500.00', currency: '$' }} /></td>
                                                                </tr>

                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="resize-handle right"></div>

                        </div>
                    </>
                    //  If The Data Is Still Loading Then Show The Placeholder Elements
                ) : <TaskViewPlaceHolder />
            }

            {/** Comment Section */}
            <div className="col resize horizontal task-description-area">
                <div className="taskPaneScroll">
                    <div className="card">
                        <div className="card-header"><i className="fas fa-chart-area me-1"></i>History</div>
                        <div className="card-body card-scrollable description-container">
                            {/* Comments */}
                            <CommentsCard comments={comments} setEditMode={setEditMode} getDeleteId={deleteComment} />
                        </div>

                    </div>
                    {/* Editor */}
                    <div className="position-sticky bottom-0 mt-2">
                        <FieldsComments taskInternalId={taskData.id} taskId={taskId} editId={editId} addComment={addComment} getEditRef={getCommentRef} editMode={editModeActive} cancelEdit={() => { setEditModeState(false) }} updateComment={updateComment} />
                    </div>
                </div>
            </div>


        </div>
    );


}

export default TaskModalTabs;