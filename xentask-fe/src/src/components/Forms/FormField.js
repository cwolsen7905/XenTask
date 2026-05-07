import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';

export const FormField = ({ data }) => {

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: data.id,
        element: 'field',
        data,
        /*data: {
            pinned: row.pinned,
        }*/
    });

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

            <span>{ data.fieldName }</span>

        </div>

    );
};
