import { Link } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { useUI } from './Contexts/UIContext';
import { DataContext } from '../components/Contexts/DataContext';
import axios from 'axios';

export default function TopNavBar({ toggleTheme }) {

    const [isSidebarToggled, setIsSidebarToggled] = useState(false);

    const { openModal } = useUI();
    
    const { globalData } = useContext(DataContext);
    
    // Load initial state from localStorage (if available)
    useEffect(() => {
        const storedState = localStorage.getItem('sb|sidebar-toggle');
        if (storedState) {
            setIsSidebarToggled(JSON.parse(storedState));
        }
    }, []
    );

    const handleToggleClick = () => {
        setIsSidebarToggled(!isSidebarToggled);
        document.body.classList.toggle('sb-sidenav-toggled');
        localStorage.setItem('sb|sidebar-toggle', JSON.stringify(!isSidebarToggled));
    };

    const handleLogout = () => {

        localStorage.removeItem('auth');

        const formData = new FormData();
        formData.append('m', 'logout');
        const response = axios.post(`https://${globalData.login_api_url}/`, formData, { withCredentials: true });
        window.location.href = "/";

    }

    return (
        <>
            {/* Top Navbar */}
            <nav className="sb-topnav navbar navbar-expand navbar-dark bg-dark">
                {/* Navbar Brand */}
                <Link to="/" className="navbar-brand ps-3">XenTask</Link>
                {/* Sidebar Toggle */}
                <button className="btn btn-link btn-sm order-1 order-lg-0 me-4 me-lg-0" id="sidebarToggle" onClick={handleToggleClick}><i className="fas fa-bars"></i></button>
                {/* Navbar Search */}
                <div className='d-none d-md-inline-block form-inline ms-auto me-0 me-md-3 my-2 my-md-0'>
                    <button 
                        className="btn btn-secondary" 
                        type="button"
                        onClick={
                            () => openModal( 
                                "Global Search", 
                                { 
                                    compProps: { 
                                        form: 'globalSearch',
                                    }
                                },
                                { modalSize: 'modal-xl' } 
                            )
                        }
                    >
                            Global Search&nbsp;<i className="fas fa-search"></i>
                    </button>
                </div>
                {/* Navbar */}
                <ul className="navbar-nav ms-auto ms-md-0 me-3 me-lg-4">
                    <li className="nav-item dropdown">
                        <a className="nav-link dropdown-toggle" id="navbarDropdown" href="#" role="button" data-bs-toggle="dropdown"
                            aria-expanded="false"><i className="fas fa-user fa-fw"></i></a>
                        <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                            <li>
                                <button 
                                    className="dropdown-item"
                                    type="button"
                                    onClick={
                                        () => openModal( 
                                            "Workspace Settings", 
                                            { 
                                                compProps: { 
                                                    form: 'workspaceSettings',
                                                    tab: 'user-settings' 
                                                }
                                            },
                                            { modalSize: 'modal-xl' }
                                        )
                                    }
                                    >
                                    Settings
                                </button>
                            </li>
                            {/*<li><a className="dropdown-item" href="#!">Activity Log</a></li>*/}
                            <li>
                                <hr className="dropdown-divider" />
                            </li>
                            <li><a className="dropdown-item" onClick={handleLogout}>Logout</a></li>
                        </ul>
                    </li>

                    <li className="nav-item dropdown">
                        <a className="nav-link dropdown-toggle" id="navbarDropdown" href="#" role="button" data-bs-toggle="dropdown"
                            aria-expanded="false"><i className="fa-solid fa-circle-half-stroke fa-fw"></i></a>
                        <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                            <li><a className="dropdown-item" href="#!" onClick={() => { toggleTheme(false) }}>Light Mode</a></li>
                            <li><a className="dropdown-item" href="#!" onClick={() => { toggleTheme(true) }}>Dark Mode</a></li>
                        </ul>
                    </li>

                    <li className="nav-item">
                        <a 
                            className="nav-link" 
                            href="#!"
                            onClick={
                                () => openModal( 
                                    "Contact Us", 
                                    { 
                                        compProps: { 
                                            form: 'contact',
                                        }
                                    },
                                    { modalSize: 'modal-xl' }
                                )
                            }
                        >
                            <i className="fa-regular fa-circle-question"></i>
                        </a>
                    </li>

                    
                </ul>
            </nav>
        </>
    );
}


