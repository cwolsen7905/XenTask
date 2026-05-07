import Payments from "../../Billing/Payments";

const Checkout = (items) => {


    return (
        <div class="container">
            <div className="row">
                <div className="col-xl-8">
                    <Payments />
                </div>
                <div className="col-xl-4 p-2">

                    <div class="card">
                        <div class="card-header">
                            Summary
                        </div>
                        <ul class="list-group list-group-flush">

                            <li class="list-group-item d-flex justify-content-between lh-condensed">
                                <div>
                                    <h6 class="my-0">Product name</h6>
                                    <small class="text-muted">$12.00 x 6 User(s)</small>
                                </div>
                                <span class="text-muted">$72</span>
                            </li>




                        </ul>
                        <div class="card-footer">
                            <div className="d-flex justify-content-between">
                                <span>Total (USD)</span>
                                <strong>$12.00</strong>
                            </div>
                        </div>
                    </div>

                    <div class="card mt-2 p-2">

                        <div class="input-group">
                            <input type="text" class="form-control" placeholder="Promo code" />
                            <div class="input-group-append">
                                <button type="submit" class="btn btn-primary">Redeem</button>
                            </div>
                        </div>
                        <button type="button" className="btn btn-success mt-2">Pay Now</button>
                    </div>

                    
                
                </div>
            </div>
        </div>

    );

}

export default Checkout;