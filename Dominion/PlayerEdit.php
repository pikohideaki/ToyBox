<?php


// 共通ファイル
$Filename_sc  = $_SERVER['DOCUMENT_ROOT'] .'/sub_common.php';
if ( !is_readable( $Filename_sc  ) ) { echo $Filename_sc  . ' is not readable.'; exit; }
include( $Filename_sc );

$Filename_sDc = $_SERVER['DOCUMENT_ROOT'] .'/Dominion/sub_Dominion_common.php';
if ( !is_readable( $Filename_sDc ) ) { echo $Filename_sDc . ' is not readable.'; exit; }
include( $Filename_sDc );

$Filename_sGc = $_SERVER['DOCUMENT_ROOT'] .'/Dominion/sub_GameResult_common.php';
if ( !is_readable( $Filename_sGc ) ) { echo $Filename_sGc . ' is not readable.'; exit; }
include( $Filename_sGc );


session_start();
$login = isset( $_SESSION['login_id'] );  // ログイン済みならtrue


////////////////////////////////////////////////////////////////////////////////



$add = ( $_POST['add'] === '新規追加' );

if ( !$add ) {
	for ( $i = 0; $i < $dominist_num; $i++ ) {
		if ( isset( $_POST['edit_No' . $i] ) ) {
			$edit_No = $i;
		}
	}
}

$message = '';

?>



<!DOCTYPE html>
<html lang='ja'>

<head>
	<?php PrintHead( 'プレイヤー編集' ); ?>
	<style type="text/css">
		dt {
			width : 70px;
			float : left;
			clear : left;
		}
		dd {
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
		<?= PrintHeader( $login ) ?>
	</header>


	<div class='main'>
		<form action='./Players.php' method='post'>
		<?php
echo "
			<dl>
			<dt class='vertical_align'>名前：</dt>
				<dd class='vertical_align'>
					<input type='text' class='text' name='new_name'" .
					( $add ? "autocomplete='off'" : 'value=' . h($dominist[$edit_No]->name) ) . ">
				</dd>

			<dt class='vertical_align'>フリガナ：</dt>
				<dd class='vertical_align'>
					<input type='text' class='text' name='new_yomi'" .
					( $add ? " autocomplete='off'" : "value=" . h($dominist[$edit_No]->yomi) ) . ">
				</dd>
			</dl>

			<div class='clear'></div>
			<p> 
				<input type='submit' class='btn-blue' name='edit_action'
				value='" . ( $add ? '新規追加' : '更新' ) . "'>
				<input type='submit' class='btn-blue' value='キャンセル' onClick=\"form.action='Players.php'; return true\">
			</p>
";
			if ( !$add ) {
echo "
		<input type='hidden' name='edit_No' value='{$edit_No}'>
";
			}
		?>
		</form>
	</div>

	<script type="text/javascript">
		function deleteChk() {
			return confirm ( "削除してもよろしいですか？");
		}
	</script>
</body>
</html>

