import { useState, useEffect } from "react";
import FieldsSlider from "../../Fields/FieldsSlider";

const TableSlider = ( { getValue, options,  onChange, row, table, column  } ) => {

    const initialValue = getValue();
    
    const [value, setValue] = useState(initialValue);

    const { updateData } = table.options.meta;

    // If the initialValue is changed external, sync it up with our state
    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    const sliderOptions = {value: value, ...options}

    function handleChange(value) {
        if( onChange ) onChange( value );
        updateData( row.index, column.id, value );
    }


    return (
        <FieldsSlider options={sliderOptions} callBack={handleChange}/>
    );

};
 
export default TableSlider;
