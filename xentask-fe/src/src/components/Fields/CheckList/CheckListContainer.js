import { useState, useRef, forwardRef, useImperativeHandle, useCallback,useContext } from 'react';
import Checklist from './CheckList';
import FieldsInput from '../FieldsInput';
import { v4 as uuidv4 } from "uuid"
import { DataContext } from '../../Contexts/DataContext';
import axios from 'axios';

export default forwardRef(function CheckListContainer({ data, taskId, createTask = false }, ref) {

    const { globalData } = useContext(DataContext);

    const [checkLists, setCheckLists] = useState(data || []);

    const inputRef = useRef();

    const getItems = useCallback(() => {
        return checkLists
    }, [checkLists]);

    useImperativeHandle(ref, () => {
        return {
            getItems,
        };
    });

    const addChecklist = async () => {

        if (createTask) {

            const newChecklist = {
                id: uuidv4(), // Generate a unique ID
                name: "New Checklist",
                items: []
            };

            setCheckLists(prevChecklists => [...prevChecklists, newChecklist]);

        } else {

            try {

                let _url = `https://${globalData.api_url}/task/${taskId}/checklist`;

                let _data = {
                    name: "New Checklist",
                }

                const response = await axios.post( _url, JSON.stringify(_data), { withCredentials: true } );
                
                if( response.status == 200 ){

                    const newChecklist = {
                        id: response.data.checklist_hash,
                        name: "New Checklist",
                        items: [],
                    };
        
                    setCheckLists(prevChecklists => [...prevChecklists, newChecklist]);

                }

            } catch (error) {

                console.error(error);

            }

        }

    };

    const getCheckListItems = (id, items) => {
        setCheckLists(prevCheckLists => {
            return prevCheckLists.map(checkList => {
                if (checkList.id === id) {
                    return { ...checkList, items };
                }
                return checkList;
            });
        });
    };

    const deleteChecklist = async (checklistId) => {

        setCheckLists(prevChecklists => prevChecklists.filter(checklist => checklist.id !== checklistId));

        if (!createTask) {

            try {

                let _url = `https://${globalData.api_url}/task/${taskId}/checklist/${checklistId}`;

                const response = await axios.delete( _url, { withCredentials: true } );

            } catch (error) {

                console.error(error);

            }
        }

    };

    const updateCheckListName = async (id, name) => {

        setCheckLists(prevCheckLists =>
            prevCheckLists.map(checkList =>
                checkList.id === id
                    ? { ...checkList, name }
                    : checkList
            )
        );

        //  Update The Name If We're Not Making A New Task
        if (!createTask) {

            try {

                let _url = `https://${globalData.api_url}/task/${taskId}/checklist`;

                let _data = {
                    checklist_id: id,
                    name: name,
                }

                const response = await axios.put(_url, JSON.stringify(_data), { withCredentials: true });

                if (response.status == 200) {

                }

            } catch (error) {

                console.error(error);

            }
        }

    };

    return (
        <div className="p-3">
            {checkLists.map((checklist) => (
                <div key={checklist.id} className="card mb-3">
                    <div className="card-header">
                        <div className="d-flex align-items-center small">
                            <i className="fa-solid fa-list-check me-1"></i>
                            <FieldsInput type={'text'} value={checklist.name} styles={{ width: '50%' }} callBack={(value) => updateCheckListName(checklist.id, value)} />
                            <button className="btn btn-danger" onClick={() => deleteChecklist(checklist.id)}>
                                <i className="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <Checklist taskId={taskId} id={checklist.id} name={checklist.name} createTask={createTask} items={checklist.items} getCheckListItems={getCheckListItems} />
                </div>
            ))}
            <div className="mb-3">

                <button className="btn btn-success btn-sm ms-2" type="button" onClick={addChecklist}>Add Checklist</button>
            </div>
        </div>
    );
});

// Initial checklists
/*{
    id: "001",
    name: "CheckList 1",
    items: [
        { id: "001", name: 'Item 1', checked: false },
        { id: "002", name: 'Item 2', checked: false },
        { id: "003", name: 'Item 3', checked: false }
    ]
},
{
    id: "002",
    name: "CheckList 2",
    items: [
        { id: "004", name: 'Item 1', checked: false },
        { id: "005", name: 'Item 2', checked: false },
        { id: "006", name: 'Item 3', checked: false }
    ]
}*/