
import { forwardRef, useImperativeHandle, useCallback, useState, useContext } from 'react';
import axios from 'axios';
import FieldsAssignees from './FieldsAssignees';
import FieldsTimeTracker from './TimeTracking/FieldsTimeTracker';
import FieldsDate from './FieldsDate';
import FieldsDropdown from './FieldsDropdown';
import FieldsInput from './FieldsInput';
import FieldsTimeInput from './TimeTracking/FieldsTimeInput';
import FieldsTaskSearch from './FieldsTaskSearch'

import { DataContext } from '../Contexts/DataContext';


const buildStatusData = (statuses, statusValue) => {

    // console.log( "statusValue", statusValue );

    let _statuses = {
        value: null,
        options: statuses
            .sort((a, b) => a.order_index - b.order_index)
            .map((status, index) => ({
                id: status.hash,
                label: status.name,
                value: status.name.toLowerCase().replace(/\s+/g, '-'),
                color: status.color
            }))
    };

   // console.log("_statuses", _statuses);

    _statuses.value = statusValue ? statusValue : (_statuses.options[0].id || _statuses.options[0].hash);

    return _statuses;

};

export default forwardRef(function FieldsBasic({ data, taskId, setBasicData,createTask = false }, ref) {

    const { globalData } = useContext(DataContext);

    //console.log("FieldsBasic DATA", data);
    const [fields, setFields] = useState({

        //  This Will Build The Statuses Dropdown And If We Passed In A Status Value Assign it
        statuses: buildStatusData(data.statuses, data.status || null),
        priority: {
            value: data.priority || 'priority-none',
            options: [
                {
                    id: 'priority-none',
                    label: "None",
                    value: "none",
                    color: null,
                },
                {
                    id: "priority-low",
                    label: "Low",
                    value: "low",
                    color: '#6c757d',
                },
                {
                    id: "priority-normal",
                    label: "Normal",
                    value: "normal",
                    color: '#0d6efd',
                },
                {
                    id: "priority-high",
                    label: "High",
                    value: "high",
                    color: '#ffc107',
                },
                {
                    id: "priority-urgent",
                    label: "Urgent",
                    value: "urgent",
                    color: '#dc3545',
                },
            ],
        },
        date_start: data.date_start || '',
        due_date: data.due_date || '',
        time_estimate: data.time_estimate || '',
        title: data.title,
        assignees: data.assignees,
        time_tracking: data.time_tracking,
    });

    //  These Are Used Primarily For Task Creation
    const getItems = useCallback(() => {
        return fields
    }, [fields]);

    useImperativeHandle(ref, () => {
        return {
            getItems,
        };
    });

    const updateItem = async (keyName, value) => {

        setFields(prevFields => {
            if (keyName !== 'statuses' && keyName !== 'priority') {
                return {
                    ...prevFields,
                    [keyName]: value
                };
            } else {
                return {
                    ...prevFields,
                    [keyName]: {
                        ...prevFields[keyName],
                        value: value
                    }
                };
            }
        });

        //  Update The Field In The DB If We're Displaying Not Creating
        if (!createTask && keyName !== 'assignees') {

            try {

                let _url = `https://${globalData.api_url}/task/${taskId}/basicField`;

                //  The DB Expects Status
                if (keyName === 'statuses') keyName = 'status';

                let _data = {
                    [keyName]: value
                };

                await axios.put(_url, JSON.stringify(_data), { withCredentials: true });

            } catch (error) {
                console.error(error);
            }
        }

    };



    return (
        <>
            <div className="card-body">
                <div className="row">

                    {/* This Is The Input For The Task Title When Viewing*/}
                    {!createTask && (
                        <div className="col-xl-12 mb-2">
                            <FieldsInput required={true} type={'text'} value={fields.title} callBack={(value) => updateItem('title', value)} />
                        </div>
                    )}

                    <div className="col-xl-6">
                        <table className="table">
                            <tbody>
                                <tr>
                                    <td><span className="me-2"><i className="fas fa-question-circle"></i></span>Status</td>
                                    <td><FieldsDropdown data={fields.statuses} callBack={(value) => updateItem('statuses', value.id)} /></td>
                                </tr>
                                <tr>
                                    <td><span className="me-2"><i className="fa-solid fa-hourglass"></i></span>Time Estimate</td>
                                    <td>
                                        {/*<FieldsInput options={{ type: 'text', value: '1hr' }} />*/}
                                        <FieldsTimeInput
                                            placeholder={"Add Time Estimate EX: 2hrs & 30mins"}
                                            callBack={(value) => updateItem('time_estimate', value)}
                                            defaultValue={fields.time_estimate}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td><span className="me-2"><i className="fa fa-calendar"></i></span>Date Start</td>
                                    <td><FieldsDate date={fields.date_start} callBack={(value) => updateItem('date_start', value)} /></td>
                                </tr>
                                <tr>
                                    <td><span className="me-2"><i className="fa fa-calendar"></i></span>Date Due</td>
                                    <td><FieldsDate date={fields.due_date} callBack={(value) => updateItem('due_date', value)} /></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="col-xl-6">

                        <table className="table">

                            <tbody>

                                <tr>
                                    <td><span className="me-2"><i className="fa fa-users"></i></span>Assignees</td>
                                    <td className="w-100">
                                        <FieldsAssignees selected={fields.assignees} taskId={taskId} createTask={createTask} callBack={(value) => updateItem('assignees', value)} />
                                    </td>
                                </tr>

                                <tr>
                                    <td><span className="me-2"><i className="fa fa-flag"></i></span>Priority</td>
                                    <td><FieldsDropdown data={fields.priority} callBack={(value) => updateItem('priority', value.id)} /></td>
                                </tr>

                            </tbody>

                        </table>
                    </div>


                    {!createTask && (
                        <>
                            {/* Maintain Own State Variables In The Time Tracking */}
                            <FieldsTimeTracker data={data.time_tracking} taskId={taskId} />
                            <hr />
                            <FieldsTaskSearch taskId={taskId} subtasks={data.subtasks} setBasicData={setBasicData}/>
                        </>
                    )}
                </div>
            </div>
        </>
    );
})


