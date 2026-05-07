import { useState, useEffect, useContext } from 'react';
import TaskTabs from './TaskTabs';
import axios from 'axios';
import { Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import TaskCreate from '../TaskCreate';
import {DataContext} from '../../../Contexts/DataContext';

export default function TaskView({ taskId, taskName, listId, options, prevUrl, closeModal }) {

    //console.log("The Task Name Is" , taskName);
    const { globalData } = useContext(DataContext);

    const [tabData, setTabData] = useState([]);

    // useEffect to trigger async fetch and state update after component mounts
    useEffect(() => {
        
        const getTask = async () =>{

            try {
   
                const response = await axios.get(`https://${globalData.api_url}/task/${taskId}`, { withCredentials: true });
                console.log(response);
                setTabData([{
                    eventKey: taskId,
                    title: response.data.basic.title,
                }]);    

                if( !listId ) listId = response.data.basic.list_hash;

            } catch (error) {

                console.error(error);
            }
        }

        getTask();

    }, []); // Empty dependency array ensures it runs once on mount
    

    // Initialize with the first tab
    const [activeTab, setActiveTab] = useState(taskId);

    const handleAddTab = ( data ) => {

        //console.log( "handleAddTab",  data );

        let task_id = data.info.task_id;
        let task_name = data.info.task_name;

        //  Check To Make Sure That There's No Duplicate Key Already For The Task 
        //  Otherwise Display The Tab Instead
        const isDuplicate = tabData.some(tab => tab.eventKey === task_id);

        if( !isDuplicate ) {

            const newTab = {
                eventKey: task_id, 
                title: task_name,
            };

            //Handle Make sure the new task_id event key doesn't exists
            setTabData([...tabData, newTab]);
        }

        setActiveTab(task_id);

    };

    const handleTabSelect = (eventKey) => {
        setActiveTab(eventKey);
    };

    console.log(listId);
    return (
        
        tabData && (

            <Modal.Body>
                <ul className="nav nav-tabs tab-buttons-container" id="uncontrolled-tab-example">
                    {tabData.map(tab => (
                        <li className="nav-item" key={tab.eventKey}>
                            <button
                                className={`nav-link ${activeTab === tab.eventKey ? 'active' : ''}`}
                                onClick={() => handleTabSelect(tab.eventKey)}
                                type="button"
                                role="tab"
                                data-bs-toggle="tab"
                                data-bs-target={`#content-${tab.eventKey}`}
                                aria-controls={`content-${tab.eventKey}`}
                                aria-selected={activeTab === tab.eventKey ? 'true' : 'false'}
                            >
                                {tab.title}
                            </button>
                        </li>
                    ))}

                    <li className="nav-item">
                        <button
                            className={`nav-link`}
                            type="button"
                            role="tab"
                            data-bs-toggle="tab"
                            data-bs-target='#add-task'
                            onClick={() => handleTabSelect('add-task')}
                            aria-selected ='false'
                        >
                            <span className="text-success"><FontAwesomeIcon icon={faPlus} /> Add Subtask</span>
                        </button>
                    </li>

                </ul>

                <div className="tab-content">
                    
                    {tabData.map(tab => (
                        <div className={`tab-pane fade ${activeTab === tab.eventKey ? 'show active' : ''}`} id={`content-${tab.eventKey}`} role="tabpanel" key={tab.eventKey}>
                            <TaskTabs taskId={tab.eventKey} addTaskView={handleAddTab} />
                        </div>
                    ))}

                    <div className={`tab-pane fade ${activeTab === 'add-task' ? 'show active' : ''}`} id="add-task" role="tabpanel">
                        <TaskCreate listId={listId} parentId={taskId} endAction={handleAddTab}/>
                    </div>
                    
                </div>
            </Modal.Body>

        )
    );
}

