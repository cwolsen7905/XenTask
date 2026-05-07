/**
 * Creates A New Table Filter For Fields
 */
import axios from 'axios';
import { useState, useContext } from 'react';
import { DataContext } from '../../Contexts/DataContext';

const NewTableFilters = ( { filters, list, update, closeModal, ext = {}, callBack } ) => {

    const { globalData } = useContext(DataContext);
    const [ nameVal, setNameVal ] = useState( ext.name || '' );

    const createNewResource = async (e) => {

        e.preventDefault();

        //console.log("Saving",filters);

        try {

            let _url = `https://${globalData.api_url}/list/${list}/filters`
            
            let _data;

            if( !update ) {
                
                _data = {
                    name:  nameVal,
                    value: filters,
                }

            } else {

                _data = {
                    hash: ext.hash,
                    changes:{
                        name: nameVal,
                    }
                }

            }

            if( update ) _data.filters = filters;

            const response = await axios({
                method: update ? 'put' : 'post',
                url: _url,
                data: _data,
                withCredentials: true
              });

            if (response.status === 200) {

                if(callBack) {
                    callBack( ( update ? nameVal : { hash: response.data.hash, name: nameVal } ) );
                }
                
                closeModal();

            } else {
                console.error(response);
            }

        } catch (error) {
            console.log(error);
        }

       
    }

    return (
        <form onSubmit={createNewResource}>
            <div className="mb-3">
                <label className="form-label">Filter Name</label>
                <input
                    type="text" 
                    className="form-control"
                    value={nameVal}
                    onChange={(e) => setNameVal(e.target.value)}
                    required
                />
                <div className="form-text">Give A Unique Name For Your New Filter</div>
            </div>

            <button type="submit" className="btn btn-primary float-end">Submit</button>

        </form>
    );

}

export default NewTableFilters;