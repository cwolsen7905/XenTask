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
    dragging = false,
    deleteConditionalField,
    updateConditionalFields
}) => {


    /*const rules = [
        {
            main: {
                id: uuidv4(),
                value: null,
                options: options || [],
                operator: 'equals',
                condition: 'is',
            },
            sub: [{
                id: uuidv4(),
                value: '123',
                options: [],
                operator: 'equals',
                condition: 'is',
            }],
            fields: [{
                id: uuidv4(),
                type: 'dropdown',
                name: 'Asd',
                required: false,
            }]
        }
    ];*/

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: data.id,
        data,
    });

    const[ name, setName ] = useState( data.name || ''  );
    const[ description, setDescription ] = useState( data.description || ''  );


    useEffect(() => {
        setName( data.name || "" );
        setDescription( data.description || "" );
    }, [data]);


    const onInputBlur = (key) => {

        let _val = ( key == 'name' ? name : description );

        updateConditionalFields( index, key, _val );

    }

    return (
        <div className='card my-2'
            ref={setNodeRef}
            style={{
                borderRadius: 12,
                transition,
                transform: CSS.Translate.toString(transform),
            }}>
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
                        <div class="btn-group">
                            <button type="button" className='btn btn-outline-secondary btn-sm border-0 mt-2' data-bs-toggle="dropdown" aria-expanded="false">
                                <i className="fa-solid fa-ellipsis"></i>
                            </button>
                            <ul class="dropdown-menu">
                                <li><button type="button" class="dropdown-item" onClick={()=>deleteConditionalField(index)}>Delete Field</button></li>
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
                        onBlur={()=>{onInputBlur('description')}}
                    />
                </div>

                <div className='d-flex'>
                    <div class="form-check mt-2 me-2">
                        <input 
                            class="form-check-input" 
                            type="checkbox" 
                            value="" 
                            id={`checkbox-${data.id}`} 
                            checked={data.required} 
                            disabled={data.disabled} 
                            onClick={()=>{updateConditionalFields(index,"required",!data.required)}}
                        />
                        <label class="form-check-label" for="flexCheckDefault">
                            Required
                        </label>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default FormCard;