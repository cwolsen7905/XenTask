<?php

include '../inc/startup.php';

$DATA	= [];

$DB		= new Database( );

$sql	= "SELECT * FROM xentask.workspaces";

if( $res = $DB->query( $sql ) ) {


	while( $row = $DB->fetch_assoc( $res ) ) {

		$sub_sql	= "SELECT count(*) FROM xentask.tasks WHERE workspace_id = " . $row['id'];
		$tasks		= $DB->fetch1( $sub_sql );

		$DATA[] = [
			'id'				=> $row['id'],
			'hash'				=> $row['hash'],
			'workspace_name'	=> $row['name'],
			'company_name'		=> $row['company_name'],
			'plan_type'			=> $row['plan_type'],
			'date_created'		=> $row['date_created'],
			'date_updated'		=> $row['date_updated'],
			'tasks'				=> $tasks
		];

	}
	
}

print json_encode( $DATA );