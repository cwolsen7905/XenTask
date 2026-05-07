import { useState, useEffect } from "react";

const TableButton = ({ className, getValue, onClickAction, row }) => {

    const initialValue = getValue();

    const [value, setValue] = useState(initialValue);

    console.log("Row Original", row.original);

    // If the initialValue is changed external, sync it up with our state
    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    return (

        <a
            href={`/task/${row.original.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
                if (e.button === 0) {
                    // Prevent navigation on left click
                    e.preventDefault();
                    onClickAction();
                }
            }}
        >
            {value}
        </a>
    );

};
export default TableButton;