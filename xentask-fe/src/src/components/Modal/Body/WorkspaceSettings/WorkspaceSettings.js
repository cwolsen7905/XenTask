import WorkspaceUsers from "./components/WorkspaceUsers";
import UserSettings from "./components/UserSettings";
import Subscription from "./components/Subscription";
import { useUI } from '../../../Contexts/UIContext';
import {useState} from 'react';

const WorkspaceSettings = ({tab}) => {

    const { openModal } = useUI();

    const [tabSelected, setSelectedTab] = useState( tab || 'worspace-users' );
    
    return (
        <div className="d-flex align-items-start">

            <div className="nav flex-column nav-pills me-3" id="v-pills-tab" role="tablist" aria-orientation="vertical">

                <button
                    type="button"
                    className={`nav-link ${ tabSelected == 'worspace-users' ? 'active' : '' }`}
                    id="worspace-users-tab"
                    data-bs-toggle="pill"
                    data-bs-target="#worskpace-users"
                    role="tab"
                    aria-controls="worskpace-users"
                    aria-selected={ tabSelected == 'worspace-users' ? "true" : "false" }
                    onClick={()=>setSelectedTab('worspace-users')}
                >
                    People
                </button>

                <button 
                    className={`nav-link ${tabSelected == 'user-settings' ? 'active' : '' }`}
                    id="user-settings-tab" 
                    data-bs-toggle="pill" 
                    data-bs-target="#user-settings" 
                    type="button" role="tab" 
                    aria-controls="user-settings"
                    aria-selected={tabSelected == 'user-settings' ? "true" : "false"}
                >
                    My Settings
                </button>
                
                
                {/*<button 
                    className={`nav-link ${tabSelected == 'subscription' ? 'active' : '' }`}
                    id="subscription-tab" 
                    data-bs-toggle="pill" 
                    data-bs-target="#subscription" 
                    type="button" role="tab" 
                    aria-controls="subscription"
                    aria-selected={tabSelected == 'subscription' ? "true" : "false"}
                >
                    Subscription
                </button>*/}

                <button 
                    type="button" 
                    className="btn btn-success mt-2"
                    onClick={() => openModal("Edit Custom Fields", { compProps: { form: 'editCustomFields', type: "space" } }, { modalSize: 'modal-xxl', scrollable: true, modalBodyHeight: "53em" })}
                 >
                    Edit Custom Fields
                </button>

                <hr />

            </div>

            <div className="tab-content" id="v-pills-tabContent" style={{width:100 + '%'}}>

                <div 
                    className={`tab-pane fade ${ tabSelected == 'worspace-users' ? 'show active' : '' }`}
                    id="worskpace-users" 
                    role="tabpanel" 
                    aria-labelledby="task-types-body" 
                    tabindex="0"
                >
                    <WorkspaceUsers />
                </div>


                <div 
                    className={`tab-pane fade ${ tabSelected == 'user-settings' ? 'show active' : '' }`}
                    id="user-settings" 
                    role="tabpanel" 
                    aria-labelledby="user-settings-tab" 
                    tabindex="0"
                >
                    <UserSettings />
                </div>

                <div 
                    className={`tab-pane fade ${ tabSelected == 'subscription' ? 'show active' : '' }`}
                    id="subscription" 
                    role="tabpanel" 
                    aria-labelledby="subscription-tab" 
                    tabindex="0"
                >
                    <Subscription />
                </div>

            </div>
        </div>
    )
}

export default WorkspaceSettings;