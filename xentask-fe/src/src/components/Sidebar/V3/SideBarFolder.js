import { useNavigate } from 'react-router-dom';
import { useState, useContext } from 'react';
import { useUI } from '../../Contexts/UIContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleRight, faTrash } from '@fortawesome/free-solid-svg-icons';
import { DataContext } from '../../Contexts/DataContext';
import axios from 'axios';

const SideBarFolder = ({ name, id, parentId, handleToggle }) => {

    const { openModal } = useUI();

    const {globalData,refreshSpaces} = useContext(DataContext);

    const navigate = useNavigate();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const toggleMenu = (e) => {
        setIsDropdownOpen(!isDropdownOpen); // Toggle the menu when clicking the button
        handleToggle(e);
    };

    const navigateToView = () => {

        //navigate('/folder/0001');   // Use navigate to navigate to the desired view
        //setIsDropdownOpen(true);    // Open the dropdown after navigating
    };

    const handleDelete = async () => {

        try {

            const response = await axios.delete(`https://${globalData.api_url}/folder/${id}`, { withCredentials: true });

            if (response.status == 200) {
                refreshSpaces();
            }

        } catch (error) {
            console.log(error.response ? error.response.data : error.message); // Log error details
        }

    }

    return (
<div
    className="d-flex align-items-center"
    style={{
        width: '100%',
        overflow: 'hidden', // Prevents content overflow
    }}
>
    {/* Left Section: Toggle Button and Folder Name */}
    <div
        className="d-flex align-items-center"
        style={{
            flex: 1, // Takes up available space
            overflow: 'hidden',
        }}
    >
        {/* Toggle Button */}
        <button
            className="btn btn-outline-secondary border-0 d-flex align-items-center justify-content-center"
            style={{ width: '30px', height: '30px', padding: 0, flexShrink: 0 }}
            onClick={toggleMenu}
        >
            <FontAwesomeIcon icon={isDropdownOpen ? faAngleDown : faAngleRight} />
        </button>

        {/* Folder Name */}
        <span
            className="ms-2"
            onClick={navigateToView}
            aria-expanded={isDropdownOpen}
            style={{
                flex: 1, // Takes up the remaining space in the row
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
            }}
            title={name}
        >
            {name}
        </span>
    </div>

    {/* Right Section: Action Buttons */}
    <div
        className="d-flex align-items-center ms-2"
        style={{
            flexShrink: 0, // Prevents buttons from shrinking
            gap: '5px', // Space between buttons
        }}
    >
        {/* Dropdown Button */}
        <div className="dropdown">
            <button
                className="btn btn-outline-secondary btn-sm border-0 d-flex align-items-center justify-content-center"
                type="button"
                id="dropdownMenuButton5"
                data-bs-toggle="dropdown"
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
                                    spaceParent: parentId,
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
            
        </div>

        {/* Add Button */}
        <div className="dropdown">
            <button
                className="btn btn-outline-secondary btn-sm border-0 d-flex align-items-center justify-content-center"
                type="button"
                id="dropdownMenuButton6"
                data-bs-toggle="dropdown"
                data-bs-popper-config='{"strategy":"fixed"}'
                data-bs-auto-close="outside"
                aria-expanded="false"

                style={{ width: '30px', height: '30px', padding: 0 }}
            >
                <i className="fa-solid fa-plus"></i>
            </button>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton6">
                <li>
                    <a
                        className="dropdown-item"
                        href="#!"
                        onClick={() => openModal("Create A New List", {
                            compProps: {
                                form: 'list',
                                space_hash: parentId,
                                folder_hash: id,
                            }
                        })}
                    >
                        <span className="pe-2">
                            <i className="fa-solid fa-list"></i>
                        </span>
                        List
                    </a>
                </li>
            </ul>
        </div>
    </div>
</div>






    )
};

export default SideBarFolder;