<style>
  /* Flexbox container for each card body - targeting cards with .card-custom class */
  .card-custom .card-body {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%; /* Ensure the card takes full height */
    text-align: center; /* Center the text */
    position: relative; /* Allows for positioning child elements */
  }

  /* Ensure original text and hover text have similar behavior */
  .card-custom .original-text,
  .card-custom .hover-text {
    transition: opacity 0.3s ease;
    width: 100%;
  }

  /* Hide hover text by default */
  .card-custom .hover-text {
    opacity: 0;
    visibility: hidden;
    position: absolute; /* Position it over the original text */
    top: 50%; /* Center vertically */
    transform: translateY(-50%); /* Offset by half of its height */
  }

  /* When hovering the card, show the hover text and hide original text */
  .card-custom:hover .hover-text {
    opacity: 1;
    visibility: visible;
  }

  .card-custom:hover .original-text {
    opacity: 0;
    visibility: hidden;
  }

  /* Ensure the original text words stack vertically */
  .card-custom .original-text h2 {
    margin: 0;
  }

  /* Styling for the hover text */
  .hover-text {
    font-size: 1.2rem;
    font-weight: bold;
    color: #fff;
    margin: 0;
  }
</style>

<section>
  <div class="container py-5">
    <h2 class="fw-bolder my-5 text-center">Your All In One Solution:</h2>

    <div class="row row-cols-1 row-cols-md-5 g-4">
      <!-- Card 1 -->
      <div class="col card-custom">
        <div class="card text-white h-100 p-3 d-flex flex-column align-items-center justify-content-center"
          style="background: #5F5DFE;">
          <div class="card-body">
            <div class="original-text">
              <h2 class="h3">Projects</h2>
              <h2 class="h3">&</h2>
              <h2 class="h3">Tasks</h2>
            </div>
            <p class="hover-text">Manage work projects & tasks</p>
          </div>
        </div>
      </div>

      <!-- Card 2 -->
      <div class="col card-custom">
        <div class="card text-white h-100 p-3 d-flex flex-column align-items-center justify-content-center"
          style="background: #A539FE;">
          <div class="card-body">
            <div class="original-text">
              <h2 class="h3">Operations</h2>
              <h2 class="h3">&</h2>
              <h2 class="h3">Work Flow</h2>
            </div>
            <p class="hover-text">Manage day-to-day operations & work processes</p>
          </div>
        </div>
      </div>

      <!-- Card 3 -->
      <div class="col card-custom">
        <div class="card text-white h-100 p-3 d-flex flex-column align-items-center justify-content-center"
          style="background: #01846E;">
          <div class="card-body">
            <div class="original-text">
              <h2 class="h3">IT Support</h2>
              <h2 class="h3">&</h2>
              <h2 class="h3">Tickets</h2>
            </div>
            <p class="hover-text">Manage IT, technical support, & incoming tickets</p>
          </div>
        </div>
      </div>

      <!-- Card 4 -->
      <div class="col card-custom">
        <div class="card text-white h-100 p-3 d-flex flex-column align-items-center justify-content-center"
          style="background: #0174DF;">
          <div class="card-body">
            <div class="original-text">
              <h2 class="h3">Creative</h2>
              <h2 class="h3">Design</h2>
              <h2 class="h3">&</h2>
              <h2 class="h3">Video</h2>
            </div>
            <p class="hover-text">Manage creative, design, & video processes</p>
          </div>
        </div>
      </div>

      <!-- Card 5 -->
      <div class="col card-custom">
        <div class="card text-white h-100 p-3 d-flex flex-column align-items-center justify-content-center"
          style="background: #C602ED;">
          <div class="card-body">
            <div class="original-text">
              <h2 class="h3">HR,</h2>
              <h2 class="h3">Recruiting</h2>
              <h2 class="h3">&</h2>
              <h2 class="h3">Onboarding</h2>
            </div>
            <p class="hover-text">Manage HR, recruitment, & onboarding</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
