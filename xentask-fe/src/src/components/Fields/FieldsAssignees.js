import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { DataContext } from '../Contexts/DataContext';

const FieldsAssignees = ({ selected = [], placeholder = "No Assigned Users", taskId, createTask, callBack, fieldCallback, fetchUser = false, usersList, styles }) => {

  const { globalData } = useContext(DataContext);

  // State Management
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');


  // Fetch Users from API
  useEffect(() => {

    setUsers(globalData.WORKSPACE_USERS);
    /*//  If We Don't Want To Fetch The User We Need A List Of Users Then
    //  We User usersList To Set It We Do This Since We Also Use This
    //  Component To Render The Table Cells
    if (!fetchUser) {

      try {
        setUsers(usersList);
        return;
      } catch (error) {
        console.error("Must Provide A Valid Users Array During Manual Operation");
      }

    }

    const fetchUsers = async () => {
      try {
        const _url = `https://${globalData.api_url}/workspace/${globalData.USER.default_workspace}/users`;
        const response = await axios.get(_url, { withCredentials: true });
        if (response.status === 200) setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users", error);
      }
    };

    fetchUsers();*/

  }, []);


  // Handle Tag Click
  const handleTagClick = async (user) => {

    if (!selected.includes(user)) {

      const updatedUsers = [...selected, user];

      if (callBack) callBack(updatedUsers); // Notify parent component if callBack exists
      if (fieldCallback) {
        fieldCallback({
          action: 'add',
          user: user.id,
          current: updatedUsers
        });
      }
      if (!createTask && fetchUser) {

        let _data = [user.id];

        try {
          const _url = `https://${globalData.api_url}/task/${taskId}/assignee`;
          const response = await axios.post(_url, JSON.stringify(_data), { withCredentials: true });
        } catch (error) {
          console.error("Error fetching users", error);
        }

      }

    }

  };

  // Handle Remove User
  const handleRemoveUser = async (userToRemove) => {

    const updatedUsers = selected.filter(user => user.id !== userToRemove.id);


    if (callBack) callBack(updatedUsers); // Notify parent component if callBack exists

    if (fieldCallback) {
      fieldCallback({
        action: 'del',
        user: userToRemove.id,
        current: updatedUsers
      });
    }
    if (!createTask && fetchUser) {
      try {
        const _url = `https://${globalData.api_url}/task/${taskId}/assignee/${userToRemove.id}`;
        const response = await axios.delete(_url, { withCredentials: true });
      } catch (error) {
        console.error(error);
      }
    }

  };

  // Filtered Users based on Search Query and excluding selected users
  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selected.some(selectedUser => selectedUser.id === user.id)
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

      <div style={{ ...styles }}>

        <div

          data-bs-toggle="dropdown"
          aria-expanded="false"
          data-bs-auto-close="outside"
          data-bs-popper-config='{"strategy":"fixed"}'
          className="form-control"
        >
          {selected.length === 0 ? (
            placeholder
          ) : (
            <div className="d-flex">{
              selected.map(user => containerUsersTemplate(user))
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
            {selected.map(user => (
              <span
                key={user.id}
                className="dropdown-item"
                onClick={() => handleRemoveUser(user)}
              >
                {dropdownUsersTemplate(user, true)}
              </span>
            ))}
          </div>

          <h6 className="dropdown-header fields-assignee-title">Users</h6>
          {filteredUsers.map(user => (
            <button
              key={user.id}
              className="dropdown-item"
              onClick={() => handleTagClick(user)}
            >
              {dropdownUsersTemplate(user, false)}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};

export default FieldsAssignees;
