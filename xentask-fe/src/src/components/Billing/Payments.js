import { useState } from 'react';
import { useData } from '../Contexts/DataContext';
import { useUI } from '../Contexts/UIContext';


import axios from 'axios';

const Payments = () => {

    const { globalData } = useData();
    const { showToastNotification } = useUI();
    

    const data = {
        id: 123456,
        last_four: '9876',
        expires: '04/31',
    }

    const [paymentFormVisible, setPaymentForm] = useState(false);


    const submitForm = async (e) => {

        e.preventDefault();

        const formData = new FormData(e.target);

        // Convert FormData to a plain object to send in a JSON format
        const data = Object.fromEntries( formData.entries() );

        try {
            const response = await axios.post(`https://${globalData.api_url}/billing/${globalData.USER.default_workspace}/authorize`, data, { withCredentials: true });
            
            if( response.status == 200 ){
                setPaymentForm(false);
                showToastNotification({
                    message: "Credit Card Information Has Been Updated",
                });

            } else {

                showToastNotification({
                    message: "The Credit Card You Provided Was Invalid Please Check Your Information And Try Again.",
                    type: 'danger'
                });

            }
        } catch (error) {

            showToastNotification({
                message: "There Was A Problem Validating Your Credit Card",
                type: 'danger'
            });

            console.error('Error submitting form:', error);
        }
    };


    return (
        <>
            <div className="mb-2">
                <div style={{ maxHeight: '500px', overflowX: 'hidden', overflowY: 'auto' }}>
                    <div className="row mt-2" key={data.id}>
                        <div className="mb-3 mb-sm-0">
                            <button className="btn btn-outline-secondary text-start w-100">
                                <div className="card-body">
                                    <div className="d-flex justify-content-evenly">
                                        <p className="fs-4 mb-0"><i className="fa-brands fa-cc-visa"></i> ···· {data.last_four}</p>
                                        <p className="fs-4 mb-0">Expires {data.expires}</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Add New Card */}

                {!paymentFormVisible &&
                    <div className="row mt-2" >
                        <div className="mb-3 mb-sm-0">
                            <button className="btn btn-outline-primary text-start w-100" onClick={() => { setPaymentForm(true) }}>
                                <div className="card-body">

                                    <div className="d-flex justify-content-center">
                                        <p className="fs-4 mb-0"><i className="fa-solid fa-credit-card"></i>
                                            &nbsp;{data ? 'Update' : 'Add New'} Card
                                        </p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                }

            </div>



            {paymentFormVisible && (

                <div className="col-md-12 order-md-1">
                    <div className="card">
                        <div className="card-body">
                            <h4 className="mb-3">Billing address</h4>
                            <form onSubmit={submitForm}>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="firstName">First name</label>
                                        <input type="text" className="form-control" name="firstName" id="firstName" required />
                                        <div className="invalid-feedback">Valid first name is required.</div>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="lastName">Last name</label>
                                        <input type="text" className="form-control" name="lastName" id="lastName" required />
                                        <div className="invalid-feedback">Valid last name is required.</div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="email">Email <span className="text-muted">(Optional)</span></label>
                                    <input type="email" className="form-control" name="email" id="email" placeholder="you@example.com" />
                                    <div className="invalid-feedback">Please enter a valid email address for shipping updates.</div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="address">Address</label>
                                    <input type="text" className="form-control" name="address" id="address" placeholder="123 Main St." required />
                                    <div className="invalid-feedback">Please enter your shipping address.</div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="address2">Address 2 <span className="text-muted">(Optional)</span></label>
                                    <input type="text" className="form-control" name="address2" id="address2" placeholder="Apartment or suite" />
                                </div>

                                <div className="row">
                                    <div className="col-md-5 mb-3">
                                        <label htmlFor="city">City</label>
                                        <input type="text" className="form-control" name="city" id="city" required />
                                        <div className="invalid-feedback">City required.</div>
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label htmlFor="state">State</label>
                                        <select className="form-select d-block w-100" id="state" aria-label="Default select example" required>
                                            <option value="">Select A State</option>
                                            <option value="AL">Alabama</option>
                                            <option value="AK">Alaska</option>
                                            <option value="AZ">Arizona</option>
                                            <option value="AR">Arkansas</option>
                                            <option value="CA">California</option>
                                            <option value="CO">Colorado</option>
                                            <option value="CT">Connecticut</option>
                                            <option value="DE">Delaware</option>
                                            <option value="FL">Florida</option>
                                            <option value="GA">Georgia</option>
                                            <option value="HI">Hawaii</option>
                                            <option value="ID">Idaho</option>
                                            <option value="IL">Illinois</option>
                                            <option value="IN">Indiana</option>
                                            <option value="IA">Iowa</option>
                                            <option value="KS">Kansas</option>
                                            <option value="KY">Kentucky</option>
                                            <option value="LA">Louisiana</option>
                                            <option value="ME">Maine</option>
                                            <option value="MD">Maryland</option>
                                            <option value="MA">Massachusetts</option>
                                            <option value="MI">Michigan</option>
                                            <option value="MN">Minnesota</option>
                                            <option value="MS">Mississippi</option>
                                            <option value="MO">Missouri</option>
                                            <option value="MT">Montana</option>
                                            <option value="NE">Nebraska</option>
                                            <option value="NV">Nevada</option>
                                            <option value="NH">New Hampshire</option>
                                            <option value="NJ">New Jersey</option>
                                            <option value="NM">New Mexico</option>
                                            <option value="NY">New York</option>
                                            <option value="NC">North Carolina</option>
                                            <option value="ND">North Dakota</option>
                                            <option value="OH">Ohio</option>
                                            <option value="OK">Oklahoma</option>
                                            <option value="OR">Oregon</option>
                                            <option value="PA">Pennsylvania</option>
                                            <option value="RI">Rhode Island</option>
                                            <option value="SC">South Carolina</option>
                                            <option value="SD">South Dakota</option>
                                            <option value="TN">Tennessee</option>
                                            <option value="TX">Texas</option>
                                            <option value="UT">Utah</option>
                                            <option value="VT">Vermont</option>
                                            <option value="VA">Virginia</option>
                                            <option value="WA">Washington</option>
                                            <option value="WV">West Virginia</option>
                                            <option value="WI">Wisconsin</option>
                                            <option value="WY">Wyoming</option>
                                        </select>
                                        <div className="invalid-feedback">Please provide a valid state.</div>
                                    </div>
                                    <div className="col-md-3 mb-3">
                                        <label htmlFor="zip">Zip</label>
                                        <input type="text" className="form-control" name="zip" id="zip" required />
                                        <div className="invalid-feedback">Zip code required.</div>
                                    </div>
                                </div>

                                <h4 className="mb-3">Payment</h4>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="cc-name">Name on card</label>
                                        <input type="text" className="form-control" name="cc_name" id="cc-name" required />
                                        <small className="text-muted">Full name as displayed on card</small>
                                        <div className="invalid-feedback">Name on card is required.</div>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="cc-number">Credit card number</label>
                                        <input type="number" className="form-control" name="cc_number" id="cc-number" required />
                                        <div className="invalid-feedback">Credit card number is required.</div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-3 mb-3">
                                        <label htmlFor="cc-expiration">Expiration</label>
                                        <input type="text" className="form-control" name="expires" id="cc-expiration" placeholder="mm/yy" required />
                                        <div className="invalid-feedback">Expiration date required.</div>
                                    </div>
                                    <div className="col-md-3 mb-3">
                                        <label htmlFor="cc-cvv">CVV</label>
                                        <input type="text" className="form-control" name="cvv" id="cc-cvv" required />
                                        <div className="invalid-feedback">Security code required.</div>
                                    </div>
                                </div>

                                <hr className="mb-4" />
                                <button className="btn btn-primary btn-lg btn-block me-2" type="submit">Submit</button>
                                <button type="button" className="btn btn-danger btn-lg btn-block" onClick={() => setPaymentForm(false)}>Cancel</button>
                            </form>
                        </div>
                    </div>
                </div>


            )}


        </>

    );

}

export default Payments;