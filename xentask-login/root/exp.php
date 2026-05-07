<?php

include '../inc/startup.php';
require_once LIB_CORE . 'UniqID.php';

print "<pre>";

$new_workspace_id = 30;

$DB		= new Database( );

class exp_var {
	public $workspace_hash;
	public $workspace_id;
	public $workspace_data;
	public $workspace_users;
	public $spaces;
	public $spaces_map;
	public $folders;
	public $folders_map;
	public $lists;
	public $lists_map;
	public $statuses;
	public $statuses_map;
	public $tasks;
}

$EXP = new exp_var();

$EXP->workspace_hash = ( isset( $_GET['ws'] ) ? $_GET['ws'] : "fh432hf" );

$sql	= "SELECT * FROM xentask.workspaces where hash = '" . $EXP->workspace_hash . "'";
$res	= $DB->query( $sql );
$row	= $DB->fetch_assoc( $res );

$EXP->workspace_id		= $row['id'];
$EXP->workspace_data	= $row;

$sql	= "SELECT * FROM xentask.worksapce_users WHERE workspace_id = " . $EXP->workspace_id;
$res	= $DB->query( $sql );

while( $row = $DB->fetch_assoc( $res ) ) 
	$EXP->workspace_users[] = $row;

$sql	= "SELECT * FROM xentask.spaces WHERE workspace_id = " . $EXP->workspace_id . " AND deleted = 0";
$res	= $DB->query( $sql );

while( $row = $DB->fetch_assoc( $res ) )
	$EXP->spaces[]	= $row;

foreach( $EXP->spaces as $SPACE ) {
	$sql	= "SELECT * FROM xentask.folders WHERE space_id = " . $SPACE['id'] . " AND deleted = 0";
	$res	= $DB->query( $sql );

	while( $row = $DB->fetch_assoc( $res ) )
		$EXP->folders[]	= $row;

	$sql	= "SELECT * FROM xentask.lists WHERE space_id = " . $SPACE['id'] . " AND deleted = 0";
	$res	= $DB->query( $sql );

	while( $row = $DB->fetch_assoc( $res ) )
		$EXP->lists[]	= $row;

	$sql	= "SELECT * FROM xentask.statuses WHERE space_id = " . $SPACE['id'];
	$res	= $DB->query( $sql );

	while( $row = $DB->fetch_assoc( $res ) )
		$EXP->statuses[]	= $row;

}

foreach( $EXP->lists as $LIST ) {
	$sql	= "SELECT * FROM xentask.tasks WHERE list_id = " . $LIST['id'] . " AND deleted = 0";
	$res	= $DB->query( $sql );

	while( $row = $DB->fetch_assoc( $res ) )
		$EXP->tasks[]	= $row;

}


foreach( $EXP->spaces as $SPACE ) {
	$space_hash	= UniqID::genUID( 'xts', 12 );
	$sql = "INSERT INTO xentask.spaces SET hash = '" . $space_hash . "', name = '" . $DB->real_escape_string( $SPACE['name'] ) . "', workspace_id = " . $new_workspace_id . ", is_private = " . $SPACE['is_private'];
	if( !isset($_GET['ws'] ) ) {
		print $sql;
		print "\n";
	} else {
		$res = $DB->query( $sql );
		if( !$res ) die( $sql );
	}
	$id = $DB->last_insert_id();

	$EXP->spaces_map[ $SPACE['id'] ] = ( !empty( $id) ? $id : rand(0,99 ) );
}
foreach( $EXP->folders as $FOLDER ) {
	$folder_hash = UniqID::genUID( 'xtf', 12 );
	$sql	= "INSERT INTO xentask.folders SET hash = '" . $folder_hash . "', name = '" . $DB->real_escape_string( $FOLDER['name'] ) . "', space_id = " . $EXP->spaces_map[ $FOLDER['space_id'] ] . ", is_private = " . $FOLDER['is_private'];
	if( !isset($_GET['ws'] ) ) {
		print $sql;
		print "\n";
	} else {
		$res = $DB->query( $sql );
		if( !$res ) die( $sql );
	}
	$id = $DB->last_insert_id(); 
	$EXP->folders_map[ $FOLDER['id'] ] = ( !empty( $id) ? $id : rand(100,199 ) );
}
foreach( $EXP->lists as $LIST ) {
	$list_hash = UniqID::genUID( 'xtl', 12 );
	$sql	= "INSERT INTO xentask.lists SET hash = '" . $list_hash . "', name = '" . $DB->real_escape_string( $LIST['name'] ) . "', space_id = " . $EXP->spaces_map[ $LIST['space_id'] ] . ", parent_folder_id = " . ( !empty( $EXP->folders_map[ $LIST['parent_folder_id'] ] ) ? $EXP->folders_map[ $LIST['parent_folder_id'] ] : 0 ) . ", is_private = " . $LIST['is_private'];
	if( !isset($_GET['ws'] ) ) {
		print $sql;
		print "\n";
	} else {
		$res = $DB->query( $sql );
		if( !$res ) die( $sql );
	}
	$id = $DB->last_insert_id();
	$EXP->lists_map[ $LIST['id'] ] = ( !empty( $id) ? $id : rand(200,299 ) );
}
foreach( $EXP->statuses as $STATUS ) {
	$status_hash = UniqID::genUID( 'xts', 12 );
	$sql	= "INSERT INTO xentask.statuses SET hash = '" . $status_hash . "', space_id = " . $EXP->spaces_map[ $STATUS['space_id'] ] . ", name = '" . $DB->real_escape_string( $STATUS['name'] ) . "', color = '" . $STATUS['color'] . "', is_default = " . $STATUS['is_default'] . ", type = '" . $STATUS['type'] . "', order_index = " . $STATUS['order_index'];
	if( !isset($_GET['ws'] ) ) {
		print $sql;
		print "\n";
	} else {
		$res = $DB->query( $sql );
		if( !$res ) die( $sql );
	}
	$EXP->statuses_map[ $STATUS['hash'] ] = $status_hash;
}
foreach( $EXP->tasks as $TASK ) {
	$task_hash = UniqID::genUID( 'xtt', 12 );
	$sql	= "INSERT INTO xentask.tasks SET hash = '" . $task_hash . "', title = '" . $DB->real_escape_string( $TASK['title'] ) . "', list_id = " . $EXP->lists_map[ $TASK['list_id'] ] . ", task_type = '" . $TASK['task_type'] . "', description = '" . $DB->real_escape_string( $TASK['description'] ) . "', status = '" . $EXP->statuses_map[ $TASK['status'] ] . "', priority = '" . $TASK['priority'] . "', date_start = '" . $TASK['date_start'] . "', due_date = '" . $TASK['due_date'] . "', time_estimate = " . $TASK['time_estimate'] . ", is_private = " . $TASK['is_private'] . ", workspace_hash = 'delete'";
	if( !isset($_GET['ws'] ) ) {
		print $sql;
		print "\n";
	} else {
		$res = $DB->query( $sql );
		if( !$res ) die( $sql );
	}
	$id = $DB->last_insert_id();
	$EXP->folders_map[ $FOLDER['id'] ] = ( !empty( $id) ? $id : rand(300,399 ) );
}

print_r(get_object_vars( $EXP ) );