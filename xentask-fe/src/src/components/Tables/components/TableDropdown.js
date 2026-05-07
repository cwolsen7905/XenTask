import { useState, useEffect } from "react";
import FieldsDropdown from "../../Fields/FieldsDropdown";

const TableDropdown = ( { getValue, onChange, items, row, table, column  } ) => {

    const initialValue = getValue();
    
    const [value, setValue] = useState(initialValue);

    const { updateData } = table.options.meta;

    // If the initialValue is changed external, sync it up with our state
    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    const dropDownData = {
        value: value,
        options: [...items]
    };

    function handleChange(value) {
        if( onChange ) onChange( value.id || value.hash );
        updateData( row.index, column.id, ( value.id || value.hash ) );
    }

    return (
        <FieldsDropdown data={dropDownData} callBack={handleChange}/>
    );

};

export default TableDropdown;
