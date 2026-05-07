import { useState, useContext } from "react";
import { DataContext } from '../../Contexts/DataContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {


    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    //const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("auth")); // New state to track login status // New state to track login status
    const { globalData } = useContext(DataContext);
    
    const handleSubmit = async (e) => {

        e.preventDefault();

        const formData = new FormData();
        formData.append('m', 'reset');
        formData.append('username', username);
        
        const response = await axios.post(`https://${globalData.login_api_url}/`, formData, { withCredentials: true });

        setMessage('If Your Username Exists On Our Records, We Will Send You Instructions To Reset Your Password');
        
    }

    return (
        <>
            <h3 className="text-center font-weight-light my-4">Password Recovery</h3>
            <div className="small mb-3 text-muted"><center>Enter Your Username To Reset Your Password.</center></div>
            <div>
                <p className="text-success text-center">{ message || '' }</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-floating mb-3">
                        <input
                            className="form-control"
                            id="inputUsername"
                            type="text"
                            placeholder="Enter Your Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <label for="inputUsername">Username</label>
                    </div>

                    <div className="d-flex align-items-center justify-content-between mt-4 mb-0">
                        <Link to="/" className="small">Return To Login</Link>
                        <button type="submit" className="btn btn-primary">Reset Password</button>
                    </div>

                    <hr />

                    <div className="d-flex align-items-center justify-content-center mt-4 mb-0">
                        <a className="small" href="password.html">Need an account? Sign up!</a>
                    </div>

                </form>

            </div>
        </>



    );
}

export default ForgotPassword;
