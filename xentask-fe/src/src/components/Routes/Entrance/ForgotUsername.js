import { useState,useContext } from "react";
import { Link } from 'react-router-dom';
import { DataContext } from '../../Contexts/DataContext';
import axios from 'axios';

const ForgotPassword = () => {

    const { globalData } = useContext(DataContext);
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState(false);
    //const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("auth")); // New state to track login status // New state to track login status

    const handleSubmit = async (e) => {

        e.preventDefault();

        const formData = new FormData();
        formData.append('m', 'recover_username');
        formData.append('email', email);
        
        try{
            const response = await axios.post(`https://${globalData.login_api_url}/`, formData, { withCredentials: true });
            setMessage('If Your Email Exists On Our Records, We Will Send You An Email Regarding Your Username.');
            setError(false);
        } catch(error) {
            setMessage('There Was An Error Processing Your Request');
            setError(true);
        }

    }

    return (
        <>
            <h3 className="text-center font-weight-light my-4">Username Recovery</h3>
            <div className="small mb-3 text-muted"><center>Enter Your Email To Recover Your Username.</center></div>
            <div>
                <p className={`text-${error ? 'danger' : 'success'} text-center`}>{ message || '' }</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-floating mb-3">
                        <input
                            className="form-control"
                            id="inputUsername"
                            type="email"
                            placeholder="Enter Your Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <label for="inputUsername">Email</label>
                    </div>

                    <div className="d-flex align-items-center justify-content-between mt-4 mb-0">
                        <Link to="/" className="small">Return To Login</Link>
                        <button type="submit" className="btn btn-primary">Recover Username</button>
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
