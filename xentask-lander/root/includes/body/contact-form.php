<!-- Page content-->
<section class="py-5">

    <div class="container px-5">

        <!-- Contact form-->
        <div class="bg-light rounded-3 py-5 px-4 px-md-5 mb-5">
            <div class="text-center mb-5">
                <div class="feature bg-primary bg-gradient text-white rounded-3 mb-3"><i class="bi bi-envelope"></i></div>
                <h1 class="fw-bolder">Get in touch</h1>
                <p class="lead fw-normal text-muted mb-0">We'd love to hear from you</p>
            </div>
            <div class="row gx-5 justify-content-center">
                <div class="col-lg-8 col-xl-6">
                    <form id="contactForm">
                        <!-- Name input-->
                        <div class="form-floating mb-3">
                            <p>Contact Method</p>
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" name="contactOption" id="inlineRadio1" value="email" checked>
                                <label class="form-check-label" for="inlineRadio1">Email</label>
                            </div>
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" name="contactOption" id="inlineRadio2" value="phone">
                                <label class="form-check-label" for="inlineRadio2">Phone</label>
                            </div>
                        </div>
                        <!-- Name input-->
                        <div class="form-floating mb-3">
                            <input class="form-control" id="name" name="name" type="text" placeholder="Enter your name..." required />
                            <label for="name">Full name</label>
                            <div class="invalid-feedback" data-sb-feedback="name:required">A name is required.</div>
                        </div>
                        <!-- Email address input-->
                        <div class="form-floating mb-3" id="emailField">
                            <input class="form-control" id="email" name="email" type="email" placeholder="name@example.com" required />
                            <label for="email">Email address</label>
                            <div class="invalid-feedback" data-sb-feedback="email:required">An email is required.</div>
                            <div class="invalid-feedback" data-sb-feedback="email:email">Email is not valid.</div>
                        </div>
                        <!--Phone-->
                        <div class="mb-3" id="phoneField">
                            <input type="tel" class="form-control" id="phone" placeholder="(123) 456-7890" pattern="\(\d{3}\) \d{3}-\d{4}" name="phone">
                        </div>
                        <!-- Message input-->
                        <div class="form-floating mb-3" id="messageField">
                            <textarea class="form-control" id="message" name="message" type="text" placeholder="Enter your message here..." style="height: 10rem" required></textarea>
                            <label for="message">Message</label>

                        </div>

                        <!--Company Size-->
                        <div class="mb-3">

                            <div class="row align-items-center">
                                <div class="col-lg-8">
                                    <label for="customRange2" class="form-label">Company Size</label>
                                    <input type="range" class="form-range" min="1" max="100" id="sizeSlider" value="1">
                                </div>
                                <div class="col-lg-4 mt-4">
                                    <input type="text" class="form-control" id="numberInput" value="1+" max="100" name="companySize">
                                </div>
                            </div>

                        </div>

                        <!--Security-->
                        <div class="form-floating mb-3">
                            <input class="form-control" id="security" name="security" type="text" placeholder="What's 2+2" required />
                            <label for="email">What's 2+2?</label>
                        </div>

                        <!-- Submit success message-->
                        <!-- This is what your users will see when the form-->
                        <!-- has successfully submitted-->
                        <div class="d-none" id="submitSuccessMessage">
                            <div class="text-center mb-3">
                                <div class="fw-bolder">Form submission successful!</div>
                                To activate this form, sign up at
                                <br />
                                <a href="https://startbootstrap.com/solution/contact-forms">https://startbootstrap.com/solution/contact-forms</a>
                            </div>
                        </div>
                        <!-- Submit error message-->
                        <!---->
                        <!-- This is what your users will see when there is-->
                        <!-- an error submitting the form-->
                        <div class="d-none" id="submitErrorMessage">
                            <div class="text-center text-danger mb-3">Error sending message!</div>
                        </div>
                        <!-- Submit Button-->
                        <div class="d-grid"><button class="btn btn-primary btn-lg" id="submitButton" type="submit">Submit</button></div>
                    </form>
                </div>
            </div>
        </div>
        <!-- Contact cards-->
        <!--div class="row gx-5 row-cols-2 row-cols-lg-4 py-5 mx-auto">
            <div class="col">
                <div class="feature bg-primary bg-gradient text-white rounded-3 mb-3"><i class="bi bi-chat-dots"></i></div>
                <div class="h5 mb-2">Chat with us</div>
                <p class="text-muted mb-0">Chat live with one of our support specialists.</p>
            </div>
            <div class="col">
                <div class="feature bg-primary bg-gradient text-white rounded-3 mb-3"><i class="bi bi-people"></i></div>
                <div class="h5">Ask the community</div>
                <p class="text-muted mb-0">Explore our community forums and communicate with other users.</p>
            </div>
            <div class="col">
                <div class="feature bg-primary bg-gradient text-white rounded-3 mb-3"><i class="bi bi-question-circle"></i></div>
                <div class="h5">Support center</div>
                <p class="text-muted mb-0">Browse FAQ's and support articles to find solutions.</p>
            </div>
            <div class="col">
                <div class="feature bg-primary bg-gradient text-white rounded-3 mb-3"><i class="bi bi-telephone"></i></div>
                <div class="h5">Call us</div>
                <p class="text-muted mb-0">Call us during normal business hours at (555) 892-9403.</p>
            </div>
        </div-->
    </div>
</section>

<script>
    document.getElementById('contactForm').addEventListener('submit', function(event) {

        event.preventDefault(); // Prevent the default form submission

        // Create a FormData object from the form
        const formData = new FormData(this);

        // Convert the FormData object to a JSON object
        const data = {};

        formData.forEach((value, key) => {
            data[key] = value;
            console.log(value, key);
        });

        //  Security Question Was Wrong Return
        if (data.security != 4) {
            document.getElementById('security').classList.add('is-invalid');
            return;
        }

        // Make the API call using fetch
        fetch('https://<?=$API_INFO['LOGIN_HOST']?>?m=contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                // Handle success (e.g., show a success message)
            })
            .catch((error) => {
                console.error('Error:', error);
                // Handle error (e.g., show an error message)
            });
    });



    document.addEventListener('DOMContentLoaded', function() {
        const emailField = document.getElementById('emailField');
        const phoneField = document.getElementById('phoneField');
        const messageField = document.getElementById('messageField');
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');
        const messageInput = document.getElementById('message');
        const contactOptions = document.getElementsByName('contactOption');

        function toggleFields() {
            if (document.getElementById('inlineRadio1').checked) { // Email selected
                emailField.style.display = 'block';
                messageField.style.display = 'block';
                phoneField.style.display = 'none';

                emailInput.required = true;
                messageInput.required = true;
                phoneInput.required = false;

                phoneInput.value = ''; // Clear the phone input
            } else if (document.getElementById('inlineRadio2').checked) { // Phone selected
                emailField.style.display = 'none';
                messageField.style.display = 'none';
                phoneField.style.display = 'block';

                emailInput.required = false;
                messageInput.required = false;
                phoneInput.required = true;

                emailInput.value = ''; // Clear the email input
                messageInput.value = ''; // Clear the message input
            }
        }

        contactOptions.forEach(option => option.addEventListener('change', toggleFields));
        toggleFields(); // Initialize the fields based on the default selection
    });


    document.addEventListener('DOMContentLoaded', function() {
        const rangeInput = document.getElementById('sizeSlider');
        const numberInput = document.getElementById('numberInput');

        // Synchronize number input with range input
        rangeInput.addEventListener('input', function() {
            numberInput.value = `${rangeInput.value}+`;
        });

        // Synchronize range input with number input
        numberInput.addEventListener('input', function() {
            const value = numberInput.value.replace('+', '');
            rangeInput.value = value;
        });

        // Ensure the number input always has a "+" symbol
        numberInput.addEventListener('blur', function() {
            if (!numberInput.value.endsWith('+')) {
                numberInput.value = `${numberInput.value}+`;
            }
        });
    });

    document.getElementById('phone').addEventListener('input', function (e) {
            var x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
            e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
        });
</script>