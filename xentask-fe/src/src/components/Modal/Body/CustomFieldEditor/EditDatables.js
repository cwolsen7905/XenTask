import { useState, forwardRef, useImperativeHandle, useCallback } from "react";
import { useNavigate } from 'react-router-dom';

export default forwardRef(function EditDatables({ options, table,  multiSelect , hidden = false, closeModal }, ref) {

    const [selectedTable, setSelectedTable] = useState(table);
    const [isMultiSelect, setMultiSelect] = useState(multiSelect || false );

    console.log(selectedTable);
    console.log(isMultiSelect);

    const navigate = useNavigate();

    //  The Options For This Custom Field And Also What Will Be Stored In The DB
    const getItems = useCallback(() => {

        return {
            table: selectedTable,
            multiSelect: isMultiSelect
        };

    }, [ selectedTable, isMultiSelect ]);

    useImperativeHandle(ref, () => {
        return {
            getItems,
        };
    });

    return (

        <div>

            <div class="form-check mb-2">
                <input class="form-check-input" type="checkbox" checked={isMultiSelect} onChange={()=>{setMultiSelect(!isMultiSelect)}} />
                <label class="form-check-label" for="flexCheckDefault">
                    Multi Select
                </label>
            </div>

            {
                ( options && !hidden ) && (
                    <select
                        className="form-select"
                        onChange={(e) => setSelectedTable(e.target.value)}
                        defaultValue={table}
                    >
                        {
                            options.map((item) => {
                                return (
                                    <option value={item.id}>{item.label}</option>
                                )
                            })
                        }
                    </select>
                )
            }

            <button
                type="button"
                className="btn btn-primary w-100 mt-2"

                onClick={() => {
                    navigate('/contacts/contacts');
                    closeModal();
                }}
            >
                Edit Table
            </button>



        </div>

    );

});