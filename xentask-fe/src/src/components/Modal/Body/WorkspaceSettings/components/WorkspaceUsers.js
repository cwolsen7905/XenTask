import { useContext, useRef, useState } from 'react';
import { DataContext } from '../../../../Contexts/DataContext';
import { useUI } from '../../../../Contexts/UIContext';
import { validateEmail } from '../../../../../Utils/Utils';
import axios from 'axios';

import FieldTags from '../../../../Fields/FieldsTags';


const WorkspaceUsers = () => {

    const { globalData } = useContext(DataContext);

    const { showToastNotification } = useUI();

    const [ inviteType, setInviteType] = useState(1);

    const tagsRef = useRef(null);

    const sendInvitationEmail = async () => { 
        
        let _emails = tagsRef.current.getItems();

        try {

            let _url = `https://${globalData.api_url}/workspace/${globalData.USER.default_workspace}/user`;

            let _data = JSON.stringify( {
               emails: _emails,
               level: inviteType,
            })
            const response = await axios.post( _url,  _data ,{ withCredentials: true } );

            if( response.status == 200 ) {

                //  Reset The Input
                tagsRef.current.resetTags();

                //  Show Notification
                showToastNotification({
                    type: 'success',
                    message: "Invitations Have Been Sent!"
                });

            }

        } catch (error) {

            showToastNotification({
                type: 'danger',
                message: "There Was An Issue Sending Invitations"
            });

         
            console.error(error);

        }
    }

    return (
        <>
            <h4><u>Workspace Users</u></h4>

            <div className="row">
                <div className="col-lg-8">
                    <FieldTags validation={validateEmail} allowDupes={false} ref={tagsRef}/>
                </div>
                <div className="col-lg-2">
                    <select className="form-select" onChange={(e)=>setInviteType(e.target.value)}>
                        <option value="0">Guest</option>
                        <option value="1" selected>Member</option>
                        <option value="2">Admin</option>
                    </select>
                </div>
                <div className="col-lg-2">
                    <button type="button" className="btn btn-success" onClick={sendInvitationEmail}>Send Invite(s)</button>
                </div>
            </div>

            <hr />
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th scope="col">Id</th>
                        <th scope="col">Name</th>
                        <th scope="col">Email</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        globalData.WORKSPACE_USERS.map(user => (
                            <tr>
                                <th scope="row">{user.id}</th>
                                <td>{user.full_name}</td>
                                <td>{user.email}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </>
    )

}

export default WorkspaceUsers;