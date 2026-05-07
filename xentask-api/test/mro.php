<?php

include 'init.php';

$stripe = new \Stripe\StripeClient( getenv('STRIPE_API_KEY') );
/*
$customer = $stripe->customers->create([
    'description' => 'example customer',
    'email' => 'email@example.com',
    'payment_method' => 'pm_card_visa',
]);
echo $customer;
*/

$customer = "cus_RE2ixAJ5NkZOAh";