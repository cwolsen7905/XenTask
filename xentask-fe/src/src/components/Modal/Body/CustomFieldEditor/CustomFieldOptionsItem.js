import { useSortable } from "@dnd-kit/sortable"
import React, {useState} from "react"
import { CSS } from "@dnd-kit/utilities"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import ColorPicker from "../../../vendor/ColorPicker";

const CustomFieldOptionsItem = ({ id, label, parentContainer, deleteItem, color, callBack = '', updateItemColor }) => {

    const [ originalValue, setOriginalValue ] = useState(label); 

    const [ text, setText ] = useState(label); 

    const handleChange = (event) => {
        event.preventDefault();
        setText(event.target.value);
    };

    const handleBlur = (event) => {

        event.preventDefault();
        if( text.trim() != originalValue && callBack ) callBack( id, text );

    };
      
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: id,
        data: {
            type: "item",
            parentContainer: parentContainer,
        }
    })

    const returnItemColor = (color) => updateItemColor( id, color );

    return (
        <div
            ref={setNodeRef}
            style={{
                transition,
                transform: CSS.Translate.toString(transform)
            }}
        >
            <div className="d-flex align-items-center draggable-handle mt-2 border p-2" style={{borderRadius:12}}>
                
                {/* Drag Handle */}
                <div  {...attributes} {...listeners} style={{ width: '2em' }}>
                    <span>
                        {/* Use Font Awesome vertical three dots icon */}
                        <FontAwesomeIcon icon={faEllipsisV} />
                    </span>
                    <span style={{ marginLeft: '4px' }}>
                        {/* Add another set of three dots icon */}
                        <FontAwesomeIcon icon={faEllipsisV} />
                    </span>
                </div>

                {/* Other Contents */}
                <ColorPicker selectedColor={color} callBack={returnItemColor}/>
            
                <div className="input-group">
                    <input className="form-control" style={{marginLeft:6, marginRight:6}} value={text} onChange={handleChange} onBlur={ handleBlur } />
                    <button type="button" className="btn btn-outline-danger" onClick={ () => deleteItem(id) }>×</button>
                </div>
            </div>
        </div>
    )
}

export default CustomFieldOptionsItem;