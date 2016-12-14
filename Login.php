<?php

// 共通ファイル
$Filename_sc = $_SERVER['DOCUMENT_ROOT'] .'/sub_common.php';
if ( !is_readable( $Filename_sc ) ) { echo $Filename_sc . ' is not readable.'; exit; }
include( $Filename_sc );


session_start();
$login = isset( $_SESSION['login_id'] );  // ログイン済みならtrue



////////////////////////////////////////////////////////////////////////////////


// エラーメッセージを格納する変数を初期化
$error_message = '';

$logout = false;
if ( isset( $_SESSION['login_id'] ) ) {
	unset( $_SESSION['login_id'] );
	$logout = true;
}
// if ( isset( $_POST['login_button'] ) ) {
// 	if ( $_POST['login_button'] === 'ログアウト' ) {
// 		unset( $_SESSION['login_id'] );
// 		$logout = true;
// 	}
// }



// ログインボタンが押されたかを判定
// 初めてのアクセスでは認証は行わずエラーメッセージは表示しないように
if ( isset( $_POST['login'] ) ) {
	if ( $_POST['login_id'] == LOGIN_ID  &&  $_POST['password'] == PASSWORD ) {
		$_SESSION['login_id'] = $_POST['login_id'];

		// 管理者画面へリダイレクト
		$login_url = "http://{$_SERVER['HTTP_HOST']}/index.php";
		header( "Location: {$login_url}" );
		exit;
	}

	$error_message = 'ユーザー名もしくはパスワードが間違っています。';
}

?>

<!DOCTYPE html>
<html lang='ja'>

<head>
	<?php PrintHead( 'ログイン画面' ); ?>
</head>


<body onLoad="document.loginform.login_id.focus()">
<!-- <body> -->
	<header>
		<?= PrintHome(); ?>
	</header>


	<div class='main' name='main'>
		
		<?php
			if ( $logout ) {
				echo "<p>ログアウトしました。</p>\n";
				echo "<button type='button' class='btn-blue' onclick=\"location.href='index.php'\">戻る</button>";
				exit;
			}
		?>
		
		<?php
			if ($error_message) {
				print '<font color="red">' . $error_message . '</font>';
			}
		?>

		
		<form name='loginform' action='Login.php' method='POST'>
			<table>
			<tr> <td>ユーザ名：</td>  <td> <input type='text' name='login_id' value='' /> </td> </tr>
			<tr> <td>パスワード：</td> <td> <input type='password' name='password' value='' /></td> </tr>
			</table>
			<input type='submit' class='btn-blue' name='login' value='ログイン' />
		</form>

	</div>

</body>
</html>



