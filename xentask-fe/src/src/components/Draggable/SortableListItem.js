import { useSortable } from "@dnd-kit/sortable"
import React, {useState} from "react"
import { CSS } from "@dnd-kit/utilities"

const SortableListItem = ( { id, label, color } ) => {

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({
        id: id,
        data:{
            id: id,
            label: label,
        }
    })


    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            style={{
                transition,
                transform: CSS.Translate.toString(transform),
            }}
        >   

                <span 
                    className="badge"
                    style={{
                        width: 100 + '%',
                        backgroundColor: color ? color : 'RGBA(var(--bs-secondary-rgb), var(--bs-bg-opacity, 1))',
                    }}
                >{label}</span>
       
        </div>
    )
}

export default SortableListItem;