import { Link, useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useUI } from '../../../Contexts/UIContext';
import { useData } from '../../../Contexts/DataContext';
import ModalSidePanel from '../../../Modal/Body/ModalSidePanel';
import TablePlaceholder from '../../../Tables/components/TablePlaceholder';
import { v4 as uuidv4 } from "uuid";

import axios from 'axios';
import ListViewSwitcher from './ListViewSwitcher';

import FilterItem from '../../../Tables/components/Filters/FilterItem';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faMagnifyingGlass,
    faFilter,
    faPencil,
    faTrash,
    faShare,
    faColumns
} from '@fortawesome/free-solid-svg-icons';

const Lists = () => {

    //  Data Context
    const { globalData, listTable, refreshTasks } = useData();

    //  UI Context
    const { openModal, showToastNotification } = useUI();

    const [viewType, setViewType] = useState('list');

    //  Populate Dropdown
    const [ forms, setForms] = useState([]);            
    const [ selectedForm, setSelectedForm] = useState('');

    //  Check For The Hash Id In The URL Params
    const { id } = useParams();

    // Load The Task Data And Render Layout
    const [taskData, setTaskData] = useState(null);
    const [taskCustomFields, setCustomFields] = useState({});

    const [datatables, setDataTables] = useState({});

    const [rearrangeMenus, setRearrangeDropdowns] = useState([]);

    const [statuses, setStatuses] = useState([]);
    const [listName, setListName] = useState(false);
    const [userDefinedFilters, setUserDefinedFilters] = useState({});

    

    //  Column Visibility
    const [allFields, setAllFields] = useState(null);               // This Is To Build The Column Visiblity Side Panel
    const [columnVisibility, setColumnVisibility] = useState({});   // Shows / Hides Columns

    //  These Are Custom Fields That Have Rearrangable Sort ORders
    //  This Will Open A Dropdown To AlloW Drag And Drop To Reorder What Comes First
    //  You Can Add More To The List Here If We Need To Support
    //  Other Custom Fields Or Fields Here
    const rearrangeable = [
        'dropdown',
        'status',
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

    const priority = [
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

    //  Opens Side Panel To Show/Hide Columns
    const sidePanelRef = useRef(null);

    //  Everytime The View's ID Changes Reload The Data
    useEffect(() => {

        // Reset The data
        //setDataLoaded(false);
        setTaskData(null);
        setRearrangeDropdowns([]);
        setFilterDropdownOptions([]);
        setRowSelection({})
        refreshTasks(id);
        getUserListFilters();

        console.log("id has changed resetting");

    }, [id]);

    //  This Is For Everytime The List Table Data Is Updated
    //  Because A Task Can Be Technically Added From Anywhere
    useEffect(() => {

        console.log("BUILDING TASK DATA BECAUSE LISTTABLE CHANGED");

        if (Object.keys(listTable).length > 0) buildTaskData(listTable);

    }, [listTable]);


    //  Builds The Task Tables Data
    const buildTaskData = (responseData) => {

        setListName(responseData.name);

        // Setup Task Views and Rearrangables
        const { tasks, customFields, datatables, statuses, workspace_users, forms } = responseData;

        setForms(forms || []);

        //  Even Though Priority Orders Can't Be Changed We Add It Here
        //  So We Can Use 1 Function To Sort It In The Future We May Allow
        //  For Custom Priorities
        let _rearrangeMenu = {
            priority: [...priority],
            status: [...statuses]
        };

        let _filterDropdownOptions = [
            {
                id: 'status',
                label: 'Status',
                options: [...statuses],
                type: 'status'  
            },
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

        //  This Is To Build The Column Visiblity
        let _fields = [
            {
                key: 'assignees',
                title: "Assignees",
                type: 'users',
                fieldType: 'basic'
            },
            {
                key: 'status',
                title: "Status",
                type: 'dropdown',
                fieldType: 'basic'
            },
            {
                key: 'priority',
                title: "Priority",
                type: 'dropdown',
                fieldType: 'basic'
            },
            {
                key: 'date_start',
                title: "Date Start",
                type: 'date',
                fieldType: 'basic'
            },
            {
                key: 'due_date',
                title: "Due Date",
                type: 'date',
                fieldType: 'basic'
            },
        ]

        // Setup Custom Field Columns
        Object.keys(customFields).forEach(key => {

            const { type, options } = customFields[key];

            //  Build Rearrangable Menu Options
            if (rearrangeable.includes(type)) {
                _rearrangeMenu[key] = options;
            }

            _filterDropdownOptions.push({
                id: key,
                label: customFields[key].name,
                options: ('options' in customFields[key]) ? ((options instanceof Array) ? [...options] : { ...options }) : '',
                type: type,
                fieldType: 'customField'
            })

            //  This Is To Build The Column Visiblity
            _fields.push({
                key: key,
                title: customFields[key].name,
                type: customFields[key].type
            })

        });

        // Configuration and setup are assumed to be done before this point

        // Retrieve saved column visibility from localStorage or use an empty object if none exists
        let _savedColumnVisible = localStorage.getItem(`${id}-columns`);
        let _previousVisible = _savedColumnVisible ? JSON.parse(_savedColumnVisible) : {};

        // Build column visibility mapping, defaulting to true if no saved value exists
        let _columnsVisible = _fields.reduce((acc, field) => {
            acc[field.key] = _previousVisible[field.key] !== undefined ? _previousVisible[field.key] : field.visible;
            return acc;
        }, {});

        // Save column visibility if there's no previous data in localStorage
        if (!_savedColumnVisible) {
            localStorage.setItem(`${id}-columns`, JSON.stringify(_columnsVisible));
        }

        setAllFields(_fields);

        setColumnVisibility(_columnsVisible);

        setRearrangeDropdowns(_rearrangeMenu);

        setFilterDropdownOptions(_filterDropdownOptions);

        setCustomFields(customFields);

        setDataTables(datatables);

        setStatuses(statuses);

        setTaskData(tasks);

    }

    //
    //  Filter Functions
    //
    //  Sets Which Fields Are Filterable
    const [filterDropdownOptions, setFilterDropdownOptions] = useState([]);

    //  These Are The Filters That The User Wants To Filter Columns By
    const [columnFilterRows, setcolumnFilterRows] = useState([]);

    //  These Are The Filters That Are Currently Active And Via The Above Rows
    const [columnFilters, setColumnFilters] = useState([]);
    const [activeFilterObj, setActiveFilterObj] = useState(null);


    //  Function Ran Once To Fetch User Defined Filters
    //  For the Tables
    const getUserListFilters = async () => {

        try {

            const _url = `https://${globalData.api_url}/list/${id}/filters`;

            const response = await axios.get(_url, { withCredentials: true });

            if (response.status === 200) {
                setUserDefinedFilters(response.data);
                //console.log("columnFilters", response.data)
            }

        } catch (error) {

            console.error("Error fetching users", error);

        }

    }

    const filterColumns = () => {

        setColumnFilters(prev => {

            // Create a copy of the previous filters
            let newFilters = [...prev];

            // Iterate through each item in columnFilterRows
            columnFilterRows.forEach(item => {

                // Remove any existing filter for the current column
                let _index = newFilters.findIndex(f => (f.filterItemId == item.id));

                // Add the new filter for the current item
                if (_index == -1) {

                    newFilters.push({
                        id: item.column,      // The Accessor ID
                        value: {
                            clause: item.clause,
                            value: (item.value ? item.value : '')
                        },
                        filterItemId: item.id
                    });

                } else {

                    newFilters[_index].value = {
                        clause: item.clause,
                        value: (item.value ? item.value : '')
                    };

                }

            });

            //console.log(newFilters);
            return newFilters;

        });

    };

    //  Filtering Task Items
    const onFilterChange = (id, value) => {

        setColumnFilters((prev) => {

            const newFilters = prev.filter((f) => f.id !== id).concat({
                id,
                value,
            });

            return newFilters;
        });
    }

    const setPredefinedFilter = (filter, key) => {

        setcolumnFilterRows(
            filter.value.map((f) => ({
                ...f,
                id: uuidv4()
            }))
        );

        let _active = {
            key,
            name: filter.name
        };

        setActiveFilterObj(_active);

    }

    //  Adds A New Row For Column Filters
    const addColumnFilter = () => {

        let newColumnFilters = [...columnFilterRows];

        newColumnFilters.push({
            id: uuidv4(),
        });

        setcolumnFilterRows(newColumnFilters);

    }

    const deleteColumnFilter = (id) => {

        // Find the index of the item with the specified id
        const index = columnFilterRows.findIndex(item => item.id === id);

        // console.log("index", index);

        if (index !== -1) {

            // Create a new array without the item to be deleted
            const newColumnFilterRows = [
                ...columnFilterRows.slice(0, index),
                ...columnFilterRows.slice(index + 1)
            ];


            let _index = columnFilters.findIndex(f => (f.filterItemId == id));

            const _newFilters = [
                ...columnFilters.slice(0, _index),
                ...columnFilters.slice(index + 1)
            ];

            // Update the state with the new array
            setcolumnFilterRows(newColumnFilterRows);
            setColumnFilters(_newFilters);

        }
    };

    //  Updates The Filter Items With The 
    const onFilterItemChange = (rowId, field, value) => {

        let _newColumnFilters = [...columnFilterRows];
        let _indexToUpdate = _newColumnFilters.findIndex(item => item.id == rowId);
        _newColumnFilters[_indexToUpdate][field] = value;
        setcolumnFilterRows(_newColumnFilters);

    }

    //
    // Row Filtering
    //
    const saveFilter = async ({ filters, update, ext }) => {

        let _compProps;

        if (!update) {

            //  Used To Save A Brand New Filter
            _compProps = {

                compProps: {
                    form: 'filters',
                    list: id,
                    filters,
                    callBack: (data) => {
                        getUserListFilters().then(() => {
                            ext.callBack(data);
                        });
                    },
                }

            };

        } else {

            //  Used Really For Renaming 
            _compProps = {
                compProps: {
                    form: 'filters',
                    list: id,
                    update: true,
                    ext,
                    callBack: (name) => {

                        setUserDefinedFilters(prevData => {

                            // If the hash key exists in the current data
                            if (prevData[ext.hash]) {
                                return {
                                    ...prevData,
                                    [ext.hash]: {
                                        ...prevData[ext.hash],
                                        name // Apply only the provided changes
                                    }
                                };
                            }
                            // If hash doesn't exist, return data as is
                            return prevData;
                        });
                    },
                }
            };

        }

        openModal(
            "Save Filter",
            _compProps,
        );

    }

    const updateFilter = async (hash, changes) => {

        try {

            let _url = `https://${globalData.api_url}/list/${id}/filters`;

            let _data = {
                hash,
                changes
            };

            const response = await axios.put(_url, _data, { withCredentials: true });

            if (response.status === 200) {

                setUserDefinedFilters(prevData => {

                    // If the hash key exists in the current data
                    if (prevData[hash]) {
                        return {
                            ...prevData,
                            [hash]: {
                                ...prevData[hash],
                                ...changes // Apply only the provided changes
                            }
                        };
                    }
                    // If hash doesn't exist, return data as is
                    return prevData;
                });

            } else {

                console.error(response);
            }

        } catch (error) {
            console.log(error);
        }


    }

    const deleteFilter = async (hash) => {

        try {

            let _url = `https://${globalData.api_url}/list/${id}/filters/${hash}`;

            const response = await axios.delete(_url, { withCredentials: true });

            if (response.status === 200) {

                setUserDefinedFilters(prevData => {
                    const filteredEntries = Object.entries(prevData).filter(([key, value]) => key !== hash);
                    const filteredObject = Object.fromEntries(filteredEntries);
                    return filteredObject;
                });

            } else {

                console.error(response);
            }

        } catch (error) {
            console.log(error);
        }


    }

    const shareFilter = async (hash) => {

        //console.log(hash);

        openModal(
            "Share Filter",
            {
                compProps: {
                    form: 'shareFilter',
                    list: id,
                    hash: hash
                }
            },
        );

    }

    const toggleColumnVisibility = (key) => {

        setColumnVisibility(prevState => ({
            ...prevState,
            [key]: !prevState[key]
        }));

    };

    const openColumnPanel = () => {

        //  Open Up The Modal If It's Not Already
        if (!(sidePanelRef.current.getIsVisible())) {

            sidePanelRef.current.openPanel("Display Columns");
        }

    }

    //
    //  Task Deletion
    //
    //  Set The Selected Table Rows 
    const [rowSelection, setRowSelection] = useState({});

    //  Delete The Selected Tables Tasks
    const deleteSelectedTasks = async () => {

        // Build List Of Selected Tasks To Delete
        const keysArray = Object.keys(rowSelection);

        let _data = { tasks: keysArray };

        try {

            let _url = `https://${globalData.api_url}/list/${id}/deleteTasks`;

            const response = await axios.put(_url, JSON.stringify(_data), { withCredentials: true });

            if (response.status == 200) {

                showToastNotification({
                    type: 'success',
                    message: `Deleted ${keysArray.length} Task(s)`
                });

                setRowSelection({});

                refreshTasks(id);

            }

        } catch (error) {

            showToastNotification({
                type: 'Danger',
                message: `There Was A Problem Processing Your Request`
            });
        }
    }

    //console.log("rowSelection", rowSelection);

    /**
     * A Callback Function ThatWill Update A Field
     * 
     * @param {string} type - Basic Field Or Custom Field Accepts basic || customField
     */
    const updateField = async ({ task_id, type, fieldName, value }) => {

        //console.log(task_id, type, fieldName, value)

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

            if (viewType == 'kanban') {
                let _updatedUsers = value.current.map(obj => obj.id);

                setTaskData(prevTaskData =>
                    prevTaskData.map(task =>
                        task.hash === task_id ? {
                            ...task,
                            [fieldName]: _updatedUsers
                        } : task
                    )
                );
            }

            return;
        }

        try {

            const response = await axios.put(_url, JSON.stringify(_data), { withCredentials: true });

            if (response.status == 200) {

                //console.log("Updating Field");

                //  Just Updating Status For Now
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

    const updateRearrangeMenus = (data) => {

        let newItems = { ...rearrangeMenus }

        console.log("newItems", newItems);
        newItems[data.keyRef] = data.items;

        setRearrangeDropdowns(newItems);
    }

    const openTaskModal = (data) => {

        console.log("Data",data);
        //  Opens The Task View Modal
        openModal(
            "View Task",
            {
                type: 'taskView',
                compProps: {
                    taskId: data.hash,
                    listId: data.list_uuid || data.list_hash, 
                    taskName: data.title,
                }
            },
            {
                modalSize: 'modal-xxl',
                scrollable: true,
            },
            {
                // When The Modal Closes Refresh The Tasks In
                // The Current List View
                close: () => {
                    //  Upon Closing Refresh The Table For Any Changes
                    refreshTasks(id);
                    //  Also Reset The Url back to the list
                    window.history.pushState({}, '', `/list/${id}`);
                },
            }
        );

        window.history.pushState({}, '', `/task/${data.hash}`);
    }

    const openListForm = ( form_hash ) => {

        setSelectedForm( form_hash );
        setViewType('forms');

    }

    return (
        <>

            <div className="container-fluid px-4">

                <h1 className="mt-4">{listName}</h1>

                <ol className="breadcrumb mb-4">
                    <li className="breadcrumb-item"><Link to="/">Dashboard</Link></li>
                    <li className="breadcrumb-item">List</li>
                    <li className="breadcrumb-item active">{listName}</li>
                </ol>

                {
                    taskData ? (

                        <>
                            <div className="row mb-4">
                                <div className="d-flex align-items-center">
                                    <div className="col-auto me-3">
                                        <div className="input-group">
                                            <input
                                                className="form-control"
                                                type="text"
                                                placeholder="Search for Task"
                                                aria-label="Search for..."
                                                onChange={(e) => onFilterChange("title", e.target.value)}
                                            />
                                            <button className="btn btn-primary" type="button">
                                                <FontAwesomeIcon icon={faMagnifyingGlass} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="col-auto me-3 d-flex align-items-center">
                                        <button
                                            className="btn btn-primary me-2"
                                            data-bs-toggle="dropdown"
                                            data-bs-popper-config='{"strategy":"fixed"}'
                                            data-bs-auto-close="outside"
                                            aria-expanded="false"
                                        >
                                            <FontAwesomeIcon icon={faFilter} />
                                            &nbsp;Filters
                                        </button>


                                        {/* Dropdown Menu Filter */}
                                        <div className="dropdown-menu p-2">

                                            {/* Filter Settings */}

                                            <div className="card">


                                                <div className="card-header d-flex justify-content-between align-items-center mb-2 p-2">
                                                    <h5>Filters</h5>
                                                    <div className="d-flex align-items-center">

                                                        {
                                                            activeFilterObj && (
                                                                <h5 className="me-2">&nbsp;<u>Active Filter</u>:
                                                                    <span className="text-success">
                                                                        &nbsp;{activeFilterObj.name}
                                                                    </span>
                                                                </h5>
                                                            )
                                                        }

                                                        <button
                                                            className="btn btn-primary btn-sm mx-2"
                                                            onClick={() => {
                                                                setcolumnFilterRows([]);
                                                                setColumnFilters([]);
                                                                setActiveFilterObj(null);
                                                            }}>
                                                            Clear Filters
                                                        </button>

                                                        <div className="dropdown">
                                                            <button className="btn btn-primary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                                Saved Filters
                                                            </button>
                                                            <ul className="dropdown-menu">
                                                                {
                                                                    Object.keys(userDefinedFilters).map((hash) => {

                                                                        const filter = userDefinedFilters[hash];

                                                                        return (
                                                                            <li key={hash} className='mt-2'>
                                                                                <div className="d-flex justify-content-between">
                                                                                    <button
                                                                                        className="dropdown-item"
                                                                                        onClick={() => {
                                                                                            setPredefinedFilter(filter, hash);
                                                                                        }}
                                                                                    >
                                                                                        {filter.name}
                                                                                    </button>

                                                                                    <div className="d-flex gap-2 me-2">
                                                                                        <button className="btn btn-primary btn-sm" onClick={() => saveFilter({ update: true, ext: { hash: hash, name: filter.name } })}>
                                                                                            <FontAwesomeIcon icon={faPencil} />
                                                                                        </button>
                                                                                        <button className="btn btn-danger btn-sm"
                                                                                            onClick={() => deleteFilter(hash)}
                                                                                        >
                                                                                            <FontAwesomeIcon icon={faTrash} />
                                                                                        </button>

                                                                                        <button className="btn btn-success btn-sm"
                                                                                            onClick={() => shareFilter(hash)}
                                                                                        >
                                                                                            <FontAwesomeIcon icon={faShare} />
                                                                                        </button>

                                                                                    </div>
                                                                                </div>
                                                                            </li>
                                                                        );
                                                                    }
                                                                    )
                                                                }
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>



                                                <div className="card-body filterDropdownMenu">
                                                    {columnFilterRows.map((item, index) => (
                                                        <FilterItem
                                                            item={item}
                                                            key={item.id}
                                                            id={item.id}
                                                            filterDropdownOptions={filterDropdownOptions}
                                                            deleteItem={deleteColumnFilter}
                                                            onFilterItemChange={onFilterItemChange}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <div
                                                className="mt-2 p-2 card-footer">
                                                <button className="btn btn-primary me-2" onClick={addColumnFilter}>Add Filter</button>
                                                <button className="btn btn-success me-2" onClick={filterColumns}>Set Filters</button>

                                                <div class="btn-group">
                                                    <button
                                                        type="button"
                                                        class="btn btn-primary"
                                                        onClick={
                                                            () => {
                                                                if (!saveFilter) return;
                                                                saveFilter({
                                                                    filters: { ...columnFilterRows },
                                                                    //  We Set The Callback Here Because When The Save Filter Modal Is 
                                                                    //  Finished, It'll Return The New Hash And The Name
                                                                    //  Future Edits And Saves Will Be Done To The Object
                                                                    ext: {
                                                                        callBack: (object) => {
                                                                            setActiveFilterObj(object);
                                                                        }
                                                                    }
                                                                })
                                                            }
                                                        }>
                                                        Save Filter
                                                    </button>

                                                    {activeFilterObj && (

                                                        <button type="button" class="btn btn-primary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
                                                        </button>
                                                    )}

                                                    <ul class="dropdown-menu">
                                                        <li>
                                                            <button
                                                                class="dropdown-item"
                                                                onClick={() => { updateFilter(activeFilterObj.key, { value: columnFilterRows }); }}
                                                            >
                                                                Update Active Filter
                                                            </button>
                                                        </li>

                                                    </ul>
                                                </div>

                                            </div>

                                        </div>

                                        <button className="btn btn-primary me-2" onClick={openColumnPanel}>
                                            <FontAwesomeIcon icon={faColumns} />
                                            &nbsp;Columns
                                        </button>

                                        {/* List View Change */}
                                        {globalData.is_internal && (
                                            <div className="dropdown me-2">
                                                <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                    View Type
                                                </button>
                                                <ul className="dropdown-menu">
                                                    <li><button className="dropdown-item" onClick={() => { setViewType('list') }}>List</button></li>
                                                    <li><button className="dropdown-item" onClick={() => { setViewType('kanban') }}>Kanban</button ></li>
                                                </ul>
                                            </div>
                                        )}

                                        <div class="btn-group">
                                            <button class="btn btn-primary" type="button" onClick={() => { openListForm('') }}>
                                                Create Form
                                            </button>
                                            <button type="button" class="btn btn-primary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
                                                <span class="visually-hidden">Create Form</span>
                                            </button>
                                            
                                                <ul className="dropdown-menu">
                                                    {forms.map(e=>{
                                                        return (
                                                            <li><button className="dropdown-item" onClick={ () => { openListForm(e.hash) } }>{e.name}</button></li>
                                                        )
                                                    })}
                                                </ul>
                                            
                                        </div>

                                    </div>

                                    {
                                        Object.keys(rowSelection).length > 0 && (
                                            <div className="col-auto">
                                                <button className="btn btn-danger" onClick={deleteSelectedTasks}>Delete Task</button>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                                    
                            <ListViewSwitcher
                                id={id}
                                viewType={viewType}
                                taskData={taskData}
                                allFields={allFields}
                                statuses={statuses}
                                taskCustomFields={taskCustomFields}
                                priority={priority}
                                sortable={sortable}
                                rearrangeable={rearrangeable}
                                rearrangeMenus={rearrangeMenus}
                                columnVisibility={columnVisibility}
                                rowSelection={rowSelection}
                                columnFilters={columnFilters}
                                
                                //  DataTables Related
                                datatables={datatables}
                                setDataTables={setDataTables}

                                
                                openTaskModal={openTaskModal}
                                setRearrangeDropdowns={setRearrangeDropdowns}
                                updateField={updateField}
                                updateRearrangeMenus={updateRearrangeMenus}
                                setTaskData={setTaskData}
                                setRowSelection={setRowSelection}

                                // Forms Related
                                setForms={setForms}
                                setSelectedForm={setSelectedForm}
                                selectedForm={selectedForm}

                            />

                            {/* Will Handle Which Fields To Display */}
                            <ModalSidePanel ref={sidePanelRef} style={{ minWidth: 300 }}>
                                {
                                    allFields.map((e) => {

                                        if (e.key && e.title) {

                                            return (
                                                <div className='d-flex justify-content-between align-items-center' key={e.key}>
                                                    <div className='row'>
                                                        <div class="form-check form-switch">
                                                            <input
                                                                class="form-check-input"
                                                                type="checkbox"
                                                                role="switch"
                                                                checked={columnVisibility[e.key]}
                                                                onClick={() => toggleColumnVisibility(e.key)}
                                                            />
                                                            <label class="form-check-label" for="flexSwitchCheckDefault">{e.title}</label>
                                                        </div>
                                                    </div>
                                                </div>
                                            )

                                        }
                                    })
                                }
                                <div className='mt-2'>
                                    <div class="d-grid gap-2">
                                        <button
                                            class="btn btn-primary"
                                            type="button"
                                            onClick={() => {
                                                sidePanelRef.current.toggleVisibility();
                                                localStorage.setItem(`${id}-columns`, JSON.stringify(columnVisibility));
                                            }}
                                        >
                                            Finish
                                        </button>
                                    </div>
                                </div>
                            </ModalSidePanel>

                        </>
                    ) : (
                        <TablePlaceholder />
                    )
                }

            </div >
        </>
    );
};


export default Lists;