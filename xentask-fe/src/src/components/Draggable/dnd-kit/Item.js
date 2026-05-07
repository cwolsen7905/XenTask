import { useSortable } from "@dnd-kit/sortable"
import React, {useState} from "react"
import { CSS } from "@dnd-kit/utilities"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import ColorPicker from '../../vendor/ColorPicker';
import CloseButton from 'react-bootstrap/CloseButton';

const Items = ({ id, title, dragToOtherContain, parentContainer, color, updateItemColor, updateLabel, deleteItem }) => {

    const [ originalValue, setOriginalValue ] = useState(title); 

    const [ text, setText ] = useState(title); 

    const handleChange = (event) => {
        event.preventDefault();
        setText(event.target.value);
    };

    const handleBlur = (event) => {
        event.preventDefault();
        if( text.trim() != originalValue && updateLabel ) updateLabel( id, text );
    };

    const returnItemColor = (color) => updateItemColor( id, color );

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: id,
        disabled: dragToOtherContain ? false: true,
        data: {
            type: "item",
            dragToOtherContain: dragToOtherContain,
            parentContainer: parentContainer,
            color: color
        }
    })


    return (
        <>
        {
        dragToOtherContain ? (
            <div ref={setNodeRef} {...attributes}
                style={{
                    transition,
                    transform: CSS.Translate.toString(transform)   
                }}
            >
                <div className="d-flex align-items-center draggable-handle mt-2 border p-2" style={{borderRadius:12}}>

                    {/* Drag Handle */}

                
                            <div {...listeners} style={{ width: '2em' }}>
                                <span>
                                    {/* Use Font Awesome vertical three dots icon */}
                                    <FontAwesomeIcon icon={faEllipsisV} />
                                </span>
                                <span style={{ marginLeft: '4px' }}>
                                    {/* Add another set of three dots icon */}
                                    <FontAwesomeIcon icon={faEllipsisV} />
                                </span>
                            </div>

                    <div className="mx-auto mb-2">
                        <ColorPicker selectedColor={color} callBack={returnItemColor}/>
                    </div>

                    <input className="form-control" style={{marginLeft:6, marginRight:6}} value={text} onChange={handleChange} onBlur={handleBlur}/>
                    { !dragToOtherContain && (<FontAwesomeIcon icon="fa-solid fa-lock" /> ) }
                    { dragToOtherContain && ( <CloseButton className="float-end" onClick={ () => deleteItem(id) }/> ) }
                </div>

            </div>
        ) : (
            <div className="d-flex align-items-center draggable-handle mt-2 border p-2" style={{borderRadius:12}}>

            {/* Drag Handle */}

            <div className="mx-auto mb-2">
                <ColorPicker selectedColor={color} callBack={returnItemColor}/>
            </div>

            <input className="form-control" style={{marginLeft:6, marginRight:6}} value={text} onChange={handleChange} onBlur={handleBlur}/>
            { !dragToOtherContain && (<FontAwesomeIcon icon="fa-solid fa-lock" /> ) }
            { dragToOtherContain && ( <CloseButton className="float-end" onClick={ () => deleteItem(id) }/> ) }
            </div>
            )
        }
        </>
    )
   
}

export default Items

/**clsx(
                "px-2 py-4 bg-white shadow-md rounded-xl w-full border border-transparent hover:border-gray-200 cursor-pointer",
                isDragging && "opacity-50"
            ) */