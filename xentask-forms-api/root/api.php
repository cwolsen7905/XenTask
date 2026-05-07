<?php

include '../inc/startup.php';

//	Validate Session For Request
//	validateSession( );

$request = new apiRequest();

//	Process REST Request
$request->processRequest();

//	Process CORS
if( $request->TYPE == "CORS" ) {

	Response::returnJSON( 200, [ 'message' => CORS_VALID_STR, 'authenticated' => 1, 'code' => CORS_VALID ] );

}

//	Validate Resource
if( !isset( $resourcesArr[ $request->RESOURCE ] ) ) {

  Response::returnJSON( 401, [ 'message' => RESOURCE_INVALID_STR, 'authenticated' => 1, 'code' => RESOURCE_INVALID ] );

}

//	Log The Request
$logDataArr	= [
	'STATUS' => 'PROCESS REQUEST',
	'SESSION' => $_SESSION,
	'REQUEST' => [
		'method' => $request->METHOD, 
		'type' => $request->TYPE, 
		'resource' => $request->RESOURCE, 
		'path_parameters' => $request->PATH_PARAMETERS, 
		'data' => $request->DATA
	]
];

Logger::log( $logDataArr, [ 'filename' => 'xentask-api.log' ] );

//	Load Resource Class
if( $resourceName = loadResource( $request->RESOURCE ) ) {

	$resourceObj	= new $resourceName( $request );

	$resourceObj->Process();
	
} else {

	// Build Micro Service URL
	$micro_service = 'xentask-' . $request->RESOURCE;

	$url  = "http://" . $micro_service . ".micro-" . strtolower( $_SERVER['DEPLOY_ENV'] ) . ".svc.cluster.local:8080";

	$data = get_object_vars( $request );

	$data['USER']	= $_SESSION['USER'];

	MicroService::call( $url, $data );

} 