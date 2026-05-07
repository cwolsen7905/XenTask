<?php

$error	= 0;

if( !is_dir( '/xentask/attachments' ) ) $error = 1;

if( $error )
	http_response_code( 400 );