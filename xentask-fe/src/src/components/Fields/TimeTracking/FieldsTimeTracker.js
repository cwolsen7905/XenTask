import React, { useState, useEffect, useContext } from 'react';
import { Dropdown, Accordion, ListGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import TimeTrackerBox from './TimeTrackerBox';
import FloatingCard from '../../FloatingCard';
import { DataContext } from '../../Contexts/DataContext';
import axios from 'axios';

const FieldsTimeTracker = ({ data, taskId }) => {

  const { globalData } = useContext(DataContext);

  /** Temp Setter Until We Make The API Calls  */
  const [hours, setHours] = useState(data.task_time || '');
  const [showDropdown, setShowDropdown] = useState(false);
  //const [timeEditDropdownOpen, setTimeEditDropdownOpen] = useState(false);
  const [activity, setActivityItems] = useState(Object.values(data.activity) || []);

  // Floating Card Specific Actions
  const [showCard, setShowCard] = useState(false);
  const [cardData, setCardData] = useState([]);

  //  Handle Time Tracking Button
  //  Api Will Return Null If There's No Active Running Timer. 
  //  Otherwise It'll Have An Object
  const [isRunning, setIsRunning] = useState(data.active ? true : false);
  const [activeTimer, setActiveTimer] = useState(data.active ? data.active : null);
  const [timerDateTime, setTimerDateTime] = useState(data.active ? new Date(data.active.date_started) : null);
  const [timeElapsed, setTimeElapsed] = useState(0);

  /**
   * Handles Auto Time Tracking Toggling
   */
  const handleToggle = async () => {

    //console.log("Clicked On Time Tracker Button", activeTimer);

    try {

      let _data = { auto: true };

      _data['type'] = !isRunning ? 'start' : 'end';

      if (isRunning) {

        _data['id'] = activeTimer.id;
        _data['date_started'] = activeTimer.date_started;

      }

      let _url = `https://${globalData.api_url}/task/${taskId}/time`;

      let response = await axios.post(_url, _data, { withCredentials: true });

      if (response.status === 200) {

        if (!isRunning) {

          //  Start The Timer With The Current Timestamp
          setTimerDateTime(new Date(response.data.date_started));

          // The API Response Data Will contain Information About
          // The New Active Timer Object And Should Be Saved To Have A reference
          setActiveTimer(response.data);

          //console.log("Setting New Active Timer", response.data);

        } else {

          setTimeElapsed(0);            // Reset timeElapsed when stopping
          setActiveTimer(null);       // Remove The Active Timer Since We No Longer Need it
          saveTimeEntry(response.data); // The API Data Returned Will Be Information About The New Time Entry

        }

        //  Start / Stop The Timer
        setIsRunning(!isRunning);

      }

    } catch (error) {
      console.error(error);
    }
  };

  //  Track Time Elapsed Since The Start Date
  useEffect(() => {
    let interval;
    if (isRunning && timerDateTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now - timerDateTime) / 1000); // Calculate elapsed time in seconds
        setTimeElapsed(elapsed);
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isRunning, timerDateTime]);

  const toggleCard = (show) => {
    setShowCard(show);
    if (!show) setCardData({});
  }

  /**
   * Saves A New Entry For A User
   * 
   * @param {object} newEntry - Object From The API Data
   * EX: {
            "user": "3",
            "interval": {
                "id": "aaf060807e",
                "date_started": "2024-06-10 14:02:54",
                "date_ended": "2024-06-10 15:48:32",
                "time": 6338
            },
        }
   */
  const saveTimeEntry = (newEntry) => {

    setActivityItems((prevActivityItems) => {

      const updatedActivityItems = [...prevActivityItems];

      const userIndex = updatedActivityItems.findIndex(item => item.user.id === newEntry.user);

      //console.log("userIndex", userIndex, "newEntryUser", newEntry.user, updatedActivityItems);

      if (userIndex > -1) {

        try {

          // User exists, add new interval to their intervals array
          updatedActivityItems[userIndex].intervals.push(newEntry.interval);
          //  Updates The Total Time For The User Only
          updatedActivityItems[userIndex].total_time += newEntry.interval.time;

        } catch (error) {

          console.log(error);

        }

      } else {

        // User does not exist, create a new entry
        let { id, first_name, last_name, initals, color, image } = globalData.USER;

        updatedActivityItems.push({
          user: {
            id: id,
            full_name: `${first_name} ${last_name}`,
            initials: initals,
            image: image,
            color: color
          },
          intervals: [newEntry.interval],
          total_time: newEntry.interval.time
        });
      }

      //  Update Overall Hours Every Use Spent On The Task
      setHours(hours + newEntry.interval.time);

      return updatedActivityItems;
    });
  };

  const handleInputClick = () => {
    setShowDropdown(true);
  };

  const handleDropdownToggle = (isOpen) => {
    /*// Prevent the dropdown from closing when clicking inside the menu
    if (isOpen) {
      setShowDropdown(true);
    }*/
  };

  const handleOutsideClick = (e) => {

    if (showDropdown && !e.target.closest('.dropdown-container')) {

      setShowCard(currentShowCard => {

        if (!currentShowCard) {
          setShowDropdown(false);
        }

        return currentShowCard;

      });

    }

    //console.log(showCard);

  };

  /*useEffect(() => {

    document.addEventListener('click', handleOutsideClick);

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };

  }, [showDropdown]);*/

  const containerUsersTemplate = (user) => {

    return (
      <span
        key={user.id}
        className="btn btn-sm me-1"
        style={{
          backgroundColor: user.color ? user.color : '#7C4DFF',
          borderRadius: '50%',
          width: '34px',
          height: '34px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          fontSize: '14px', // Adjust font size as needed

        }}
      >
        {user.initials}
      </span>
    );
  };

  const dropdownUsersTemplate = (item) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {containerUsersTemplate(item.user)}
        <p style={{ marginLeft: '10px', marginBottom: 0 }}>{item.user.username}</p>
        <small style={{ marginLeft: '10px' }}>{secondsToHHMMSS(item.total_time)}</small>
      </div>
    );
  };


  const millisecondsToHHMMSS = ms => {
    const numericValue = Number(ms);
    if (isNaN(numericValue) || numericValue < 0) {
      return 'Invalid input';
    }
    return new Date(numericValue).toISOString().substr(11, 8);
  };

  const secondsToHHMMSS = (seconds) => {

    const numericValue = Number(seconds);
    if (isNaN(numericValue) || numericValue < 0) {
      return 'Invalid input';
    }

    const hours = Math.floor(numericValue / 3600);
    const minutes = Math.floor((numericValue % 3600) / 60);
    const secondsRemainder = numericValue % 60;

    const HH = String(hours).padStart(2, '0');
    const MM = String(minutes).padStart(2, '0');
    const SS = String(secondsRemainder).padStart(2, '0');

    return `${HH}:${MM}:${SS}`;
  };

  const handleDelete = async (itemId) => {

    var timeToRemove = 0;

    const updatedActivity = activity.map(user => {

      if (user.intervals) {

        // Use reduce to find the item and filter the intervals in one pass
        const updatedIntervals = user.intervals.reduce((acc, item) => {
          if (item.id === itemId) {
            timeToRemove = item.time; // Store the time of the item to be removed
          } else {
            acc.push(item); // Keep the item if it's not the one to remove
          }
          return acc;
        }, []);

        // Update the total_time by subtracting the removed item's time
        const updatedTotalTime = user.total_time - timeToRemove;

        return { ...user, intervals: updatedIntervals, total_time: updatedTotalTime };
      } else {
        return user;
      }
    });

    try {

      let _url = `https://${globalData.api_url}/task/${taskId}/time/${itemId}`;
      let response = await axios.delete(_url, { withCredentials: true });

      if (response.status === 200) {
        setActivityItems(updatedActivity);
        setHours(hours - timeToRemove);
      }

    } catch (error) {
      console.error(error);
    }

  };

  const updateTimeData = (cardData) => {

    console.log("Updating Card Data", cardData);

    setActivityItems((prevActivityItems) => {
      const updatedActivityItems = [...prevActivityItems];
      const userIndex = updatedActivityItems.findIndex(item => item.user.id === cardData.user_id);

      if (userIndex > -1) {
        const intervalIndex = updatedActivityItems[userIndex].intervals.findIndex(interval => interval.id === cardData.id);

        if (intervalIndex > -1) {
          // Update the interval time with the difference
          updatedActivityItems[userIndex].intervals[intervalIndex].time += cardData.difference;
          updatedActivityItems[userIndex].intervals[intervalIndex].date_started = cardData.date_started;
          updatedActivityItems[userIndex].intervals[intervalIndex].date_ended = cardData.date_ended;
        }
        // Update total time for the user with the difference
        updatedActivityItems[userIndex].total_time += cardData.difference;
      }
      // Update the overall hours with the difference
      setHours(hours + cardData.difference);

      return updatedActivityItems;
    });

    //console.log(activity);

  };



  const listItemTemplate = (item, user_id) => {

    //console.log("listItemTemplate", item);

    return (

      <div key={`item-${user_id}`}>
        <ListGroup.Item>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <small style={{ paddingRight: 20 }}>{secondsToHHMMSS(item.time)}</small>
              <small style={{ paddingRight: 20 }}>{item.date_started.split(' ')[0]}</small>
            </div>
            {globalData.USER.id == user_id && (
              <div>
                <button
                  className="btn btn-success btn-sm"
                  style={{ marginRight: 2 }}
                  onClick={() => {
                    setCardData({
                      item: item,
                      user_id: user_id
                    });
                    toggleCard(true);
                  }}
                >
                  <FontAwesomeIcon icon={faPencilAlt} />
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>
                  <FontAwesomeIcon icon={faTrashAlt} />
                </button>
              </div>
            )}
          </div>
        </ListGroup.Item>
      </div>
    );
  };





  return (

    <>

      {
        showCard && <FloatingCard onClose={toggleCard} formData={cardData} updateTimeData={updateTimeData} taskId={taskId} />
      }

      <hr />
      
      <div className="row">
        <div className="col-lg-8 mb-2">
          <div className="d-flex align-items-center">
            <span className="me-2">
              <i className="fa-solid fa-stopwatch"></i> Track Time
            </span>

            <div className="dropdown flex-grow-1">
              <div
                className="form-control dropdown-toggle d-flex align-items-center" // Added d-flex for vertical centering
                data-bs-toggle="dropdown"
                aria-expanded="false"
                data-bs-auto-close="outside"
                data-bs-popper-config='{"strategy":"fixed"}'
                style={{ height: '38px' }} // Standard input height (adjust as necessary)
                disabled={isRunning}
              >
                <input
                  className="form-control-plaintext flex-grow-1" // Maintain the input style
                  value={`${isRunning ? 'Elapsed: ' : 'Total: '} ${secondsToHHMMSS(isRunning ? timeElapsed : hours)}`}
                  readOnly
                  style={{ margin: 0 }} // Remove any margin to fit nicely
                />
              </div>

              <div className="dropdown-menu" style={{ minWidth: 500 }}>
                <TimeTrackerBox saveEntry={saveTimeEntry} taskId={taskId} />
                <div className='overflow-auto' style={{ maxHeight: 375 }}>
                  <Accordion alwaysOpen>
                    {activity.map((item, index) => (
                      item.intervals && item.intervals.length > 0 && (
                        <Accordion.Item eventKey={index.toString()} key={`accordion-item-${item.user.id}`}>
                          <Accordion.Header>
                            {dropdownUsersTemplate(item)}
                          </Accordion.Header>
                          <Accordion.Body className="p-0">
                            <ListGroup variant="flush">
                              {item.intervals.map((interval, intervalIndex) => (
                                <ListGroup.Item key={`list-item-${item.user.id}-${intervalIndex}`}>
                                  {listItemTemplate(interval, item.user.id)}
                                </ListGroup.Item>
                              ))}
                            </ListGroup>
                          </Accordion.Body>
                        </Accordion.Item>
                      )
                    ))}
                  </Accordion>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="d-grid">
            <button
              className={`btn ${isRunning ? 'btn-danger' : 'btn-success'}`}
              onClick={handleToggle}
            >
              {isRunning ? 'End Timer' : 'Start Timer'}
            </button>
          </div>
        </div>
      </div>


    </>
  );

};
export default FieldsTimeTracker;


/*
  // Make API Call Here To Pull Available Times
  const tempData = {
    value: '1:30:00',
    // Should Be A Timestamp Of When The Timer Started The API Should Know If There Is Any Active Timer
    // Currently Running For The Logged In User
    active: null,
    activity: [
      {
        "total_time": "10800", Overall Time That The User Spent On Task Maybe Calculate This In DB
        "user": {
          "id": "001",
          "username": "Aric Yu",
          "email": "aric@gmail.com",
          "color": "#7c4dff",
          "initials": "AY",
          "profilePicture": null
        },
        "intervals": [  The Times That The User Tracked Time
          {
            "id": "001",
            "date_started": "2024-04-15 10:00:00",
            "date_ended": "2024-04-15 11:00:00",
            "time": "5400",
            "source": "clickup",
            "billable": false,
            "description": null,
            "tags": null
          },
          {
            "id": "002",
            "date_started": "2024-04-15 10:00:00",
            "date_ended": "2024-04-15 11:00:00",
            "time": "5400",
            "source": "clickup",
            "billable": false,
            "description": null,
            "tags": null
          },
        ]
      },

    ]
  };*/