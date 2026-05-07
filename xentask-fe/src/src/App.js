import './App.css';
import React, { useState, useEffect, useContext, Suspense, lazy } from 'react';
import LoadingPage from './components/Routes/LoadingPage';
import { DataContext } from './components/Contexts/DataContext';
import EntranceRouter from './components/Routes/EntranceRouter';
import ErrorPage from './components/ErrorPage';
import axios from 'axios';

// Lazy-load MainRouter component
const MainRouter = lazy(() => import('./components/Routes/MainRouter'));

function App() {

  // Access context data
  // Anything About The User Should Be Pulled Here  
  // Anything We Need To Update Should Likewise Be Pulledd here
  const { globalData, setData } = useContext(DataContext);

  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("auth") === "1");

  //  Data Should Be Loaded Before We Continue To Render The MainRouter
  const [dataLoaded, setDataLoaded] = useState(false);
  const [envLoaded, setEnvLoaded] = useState(false);

  useEffect(() => {

    async function getEnvironment() {

      try {
        const response = await axios.get('/api.json');
        let _data = response.data;
        setData(prevData => ({
          ...prevData,
          api_url: _data.API_HOST,
          login_api_url: _data.LOGIN_HOST,
        }));

        setEnvLoaded(true);

        //  Return It Now So That Login WS Can Be Called
        return _data.LOGIN_HOST;

      } catch (error) {
        return <ErrorPage />
        console.log(error);
      }

    }
  
    async function fetchUserData(loginApi) {

      try {
        
        const formData = new FormData();
        formData.append('m', 'overview');
        const response = await axios.post( `https://${loginApi}/`, formData, { withCredentials: true } );
        let _data = response.data.data;
        
        let _internal = ( _data.USER.email.includes('@xentask.com') || _data.USER.email == 'einherjarteam@gmail.com' ) ? true : false;
        
        delete _data['message'];
    
        setData(prevData => ({
          ...prevData,
          ..._data, // Spread the fetched data into the state
          is_internal: _internal 
        }));
        
        setDataLoaded(true); // Mark data as loaded after fetching

        //  If For Some Reason We Are Logged In But Auth Is False
        if( !isLoggedIn ){
          localStorage.setItem("auth", 1);
          setIsLoggedIn(1);
          window.location.href = "/";
        }
        
      } catch (error) {

        console.log(error);
        
        if (error.response.data.message === "OVERVIEW" && error.response.status === 401) {

          // If The Session Is Expired But We're Logged In 
          // UnAuth Them And Send Them Back To The Homepage
          if( isLoggedIn ){
            localStorage.removeItem('auth');
            window.location.href = "/";
          }
        }
      }
    }
    
    //  Initalize Main Data
    async function initialize() {

      //  Get The Enviorment For The Login API
      let _loginApiUrl =  await getEnvironment();
      await fetchUserData( _loginApiUrl );

    }
  
    initialize();

  }, []);

  //  Makes Sure That The Data Is Loaded Before We Attempt Using The Main App
  if ( ( isLoggedIn && !dataLoaded ) || !envLoaded ) {
    return <LoadingPage />;
  }

  return (

    //  We Use Suspense Here Because We Lazy Load The MainRouter Component 
    //  Its Not Needed For Signup
    <Suspense fallback={<LoadingPage />}>
      { isLoggedIn ? <MainRouter /> : <EntranceRouter />}
    </Suspense>

  );
}

export default App;
