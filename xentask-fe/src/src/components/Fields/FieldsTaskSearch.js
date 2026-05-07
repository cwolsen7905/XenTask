import axios from 'axios';
import React, { useState, useEffect, useContext, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faTasks } from '@fortawesome/free-solid-svg-icons';
import { DataContext } from '../Contexts/DataContext';
import { useUI } from '../Contexts/UIContext';


const FieldsTaskSearch = ({ taskId, subtasks, setBasicData }) => {

    const { globalData } = useContext(DataContext);

    const { showToastNotification } = useUI();

    const [searchInput, setSearchInput] = useState('');
    const [searchFilters, setSearchFilters] = useState(['task']);
    const [results, setResults] = useState({});
    const [error, setError] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const exclude = [taskId,...Object.keys(subtasks)];

    const inputRef = useRef(null);

    useEffect(() => {
        if (searchInput === '') {
            setIsDropdownOpen(false);
            return;
        }

        const fetchData = async () => {
            for (const path of searchFilters) {
                const _url = `https://${globalData.api_url}/search/${path}`;
                const _data = { key: searchInput };

                try {
                    const response = await axios.post(_url, JSON.stringify(_data), { withCredentials: true });

                    if (response.status === 200) {

                        // Filter out objects where the hashId is in the excludeList
                        const filteredData = response.data.filter(item => !exclude.includes(item.hash));

                        setResults(prevResults => ({
                            ...prevResults,
                            [path]: filteredData
                        }));

                        setIsDropdownOpen(true);
                    }
                } catch (error) {
                    console.error('Error fetching data for path:', path, error);
                    setError(error);
                }
            }
        };

        fetchData();

    }, [searchInput, searchFilters, globalData.api_url]);

    const flattenResults = () => Object.values(results).flat();

    const linkSubTask = async (selectedTask) => {

        try {

            let _url = `https://${globalData.api_url}/task/${taskId}/subtask`;

            let _data = {
                task_id: selectedTask.hash
            }

            const response = await axios.post(_url, JSON.stringify(_data), { withCredentials: true });

            if(response.status == 200) {

                let _id = selectedTask.hash;
                let _title = selectedTask.text;

                setBasicData(prevBasicData => ({
                    ...prevBasicData,
                    subtasks: {
                        ...prevBasicData.subtasks,
                        [_id]: _title
                    }
                }));

                //  Reset The Search Input Upon Success
                setSearchInput('');

                setResults({});
                
                showToastNotification({
                    type: 'success',
                    message: 'Subtask Has Been Linked'
                });

            }

        } catch (error) {

            showToastNotification({
                type: 'danger',
                message: error.response.data.err_string,
            });
        }
    }
    

    return (
        <div className="mb-2 position-relative">

            <h6>Link Subtask</h6>

            <div className="mb-2 d-flex gap-2">
                <input
                    ref={inputRef}
                    className="form-control"
                    placeholder="Search Task"
                    value={searchInput}
                    onChange={(e) => {
                        setSearchInput(e.target.value);
                        setIsDropdownOpen(e.target.value.length > 0 && flattenResults().length > 0);
                    }}
                    onFocus={() => setIsDropdownOpen(flattenResults().length > 0)}
                    onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                />
            </div>


            {isDropdownOpen && (
                <div
                    className="dropdown-menu show w-50 position-absolute"
                    style={{ maxHeight: 300, overflowY: "auto", top: "100%" }}
                >
                    {flattenResults().map((result, index) => (
                        <button
                            key={index}
                            className="dropdown-item d-flex align-items-center"
                            onMouseDown={() => {
                                linkSubTask(result);
                                setIsDropdownOpen(false);
                            }}
                        >
                            <FontAwesomeIcon
                                icon={result.type === 'comment' ? faComment : faTasks}
                                className="me-2"
                            />
                            <div className="text-truncate">
                                <strong>{result.text || result.plain_text}</strong>
                                <div className="small text-muted">
                                    {(result.type === "task" ? result.hash : result.task_hash)}
                                    {result.user_name ? ` · ${result.user_name}` : ""}
                                    {result.date_created ? ` · ${result.date_created}` : ""}
                                </div>
                            </div>
                        </button>
                    ))}

                </div>
            )}
        </div>
    );
};

export default FieldsTaskSearch;
