import { useParams } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import TaskView from '../../Modal/Body/TaskModal/TaskView';
import { useUI } from '../../Contexts/UIContext';
import { DataContext } from '../../Contexts/DataContext';

import axios from 'axios';

const Task = () => {

    const { globalData } = useContext(DataContext);
    const { id } = useParams();
    const [taskName, setTaskName] = useState('');
    const [listId, setListId] = useState(0);
    const [viewLoaded, setViewLoaded] = useState(false);
    const { showToastNotification } = useUI();


    useEffect(() => {

        async function getTaskView() {

            try {

                let _url = `https://${globalData.api_url}/task/${id}/view`;

                const response = await axios.get(_url, { withCredentials: true });

                if (response.status == 200) {

                    setTaskName(response.data.title);
                    setListId(response.data.list_hash);
                    setViewLoaded(true);
                    
                }

            } catch (error) {

                showToastNotification({
                    type: 'danger',
                    message: "Could Not Load Task Please Try Refreshing The Page",
                });

            }

        }

        getTaskView();

    }, []);

    return (
        <>
        { 
            viewLoaded && (

                <div className="container-fluid px-4">
                    <div className="task-view mt-4">
                        <TaskView taskId={id} taskName={taskName} listId={listId} />
                    </div>
                </div>
            )
        }
        </>
    )
   


}

export default Task;