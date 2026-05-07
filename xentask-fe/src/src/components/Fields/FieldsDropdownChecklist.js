/**
 * Provides A Checklist In A Dropdown Form
 */
import React, { useState, useEffect, useRef } from 'react';

const FieldsDropdownCheckList = ({ items = [], callBack, hasSearch }) => {

    const options = data.options || [];
    const [searchQuery, setSearchQuery] = useState('');


    /**
     * Search The Dropdown For A Particular Label Name And Return Those Matched Results
     */
    const filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <div className="dropdown">
                <button
                    ref={buttonRef} // Assign the ref to the button element
                    className="btn btn-light dropdown-toggle custom-select"
                    type="button"
                    id="dropdown-custom-components"
                    data-bs-toggle="dropdown"
                    data-bs-popper-config='{"strategy":"fixed"}'
                    aria-expanded="false"
                >
                </button>

                <ul className="dropdown-menu dropdown-menu-sm-end custom-select-menu" aria-labelledby="dropdown-custom-components">
                    {/* Search input */}
                    {hasSearch && (
                        <li className="custom-select-search-container">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="custom-select-search form-control"
                            />
                        </li>
                    )}
                    {/* DropDown Items */}
                    {filteredOptions.map((option) => (
                        <li key={option.id}>
                            <button className="dropdown-item custom-select-option" type="button" onClick={() => handleSelect(option.id)}>
                                {
                                    itemTemplate && itemTemplate(option)
                                }
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
};

export default FieldsDropdownSimple;
