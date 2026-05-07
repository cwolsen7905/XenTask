import {useState,useEffect} from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faTrash } from '@fortawesome/free-solid-svg-icons';

const TableColumnResource = ({ data, index, updateColumnName,deleteColumn }) => {

    const [name,setName] = useState( data.name || '' );

    useEffect(()=>{

        setName(data.name);

    },[data])

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

    const onBlur = () => {
        updateColumnName( index, name )
    }

    return (
        <div
            className="d-flex align-items-center mt-2 border p-2"
            ref={setNodeRef}
            style={{
                transition,
                transform: CSS.Translate.toString(transform),
                borderRadius: 12,
            }}
        >

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
            <div class="input-group">
                <input className="form-control" 
                        value={name} 
                        onChange={(e)=>{setName(e.target.value)}}
                        onBlur={()=>onBlur()}
                />
                <button 
                    class="btn btn-danger" 
                    type="button"
                    onClick={()=>deleteColumn(data.id)}
                >
                    <FontAwesomeIcon icon={faTrash} />
                </button>
            </div>
        </div>

    );
};

export default TableColumnResource;