/**
 * Creates A New Table Filter For Fields
 */
import axios from 'axios';
import { useState, useContext } from 'react';
import { DataContext } from '../../Contexts/DataContext';
import FieldsUser from '../../Fields/FieldsUser';

const ShareTableFilter = ( { list, hash, closeModal, callBack, ext = {}, } ) => {

    const { globalData } = useContext(DataContext);
    
    const [ selectedUsers, setSelectedUsers ] = useState([]);

    const createNewResource = async (e) => {

        e.preventDefault();

        try {

            let _url = `https://${globalData.api_url}/list/${list}/shareFilter`

            let _data = {
                hash,
                share_user: selectedUsers
            }

            const response = await axios({
                method: 'post',
                url: _url,
                data: _data,
                withCredentials: true
            });

            if (response.status === 200) {

                if(callBack) {}
                
                closeModal();

            } else {
                console.error(response);
            }

        } catch (error) {
            console.log(error);
        }

       
    }

    //console.log(selectedUsers);
    
    return (
        <form onSubmit={createNewResource}>
            <div className="mb-3">
                <label className="form-label">Filter Name</label>
                <FieldsUser callBack={ (data) => setSelectedUsers(data) }/>
                <div className="form-text">Select Users You'd Like To Share With. If A Copy Exists, It Will Be Overwritten.</div>
            </div>

            <button type="submit" className="btn btn-primary float-end">Submit</button>

        </form>
    );

}

export default ShareTableFilter;