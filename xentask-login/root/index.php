<?php

include '../inc/startup.php';

require_once XEN_CORE . 'Models/xenSpace.php';
require_once XEN_CORE . 'Models/xenWorkspace.php';
require_once LIB_CORE . 'Notification.php';
require_once LIB_CORE . 'UniqID.php';

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

if( !empty( $_REQUEST['bonus'] ) ) MemcacheUtil::set( 'bonus', $_REQUEST['bonus'] );

if( isset( $_REQUEST['MrO'] ) ) {

	print "<pre>";
	print_r( $_SESSION );
	print_r( $_COOKIE );
	print_r( $_SERVER );
	print "</pre>";

	exit;
}

if( isset( $_REQUEST['m'] ) ) {

	switch( strtolower( $_REQUEST['m'] ) ) {

		case 'login':

			if( !isset( $_REQUEST['email'] ) || !isset( $_REQUEST['password'] ) )
				returnJSON( 400, 'LOGIN', [ 'message' => 'ERROR', 'authenticated' => 0 ] );

			doLogin( $_REQUEST['email'], $_REQUEST['password'] );

			break;

		case 'validate':

			returnJSON( 200, 'VALIDATE', [ 'authenticated' => 0 ] );

			break;

		case 'logout':

			doLogout( );

			break;

		case 'overview':

			doOverview( );

			break;

		case 'reset':

			if( !isset( $_REQUEST['email'] ) )
				returnJSON( 400, 'LOGIN', [ 'message' => 'ERROR', 'authenticated' => 0 ] );

			doReset( $_REQUEST['email'] );

			break;

		case 'recover_account':

			if( !isset( $_REQUEST['email'] ) )
				returnJSON( 400, 'LOGIN', [ 'message' => 'ERROR', 'authenticated' => 0 ] );

			doRecoverAccount( $_REQUEST['email'] );

			break;

		case 'get_invite':

			if( !isset( $_REQUEST['hash'] ) )
				returnJSON( 400, 'LOGIN', [ 'message' => 'ERROR: Invalid Invite', 'authenticated' => 0 ] );


			getInvite( $_REQUEST['hash'] );

			break;

		case 'accept_invite':

			if( !isset( $_REQUEST['hash'] ) )
			returnJSON( 400, 'LOGIN', [ 'message' => 'ERROR: Invalid Invite', 'authenticated' => 0 ] );

			acceptInvite( );

			break;

		case 'create_account':

			if( !isset( $_REQUEST['password'] ) || !isset( $_REQUEST['email'] ) || !isset( $_REQUEST['first_name'] ) || !isset( $_REQUEST['last_name'] ) )
				returnJSON( 400, 'LOGIN', [ 'message' => 'ERROR', 'authenticated' => 0 ] );

				createAccount( $_REQUEST );
	
			break;

		case 'contact':

			doContact();

			break;

		default:

			returnJSON( 400, 'INVALID', array_merge( $_REQUEST, $_SESSION ) );

	}

}

//returnJSON( 400, 'INVALID', array_merge( $_REQUEST, $_SESSION ) );

function doContact( ) {


	$DATA = file_get_contents( "php://input" );

 	if( !empty( $DATA ) ) {
  
		$DATA = json_decode( $DATA, true );

		$DB		= new Database( );

		$sql	= "INSERT INTO xentask.contact_form SET 
					contact_option = '" . $DATA['contactOption'] . "', 
					name = '" . $DATA['name'] . "',
					email = '" . $DATA['email'] . "',
					phone = '" . $DATA['phone'] . "',
					message = '" . $DATA['message'] . "',
					company_size = '" . $DATA['company_size'] . "'";

		if( $DB->query( $sql ) )
			returnJSON( 200, 'CONTACT', [ 'message' => 'SUCCESS', 'authenticated' => 0 , 'USER' => [] ] );
		else
			returnJSON( 400, 'CONTACT', [ 'message' => 'ERROR: UNABLE TO SUBMIT CONTACT DATA', 'authenticated' => 0 ] );

	} else {

		returnJSON( 400, 'CONTACT', [ 'message' => 'ERROR: UNABLE TO SUBMIT CONTACT DATA', 'authenticated' => 0 ] );

	}

}

function acceptInvite( ) {

	$DB		= new Database( );

	$sql	= "SELECT wi.*, w.hash FROM xentask.workspace_invites wi LEFT JOIN xentask.workspaces w ON wi.workspace_id = w.id WHERE invite_hash = '" . $_REQUEST['hash'] . "'";

	$res	= $DB->query( $sql );

	if( $res && $res->num_rows != 0 ) {

		$DATA	= $DB->fetch_assoc( $res );

		switch( (int)$DATA['type'] ) {

			case 1:

				if( isset( $_REQUEST['accept'] ) ) {

					if( !isset( $_REQUEST['email'] ) || !isset( $_REQUEST['password'] ) )
						returnJSON( 400, 'LOGIN', [ 'message' => 'ERROR', 'authenticated' => 0 ] );

					$res	= $DB->query( "SELECT * FROM users where email = '" . $_REQUEST['email'] . "'" );

					if( $res && $res->num_rows != 0 ) {

						$_SESSION['USER']	= $DB->fetch_assoc( );

						$_SESSION['USER']['default_workspace']	= $DATA['hash'];
						$_SESSION['USER']['workspace_id']		= $DATA['workspace_id'];

						/*
						$_SESSION['USER']['workspaces'] = [ 
							$DATA['hash'],
						];
						*/

						$_SESSION['USER']['initals'] = substr($_SESSION['USER']['first_name'], 0, 1) . substr($_SESSION['USER']['last_name'], 0, 1);

						if( $_REQUEST['password'] == $_SESSION['USER']['password'] || $_REQUEST['password'] == MemcacheUtil::get( base64_encode( 'RECOVERY_PASS_' . $_SESSION['email'] ) ) ) {

							//MemcacheUtil::delete( base64_encode( 'RECOVERY_PASS_' . strtolower( $email ) ) );

							unset( $_SESSION['USER']['password'] );

							$sql	= "INSERT INTO xentask.workspace_users SET user_id = " . $DATA['user_id'] . ", workspace_id = " . $DATA['workspace_id'] . ", invited_by_id = " . $DATA['invited_by'] . ", is_admin = " . $DATA['is_admin'];

							if( $DB->query( $sql ) ) {

								$sql	= "SELECT w.name, w.hash as workspace_hash, w.image, w.color 
								FROM xentask.workspace_users wu 
									JOIN workspaces w 
										ON wu.workspace_id = w.id 
									WHERE wu.user_id = " . $_SESSION['USER']['id'];

								$res	= $DB->query( $sql );

								while( $row = $DB->fetch_assoc( ) ) {

									$_SESSION['USER']['workspaces'][] = $row;

								}

								$auto_hash	= UniqID::genUID( 'al', 64 );

								$sql		= "UPDATE xentask.users SET hash = '" . $auto_hash . "' WHERE id = " . $_SESSION['USER']['id'];
								$res		= $DB->query( $sql );

								if( $_SERVER['DEPLOY_ENV'] == 'PROD' )
									$domain	= '.xentask.com';
								else
									$domain	= '.' . strtolower( $_SERVER['DEPLOY_ENV'] ) . '.your-domain.com';

								$OPTIONS = array(
											'name' => 'xentask',
											'value' => $auto_hash,
											'expires' => time() + ( 86400 * 30 ),
											'path' => '/',
											'domain' => $domain, 
											'secure' => true,
											'httponly' => true,
											'samesite' => 'None'
										);

								setcookie( 'xentask', $auto_hash, $OPTIONS );
								
								returnJSON( 200, 'INVITE', [ 'message' => 'SUCCESS', 'authenticated' => 2 , 'USER' => $_SESSION['USER'] ] );

							} else
								returnJSON( 400, 'INVITE', [ 'message' => 'ERROR: UNABLE TO ACCEPT INVITE', 'authenticated' => 0 ] );

						}

					}

					$_SESSION['USER']	= [];

					returnJSON( 401, 'INVITE', [ 'message' => 'INVALID CREDENTIALS', 'authenticated' => 0 ] );

				} else {

					returnJSON( 400, 'INVITE', [ 'message' => 'ERROR: YOU DID NOT ACCEPT', 'authenticated' => 0 ] );

				}

				break;

			case 2:

				if( isset( $_REQUEST['accept'] ) ) {

					if( !isset( $_REQUEST['email'] ) || !isset( $_REQUEST['password'] ) || !isset( $_REQUEST['email'] ) || !isset( $_REQUEST['first_name'] ) || !isset( $_REQUEST['last_name'] ) )
						returnJSON( 400, 'INVITE', [ 'message' => 'ERROR', 'authenticated' => 0 ] );

					$sql	= "SELECT id FROM xentask.users WHERE email LIKE '" . $_REQUEST['email'] . "'";

					$res	= $DB->query( $sql );

					if( $res && $res->num_rows != 0 )
						returnJSON( 400, 'INVITE', [ 'message' => 'ERROR: EMAIL UNAVAILABLE', 'authenticated' => 0 ] );

					$user_hash	= UniqID::genUID( 'acf', 32 );

					$sql	= "INSERT INTO xentask.users SET 
								hash		= '" . $user_hash . "',
								first_name	= '" . $_REQUEST['first_name'] . "',
								last_name	= '" . $_REQUEST['last_name'] . "', 
								password	= '" .$_REQUEST['password'] . "',
								email		= '" . $DATA['email'] . "', status = 'active'";

					$res	= $DB->query( $sql );

					if( !$res )
						returnJSON( 400, 'INVITE', [ 'message' => 'ERROR: Unable to create account', 'authenticated' => 0 ] );

					$user_id = $DB->last_insert_id();

					$_SESSION['USER']['default_workspace']	= $DATA['hash'];
					$_SESSION['USER']['workspace_id']		= $DATA['workspace_id'];
					$_SESSION['USER']['initals']			= substr($_REQUEST['first_name'], 0, 1) . substr($_REQUEST['last_name'], 0, 1);

					$sql	= "INSERT INTO xentask.workspace_users SET user_id = " . $user_id . ", workspace_id = " . $DATA['workspace_id'] . ", invited_by_id = " . $DATA['invited_by'] . ", is_admin = " . $DATA['is_admin'];

					if( $DB->query( $sql ) ) {

						$sql	= "SELECT w.name, w.hash as workspace_hash, w.image, w.color 
						FROM xentask.workspace_users wu 
							JOIN workspaces w 
								ON wu.workspace_id = w.id 
							WHERE wu.user_id = " . $user_id;

						$res	= $DB->query( $sql );

						while( $row = $DB->fetch_assoc( ) ) {

							$_SESSION['USER']['workspaces'][] = $row;

						}

						returnJSON( 200, 'INVITE', [ 'message' => 'SUCCESS', 'authenticated' => 2 , 'USER' => $_SESSION['USER'] ] );

					} else
						returnJSON( 400, 'INVITE', [ 'message' => 'ERROR: UNABLE TO ACCEPT INVITE', 'authenticated' => 0 ] );

				} else {

					returnJSON( 400, 'INVITE', [ 'message' => 'ERROR: YOU DID NOT ACCEPT', 'authenticated' => 0 ] );

				}

				break;

			default:

		}

		returnJSON( 400, 'INVITE', [ 'message' => 'ERROR: WORKSPACE INVITE INVALID', 'authenticated' => 0 ] );

	} else
		returnJSON( 400, 'INVITE', [ 'message' => 'ERROR: WORKSPACE INVITE INVALID', 'authenticated' => 0 ] );

}

function getInvite( $hash ) {

	$DB		= new Database( );

	$sql	= "SELECT * FROM xentask.workspace_invites WHERE invite_hash = '" . $hash . "'";

	$res	= $DB->query( $sql );

	if( $res && $res->num_rows != 0 ) {

		$DATA		= $DB->fetch_assoc( );

		returnJSON( 200, 'INVITE', [ 'message' => 'WORKSPACE INVITE VALID', 'authenticated' => 0, 'data' => $DATA ] );

	} else
		returnJSON( 400, 'INVITE', [ 'message' => 'ERROR: WORKSPACE INVITE INVALID', 'authenticated' => 0, 'data' => [ 'SQL' => $sql ] ] );

}

function doRecoverAccount( $email ) {

	$DB		= new Database( );

	$res	= $DB->query( "SELECT first_name, last_name, email FROM users WHERE email = '" . $email . "'" );

	if( $res && $res->num_rows != 0 ) {

		$DATA		= $DB->fetch_assoc( );

		$EMAIL		= New Notification( );

		$res		= $EMAIL->sendMessage( 
			[
				'to_address' => [ 'email' => $DATA['email'], 'name' => $DATA['first_name'] . " " . $DATA['last_name'] ],
				'subject' => "Account Recovery",
				'message_plain'	=> "Your Account -> " . $DATA['email'] . "\n"
			]
		);

		returnJSON( 200, 'LOGIN', [ 'message' => 'ACCOUNT RECOVERY', 'authenticated' => 0, 'smtp' => $res ] );

	} else {

		returnJSON( 400, 'LOGIN', [ 'message' => 'ERROR', 'authenticated' => 0 ] );

	}

}

function doLogout( ) {

	if( !empty( $_SESSION['USER'] ) ) {

		$_SESSION['USER'] = [];

		session_destroy();

		returnJSON( 200, 'LOGOUT', [ 'message' => 'SUCCESS', 'authenticated' => 0 ] );

	}

	returnJSON( 400, 'LOGOUT', [ 'message' => 'INVALID SESSION', 'authenticated' => 0 ] );

}

function doReset( $email ) {

	$DB		= new Database( );

	$res	= $DB->query( "SELECT first_name, last_name, email FROM users WHERE email = '" . strtolower( $email ) . "'" );

	if( $res && $res->num_rows != 0 ) {

		$tmp_pass	= UniqID::genUID( '', 8 );

		$DATA		= $DB->fetch_assoc( );

		$EMAIL		= New Notification( );

		$res		= $EMAIL->sendMessage( 
			[
				'to_address' => [ 'email' => $DATA['email'], 'name' => $DATA['first_name'] . " " . $DATA['last_name'] ],
				'subject' => "Password Reset Request",
				'message_plain'	=> "Your temporary password -> " . $tmp_pass . "\n"
			]
		);

		MemcacheUtil::set( base64_encode( 'RECOVERY_PASS_' . strtolower( $email ) ), $tmp_pass, 3600 );

		returnJSON( 200, 'LOGIN', [ 'message' => 'TEMP PASSWORD SENT', 'authenticated' => 0 ] );

	} else {

		returnJSON( 200, 'LOGIN', [ 'message' => 'ERROR', 'authenticated' => 0 ] );

	}

}

function doLogin( $email, $password ) {

	$DB		= new Database( );

	$res	= $DB->query( "SELECT * FROM users where email = '" . $email . "'" );

	if( $res && $res->num_rows != 0 ) {

		$_SESSION['USER']	= $DB->fetch_assoc( );

		$sql	= "SELECT w.name, w.hash as workspace_hash, w.image, w.color, w.id 
					FROM xentask.workspace_users wu 
					JOIN workspaces w 
						ON wu.workspace_id = w.id 
					WHERE wu.user_id = " . $_SESSION['USER']['id'];

		$res	= $DB->query( $sql );

		while( $row = $DB->fetch_assoc( ) ) {

			$_SESSION['USER']['workspaces'][] = $row;

		}

		$sql			= "SELECT value FROM xentask.users_settings WHERE user_id = " . $_SESSION['USER']['id'] . " AND setting = 'default_workspace'";

		$workspace_hash	= $DB->fetch1( $sql );

		$_SESSION['USER']['default_workspace']	= !empty( $workspace_hash ) ? $workspace_hash : $_SESSION['USER']['workspaces'][0]['workspace_hash'];
		$_SESSION['USER']['workspace_id']		= $_SESSION['USER']['workspaces'][0]['id'];

		$_SESSION['USER']['initals'] = substr($_SESSION['USER']['first_name'], 0, 1) . substr($_SESSION['USER']['last_name'], 0, 1);

		if( $password == $_SESSION['USER']['password']  ) {

			unset( $_SESSION['USER']['password'] );

			returnJSON( 200, 'LOGIN', [ 'message' => 'SUCCESS', 'authenticated' => 1 , 'USER' => $_SESSION['USER'] ] );

		} elseif( $password == MemcacheUtil::get( base64_encode( 'RECOVERY_PASS_' . strtolower( $email ) ) ) ) {

			//MemcacheUtil::delete( base64_encode( 'RECOVERY_PASS_' . strtolower( $email ) ) );

			unset( $_SESSION['USER']['password'] );

			returnJSON( 200, 'LOGIN', [ 'message' => 'SUCCESS', 'authenticated' => 2 , 'USER' => $_SESSION['USER'] ] );

		}

	} 

	$_SESSION['USER']	= [];

	returnJSON( 401, 'LOGIN', [ 'message' => 'INVALID CREDENTIALS', 'authenticated' => 0 ] );

}

function doOverview( ) {

	if( isset( $_COOKIE['xentask'] ) )
		doCookieLogin();

	if( empty( $_SESSION['USER'] ) )
		returnJSON( 401, 'OVERVIEW', [ 'message' => 'INVALID SESSION', 'authenticated' => 0 ] );

	$SPACES				= xenSpace::getSpacesNew( $_SESSION['USER']['default_workspace'], $_SESSION['USER'] );
	$WORKSPACE			= new xenWorkspace( $_SESSION['USER']['default_workspace'] );
	$WORKSPACE_USERS	= $WORKSPACE->getWorkspaceUsers();

	returnJSON( 200, 
		'OVERVIEW', [ 
			'message' => 'SUCCESS', 
			'USER' => $_SESSION['USER'], 
			'SPACES' => $SPACES,
			'WORKSPACE_USERS' => $WORKSPACE_USERS,
			'DASHBORD' => [ 
				'CALENDAR' => 'CALENDAR DATA', 
				'NOTIFICATIONS' => 'notification data', 
				'ARIC' => 
				'What else do we need lets figure out what these payloads look like' 
				]
		]
	);

}

function createAccount( $OPTIONS ) {

	$DB		= new Database( );

	$res	= $DB->query( "SELECT email FROM xentask.users WHERE email = '" . $OPTIONS['email'] . "'" );

	if( $res && $res->num_rows != 0 )
		returnJSON( 400, 'LOGIN', [ 'message' => 'An account already exists with this email. Please use a unique email or create additional workspaces from within the XenTask app.', 'authenticated' => 0 ] );

	// Not limiting to unique work space names
	/*
	if( isset( $OPTIONS['workspace_name'] ) ) {

		$res	= $DB->query( "SELECT workspace_name FROM workspaces WHERE name = '" . $OPTIONS['workspace_name'] . "'" );

		if( $res && $res->num_rows != 0 )
			returnJSON( 400, 'LOGIN', [ 'message' => 'A workspace with this name already exists please use a unique name.', 'authenticated' => 0 ] );

	}
	*/

	$user_hash	= UniqID::genUID( 'acf', 32 );
	
	$sql		= "INSERT INTO xentask.users SET 
					hash		= '" . $user_hash . "', 
					first_name	= '" . $OPTIONS['first_name'] . "', 
					last_name	= '" . $OPTIONS['last_name'] . "',
					email		= '" . $OPTIONS['email'] . "',
					password	= '" . $OPTIONS['password'] . "'";

	$res		= $DB->query( $sql );

	$user_id	= $DB->last_insert_id();

	if( $res ) {

		if( isset( $OPTIONS['plan_type'] ) && isset( $OPTIONS['company_name'] ) && isset( $OPTIONS['workspace_name'] ) ) {

			$workspace_hash	= UniqID::genUID( 'aaf', 12 );

			$sql	= "INSERT INTO xentask.workspaces SET 
						name			= '" . $OPTIONS['workspace_name'] . "', 
						company_name	= '" . $OPTIONS['company_name'] . "', 
						plan_type		= '" . $OPTIONS['plan_type'] . "', 
						hash			= '" . $workspace_hash . "'";
			
			$res	= $DB->query( $sql );

			if( !$res ) {

				$DB->query( "DELETE FROM users WHERE id = " . $user_id );

				returnJSON( 400, 'LOGIN', [ 'message' => 'Error creating this workspace, please try again in a few minutes.', 'authenticated' => 0 ] );

			}

			$workspace_id = $DB->last_insert_id();
		  
		}

		//MrOlsen
		cloneWorkspace( $workspace_id, $workspace_hash, $user_id, $DB );

		$hash	= UniqID::genUID( 'ih', 32 );

		$sql	= "INSERT INTO xentask.workspace_invites SET type = 1, invited_by = 0, user_id = " . $user_id . ", workspace_id = " . $workspace_id . ", is_admin = 1, invite_hash = '" . $hash . "', email = '" . $OPTIONS['email'] . "'";

		$res	= $DB->query(( $sql ) );

		require_once LIB_CORE . 'Notification.php';

		$EMAIL          = New Notification( );

		require_once LIB_CORE . 'Template.php';

		Template::$base_path	= TPL_BASE;

		$HTML = Template::render( 'content/notification.html', [
			'title' => 'Workspace Invitation',
			'subtext'=> '',
			'profile_image' => '',
			'profile_color' => '#6610f2',
			'profile_name' => ucfirst( substr( $OPTIONS['workspace_name'], 0, 1) ),
			'body'=> "Your New Workspace <strong>" . $OPTIONS['workspace_name']  . "'</strong> Is Almost Ready Go! Click The Button To Confirm Your Account And Create Your New Workspace.<br>If you feel like there's been a mistake please ignore this message.",
			'link'=> ( ( getenv('DEPLOY_ENV') == 'PROD' ) ? 'https://go.xentask.com/invite/' : 'https://xentask-fe.' . strtolower( getenv('DEPLOY_ENV') ) . '.your-domain.com/invite/' ) . $hash ,
			'link_text'=>'Activate Workspace',
		]);
	
		$res = $EMAIL->sendMessage(
				[
						'to_address' => [ 'email' => $OPTIONS['email'] ],
						'subject' => "Invited To Workspace",
						'message_html' => $HTML,
				]
		);

		if( isset( $_REQUEST['auto_confirm'] ) ) {

			$_REQUEST['hash']	= $hash;
			$_REQUEST['accept']	= 1;

			acceptInvite( );

		}

		returnJSON( 200, 'LOGIN', [ 'message' => 'ACCOUNT CREATED', 'res' => $res, 'authenticated' => 0 ] );

	} else {
		returnJSON( 400, 'LOGIN', [ 'message' => 'ERROR CREATING ACCOUNT', 'authenticated' => 0 ] );
	}

}

function returnJSON( $response_code, $message = '', $DATA = array(), $debug = false, $test = null, $emptyDataAsObj = false ) {

	//	Define a standard response
	$RESPONSE	= array( 'message' => $message, 'data' => $DATA );

	//	Remove debug information if not debugging
	if( !$debug ) {

		if( !empty( $RESPONSE['data']['debug'] ) ) unset( $RESPONSE['data']['debug'] );

	} else {

		 // Add the debug arrays
		if ( !is_array( $RESPONSE['data'] ) ) $RESPONSE['data'] = array();

		if( empty( $RESPONSE['data']['debug'] ) ) $RESPONSE['data']['debug']	= array();

		$RESPONSE['data']['debug']['execution_time']	= microtime(true) - $_SERVER['REQUEST_TIME_FLOAT'];

	}

	//	Force data to be an object instead of an array if it is empty.
	if( empty( $RESPONSE['data'] ) && $emptyDataAsObj ) $RESPONSE['data'] = new stdClass;

	//	Testing
	if( $test ) $RESPONSE['test'] = $test;

	//	Return the response
	http_response_code( $response_code );
	header('Content-Type: application/json');

	$OPTIONS	= array( 'filename' => 'xentask-login.log' );

	Logger::log( [ 'code' => $response_code, 'message' => $message, 'data' => $DATA ], $OPTIONS );

	if( $debug ) {

		echo json_encode( $RESPONSE, JSON_PRETTY_PRINT );

	} else {

		echo json_encode( $RESPONSE, JSON_INVALID_UTF8_IGNORE );

	}

	exit;

}

function cloneWorkspace( $new_workspace_id, $new_workspace_hash, $user_id, $DB ) {

	$EXP = new exp_var();

	//	Space to clone
	$EXP->workspace_hash = "aafa7bdd60ad";

	$sql	= "SELECT * FROM xentask.workspaces where hash = '" . $EXP->workspace_hash . "'";
	$res	= $DB->query( $sql );

	if( empty( $res) || $res->num_rows == 0 ) return false;

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
		$sql = "INSERT INTO xentask.spaces SET hash = '" . $space_hash . "', name = '" . $DB->real_escape_string( $SPACE['name'] ) . "', workspace_id = " . $new_workspace_id . ", is_private = " . $SPACE['is_private'] . ", created_by = " . $user_id;

		$res = $DB->query( $sql );
		if( !$res ) die( $sql );

		$id = $DB->last_insert_id();

		$EXP->spaces_map[ $SPACE['id'] ] = ( !empty( $id) ? $id : rand(0,99 ) );

	}

	foreach( $EXP->folders as $FOLDER ) {

		$folder_hash = UniqID::genUID( 'xtf', 12 );
		$sql	= "INSERT INTO xentask.folders SET hash = '" . $folder_hash . "', name = '" . $DB->real_escape_string( $FOLDER['name'] ) . "', space_id = " . $EXP->spaces_map[ $FOLDER['space_id'] ] . ", is_private = " . $FOLDER['is_private'] . ", created_by = " . $user_id;

		$res = $DB->query( $sql );
		if( !$res ) die( $sql );

		$id = $DB->last_insert_id(); 
		$EXP->folders_map[ $FOLDER['id'] ] = ( !empty( $id) ? $id : rand(100,199 ) );

	}

	foreach( $EXP->lists as $LIST ) {

		$list_hash = UniqID::genUID( 'xtl', 12 );
		$sql	= "INSERT INTO xentask.lists SET hash = '" . $list_hash . "', name = '" . $DB->real_escape_string( $LIST['name'] ) . "', space_id = " . $EXP->spaces_map[ $LIST['space_id'] ] . ", parent_folder_id = " . ( !empty( $EXP->folders_map[ $LIST['parent_folder_id'] ] ) ? $EXP->folders_map[ $LIST['parent_folder_id'] ] : 0 ) . ", is_private = " . $LIST['is_private'] . ", created_by = " . $user_id;

		$res = $DB->query( $sql );
		if( !$res ) die( $sql );

		$id = $DB->last_insert_id();
		$EXP->lists_map[ $LIST['id'] ] = ( !empty( $id) ? $id : rand(200,299 ) );

	}

	foreach( $EXP->statuses as $STATUS ) {

		$status_hash = UniqID::genUID( 'xts', 12 );
		$sql	= "INSERT INTO xentask.statuses SET hash = '" . $status_hash . "', space_id = " . $EXP->spaces_map[ $STATUS['space_id'] ] . ", name = '" . $DB->real_escape_string( $STATUS['name'] ) . "', color = '" . $STATUS['color'] . "', is_default = " . $STATUS['is_default'] . ", type = '" . $STATUS['type'] . "', order_index = " . $STATUS['order_index'] . ", created_by_user = " . $user_id;

		$res = $DB->query( $sql );
		if( !$res ) die( $sql );
	
		$EXP->statuses_map[ $STATUS['hash'] ] = $status_hash;

	}

	foreach( $EXP->tasks as $TASK ) {

		if( $TASK['title'] == "Intro Task - START HERE" )
			$TASK['date_start'] = date("Y-m-d");

		$task_hash = UniqID::genUID( 'xtt', 12 );
		$sql	= "INSERT INTO xentask.tasks SET hash = '" . $task_hash . "', title = '" . $DB->real_escape_string( $TASK['title'] ) . "', list_id = " . $EXP->lists_map[ $TASK['list_id'] ] . ", task_type = '" . $TASK['task_type'] . "', description = '" . $DB->real_escape_string( $TASK['description'] ) . "', status = '" . $EXP->statuses_map[ $TASK['status'] ] . "', priority = '" . $TASK['priority'] . "', date_start = '" . $TASK['date_start'] . "', due_date = '" . $TASK['due_date'] . "', time_estimate = " . $TASK['time_estimate'] . ", is_private = " . $TASK['is_private'] . ", workspace_hash = '" . $new_workspace_hash . "', creator_id = " . $user_id;

		$res = $DB->query( $sql );
		if( !$res ) die( $sql );

		$id = $DB->last_insert_id();

		if( $TASK['title'] == "Intro Task - START HERE" ) {
			$sql	= "INSERT INTO xentask.assignees SET user_id = " . $user_id . ", assigned_by_id = " . $user_id . ", task_id = " . $id;
			$DB->query( $sql );
		}

	}

}

function doCookieLogin() {
	$DB		= new Database( );

	$sql	= "SELECT * FROM xentask.users WHERE hash = '" . $_COOKIE['xentask'] . "'";

	$res	= $DB->query( $sql );

	if( $res && $res->num_rows != 0 ) {

		$_SESSION['USER']	= $DB->fetch_assoc( );

	} else {

		returnJSON( 401, 'LOGIN', [ 'message' => 'INVALID CREDENTIALS', 'authenticated' => 0 ] );

	}
	$sql	= "SELECT w.name, w.hash as workspace_hash, w.image, w.color
				FROM xentask.workspace_users wu 
					JOIN workspaces w 
						ON wu.workspace_id = w.id 
					WHERE wu.user_id = " . $_SESSION['USER']['id'];
	$res	= $DB->query( $sql );

	while( $row = $DB->fetch_assoc( ) )
		$_SESSION['USER']['workspaces'][] = $row;

	$sql			= "SELECT value FROM xentask.users_settings WHERE user_id = " . $_SESSION['USER']['id'] . " AND setting = 'default_workspace'";
	$workspace_hash	= $DB->fetch1( $sql );

	$_SESSION['USER']['default_workspace']	= !empty( $workspace_hash ) ? $workspace_hash : $_SESSION['USER']['workspaces'][0]['workspace_hash'];
	$_SESSION['USER']['workspace_id']		= $_SESSION['USER']['workspaces'][0]['id'];
	$_SESSION['USER']['initals'] = substr($_SESSION['USER']['first_name'], 0, 1) . substr($_SESSION['USER']['last_name'], 0, 1);

}