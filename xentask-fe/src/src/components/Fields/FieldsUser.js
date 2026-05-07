/**
 * This Is Different Than The Assignees
 * This Is A Custom Field That Will Allow Single Or Multi Selection
 * This Can Be Used Anywhere Where We Need To Display A User Or Change The User
 */
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { DataContext } from '../Contexts/DataContext';

const FieldsUser= ({ 
    selected=[], 
    placeholder = "No User(s) Selected", 
    fetchUser = true, 
    usersList, 
    callBack, 
    tableCallBack,
    styles 
}) => {

  const { globalData } = useContext(DataContext);

  // State Management
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState(selected || []);


  // Fetch Users from API
  useEffect(() => {

    //  If We Don't Want To Fetch The User We Need A List Of Users Then
    //  We User usersList To Set It We Do This Since We Also Use This
    //  Component To Render The Table Cells
    if( !fetchUser ) {

      try {
        setUsers(usersList);
        return;
      } catch(error){
        console.error("Must Provide A Valid Users Array During Manual Operation");
      }
      
    }

    const fetchUsers = async () => {

      setUsers(globalData.WORKSPACE_USERS);
      /*try {
        
        const _url = `https://${globalData.api_url}/workspace/${globalData.USER.default_workspace}/users`;
        
        const response = await axios.get( _url, { withCredentials: true } );
        
        if( response.status === 200 ) {
            setUsers(response.data);
        }

      } catch (error) {
        console.error("Error fetching users", error);
      }*/

    };

    fetchUsers();

  }, []);


    // This Might Change Outside In The Parent Component
    // Aka A New List Is Loaded Or Something 
    // Get The Most Updated Data
    useEffect( () => {

      if( selected && selected.length > 0 ) {

        let _selected = selected.map(hash => users.find( user => user.hash === hash) ).filter(Boolean);

        setSelectedUsers(_selected);

      } 

    }, [ users, selected ] );


  // Handle Tag Click
  const handleTagClick = async (user) => {

    if ( !selectedUsers.includes(user) ) {

      const updatedUsers = [...selectedUsers, user];

      setSelectedUsers(updatedUsers);

      if (callBack) callBack( updatedUsers.map( user => user.hash ) ); // Notify parent component if callBack exists

      if( tableCallBack ) {
          tableCallBack({ 
          action:'add', 
          user: user.id,
          current: updatedUsers
        });
      }
    }
  };

  // Handle Remove User
  const handleRemoveUser = async (userToRemove) => {

    const updatedUsers = selectedUsers.filter(user => user.id !== userToRemove.id);

    setSelectedUsers(updatedUsers);

    if (callBack) callBack( updatedUsers.map( user => user.hash ) ); // Notify parent component if callBack exists

    if( tableCallBack ) {
      tableCallBack({ 
        action:'del', 
        user: userToRemove.id, 
        current: updatedUsers 
      });
    }

  };

  // Filtered Users based on Search Query and excluding selected users
  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedUsers.some(selectedUser => selectedUser.id === user.id)
  );

  // Container Users Template
  const containerUsersTemplate = (user) => (
    <div
      key={user.id}
      className="circle-user"
      style={{
        backgroundColor: user.color ? user.color : '#7C4DFF',
        borderRadius: '50%',
        width: '33px',
        height: '33px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        position: 'relative',
        marginRight: '5px', // Added margin to space out the circles
      }}
    >
      {user.initials}
      {closeButtonTemplate(user)}
    </div>
  );

  // Close Button Template
  const closeButtonTemplate = (user) => (
    <button
      key={`close-${user.id}`}
      className="close-button user btn btn-danger"
      onClick={(e) => {
        e.stopPropagation();
        handleRemoveUser(user);
      }}
    >
      <span style={{ fontSize: '14px' }}>×</span>
    </button>
  );


  // Dropdown Users Template
  const dropdownUsersTemplate = (user, showCloseButton = false) => (
    <div key={user.id} className="d-flex align-items-center me-2 mb-2">
      <div
        style={{
          backgroundColor: user.color ? user.color : '#7C4DFF',
          borderRadius: '50%',
          width: '33px',
          height: '33px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          position: 'relative',
        }}
      >
        {user.initials}
        {showCloseButton && closeButtonTemplate(user)}
      </div>
      <p style={{ display: 'inline-block', marginLeft: '10px', marginBottom: 0 }}>{user.full_name}</p>
    </div>
  );

  return (
    
    <div className="dropdown">

      <div className="p-2" style={{...styles}}>

        <div 

          data-bs-toggle="dropdown"
          aria-expanded="false"
          data-bs-auto-close="outside"
          data-bs-popper-config='{"strategy":"fixed"}'
          className="form-control"
        >
          { ( selectedUsers && selectedUsers.length === 0 ) ? (
            placeholder
          ) : (
            <div className="d-flex">{
              selectedUsers.map(user => containerUsersTemplate(user))
            }
            </div>
          )}
        </div>

        <div className="dropdown-menu h-40 overflow-auto">
          
          <div className="custom-select-search-container">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="custom-select-search form-control"
            />
          </div>

          <h6 className="dropdown-header fields-assignee-title">Assignees</h6>
          <div>
            {selectedUsers.map(user => (
              <span
                key={user.hash}
                className="dropdown-item"
                onClick={() => handleRemoveUser(user)}
              >
                {dropdownUsersTemplate(user, true)}
              </span>
            ))}
          </div>

          <h6 className="dropdown-header fields-assignee-title">Users</h6>
          {
            filteredUsers.map( user => (
                <button
                key={user.id}
                className="dropdown-item"
                onClick={() => handleTagClick(user)}
                >
                {dropdownUsersTemplate(user, false)}
                </button>
            ))
          }
        </div>

      </div>
    </div>
  );
};

export default FieldsUser;