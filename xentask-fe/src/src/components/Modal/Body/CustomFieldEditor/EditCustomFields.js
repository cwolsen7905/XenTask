import React, { useState, useEffect, useRef, useContext } from 'react';
//import { v4 as uuidv4 } from "uuid"
import Accordion from 'react-bootstrap/Accordion';
import Tables from '../../../Tables/CustomFieldsTable';
import ModalSidePanel from '../ModalSidePanel';
import TableCheckbox from '../../../Tables/components/TableCheckbox';
import TableButton from '../../../Tables/components/TableButton';
import CustomFieldEditorPanelBody from './CustomFieldEditorPanelBody';
import CustomFieldsPreview from './CustomFieldPreviewer/CustomFieldPreview';
import { DataContext } from '../../../Contexts/DataContext';
import { groupByKey } from '../../../../Utils/Utils';
import { useUI } from '../../../Contexts/UIContext';
import axios from 'axios';


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlass
} from '@fortawesome/free-solid-svg-icons';


function EditCustomFields({closeModal}) {

  //  Global Data For The User
  const { globalData, addNewItem } = useContext(DataContext);
  const { showToastNotification } = useUI();

  // Highlights The Active Tab Button
  // Wont Deselect If A Folder Is Clicked
  const [activeTabButton, setactiveTabButton] = useState();

  // The Actual ID We Want To Fetch Data For
  const [activeId, setActiveId] = useState();

  // Sets The Title Of The Select Element
  const [title, setTitle] = useState('');

  const [customFieldsData, setCustomFieldsData] = useState([]);

  // Show Grouping Of Custom Fields Or All By Table
  const [groupByType, setGroupByType] = useState(true);

  // Will Send The Current Object We're Editing To The Dropdown If The Panel Is Open
  const [currentEditObj, setCurrentEditObj] = useState('');

  console.log(currentEditObj);

  //  Overrides the Type Dropdown In The Panel Body
  const [dropdownOn, setDropdownOn] = useState('');

  const [navTabOn, setNavTabOn] = useState('fields');

  //  Filter Out By Fields Name
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered data based on search query
  const filteredData = customFieldsData.filter(field =>
    field.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group the data by type
  const fieldsDataByType = groupByKey(filteredData, 'type');;

  //  Handle SidePanel Reference
  const modalSidePanelRef = useRef(null);

  // Hide The Modal With Aditional Actions
  const togglePanelVisibility = (title) => {

    setCurrentEditObj('');
    setDropdownOn('');
    modalSidePanelRef.current.toggleVisibility(title);

  };


  /**
   * 
   * @param {string} title      - Sidepanel title
   * @param {object} editItem   - The Table Rows Object We Want To Edit. Leave As String For Empty
   * @param {*} typeDropdownOn  - The Current Custom Field Selected
   */
  const openPanel = (title, editItem = '', typeDropdownOn = '') => {

    //  Open Up The Modal If It's Not Already
    if (!(modalSidePanelRef.current.getIsVisible())) {

      modalSidePanelRef.current.openPanel(title);
      //console.log("editItem",editItem);
      setCurrentEditObj(editItem);

      // Set The Dropdown Option In The CustomFieldEditorPanelBody Component 
      if (typeDropdownOn) setDropdownOn(typeDropdownOn);

    }

  };

  const loadCustomFields = async (id) => {

    //  Don't Do Anything If We're Already Active
    if (id == activeId) return;

    setActiveId(id);

    let _url = '';

    if (id == 'workspace') {

      _url = `https://${globalData.api_url}/workspace/${globalData.USER.default_workspace}/fields`;

    } else {

      let _paths = id.split('-');
      let _type = _paths[0];
      let _id = _paths[1];

      _url = `https://${globalData.api_url}/${_type}/${_id}/fields`;

    }

    try {

      const response = await axios.get(_url, { withCredentials: true });

      if (response.status === 200) {
        
        //  Making A Change
        setCustomFieldsData( Array.isArray( response.data ) ? response.data : [] );

      }

    } catch (error) {
      console.log(error);
    }

  }

  /**
   * Handles Generations Of Buttons That Will Trigger The Loading Of Custom Fields
   * Based On Their ID
   */
  const generateTabsButtons = (data) => {
    const tabs = {};

    if (!data || Object.keys(data).length === 0) {
      return { tabs };
    }

    Object.values(data).forEach((space, spaceIndex) => {

      const spaceId = `space-${space.id}`; // Unique space ID

      tabs[spaceId] = (
        <React.Fragment key={`button-${spaceIndex}`}>

          <button
            className={`nav-link ${activeTabButton === spaceId ? 'active' : ''}`}
            id={`${spaceId}-tab`}
            data-bs-toggle="collapse"
            data-bs-target={`#${spaceId}`}
            type="button"
            role="tab"
            aria-controls={spaceId}
            aria-selected={activeTabButton === spaceId}
            onClick={() => {
              loadCustomFields(spaceId);
              setactiveTabButton(spaceId);
              setTitle(space.name);
            }}
          >

            {space.name}

          </button>

          <div className={`collapse ${activeTabButton === spaceId ? 'show' : ''}`} id={spaceId}>

            <ul className="list-group">

                {
                //  This Populates The Normal Space Lists 
                Object.values(space.lists).map((list, listIndex) => {

                  const spaceListId = `list-${list.id}`; // Unique list ID

                  return (
                    <li className="list-group-item" key={listIndex}>
                      <button
                        className="btn btn-link"
                        onClick={() => {
                          loadCustomFields(spaceListId);
                          setTitle(list.name);
                        }}
                      >
                        {list.name}
                      </button>
                    </li>
                  );

                })}
  

              {Object.values(space.folders).map((folder, folderIndex) => {

                const folderId = `folder-${folder.id}`; // Unique folder ID



                return (

                  <li className="list-group-item" key={folderIndex}>
                    <button
                      className="btn btn-link"
                      onClick={() => {
                        loadCustomFields(folderId);
                        setTitle(folder.name);
                      }}
                    >
                      {folder.name}
                    </button>

                    <ul className="list-group mt-2">

                      {Object.values(folder.lists).map((list, listIndex) => {
                        const listId = `list-${list.id}`; // Unique list ID

                        return (
                          <li className="list-group-item" key={listIndex}>
                            <button
                              className="btn btn-link"
                              onClick={() => {
                                loadCustomFields(listId);
                                setTitle(list.name);
                              }}
                            >
                              {list.name}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </div>
        </React.Fragment>
      );
    });

    return { tabs };
  };

  /**
   * Generate Tables Will Generate A Simple Table If Group By Is False
   * Otherwise it'll create new accordions and seperate table instances 
   * 
   */
  const generateTables = () => {

    // Generate Accordions And Tables 
    if (groupByType) {

      return (

        fieldsDataByType.map((item, index) => (

          <Accordion key={index} defaultActiveKey={['0']} alwaysOpen className="mb-2">
            <Accordion.Item eventKey="0">
              <Accordion.Header>{item.key.charAt(0).toUpperCase() + item.key.slice(1)}</Accordion.Header>
              <Accordion.Body>
                {<Tables tableData={item.items} columns={columns} />}
                <div className="row mt-4">
                  <button className="btn btn-primary" onClick={() => {
                    openPanel('Add Custom Field', '', item.key);
                  }}
                  >
                    Add New Field
                  </button>
                </div>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

        ))

      );

    } else { // Generate A Normal Table With All The Fields

      return (
        <Tables tableData={filteredData} columns={columns} />
      );


    }

  }

  /**
   * Update Or Create A New Record
   */
  const updateData = async (newObj, isNew) => {

    // Clone the current state
    const updatedData = [...customFieldsData];

    // Check if it's a new record or an update
    if (!isNew) {

      // Find the index of the existing record
      const index = updatedData.findIndex(item => (item.id || item.hash) === (newObj.id || newObj.hash));

      // If the record exists, update it
      if (index !== -1) {

        let _url = `https://${globalData.api_url}/workspace/${(newObj.id || newObj.hash)}/fields`;

        //  Start Updating The Custom Fields
        try {

          const response = await axios.put(_url, JSON.stringify(newObj), { withCredentials: true });

          if (response.status === 200) {

            updatedData[index] = newObj;
            setCustomFieldsData(updatedData);
            togglePanelVisibility();

          } else {

            showToastNotification({
              type: 'danger',
              message: "There Was An Error Creating This Custom Field."
            });

          }

        } catch (error) {

          console.error(error.response ? error.response.data : error.message); // Log error details

        }

      } else {

        console.error(`Record with ID ${newObj.id} not found for update.`);
        return;

      }

    } else {

      let _url = '';

      if (activeTabButton === 'workspace') {

        newObj['parent_type'] = 'workspace';
        _url = `https://${globalData.api_url}/workspace/${globalData.USER.default_workspace}/fields`;

      } else {

        //console.log(activeId);
        let _paths = activeId.split('-');
        let _type = _paths[0];
        let _id = _paths[1];

        newObj['parent_type'] = _type;
        _url = `https://${globalData.api_url}/${_type}/${_id}/fields`;

      }


      try {

        const response = await axios.post(_url, JSON.stringify(newObj), { withCredentials: true });

        if (response.status === 200) {

          
          // Push The New Record To The Array
          newObj.id = response.data.hash;
          newObj.created_by_user = response.data.created_by_user;
          newObj.date_created = response.data.date_created;
          updatedData.push(newObj);

          console.log(updatedData);
          // Update the state with the modified data
          setCustomFieldsData(updatedData);
          togglePanelVisibility();

        } else {

          showToastNotification({
            type: 'danger',
            message: "There Was An Error Creating This Custom Field."
          });

        }

      } catch (error) {

        console.log(error.response ? error.response.data : error.message); // Log error details

      }

    }

  };

  const deleteItem = async (editItem) => {

    // Clone the current state
    const updatedData = [...customFieldsData];

    // Delete
    const newData = updatedData.filter(item => (item.id || item.hash) !== (editItem.id || editItem.hash));

    let _url = `https://${globalData.api_url}/workspace/${editItem.id || editItem.hash}/fields`;

    //  Start Updating The Custom Fields
    try {

      const response = await axios.delete(_url, { withCredentials: true });

      if (response.status === 200) {

        // Update the state with the modified data
        setCustomFieldsData(newData);
        togglePanelVisibility();

      }

    } catch (error) {

      console.error(error.response ? error.response.data : error.message); // Log error details

    }



  }

  // Handle The Checkbox Changes For The Table
  const handleCheckBoxChanges = async (id, field, value) => {

    // Clone the current state
    const updatedData = [...customFieldsData];

    // Find the index of the existing record
    const index = updatedData.findIndex(item => (item.id || item.hash) === id);

    // If the record exists, update it
    if (index !== -1) {

      updatedData[index][field] = value;

      setCustomFieldsData(updatedData);

      /* Make API Call Here */
      let _url = `https://${globalData.api_url}/workspace/${id}/fields`;
      let _data = JSON.stringify({ id: id, [field]: value });

      try {

        const response = await axios.put(_url, _data, { withCredentials: true });

      } catch (error) {
        console.error(error);
      }

    }

  }

  //  Load A Tab On View
  useEffect(() => {


    loadCustomFields('workspace');
    setactiveTabButton('workspace');
    setTitle("Global Fields");


  }, []);


  // Columns Definition For Table
  const columns = [
    {
      accessorKey: "name",
      header: "Name",
      size: 225,
      cell: props => <TableButton
        row={props.row}
        getValue={props.getValue}
        onClickAction={() => {
          openPanel('Edit Field', props.row.original);
        }}
        className="btn btn-link" />
    },
    {
      accessorKey: "required",
      header: "Required",
      cell: props => <TableCheckbox
        row={props.row}
        column={props.column}
        getValue={props.getValue}
        table={props.table}
        externalChangeAction={handleCheckBoxChanges}
      />
    },
    {
      accessorKey: "pinned",
      header: "Pinned",
      cell: props => <TableCheckbox
        row={props.row}
        column={props.column}
        getValue={props.getValue}
        table={props.table}
        externalChangeAction={handleCheckBoxChanges}
      />
    },
    {
      accessorKey: "created_by_user",
      header: "Created By",
      size: 225,
    },
    {
      accessorKey: "date_created",
      header: "Date Created",
      size: 225,
    },
    {
      accessorKey: "parent_type",
      header: "Field Level",
      size: 225,
    },
  ]

  //  Generate The Tab Buttons To Modify Custom Fields
  const { tabs } = generateTabsButtons(globalData.SPACES);

  return (
    <>
      <div className="d-flex align-items-start mt-2">
        <div
          className="nav flex-column nav-pills me-3 border-end"
          id="v-pills-tab"
          role="tablist"
          aria-orientation="vertical"
          style={{ minWidth: '20%', position: 'sticky', top: '0' }}
        >
          {/* Load Global Custom Fields */}

          <button
            className={`nav-link ${activeTabButton === 'workspace' ? 'active' : ''}`}
            id="workspace-tab"
            onClick={() => {
              loadCustomFields('workspace');
              setactiveTabButton('workspace');
              setTitle("Global Fields");
            }}
            type="button"
            role="tab"
            aria-controls="workspace"
            aria-selected={activeTabButton === 'workspace'}
          >
            Global Fields
          </button>
          <hr />
          <label className="form-label mx-auto"><u>By Space</u></label>
          {Object.values(tabs)}

        </div>

        {

          activeTabButton &&

          <div className="d-flex flex-column justify-content-between" style={{ width: '100%' }}>

            {/* General Tool Bar For Fields Creations*/}
            <div className="sticky-top" style={{ zIndex: '1', top: 0, backgroundColor: 'var(--bs-body-bg)' }}>

              <div className="d-flex align-items-center justify-content-between">

                <h1 className="my-4">{title}</h1>

                {
                  (navTabOn == 'fields') && (

                    <div className="row">
                      <div className="col-auto">
                        <button className="btn btn-success" onClick={() => { openPanel('Add New Field') }}>Add New Field</button>
                      </div>

                      <div className="col-auto">
                        <div className="form-check form-switch mx-auto">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            onClick={() => { setGroupByType(prev => !prev) }} defaultChecked={groupByType}
                          />
                          <label className="form-check-label">Group By Type</label>
                        </div>
                      </div>

                      <div className="col-auto">
                        <div className="input-group">
                          <input
                            className="form-control"
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for..."
                            aria-label="Search for..."
                            aria-describedby="btnNavbarSearch"
                          />
                          <button className="btn btn-primary" type="button">
                            <FontAwesomeIcon icon={faMagnifyingGlass} />
                          </button>
                        </div>
                      </div>

                    </div>
                  )
                }

                {
                  (navTabOn == 'preview') && (

                    <div className="d-grid gap-2 col-6 mx-auto">
                      <button className="btn btn-success btn-lg" type="button">Save</button>
                    </div>
                  )
                }


              </div>
            </div>

            <div className="tab-content" style={{ width: '100%', overflowY: 'auto', marginTop: '55px' }}>
              {/* Render tab body */}
              <div className="tab-pane fade show active" id="tab-body" role="tabpanel">

                <nav>
                  <div className="nav nav-tabs" id="nav-tab" role="tablist">
                    <button className="nav-link active" id="fieldTabButton" data-bs-toggle="tab" data-bs-target="#fieldTab" type="button" role="tab" aria-controls="fieldTab" aria-selected="true" onClick={() => { setNavTabOn('fields') }}>Custom Fields</button>
                    {
                      /* Ensure Theres Actual Data Loaded First */
                      customFieldsData.length > 0 &&
                      <button className="nav-link" id="previewTabButton" data-bs-toggle="tab" data-bs-target="#previewTab" type="button" role="tab" aria-controls="previewTab" aria-selected="false" onClick={() => { setNavTabOn('preview') }}>Preview</button>
                    }
                  </div>
                </nav>

                <div className="tab-content p-2" id="nav-tabContent">
                  <div className="tab-pane fade show active" id="fieldTab" role="tabpanel" aria-labelledby="fieldTabButton">
                    {generateTables()}
                  </div>

                  {/* Custom Fields Previewer */}
                  <div className="tab-pane fade" id="previewTab" role="tabpanel" aria-labelledby="previewTabButton">

                    <div className="alert alert-info">
                      Reorder your custom fields by dragging rows.<br />
                      Pinned items stay at the top and can only be rearranged among themselves.<br />
                      The row sequence reflects the layout in task creation and task views.<br />
                    </div>

                    {
                      (customFieldsData && customFieldsData.length > 0) && (
                        <CustomFieldsPreview data={customFieldsData} />
                      )
                    }

                  </div>
                </div>

              </div>
            </div>
          </div>
        }
      </div>



      {/* Will Handle CRUD Operations On Custom Fields */}
      <ModalSidePanel ref={modalSidePanelRef} style={{ minWidth: 600 }}>
        <CustomFieldEditorPanelBody editObj={currentEditObj} closeModal={closeModal} togglePanelVisibility={togglePanelVisibility} updateData={updateData} deleteItem={deleteItem} dropdownOn={dropdownOn} />
      </ModalSidePanel>

    </>
  );





}

export default EditCustomFields;