<?php

include '../inc/cli-startup.php';

//	Environments
$ENVS		= [ 'DEV', 'PROD' ];


foreach( $ENVS as $env ) {

	print "Updating Tasks In: " . $env . "\n";

	$WS_ID_MAP	= [];

	$DB = new Database( 'DEV' );

	//	Build Workspace ID Maps
	$sql	= "SELECT id, hash FROM xentask.workspaces";
	$RES	= $DB->query( $sql );

	while( $ROW = $DB->fetch_assoc( $RES ) ) {

		$WS_ID_MAP[ $ROW['hash'] ] = $ROW['id'];

	}

	$sql	= "SELECT id, workspace_hash FROM xentask.tasks WHERE workspace_id = 0";

	$RES	= $DB->query( $sql );

	while( $ROW = $DB->fetch_assoc( $RES ) ) {

		if( !empty( $WS_ID_MAP[ $ROW['workspace_hash'] ] ) ) {

			$sql	= "UPDATE xentask.tasks SET workspace_id = " . $WS_ID_MAP[ $ROW['workspace_hash'] ] . " WHERE id = " . $ROW['id'];

			$DB->query( $sql );

		} else {

			print "Invalid Workspace: " . $ROW['workspace_hash'] . ", Task ID: " . $ROW['id'] . "\n";

		}

	}

}