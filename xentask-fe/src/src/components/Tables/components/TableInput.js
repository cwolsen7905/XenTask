import { useState, useEffect } from "react";
import FieldsInput from "../../Fields/FieldsInput";

const TableDropdown = ( { getValue, options, type, onChange, row, table, column   } ) => {

    const initialValue = getValue();
    
    const [value, setValue] = useState(initialValue);

    const { updateData } = table.options.meta;

    // If the initialValue is changed external, sync it up with our state
    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    function handleChange(value){
        if( onChange ) onChange( value );
        updateData( row.index, column.id, value );
    }

    return (
        <FieldsInput type={type} value={value} options={options} callBack={handleChange}/>
    );

};

export default TableDropdown;
