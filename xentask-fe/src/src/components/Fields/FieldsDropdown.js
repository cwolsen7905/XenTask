import React, { useState, useEffect, useRef } from 'react';

/**
 * 
 * @param {object} data - {
 *                        value: 0,   -> This is The Selected Value ID
                          options: [  -> Array Containing The Different Selections
                              {
                                  id: "0"           -> Unique ID
                                  label: "Text",    -> What Is Shown To THe User
                                  onClick: function -> Extra Action To Take When Clicking 
                              },
                          ]}

 * @param {jsx} itemTemplate - This Allows Us To Pass A Custom Template TO Render
 *                        
 * @returns 
 */
const FieldsDropdown = ({ 
  data = {},
  stickyMenuButtons,      // These Will Appear Below The Main Options Usually To Trigger An Action
  itemTemplate, 
  className, 
  dropdownBtnstyles, 
  dropdownMenuStyles, 
  disabled = false, 
  hasSearch = true, 
  placeholder = 'Select An Item', 
  callBack, 
  showError,
}) => {

  const options = data.options || {};
  const [selectedId, setSelectedId] = useState( data.value || '' );
  const [searchQuery, setSearchQuery] = useState('');
  const buttonRef = useRef(null); // Reference to the button element
  const [menuW, setMenuWidth] = useState('100%'); // Reference to the button element
  const MenuH = '16rem';

  const [isInvalid, setInvalid] = useState(showError);

  //  Don't Know If We Want To Keep This Here Or Not
  useEffect(() => {
    setSelectedId(data.value);
  }, [data.value]);

  useEffect(() => {
    setInvalid(showError);
  }, [showError]);

  // Controls the size from 
  const handleSelect = (id) => {

    setSelectedId(id);

    //if (callBack) callBack( options.find( option => option.id === id ).value );
    if (callBack) {
      let _item = options.find(option => ( option.id || option.hash ) === id);
      //console.log("dropdown handleSelect", _item);
      callBack(_item);
    }

  };

  //  Resize The Dropdown To The Size Of The Buttons
  useEffect(() => {

    const updateMenuWidth = () => {
      if (buttonRef.current) {
        const buttonWidth = buttonRef.current.offsetWidth; // Get the width of the button
        setMenuWidth(`${buttonWidth}px`); // Update menuW to match the button width
      }
    };

    updateMenuWidth(); // Call the function initially

    window.addEventListener('resize', updateMenuWidth); // Listen for window resize events

    return () => {
      window.removeEventListener('resize', updateMenuWidth); // Clean up the event listener
    };

  }, [buttonRef.current]);

  /**
   * Basic Badge Component That's Returned 
   */
  function badgeTemplate(option) {

    let style = {};

    if (option != undefined) {

      if ('color' in option) style['backgroundColor'] = option.color || '#6c757d';

      return (
        <span className="badge" style={style} key={option.id || option.hash }>
          {
            ( 'label' in option ) ? option.label : option.name
          }
        </span>
      );

    } else {

      // console.error(options);
      // console.error(selectedId);

    }
  }

  /**
   * Search The Dropdown For A Particular Label Name And Return Those Matched Results
   */
  const filteredOptions = options.filter((option) => {

    if(option == undefined) return;
    
    if( 'label' in option ) {
      return option.label.toLowerCase().includes(searchQuery.toLowerCase());
    } else {
      return option.name.toLowerCase().includes(searchQuery.toLowerCase());
    }

  });

  return (
    <>
      <div className={`dropdown ${ className ? className : ''}`}>

        <button
          ref={buttonRef} // Assign the ref to the button element
          className={`btn btn-outline-secondary dropdown-toggle d-flex align-items-center custom-select ${isInvalid ? 'is-invalid' : ''}`}
          type="button"
          id="dropdown-custom-components"
          data-bs-toggle="dropdown"
          data-bs-popper-config='{"strategy":"fixed"}'
          aria-expanded="false"
          disabled={disabled}
          style={dropdownBtnstyles}
        >

          {
            selectedId ? (
              itemTemplate ?
                itemTemplate( options.find((option) => ( option.id || option.hash ) === selectedId) ) :
                badgeTemplate(options.find((option) => ( option.id || option.hash )=== selectedId ) )
            ) : placeholder
          }

        </button>

        <ul
          className="dropdown-menu dropdown-menu-sm-end custom-select-menu"
          aria-labelledby="dropdown-custom-components"
          style={{
            maxHeight: MenuH,
            width: menuW,
            zIndex: 1003,
            ...dropdownMenuStyles
          }}
        >

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
            <li key={ option.id || option.hash }>
              <button className="dropdown-item custom-select-option" type="button" onClick={() => handleSelect( option.id || option.hash )}>
                {itemTemplate ? itemTemplate(option) : badgeTemplate(option)}
              </button>
            </li>
          ))}

          {/* These Are Extra Buttons  */}
          {stickyMenuButtons && (
            <>
              <li><hr className="dropdown-divider"/></li>
              {stickyMenuButtons()}
            </>
          )}
          

        </ul>
      </div>
    </>
  );
};

export default FieldsDropdown;
