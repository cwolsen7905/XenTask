import { useState,useContext } from "react";
import axios from "axios";
import { DataContext } from '../../../Contexts/DataContext';



const NewAccount = ( {hash} ) => {
    
    const { globalData } = useContext(DataContext);
    const [ username, setUserName ] = useState('');
    const [ firstName, setfirstName ] = useState('');
    const [ lastName, setlastName] = useState('');
    const [ password, setPassword ] = useState('');
    const [ confirmPassword, setConfirmPassword ] = useState('');
    const [ error, setError ] = useState('');

    const handleSubmit = async (e) => {

        e.preventDefault();

        if( password !== confirmPassword ) {
            setError("Passwords Do Not Match"); 
            return;
        }

        try {
            
            const formData = new FormData();
            formData.append('m', "accept_invite");
            formData.append('accept', 1);
            formData.append('email', username);
            formData.append('first_name', firstName);
            formData.append('last_name', lastName);
            formData.append('password', confirmPassword);
            formData.append('type', 2);
            formData.append('hash', hash);
            
            const response = await axios.post(`https://${globalData.login_api_url}/`, formData, { withCredentials: true });
    
            if (response.status == 200) {
                localStorage.setItem("auth", 1);
                window.location.href = "/";
            }

        } catch (error) {

            setError(error.response.data.data.message);
        }
    
    }

    return (
        <>
            <h3 className="text-center font-weight-light my-4">
                Workspace Invitation Signup
            </h3>

            <div className="small mb-3 text-muted"><center>Please Fill Out Your Information</center></div>
            <p className="text-danger text-center">{error}</p>
            <div>

                <form onSubmit={handleSubmit}>

                    <div className="form-floating mb-3">
                        <input
                            className="form-control"
                            id="inputUsername"
                            type="text"
                            placeholder="Enter Your Email"
                            value={username}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                        />
                        <label for="inputUsername">Email</label>
                    </div>


                    <div className="row mb-2">
                        <div className="col">
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="First name" 
                                aria-label="First name" 
                                value={firstName}
                                onChange={(e)=>{setfirstName(e.target.value)}}
                                required 
                            />
                        </div>
                        <div className="col">
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Last name" 
                                aria-label="Last name" 
                                value={lastName}
                                onChange={(e)=>{setlastName(e.target.value)}}
                                required 
                            />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col">
                            <input 
                                type="password" 
                                className="form-control" 
                                placeholder="Enter Password" 
                                aria-label="Password" 
                                value={password}
                                onChange={ (e)=>{setPassword(e.target.value)} }
                                required
                            />
                        </div>
                        <div className="col">
                            <input 
                                type="password" 
                                className="form-control" 
                                placeholder="Confirm Password" 
                                aria-label="Confirm password" 
                                value={confirmPassword}
                                onChange={ (e)=>{setConfirmPassword(e.target.value)} }
                                required 
                            />
                        </div>
                    </div>

                    <div className="d-flex align-items-center justify-content-center mt-4">
                        <button type="submit" className="btn btn-primary">Confirm Account</button>
                    </div>

                </form>

            </div>

        </>
    )
}

export default NewAccount;
