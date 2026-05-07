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