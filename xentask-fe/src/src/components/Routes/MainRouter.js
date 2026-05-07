/**
 * The Applications Routing To Show New Views
 * 
 */
// React Libs
import { Routes, Route, Navigate } from 'react-router-dom';

// Main App Contents
import '../../ck-content.css';
import Dashboard from './App/Dashboard';
import MyTasks from './App/MyTasks';
import Task from './App/Task';
import DataTables from './App/DataTables';
import Lists from './App/List/Lists';
import Folders from './App/Folders';
import CRMSideBar from '../Sidebar/CRM/CRMSidebar';
import Sidebar from '../Sidebar/V3/SideBar';
import TopNavBar from '../TopNavBar';
import BottomNav from '../BottomNav';
import React, { useState, useEffect, useContext } from 'react';
import { UIProvider } from '../Contexts/UIContext';
import { DataContext } from '../Contexts/DataContext';
import axios from 'axios';

const MainRouter = () => {
  
  const { globalData } = useContext(DataContext);

  const [isDarkTheme, setIsDarkTheme] = useState(localStorage.getItem("isDarkTheme") === "true");

  const toggleTheme = (state) => {
    setIsDarkTheme(state);
    updateTheme(state);
    localStorage.setItem("isDarkTheme", state);
  };

  const updateTheme = (state) => {

    if (state) {
      document.documentElement.setAttribute('data-bs-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-bs-theme');
    }

  };

  //  Update The State If We Toggled DarkMode
  useEffect(() => {
    updateTheme(isDarkTheme);
  }, [isDarkTheme]);

  const test = async () =>{

      try {
          const response = await axios.get(`https://${globalData.api_url}/workspace/123/debug`, { withCredentials: true });

      } catch (error) {

          console.error(error);
      }
  }

  //  Sets The Sidebar View Type
  const [ viewType, setViewType ] = useState('task');

  const getSideBar = () => {
    switch( viewType ){
      case('task'):
        return <Sidebar />

      case('crm'):
        return <CRMSideBar />;
    }
  };
  return (
    <>

      {
      /**
      * The Global UI Components That The App Will Use To Conduct Various Actions
      */
      }

      <UIProvider>
        <div className="sb-nav-fixed">
          <TopNavBar toggleTheme={toggleTheme} />
          <div id="layoutSidenav">

            {getSideBar()}
          
            <div id="layoutSidenav_content">
              <main> {/* Add padding bottom to accommodate fixed-bottom navbar <button onClick={test}>Click Me!</button>*/}
              
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/assigned" element={<MyTasks />} />
                  <Route path="/lists/:id" element={<Lists />} />
                  <Route path="/folder/:id" element={<Folders />} />
                  <Route path="/task/:id" element={<Task />} />
                  <Route path="/contacts/:id" element={<DataTables />} />
                  <Route path="/data-table/:id" element={<DataTables />} />
                  {/* Any Other Unknown Route Just Navigate Them To The Login Or 404 Page */}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>

              </main>

              {/*<BottomNav setViewType={setViewType}/>*/}

            </div>
          </div>
        </div>


      </UIProvider>

    </>

  );
};

export default MainRouter;