import { useState, useEffect } from "react";
import FieldsDatatables from "../../Fields/FieldsDatatables";

const TableDatatables = ( { 
    getValue, 
    options,  
    datatables,
    setDataTables, 
    onChange, 
    row, 
    table, 
    column   
}) => {

    const initialValue = getValue();
    
    const [value, setValue] = useState( initialValue || [] );
    const [tableData, setTableData] = useState(datatables[options.table]||{});

    const { updateData } = table.options.meta;

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    useEffect(() => {
        setValue(datatables[options.table]);
    }, [datatables]);

    function handleChange(value){
        
        if( onChange ) onChange( value );
        updateData( row.index, column.id, value );

    }

    
    if( !tableData ) return;

    return (
        <FieldsDatatables
            options={options}
            tableData={tableData}
            value={value}
            setDataTables={setDataTables}
            callBack={handleChange}
            //showError={errorFields.includes( item.hash || item.id )}
          />
    );

};

export default TableDatatables;
