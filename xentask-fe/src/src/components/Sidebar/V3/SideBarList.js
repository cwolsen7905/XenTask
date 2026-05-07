import { Link, useNavigate } from 'react-router-dom';
import { useUI } from '../../Contexts/UIContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faTrash } from '@fortawesome/free-solid-svg-icons';
import { DataContext } from '../../Contexts/DataContext';
import { useContext } from 'react';
import axios from 'axios';

const SidebarList = ({ name, id, parentId, parentSpaceId, isDragging }) => {
    
    const { openModal } = useUI();
    const { globalData, refreshSpaces } = useContext(DataContext);

    const handleDelete = async () => {
        try {
            const response = await axios.delete(`https://${globalData.api_url}/list/${id}`, { withCredentials: true });
            if (response.status === 200) {
                refreshSpaces();
            }
        } catch (error) {
            console.log(error.response ? error.response.data : error.message); // Log error details
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-between" style={{ width: '100%', overflow: 'hidden' }}>
            {/* Left Section: Link or Name Display */}
            <div className="d-flex align-items-center flex-grow-1" style={{ overflow: 'hidden' }}>
                {!isDragging ? (
                    <Link to={`/lists/${id}`} className="nav-link" 
                        style={{
                            textOverflow: 'ellipsis', 
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            display: 'block'  // Ensure the Link behaves as a block-level element
                        }}
                    >
                        <FontAwesomeIcon icon={faList} className="pe-2" />
                        <span title={name}>{name}</span>
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
                        <FontAwesomeIcon className="pe-2" icon={faList} />
                        {name}
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
                                            id: id,
                                            name: name,
                                            folderParent: parentId,
                                            spaceParent: parentSpaceId
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

export default SidebarList;
