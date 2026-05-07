
import { useState, useContext, useEffect } from 'react';
import { useUI } from '../../Contexts/UIContext';
import { Link } from 'react-router-dom';
import { groupByKeyToObject, groupByKey } from '../../../Utils/Utils';

import TaskTable from '../../Tables/TaskTable';
import TableButton from '../../Tables/components/TableButton';
import TableCheckbox from '../../Tables/components/TableCheckbox';
import TableTags from '../../Tables/components/TableTags';
import TableDropdown from '../../Tables/components/TableDropdown';
import TableDatePicker from '../../Tables/components/TableDatePicker';
import TableSlider from '../../Tables/components/TableSlider';
import TableInput from '../../Tables/components/TableInput';
import TableAssignees from '../../Tables/components/TableAssignees';
import { DataContext } from '../../Contexts/DataContext';

import axios from 'axios';

const Tasks = () => {

    // Allows Us To Use The Modal
    const { openModal } = useUI();
    const { globalData } = useContext(DataContext);

    // Load The Task Data And Render Layout
    const [taskData, setTaskData] = useState([]);
    const [rearrangeMenus, setRearrangeDropdowns] = useState([]);
    const [filterDropdownOptions, setFilterDropdownOptions] = useState([]);
    const [columns, setColumns] = useState([]);
    const [priority, setPriority] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [activeTab, setActiveTab] = useState('not_started');

    

    useEffect(() => {

        // Reset The data
        setDataLoaded(false);
        setTaskData([]);
        setRearrangeDropdowns([]);
        setFilterDropdownOptions([]);
        setColumns([]);

        //  Refresh Task Data To Build Task Table Again
        refreshTasks();

    }, []);

    //  Builds The Task Tables Data
    const buildTaskTable = (responseData) => {

        responseData['priority'] = [
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
        ];

        // The Custom Fields That Can Be Sorted
        const sortable = [
            'text',
            'number',
            'currency',
            'date',
            'dropdown',
            'checkbox',
            'slider',
        ];

        //  These Are Custom Fields That Have Rearrangable Sort ORders
        //  This Will Open A Dropdown To AlloW Drag And Drop To Reorder What Comes First
        //  You Can Add More To The List Here If We Need To Support
        //  Other Custom Fields Or Fields Here
        const rearrangeable = [
            'dropdown',
            //'status',
        ];

        // Setup Task Views and Rearrangables
        const { tasks, customFields, statuses, priority, workspace_users } = responseData;

        //  Even Though Priority Orders Can't Be Changed We Add It Here
        //  So We Can Use 1 Function To Sort It In The Future We May Allow
        //  For Custom Priorities
        let _rearrangeMenu = {
            priority: [...priority],
        };

        let _filterDropdownOptions = [
            {
                id: 'priority',
                label: 'Priority',
                type: 'priority',
                options: [...priority]
            },
            {
                id: 'assignees',
                label: 'Assignee(s)',
                type: 'users',
                options: [...workspace_users],
            },
            {
                id: 'date_start',
                label: 'Date Start',
                type: 'date',
                options: '',
            },
            {
                id: 'due_date',
                label: 'Due Date',
                type: 'date',
                options: '',
            }
        ];

        // Columns Definition For Table
        let _columns = [
            {
                accessorKey: "title",
                header: "Title",
                size: 400,
                enableColumnFilter: true,
                cell: props => <TableButton
                    row={props.row}
                    getValue={props.getValue}
                    table={props.table}
                    column={props.column}
                    onClickAction={() => {
                        //  Opens The Task View Modal
                        openModal(
                            "View Task",
                            {
                                type: 'taskView',
                                compProps: {
                                    taskId: props.row.original.hash,
                                    taskName: props.row.original.title,
                                    prevUrl: window.location.href
                                }
                            },
                            {
                                modalSize: 'modal-xxl',
                                scrollable: true,
                            },
                            {
                                close: refreshTasks,
                            }
                        );

                        window.history.pushState({}, '', `/task/${props.row.original.hash}`);
                    }}

                    className="btn btn-link"
                />,
                footer: "Title",
                type: 'text',
            },
            {
                accessorKey: "assignees",
                header: "Assignee(s)",
                enableSorting: true,
                size: 275,
                cell: props => <TableAssignees
                    row={props.row}
                    getValue={props.getValue}
                    items={responseData.workspace_users}
                    table={props.table}
                    column={props.column}
                    onChange={
                        (value) => updateTableField({
                            task_id: props.row.original.hash,
                            type: 'basic',
                            fieldName: 'assignees',
                            value: value
                        }
                        )}
                />,
                type: 'users',
                //sortingFn: sortRearrangables,
                enableColumnFilter: true,
                filterFn: (row, columnId, filterValue) => {

                    const { clause, value } = filterValue;

                    const currentValue = row.getValue(columnId);

                    switch (clause) {

                        case ('equals'):
                            //  If The Arrays Arent Equal Length Then It Already Doesn't Match
                            if (currentValue.length !== value.length) {
                                return false;
                            }
                            // Check if every ID in the currentValue array exists in the value array
                            return currentValue.every(id => value.some(obj => obj.id === id));

                        case ('not_equals'):
                            // Check if any ID in the currentValue array exists in the value array
                            return !currentValue.some(id => value.some(obj => obj.id === id));

                        case ('is_set'):
                            return (currentValue.length > 0);

                        case ('is_not_set'):
                            return (currentValue.length < 1);

                        default:
                            return true;
                    }
                },
            },
            {
                accessorKey: "status",
                header: "Status",
                size: 200,
                cell: props => <TableDropdown
                    row={props.row}
                    getValue={props.getValue}
                    items={responseData.statuses[props.row.original.space_hash]}
                    table={props.table}
                    column={props.column}
                    onChange={
                        (value) => updateTableField({
                            task_id: props.row.original.hash,
                            type: 'basic',
                            fieldName: 'status',
                            value: value
                        }
                        )}
                />,
                type: 'dropdown',
                disableReArrange: true,
                enableColumnFilter: true,
                filterFn: (row, columnId, filterValue) => {

                    const { clause, value } = filterValue;

                    const currentStatus = row.getValue(columnId);

                    if (clause == 'equals') {
                        return value.includes(currentStatus);
                    } else {
                        return !value.includes(currentStatus);
                    }
                },
            },
            {
                accessorKey: "priority",
                header: "Priority",
                size: 200,
                cell: props => <TableDropdown
                    row={props.row}
                    getValue={props.getValue}
                    items={responseData.priority}
                    table={props.table}
                    column={props.column}
                    onChange={
                        (value) => updateTableField({
                            task_id: props.row.original.hash,
                            type: 'basic',
                            fieldName: 'priority',
                            value: value
                        }
                        )}
                />,
                type: 'dropdown',
                sortingFn: 'sortRearrangables',
                filterFn: (row, columnId, filterValue) => {

                    const { clause, value } = filterValue;

                    const currentValue = row.getValue(columnId);

                    switch (clause) {

                        case ('equals'):
                            return value == currentValue;

                        case ('not_equals'):
                            return value !== currentValue;

                        case ('is_set'):
                            return (currentValue != '' && currentValue != 'priority-none');

                        case ('is_not_set'):
                            return (currentValue == '' || currentValue == 'priority-none');
                    }
                },
            },
            {
                accessorKey: "date_start",
                header: "Date Start",
                cell: props => <TableDatePicker
                    row={props.row}
                    getValue={props.getValue}
                    table={props.table}
                    column={props.column}
                    onChange={
                        (value) => updateTableField({
                            task_id: props.row.original.hash,
                            type: 'basic',
                            fieldName: 'date_start',
                            value: value
                        }
                        )}
                />,
                filterFn: (row, columnId, filterValue) => {

                    const { clause, value } = filterValue;

                    const currentValue = row.getValue(columnId);

                    const { start, end } = value;

                    console.log(start, currentValue);

                    switch (clause) {

                        case ('equals'):
                            return start == currentValue;

                        case ('not_equals'):
                            return start !== currentValue;

                        case ('between'):
                        case ('not_between'):
                            const _start = new Date(start);
                            const _end = new Date(end);
                            const _currentValue = new Date(currentValue);
                            const _between = _currentValue >= _start && _currentValue <= _end;
                            if (clause == 'between') {
                                return _between;
                            } else {
                                return !_between;
                            }

                        default:
                            return false;
                    }
                },
            },
            {
                accessorKey: "due_date",
                header: "Due Date",
                cell: props => <TableDatePicker
                    row={props.row}
                    getValue={props.getValue}
                    table={props.table}
                    column={props.column}
                    onChange={
                        (value) => updateTableField({
                            task_id: props.row.original.hash,
                            type: 'basic',
                            fieldName: 'due_date',
                            value: value
                        }
                        )}
                />,
                filterFn: (row, columnId, filterValue) => {

                    const { clause, value } = filterValue;

                    const currentValue = row.getValue(columnId);

                    const { start, end } = value;

                    console.log(start, currentValue);

                    switch (clause) {

                        case ('equals'):
                            return start == currentValue;

                        case ('not_equals'):
                            return start !== currentValue;

                        case ('between'):
                        case ('not_between'):
                            const _start = new Date(start);
                            const _end = new Date(end);
                            const _currentValue = new Date(currentValue);
                            const _between = _currentValue >= _start && _currentValue <= _end;
                            if (clause == 'between') {
                                return _between;
                            } else {
                                return !_between;
                            }

                        default:
                            return false;
                    }
                },
            },
        ];

        // Setup Custom Field Columns
        Object.keys(customFields).forEach(key => {

            const { type, options } = customFields[key];

            let newCol = {

                accessorKey: key,
                header: customFields[key].name,
                size: 200,
                enableSorting: sortable.includes(type) ? true : false,
                type,
                cell: props => {

                    switch (type) {

                        case 'dropdown':
                            return (
                                <TableDropdown
                                    row={props.row}
                                    getValue={props.getValue}
                                    items={options}
                                    table={props.table}
                                    column={props.column}
                                    onChange={
                                        (value) => updateTableField({
                                            task_id: props.row.original.hash,
                                            type: 'customField',
                                            fieldName: key,
                                            value: value
                                        }
                                        )}
                                />
                            );
                        case 'labels':
                            return (
                                <TableTags
                                    row={props.row}
                                    getValue={props.getValue}
                                    items={options}
                                    table={props.table}
                                    column={props.column}
                                    onChange={
                                        (value) => updateTableField({
                                            task_id: props.row.original.hash,
                                            type: 'customField',
                                            fieldName: key,
                                            value: value
                                        }
                                        )}
                                />
                            );
                        case 'slider':
                            return (
                                <TableSlider
                                    row={props.row}
                                    getValue={props.getValue}
                                    options={options}
                                    table={props.table}
                                    column={props.column}
                                    onChange={
                                        (value) => updateTableField({
                                            task_id: props.row.original.hash,
                                            type: 'customField',
                                            fieldName: key,
                                            value: value
                                        }
                                        )}
                                />
                            );

                        case 'text':
                        case 'number':
                        case 'currency':
                        case 'phone':
                        case 'link':

                            let inputOptions = [];

                            if (type == 'currency') {
                                inputOptions = { currency: customFields[key].currency, ...options };
                            } else {
                                inputOptions = options;
                            }

                            return (

                                <TableInput
                                    row={props.row}
                                    getValue={props.getValue}
                                    type={type}
                                    options={inputOptions}
                                    table={props.table}
                                    column={props.column}
                                    onChange={
                                        (value) => updateTableField({
                                            task_id: props.row.original.hash,
                                            type: 'customField',
                                            fieldName: key,
                                            value: value
                                        }
                                        )}
                                />
                            );

                        case 'checkbox':
                            return (
                                <TableCheckbox
                                    row={props.row}
                                    table={props.table}
                                    column={props.column}
                                    getValue={props.getValue}
                                    onChange={
                                        (value) => updateTableField({
                                            task_id: props.row.original.hash,
                                            type: 'customField',
                                            fieldName: key,
                                            value: value
                                        }
                                        )}
                                />
                            );
                        case 'date':
                            return (
                                <TableDatePicker
                                    row={props.row}
                                    getValue={props.getValue}
                                    table={props.table}
                                    column={props.column}
                                    onChange={
                                        (value) => updateTableField({
                                            task_id: props.row.original.hash,
                                            type: 'customField',
                                            fieldName: key,
                                            value: value
                                        }
                                        )}
                                />
                            )

                        // Add cases for other custom field types here
                        default:
                            return null;
                    }
                },

            }

            //  Set Filter Function For Date
            if (type == 'date') {

                newCol['filterFn'] = (row, columnId, filterValue) => {

                    const { clause, value } = filterValue;

                    const currentValue = row.getValue(columnId);

                    const { start, end } = value;

                    console.log(start, currentValue);

                    switch (clause) {

                        case ('equals'):
                            return start == currentValue;

                        case ('not_equals'):
                            return start !== currentValue;

                        case ('between'):
                        case ('not_between'):
                            const _start = new Date(start);
                            const _end = new Date(end);
                            const _currentValue = new Date(currentValue);
                            const _between = _currentValue >= _start && _currentValue <= _end;
                            if (clause == 'between') {
                                return _between;
                            } else {
                                return !_between;
                            }

                        default:
                            return false;
                    }
                }
            } else {

                //  For Everything Else This Will Be The Catch All 
                newCol['filterFn'] = (row, columnId, filterValue) => {
                    
                    let { clause, value } = filterValue;

                    const currentValue = row.getValue(columnId) ;

                    switch (clause) {

                        case('contains'):
                            if( currentValue == undefined ) return false;
                            return currentValue.includes(value);
                        case('does_not_contain'):
                            if( currentValue == undefined ) return true;
                            return !currentValue.includes(value);
                        case ('equals'):
                            return value == currentValue;
                        case ('not_equals'):
                            return value !== currentValue;
                        case ('between'):
                        case ('not_between'):
                            const _start = parseFloat(value.start);
                            const _end = parseFloat(value.end);
                            const _currentValue = parseFloat(currentValue);
                            const _between = _currentValue >= _start && _currentValue <= _end;
                            
                            if (clause == 'between') {
                                return _between;
                            } else {
                                return !_between;
                            }
                        
                        case('greater_than'):
                            return parseFloat( currentValue ) > parseFloat( value );
                        case('greater_than_equal_to'):  
                            return parseFloat( currentValue ) >= parseFloat( value );
                        case('less_than'):
                            return parseFloat( currentValue ) < parseFloat( value );
                        case('less_than_equal_to'):
                            return parseFloat( currentValue ) <= parseFloat( value );
                        case 'is_set':
                                return !!currentValue && currentValue !== '0';
                        case 'is_not_set':
                            return !currentValue || currentValue === '0';
    
    
                        default:
                            console.log();
                            return false;
                    }
                }
            }

            //  Build Rearrangable Menu Options
            if (rearrangeable.includes(type)) {
                _rearrangeMenu[key] = options;
                newCol.sortingFn = 'sortRearrangables'
            }

            _columns.push(newCol);

            _filterDropdownOptions.push({
                id: key,
                label: customFields[key].name,
                options: ('options' in customFields[key]) ? ((options instanceof Array) ? [...options] : { ...options }) : '',
                type: type
            })

        });

        setRearrangeDropdowns(_rearrangeMenu);
        setTaskData(tasks);
        setFilterDropdownOptions(_filterDropdownOptions);
        setColumns(_columns);
        setDataLoaded(true);
        setStatuses(statuses);

    }

    //  Rearrages The Sort Order For Dropdowns And Other Things That Need it
    const updateRearrangeMenus = (data) => {

        let newItems = { ...rearrangeMenus }

        console.log("newItems", newItems);
        newItems[data.keyRef] = data.items;

        setRearrangeDropdowns(newItems);
    }

    //  We Pass This To The Global Modal As A Comp-prop
    //  Once A Task Is Created Or The Task View Modal Is 
    //  Closed We'll Refresh The Data To Keep It Updated
    const refreshTasks = async () => {

        try {

            let _url = `https://${globalData.api_url}/user/tasks`;

            const response = await axios.get(_url, { withCredentials: true });

            if (response.status == 200) {

                buildTaskTable(response.data);

            }

        } catch (error) {

            console.log(error);

        }

    }

    /**
     * 
     * @param {string} type - Basic Field Or Custom Field Accepts basic || customField
     */
    const updateTableField = async ({ task_id, type, fieldName, value }) => {

        console.log(task_id, type, fieldName, value)

        let _url = `https://${globalData.api_url}/task/${task_id}/` + (type == 'basic' ? 'basicField' : 'customField')

        //  Update The Data In DB If We're Viewing A Task
        let _data = {
            [fieldName]: value
        };

        //  Assignees Uses A Different Endpoint
        if (fieldName == 'assignees') {

            let { action, user } = value;

            if (action == 'add') {

                _url = `https://${globalData.api_url}/task/${task_id}/assignee`;

                _data = [user];

                try {
                    await axios.post(_url, JSON.stringify(_data), { withCredentials: true });
                } catch (error) {
                    console.error(error);
                }

            } else if (action == 'del') {

                _url = `https://${globalData.api_url}/task/${task_id}/assignee/${user}`;

                try {
                    await axios.delete(_url, { withCredentials: true });
                } catch (error) {
                    console.error(error);
                }
            }

            return;
        }

        try {

            const response = await axios.put(_url, JSON.stringify(_data), { withCredentials: true });

            if (response.status == 200) {

                if (fieldName == 'status') {
                    setTaskData(prevTaskData =>
                        prevTaskData.map(task =>
                            task.hash === task_id ? { ...task, [fieldName]: value } : task
                        )
                    );
                }

            }

        } catch (error) {
            console.error(error);
        }

    }

    // Create a flat mapping of status hashes to types
    const statusTypeMapping = {};

    Object.values(statuses).forEach(statuses => {
        statuses.forEach(status => {
            statusTypeMapping[status.hash] = status.type;
        });
    });

    console.log("statusTypeMapping",statusTypeMapping);

    // Initialize object to store tasks by status
    const tasksByStatus = {
        not_started: [],
        active: [],
        completed: [],
        cancelled: []
    };

    // Iterate through tasks and categorize them by status
    taskData.forEach(task => {
        tasksByStatus[statusTypeMapping[task.status]].push(task);
    });
    

    //console.log(tasksByStatus);

    const tabs = Object.entries(tasksByStatus).map(([status]) => (
        <li className="nav-item" key={status}>
            <a
                className={`nav-link ${activeTab === status ? 'active' : ''}`}
                id={`tab-status-${status}`}
                data-bs-toggle="tab"
                href={`#body-status-${status}`}
                role="tab"
                aria-controls={`body-status-${status}`}
                aria-selected={activeTab === status}
            >
                {status.replace(/_/g, ' ').replace(/\b\w/g, firstLetter => firstLetter.toUpperCase())}
            </a>
        </li>
    ));

    // Generate The Statuses Body Content
    const tabContent = Object.entries(tasksByStatus).map(([status, tasks]) => (
        <div
            className={`tab-pane fade ${activeTab === status ? 'show active' : ''}`}
            id={`body-status-${status}`}
            role="tabpanel"
            aria-labelledby={`tab-status-${status}`}
            key={status}
        >
            <TaskTable
                tableData={tasks}
                columns={columns}
                rearrangeMenus={rearrangeMenus}
                callBack={updateRearrangeMenus}
                filterDropdownOptions={filterDropdownOptions}
            />
        </div>
    ));


    return (
        <>
            <div className="container-fluid px-4">

                <h1 className="mt-4">My Tasks</h1>

                <ol className="breadcrumb mb-4">
                    <li className="breadcrumb-item"><Link to="/">Dashboard</Link></li>
                    <li className="breadcrumb-item active">Tasks</li>
                </ol>

                <div className="card">

                    <div className="card-header">

                        <button
                            className="float-end btn btn-success btn-sm"
                            onClick={() => {
                                openModal(
                                    "Add New Task",
                                    {
                                        type: 'createTask',
                                        compProps: {
                                            callBack: () => { refreshTasks();}
                                        },
                                    },
                                    {
                                        modalSize: 'modal-xl',
                                        scrollable: true,
                                    }
                                );
                            }}
                        >
                            Add New Task
                        </button>

                        <ul className="nav nav-tabs card-header-tabs" id="nav-tab" role="tablist">
                            {tabs}
                        </ul>

                    </div>

                    <div className="card-body">

                        <div className="tab-content" id="nav-tabContent">
                            {tabContent}
                        </div>
                    </div>
                </div>

                <div className="row mt-2">

                    <div className="col-sm-6">
                        <div className="card">
                            <div className="card-header">
                                Team Tasks
                            </div>
                            <div className="card-body">
                            </div>
                        </div>
                    </div>

                    <div className="col-sm-6">
                        <div className="card">
                            <div className="card-header">
                                Department Tasks
                            </div>
                            <div className="card-body">
                            </div>
                        </div>
                    </div>

                </div>

            </div>


        </>
    );
};


export default Tasks;