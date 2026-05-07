import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTable, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useData } from '../../Contexts/DataContext';
import { useUI } from '../../Contexts/UIContext';
import { useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const SidebarTableItem = ({ data, handleDelete, dragging }) => {
    
    const { openModal } = useUI();
    const { globalData, refreshSpaces } = useData();

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

    return (
        
        <div 
            className="d-flex align-items-center justify-content-between" 
            style={{ 
                width: '100%', 
                overflow: 'hidden',
                transition,
                transform: CSS.Translate.toString(transform),
            }}
            ref={setNodeRef}
            {...attributes}
            {...listeners}
        >
            {/* Left Section: Link or Name Display */}
            <div className="d-flex align-items-center flex-grow-1" style={{ overflow: 'hidden' }}>
                {!isDragging ? (
                    <Link to={`/data-table/${data.id}`} className="nav-link" 
                        style={{
                            textOverflow: 'ellipsis', 
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            display: 'block'  // Ensure the Link behaves as a block-level element
                        }}
                    >
                        <FontAwesomeIcon icon={faTable} className="pe-2" />
                        <span title={data.name}>{data.name}</span>
                    </Link>
                ) : (
                    <span className="nav-link" 
                        style={{
                            textOverflow: 'ellipsis', 
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            display: 'block'  // Ensure the span behaves as a block-level element
                        }}
                    >
                        <FontAwesomeIcon className="pe-2" icon={faTable} />
                        {data.name}
                    </span>
                )}
            </div>

            {/* Right Section: Dropdown Button */}
            <div className="d-flex align-items-center ms-2" style={{ flexShrink: 0, gap: '5px' }}>
                <div className="dropdown">
                    <button
                        className="btn btn-outline-secondary btn-sm border-0 d-flex align-items-center justify-content-center"
                        type="button"
                        id="dropdownMenuButton5"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        data-bs-popper-config='{"strategy":"fixed"}'
                        data-bs-auto-close="outside"
                        style={{ width: '30px', height: '30px', padding: 0 }}
                    >
                        <i className="fa-solid fa-ellipsis"></i>
                    </button>

                    <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton5">
                        <li>
                            <a className="dropdown-item" href="#!" onClick={handleDelete}>
                                <span className="pe-2">
                                    <i className="fa-solid fa-trash"></i>
                                </span>
                                Delete
                            </a>
                        </li>

                        <li><hr className="dropdown-divider" /></li>

                        <li>
                            <button
                                className="dropdown-item"
                                type="button"
                                onClick={() =>
                                    openModal("List Settings", {
                                        compProps: {
                                            form: 'settings',
                                            type: "list",
                                            id: data.id,
                                            name: data.name,
                                        }
                                    }, { modalSize: 'modal-lg' })
                                }
                            >
                                <span className="pe-2">
                                    <i className="fa-solid fa-cog"></i>
                                </span>
                                Settings
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};



export default SidebarTableItem;
