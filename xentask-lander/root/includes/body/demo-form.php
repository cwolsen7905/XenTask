<section id="demo-section" class="bg-light py-5">
    <div class="container px-5 my-5">
        <h1 class="text-center fs-4">Create a demo workspace</h1>
        <form id="demoSignUpForm">
            <div class="text-center mb-5">
                <h1 class="fw-bolder">Get started for FREE!</h1>
                <p class="lead fw-normal text-muted mb-0">Experience the power of XenTask at no cost</p>
            </div>
            <div id="errorText" class="alert alert-danger" style="display: none;"></div>
            <div id="finished" class="alert alert-success" style="display: none;"></div>
            <div class="mb-3">
                <input type="text" placeholder="First Name" oninput="this.className = ''" name="first_name" required>
            </div>
            <div class="mb-3">
                <input type="text" placeholder="Last Name" oninput="this.className = ''" name="last_name" required>
            </div>
            <div class="mb-3">
                <input type="text" placeholder="Email" oninput="this.className = ''" name="email" value="" required>
            </div>
            <div class="mb-3">
                <input type="text" placeholder="Your Company Name" oninput="this.className = ''" name="company_name">
            </div>
            <div class="mb-3">
                <input type="text" placeholder="Your New Workspace Name" oninput="this.className = ''" name="workspace_name" required>
            </div>
            <div class="mb-3">
                <input type="password" placeholder="Password" oninput="this.className = ''" name="password" required>
            </div>
            <div class="mb-3">
                <input type="password" placeholder="Confirm Password" oninput="this.className = ''" name="password2" required>
            </div>
            <div class="form-footer d-flex">
                <button type="submit" id="submitBtn" style="display: inline;">Create Workspace</button>
            </div>
        </form>
        <div id="loading" style="display: none;">Loading...</div>
    </div>
</section>

<script>
    var API_INFO = '<?= $API_INFO['LOGIN_HOST'] ?>';

    document.getElementById('demoSignUpForm').addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent the default form submission

        // Call validateForm to check for validation errors
        const isValid = validateForm();
        if (!isValid) return; // Stop if the form is not valid

        // Hide loading spinner and display error/success text
        document.getElementById('loading').style.display = 'inline-block';
        document.getElementById("errorText").style.display = 'none';
        document.getElementById("finished").style.display = 'none';

        const form = event.target;
        const formData = new FormData(form);
        formData.append('plan_type', 'basic'); // Set default plan_type to "basic"
        formData.append('auto_confirm', true); // Set default plan_type to "basic"

        try {

            // Send the form data to your API
            const response = await fetch('https://<?= $API_INFO['LOGIN_HOST'] ?>?m=create_account', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if( response.status == 200 ) {

                const result = await response.json();

                if( result.data.message == 'SUCCESS' ) {

                    // Display success message
                    const successText = document.getElementById("finished");
                    successText.style.display = 'block';
                    successText.innerHTML = "Workspace created successfully!";
                    document.getElementById('loading').style.display = 'none';

                    // Get workspace name and company name from form data
                    const workspaceName = formData.get('workspace_name');
                    const companyName = formData.get('company_name'); // Assuming 'company_name' is a form field

                    // Send message to Discord webhook
                    const discordWebhookUrl = 'https://discord.com/api/webhooks/1298896891978977290/CHpH3DAc3SkYNJLLk3zoKoCcTET-_-BTrSz8bMT3XfT2_B2rq-Wx4pCgYyBCz2jrocRK';
                    const discordPayload = {
                        content: `A New User Registered A Workspace: **${workspaceName}** For Company: **${companyName}** VIA Demo Page`
                    };

                    // Push custom event to GTM dataLayer
                    window.dataLayer = window.dataLayer || [];
                    window.dataLayer.push({
                        event: 'formSubmission',
                        formId: 'demoSignUpForm',
                        workspaceName,
                        companyName
                    });


                    let redirect = "https://go.xentask.com/";

                    if (API_INFO == "xentask-login.dev.your-domain.com") redirect = 'https://xentask-fe.dev.your-domain.com/'

                    window.location.href = redirect;

                }


            } else {

                // Parse the error response body
                const errorResult = await response.json();

                errorText = document.getElementById("errorText");
                errorText.style.display = 'block';
                errorText.innerHTML = "Oops. Looks Like There Was An Error Processing Your Request...<br />" + errorResult.data.message;
                document.getElementById('loading').style.setProperty('display', 'none', 'important');

            }

        } catch (error) {

            // Handle network or other errors
            console.error('Fetch Error:', error);

            const errorText = document.getElementById("errorText");
            errorText.style.display = 'block';
            errorText.innerHTML = "Oops. Something went wrong with your request. Please try again later.";
            document.getElementById('loading').style.display = 'none';
        }

    });


    function validateForm() {
        // This function deals with validation of the form fields
        var y, i, valid = true;

        y = document.getElementsByTagName("input");
        errorText = document.getElementById("errorText");

        var password1 = null;
        var password2 = null;

        // A loop that checks every input field in the form:
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

        return valid; // return the valid status
    }
</script>