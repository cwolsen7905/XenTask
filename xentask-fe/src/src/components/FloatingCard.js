import React, { useState, useContext } from 'react';
import DateTimePicker from 'react-datetime-picker';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
//import { parseTimeToSeconds } from '../Utils'
import FieldsTimeInput from './Fields/TimeTracking/FieldsTimeInput';
import { DataContext } from './Contexts/DataContext';
import axios from 'axios';


const FloatingCard = ({ onClose, formData, updateTimeData, taskId }) => {

    const { globalData } = useContext(DataContext);

    const id = formData.item.id;
    const user_id = formData.user_id;

    // Parse date and time strings and create a new Date object
    const startDate = new Date(formData.item.date_started);
    const endDate = new Date(formData.item.date_ended);

    // Calculate the difference in milliseconds
    const differenceInMs = endDate - startDate;

    // Convert milliseconds to seconds
    const differenceInSeconds = differenceInMs / (1000);

    //  This Will Be The Values Of The Date Picker, And Defaulted To The Original Start And End Date In UseEffect
    const [startDateTime, setStartDateTime] = useState(new Date(startDate));
    const [endDateTime, setEndDateTime] = useState(new Date(endDate));
    const [inputValue, setInputValue] = useState(differenceInSeconds);

    //  Lets Us Know There's An Issue With The Start Or End Date
    //  Start Should Never Be > End And End Should Never Be Less Than Start
    const [startInvalid, setStartInvalid] = useState(false);
    const [endInvalid, setEndInvalid] = useState(false);

    const [note, setNote] = useState('');

    // Call the onClose function provided by the parent component
    const handleClose = () => {
        onClose(false);
    };

    /* Will Update The Time Based On The Input Parsed */
    const handleBlur = (value) => {

        if (value) {

            // Calculate the time value in milliseconds for the start date
            const startTimeInMilliseconds = startDateTime.getTime();

            // Calculate the time value in milliseconds for the new date by adding the seconds
            const newTimeInMilliseconds = startTimeInMilliseconds + value * 1000;

            // Create a new Date object with the calculated time value
            const newDateTime = new Date(newTimeInMilliseconds);

            setEndDateTime(newDateTime);

        }
    };

    const handleSubmitClick = async (e) => {

        //  Start Should Never Be > End Date And Should Not Be Empty
        if (((startDateTime > endDateTime) && endDateTime) || !startDateTime) {

            setStartInvalid(true);
            return;

        } else {
            //  Reset If It's Valid
            setStartInvalid(false);
        }

        //  End Should Never Be < Start Date And Should Not Be Empty
        if (endDateTime < startDateTime || !endDateTime) {
            setEndInvalid(true);
            return;
        } else {
            //  Reset If It's Valid
            setEndInvalid(false);
        }

        // If There Are No Errors Send A Request To The DB
        // Calculate the difference in milliseconds
        const _differenceInMs = endDateTime - startDateTime;

        // Convert milliseconds to seconds
        const _differenceInSeconds = _differenceInMs / (1000);

        setInputValue(_differenceInSeconds);

        try {

            let _data = {
                id: id,
                user_id: user_id,
                time: _differenceInSeconds,
                notes: note,
                date_started: startDateTime,
                date_ended: endDateTime,
            }

            let _url = `https://${globalData.api_url}/task/${taskId}/time`;

            const response = await axios.put(_url, JSON.stringify(_data), { withCredentials: true });

            if( response.status == 200 ) {

                //  Calculate The Change In Time Between Inital Starting Times And Updated Times
                //  And Update The FE To Reflect Those Changes
                const timeDiff = _differenceInSeconds - differenceInSeconds;
                //console.log("_differenceInSeconds", _differenceInSeconds,"differenceInSeconds",differenceInSeconds, "timeDiff",timeDiff )
                _data['difference'] = timeDiff;
                 //  Get Back The Dates From The DB Formatted For Output String
                 _data['date_started'] = response.data.date_started;
                 _data['date_ended'] = response.data.date_ended;
            
                updateTimeData(_data);

                setNote('');

            }

        } catch (error) {
            console.error(error);
        }


        // Send API Call To Update The DB For Time Tracking Changes 

        // Close The Window
        handleClose();

    };


    const handleDateStartChange = (date) => setStartDateTime(date);

    const handleDateEndChange = (date) => setEndDateTime(date);

    return (
        <>
            {
                (
                    <div className="card"
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 1050,
                            minWidth: 390,
                        }}>
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Edit Time</h5>
                            <button type="button" className="btn-close" aria-label="Close" onClick={handleClose}></button>
                        </div>

                        <div className="card-body">

                            <div className="mb-3" style={{ display: "flex", alignItems: "center" }}>
                                <span className="time-tracker-button"><i className="fa-solid fa-dollar-sign"></i></span>
                                <p style={{ marginLeft: "0.5rem", marginBottom: "0" }}>Billable Item</p>
                            </div>
                            <div className="input-group mb-3">
                                <span className="input-group-text">
                                    <i className="fa-solid fa-note-sticky"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Add A Note"
                                    aria-label="note"
                                    aria-describedby="notes"
                                    value={note}
                                    onChange={(e) => { setNote(e.target.value) }}
                                />
                            </div>



                            <label>Start:{startInvalid && <em className="text-danger"> Invalid Start Date. </em>}</label>
                            <div className="input-group mb-3">

                                <span className="input-group-text">
                                    <i className="fa-solid fa-clock"></i>
                                </span>

                                <DateTimePicker className={`form-control ${startInvalid ? 'is-invalid' : ''}`} onChange={handleDateStartChange} value={startDateTime} disableClock />
                            </div>

                            <label>End:{endInvalid && <em className="text-danger"> Invalid End Date. </em>}</label>
                            <div className="input-group mb-3">

                                <span className="input-group-text"><i className="fa-solid fa-clock"></i></span>
                                <DateTimePicker className={`form-control ${endInvalid ? 'is-invalid' : ''}`} onChange={handleDateEndChange} value={endDateTime} disableClock />

                            </div>


                            <label>Duration:</label>

                            <div className="input-group mb-3">
                                <span className="input-group-text"><i className="fa-solid fa-clock"></i></span>

                                <FieldsTimeInput callBack={handleBlur} defaultValue={inputValue} />


                            </div>

                            <div className="container">
                                <div className="d-flex align-items-center">
                                    <div className="mx-auto">
                                        <button type="button" className="btn btn-success btn-lg" onClick={handleSubmitClick} >Save Changes</button>
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>
                )
            }

        </>
    );
}

export default FloatingCard;

{
    /* Date Picker 
    <div className="mb-3">

        <small>When:</small>

        <span style={{
            transition: "all .2s cubic-bezier(.785,.135,.15,.86) 0s",

            borderBottomColor: "#fff",
            cursor: "pointer",
            borderBottom: "1px dashed",
            marginLeft: "4px",
        }}

        >

            <small>{}</small>

        </span>


        {
        showDatePicker && (
            <Form.Control
                type="date"
                value={selectedDate}


            />
        )}

    </div>*/
}