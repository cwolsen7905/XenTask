import { Link, useNavigate } from 'react-router-dom';
import { useUI } from '../Contexts/UIContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faTrash } from '@fortawesome/free-solid-svg-icons';


import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"



const SidebarListItem = ({ className, id, name, isFolderItem = false, parentId, spaceParent, folderParent, disabled = false }) => {

    const { openModal } = useUI();

    const {
        attributes,
        setNodeRef,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: id,
        data: {
            type: "list",
            isFolderItem,
            parentId,
            disabled
        },
        disabled: disabled
    })

    return (
        <div
            {...attributes}
            {...listeners}
            ref={setNodeRef}
            style={{
                transition,
                transform: CSS.Translate.toString(transform)
            }}
            className="d-flex align-items-center justify-content-between"
        >

            {!isDragging ? (
                <Link to="/lists/0001" className="nav-link"><FontAwesomeIcon icon={faList} className="pe-2" />
                    {name}
                </Link>
            ) : <span className="nav-link"><FontAwesomeIcon className="pe-2" icon={faList} />{name}</span>
            }




            {/* Quick Actions */}
            <div className="me-2">

                <button className="btn btn-outline-secondary btn-sm border-0 mt-2" type="button" id="dropdownMenuButton5" data-bs-toggle="dropdown" aria-expanded="false">
                    <i className="fa-solid fa-ellipsis"></i>
                </button>

                <ul className="dropdown-menu dropright" aria-labelledby="dropdownMenuButton5">

                    {/* 
                    <li><a className="dropdown-item" href="#!"><span className="pe-2"><i className="fa-solid fa-pencil"></i></span>Rename</a></li>
                    <li><a className="dropdown-item" href="#!"><span className="pe-2"><i className="fa-solid fa-chain"></i></span>Copy Link</a></li>
                    */}
                    <li><a className="dropdown-item" href="#!"><span className="pe-2"><i className="fa-solid fa-trash"></i></span>Delete</a></li>

                    <li className="dropdown-submenu">

                        <ul className="dropdown-menu dropright">
                            <li>
                                <a className="dropdown-item" href="#!"
                                    onClick={() => openModal("Create A New List", { compProps: { form: 'list' } })}
                                >
                                    <span className="pe-2">
                                        <i className="fa-solid fa-list"></i>
                                    </span>List
                                </a>
                            </li>

                            <li>
                                <a className="dropdown-item" href="#!"
                                    onClick={() => openModal("Create A New Folder", { compProps: { form: 'folder' } })}
                                >
                                    <span className="pe-2">
                                        <i className="fa-solid fa-folder"></i>
                                    </span>Folder
                                </a>
                            </li>
                        </ul>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                        <button
                            className="dropdown-item"
                            type="button"
                            onClick={() => openModal(
                                "List Settings",
                                {
                                    compProps: {
                                        form: 'settings',
                                        type: "list",
                                        id: id,
                                        name: name,
                                        spaceParent: spaceParent,
                                        folderParent: folderParent,
                                    }
                                }, { modalSize: 'modal-lg' })}
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
    )
}

export default SidebarListItem;