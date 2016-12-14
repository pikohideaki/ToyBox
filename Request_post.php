<?php

// 共通ファイル
$Filename_sc = $_SERVER['DOCUMENT_ROOT'] .'/sub_common.php';
if ( !is_readable( $Filename_sc ) ) { echo $Filename_sc  . ' is not readable.'; exit; }
include( $Filename_sc );


session_start();
$login = isset( $_SESSION['login_id'] );  // ログイン済みならtrue



////////////////////////////////////////////////////////////////////////////////

$name    = $_POST['name'];
// $email   = $_POST['email'];
$message = $_POST['message'];
// $textbody = "{$name} ： {$message}";

// mb_language("Japanese");
// mb_internal_encoding("UTF-8");


// $send_status = mb_send_mail("noshiro.pf@gmail.com", "ToyBox ご意見", $mail_body, "From: {$email}");

$OFilename = $_SERVER['DOCUMENT_ROOT'] . '/Requests.tsv';
if ( !is_writable( $OFilename ) ) { echo $OFilename . ' is not writable'; exit; }
// $fpg = fopen( $OFilename, 'w' );
file_put_contents( $OFilename, "{$name} ： {$message}\t\n", FILE_APPEND | LOCK_EX );
// fclose( $fpg );

?>



<!DOCTYPE html>
<html lang='ja'>

<head>
	<?php PrintHead( 'Request' ); ?>
	<style type="text/css">
		dt {
			width : 70px;
			float : left;
			clear : left;
			margin-top : 10px;
		}
		dd {
			margin-top : 10px;
			margin-left : 10px;
			float : left;
		}
		.vertical_align {
			height : 30px;
			line-height : 30px;
		}
	</style>

</head>


<body>
	<header>
		<?= PrintHome(); ?>
	</header>


	<div class='main'>
		<h2>ご意見箱</h2>
		<!-- <p><?= ( $send_status ? "以下の内容で送信しました。" : "<font color='red'>送信に失敗しました！お手数ですが再度送信をお試しください。</font>") ?></p> -->
		<p>以下の内容で送信しました。</p>
		<fieldset>

			<dl>
				<dt class='vertical_align'>名前 ： </dt>
					<dd class='vertical_align name'> <?= $name ?> </dd>
<!-- 
				<dt class='vertical_align'>E-mail ： </dt>
					<dd class='vertical_align email'> <?= $email ?> </dd>
 -->
				<dt>ご意見 ： </dt>
					<dd class='message'> <?= $message ?> </dd>
				<div class='clear'></div>

			</dl>

			<p><button class='btn-blue back'>戻る</button></p>
		</fieldset>
	</div>
</body>
<script type="text/javascript">
$( function() {
	$('.back').click( () => { window.location.href = './Request.php'; } );
})
</script>
</html>
