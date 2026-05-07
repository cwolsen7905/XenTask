import { useState,useContext } from "react";
import { Link } from 'react-router-dom';
import axios from 'axios';
import { DataContext } from '../../Contexts/DataContext';

const LoginPage = () => {

    const { globalData } = useContext(DataContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    //const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("auth")); // New state to track login status // New state to track login status

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {
            const formData = new FormData();
            formData.append('m', 'login');
            formData.append('email', email);
            formData.append('password', password);

            const response = await axios.post(`https://${globalData.login_api_url}/`, formData, { withCredentials: true });

            // Check if login was successful (check response status or data)
            // Example: 

            //  Store Token Here 
            //  Redirect Back To Home Page To Allow Loading the Admin

            if (response.status === 200) {

                console.log(response);
                let auth = response.data.data.authenticated;
                let message = response.data.data.message;
                let worskpace = response.data.data.USER.workspaces[0];

                if (message == 'SUCCESS' && auth) {

                    localStorage.setItem("auth", 1);
                    localStorage.setItem("workspace", worskpace);
                    window.location.href = "/";

                } else {

                    setError('Invalid email or password. Please try again.');

                }

            } else {

                setError('Invalid email or password. Please try again.');
            }

        } catch (error) {

            setError('Invalid email or password. Please try again.');

        }
    }

    return (

        <>
            <h3 className="text-center font-weight-light my-4">Login</h3>
            <div>
                <p className="text-danger text-center">{error}</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-floating mb-3">
                        <input
                            className="form-control"
                            id="inputEmail"
                            type="text"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                        <label for="inputEmail">Email address</label>
                    </div>
                    <div className="form-floating mb-3">
                        <input
                            className="form-control"
                            id="inputPassword"
                            type="password"
                            placeholder="Password"
                            onChange={(e) => setPassword(e.target.value)}
                            required />
                        <label for="inputPassword">Password</label>
                    </div>
                    <div className="form-check mb-3">
                        <input className="form-check-input" id="inputRememberPassword" type="checkbox" value="" />
                        <label className="form-check-label" for="inputRememberPassword">Remember Password</label>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mt-4 mb-0">
                        <Link to="/password" className="small">Forgot Password?</Link>
                        <Link to="/username" className="small">Forgot Username?</Link>
                        <button type="submit" className="btn btn-primary">Login</button>
                    </div>
                </form>
            </div>
        </>
    );
}

export default LoginPage;
