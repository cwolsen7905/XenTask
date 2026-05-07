import { useState, useEffect } from "react";
import FieldsDate from "../../Fields/FieldsDate";

const TableDatePicker = ( { getValue, onChange, row, table, column  } ) => {

    const initialValue = getValue();
    
    const [value, setValue] = useState(initialValue);
  
    const { updateData } = table.options.meta;

    // If the initialValue is changed external, sync it up with our state
    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    function handleChange(value){

        updateData( row.index, column.id, value );

        if( value.trim() == '' ) {
            value = '0000-00-00 00:00:00';
        }

        if( onChange ) onChange( value );
        
    }

    return (
        <FieldsDate date={value} callBack={handleChange}/>
    );

};

export default TableDatePicker;
