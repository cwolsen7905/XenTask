import { useState, useEffect } from "react";

const TableInputDiv = ( { initValue, docId, row, table, column, updateColumn } ) => {

    useEffect(() => {
        setValue(initValue);
    }, [initValue]);

    const [originalValue, setOriginalValue] = useState(initValue || '');

    const [value, setValue] = useState(initValue || '');
    
    const { updateData } = table.options.meta;

    //console.log("header",header);
    // If the initialValue is changed external, sync it up with our state

    function handleChange(e) {

        console.log("Value Change",originalValue,value);

        if( updateColumn && value != originalValue ) {
            
            updateColumn( docId, column.id, value );

        }

        updateData( row?.index, column.id, value );

    }

    return (
        <input className="form-control" 
            value={value} 
            onFocus={(e)=>{setOriginalValue(e.target.value)}}
            onChange={(e)=>{setValue(e.target.value)}}
            onBlur={handleChange}
        />
    );

};

export default TableInputDiv;
