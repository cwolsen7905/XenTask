import { useState, useEffect } from "react";

const TableCheckbox = ({ getValue, row, column, table, externalChangeAction, callBack, onChange }) => {

    const [isChecked, setChecked] = useState( getValue() );

    const { updateData } = table.options.meta;

    // If the initialValue is changed externally, sync it up with our state
    useEffect(() => {
        setChecked(getValue());
    }, [getValue]);

    const handleCheckboxChange = () => {

        const newValue = !isChecked; 
        // We use the callback action here so we can have the table data updated 
        // useEffect Will Sync Up Any Changes And Check The Box For Us
        // the Callback will also handle DB Updates That We need to do
        if( externalChangeAction ) { 

            externalChangeAction( ( row.original.id || row.original.hash), column.id, newValue );

        } else {

            updateData(row.index, column.id, newValue);

        }

       
        if( onChange ) onChange( newValue );
    
    };

    return (
        <input
            type="checkbox" 
            className="form-check-input"
            checked={isChecked} 
            onChange={handleCheckboxChange}
        />
    );
};

export default TableCheckbox;
