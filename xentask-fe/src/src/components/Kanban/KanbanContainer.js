import React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

const KanbanContainer = ({ id, children, title, color }) => {
    const {
        attributes,
        setNodeRef,
        listeners,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: id,
        data: { type: "container" }
    })

    return (
        <div
            {...attributes}
            ref={setNodeRef}
            style={{
                 transition, 
                 transform: CSS.Translate.toString(transform)
             }}
            className="kanban-board card flex-shrink-0"
        >

            <div class="card-header">
                <span class="d-inline-block text-truncate" style={{maxwidth: 150}}>
                    <h5>{title}</h5>
                </span>
            </div>
            
            <div class="card-body" 
                style={{
                    backgroundColor: color,
                    overflowY: 'auto', // Enable scrolling for the items 
                }}
            >
                {children}
            </div>

            
        </div>
    )
}

export default KanbanContainer