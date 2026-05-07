
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCircleDown,
    faTag,
    faMoneyBill,
    faSliders,
    faUser,
    faSquareCheck,
    faHashtag,
    faCalendar,
    faPhone,
    faGlobe,
    faFont,
    faAddressBook,
} from '@fortawesome/free-solid-svg-icons';

import FieldsDropdown from '../../../Fields/FieldsDropdown';
import CustomFieldOptionsList from './CustomFieldOptionsList';
import EditSlider from './EditSlider';
import React, { useState, useRef,useEffect } from 'react';
import { v4 as uuidv4 } from "uuid"
import Alerts from '../../../Alerts';
import { currenciesDropdown } from '../../../../Utils/Currencies';
import EditDatables from './EditDatables';

const CustomFieldEditorPanelBody = ({ editObj = null, togglePanelVisibility, closeModal, deleteItem, updateData, dropdownOn }) => {

    //  Depending On The Dropdown Option We May Need To Gather Extra Data To Update
    const childRef = useRef(null);

    const [itemSelected, setItemSelected] = useState(dropdownOn || editObj.type || 'text');
    const [editDescription, setDescription] = useState(editObj.description || '');
    const [editName, setName] = useState(editObj.name || '');
    const [required, setRequired] = useState(editObj.required || false);
    const [pinned, setPinned] = useState(editObj.pinned || false);
    const [isDelete, setIsDelete] = useState(false);

    console.log("editItem",editObj);

    // This Is For When We Need To Use A Custom Field And We Want
    // To Get A Value Back From The Callback.
    // EX: Currency Is Using The Custom Field Dropdown Component
    // We do this so we dont have to use the ref to expose the values
    const [customFieldValue, setCustomFieldValue] = useState();


    const nameChange = (e) => {

        if (e.target.value.trim() == '') {
            // Set Style To Invalid 
        }

        setName(e.target.value)
    }

    const requiredChange = (e) => {
        setRequired(e.target.checked)
    }

    const pinnedChange = (e) => {
        setPinned(e.target.checked)
    }

    const saveNewData = (e) => {

        e.preventDefault();

        if (editName.trim() == '') {

            return;
        }

        // Make A Shallow Copy Of The Original Object
        let newObj = { ...editObj };
        let _id = '';
        let _isNew = false;

        if (!editObj) {
            _id = uuidv4();
            _isNew = true;
        } else {
            _id = editObj.id || editObj.hash;
        }

        // Basic Data Changes 
        newObj.id = _id;
        newObj.required = required;
        newObj.pinned = pinned;
        newObj.description = editDescription
        newObj.name = editName
        newObj.type = itemSelected;

        if (_isNew) {
            newObj.created_by_user = '';
            newObj.date_created = '';
        }

        // Handle Distinct Variables By Type
        if (childRef && (itemSelected == 'dropdown' || itemSelected == 'labels')) {
            const _items = childRef.current.getItems();
            newObj.options = _items;
        }

        if (childRef && (itemSelected == 'slider')) {

            const _items = childRef.current.getItems();
            newObj.options = _items;

        }

        if( ( itemSelected == 'currency' ) ) {

            //console.log('CURRENCEY:',customFieldValue );
            newObj.options = { 
                currency: customFieldValue.value 
            };

        }

        
        if (childRef && ( itemSelected == 'contacts' || itemSelected == 'datatables')) {

            const _items = childRef.current.getItems();
            newObj.options = _items;

        }



        updateData(newObj, _isNew);

    }

    //  Template For The Dropdown Items
    const dropdownSelectItemTemplate = (selected) => {

        let option = selected;

        return (
            <span>
                <span className="me-2">{option.icon}</span>
                {option.label}
            </span>
        );
    }

    const handleDropdownSelection = (selected) => {

        setItemSelected( selected.value );

        //console.log("selected",selected)

        if( selected.value == "currency" ){
            //console.log('Need To Set Default Value Here');
            setCustomFieldValue(currenciesDropdown.options[0]);
        }

    }

    const handleCustomFieldItem = (item) => {
        //console.log("Handle Custom Field Item", item);
        setCustomFieldValue(item)
    }

    const triggerAlert = () => {

        setIsDelete(true);
        //console.log("Triggered Alert", isDelete);

    }

    const removeItem = () => {

        setIsDelete(false);
        //console.log('delete edit obj', editObj);
        deleteItem(editObj);

    }

    const fieldSettingTemplate = () => {

        switch (itemSelected) {

            case ('dropdown'):
            case ('labels'):
                return (<CustomFieldOptionsList data={editObj.options || []} ref={childRef} />);

            case ('currency'):

                return (<FieldsDropdown data={currenciesDropdown} itemTemplate={dropdownSelectItemTemplate} callBack={handleCustomFieldItem} />);

            case ('slider'):
                return (<EditSlider values={ editObj.options || {} } ref={childRef} />)

            // Place An Edit Button Here 
            // With Options to Select What Columns Will Show Max 3 
            case ('contacts'):
                return (
                <EditDatables 
                    options={[{id:'contacts', label:'Contacts'}]}
                    table={editObj?.options?.table || 'contacts'}
                    multiSelect={editObj?.options?.multiSelect}
                    hidden={true} 
                    ref={childRef} 
                    closeModal={closeModal} 
                />
            )

            default:
                return;
        }

    }


    // Currently Available Options 
    var customFieldsDropdownOptions = {
        value: "0",
        options: [
            {
                label: "Text",
                value: 'text',
                icon: <FontAwesomeIcon icon={faFont} />,
                id: "0"
            },
            // Needs Extra Fields
            {
                label: "Dropdown",
                icon: <FontAwesomeIcon icon={faCircleDown} />,
                value: 'dropdown',
                id: "1"
            },
            {
                label: "Labels",
                icon: <FontAwesomeIcon icon={faTag} />,
                value: 'labels',
                id: "2"
            },
            {
                label: "Currency",
                icon: <FontAwesomeIcon icon={faMoneyBill} />,
                value: 'currency',
                id: "3",
            },
            {
                label: "Slider",
                id: "4",
                value: 'slider',
                icon: <FontAwesomeIcon icon={faSliders} />,
            },
            {
                label: "People",
                id: "5",
                value: 'people',
                icon: <FontAwesomeIcon icon={faUser} />,
            },
            {
                label: "Checkbox",
                value: 'checkbox',
                id: "6",
                icon: <FontAwesomeIcon icon={faSquareCheck} />,
            },
            {
                label: "Number",
                id: "7",
                value: 'number',
                icon: <FontAwesomeIcon icon={faHashtag} />,
            },
            {
                label: "Date",
                id: "8",
                value: 'date',
                icon: <FontAwesomeIcon icon={faCalendar} />,
            },
            {
                label: "Phone",
                value: 'phone',
                id: "9",
                icon: <FontAwesomeIcon icon={faPhone} />,
            },
            {
                label: "Link",
                value: 'link',
                id: "10",
                icon: <FontAwesomeIcon icon={faGlobe} />,
            },
            {
                label: "Contacts",
                value: 'contacts',
                id: "11",
                icon: <FontAwesomeIcon icon={faAddressBook} />,
            },

        ]
    }

    // Set The Dropdown To The Edit Objects Type
    customFieldsDropdownOptions.options.forEach(option => {
        if (option.value == itemSelected) customFieldsDropdownOptions.value = (option.id || option.hash);
    });

    //console.log(customFieldsDropdownOptions);
    
    /**
     * If the Editing Object Is A Currency We Need To Build The Dropdown
     * And Set The Value
    */
    useEffect(() => {

        if ( editObj && editObj.type == 'currency' ) {
            
            currenciesDropdown.options.forEach(option => {

                if (option.value == editObj.options.currency) {

                    currenciesDropdown.value = (option.id);
                    setCustomFieldValue(option);
                    return;

                }

            });
        }
       
    }, []);



    return (
        <form onSubmit={saveNewData}>
            {/* Name And Description */}
            <div className="row">
                <div className="col-sm-4">General</div>
                <div className="col-sm-8">
                    <div className="mb-3">
                        <label className="form-label">Field Name</label>
                        <input className="form-control" value={editName} onChange={nameChange} required />
                    </div>
                    {/* Options For Particular Fields */}
                    <div className="mb-3">
                        <label className="form-label">Description (Optional)</label>
                        <input className="form-control" value={editDescription} onChange={(e) => { setDescription(e.target.value) }} />
                    </div>
                </div>
            </div>

            <hr />

            {/* Custom Field Settings */}
            <div className="row">
                <div className="col-lg-4">Field Type</div>
                <div className="col-lg-8">
                    <div className="mb-3">
                        <label className="form-label">Type</label>
                        <FieldsDropdown data={customFieldsDropdownOptions} itemTemplate={dropdownSelectItemTemplate} hasSearch={false} callBack={handleDropdownSelection} disabled={editObj ? true : false} />
                    </div>
                    <div className="mb-3" >

                        {fieldSettingTemplate()}

                    </div>
                </div>
            </div>

            <hr />

            {/* General Field Settings */}
            <div className="row">
                <div className="col-sm-4">Settings</div>
                <div className="col-sm-8">

                    <div className="mb-3">

                        <div className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" checked={required} onChange={requiredChange} />
                            <label className="form-check-label">Required</label>
                        </div>

                        <div className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" checked={pinned} onChange={pinnedChange} />
                            <label className="form-check-label">Pinned</label>
                        </div>
                    </div>
                </div>
            </div>
            <hr />

            <div className="d-flex justify-content-between">

                {
                    editObj &&
                        <div>
                            <button type="button" className="btn btn-danger btn-small" onClick={triggerAlert}>Delete</button>
                        </div>
                }

                <div className="mb-3">
                    <button className="btn btn-danger me-2" onClick={togglePanelVisibility}>Cancel</button>
                    <button type="submit" className="btn btn-success">Save</button>
                </div>
            </div>


            <Alerts header={"Warning"} showAlert={isDelete} confirmAction={removeItem} cancelAction={() => setIsDelete(false)}>
                <p>
                    You're About To Delete A Custom Field.<br />
                    If You'd Like To Complete This Action, Please
                    Press The Confirm Button.
                </p>
            </Alerts>



        </form>
    );
}

export default CustomFieldEditorPanelBody;