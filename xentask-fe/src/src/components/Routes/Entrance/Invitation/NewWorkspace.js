import { useState,useContext } from "react";
import axios from "axios";
import { DataContext } from '../../../Contexts/DataContext';

const NewWorkspace = ({ hash }) => {

    const { globalData } = useContext(DataContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [ error, setError ] = useState('');

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const formData = new FormData();
            formData.append('m', "accept_invite");
            formData.append('accept', 1);
            formData.append('email', username);
            formData.append('password', password);
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
                Workspace Invitation
            </h3>

            <div className="small mb-3 text-muted"><center>Please Login To Accept Invitation</center></div>
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
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <label for="inputUsername">Email</label>
                    </div>

                    <div className="col">
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Enter Password"
                            aria-label="Password"
                            value={password}
                            onChange={(e)=>{setPassword(e.target.value)}}
                            required
                        />
                    </div>


                    <div className="d-flex align-items-center justify-content-center mt-4">
                        <button type="submit" className="btn btn-primary">Accept Invitation</button>
                    </div>

                </form>

            </div>

        </>
    )
}

export default NewWorkspace;
