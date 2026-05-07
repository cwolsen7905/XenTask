import { useContext, useRef, useState } from 'react';
import { useData } from '../../../../Contexts/DataContext';
import { useUI } from '../../../../Contexts/UIContext';
import Payments from '../../../../Billing/Payments';

import Alerts from '../../../../Alerts';

import axios from 'axios';

const Subscription = () => {

    const { globalData } = useData();

    const { openModal } = useUI();

    const [tabOn, setTabOn] = useState('overview');

    const [showAlert, setShowAlert] = useState(false);

    const data = {

        type: 'basic',
        active: false,
        user_count: 6,
        storage_used: '1MB',
        expires: '2025-01-01',

    }

    const handlePlanSelection = (selected) => {

        //  The User Has Selected A Plan Thats Lower Than The Current
        //  And The Current Plan Is Still Active
        if (

            (
                data.type == 'pro' && selected == 'basic' ||
                data.type == 'enterprise' && (selected == 'pro' || 'basic')
            ) && data.active == true
        ) {

            setShowAlert(true);

        } else {
            
            let _price = 0;

            switch( selected ) {

                case('pro'):
                    _price = 12.00;
                break;

                case('enterprise'):
                    _price = 50.00;
                break;

            }

            let item = {
                title: selected + 'Plan',
                price: _price * data.user_count,
                breakdown_description: `${_price} x ${data.user_count}`,
            };

            //console.log(item);

            openModal('Checkout',
                {
                    type:'checkout',
                    compProps: {
                        items:[item],
                    }
                },
                {
                    modalSize: 'modal-xl'
                }
            );
        }

    }




    return (
        <>
            <h4><u>Subscription</u></h4>

            <ul className="nav nav-tabs">

                <li className="nav-item">
                    <a className={`nav-link ${tabOn === 'overview' ? 'active' : ''}`} onClick={() => setTabOn('overview')} href="#">
                        Overview
                    </a>
                </li>

                <li className="nav-item">
                    <a className={`nav-link ${tabOn === 'plans' ? 'active' : ''}`} onClick={() => setTabOn('plans')} href="#">Plans</a>
                </li>

                <li className="nav-item">
                    <a className={`nav-link ${tabOn === 'payments' ? 'active' : ''}`} onClick={() => setTabOn('payments')} href="#">Payments</a>
                </li>

                <li className="nav-item">
                    <a className={`nav-link ${tabOn === 'invoices' ? 'active' : ''}`} onClick={() => setTabOn('invoices')} href="#">Invoices</a>
                </li>

            </ul>

            <div className="tab-content" id="myTabContent">

                <div className={`tab-pane fade ${tabOn === 'overview' ? 'show active' : ''}`} role="tabpanel" aria-labelledby="overview-tab">
                    <div className="card border-info mb-3">
                        <div className="card-header d-flex justify-content-between align-items-center">

                            <h4 className="card-text">Current Plan</h4>

                            {data.active == false &&
                                <button type="button" className='btn btn-success mt-2 me-2 float-end' onClick={() => setTabOn('plans')}>
                                    Re-Activate
                                </button>
                            }

                        </div>
                        <div className="card-body">

                            <h5 className="card-title"> Pro - <span className={data.active ? 'text-success' : 'text-danger'}>{data.active ? 'Active' : 'Not Active'}</span></h5>

                            <p className="card-text">$12 / User | Billed Monthly</p>

                            <h5>Available Seats</h5>
                            <p>6 / 10</p>

                            <h5>Storage</h5>
                            <p>7.5 / 10GB Used</p>
                            <div className="progress" role="progressbar" aria-label="Warning example" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">
                                <div className="progress-bar bg-warning text-dark" style={{ width: 75 + "%" }}></div>
                            </div>



                            <button type="button" className='btn btn-success mt-2 me-2' onClick={() => setTabOn('plans')}>
                                Upgrade
                            </button>

                            {
                                data.active &&
                                <button type="button" className='btn btn-danger mt-2'>Cancel Subscription</button>
                            }

                        </div>
                    </div>
                </div>

                <div className={`tab-pane fade ${tabOn === 'plans' ? 'show active' : ''}`} role="tabpanel" aria-labelledby="payments-tab">

                    <div className="row gx-5 mt-2 justify-content-center">

                        {/* Pricing card Free */}
                        <div className="col-lg-6 col-xl-4">
                            <div className="card mb-5 mb-xl-0">
                                <div className="card-body p-5">
                                    <div className="small text-uppercase fw-bold text-muted">Free</div>
                                    <div className="mb-3">
                                        <span className="display-4 fw-bold">$0</span>
                                        <span className="text-muted">/ mo.</span>
                                    </div>
                                    <ul className="list-unstyled mb-4">
                                        <li className="mb-2">
                                            <i className="bi bi-check text-primary"></i>
                                            <strong>10 Users</strong>
                                        </li>
                                        <li className="mb-2">
                                            <i className="bi bi-check text-primary"></i>
                                            <strong>200 MB Storage</strong>
                                        </li>
                                        <li className="mb-2">
                                            <i className="bi bi-check text-primary"></i>
                                            <strong>10 Custom Fields</strong>
                                        </li>
                                        <li className="mb-2">
                                            <i className="bi bi-check text-primary"></i>
                                            <strong>Unlimited Tasks</strong>
                                        </li>
                                        <li className="mb-2 text-muted">
                                            <i className="bi bi-x"></i>
                                            <s>Unlimited Private Tasks</s>
                                        </li>
                                        <li className="mb-2 text-muted">
                                            <i className="bi bi-x"></i>
                                            <s>Dedicated support</s>
                                        </li>
                                        <li className="mb-2 text-muted">
                                            <i className="bi bi-x"></i>
                                            <s>Monthly status reports</s>
                                        </li>
                                        <li className="text-muted mb-2">
                                            <i className="bi bi-x"></i>
                                            <s>White-labeling</s>
                                        </li>
                                        <li className="text-muted">
                                            <i className="bi bi-x"></i>
                                            <s>White-label components</s>
                                        </li>
                                    </ul>
                                    <div className="d-grid">
                                        {
                                            data.type == 'basic' ?
                                                <button type="button" className="btn btn-success" disabled>Enrolled</button> :
                                                <button type="button" className="btn btn-outline-primary" onClick={() => handlePlanSelection('basic')}>Choose plan</button>
                                        }

                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Pricing card Pro */}
                        <div className="col-lg-6 col-xl-4">
                            <div className="card mb-5 mb-xl-0">
                                <div className="card-body p-5">
                                    <div className="small text-uppercase fw-bold">
                                        <i className="bi bi-star-fill text-warning"></i>
                                        Pro
                                    </div>
                                    <div className="mb-3">
                                        <span className="display-4 fw-bold">$12</span>
                                        <span className="text-muted">/ mo. / user</span>
                                    </div>
                                    <ul className="list-unstyled mb-4">
                                        <li className="mb-2">
                                            <i className="bi bi-check text-primary"></i>
                                            <strong>Unlimited Users</strong>
                                        </li>
                                        <li className="mb-2">
                                            <i className="bi bi-check text-primary"></i>
                                            <strong>Unlimited Storage</strong>
                                        </li>
                                        <li className="mb-2">
                                            <i className="bi bi-check text-primary"></i>
                                            <strong>Unlimited Custom Fields</strong>
                                        </li>
                                        <li className="mb-2">
                                            <i className="bi bi-check text-primary"></i>
                                            <strong>Unlimited Tasks</strong>
                                        </li>
                                        <li className="mb-2">
                                            <i className="bi bi-check text-primary"></i>
                                            <strong>Unlimited Private Tasks</strong>
                                        </li>
                                        <li className="mb-2">
                                            <i className="bi bi-check text-primary"></i>
                                            <strong>Dedicated Support</strong>
                                        </li>
                                        <li className="mb-2">
                                            <i className="bi bi-check text-primary"></i>
                                            <strong>Monthly Status Report</strong>
                                        </li>
                                        <li className="text-muted mb-2">
                                            <i className="bi bi-x"></i>
                                            <s>White-labeling</s>
                                        </li>
                                        <li className="text-muted">
                                            <i className="bi bi-x"></i>
                                            <s>White-label components</s>
                                        </li>
                                    </ul>
                                    <div className="d-grid">
                                        {
                                            data.type == 'pro' ?
                                                <button type="button" className="btn btn-success" disabled>Enrolled</button> :
                                                <button type="button" className="btn btn-outline-primary" onClick={() => handlePlanSelection('pro')}>Choose plan</button>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Pricing card enterprise */}
                        <div className="col-lg-6 col-xl-4">
                            <div className="card">
                                <div className="card-body p-5">
                                    <div className="small text-uppercase fw-bold text-muted">Enterprise</div>
                                    <div className="mb-3">
                                        <span className="display-4 fw-bold">$50</span>
                                        <span className="text-muted">/ mo. / user</span>
                                    </div>
                                    <ul className="list-unstyled mb-4">
                                        <li className="mb-2">
                                            <i className="bi bi-check text-primary"></i>
                                            <strong>Unlimited Users</strong>
                                        </li>
                                        <li className="mb-2">
                                            <i className="bi bi-check text-primary"></i>
                                            <strong>Unlimited Storage</strong>
                                        </li>
                                        <li className="mb-2">
                                            <i className="bi bi-check text-primary"></i>
                                            <strong>Unlimited Custom Fields</strong>
                                        </li>
                                        <li className="mb-2">
                                            <i className="bi bi-check text-primary"></i>
                                            <strong>Unlimited Tasks</strong>
                                        </li>
                                        <li className="mb-2">
                                            <i className="bi bi-check text-primary"></i>
                                            <strong>Unlimited Private Tasks</strong>
                                        </li>
                                        <li className="mb-2">
                                            <i className="bi bi-check text-primary"></i>
                                            <strong>V.I.P support</strong>
                                        </li>

                                        <li className="mb-2">
                                            <i className="bi bi-check text-primary"></i>
                                            <strong>Monthly Status Reports</strong>
                                        </li>
                                        <li className="mb-2">
                                            <i className="bi bi-check text-primary"></i>
                                            <strong>White-Labeling</strong>
                                        </li>
                                        <li className="mb-2">
                                            <i className="bi bi-check text-primary"></i>
                                            <strong>White-label Components</strong>
                                        </li>
                                    </ul>
                                    <div className="d-grid">
                                        {
                                            data.type == 'enterprise' ?
                                                <button type="button" className="btn btn-success" disabled>Active</button> :
                                                <button type="button" className="btn btn-outline-primary" onClick={() => handlePlanSelection('enterprise')}>Choose plan</button>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`tab-pane fade ${tabOn === 'payments' ? 'show active' : ''}`} role="tabpanel" aria-labelledby="home-tab">
                    <Payments />
                </div>

                <div className={`tab-pane fade ${tabOn === 'invoices' ? 'show active' : ''}`} role="tabpanel" aria-labelledby="invoices-tab">
                    invoices
                </div>

            </div >


            <Alerts
                showAlert={showAlert}
                hasOverlay={false}
                varient={"primary"}
                showCancelButton={false}
                confirmAction={() => { setShowAlert(false) }}
                cancelAction={() => { setShowAlert(false) }}
            >
                <p>The plan you've chosen is a downgrade from your current one. To proceed, please cancel your current subscription first.</p>

            </Alerts>
        </>
    )

}

export default Subscription;