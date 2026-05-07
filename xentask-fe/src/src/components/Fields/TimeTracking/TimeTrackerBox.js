import Form from 'react-bootstrap/Form';
import React, { useState,useContext } from 'react';
import FieldsTimeInput from './FieldsTimeInput';
import { DataContext } from '../../Contexts/DataContext';
import axios from 'axios';

const TimeTrackerInput = ({ saveEntry, taskId }) => {

    const { globalData } = useContext(DataContext);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [inputDate, setDate] = useState('now'); // Provide your desired default date
    const [timeEntry, setTimeEntry] = useState(0); // New state

    const handleSpanClick = () => {
        setShowDatePicker(!showDatePicker);
    };

    const handleBlur = () => {

        setShowDatePicker(false); // Close the date picker
    };


    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
        setDate(e.target.value);
    };

    const handleSaveClick = async (e) => {
        
        e.preventDefault();

        let _data = {
            date: selectedDate,
            time: timeEntry
        }

        try {

            let _url = `https://${globalData.api_url}/task/${taskId}/time`;
            let response = await axios.post( _url, JSON.stringify(_data), { withCredentials: true } );

            if( response.status == 200 ){

                // Handle the save button click event
                saveEntry(response.data);

            } 
            
        } catch (error) {
            console.error(error);
        }

   
    };


    const updateTimeEntry = (value) => {
        setTimeEntry(value);
    }


    return (

        <div className="custom-select-search-container" style={{ borderBottom: "1px dashed" }}>

            <form onSubmit={handleSaveClick}>

                <FieldsTimeInput required={true} callBack={updateTimeEntry}/>

                {/* Track Time For A Date */}
                <div className="p-2">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>

                        <div className="div-left">

                            <small>When:</small>

                            <span style={{
                                transition: "all .2s cubic-bezier(.785,.135,.15,.86) 0s",

                                borderBottomColor: "#fff",
                                cursor: "pointer",
                                borderBottom: "1px dashed",
                                marginLeft: "4px",
                            }}
                                onClick={handleSpanClick}
                            >

                                <small>{inputDate}</small>

                            </span>


                            {showDatePicker && (
                                <Form.Control
                                    type="date"
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    onBlur={handleBlur}
                                />
                            )}

                        </div>

                        <div className="div-right" style={{ display: "inline-flex" }}>
                            <span className="time-tracker-button"><i className="fa-solid fa-note-sticky"></i></span>
                            <span className="time-tracker-button"><i className="fa-solid fa-tag"></i></span>
                            <span className="time-tracker-button"><i className="fa-solid fa-dollar-sign"></i></span>
                        </div>

                    </div>
                </div>

                <div>
                    <button type="submit" className="btn btn-success">Save</button>
                </div>
            </form>
        </div>
    );

};
export default TimeTrackerInput;
