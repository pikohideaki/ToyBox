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



$add = false;
$update = false;
$delete = false;
if ( $_POST['edit_action'] === '新規追加' ) {
	$add = true;
} else if ( $_POST['edit_action'] === '更新' ) {
	$update = true;
} else if ( $_POST['edit_action'] === '削除' ) {
	$delete = true;
}


// dominist[]とGR[]->nameを更新
if ( $add ) {
	if ( isset( $_POST['new_name'] ) && isset( $_POST['new_yomi'] ) ) {
		$new_name = $_POST['new_name'];
		$new_yomi = $_POST['new_yomi'];
	}
	$dominist[ $dominist_num ] = new DoministName();
	$dominist[ $dominist_num ]->name = $new_name;
	$dominist[ $dominist_num ]->yomi = $new_yomi;
	$dominist_num++;
	usort( $dominist, 'cmp' );
 // 誤削除後の復元に対応
	for ( $i = 0; $i < $GRsize; $i++ ) {
		for ( $k = 0; $k < $GR[$i]->player_num; $k++ ) {
			if ( $GR[$i]->name[$k] === '('.$new_name.')' ) {
				$GR[$i]->name[$k] = $new_name;
			}
		}
	}
	$message = '追加しました.';
	
}
if ( $update ) {
	$edit_No = $_POST['edit_No'];
	$new_name = $_POST['new_name'];
	$new_yomi = $_POST['new_yomi'];
	$old_name = $dominist[$edit_No]->name;
	$dominist[$edit_No]->name = $new_name;
	$dominist[$edit_No]->yomi = $new_yomi;
	usort( $dominist, 'cmp' );
 // GRの名前も更新
	for ( $i = 0; $i < $GRsize; $i++ ) {
		for ( $k = 0; $k < $GR[$i]->player_num; $k++ ) {
			if ( $GR[$i]->name[$k] === $old_name ) {
				$GR[$i]->name[$k] = $new_name;
			}
		}
	}
	$message = '更新しました.';
}
if ( $delete ) {
	for ( $i = 0; $i < $dominist_num; $i++ ) {
		if ( isset( $_POST['delete_No'.$i] ) ) {
			$delete_No = $i;
		}
	}
	$old_name = $dominist[$delete_No]->name;
	unset( $dominist[$delete_No] );
	$dominist = array_values( $dominist );
	$dominist_num--;
 // GRの削除されたプレイヤーの記録は括弧付きに
	for ( $i = 0; $i < $GRsize; $i++ ) {
		for ( $k = 0; $k < $GR[$i]->player_num; $k++ ) {
			if ( $GR[$i]->name[$k] === $old_name ) {
				$GR[$i]->name[$k] = '('.$old_name.')';
			}
		}
	}
	$message = '削除しました.';
}


// 書き込み
$OFilename = $_SERVER['DOCUMENT_ROOT'] . '/Dominion/tsv/Players.tsv';
if ( !is_writable( $OFilename ) ) { echo $OFilename . ' is not writable'; exit; }
$fpp = fopen( $OFilename, 'w' );
for ( $i = 0; $i < $dominist_num-1; $i++ ) {
	fputs( $fpp, $dominist[$i]->name. "\t" .$dominist[$i]->yomi. "\t"  );
}
fputs( $fpp, $dominist[$dominist_num-1]->name. "\t" .$dominist[$dominist_num-1]->yomi ); // 最後の要素はtab無しで書き込み
fclose( $fpp );

WriteGameResult( $GR );

?>



<!DOCTYPE html>
<html lang='ja'>

<head>
	<?php PrintHead( 'プレイヤー管理' ); ?>
</head>


<body>
	<header>
		<?= PrintHeader( $login ) ?>
	</header>


	<div class='main'>
		<table class='tbl-stripe'>
		<thead>
			<tr> <th>No.</th> <th>名前</th> <th>フリガナ</th>
				<?php if ( $login ) { echo '<th></th><th></th>'; } ?>
			</tr>
		</thead>
		<tbody>
		<?php
		for ( $i = 0; $i < $dominist_num; $i++ ) {
			echo "
		<tr>
			<td>{$i}</td>
			<td>" . h( $dominist[$i]->name ) . "</td>
			<td>" . h( $dominist[$i]->yomi ) . "</td>
";
			if ( $login ) {
echo <<<EOM
			<td style='padding: 0px'>
				<form action='PlayerEdit.php' method='post' >
					<input type='submit' class='btn-white' name='edit_No{$i}' value='編集' >
				</form>
			</td>
			<td style='padding: 0px'>
				<form action='Players.php' method='post' >
					<input type='hidden' name='edit_action' value='削除'>
					<input type='submit' class='btn-white' name='delete_No{$i}'
						value='削除' onClick="return deleteChk({$i}) ">
				</form>
			</td>
EOM;
			}
echo "
		</tr>
";
		}
		?>
		</tbody>
		</table>
		<p> <form action='PlayerEdit.php' method='post'>
			<?php if ( $login ) {
echo "
		<input type='submit' class='btn-blue' name='add' value='新規追加' />
";
			}
			?>
		</p>
	</div>
	
	<script type="text/javascript">
		function deleteChk(i) {
			return confirm ( "プレイヤーNo." + i + "を削除してもよろしいですか？");
		}
	</script>
</body>
</html>

