import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretRight, faFolder, faList } from '@fortawesome/free-solid-svg-icons';

const FieldsListSelection = ({ data, callBack }) => {


    const [searchQuery, setSearchQuery] = useState('');
    const [lists, setLists] = useState(data.options || []);
    const [selectedList, setSelectedList] = useState( data.value || '' );
    const [showDropdown, setShowDropdown] = useState(false);

    const handleListSelection = (item) => {

        setSelectedList( item.name );
        if (callBack) callBack( item.id );
        setShowDropdown(false);

    }

    const handleSearch = (e) => {
        setSearchQuery(e.target.value.toLowerCase());
    };

    const filterItems = (items, query) => {
        return items.map(item => {
            if (!item || !item.name) {
                return null; // Return null for invalid items
            }
            if (item.submenu && Array.isArray(item.submenu)) {
                // Recursively filter submenu
                const filteredSubmenu = filterItems(item.submenu, query);
                if (item.name.toLowerCase().includes(query)) {
                    // If the folder name matches, include all submenu items
                    return {
                        ...item,
                        submenu: item.submenu // Keep submenu as is
                    };
                } else if (filteredSubmenu.length > 0) {
                    // If any submenu item matches, include filtered submenu items
                    return {
                        ...item,
                        submenu: filteredSubmenu
                    };
                }
                return null;
            }
            return item.name.toLowerCase().includes(query) ? item : null; // Return null for non-matching items
        }).filter(Boolean); // Remove null items
    };


    const renderMenuItems = (items, parentIndex = '') => {

        return items.map((item, index) => {

            const currentIndex = parentIndex ? `${parentIndex}-${index}` : `${index}`;

            return (
                <li key={currentIndex}>
                    <span
                        type="button"
                        className="btn btn-outline-secondary border-0 treeview-item collapsed"
                        data-bs-toggle={item.submenu ? 'collapse' : undefined}
                        data-bs-target={item.submenu ? `#menu${currentIndex}` : undefined}
                        onClick={ item.type === 'list' ? () => { handleListSelection(item) }: undefined }
                    >
                        <div>

                            {item.submenu ? (
                                <>
                                    <FontAwesomeIcon
                                        icon={faCaretRight}
                                        className="me-2 treeview-item-icon"
                                    />
                                    {item.type === 'folder' &&
                                        <FontAwesomeIcon
                                            icon={faFolder}
                                            className="me-2"
                                        />
                                    }
                                </>

                            ) : (

                                <FontAwesomeIcon
                                    icon={faList}
                                    className="me-2"
                                />


                            )}
                        </div>

                        {item.name}
                    </span>

                    {item.submenu && (
                        <ul id={`menu${currentIndex}`} className="collapse treeview-menu">
                            {renderMenuItems(item.submenu, currentIndex)}
                        </ul>
                    )}
                </li>
            );
        });
    };

    const filteredLists = filterItems(lists, searchQuery);

    return (
        <div className="dropdown me-2">
            <button
                className="btn btn-secondary dropdown-toggle"
                type="button"
                data-bs-auto-close="outside"
                aria-expanded="false"
                style={{ minWidth: 300 }}
                onClick={ () => setShowDropdown(!showDropdown) }
            >
                { selectedList ? <><FontAwesomeIcon icon={faList} className="me-2"/> {selectedList}</> : 'Select A List'}
            </button>

            <ul className={`dropdown-menu ${showDropdown ? 'show' : '' } treeview-menu p-2 custom-select-menu`} style={{ minWidth: 300 }}>
                <li className="custom-select-search-container">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="custom-select-search form-control"
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                </li>
                <li><hr className="dropdown-divider" /></li>
                {
                    filteredLists.length > 0 ?
                        renderMenuItems(filteredLists) :
                        <li>No Lists found</li>
                }
            </ul>
        </div>
    );
};

export default FieldsListSelection;