import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faThumbTack } from '@fortawesome/free-solid-svg-icons';

export const DraggableTableRow = ({ row }) => {

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: row.id,
        data: {
            pinned: row.pinned,
        }

    });

    return (
        <tr
            key={row.name}
            ref={setNodeRef}
            style={{
                transition,
                transform: CSS.Translate.toString(transform)
            }}
        >
            <>
                <td>
                    <div className="d-flex align-items-center mt-2 border p-2" style={{ borderRadius: 12 }}>
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

                        <span>{row.name}</span>
                        {
                            row.pinned ?
                                <FontAwesomeIcon icon="fa-solid fa-thumbtack" className="ms-auto" />
                                :
                                ''
                        }
                        {
                            row.required ?
                                <span className="text-danger fs-3 ms-auto">*</span>
                                :
                                ''
                        }
                    </div>
                </td>

                <td>{row.cell}</td>


            </>

        </tr>
    );
};
