<?php

// 共通ファイル
$Filename_sc = $_SERVER['DOCUMENT_ROOT'] .'/sub_common.php';
if ( !is_readable( $Filename_sc ) ) { echo $Filename_sc  . ' is not readable.'; exit; }
include( $Filename_sc );


session_start();
$login = isset( $_SESSION['login_id'] );  // ログイン済みならtrue




class CRequest {
	public $request;
	public $answer;
	function __construct() {
		$request = "";
		$answer  = "";
	}
}

$requests = array();
{
	$IFilename = $_SERVER['DOCUMENT_ROOT'] .'/Requests.tsv';
	if ( !is_readable( $IFilename ) ) { echo $IFilename . ' is not readable'; exit; }
	$fpd = fopen( $IFilename, 'r' );
	$i = 0;
	while ( $d = fgetcsv( $fpd, 100000, "\t" ) ) {
		$requests[$i] = new CRequest();
		$requests[$i]->request = $d[0];
		$requests[$i]->answer  = $d[1];
		$i++;
	}
}

fclose( $fpd );

?>



<!DOCTYPE html>
<html lang='ja'>

<head>
	<?php PrintHead( 'Request' ); ?>
	<style type="text/css">
		dt.floatleft{
			width : 70px;
			float : left;
			clear : left;
			margin-top : 10px;
		}
		dd.floatleft{
			margin-top : 10px;
			margin-left : 10px;
			float : left;
		}
		.vertical_align {
			height : 30px;
			line-height : 30px;
		}
		.request_list {
			margin-top : 20px;
		}
		.requests {
			margin-top : 10px;
		}
	</style>

</head>


<body>
	<header>
		<?= PrintHome(); ?>
	</header>


	<div class='main'>
		<h2>ご意見箱</h2>

		<p>「ここのデザインをこうしてほしい」「こんな機能が欲しい」「ここに不具合がある」など、ご要望等があればお気軽にどうぞ。
			必ず対応するとは限りませんが、参考にさせていただきます。</p>
		<p>名前は空欄でも投稿できます。</p>
		<form action="./Request_post.php" method="post" id="request_form">
			<fieldset>
				<legend>送信フォーム</legend>

				<dl>
					<dt class='floatleft vertical_align'>名前</dt>
						<dd class='floatleft vertical_align name'>
							<input type="text" class='text' name="name" size="30" value="" />
						</dd>

<!-- 					<dt class='floatleft vertical_align'>E-mail</dt>
						<dd class='floatleft vertical_align email'>
							<input type="text" class='text' name="email" size="30" value="" />
						</dd>
 -->
					<dt class='floatleft'>ご意見</dt>
						<dd class='floatleft message' >
							<textarea name="message" cols="50" rows="10"></textarea>
						</dd>
					<div class='clear'></div>

				</dl>

				<p><input type="submit" class='btn-blue' value="確認画面へ進む" /></p>
			</fieldset>
		</form>


		<div class='request_list'>
		<h3>これまでに頂いたご意見</h3>
		<?php
			for ( $i = 0; $i < count( $requests ); $i++ ) {
echo <<<EOM

			<dt class='requests'>{$requests[$i]->request}</dt>
				<dd class='requests'>⇒ {$requests[$i]->answer}</dd>

EOM;
			}

		?>
		</div>


		<h3>ToDo</h3>
		<ul>
			<li>カード効果確認ボタン</li>
			<li>投了機能</li>
			<li>通信状態表示</li>
			<li>アニメーションなど</li>
			<li>効果音</li>
		</ul>

	</div>
</body>
<script type="text/javascript">
$( function() {
	$('#request_form').submit( function() {
		if ( $('.message textarea').val() == '' ) {
			alert('ご意見欄が空欄です！'); return false;
		}
		return true;
	});
});
</script>
</html>
