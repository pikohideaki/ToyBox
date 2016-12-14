<?php


setlocale( LC_ALL, 'ja_JP.UTF-8' );

function h( $str ) {
	return htmlspecialchars($str, ENT_QUOTES, 'UTF-8');
}

function br() {
	echo "<br>\n";
}


define( LOGIN_ID, 'kusonemi' );  // login id
define( PASSWORD, 'kusonemi' );  // password



/* absolute path of this file */



function PrintHead( $TITLE ) {
	$Filename = $_SERVER['DOCUMENT_ROOT'] . "/sub_mobile.php";
	if( !is_readable( $Filename ) ) { echo "{$Filename} is not readable."; exit; }
	include( $Filename );
	SetViewport();

	// <link rel='shortcut icon' href='/image/favicon.ico'>
echo <<<EOM

	<meta charset='UTF-8' />
	<title>{$TITLE}</title>

  <!-- stylesheet -->

	<!-- font-awesome -->
	<link type="text/css" rel="stylesheet"
	  href="//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css">

	<!-- jQuery-UI (sortable) -->
	<link type="text/css" rel="stylesheet"
	  href="/js/jquery/jquery-ui-1.12.1/jquery-ui.css">

	<!-- my settings -->
	<link type="text/css" rel='stylesheet' href='/css/default.css'/>


  <!-- js -->

	<!-- jQuery -->
	<script type="text/javascript" src="/js/jquery/jquery-2.1.4.min.js"></script>

	<!-- jQuery-UI -->
	<script type="text/javascript" src="/js/jquery/jquery-ui-1.12.1/jquery-ui.js"></script>

	<!-- jQuery cookie -->
	<script type="text/javascript" src="/js/jquery/jquery.cookie.js"></script>

	<!-- sortable iPhone対応 -->
	<script src="/js/jquery/jquery.ui.touch-punch.min.js"></script>

	<!-- shadow animation (jquery should be version >= 1.8) -->
	<script src="//cdn.jsdelivr.net/jquery.shadow-animation/1/mainfile"></script>


	<script>
		$(function() {
			$('#sortable').sortable();
			$('#sortable').disableSelection();
		});
	</script>

	<script src='/js/sub_mylib.js'></script>
	<script src='/js/jQuery_common.js'></script>

EOM;

	// 3.1.1 -> shadow animation doesnt work

	// <!-- jQuery -->
	// <script
	//   src="https://code.jquery.com/jquery-3.1.1.min.js"
	//   integrity="sha256-hVVnYaiADRTO2PzUGmuLJr8BLUSjGIZsDYGmIJLv2b8="
	//   crossorigin="anonymous"></script>

	// <!-- jQuery-UI -->
	// <script src="/js/jquery/jquery-ui-1.12.1/jquery-ui.js"></script>
	// <script
	//   src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js"
	//   integrity="sha256-VazP97ZCwtekAsvgPBSUwPFKdrwD3unUfSGVYrahUqU="
	//   crossorigin="anonymous"></script>

	// https://cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.4.1/jquery.cookie.js


	// <link rel="stylesheet" href="/js/jquery/jquery-ui-1.12.1/jquery-ui.css">

	// <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.0.0-alpha1/jquery.min.js"></script>




	// <!-- iPhone風トグルスイッチ -->
	// <script src="/js/jquery/iphone_style/jquery/iphone-style-checkboxes.js"></script>
	// <link rel="stylesheet" href="/js/jquery/iphone_style/style.css">
	// <script type="text/javascript">
	// 	$(function() {  // ページ読み込み完了時に実行される
	// 		$('.iphone:checkbox').iphoneStyle(
	// 			// { checkedLabel:'あり', uncheckedLabel:'なし' }
	// 		);
	// 	});
	// </script>

}



function PrintHome() {
echo <<<EOM
		<div class='header-left'>
			<a href="/index.php" class='home-btn'> <span class='fa fa-home'></span> </a>
		</div>
EOM;
}


function PrintHeader( $login ) {
	$login_str = ( $login ? 'ログアウト' : 'ログイン' );

	PrintHome();
echo <<<EOM
		<div class='header-right'>
			<a href="/Login.php"> $login_str </a>
		</div>
EOM;
}



