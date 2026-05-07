/**
 * Creates A New Table Filter For Fields
 */
import axios from 'axios';
import { useState, useEffect, useContext, useRef } from 'react';
import { useData } from '../../../Contexts/DataContext';
import { useUI } from '../../../Contexts/UIContext';
import { v4 as uuidv4 } from 'uuid';
import TableColumnResource from './TableColumnResource';

// DnD
import {
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    closestCorners,
    useSensor,
    useSensors
} from "@dnd-kit/core"

import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates
} from "@dnd-kit/sortable"



const TableResource = () => {


    const { globalData } = useData();

    const { showToastNotification } = useUI();

    const [nameVal, setNameVal] = useState('');

    const [tableType, setTableType] = useState('manual');

    const [tableColumns, setTableColumns] = useState([]);

    const [activeObj, setActiveObj] = useState(null);

    const fileInputRef = useRef(null); // Declare ref


    function handleDragStart(event) {

        const { active } = event;
        setActiveObj(active.data.current);

    }

    function handleDragEnd(event) {
        const { active, over } = event;

        if (!active || !over || active.id === over.id) return;

        // Step 1: Get a copy of the current state
        let updatedItems = [...tableColumns];

        // Step 2: Find the indexes of active and over items
        const activeIndex = updatedItems.findIndex(item => item.id === active.id);
        const overIndex = updatedItems.findIndex(item => item.id === over.id);

        // Step 3: Perform the reordering if valid indexes are found
        if (activeIndex !== -1 && overIndex !== -1) {
            updatedItems = arrayMove(updatedItems, activeIndex, overIndex);
        }

        //console.log("moving Items In the Container", updatedItems);
        // Step 4: Update the state and pass the new array to the callback
        setTableColumns(updatedItems);
        //updateConditionalFieldsOrder(updatedItems);
        setActiveObj(null);
    }

    const sensors = useSensors(
        useSensor(PointerSensor, {}),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        }),
    );

    const newTableResource = async (e) => {
        e.preventDefault(); // ✅ Fix spelling mistake

        const formData = new FormData();
        formData.append('name', nameVal);
        formData.append('tableType', tableType);

        if (tableType === 'import') {
            // Append file only if user selected one
            if (fileInputRef.current?.files.length > 0) {

                formData.append('file', fileInputRef.current.files[0]);
            } else {

                showToastNotification({
                    type: 'danger',
                    message: "Please Select A CSV File To Import",
                });
                return; // Stop submission if no file is selected
            }
        } else {

            if( tableColumns.length > 0 ){
                // Append tableColumns as JSON if in manual mode
                formData.append('columns', JSON.stringify(tableColumns));
            } else {

                showToastNotification({
                    type: 'danger',
                    message: "Table Must Contain At Least 1 Column",
                });
                return;
            }
        }

        try {

            const response = await axios.post(`https://${globalData.api_url}/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });

            if( response.status == 200 ) {

                showToastNotification({
                    message: "New Table Created Successfully",
                });

                // Clear form after successful submission
                setNameVal('');
                setTableType('manual');
                setTableColumns([]);
                if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input

            }


        } catch (error) {
            showToastNotification({
                type: 'danger',
                message: "There Was A Problem Creating The Table",
            });
        }
    };




    useEffect(() => {
        console.log("Updated tableColumns:", tableColumns);
    }, [tableColumns]);

    const addColumn = () => {
        const newRecord = { id: uuidv4(), name: '' };
        setTableColumns(prevColumns => [...prevColumns, newRecord]);

    };

    const deleteColumn = (uid) => {
        console.log("Clicked On Delete");

        // Properly filtering and setting the new state
        setTableColumns(prevColumns => prevColumns.filter(column => column.id !== uid));
    };


    const updateColumnName = (index, newName) => {

        let updatedItems = [...tableColumns];
        updatedItems[index].name = newName;
        setTableColumns(updatedItems);
    }

    return (

        <form onSubmit={newTableResource}>
            <div className="mb-3">
                <label className="form-label">Table Name</label>
                <input
                    type="text"
                    className="form-control"
                    value={nameVal}
                    onChange={(e) => setNameVal(e.target.value)}
                    required
                />
                <div className="form-text">Give A Unique Name For Your New Table</div>
            </div>

            <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" onClick={() => { setTableType('manual') }} checked={tableType == 'manual'} />
                <label class="form-check-label">Manual</label>
            </div>
            <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" onClick={() => { setTableType('import') }} checked={tableType == 'import'} />
                <label class="form-check-label">Import CSV</label>
            </div>

            {tableType === 'import' && (
                <div className='mt-2'>
                    <label htmlFor="formFile" className="form-label">
                        Please Include A Header Row For Your Column Names
                    </label>
                    <input
                        className="form-control"
                        type="file"
                        ref={fileInputRef}
                        required
                    />
                </div>
            )}


            {tableType == 'manual' && (
                <>
                    <DndContext
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        sensors={sensors}
                        collisionDetection={closestCorners}
                    >
                        {tableColumns.length > 0 && (
                            <SortableContext items={tableColumns.map((elm) => elm.id)}>

                                {tableColumns.map((e, i) => (
                                    <TableColumnResource
                                        data={e}
                                        index={i}
                                        updateColumnName={updateColumnName}
                                        deleteColumn={deleteColumn}
                                    />
                                ))}

                            </SortableContext>
                        )}

                        <DragOverlay adjustScale={false}>

                            {/* Drag Overlay For item Item */}
                            {
                                activeObj && (
                                    <TableColumnResource data={activeObj} />
                                )
                            }
                        </DragOverlay>


                    </DndContext>


                    <div class="d-grid gap-2 mt-2">
                        <button type="button" class="btn btn-primary" onClick={addColumn}>Add Column</button>
                    </div>
                </>
            )}

            <button type="submit" className="btn btn-success mt-2 float-end">Submit</button>

        </form>
    );

}

export default TableResource;