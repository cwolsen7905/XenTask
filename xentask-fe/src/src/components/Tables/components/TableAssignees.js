import { useState, useEffect } from "react";
import FieldsAssignees from "../../Fields/FieldsAssignees";

const TableDropdown = ( { getValue, onChange, items, row, table, column  } ) => {

    const { updateData } = table.options.meta;

    const initialValue = getValue();
    
    const [value, setValue] = useState(initialValue);
  
    // If the initialValue is changed external, sync it up with our state
    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    const selected = items.filter((item) => {
        let _id = item.id;
        return initialValue.includes(_id);
    });

    function handleChange(value) {

        if( onChange ) onChange( value );

        //  We Need To Update The Table Data So Sorting Can Work Properly
        let _tableData = value.current.map((item)=>{
            return item.id;
        });
 
        updateData( row.index, column.id, _tableData );
    }

    return (
         <FieldsAssignees selected={selected} fetchUser={false} fieldCallback={handleChange}/>
    );

};

export default TableDropdown;
