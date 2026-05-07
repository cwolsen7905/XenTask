import { Link, useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { groupByKeyToObject } from '../../../../Utils/Utils';
import { useUI } from '../../../Contexts/UIContext';
import { useData } from '../../../Contexts/DataContext';
import TaskTable from '../../../Tables/TaskTable';
import TableButton from '../../../Tables/components/TableButton';
import TableCheckbox from '../../../Tables/components/TableCheckbox';
import TableTags from '../../../Tables/components/TableTags';
import TableDropdown from '../../../Tables/components/TableDropdown';
import TableDatePicker from '../../../Tables/components/TableDatePicker';
import TableSlider from '../../../Tables/components/TableSlider';
import TableInput from '../../../Tables/components/TableInput';
import TableAssignees from '../../../Tables/components/TableAssignees';
import TablePlaceholder from '../../../Tables/components/TablePlaceholder';
import TablePeople from '../../../Tables/components/TablePeople';
import TableDatatables from '../../../Tables/components/TableDatatables';
import axios from 'axios';

const List = ({

    taskData,
    statuses,
    taskCustomFields,
    datatables,
    setDataTables,
    priority,
    sortable,
    rearrangeable,
    rearrangeMenus,

    columnVisibility,
    setRowSelection,
    rowSelection,
    columnFilters,


    openTaskModal,
    updateField,
    updateRearrangeMenus,


    /*
    saveFilter,
    updateFilter,
    deleteFilter,
    shareFilter,
    openColumnPanel,
    
    filterDropdownOptions,
    userDefinedFilters,
    */

}) => {

    //  Data Context
    const { globalData, refreshTasks } = useData();

    //  UI Context
    const { openModal } = useUI();

    //  Check For The Hash Id In The URL Params
    const { id } = useParams();

    // Load The Task Data And Render Layout
    const [columns, setColumns] = useState([]);
    const [activeTab, setActiveTab] = useState('all');

    //  This Is For Everytime The List Table Data Is Updated
    //  Because A Task Can Be Technically Added From Anywhere
    useEffect(() => {

        buildTaskTable();

    }, [taskData]);


    //  Builds The Task Tables Data
    const buildTaskTable = async () => {

        // Columns Definition For Table
        let _columns = [
            {
                id: 'select',
                header: ({ table }) => (
                    <input className="form-check-input" type="checkbox"
                        checked={table.getIsAllRowsSelected()}
                        onChange={table.getToggleAllRowsSelectedHandler()} //or getToggleAllPageRowsSelectedHandler
                    />
                ),
                cell: ({ row }) => (
                    <div className="px-1">
                        <input className="form-check-input" type="checkbox"
                            checked={row.getIsSelected()}
                            disabled={!row.getCanSelect()}
                            onChange={row.getToggleSelectedHandler()}
                        />
                    </div>
                ),
                size: 70,
            },
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
                        openTaskModal({
                            hash: props.row.original.hash,
                            list_hash: id,//props.row.original.list_hash,
                            title: props.row.original.title,
                        })
                        window.history.pushState({}, '', `/task/${props.row.original.hash}`);
                    }}

                    className="btn btn-link text-start"
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
                    items={globalData.WORKSPACE_USERS}
                    table={props.table}
                    column={props.column}
                    onChange={
                        (value) => updateField({
                            task_id: props.row.original.hash,
                            type: 'basic',
                            fieldName: 'assignees',
                            value: value
                        }
                        )
                    }
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
                    items={statuses}
                    table={props.table}
                    column={props.column}
                    onChange={
                        (value) => updateField({
                            task_id: props.row.original.hash,
                            type: 'basic',
                            fieldName: 'status',
                            value: value
                        })}
                />,
                type: 'dropdown',
                sortingFn: 'sortRearrangables',
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
                    items={priority}
                    table={props.table}
                    column={props.column}
                    onChange={
                        (value) => updateField({
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
                        (value) => updateField({
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

                    //console.log(start, currentValue);

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
                        (value) => updateField({
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

                    //console.log(start, currentValue);

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
        Object.keys(taskCustomFields).forEach(key => {

            const { type, options } = taskCustomFields[key];
            
            let newCol = {

                accessorKey: key,
                header: taskCustomFields[key].name,
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
                                        (value) => updateField({
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
                                        (value) => updateField({
                                            task_id: props.row.original.hash,
                                            type: 'customField',
                                            fieldName: key,
                                            value: value
                                        }
                                        )}
                                />
                            );
                        case 'people':
                            return (
                                <TablePeople
                                    row={props.row}
                                    getValue={props.getValue}
                                    table={props.table}
                                    column={props.column}
                                    onChange={
                                        (value) => updateField({
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
                                        (value) => updateField({
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
                                inputOptions = { currency: taskCustomFields[key].currency, ...options };
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
                                        (value) => updateField({
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
                                        (value) => updateField({
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
                                        (value) => updateField({
                                            task_id: props.row.original.hash,
                                            type: 'customField',
                                            fieldName: key,
                                            value: value
                                        })
                                    }
                                />
                            )
                        case 'contacts':
                        case 'datatables':

                            return (
                                <TableDatatables

                                    options={options}
                                    datatables={datatables}
                                    setDataTables={setDataTables}

                                    row={props.row}
                                    getValue={props.getValue}
                                    table={props.table}
                                    column={props.column}
                                    onChange={
                                        (value) => updateField({
                                            task_id: props.row.original.hash,
                                            type: 'customField',
                                            fieldName: key,
                                            value: value
                                        })
                                    }
                                />
                            );
                        // Add cases for other custom field types here
                        default:
                            return null;
                    }
                },
            }


            //  Set Filter Functions 
            if (type == 'date') {

                newCol['filterFn'] = (row, columnId, filterValue) => {

                    const { clause, value } = filterValue;

                    const currentValue = row.getValue(columnId);

                    const { start, end } = value;

                    // console.log(start, currentValue);

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

            } else if (type == 'people' || type == 'labels' || type == 'contacts' || type == 'datatables') {

                newCol['filterFn'] = (row, columnId, filterValue) => {

                    const { clause, value } = filterValue;

                    const currentValue = row.getValue(columnId);

                    if (!currentValue || !value) return false;

                    switch (clause) {

                        case ('equals'):
                            //  If The Arrays Arent Equal Length Then It Already Doesn't Match
                            if ((currentValue.length !== value.length)) {
                                return false;
                            }
                            // Check if every ID in the currentValue array exists in the value array
                            return currentValue.every(id => value.includes(id));

                        /*  Unlike Above Where It Looks For Exact Match Of Ids Inside The Array
                            We're Looking for rows where it's not an exact match

                            EXAMPLE: 
                            const filterValue = [1];

                            const rows = [
                                [2, 3],
                                [2, 1, 3],
                                [1]
                            ];

                            Would Return [ [2, 3], [2, 1, 3] ] Because We're Only Looking for [1]
                        */
                        case ('not_equals'):
                            return !value.every(id => currentValue.includes(id)) || currentValue.length !== value.length;


                        case ('contains'):
                            return currentValue.some(item => value.includes(item));

                        case ('does_not_contain'):
                            // Check if any ID in the currentValue array exists in the value array
                            return !currentValue.some(item => value.includes(item));

                        case ('is_set'):
                            return (currentValue.length > 0);

                        case ('is_not_set'):
                            return (currentValue.length < 1);

                        default:
                            return true;
                    }

                }

            } else {

                //  For Everything Else This Will Be The Catch All 
                newCol['filterFn'] = (row, columnId, filterValue) => {

                    let { clause, value } = filterValue;

                    const currentValue = row.getValue(columnId);

                    switch (clause) {

                        case ('contains'):
                            if (currentValue == undefined) return false;
                            return currentValue.includes(value);
                        case ('does_not_contain'):
                            if (currentValue == undefined) return true;
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

                        case ('greater_than'):
                            return parseFloat(currentValue) > parseFloat(value);
                        case ('greater_than_equal_to'):
                            return parseFloat(currentValue) >= parseFloat(value);
                        case ('less_than'):
                            return parseFloat(currentValue) < parseFloat(value);
                        case ('less_than_equal_to'):
                            return parseFloat(currentValue) <= parseFloat(value);
                        case 'is_set':
                            return !!currentValue && currentValue !== '0';
                        case 'is_not_set':
                            return !currentValue || currentValue === '0';


                        default:

                            return false;
                    }
                }
            }

            //  Build Rearrangable Menu Options
            if (rearrangeable.includes(type)) {
                newCol.sortingFn = 'sortRearrangables'
            }

            _columns.push(newCol);

        });

        setColumns(_columns);

    }



    const taskDataGrouped = groupByKeyToObject(taskData, "status");//  Group Tasks By Status Value
    const statusKeys = Object.keys(taskDataGrouped);
    const finishedTypes = statuses.filter(item => item.type === 'cancelled' || item.type === 'completed').map(item => item.hash);

    const taskDataFiltered = taskData.filter(task => !finishedTypes.includes(task.status));

    const handleTabClick = (id) => {
        setActiveTab(id);
    };

    //  Generate The Statuses Tab
    const tabs = statuses.map(item => (
        <li className="nav-item" key={item.id || item.hash}>
            <a
                className={`nav-link ${activeTab === (item.id || item.hash) ? 'active' : ''}`}
                id={`tab-status-${item.id || item.hash}`}
                data-bs-toggle="tab"
                href={`#body-status-${item.id || item.hash}`}
                role="tab"
                aria-controls={`body-status-${item.id || item.hash}`}
                aria-selected={activeTab === (item.id || item.hash)}
                onClick={() => handleTabClick((item.id || item.hash))}>
                {item.name} Tasks
            </a>
        </li>
    ));

    //  Generate The Statuses Body Content
    const tabContents = statusKeys.map(status => (

        <div
            className={`tab-pane fade ${activeTab === status ? 'show active' : ''}`}
            id={`body-status-${status}`}
            role="tabpanel"
            aria-labelledby={`tab-status-${status}`}
            key={status}>

            <TaskTable
                tableData={taskDataGrouped[status]}
                columns={columns}
                rearrangeMenus={rearrangeMenus}
                columnFilters={columnFilters}
                setRowSelection={setRowSelection}
                rowSelection={rowSelection}
                updateRearrangeMenus={updateRearrangeMenus}
                columnVisibility={columnVisibility}
            />
        </div>
    ));

    return (
        <>
            <div className="card mb-2">
                <div className="card-header">
                    <div className="d-flex align-items-center">
                        {/* Tabs Section */}
                        <div
                            className="flex-grow-1 d-flex align-items-center"
                            style={{
                                whiteSpace: 'nowrap',
                                overflow: 'auto hidden',

                            }}
                        >
                            <ul
                                className="nav nav-tabs card-header-tabs flex-nowrap"
                                id="nav-tab"
                                role="tablist"
                            >
                                <li className="nav-item">
                                    <a
                                        id="nav-all-tab"
                                        data-bs-toggle="tab"
                                        href="#all-tasks"
                                        role="tab"
                                        aria-controls="nav-profile"
                                        aria-selected="false"
                                        className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
                                        onClick={() => handleTabClick('all')}
                                    >
                                        All Tasks
                                    </a>
                                </li>

                                {/* Render Dynamic Tabs */}
                                {taskData && tabs}
                            </ul>
                        </div>

                        {/* Add Task Button */}
                        <div className="ms-3 flex-shrink-0">
                            <button
                                className="btn btn-success"
                                onClick={() =>
                                    openModal(
                                        "Create A New Task",
                                        {
                                            compProps: {
                                                listId: id,
                                                callBack: (callBackData) => refreshTasks(id),
                                            },
                                            type: "createTask",
                                        },
                                        { modalSize: 'modal-xl' }
                                    )
                                }
                            >
                                Add Task
                            </button>
                        </div>
                    </div>
                </div>

                <div className="card-body">
                    <div className="tab-content" id="nav-tabContent">
                        {taskData ? (
                            <>
                                <div
                                    className={`tab-pane fade ${activeTab === 'all' ? 'show active' : ''}`}
                                    id="all-tasks"
                                    role="tabpanel"
                                    aria-labelledby="nav-all-tab"
                                >
                                    <TaskTable
                                        tableData={taskDataFiltered}
                                        columns={columns}
                                        rearrangeMenus={rearrangeMenus}
                                        columnFilters={columnFilters}
                                        setRowSelection={setRowSelection}
                                        rowSelection={rowSelection}
                                        updateRearrangeMenus={updateRearrangeMenus}
                                        columnVisibility={columnVisibility}
                                    />
                                </div>

                                {/* Other Tab Content */}
                                {tabContents}
                            </>
                        ) : (
                            <TablePlaceholder />
                        )}
                    </div>
                </div>
            </div>



        </>
    );
};


export default List;