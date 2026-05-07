import { useSortable } from "@dnd-kit/sortable"
import React, { useState } from "react"
import { CSS } from "@dnd-kit/utilities"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useData } from '../Contexts/DataContext';

import { customFieldsIcons } from '../../Utils/FieldsUtil'
import {

    faAlignLeft,
    faCircleUser,
    faCalendarDays,
    faFlag,
    faEllipsis
} from '@fortawesome/free-solid-svg-icons';

import Popover from 'react-bootstrap/Popover';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import FieldsAssignees from "../Fields/FieldsAssignees";
import FieldsDate from "../Fields/FieldsDate";
import FieldsDropdown from "../Fields/FieldsDropdown";
import FieldsLabel from "../Fields/FieldsLabel";
import FieldsSlider from "../Fields/FieldsSlider";
import FieldsInput from "../Fields/FieldsInput";
import FieldsUser from "../Fields/FieldsUser";

const KanbanItem = ({
    data,
    parentContainer,
    openTaskModal,
    allFields,
    taskCustomFields,
    priority,
    columnVisibility,
    updateField,
    style,

}) => {

    const { title } = data;

    //  Data Context
    const { globalData } = useData();

    const {
        attributes,
        setNodeRef,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: data.id,
        data: {
            type: "item",
            parentContainer: parentContainer,
            task: data,
        }
    });

    const getField = (e) => {

        const { key, type, fieldType } = e;

        const onChange = (value) => updateField({
            task_id: data.hash,
            type: fieldType,
            fieldName: key,
            value: value
        });

        let _data = {
            value: data[key],
            options: taskCustomFields[key]?.options
        },
            _element = '';

        try {

            switch (type) {

                case ('dropdown'):
                case ('labels'):

                    if (key == 'priority') {

                        _data = {
                            value: data.priority || 'priority-none',
                            options: priority
                        }

                    } 

                    _element = type == 'dropdown' ? 
                    <FieldsDropdown 
                        data={_data} 
                        callBack={(value) =>{
                            onChange( value.id || value.hash );
                        }}/> 
                        : 
                    <FieldsLabel data={_data} callBack={onChange}/>

                    break;

                case ('date'):
                    _element = <FieldsDate date={data[key]} callBack={onChange}/>
                    break;

                case ('users'):
               
                    _element = (
                        <FieldsAssignees
                            selected={globalData.WORKSPACE_USERS.filter((item) => {
                                let _id = item.id;
                                return data[key].includes(_id);
                            })}
                            usersList={globalData.WORKSPACE_USERS}
                            fieldCallback={ (value) => onChange(value)}
                        />
                    );
                break;

                case ('slider'):

                    _data = {
                        value: data[key],
                        options: taskCustomFields[key].options
                    };

                    _element = <FieldsSlider options={_data} callBack={onChange}/>

                    break;


                case 'text':
                case 'number':
                case 'currency':
                case 'phone':
                case 'link':
                    let inputOptions = [];

                    if (type == 'currency') {
                        inputOptions = { currency: taskCustomFields[key].currency, ...taskCustomFields[key].options };
                    } else {
                        inputOptions = taskCustomFields[key].options;
                    }

                    _element =  <FieldsInput type={type} value={ data[key] ? data[key] : 0 } options={inputOptions} callBack={onChange}/>
                break;

                case ('people'):
                    _element = (
                        <FieldsUser selected={data[key]} callBack={onChange}/>
                    );
                break;
            }

        } catch (error) {
           // console.log('Failed For Element', e);
           // console.log("Current Data",data[key]);
           // console.log(error)
            
        }

        return _element;

    }


    return (
        <div style={{ ...style }}>
            <div
                {...attributes}
                {...listeners}
                ref={setNodeRef}
                style={{
                    transition,
                    transform: CSS.Translate.toString(transform)
                }}
                className="card task-card mt-2"
            >

                <div class="card-header d-flex justify-content-between align-items-center">

                    <button
                        className="btn btn-link d-inline-block text-truncate"
                        style={{ maxwidth: 150 }}
                        onClick={() => { openTaskModal(data) }}
                    >
                        <h5>{title}</h5>
                    </button>
                    <button className="btn btn-outline-secondary btn-sm border-0"><FontAwesomeIcon icon={faEllipsis} /></button>
                </div>

                <div className="card-body">

                    {/* Description Always Persistent */}
                    <div className="row align-items-center mb-2">
                        <div className="col-auto">
                            <FontAwesomeIcon icon={faAlignLeft} />
                        </div>
                        <div className="col text-truncate">
                            <OverlayTrigger
                                trigger="click"
                                placement="auto"
                                rootClose="true"
                                overlay={
                                    <Popover style={{ minWidth: '400px', maxHeight: '400px', overflowY: 'auto', overflowX: 'hidden' }} >

                                        <Popover.Body>
                                            <div
                                                className="form-control ck-content"
                                                dangerouslySetInnerHTML={{ __html: data.description }}
                                            />

                                        </Popover.Body>
                                    </Popover>
                                }
                            >
                                <button className="btn btn-success mx-2 fs-5">
                                    Preview
                                </button>

                            </OverlayTrigger>

                        </div>
                    </div>

                    {
                        allFields.map((e) => {
                            // Don't Display Column If Its Hidden
                            if (!columnVisibility[e.key] || e.key == 'status') return;

                            return (

                                <div className="row align-items-center mb-2" key={e.key}>
                                    <div className="col-auto">
                                        <span title={e.title}>{customFieldsIcons(e.type)}</span>
                                    </div>
                                    <div className="col">
                                        {getField(e)}
                                    </div>
                                </div>

                            )
                        })
                    }
                </div>
            </div>
        </div>

    )

}

export default KanbanItem
