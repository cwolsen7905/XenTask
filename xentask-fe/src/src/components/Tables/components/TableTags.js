import { useState, useEffect } from "react";
import FieldsLabel from "../../Fields/FieldsLabel";

const TableDropdown = ( { getValue, items, onSelectAction, onChange, row, table, column   } ) => {

    const initialValue = getValue();
    
    const [value, setValue] = useState(initialValue);

    const { updateData } = table.options.meta;
  
    // If the initialValue is changed external, sync it up with our state
    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    const dropDownData = {
        value: value ? value : [],
        options: [...items]
    };

    function handleChange(value){
        
        if( onChange ) onChange( value );
        updateData( row.index, column.id, value );
    }

    return (
        <FieldsLabel data={dropDownData} callBack={handleChange}/>
    );

};

export default TableDropdown;
