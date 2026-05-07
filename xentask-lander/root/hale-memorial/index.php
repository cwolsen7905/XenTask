<?php

  $counter  = 1;

  if( file_exists('./counter') ) {

    $counter = (int) file_get_contents('./counter');

    ++$counter;

    session_start();

    if( empty( $_SESSION['visited'] ) ) {

        file_put_contents('./counter', $counter);

    }

    $_SESSION['visited'] = true;

  }

?>
<!DOCTYPE html>
<html>
  <head>
      <link rel="stylesheet" href="css/coming-soon.css">
      <title>XenTask</title>
  </head>
  <body>
    <img src="img/contact-info.png" class="contact-img" />
    
    <div class="wrap">
      <h1>XenTask<br>coming soon</h1>
      <div class="top-plane"></div>
      <div class="bottom-plane"></div>
    </div>
    
    <div class="supporters">
      <img src="img/supporters.png" />
      <span><?=$counter?></span>
    </div>

  </body>
</html>