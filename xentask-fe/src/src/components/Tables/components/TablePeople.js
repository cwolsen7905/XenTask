import { useState, useEffect } from "react";
import FieldsUser from "../../Fields/FieldsUser";

const TablePeople = ( { getValue, items, onSelectAction, onChange, row, table, column   } ) => {

    const initialValue = getValue();
    
    const [value, setValue] = useState(initialValue);

    const { updateData } = table.options.meta;
  
    // If the initialValue is changed external, sync it up with our state
    useEffect(() => {
        setValue(initialValue || []);
    }, [initialValue]);

    function handleChange(value){
        //console.log('tagInputValue',value);
        if( onChange ) onChange( value );
        updateData( row.index, column.id, value );
    }


    return (
        <FieldsUser selected={initialValue }  callBack={handleChange}/>
    );

};

export default TablePeople;
