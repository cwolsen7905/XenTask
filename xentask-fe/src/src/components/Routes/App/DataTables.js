
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useUI } from '../../Contexts/UIContext';
import { useData } from '../../Contexts/DataContext';
import DataTable from '../../Tables/DataTable';
import axios from 'axios';
import TableInputDiv from '../../Tables/components/TableInputDiv';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
    faTrash,
    faCirclePlus,
} from '@fortawesome/free-solid-svg-icons';

import TablePlaceholder from '../../Tables/components/TablePlaceholder';

const DataTables = () => {

    const { id } = useParams();
    const { openModal, showToastNotification } = useUI();
    const { globalData } = useData();

    const [addingRow, toggleAddRow] = useState(false);
    const [rowSelection, setRowSelection] = useState({});
    const [data, setData] = useState(null);


    const getDataTable = async () => {

        //console.log(`Updating ${type} : ${id} To ${parentType} : ${parentId}`)

        let _url = `https://${globalData.api_url}/datatable/${id}`;

        try {

            const response = await axios.get(_url, { withCredentials: true });

            if (response.status == 200) {

                let _data = response.data;

                //  Create The Selection Column
                const selectColumn = {
                    id: 'select',
                    enableSorting: false,
                    enablePinning: false,
                    meta: {
                        hasOptions: false,
                        canDelete: false
                    },
                    header: ({ table }) => (
                        <input
                            className="form-check-input"
                            type="checkbox"
                            checked={table.getIsAllRowsSelected()}
                            onChange={table.getToggleAllRowsSelectedHandler()} // or getToggleAllPageRowsSelectedHandler
                        />
                    ),
                    cell: ({ row }) => (
                        <div className="px-1">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                checked={row.getIsSelected()}
                                disabled={!row.getCanSelect()}
                                onChange={row.getToggleSelectedHandler()}
                            />
                        </div>
                    ),
                    size: 70,
                };

                // Build The Rest Of The Columns
                const columns = [
                    selectColumn, // Add the select column first
                    ..._data.columns.map((e) => ({
                        accessorKey: e.id,
                        size: 400,
                        id: e._id,
                        meta: {
                            hasOptions: true,
                            canDelete: (!e.is_xt && !e.locked)
                        },
                        header: (props) => (
                            <TableInputDiv
                                docId={_data._id}
                                row={props.row}
                                table={props.table}
                                column={props.column}
                                initValue={e.label}
                                updateColumn={(docId, columnHash, value) => updateColumn(docId, columnHash, value, true)}
                            />
                        ),
                        enableSorting: true,
                        cell: (props) => (
                            <TableInputDiv
                                docId={props.row?.original?._id}
                                row={props.row}
                                table={props.table}
                                column={props.column}
                                initValue={() => props.getValue()}
                                updateColumn={(docId, columnHash, value) => updateColumn(docId, columnHash, value, false)}
                            />
                        ),
                    })),
                    {
                        accessorKey: 'actions', // New column for buttons
                        id: 'actions',
                        header: 'Actions',
                        enableResizing: false,
                        enableSorting: false,
                        meta: {
                            hasOptions: false,
                            canDelete: false
                        },
                        size: 100,
                        cell: (props) => (
                            <div>
                                <button className='btn btn-danger' onClick={() => deleteRow(props.row.original._id)}>
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </div>
                        ),
                    },


                ];

                _data.columns = columns;

                console.log("newData", _data);

                setData(_data);
            }

        } catch (error) {
            console.error(error);
        }

    }

    useEffect(() => {
        getDataTable();
    }, id);



    const [file, setFile] = useState(null);

    const fileInputRef = useRef(null); // Create a ref for the input

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];

        if (selectedFile && selectedFile.type === "text/csv") {

            setFile(selectedFile);
            uploadFile(selectedFile);

        } else {
            
            showToastNotification({
                type: 'danger',
                message: `Uploaded File Must Be A CSV`
            });

            event.target.value = ""; // Reset input
        }
    };

    const uploadFile = async (file) => {

        const formData = new FormData();
        formData.append("file", file);

        let _url = `https://${globalData.api_url}/datatable/${id}/import`;

        try {

            const response = await axios.post(_url, formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true
            });
            
            //  Rebuild The DataTable
            if( response.status == 200 ) {
                getDataTable();
                setFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = ""; // Reset input field
                }
            }

        } catch (error) {

            showToastNotification({
                type: 'danger',
                message: error.response.data.msg
            });
           
            if (fileInputRef.current) {
                fileInputRef.current.value = ""; // Reset input field
            }

            setFile(null);
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current.click(); // Trigger the file input using ref
    };


    const updateColumn = async (docId, columnHash, value, isHeader = false) => {

        console.log("Updating Column", docId, columnHash, value);

        let _url = `https://${globalData.api_url}/datatable/${id}`;

        let _data = {
            docId,
            columnId: columnHash,
            value,
            isHeader,
        }

        try {

            const response = await axios.put(_url, _data, { withCredentials: true });
            console.log(response);

        } catch (error) {

            console.error(error);

        }

    };

    const addNewRow = async (rowData) => {

        let _url = `https://${globalData.api_url}/datatable/${id}/addRow`;

        try {

            const response = await axios.post(_url, rowData, { withCredentials: true });

            if (response.status == 200) {

                let _data = {
                    ...data,
                    data: [...data.data, { _id: response.data._id, ...rowData }]
                };

                setData(_data);

                return true;

            } else {
                return false;
            }

        } catch (error) {
            return false;
            console.error(error);
        }
    };

    const deleteRows = async () => {

        let _url = `https://${globalData.api_url}/datatable/${id}/deleteRows`;

        let _data = { rows: Object.keys(rowSelection) };

        try {

            const response = await axios.post(_url, _data, { withCredentials: true });
            console.log("rows To Remove", _data);
            if (response.status == 200) {
                setData(prevData => ({
                    ...prevData,
                    data: prevData.data.filter(row => !_data.rows.includes(row._id)) // Assuming row.id exists
                }));
            }

        } catch (error) {

            console.error(error);

        }

    };

    const deleteRow = async ($rowId) => {

        let _url = `https://${globalData.api_url}/datatable/${id}/${$rowId}`;

        try {
            const response = await axios.delete(_url, { withCredentials: true });

            setData(prevData => ({
                ...prevData,
                data: prevData.data.filter(row => row._id != $rowId) // Assuming row.id exists
            }));
        } catch (error) {
            console.error(error);
        }

    };

    const addColumn = async () => {

        let _url = `https://${globalData.api_url}/datatable/${id}/addColumn`;

        try {

            const response = await axios.post(_url, { docId: data._id }, { withCredentials: true });

            if (response.status == 200) {

                let _newColumn = {
                    accessorKey: response.data.id,
                    size: 400,
                    id: response.data.id,
                    meta: {
                        hasOptions: true,
                        canDelete: true
                    },
                    header: (props) => (
                        <TableInputDiv
                            docId={data._id}
                            row={props.row}
                            table={props.table}
                            column={props.column}
                            initValue={response.data.label}
                            updateColumn={(docId, columnHash, value) => updateColumn(docId, columnHash, value, true)}
                        />
                    ),
                    enableSorting: true,
                    cell: (props) => (
                        <TableInputDiv
                            docId={props.row?.original?._id}
                            row={props.row}
                            table={props.table}
                            column={props.column}
                            initValue={() => props.getValue()}
                            updateColumn={(docId, columnHash, value) => updateColumn(docId, columnHash, value, false)}
                        />
                    ),
                }

                // Find the index of the "actions" column
                const actionsIndex = data.columns.findIndex(col => col.accessorKey === 'actions');

                // Insert the new column before "actions"
                const updatedColumns = [
                    ...data.columns.slice(0, actionsIndex), // Keep everything before "actions"
                    _newColumn,                             // Insert the new column
                    ...data.columns.slice(actionsIndex),    // Keep "actions" and anything after
                ];

                // Update state while keeping other data intact
                setData(prevData => ({
                    ...prevData,
                    columns: updatedColumns
                }));

            }

        } catch (error) {
            console.error(error);
        }

    };

    const deleteColumn = async (columnId) => {

        let _url = `https://${globalData.api_url}/datatable/${id}/column/${data._id}/${columnId}`;

        try {

            const response = await axios.delete(_url, { withCredentials: true });

            if (response.status == 200) {
                console.log("Removing", columnId);
                setData(prevData => ({
                    ...prevData,
                    columns: prevData.columns.filter(column => column.accessorKey !== columnId)
                }));

            }

        } catch (error) {
            console.error(error);
        }

    };

    if (!data) {
        return (<TablePlaceholder />)
    }

    return (
        <div className="container-fluid px-4">

            <h1 className="mt-4">{data.tableName}</h1>

            <ol className="breadcrumb mb-4">
                <li className="breadcrumb-item">Dashboard</li>
                <li className="breadcrumb-item active">DataTable</li>
                <li className="breadcrumb-item active">{data.tableName}</li>
            </ol>


            <div className='mb-2 d-flex'>

                <OverlayTrigger
                    placement="auto" // Set the desired placement (e.g., "top", "bottom", "left", "right")
                    overlay={
                        <Tooltip>
                            Please ensure that your CSV file has a header row, 
                            with each column name matching the current column order. 
                            The data in each column must align accordingly.
                            Any new columns included in the CSV will be added automatically.
                        </Tooltip>
                    }
                >
                    <div>

                        <button
                            type="button"
                            className='btn btn-primary me-2'
                            onClick={handleButtonClick} // Attach the onClick handler
                            disabled={data.columns.length < 1}
                        >
                            Import Data
                        </button>
                        <input
                            ref={fileInputRef} // Attach the ref to the input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            style={{ display: "none" }} // Keep this to hide the input
                        />
                    </div>
                </OverlayTrigger>
                
                <button type="button" className='btn btn-success me-2' onClick={addColumn}>Add Column</button>
                <button type="button" className='btn btn-success me-2' onClick={() => toggleAddRow(!addingRow)}><FontAwesomeIcon icon={faCirclePlus} /> Add Row</button>

                {
                    (Object.keys(rowSelection).length > 0) && (
                        <button type="button" className='btn btn-danger' onClick={deleteRows}>Delete Rows</button>
                    )
                }
            </div>

            <DataTable
                columns={data.columns}
                tableData={data.data}
                rowSelection={rowSelection}
                addingRow={addingRow}
                toggleAddRow={toggleAddRow}
                setRowSelection={setRowSelection}
                addNewRow={addNewRow}
                deleteColumn={deleteColumn}
            />
        </div>
    )

};


export default DataTables;