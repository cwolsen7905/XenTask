import React, { useState, useEffect  } from 'react';
import Form from 'react-bootstrap/Form';

function FieldsDate( {date, className, styles, callBack, showError} ) {
    
    const [inputDate, setDate] = useState( date || '' ); // Provide your desired default date
    const [isInvalid, setInvalid] = useState(showError);

    
    //  In Case This Was Changed Outside
    useEffect(() => {
        setInvalid(showError);
    }, [showError]);

    const handleDateChange = (event) => {

        const selectedDate = event.target.value;
        setDate(selectedDate); // Update the state with the selected date
        // Do something else with the selected date if needed
        if( callBack ) callBack(selectedDate);

    };

    return (
        <Form.Control className={`${className ? className : ''} ${isInvalid ? 'is-invalid' : ''}`}  type="date" value={inputDate} onChange={handleDateChange} style={{...styles}} />
    );
}

export default FieldsDate;
