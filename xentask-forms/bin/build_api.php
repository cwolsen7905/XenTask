#!/usr/bin/php
<?php

$DATA	= [
	'API_HOST'		=> getenv( 'API_HOST' ),
	'LOGIN_HOST'	=> getenv( 'LOGIN_HOST' ),
	'BEANS'			=> 'All of them!!!',
	'AAF'			=> '24x7 365',
];

//file_put_contents("/web/root/api.json", json_encode( $DATA ) );

$json_str	= json_encode( $DATA );

system("echo '" . $json_str . "' > /web/root/api.json" );