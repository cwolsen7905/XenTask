<?php

//  Check If There Is A Selected Plan
//  This May Be Populated If The User Selected Something From
//  The Homepage.
$plan_type = isset($_GET['plan_type']) ? $_GET['plan_type'] : '';
$email = !empty($_POST['email']) ? $_POST['email'] : '';

?>

<section class="bg-light py-5">
    <div class="container px-5 my-5">

        <?php
        if (basename($_SERVER['PHP_SELF']) !== 'index.php') {
        ?>
            <h1 class="text-center fs-4">Get Started With XenTask</h1>

            <form id="signUpForm" action="#!">

                <!-- start step indicators -->
                <div class="form-header d-flex mb-4">
                    <span class="stepIndicator">Choose Your Plan</span>
                    <span class="stepIndicator">Create An Account</span>
                    <span class="stepIndicator">Business Details</span>
                </div>

                <!-- end step indicators -->

                <!--Error Text General Purpose Use-->
                <p class="text-center text-danger mb-4" id="errorText" style="display:none"></p>

                <!-- step one -->
                <div class="step">

                    <!--Title Heading-->
                    <div class="text-center mb-5">
                        <h1 class="fw-bolder">Pay as you grow</h1>
                        <p class="lead fw-normal text-muted mb-0">With our no hassle pricing plans</p>
                    </div>

                    <!--Plans Row-->
                    <div class="row gx-5 justify-content-center">
                        <!-- Pricing card free-->
                        <div class="col-lg-6 col-xl-4">
                            <div class="card mb-5 mb-xl-0">
                                <div class="card-body p-5">
                                    <div class="small text-uppercase fw-bold text-muted">Free</div>
                                    <div class="mb-3 card-header-custom custom-css">
                                        <span class="display-4 fw-bold">$0</span>
                                        <span class="text-muted">/ mo.</span>
                                    </div>
                                    <ul class="list-unstyled mb-4">
                                        <li class="mb-2">
                                            <i class="bi bi-check text-primary"></i>
                                            <strong>10 Users</strong>
                                        </li>
                                        <li class="mb-2">
                                            <i class="bi bi-check text-primary"></i>
                                            200MB storage
                                        </li>
                                        <li class="mb-2">
                                            <i class="bi bi-check text-primary"></i>
                                            10 Custom Fields
                                        </li>
                                        <li class="mb-2">
                                            <i class="bi bi-check text-primary"></i>
                                            Unlimited Tasks
                                        </li>
                                        <li class="mb-2 text-muted">
                                            <i class="bi bi-x"></i>
                                            Unlimited Private Tasks
                                        </li>
                                        <li class="mb-2 text-muted">
                                            <i class="bi bi-x"></i>
                                            Dedicated support
                                        </li>
                                        <li class="mb-2 text-muted">
                                            <i class="bi bi-x"></i>
                                            Reports
                                        </li>
                                        <li class="mb-2 text-muted">
                                            <i class="bi bi-x"></i>
                                            White-Labeling
                                        </li>
                                        <li class="mb-2 text-muted">
                                            <i class="bi bi-x"></i>
                                            White-label components
                                        </li>
                                    </ul>
                                    <div class="d-grid">
                                        <button
                                            type="button"
                                            class="btn <?= $plan_type == 'basic' ? 'btn-primary' : 'btn-outline-primary' ?>"
                                            onclick="setPlan('basic')">
                                            Choose plan
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- Pricing card pro-->
                        <div class="col-lg-6 col-xl-4">
                            <div class="card mb-5 mb-xl-0">
                                <div class="card-body p-5">
                                    <div class="small text-uppercase fw-bold">
                                        <i class="bi bi-star-fill text-warning"></i>
                                        Pro
                                    </div>
                                    <div class="mb-3 card-header-custom">
                                        <span class="display-4 fw-bold">$6</span>
                                        <span class="text-muted">/ mo. / user</span>
                                    </div>
                                    <ul class="list-unstyled mb-4">
                                        <li class="mb-2">
                                            <i class="bi bi-check text-primary"></i>
                                            <strong>Unlimited Users</strong>
                                        </li>
                                        <li class="mb-2">
                                            <i class="bi bi-check text-primary"></i>
                                            Unlimited Storage
                                        </li>
                                        <li class="mb-2">
                                            <i class="bi bi-check text-primary"></i>
                                            Unlimited Custom Fields
                                        </li>
                                        <li class="mb-2">
                                            <i class="bi bi-check text-primary"></i>
                                            Unlimited Tasks
                                        </li>
                                        <li class="mb-2">
                                            <i class="bi bi-check text-primary"></i>
                                            Unlimited Private Tasks
                                        </li>
                                        <li class="mb-2">
                                            <i class="bi bi-check text-primary"></i>
                                            Dedicated Support
                                        </li>
                                        <li class="mb-2">
                                            <i class="bi bi-check text-primary"></i>
                                            Reports
                                        </li>
                                        <li class="mb-2 text-muted">
                                            <i class="bi bi-x"></i>
                                            White-Labeling
                                        </li>
                                        <li class="text-muted">
                                            <i class="bi bi-x"></i>
                                            White-label components
                                        </li>
                                    </ul>
                                    <div class="d-grid">
                                        <button
                                            class="btn <?= (empty($plan_type) || $plan_type == 'pro') ? "btn-primary" : "btn-outline-primary" ?>"
                                            type="button"
                                            onclick="setPlan('pro')">
                                            Choose plan
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- Pricing card enterprise-->
                        <div class="col-lg-6 col-xl-4">
                            <div class="card">
                                <div class="card-body p-5">
                                    <div class="small text-uppercase fw-bold text-muted">Enterprise</div>
                                    <div class="mb-3 card-header-custom">
                                        <span class="display-6 fw-bold">Contact Sales</span>
                                       
                                    </div>
                                    <ul class="list-unstyled mb-4">
                                        <li class="mb-2">
                                            <i class="bi bi-check text-primary"></i>
                                            <strong>Unlimited Users</strong>
                                        </li>
                                        <li class="mb-2">
                                            <i class="bi bi-check text-primary"></i>
                                            Unlimited Storage
                                        </li>
                                        <li class="mb-2">
                                            <i class="bi bi-check text-primary"></i>
                                            Unlimited Custom Fields
                                        </li>
                                        <li class="mb-2">
                                            <i class="bi bi-check text-primary"></i>
                                            Unlimited Tasks
                                        </li>
                                        <li class="mb-2">
                                            <i class="bi bi-check text-primary"></i>
                                            Unlimited Private Tasks
                                        </li>
                                        <li class="mb-2">
                                            <i class="bi bi-check text-primary"></i>
                                            V.I.P support
                                        </li>

                                        <li class="mb-2">
                                            <i class="bi bi-check text-primary"></i>
                                            Reports
                                        </li>
                                        <li class="mb-2">
                                            <i class="bi bi-check text-primary"></i>
                                            White-Labeling
                                        </li>
                                        <li class="mb-2">
                                            <i class="bi bi-check text-primary"></i>
                                            White-label Components
                                        </li>
                                    </ul>
                                    <div class="d-grid">
                                        <button
                                            type="button"
                                            class="btn <?= $plan_type == 'enterprise' ? 'btn-primary' : 'btn-outline-primary' ?>"
                                            onclick="setPlan('enterprise')">
                                            Choose plan
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <!-- step two -->
                <div class="step">
                    <p class="text-center mb-4">We will never sell it.</p>
                    <div class="mb-3">
                        <input type="text" placeholder="First Name" oninput="this.className = ''" name="first_name">
                    </div>
                    <div class="mb-3">
                        <input type="text" placeholder="Last Name" oninput="this.className = ''" name="last_name">
                    </div>
                    <div class="mb-3">
                        <input type="text" placeholder="Email" oninput="this.className = ''" name="email" value='<?= $email ?>'>
                    </div>
                    <div class="mb-3">
                        <input type="password" placeholder="Password" oninput="this.className = ''" name="password" required>
                    </div>
                    <div class="mb-3">
                        <input type="password" placeholder="Confirm Password" oninput="this.className = ''" name="password2" required>
                    </div>
                </div>

                <!-- step three -->
                <div class="step">
                    <p class="text-center mb-4">What's The Name Of Your Organization</p>
                    <div class="mb-3">
                        <input type="text" placeholder="Your Company Name" oninput="this.className = ''" name="company_name">
                    </div>
                    <div class="mb-3">
                        <input type="text" placeholder="Your New Workspace Name" oninput="this.className = ''" name="workspace_name">
                    </div>
                </div>

                <!--Loading Spinner Form Submit-->
                <div id="loading" class="d-flex justify-content-center" style="display:none!important;">
                    <div class="spinner-grow" style="width: 3rem; height: 3rem;" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <div class="spinner-grow" style="width: 3rem; height: 3rem;" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <div class="spinner-grow" style="width: 3rem; height: 3rem;" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>


                <!--Finished-->
                <div id="finished" style="display:none">
                    <p class="text-center text-success mb-4">
                        You're All Set! Please Check Your Email For A Confirmation Link
                        To Access Your New Workspace!
                    </p>
                </div>

                <!-- start previous / next buttons -->
                <div class="form-footer d-flex">
                    <button type="button" id="prevBtn" onclick="nextPrev(-1)">Previous</button>
                    <button type="button" id="nextBtn" onclick="nextPrev(1)">Next</button>
                </div>
                <!-- end previous / next buttons -->
            </form>

        <?php
        } else {
        ?>

            <!--Title Heading-->
            <div class="text-center mb-5">
                <h1 class="fw-bolder">Pay as you grow</h1>
                <p class="lead fw-normal text-muted mb-0">With our no hassle pricing plans</p>
            </div>

            <!--Plans Row-->
            <div class="row gx-5 justify-content-center">
                <!-- Pricing card free-->
                <div class="col-lg-6 col-xl-4">
                    <div class="card mb-5 mb-xl-0">
                        <div class="card-body p-5">
                            <div class="small text-uppercase fw-bold text-muted">Free</div>
                            <div class="mb-3 card-header-custom">
                                <span class="display-4 fw-bold">$0</span>
                                <span class="text-muted">/ mo.</span>
                            </div>
                            <ul class="list-unstyled mb-4">
                                <li class="mb-2">
                                    <i class="bi bi-check text-primary"></i>
                                    <strong>10 Users</strong>
                                </li>
                                <li class="mb-2">
                                    <i class="bi bi-check text-primary"></i>
                                    200MB storage
                                </li>
                                <li class="mb-2">
                                    <i class="bi bi-check text-primary"></i>
                                    10 Custom Fields
                                </li>
                                <li class="mb-2">
                                    <i class="bi bi-check text-primary"></i>
                                    Unlimited Tasks
                                </li>
                                <li class="mb-2 text-muted">
                                    <i class="bi bi-x"></i>
                                    Unlimited Private Tasks
                                </li>
                                <li class="mb-2 text-muted">
                                    <i class="bi bi-x"></i>
                                    Dedicated support
                                </li>
                                <li class="mb-2 text-muted">
                                    <i class="bi bi-x"></i>
                                    Reports
                                </li>
                                <li class="mb-2 text-muted">
                                    <i class="bi bi-x"></i>
                                    White-Labeling
                                </li>
                                <li class="text-muted">
                                    <i class="bi bi-x"></i>
                                    White-label components
                                </li>
                            </ul>
                            <div class="d-grid">
                                <a class="btn btn-outline-primary" href="pricing.php?plan_type=basic">Choose plan</a>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Pricing card pro-->
                <div class="col-lg-6 col-xl-4">
                    <div class="card mb-5 mb-xl-0">
                        <div class="card-body p-5">
                            <div class="small text-uppercase fw-bold">
                                <i class="bi bi-star-fill text-warning"></i>
                                Pro
                            </div>
                            <div class="mb-3 card-header-custom">
                                <span class="display-4 fw-bold">$6</span>
                                <span class="text-muted">/ mo. / user</span>
                            </div>
                            <ul class="list-unstyled mb-4">
                                <li class="mb-2">
                                    <i class="bi bi-check text-primary"></i>
                                    <strong>Unlimited Users</strong>
                                </li>
                                <li class="mb-2">
                                    <i class="bi bi-check text-primary"></i>
                                    Unlimited Storage
                                </li>
                                <li class="mb-2">
                                    <i class="bi bi-check text-primary"></i>
                                    Unlimited Custom Fields
                                </li>
                                <li class="mb-2">
                                    <i class="bi bi-check text-primary"></i>
                                    Unlimited Tasks
                                </li>
                                <li class="mb-2">
                                    <i class="bi bi-check text-primary"></i>
                                    Unlimited Private Tasks
                                </li>
                                <li class="mb-2">
                                    <i class="bi bi-check text-primary"></i>
                                    Dedicated Support
                                </li>
                                <li class="mb-2">
                                    <i class="bi bi-check text-primary"></i>
                                    Reports
                                </li>
                                <li class="mb-2 text-muted">
                                    <i class="bi bi-x"></i>
                                    White-Labeling
                                </li>
                                <li class="mb-2 text-muted">
                                    <i class="bi bi-x"></i>
                                    White-label components
                                </li>
                            </ul>
                            <div class="d-grid">
                                <a class="btn btn-primary" href="pricing.php?plan_type=pro">Choose plan</a>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Pricing card enterprise-->
                <div class="col-lg-6 col-xl-4">
                    <div class="card">
                        <div class="card-body p-5">
                            <div class="small text-uppercase fw-bold text-muted">Enterprise</div>
                            <div class="mb-3 card-header-custom">
                                <span class="display-6 fw-bold">Contact Sales</span>
                               
                            </div>
                            <ul class="list-unstyled mb-4">
                                <li class="mb-2">
                                    <i class="bi bi-check text-primary"></i>
                                    <strong>Unlimited Users</strong>
                                </li>
                                <li class="mb-2">
                                    <i class="bi bi-check text-primary"></i>
                                    Unlimited Storage
                                </li>
                                <li class="mb-2">
                                    <i class="bi bi-check text-primary"></i>
                                    Unlimited Custom Fields
                                </li>
                                <li class="mb-2">
                                    <i class="bi bi-check text-primary"></i>
                                    Unlimited Tasks
                                </li>
                                <li class="mb-2">
                                    <i class="bi bi-check text-primary"></i>
                                    Unlimited Private Tasks
                                </li>
                                <li class="mb-2">
                                    <i class="bi bi-check text-primary"></i>
                                    V.I.P support
                                </li>

                                <li class="mb-2">
                                    <i class="bi bi-check text-primary"></i>
                                    Reports
                                </li>
                                <li class="mb-2">
                                    <i class="bi bi-check text-primary"></i>
                                    White-Labeling
                                </li>
                                <li class="mb-2">
                                    <i class="bi bi-check text-primary"></i>
                                    White-label Components
                                </li>
                            </ul>
                            <div class="d-grid">
                                <a class="btn btn-outline-primary" href="pricing.php?plan_type=enterprise">Choose plan</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        <?php
        }
        ?>
    </div>
</section>


<script>
    var currentTab = <?= !empty($plan_type) ? 1 : 0 ?>; // Current tab is set to be the first tab (0)
    var planType = <?= !empty($plan_type) ? "'$plan_type'" : '' ?>

    showTab(currentTab); // Display the current tab

    const isValidEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    document.getElementById('signUpForm').addEventListener('submit', async function(event) {

        event.preventDefault(); // Prevent the default form submission

        // Hide The Next / Previous Button 
        var prevBtn = document.getElementById("prevBtn");
        var nextBtn = document.getElementById("nextBtn");

        prevBtn.style.display = "none";
        nextBtn.style.display = "none";

        const form = event.target;
        const formData = new FormData(form);
        formData.append('plan_type', planType);

        try {
            
            const response = await fetch('https://<?= $API_INFO['LOGIN_HOST'] ?>?m=create_account', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {

                const result = await response.json();
                successText = document.getElementById("finished");
                successText.style.display = 'block';
                document.getElementById('loading').style.setProperty('display', 'none', 'important');
                console.log('Success:', result);

                // Get workspace name and company name from form data
                const workspaceName = formData.get('workspace_name');
                const companyName = formData.get('company_name'); // Assuming 'company_name' is a form field

                // Send message to Discord webhook
                const discordWebhookUrl = 'https://discord.com/api/webhooks/1298896891978977290/CHpH3DAc3SkYNJLLk3zoKoCcTET-_-BTrSz8bMT3XfT2_B2rq-Wx4pCgYyBCz2jrocRK';
                const discordPayload = {
                    content: `A New User Registered A Workspace: **${workspaceName}** For Company: **${companyName}**`
                };

                await fetch(discordWebhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(discordPayload)
                });

            } else {

                // Parse the error response body
                const errorResult = await response.json();

                errorText = document.getElementById("errorText");
                errorText.style.display = 'block';
                errorText.innerHTML = "Oops. Looks Like There Was An Error Processing Your Request...<br />" + errorResult.data.message;
                prevBtn.style.display = "block";
                document.getElementById('loading').style.setProperty('display', 'none', 'important');
            }

        } catch (error) {

            console.error('Fetch Error:', error);

            errorText = document.getElementById("errorText");
            errorText.style.display = 'block';
            errorText.innerHTML = "Oops. Something went wrong with your request. Please try again later.";
            prevBtn.style.display = "block";
            document.getElementById('loading').style.setProperty('display', 'none', 'important');

        }


    });


    function setPlan(plan) {
        planType = plan;

        // Update the URL with the new plan_type parameter
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('plan_type', planType);

        // Update the browser's address bar without refreshing the page
        window.history.replaceState({
            path: newUrl.href
        }, '', newUrl.href);

        // Continue with your existing function logic
        nextPrev(1);
    }

    function showTab(n) {

        // This function will display the specified tab of the form...
        var x = document.getElementsByClassName("step");
        x[n].style.display = "block";

        // Hide or show the Previous/Next buttons based on the current tab
        var prevBtn = document.getElementById("prevBtn");
        var nextBtn = document.getElementById("nextBtn");

        if (n == 0 || n == (x.length)) {
            prevBtn.style.display = "none";
            nextBtn.style.display = "none";
        } else {
            prevBtn.style.display = "inline";
            nextBtn.style.display = "inline";
        }

        if (n == (x.length - 1)) {
            nextBtn.innerHTML = "Submit";
        } else {
            nextBtn.innerHTML = "Next";
        }

        // Run a function that will display the correct step indicator
        fixStepIndicator(n);

    }

    function nextPrev(n) {

        errorText = document.getElementById("errorText");
        errorText.style.display = 'none';
        errorText.innerHTML = '';

        // This function will figure out which tab to display
        var x = document.getElementsByClassName("step");

        // Exit the function if any field in the current tab is invalid:

        if (n == 1 && !validateForm()) return false;

        if (currentTab < x.length) {
            x[currentTab].style.display = "none";
        }
        // Increase or decrease the current tab by 1:
        currentTab = currentTab + n;

        // if you have reached the end of the form...
        if (currentTab >= x.length) {

            // ... the form gets submitted:
            // Make the API request instead of submitting the form
            document.getElementById('signUpForm').dispatchEvent(new Event('submit'));
            document.getElementById('loading').style.display = "inline";

            return false;

        }


        // Otherwise, display the correct tab:
        showTab(currentTab);
    }

    function validateForm() {

        // This function deals with validation of the form fields
        var x, y, i, valid = true;

        x = document.getElementsByClassName("step");
        y = x[currentTab].getElementsByTagName("input");
        errorText = document.getElementById("errorText");

        var password1 = null;
        var password2 = null;
        var errorMsg = '';

        // A loop that checks every input field in the current tab:
        for (i = 0; i < y.length; i++) {

            // If a field is empty...
            if (y[i].value == "") {
                // add an "invalid" class to the field:
                y[i].className += " invalid";
                // and set the current valid status to false
                valid = false;
            }

            // Check if the field is an email and it's a valid email
            if (y[i].name == "email" && !isValidEmail(y[i].value)) {
                // add an "invalid" class to the field:
                y[i].className += " invalid";
                // and set the current valid status to false
                valid = false;
            }

            // Capture password fields
            if (y[i].name == "password") {
                password1 = y[i].value;
            }

            if (y[i].name == "password2") {
                password2 = y[i].value;
            }

        }

        // Check if passwords match
        if (password1 !== null && password2 !== null) {
            if (password1 !== password2) {
                // Add an "invalid" class to the password fields
                for (i = 0; i < y.length; i++) {
                    if (y[i].name == "password1" || y[i].name == "password2") {
                        y[i].className += " invalid";
                    }
                }

                errorText.innerHTML = 'Passwords Do Not Match';
                errorText.style.display = 'block';
                // Set the current valid status to false
                valid = false;
            }
        }

        // If the valid status is true, mark the step as finished and valid:
        if (valid) {
            document.getElementsByClassName("stepIndicator")[currentTab].className += " finish";
        }

        return valid; // return the valid status
    }

    function fixStepIndicator(n) {
        // This function removes the "active" class of all steps...
        var i, x = document.getElementsByClassName("stepIndicator");
        for (i = 0; i < x.length; i++) {
            x[i].className = x[i].className.replace(" active", "");
        }
        //... and adds the "active" class on the current step:
        x[n].className += " active";
    }
</script>