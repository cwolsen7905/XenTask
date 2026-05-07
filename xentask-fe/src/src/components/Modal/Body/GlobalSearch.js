import axios from 'axios';
import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faTasks } from '@fortawesome/free-solid-svg-icons';
import { DataContext } from '../../Contexts/DataContext';
import { ucFirst } from '../../../Utils/Utils';

const GlobalSearch = ({ openModal, closeModal }) => {
    
    const { globalData } = useContext(DataContext);

    const [searchInput, setSearchInput] = useState('');
    const [searchFilterButtons, setSearchFilterButtons] = useState(['task', 'comment']);
    const [searchFilters, setSearchFilters] = useState(['task']);
    const [results, setResults] = useState({});
    const [error, setError] = useState(null);

    useEffect(() => {
        if (searchInput === '') return;

        const fetchData = async () => {
            for (const path of searchFilters) {
                const _url = `https://${globalData.api_url}/search/${path}`;
                const _data = { key: searchInput };

                try {
                    const response = await axios.post(_url, JSON.stringify(_data), { withCredentials: true });
                    if (response.status === 200) {
                        console.log(`Data for ${path}:`, response.data);  // Debug log
                        setResults(prevResults => ({
                            ...prevResults,
                            [path]: response.data  // Replace results for the current filter
                        }));
                    }
                } catch (error) {
                    console.error('Error fetching data for path:', path, error);
                    setError(error);
                }
            }
        };

        fetchData();
    }, [searchInput, searchFilters, globalData.api_url]);

    const toggleItem = (e, value) => {
        const _checked = e.target.checked;
        let _newSearchFilters = [...searchFilters];

        if (_checked) {
            _newSearchFilters.push(value);
        } else {
            _newSearchFilters = _newSearchFilters.filter(val => val !== value);
            setResults(prevResults => {
                const { [value]: _, ...newResults } = prevResults;
                return newResults;
            });
        }

        setSearchFilters(_newSearchFilters);
    };

    const flattenResults = () => {
        return Object.values(results).flat();
    };

    const openTaskModal = (data) => {

        //  Opens The Task View Modal
        openModal(
            "View Task",
            {
                type: 'taskView',
                compProps: { taskId: data.hash }
            },
            {
                modalSize: 'modal-xxl',
                scrollable: true,
            },
            {
                // When The Modal Closes Refresh The Tasks In
                // The Current List View
                close: () => {}
            }
        );

        window.history.pushState({}, '', `/task/${data.hash}`);
    }

    return (
        <>
            <div className='mb-2'>
                <input
                    className='form-control'
                    placeholder='Search Query'
                    onChange={(e) => setSearchInput(e.target.value)}
                />
            </div>

            <div className='d-flex align-items-center mb-3 gap-2'>
                {
                    searchFilterButtons.map((item) => (
                        <React.Fragment key={item}>
                            <input
                                type="checkbox"
                                className="btn-check"
                                autoComplete="off"
                                id={`filter-${item}`}
                                onClick={(e) => toggleItem(e, item)}
                                checked={searchFilters.includes(item)}
                            />
                            <label htmlFor={`filter-${item}`} className="btn btn-outline-primary">{ucFirst(item)}</label>
                        </React.Fragment>
                    ))
                }
            </div>

            <hr />

            <div>
                <h2>Results</h2>
                <div
                    className='list-group list-group-flush border-bottom'
                    style={{
                        overflowY: 'auto',
                        maxHeight: 600,
                    }}
                >
                    {flattenResults().length > 0 ? (
                        flattenResults().map((result, index) => (
                            <button 
                                key={index} 
                                href="#" 
                                className="list-group-item list-group-item-action py-3 lh-tight"
                                onClick={ () => { openTaskModal({ hash: ( result.type == "task" ? result.hash : result.task_hash ) }) } }
                            >
                                <div className="d-flex w-100 align-items-center">
                                    <div className="me-3">
                                        <FontAwesomeIcon icon={result.type === 'comment' ? faComment : faTasks} />
                                    </div>
                                    <div className="flex-grow-1 overflow-hidden">
                                        <div className="d-flex w-100 justify-content-between">
                                            <strong className="mb-1 text-truncate">{ result.text || result.plain_text }</strong>
                                        </div>
                                        <div className="col-10 mb-1 small text-truncate">
                                            { ( result.type == "task" ? result.hash : result.task_hash ) + ( result.user_name ? ' · ' + result.user_name : '' ) + ( result.date_created ? ' · ' + result.date_created : '' )   }
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))
                    ) : (
                        <p>No results to display</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default GlobalSearch;
