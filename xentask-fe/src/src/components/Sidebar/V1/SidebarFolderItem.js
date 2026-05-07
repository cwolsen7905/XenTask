import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useUI } from '../Contexts/UIContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleRight, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Collapse } from 'react-bootstrap';
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"


const SidebarFolderItem = ({ className, id, children, name, parentId }) => {

    const { openModal } = useUI();

    const navigate = useNavigate();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setIsDropdownOpen(true); // Always open the dropdown when clicking the link
    };

    const toggleMenu = () => {
        setIsDropdownOpen(!isDropdownOpen); // Toggle the menu when clicking the button
    };

    const navigateToView = () => {

        navigate('/folder/0001');   // Use navigate to navigate to the desired view
        setIsDropdownOpen(true);    // Open the dropdown after navigating
    };

    const {
        attributes,
        setNodeRef,
        listeners,
        transform,
        transition,
        isDragging,
        isOver,
    } = useSortable({
        id: id,
        transition:null,
        data: {
            type: "folder",
            isRootItem: true,
            parentId
        }
    })

    return (

        <div
            {...attributes}
            {...listeners}
            style={{
                transition,
                transform: CSS.Translate.toString(transform)
            }}

            ref={setNodeRef}
        >

            <div className="d-flex justify-content-between align-items-center">

                <div className="d-flex align-items-center p-2">
                    <button
                        className="btn btn-outline-secondary border-0 d-flex align-items-center justify-content-center"
                        style={{ width: '30px', height: '30px', padding: 0 }}
                        onClick={toggleMenu}
                    >
                        <FontAwesomeIcon icon={isDropdownOpen ? faAngleDown : faAngleRight} />
                    </button>

                    <span
                        className={`nav-link ${isDropdownOpen ? '' : 'collapsed'}`}
                        onClick={navigateToView}
                        aria-expanded={isDropdownOpen}
                        style={{ cursor: 'pointer', padding: 1 }}
                    >
                        {name}
                    </span>
                </div>

                <div className="d-flex align-items-center me-2">
                    <button
                        className="btn btn-outline-secondary btn-sm border-0 d-flex align-items-center justify-content-center"
                        type="button"
                        id="dropdownMenuButton5"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        style={{ width: '30px', height: '30px', padding: 0 }}
                    >
                        <i className="fa-solid fa-ellipsis"></i>
                    </button>

                    <ul className="dropdown-menu dropright" aria-labelledby="dropdownMenuButton5">
                        
                        {/*
                        <li>
                            <a className="dropdown-item" href="#!">
                                <span className="pe-2">
                                    <i className="fa-solid fa-pencil"></i>
                                </span>Rename
                            </a>
                        </li>
                        <li>
                            <a className="dropdown-item" href="#!">
                                <span className="pe-2">
                                    <i className="fa-solid fa-chain"></i>
                                </span>Copy Link
                            </a>
                        </li> 
                        */}

                        <li>
                            <a className="dropdown-item" href="#!">
                                <span className="pe-2">
                                    <i className="fa-solid fa-trash"></i>
                                </span>Delete
                            </a>
                        </li>

                        <li className="dropdown-submenu">

                            <ul className="dropdown-menu dropright">
                                <li>
                                    <a
                                        className="dropdown-item"
                                        href="#!"
                                        onClick={ 
                                            () => openModal( 
                                                "Create A New List", 
                                                { 
                                                    compProps: { 
                                                        form: 'list',
                                                        folder_hash: id,
                                                        space_hash: parentId,
                                                    } 
                                                }
                                            )
                                        }
                                    >
                                        <span className="pe-2">
                                            <i className="fa-solid fa-list"></i>
                                        </span>List
                                    </a>
                                </li>

                            </ul>
                        </li>


                        <li>
                            <hr className="dropdown-divider" />
                        </li>
                        <li>
                            <button
                                className="dropdown-item"
                                type="button"
                                onClick={() =>
                                    openModal("Folder Settings", {
                                        compProps: {
                                            form: 'settings',
                                            type: "folder",
                                            id: id,
                                            name: name,
                                        },
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

                    <button
                        className="btn btn-outline-secondary btn-sm border-0 d-flex align-items-center justify-content-center"
                        type="button"
                        id="dropdownMenuButton6"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        style={{ width: '30px', height: '30px', padding: 0 }}
                    >
                        <i className="fa-solid fa-plus"></i>
                    </button>

                    <ul className="dropdown-menu dropright" aria-labelledby="dropdownMenuButton6">
                        <li>
                            <a
                                className="dropdown-item"
                                href="#!"
                                onClick={() => openModal( "Create A New List", {
                                    compProps: { 
                                        form: 'list',
                                        space_hash: parentId,
                                        folder_hash: id,
                                    } 
                                })}
                            >
                                <span className="pe-2">
                                    <i className="fa-solid fa-list"></i>
                                </span>List
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            {!isDragging && (

                <Collapse in={isDropdownOpen}>
                    <div id="pagesCollapseAuth" aria-labelledby="headingOne" data-bs-parent="#sidenavAccordionPages">
                        <nav className="sb-sidenav-menu-nested nav">
                            {children}
                        </nav>
                    </div>
                </Collapse>
            )}
          
        </div>
    )
}

export default SidebarFolderItem;