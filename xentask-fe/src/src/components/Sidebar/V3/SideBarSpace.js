import { forwardRef, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useUI } from '../../Contexts/UIContext';
import { Collapse } from 'react-bootstrap';

const SidebarSpace = ({ name, id, handleToggle }) => {

    const { openModal } = useUI();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const toggleDropdown = (e) => {
        setIsDropdownOpen(!isDropdownOpen);
        handleToggle(e);
    }

    return (
        <div className="d-flex align-items-center justify-content-between" style={{ width: '100%', overflow: 'hidden' }}>
            {/* Left Section: Space Name and Collapse Trigger */}
            <div className="d-flex align-items-center" style={{ flexGrow: 1, overflow: 'hidden' }}>
                <button className={`nav-link ${isDropdownOpen ? 'collapsed' : ''} pe-0`} onClick={toggleDropdown}>
                    <div className="sb-nav-link-icon">
                        <div className="nav-icons">
                            <div className="shown-nav-icon">
                                <i className="fas fa-columns"></i>
                            </div>
                            <div className="hidden-nav-icon">
                                <i className="fas fa-angle-right"></i>
                            </div>
                        </div>
                    </div>
                </button>

                <span
                    style={{
                        cursor: 'pointer',
                        padding: 1,
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        display: 'block'  // Ensure truncation works on the text element
                    }}
                    onClick={toggleDropdown}
                    title={name}
                >
                    {name}
                </span>
            </div>

            {/* Right Section: Dropdown Menus */}
            <div className="me-2">
                {/* Ellipsis Dropdown Button */}
                <button className="btn btn-outline-secondary btn-sm border-0 mt-2" type="button" id="dropdownMenuButton5" data-bs-toggle="dropdown" aria-expanded="false">
                    <i className="fa-solid fa-ellipsis"></i>
                </button>

                <ul className="dropdown-menu dropright" aria-labelledby="dropdownMenuButton5">
                    {/* Create New Dropdown */}
                    <li className="dropdown-submenu context-item">
                        <a className="dropdown-item" href="#!" onClick={(e) => e.preventDefault()}>
                            <span className="pe-2"><i className="fa-solid fa-plus"></i></span>
                            Create New
                            <i className="fas fa-angle-right mt-1 ml-2 float-end"></i>
                        </a>

                        <ul className="dropdown-menu dropright">
                            <li>
                                <a className="dropdown-item" href="#!" onClick={() => openModal("Create A New List", { compProps: { form: 'list', space_hash: id } })}>
                                    <span className="pe-2"><i className="fa-solid fa-list"></i></span>List
                                </a>
                            </li>

                            <li>
                                <a className="dropdown-item" href="#!" onClick={() => openModal("Create A New Folder", { compProps: { form: 'folder', space_hash: id } })}>
                                    <span className="pe-2"><i className="fa-solid fa-folder"></i></span>Folder
                                </a>
                            </li>
                        </ul>
                    </li>

                    <li><hr className="dropdown-divider" /></li>

                    {/* Settings Button */}
                    <li>
                        <button
                            className="dropdown-item"
                            type="button"
                            onClick={() => openModal("Space Settings", {
                                compProps: {
                                    form: 'settings',
                                    type: "space",
                                    id: id,
                                    name: name
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

                {/* Plus Dropdown Button */}
                <button className="btn btn-outline-secondary btn-sm border-0 mt-2" type="button" id="dropdownMenuButton6" data-bs-toggle="dropdown" aria-expanded="false">
                    <i className="fa-solid fa-plus"></i>
                </button>

                <ul className="dropdown-menu dropright" aria-labelledby="dropdownMenuButton6">
                    <li>
                        <a className="dropdown-item" href="#!" onClick={() => openModal("Create A New List", { compProps: { form: 'list', space_hash: id } })}>
                            <span className="pe-2"><i className="fa-solid fa-list"></i></span>List
                        </a>
                    </li>
                    <li>
                        <a className="dropdown-item" href="#!" onClick={() => openModal("Create A New Folder", { compProps: { form: 'folder', space_hash: id } })}>
                            <span className="pe-2"><i className="fa-solid fa-folder"></i></span>Folder
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default SidebarSpace;
