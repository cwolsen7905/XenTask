import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import FieldsDropdown from '../../../Fields/FieldsDropdown';
import FieldsLabel from '../../../Fields/FieldsLabel';
import { customFieldsIcons } from '../../../../Utils/FieldsUtil';
import FieldsDate from '../../../Fields/FieldsDate';
import FieldsAssignees from '../../../Fields/FieldsAssignees';
import FieldsUser from '../../../Fields/FieldsUser';

export default function FilterItem({ id, item, filterDropdownOptions, deleteItem, onFilterItemChange }) {

    // Columns Dropdown
    var columns = {
        value: '',
        options: [...filterDropdownOptions],
    };

    columns.value = item.column || '';

    const [columnSelected, selectColumn] = useState( columns.options.find( (e) => e.id == item.column ) || null );
    const [clause, setClause] = useState( item.clause || null );
    const [clauseItems, setClauseItems] = useState({});
    const [values, setValue] = useState( item.value || null );


    //  Setup Clause Dropdowns When A Column Is Selected
    var excludeExtraModifiers = ['created_by', 'status', 'date'];

    // Does Not Need A Clause
    var excludeModifiers = ['checkbox'];

    //  Update The Dropdown Item Depending On The Type
    useEffect(() => {

        if (columnSelected == undefined) return;

        setClause(null);
        setClauseItems(null);

        let newItems = {
            value: 'equals',
            options: [
                {
                    id: 'equals',
                    label: 'Equals'
                },
                {
                    id: 'not_equals',
                    label: 'Is Not Equal'
                }
            ]
        };

        if (columnSelected.type === 'date') {

            newItems.options.push(
                {
                    id: 'between',
                    label: 'Between'
                },
                {
                    id: 'not_between',
                    label: 'Not Between'
                }
            );
        }

        if (columnSelected.type === 'number' || columnSelected.type === 'currency' || columnSelected.type === 'slider' ) {

            newItems.options.push(
                {
                    id: 'greater_than',
                    label: 'Greater Than'
                },
                {
                    id: 'less_than',
                    label: 'Less Than'
                },
                {
                    id: 'less_than_equal_to',
                    label: 'Less Than Or Equal To'
                },
                {
                    id: 'greater_than_equal_to',
                    label: 'Greater Than Or Equal To'
                }
            );
        }

        if (
            columnSelected.type === 'text' ||
            columnSelected.type === 'link' ||
            columnSelected.type === 'phone'
        ) {

            newItems.value = 'contains';
            newItems.options = [
                {
                    id: 'contains',
                    label: 'Contains'
                },
                {
                    id: 'does_not_contain',
                    label: 'Does Not Contain'
                }
            ];
        }

        if ( columnSelected.type === 'people' || columnSelected.type === 'labels' ) {

            newItems.options.push(
                {
                    id: 'contains',
                    label: 'Contains'
                },
                {
                    id: 'does_not_contain',
                    label: 'Does Not Contain'
                }
            );
        }

        if (!excludeExtraModifiers.includes(columnSelected.type)) {

            newItems.options.push(
                {
                    id: 'is_set',
                    label: 'Is Set'
                },
                {
                    id: 'is_not_set',
                    label: 'Is Not Set'
                }
            );
        }

        setClauseItems(newItems);

        // Run onFilterItemChange once whenever columnSelected changes
        onFilterItemChange(id, 'clause', newItems.value);

    }, [columnSelected]);

    //  Template For The First Dropdown 
    const columnSelectDropdownTpl = (option) => {

        return (
            <span>
                <span className="me-2">{customFieldsIcons(option.type)}</span>
                {option.label}
            </span>
        );

    }

    const returnClause = (item) => {
        setClause(item.id);
        onFilterItemChange(id, 'clause', item.id);
    }

    const displayClauseField = () => {

        if ( !excludeModifiers.includes(columnSelected.type) ) {

            return (
                <div className="col">
                    <FieldsDropdown
                        data={clauseItems}
                        className="me-2 mb-2"
                        itemTemplate={
                            (option) => {
                                if (option !== undefined) {
                                    return (option.label)
                                } else {
                                    console.error("No Label Found For", option);
                                }
                            }
                        }
                        hasSearch={false}
                        dropdownBtnstyles={{ width: 200 }}
                        dropdownMenuStyles={{ minWidth: 230 }}
                        callBack={returnClause}
                    />
                </div>
            );
        }
    }

    const displayValueField = () => {

        let _items = {};
        //console.log(columnSelected.type);
        switch (columnSelected.type) {

            case ('status'):
                let labels = {
                    value: values || [],
                    options: [...columnSelected.options]
                }

                return (
                    <div className="col">
                        <div className="form-control me-2 mb-2" style={{ width: 200 }}>
                            <FieldsLabel
                                data={labels}
                                className="me-2"
                                callBack={setValueField}
                            />
                        </div>
                    </div>
                );

            case ('checkbox'):
                _items = {
                    value: 'is_checked',
                    options: [
                        {
                            id: 'is_checked',
                            label: 'Is Checked',
                        },
                        {
                            id: 'not_checked',
                            label: 'Not Checked',
                        }
                    ]
                };
    
                return (
                    <div className="col">
                        <FieldsDropdown
                            data={_items}
                            className="me-2 mb-2"
                            dropdownBtnstyles={{ width: 100 + "%" }}
                            itemTemplate={
                                (option) => { return (option.label) }
                            }
                            callBack={setValueField}
                        />
                    </div>
                )
            break;

            case ('dropdown'):
                case ('priority'):

                    _items = {
                        value: values || columnSelected.options[0].id,
                        options: [...columnSelected.options]
                    };
        
                    return (
                        <div className="col">
                            <FieldsDropdown
                                data={_items}
                                className="me-2 mb-2"
                                dropdownBtnstyles={{ minWidth: 200 }}
                                callBack={setValueField}
                            />
                        </div>
                    );
            
            case ('labels'):

                _items = {
                    value: values || [],
                    options: [...columnSelected.options]
                };
    
                return (
                    <div className="col-auto" style={{ minWidth: 200 }}>
    
                        <div className="form-control me-2" style={{ width: 200 }}>
                            <FieldsLabel
                                data={_items}
                                className="me-2 mb-2"
                                callBack={setValueField}
                            />
                        </div>
                    </div>
                );

            case ('date'):
                return (
                    <>
                        <div className="col">
                            <FieldsDate className="mb-2" callBack={
                                (selectedDate) => {
                                    getDate('start', selectedDate)
                                }
                            } />
                        </div>
    
                        {
                            (clause == 'between' || clause == 'not_between') && (
                                <div className="col">
                                    <FieldsDate className="mb-2" callBack={
                                        (selectedDate) => {
                                            getDate('end', selectedDate)
                                        }
                                    }
                                    />
                                </div>
                            )
                        }
                    </>
                );
            
            case ('number'):
                case ('currency'):
                    return (
                        <div className="col">
                            <input 
                                type="number" 
                                className="form-control mb-2" 
                                style={{ minWidth: 200 }} 
                                onChange={(e) => setValueField(e.target.value)}
                                value={values||0}
                            />
                        </div>
                    );
            
            case('users'):

                return (
                    <div className="col">
                        <FieldsAssignees
                            className="me-2 mb-2"
                            callBack={setValueField}
                            fetchUser={false}
                            usersList={[...columnSelected.options]}
                            selected={values || []}
                            styles={{minWidth:250}}
                            placeholder={"Select A User"}
                        />
                    </div>
                )
            
            case('people'):

                return (
                    <div className="col">
                        <FieldsUser
                            className="me-2 mb-2"
                            callBack={setValueField}
                            styles={{minWidth:250}}
                        />
                    </div>
                )

            default:
                return (
                    <div className="col">
                        <input 
                            type="text" 
                            className="form-control mb-2" 
                            style={{ minWidth: 200 }} 
                            onChange={(e) => setValueField(e.target.value)}
                            value = {values || ''}
                        />
                    </div>
                );

        }
        /*
        if (columnSelected.type == 'status') {

            let labels = {
                value: [],
                options: [...columnSelected.options]
            }

            return (
                <div className="col">
                    <div className="form-control me-2 mb-2" style={{ width: 200 }}>
                        <FieldsLabel
                            data={labels}
                            className="me-2"
                            callBack={setValueField}
                        />
                    </div>
                </div>
            )

        } else if (columnSelected.type == 'checkbox') {

            let items = {
                value: 'is_checked',
                options: [
                    {
                        id: 'is_checked',
                        label: 'Is Checked',
                    },
                    {
                        id: 'not_checked',
                        label: 'Not Checked',
                    }
                ]
            };

            return (
                <div className="col">
                    <FieldsDropdown
                        data={items}
                        className="me-2 mb-2"
                        dropdownBtnstyles={{ width: 100 + "%" }}
                        itemTemplate={
                            (option) => { return (option.label) }
                        }
                        callBack={setValueField}
                    />
                </div>
            )

        } else if (columnSelected.type == 'dropdown' || columnSelected.type == 'priority') {

            let items = {
                value: columnSelected.options[0].id,
                options: [...columnSelected.options]
            };

            return (
                <div className="col">
                    <FieldsDropdown
                        data={items}
                        className="me-2 mb-2"
                        dropdownBtnstyles={{ minWidth: 200 }}
                        callBack={setValueField}
                    />
                </div>
            )

        } else if (columnSelected.type == 'labels') {

            let items = {
                value: [],
                options: [...columnSelected.options]
            };

            return (
                <div className="col-auto" style={{ minWidth: 200 }}>

                    <div className="form-control me-2" style={{ width: 200 }}>
                        <FieldsLabel
                            data={items}
                            className="me-2 mb-2"
                            callBack={setValueField}
                        />
                    </div>
                </div>
            )

        } else if (columnSelected.type == 'date') {

            return (
                <>
                    <div className="col">
                        <FieldsDate className="mb-2" callBack={
                            (selectedDate) => {
                                getDate('start', selectedDate)
                            }
                        } />
                    </div>

                    {
                        (clause == 'between' || clause == 'not_between') && (
                            <div className="col">
                                <FieldsDate className="mb-2" callBack={
                                    (selectedDate) => {
                                        getDate('end', selectedDate)
                                    }
                                }
                                />
                            </div>
                        )
                    }
                </>
            );

        } else if (columnSelected.type == 'number' || columnSelected.type == 'currency') {

            return (
                <div className="col">
                    <input type="number" className="form-control mb-2" style={{ minWidth: 200 }} onChange={(e) => setValueField(e.target.value)} />
                </div>
            );

        } else {

            return (
                <div className="col">
                    <input type="text" className="form-control mb-2" style={{ minWidth: 200 }} onChange={(e) => setValueField(e.target.value)} />
                </div>
            );

        }*/
    }

    // Callbacks
    const getSelectedColumn = (item) => {
        setClause(null);
        setValue(null);
        setClauseItems({});
        selectColumn(item);
        onFilterItemChange(id, 'column', item.id);
    }

    const setValueField = (value) => {

        //  All Dropdown Options Should Return An Object Which Should Have An Id Field
        //  However Lables Returns An Array And Everything Else Either A String or Number
        //  The Only One That's Different Here Is Date Since It Can Have 2 Values

        let _value = (
            typeof value === 'object' &&
            value !== null &&
            !Array.isArray(value) &&
            (columnSelected.id !== 'due_date' && columnSelected.type != 'date')
        ) ? value.id : value;

        setValue(_value);

        onFilterItemChange(id, 'value', _value);
    }

    //  Field Should Be A String 'start' or 'end'
    const getDate = (field, value) => {

        let newValues = { ...values };

        newValues[field] = value;

        setValueField(newValues);

    }


    // Adds Additional Columns
    return (
        <>
           {/* <p>Value Selected:{JSON.stringify(values)}</p>*/}
            <div className="row align-items-center mb-2">

                <div className="col">
                    <FieldsDropdown
                        className="me-2 mb-2"
                        data={columns}
                        dropdownBtnstyles={{ minWidth: 200 }}
                        itemTemplate={columnSelectDropdownTpl}
                        callBack={getSelectedColumn}
                    />
                </div>

                {
                    columnSelected && (
                        <>
                            {clauseItems.options && clauseItems.options.length > 0 && (
                                displayClauseField()
                            )}

                            {
                                (clause !== 'is_set' && clause !== 'is_not_set') && (
                                    displayValueField()
                                )
                            }
                        </>
                    )
                }

                <div className="col">
                    <button className="btn btn-danger ml-2 mb-2" onClick={() => deleteItem(id)} >
                        <FontAwesomeIcon icon={faTrash} />
                    </button>
                </div>

            </div>
            <hr />
        </>
    )
}