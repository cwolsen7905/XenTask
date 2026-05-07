import { useState, useEffect } from 'react';
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faThumbTack } from '@fortawesome/free-solid-svg-icons';
import { v4 as uuidv4 } from 'uuid';
import FormRule from './FormRule';

export const FormCard = ({
    data,
    index,
    available,
    flatItems,
    addNewRule,
    updateEditorFieldCallback,
    deleteEditorFieldCallback,
    deleteRuleCallback,
    addSubCondition,
    addConditionalFields,
    deleteConditionalFieldCallback,
    updateConditionsCallback,
    updateConditionalFieldsCallback,
    updateConditionalFieldsOrderCallback,
    deleteSubconditionCallBack,
    dragging,
}) => {

    // This Is The Label That Appears On The Customer Facing Side
    
    const[ name, setName ] = useState( data.name || ''  );
    const[ description, setDescription ] = useState( data.description || ''  );


    useEffect(() => {
        setName( data.name || "" );
        setDescription( data.description || "" );
    }, [data]);

    const onInputBlur = (key) => {

        let _val = ( key == 'name' ? name : description );

        updateEditorFieldCallback( index, key, _val );

    }



    let subConditionsDropdown = [];

    for( let i = 0; i <= index; i++ ) {
        subConditionsDropdown.push(available[i]);
    }

    const rules = data.rules;

    const deleteEditorField = () =>{

        deleteEditorFieldCallback(index);

    }

    const addRule = () => {

        let _value = null;

        if (data.options) {

            if (data.options.length > 0) {
                _value = data.options[0].hash;
            }

        }

        addNewRule(index, {
            id: uuidv4(),
            field: data.id,
            fieldHash: data.fieldHash,
            field_value: null,
            operator: 'and',
            condition: 'is',
        });

    }
    
    const addCondition = (ruleIndex) => {
        addSubCondition(index, ruleIndex);
    }

    const updateConditions = ( ruleIndex, key, value, fieldIndex ) => {

        updateConditionsCallback( index, ruleIndex, key, value, fieldIndex );

    }

    const addConditionField = (ruleIndex, item) => {

        addConditionalFields(index, ruleIndex, item);

    }

    const deleteConditionalField = ( ruleIndex, fieldIndex ) => {
        deleteConditionalFieldCallback( index, ruleIndex, fieldIndex );
    }

    const deleteSubcondition = ( ruleIndex, fieldIndex ) => {

        deleteSubconditionCallBack( index, ruleIndex, fieldIndex );

    }

    const updateConditionalFieldsOrder = (ruleIndex,container) => {

        updateConditionalFieldsOrderCallback( index, ruleIndex, container );

    }

    const updateConditionalFields = ( ruleIndex, fieldIndex, key, value) => {

        updateConditionalFieldsCallback( index, ruleIndex, fieldIndex, key, value );

    }
    

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: data.id,
        element: 'card',
        data,
    });


    const style = {
        borderRadius: 12,
        transition,
        transform: transform ? CSS.Translate.toString(transform) : undefined,
        minHeight: 226,
    }
    

    return (
        <div className='card my-2'
            ref={setNodeRef}
            style={style}
           
        >
            <div className='card-body'>
                <div className="d-flex justify-content-between">
                    <div className='d-flex align-items-center'>
                        <div
                            {...attributes}
                            {...listeners}
                            style={{ width: '2em' }}
                        >
                            <span>
                                {/* Use Font Awesome vertical three dots icon */}
                                <FontAwesomeIcon icon={faEllipsisV} />
                            </span>
                            <span style={{ marginLeft: '4px' }}>
                                {/* Add another set of three dots icon */}
                                <FontAwesomeIcon icon={faEllipsisV} />
                            </span>
                        </div>
                        <span className='me-2 badge text-bg-primary'>{index}</span>
                        <input 
                            className="form-control" 
                            placeholder="Project Title" 
                            value={name}
                            onChange={(e)=>setName(e.target.value)}
                            onBlur={()=>onInputBlur('name')}
                        />
                    </div>

                    <div className='d-flex align-items-center'>
                        <span className='me-2 badge text-bg-secondary'>{data.fieldName}</span>
                        <div className="btn-group">
                            <button type="button" className='btn btn-outline-secondary btn-sm border-0 mt-2' data-bs-toggle="dropdown" aria-expanded="false">
                                <i className="fa-solid fa-ellipsis"></i>
                            </button>
                            <ul className="dropdown-menu">
                                <li><button type="button" className="dropdown-item" onClick={deleteEditorField}>Delete Field</button></li>
                            </ul>
                        </div>

                    </div>

                </div>

                <div className='mt-2'>
                    <input 
                        className='form-control' 
                        placeholder='Enter Text'
                        value={description}
                        onChange={(e)=>setDescription(e.target.value)}
                        onBlur={()=>onInputBlur('description')}
                    />
                </div>

                <div className='d-flex'>
                    <div className="form-check mt-2 me-2">
                        <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id={`formcheck-required-${data.id}`}
                            checked={data.required} 
                            onClick={()=>updateEditorFieldCallback( index, "required", !data.required)} 
                            disabled={data.disabled} 
                        />
                        <label className="form-check-label" for={`formcheck-required-${data.id}`}>
                            Required
                        </label>
                    </div>
                    {
                        ( ( data.type == 'dropdown' || data.type == 'labels' ) ) && (

                            <div className="form-check mt-2">
                                <input 
                                    className="form-check-input" 
                                    type="checkbox" 
                                    id={`formcheck-logic-${data.id}`} 
                                    checked={data.logic} 
                                    onClick={()=>updateEditorFieldCallback( index, "logic", !data.logic )}
                                />
                                <label className="form-check-label" for={`formcheck-logic-${data.id}`}>
                                    Logic
                                </label> 
                            </div>
                        )}

                </div>

                {
                    ( ( data.type == 'dropdown' || data.type == 'labels' ) && !dragging && data.logic ) && (
                        <>

                            <div className="accordion mt-2">

                                <div className="accordion-item">

                                    <h2 className="accordion-header">
                                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse-${data.id}`} aria-expanded="false" aria-controls="collapseOne">
                                            Rules
                                        </button>
                                    </h2>


                                    <div id={`collapse-${data.id}`} className="accordion-collapse collapsed collapse" data-bs-parent="#accordionExample">

                                        <div className="accordion-body">

                                            <div className="accordion mb-2" id="accordionPanelsStayOpenExample">

                                                {
                                                    rules && (
                                                        rules.map(
                                                            (e, i) =>
                                                                <FormRule
                                                                    data={e}
                                                                    mainOptions={data.options}
                                                                    flatItems={flatItems}
                                                                    index={i}
                                                                    subConditions={subConditionsDropdown}
                                                                    addSubCondition={() => addCondition(i)}
                                                                    deleteRuleCallback={()=>{deleteRuleCallback(index,i)}}
                                                                    addConditionField={(item) => addConditionField(i, item)}
                                                                    deleteConditionalField={(fieldIndex) => deleteConditionalField(i,fieldIndex)}
                                                                    updateConditions={( key, value, fieldIndex = null ) => updateConditions( i, key, value, fieldIndex )}
                                                                    deleteSubcondition={(index) => deleteSubcondition(i,index)}
                                                                    updateConditionalFieldsOrder={(container) => updateConditionalFieldsOrder(i,container)}
                                                                    updateConditionalFields={(fieldIndex,key,value)=>{updateConditionalFields( i, fieldIndex, key, value )}}
                                                                />
                                                        )
                                                    )
                                                }

                                            </div>

                                            <button className='btn btn-outline-primary' onClick={addRule}>Add Rule</button>

                                        </div>
                                    </div>
                                </div>

                            </div>
                        </>
                    )}
            </div>
        </div>
    );
};

export default FormCard;