import { useEffect, useState,useContext  } from "react";
import { Link, useParams } from 'react-router-dom';
import NewAccount from './NewAccount';
import NewWorkspace from './NewWorkspace';
import axios from 'axios';
import { DataContext } from '../../../Contexts/DataContext';

const Invitation = () => {

    const { globalData } = useContext(DataContext);
    const [pageType, setPageType] = useState(0);
    const { hash } = useParams();

    //  If There's No Hash Provided Take Them To The Error Page
    if ( !hash ) {
        window.location.href = "/error";
    }

    //  Call The API To Determine What Kind Of Component To Show Them
    useEffect(() => {

        async function validateHash() {

            try {

               
                const formData = new FormData();
                formData.append('m', "get_invite");
                formData.append('hash', hash);
                const response = await axios.post(`https://${globalData.login_api_url}/`, formData, { withCredentials: true });

                if (response.status == 200) {
                    console.log(response.data);
                    setPageType( response.data.data.data.type );//
                }

            } catch (error) {
                window.location.href = "/error";
            }
        }

        validateHash();

    }, [])

    if (pageType == 0) {

        return (
            <div className="d-flex justify-content-center align-items-center">
                <div className="spinner-grow" style={{ width: 3 + 'rem', height: 3 + "rem" }} role="status">
                    <span className="sr-only">Loading...</span>
                </div>
                <div className="spinner-grow" style={{ width: 3 + 'rem', height: 3 + "rem" }} role="status">
                    <span className="sr-only">Loading...</span>
                </div>

                <div className="spinner-grow" style={{ width: 3 + 'rem', height: 3 + "rem" }} role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        );
    }
    
    return (

        pageType == "2" ?  <NewAccount hash={hash}/> : <NewWorkspace hash={hash}/>
        
    );
}

export default Invitation;
