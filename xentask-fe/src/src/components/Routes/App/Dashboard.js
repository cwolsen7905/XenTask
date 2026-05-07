import { useEffect, useState, useContext } from 'react';
import Calendar from '../../vendor/Calendar';
import { Link, useNavigate } from 'react-router-dom';
import { DataContext } from '../../Contexts/DataContext';
import axios from 'axios';
//import { useUI } from '../../Contexts/ModalContext';

const Dashboard = () => {

    const [data, setData] = useState([]);

    const { globalData } = useContext(DataContext);


    useEffect(() => {

        const getDashboardData = async () => {

            try {

                let _url = `https://${globalData.api_url}/workspace/${globalData.USER.default_workspace}/dashboard`;

                const response = await axios.get(_url, { withCredentials: true });

                if (response.status == 200) {

                    let dashboardData = {

                        opened_count: response.data.length,
                        overdue_count: 0,
                        calendar_events: [],
                    }

                    response.data.forEach(e => {

                        let _event = {

                            title: e.title,
                            start: e.start,
                            end: e.end,
                            extendedProps: {
                                task_id: e.hash
                            }

                        }

                        if (e.overdue == true) {
                            dashboardData.overdue_count++;
                            _event.color = '#dc3545';
                        }

                        dashboardData.calendar_events.push(_event);

                    });

                    //console.log(dashboardData);

                    setData(dashboardData);

                }


            } catch (error) {

                console.log(error);

            }

        }

        getDashboardData();

    }, [])

    return (
        <>
            <div className="container-fluid px-4">
                <h1 className="mt-4">Dashboard</h1>
                <ol className="breadcrumb mb-4"><li className="breadcrumb-item active">Dashboard</li></ol>

                {/* Task Related Cards*/}

                <div className="row">
                    {/* Open Tasks */}
                    <div className="col-xl-3 col-md-6">
                        <div className="card bg-success text-white mb-4">
                            <div className="card-body">{data.opened_count} Open Task(s)</div>
                            <div className="card-footer d-flex align-items-center justify-content-between">

                                <Link to="/assigned" className="small text-white stretched-link">
                                    View Details
                                </Link>


                                <div className="small text-white"><i className="fas fa-angle-right"></i></div>
                            </div>
                        </div>
                    </div>
                    {
                        /* Review 
                        <div className="col-xl-3 col-md-6">
                            <div className="card bg-secondary text-white mb-4">
                                <div className="card-body">23 Task(s) Awaiting Review</div>
                                <div className="card-footer d-flex align-items-center justify-content-between">
                                    <a className="small text-white stretched-link" href="#">View Details</a>
                                    <div className="small text-white"><i className="fas fa-angle-right"></i></div>
                                </div>
                            </div>
                        </div>
                        */
                    }
                    {/* Overdue */}
                    <div className="col-xl-3 col-md-6">
                        <div className="card bg-danger text-white mb-4">
                            <div className="card-body">{data.overdue_count} Task(s) Overdue</div>
                            <div className="card-footer d-flex align-items-center justify-content-between">
                                <Link to="/assigned" className="small text-white stretched-link">
                                    View Details
                                </Link>
                                <div className="small text-white"><i className="fas fa-angle-right"></i></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Tasks */}
                <div className="row">
                    {/*
                    <div className="col-xl-6">
                        <div className="card mb-4">
                            <div className="card-header">
                                <i className="fas fa-chart-area me-1"></i>Recent Tasks
                            </div>
                            <div className="card-body">
                                <ul className="list-group list-group-flush">

                                    {/*<li className="list-group-item"><a href="#" data-bs-toggle="modal" data-bs-target="#taskModal" id="123">Task #1</a></li>
                                    <li className="list-group-item"><a href="#" data-bs-toggle="modal" data-bs-target="#taskModal" >Task #2</a></li>
                                    <li className="list-group-item"><a href="#" data-bs-toggle="modal" data-bs-target="#taskModal" >Task #3</a></li>
                                    
                                </ul>
                            </div>
                        </div>
                    </div>*/}

                    {/*Calendar*/}

                    <div className="col-xl-8"> {/*12*/}
                        <div className="card mb-4">
                            <div className="card-header">
                                <i className="fas fa-chart-bar me-1"></i>Agenda</div>
                            <div className="card-body"><Calendar events={data.calendar_events} /></div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
};





export default Dashboard;