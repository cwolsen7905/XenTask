import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faThumbTack, faTrash } from '@fortawesome/free-solid-svg-icons';
import FieldsDropdown from '../Fields/FieldsDropdown';
import FormCardSimple from './FormCardSimple';

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
import { ucFirst } from '../../Utils/Utils';
import FieldsLabel from '../Fields/FieldsLabel';


const FormRule = ({
    data,
    mainOptions,
    index,
    flatItems,
    subConditions,
    deleteRuleCallback,
    addSubCondition,
    addConditionField,
    deleteConditionalField,
    updateConditions,
    deleteSubcondition,
    updateConditionalFieldsOrder,
    updateConditionalFields
}) => {

    const otherFieldsDropdown = subConditions.filter(e => e.type == 'dropdown' || e.type == 'labels')


    /**
     * DND Related
     */
    // DND Handlers
    const sensors = useSensors(
        useSensor(PointerSensor, {}),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        }),
    );

    const [activeObj, setActiveObj] = useState(null);

    function handleDragStart(event) {

        const { active } = event;
        setActiveObj(active.data.current);

    }

    function handleDragEnd(event) {
        const { active, over } = event;

        if (!active || !over || active.id === over.id) return;

        // Step 1: Get a copy of the current state
        let updatedItems = [...data.fields];

        // Step 2: Find the indexes of active and over items
        const activeIndex = updatedItems.findIndex(item => item.id === active.id);
        const overIndex = updatedItems.findIndex(item => item.id === over.id);

        // Step 3: Perform the reordering if valid indexes are found
        if (activeIndex !== -1 && overIndex !== -1) {
            updatedItems = arrayMove(updatedItems, activeIndex, overIndex);
        }

        console.log("moving Items In the Container", updatedItems);
        // Step 4: Update the state and pass the new array to the callback
        updateConditionalFieldsOrder(updatedItems);
        setActiveObj(null);
    }



    return (
        <div className="accordion-item">

            <h2 className="accordion-header">
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#panel-${data.id}`} aria-expanded="false" aria-controls={`panel-${data.id}`}>
                    Rule #{index + 1}
                </button>
            </h2>

            <div id={`panel-${data.id}`} className="aaccordion-collapse collapsed collapse">
                <div className="accordion-body">
                    <div className='card mb-2'>
                        <div className="card-body">

                            {/* Response Options */}
                            <div className=" mb-2">

                                {/* Main Condition */}
                                <div className="d-flex align-items-center">
                                    <p className="mb-0 me-3">If Response</p>

                                    <select
                                        className="form-control me-3"
                                        style={{ width: 'auto' }}
                                        value={data.main.condition}
                                        onChange={(event) => updateConditions('condition', event.target.value)}
                                    >
                                        <option value="is">Is</option>
                                        <option value="is_not">Is Not</option>
                                        <option value="is_set">Is Set</option>
                                        <option value="is_not_set">Is Not Set</option>
                                    </select>

                                    {data.main.condition !== "is_set" && data.main.condition !== "is_not_set" && (

                                        <>
                                            {
                                                otherFieldsDropdown.find(obj => obj.id === data.main.field)?.type == "dropdown" ?
                                                    (
                                                        <FieldsDropdown
                                                            data={{
                                                                value: data.main?.value,
                                                                options: mainOptions || [],
                                                            }}
                                                            callBack={(item) => updateConditions("field_value", (item.id || item.hash))}
                                                        />
                                                    ) :
                                                    (
                                                        <div className='form-control'>
                                                            <FieldsLabel
                                                                data={{
                                                                    options: mainOptions || [],
                                                                }}
                                                                callBack={(item) => updateConditions("field_value", item)}
                                                            />
                                                        </div>
                                                    )
                                            }

                                        </>
                                    )}

                                </div>

                                {/* Sub Conditions Example */}
                                <div className="mt-2">

                                    {data.sub.map((e, i) => {
                                        return (
                                            <div key={i}>
                                                <div className="d-flex align-items-center">
                                                    <select
                                                        className="form-control me-3 mt-2 mb-2"
                                                        style={{ width: "auto" }}
                                                        value={e.operator}
                                                        onChange={(event) => updateConditions('operator', event.target.value, i)}
                                                    >
                                                        <option value="and">And</option>
                                                        <option value="or">Or</option>
                                                    </select>

                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-danger border-0"
                                                        onClick={() => deleteSubcondition(i)} // Use 'i' directly here
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </div>
                                                <div className="d-flex">
                                                    <div className="me-3" style={{ width: "auto" }}>
                                                        <FieldsDropdown
                                                            data={{
                                                                value: e.field,
                                                                options: otherFieldsDropdown,
                                                            }}
                                                            placeholder="Field"
                                                            callBack={(item) => updateConditions("field", (item.id || item.hash), i)}
                                                        />
                                                    </div>

                                                    <select
                                                        className="form-control me-3"
                                                        style={{ width: "auto" }}
                                                        value={e.condition}
                                                        onChange={(event) => updateConditions('condition', event.target.value, i)}
                                                    >
                                                        <option value="is">Is</option>
                                                        <option value="is_not">Is Not</option>
                                                        <option value="is_set">Is Set</option>
                                                        <option value="is_not_set">Is Not Set</option>
                                                    </select>

                                                    { e.field !== null && e.condition !== "is_set" && e.condition !== "is_not_set" && (


            
                                                        otherFieldsDropdown.find(obj => obj.id === e.field)?.type == "dropdown" ?
                                                            (

                                                                <FieldsDropdown
                                                                    data={{
                                                                        value: null,
                                                                        options: (otherFieldsDropdown.find(obj => obj.id === e.field)?.options) || []
                                                                    }}
                                                                    dropdownBtnstyles={{ width: "auto" }}
                                                                />
                                                            ) :
                                                            (
                                                                <div className='form-control'>
                                                                    <FieldsLabel
                                                                        data={{
                                                                            options: (otherFieldsDropdown.find(obj => obj.id === e.field)?.options) || []
                                                                        }}
                                                                        callBack={(item) => updateConditions("field_value", item, i)}
                                                                    />
                                                                </div>
                                                            )
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}

                                </div>

                            </div>

                            {subConditions.length > 0 && (
                                <button className="btn btn-outline-primary mb-2" onClick={addSubCondition}>Add Condition</button>
                            )}

                            <p>Show The Following Fields:</p>
                            {/* Rules */}
                            <DndContext
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                                sensors={sensors}
                                collisionDetection={closestCorners}
                            >
                                {data.fields.length > 0 && (
                                    <SortableContext items={data.fields.map((elm) => elm.id)}>

                                        {data.fields.map((e, i) => (

                                            <FormCardSimple
                                                key={e.id}
                                                data={e}
                                                index={i}
                                                deleteConditionalField={(fieldIndex) => deleteConditionalField(fieldIndex)}
                                                updateConditionalFields={ (fieldIndex,key,value) => updateConditionalFields(fieldIndex,key,value)}
                                            />

                                        ))}

                                    </SortableContext>
                                )}

                                <DragOverlay adjustScale={false}>

                                    {/* Drag Overlay For item Item */}
                                    {
                                        activeObj && (
                                            <FormCardSimple data={activeObj} />
                                        )
                                    }
                                </DragOverlay>


                            </DndContext>

                            <div className="btn-group">

                                <button type="button" className="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                    Add Field
                                </button>

                                <ul className="dropdown-menu">
                                    {
                                        flatItems.map((e) => {
                                            return (
                                                <li key={e.id}>
                                                    <button
                                                        className="dropdown-item"
                                                        type="button"
                                                        onClick={() => addConditionField(e)}
                                                    >
                                                        {ucFirst(e.name)}
                                                    </button>
                                                </li>
                                            )
                                        })

                                    }

                                </ul>
                            </div>

                        </div>

                    </div>

                    <button className='btn btn-outline-danger' onClick={deleteRuleCallback}> Delete Rule</button>

                </div>
            </div>
        </div>
    );
}

export default FormRule;