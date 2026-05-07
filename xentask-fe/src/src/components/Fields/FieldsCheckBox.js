import { useState, useEffect } from "react";
import Form from 'react-bootstrap/Form';

const FieldsCheckBox = ( { value, callBack, required, showError=false } ) => {

    const [isChecked, setChecked] = useState(value);
    const [isInvalid, setInvalid] = useState(showError);

    //  In Case This Was Changed Outside
    useEffect(() => {
        setInvalid(showError);
    }, [showError]);

    const handleCheckboxChange = () => {
      
        if( callBack ) callBack(!isChecked);
        setChecked(!isChecked); 
 
    };


    return  <Form.Check isInvalid={isInvalid} type="checkbox" checked={isChecked}  onChange={handleCheckboxChange} />
    

}

export default FieldsCheckBox;