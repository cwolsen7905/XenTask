import { useState } from "react";
import axios from 'axios';

const ForgotPassword = () => {


    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    //const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("auth")); // New state to track login status // New state to track login status

    const handleSubmit = async (e) => {

        e.preventDefault();

    }

    return (

        <div className="container-fluid">
            <div className="loginwrapper white">
                <span className="circle"></span>
                <div className="loginone">
                    <h3 className="text-center font-weight-light my-4">Password Recovery</h3>
                    <div className="small mb-3 text-muted align-center">Enter your email address and we will send you a link to reset your password.</div>
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
                                    required />
                                <label for="inputEmail">Email address</label>
                            </div>

                            <div className="d-flex align-items-center justify-content-between mt-4 mb-0">
                                <a className="small" href="password.html">Return To Login</a>
                                <button type="submit" className="btn btn-primary">Reset Password</button>
                            </div>

                            <hr />

                            <div className="d-flex align-items-center justify-content-center mt-4 mb-0">
                                <a className="small" href="password.html">Need an account? Sign up!</a>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>



    );
}

export default ForgotPassword;
