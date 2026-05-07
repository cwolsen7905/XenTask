/**
 *  This Is The Simpler Version Of The Dropdown With No Item Template
 *  And Will Return The Value Rather Than The ID
 *  Should Mimic The Normal Dropdowns
 */
import React, { useState, useEffect, useRef } from 'react';

const FieldsDropdownSimple = ({ data = {},className, callBack, itemTemplate, sizes = {}, disabled = false, placeholder = 'Select An Item' }) => {
  
  const options = data.options || {};
  const [selectedId, setSelectedId] = useState( data.value || '' );
  const [searchQuery, setSearchQuery] = useState('');
  const buttonRef = useRef(null); // Reference to the button element
  const [menuW,setMenuWidth] = useState( 'menuW' in sizes ? sizes['menuW'] : '100%' ); // Reference to the button element

  // Controls the size from 
  const MenuH = 'menuH' in sizes ? sizes['menuH'] : '16rem';

  const handleSelect = (id) => {

    setSelectedId(id);
    //if (callBack) callBack( options.find( option => option.id === id ).value );
    if (callBack) callBack( options.find( option => option.id === id ) );
  };

  //  Resize The Dropdown To The Size Of The Buttons
  useEffect(() => {
    const updateMenuWidth = () => {
      if (buttonRef.current) {
        const buttonWidth = buttonRef.current.offsetWidth; // Get the width of the button
        setMenuWidth(`${buttonWidth}px`); // Update menuW to match the button width
        //console.log("MenuW", menuW);
      }
    };
  
    updateMenuWidth(); // Call the function initially
  
    window.addEventListener('resize', updateMenuWidth); // Listen for window resize events
  
    return () => {
      window.removeEventListener('resize', updateMenuWidth); // Clean up the event listener
    };

  }, [buttonRef.current] );

  /**
   * Search The Dropdown For A Particular Label Name And Return Those Matched Results
   */
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className={`dropdown ${className}`}>
        <button
          ref={buttonRef} // Assign the ref to the button element
          className="btn btn-light dropdown-toggle custom-select"
          type="button"
          id="dropdown-custom-components" 
          data-bs-toggle="dropdown"
          data-bs-popper-config='{"strategy":"fixed"}'
          aria-expanded="false"
          disabled={disabled}
        >
          
          { 
            selectedId ? (
              itemTemplate ? 
              itemTemplate(options.find( (option) => option.id === selectedId ) ) : 
              badgeTemplate(options.find( (option) => option.id === selectedId ) )
            ) : placeholder
          }
        
        </button>
        <ul className="dropdown-menu dropdown-menu-sm-end custom-select-menu" aria-labelledby="dropdown-custom-components" style={{
          maxHeight: MenuH,
          width: menuW, // Set the width of the dropdown menu
        }}>
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
