import { useContext, useRef, useState } from 'react';
import { DataContext } from '../../../../Contexts/DataContext';
import ColorPicker from '../../../../vendor/ColorPicker';
import { useUI } from '../../../../Contexts/UIContext';

import axios from 'axios';

const UserSettings = () => {

    const { showToastNotification } = useUI();

    const { globalData, refreshUserData } = useContext(DataContext);

    const { first_name, last_name, email, color, initals, image } = globalData.USER;

    //  Basic Data Form State
    const [firstNameInput, setFirstNameInput] = useState(first_name);
    const [lastNameInput, setLastNameInput] = useState(last_name);
    const [emailInput, setEmailInput] = useState(email);
    const [colorInput, setColorInput] = useState(color);
    const [selectedFile, setSelectedFile] = useState(null); // State to store selected file

    //  Password Change Form State
    const [currentPass, setCurrentPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');


    //  Upload Image Ref
    const fileInputRef = useRef(null);

    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file); // Save selected file to state
            // Optionally, you can perform further operations here with the selected file
        }
    };

    // Profile Preview Styles
    const buttonStyle = {
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        padding: '10px',
        borderRadius: '5px',
        transition: 'background-color 0.3s',
    };

    const circleStyle = {
        width: '5rem',
        height: '5rem',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colorInput || '#6610f2',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '32px',
    };

    const updateBasicSettings = async (e) => {

        e.preventDefault();

        try {
            const formData = new FormData();
            formData.append('first_name', firstNameInput);
            formData.append('last_name', lastNameInput);
            formData.append('email', emailInput);
            formData.append('color', colorInput);

            if (selectedFile) {
                formData.append('image', selectedFile);
            }

            // Replace 'YOUR_API_URL' with your actual API endpoint
            const response = await axios.post(`https://${globalData.api_url}/user/basic`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });

            if (response.status == 200) {

                showToastNotification({
                    message: "Basic Information Has Been Saved",
                });

                refreshUserData(response.data);
            }

            // Optionally, you can handle success or show a success message to the user
        } catch (error) {

            showToastNotification({
                type: 'danger',
                message: "There Was Problem Processing Your Request. Please Try Again.",
            });
            // Handle error, show error message to the user, etc.
        }
    };


    const updatePassword = async (e) => {

        e.preventDefault();

        // Basic Validation
        if (newPass !== confirmPass) {

            showToastNotification({
                type: 'danger',
                message: "Passwords Do Not Match.",
            });

            return;
        }

        try {

            let _data = {
                current_password: currentPass,
                new_password: newPass,
            }

            const response = await axios.put(`https://${globalData.api_url}/user/password`, JSON.stringify(_data), {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });

            if ( response.status == 200 ) {

                showToastNotification({
                    type: 'success',
                    message: "Your Password Has Been Updated!",
                });

                setCurrentPass('');
                setNewPass('');
                setConfirmPass('');

            }

            // Optionally, you can handle success or show a success message to the user
        } catch (error) {

            //console.log(error.response.data.err_string);
            if( error.response.data.err_string ){

                showToastNotification({
                    type: 'danger',
                    message: error.response.data.err_string,
                });

            } else {

                showToastNotification({
                    type: 'danger',
                    message: "There Was Problem Processing Your Request. Please Try Again.",
                });

            }
            

        }
    }

    return (
        <div className="container">

            <h4><u>Basic Settings</u></h4>

            <form onSubmit={updateBasicSettings}>

                <div>
                    <button type="button" style={buttonStyle} className="d-flex align-items-center" onClick={handleButtonClick}>
                        <div style={circleStyle} className="me-2">
                            {initals}
                        </div>
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />

                    {selectedFile && (
                        <p>Selected file: {selectedFile.name}</p>
                        // You can display the selected file information or perform other actions here
                    )}
                </div>


                <div className="form-floating mb-3">
                    <input type="text" className="form-control" value={firstNameInput} onChange={(e) => setFirstNameInput(e.target.value)} required />
                    <label>First Name</label>
                </div>

                <div className="form-floating mb-3">
                    <input type="text" className="form-control" value={lastNameInput} onChange={(e) => setLastNameInput(e.target.value)} required />
                    <label>Last Name</label>
                </div>

                <div className="form-floating mb-3">
                    <input type="email" className="form-control" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} required />
                    <label>Email address</label>
                </div>

                <div className='mb-3'>
                    <label>Theme Color</label>
                    <ColorPicker selectedColor={color} callBack={setColorInput} />
                </div>
                <button type="submit" className="btn btn-success">Save Changes</button>
            </form>
            <hr />

            <div>
                <h4>Change Password</h4>
                <form onSubmit={updatePassword}>
                    <div className="form-floating mb-3">
                        <input type="password" className="form-control" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} required />
                        <label>Current Password</label>
                    </div>

                    <div className="form-floating mb-3">
                        <input type="password" className="form-control" value={newPass} onChange={(e) => setNewPass(e.target.value)} required />
                        <label>New Password</label>
                    </div>

                    <div className="form-floating mb-3">
                        <input type="password" className="form-control" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} required />
                        <label>Confirm New Password</label>
                    </div>
                    <button type="submit" className="btn btn-success">Save Changes</button>
                </form>
            </div>
        </div>
    )

}

export default UserSettings;