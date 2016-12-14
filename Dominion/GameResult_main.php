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

$Filename_sGRs = $_SERVER['DOCUMENT_ROOT'] .'/Dominion/sub_GameResult_spreadsheet.php';
if ( !is_readable( $Filename_sGRs ) ) { echo $Filename_sGRs . ' is not readable.'; exit; }
include( $Filename_sGRs );


session_start();
$login = isset( $_SESSION['login_id'] );  // ログイン済みならtrue


////////////////////////////////////////////////////////////////////////////////

if ( isset( $_POST['delete_GR'] ) ) {
	for ( $i = 0; $i < $GRsize; $i++ ) {
		if ( isset( $_POST["delete-{$GR[$i]->id}"] )) {
			GR_delete( $GR, $i, $GRsize );
		}
	}
	WriteGameResult( $GR );
	
	$message = '削除しました.';
}



 // 日付フィルタ
// 日付リストの作成
$datelist = array();  // GRに存在する日付のリスト
for ( $i = 0; $i < $GRsize; $i++ ) {
	$datelist[ $GR[$i]->date ] = 'dummy';
}
$datelist = array_keys( $datelist );
sort( $datelist );
$datelistsize = count( $datelist );
$date_begin = $datelist[0];
$date_end   = $datelist[ $datelistsize - 1 ];

if ( isset( $_POST['date_begin'] ) && isset( $_POST['date_end'] ) ) {
	if ( $_POST['specify_date'] === '総合成績' ) {
		;
	} else if ( $_POST['specify_date'] === '最新のみ' ) {
		$date_begin = $datelist[ $datelistsize - 1 ];
	} else {
		$date_begin = $_POST['date_begin'];
		$date_end   = $_POST['date_end'];
	}

	/* 指定された日付範囲外のデータを除外 */
	for ( $i = 0; $i < $GRsize; $i++ ) {
		if ( ( $GR[$i]->date < $date_begin ) || ( $date_end < $GR[$i]->date ) ) {
			unset( $GR[$i] );
		}
	}
	$GR = array_values( $GR );  /* 添え字を再設定 */
	$GRsize = count( $GR );
}



// 集計表に表示するゲーム参加人数を指定
$checked_player_num = array();

 // デフォルト選択
for ( $i = PLAYER_NUM_MIN; $i <= PLAYER_NUM_MAX; $i++ ) {
	$checked_player_num[$i] = ( $i <= PLAYER_NUM_DEFAULT );
}

if (isset( $_POST['checked_player_num'] )) {
	for ( $i = PLAYER_NUM_MIN; $i <= PLAYER_NUM_MAX; $i++ ) {
		$checked_player_num[$i] = ($_POST["checked_player_num$i"] === 'T');
	}
}


// 指定された人数でないデータを除外

  /* 空データ誤追加時に表示できるように */
for ( $i = 0; $i < $GRsize; $i++ ) {
	$GR[$i]->player_num = max( 1, $GR[$i]->player_num );
}
$checked_player_num[1] = true;

for ( $i = 0; $i < $GRsize; $i++ ) {
	if ( !$checked_player_num[ $GR[$i]->player_num ] ) {
		unset( $GR[$i] );
	}
}
$GR = array_values( $GR );
$GRsize = count( $GR );


// $checked_player_numで範囲外となる順位を非表示にするのに使用
$checked_player_num_max = PLAYER_NUM_MIN;  // チェックされているものの中での最大値
for ( $i = PLAYER_NUM_MIN; $i <= PLAYER_NUM_MAX; $i++ ) {
	if ( $checked_player_num[$i] ) {
		$checked_player_num_max = $i;
	}
}


$DD = spreadsheet( $GR, $GRsize, $dominist, $dominist_num, $checked_player_num );



if ( isset( $_POST['edit'] ) ) {
	$message = '修正しました';
}


?>



<!DOCTYPE html>
<html lang='ja'>

<head>
	<?php
		PrintHead( 'Dominion得点集計表' );
		PrintHead_Dominion();
	?>
</head>


<body style='width: 1200px'>
	<header>
		<?= PrintHeaderWithMenu( 'GameResult_main.php', $login ) ?>
	</header>


	<div class='main'>
		<h3>集計表
			<?php
				if ( $login ) {
					echo "<a href='/Dominion/tsv/GameResult.tsv'>（tsvファイルのダウンロード）</a>";
				}
			?>
		</h3>
		<form action='GameResult_main.php' method='post'>
			<p>
				<b>期間を選択</b> ： 
				<input type="date" class='text' name="date_begin" value="<?= $date_begin ?>">
				～
				<input type="date" class='text' name="date_end" value="<?= $date_end ?>">

				</select>
				<input type='submit' class='btn-blue' name='specify_date' value='OK'>
				 / 
				<input type='submit' class='btn-blue' name='specify_date' value='最新のみ'>
				 / 
				<input type='submit' class='btn-blue' name='specify_date' value='総合成績'>
			</p>
			<p>
				<b>プレイヤー数</b> ： 
				<?php
				for ( $i = PLAYER_NUM_MIN; $i <= PLAYER_NUM_MAX; $i++ ) {
					$checked = ( $checked_player_num[$i] ? 'checked' : '' );
echo "
				<input type='checkbox' id='checked_player_num{$i}' name='checked_player_num{$i}' value='T' $checked >
				<label for='checked_player_num{$i}' class='checkbox'>{$i}人</label>
";
				}
				?>
			</p>
			<p> <input type='submit' class='btn-blue' name='checked_player_num' value='OK'> </p>
		</form>
		<br>
		<table class='tbl-stripe'>

		<thead>
		<tr>
			<th nowrap>順位</th>  <!--  -->
			<th nowrap>名前</th>  <!--  -->
			<th nowrap>得点率</th>  <!--  -->
			<th nowrap>総得点</th>  <!--  -->
			<th nowrap>総対戦回数</th>  <!--  -->
			<?php
				for ( $i = 1; $i <= $checked_player_num_max; $i++ ) {
echo "
			<th nowrap>{$i}位回数</th>
";
				}
			?>
		</tr>
		</thead>
		<tbody>
			<?php
				for ( $i = 0; $i < $dominist_num; $i++ ) {
					if ( $DD[$i]->play_num_sum <= 0 ) continue;
					  // (指定期間に)総対戦回数0回のプレーヤーは表示しない
echo "
		<tr>
			<td>" . h( $DD[$i]->rank          ) . "</td>
			<td>" . h( $DD[$i]->name          ) . "</td>
			<td>" . h( $DD[$i]->score_average ) . "</td>
			<td>" . h( $DD[$i]->score_sum     ) . "</td>
			<td>" . h( $DD[$i]->play_num_sum  ) . "</td>
";

						for ( $k = 1; $k <= $checked_player_num_max; $k++ ) {
echo "
			<td>" . h( $DD[$i]->rank_num[$k] ) . "</td>
";
						}
echo "
		</tr>
";
				}
			?>
		</tbody>
		</table>
			<p>合計<?=$GRsize?>ゲーム</p>
		<br>
		<h3>履歴</h3>
		<table class='tbl-blue' >
		<thead>
			<tr>
				<th>日付</th>
				<th>場所</th>
				<th>順位</th>
				<th>名前</th>
				<th>VP</th>
				<th>スコア</th>
				<th>手番勝ち</th>
				<th>サプライ</th>
				<th>メモ</th>
				<?php 
					if ( $login ) {
echo "
				<th></th>
";
					}
				?>
			</tr>
		</thead>
		<tbody>

		<?php
		for ( $i = $GRsize-1; $i >= 0; $i-- ) {  // 結果は最新のみのものから逆順で表示
		for ( $k = 0; $k < $GR[$i]->player_num; $k++ ) {
echo "
		<tr>
";
			if ( $k === 0 ) {
echo <<<EOM
			<td nowrap rowspan={$GR[$i]->player_num}>{$GR[$i]->date }</td>
			<td nowrap rowspan={$GR[$i]->player_num}>{$GR[$i]->place}</td>
EOM;
			}
echo "
			<td nowrap>" .    $GR[$i]->player[$k]->rank               . "</td>
			<td nowrap>" . h( $GR[$i]->player[$k]->name   )           . "</td>
			<td nowrap>" .    $GR[$i]->player[$k]->VP                 . "</td>
			<td nowrap>" .    $GR[$i]->player[$k]->score              . "</td>
			<td nowrap>" .  ( $GR[$i]->player[$k]->turn  ? '*' : '' ) . "</td>
";
			if ( $k === 0 ) {
				$supply_str = MakeSupplyString( $GR[$i]->supply, $Cardlist, $Setlist );
			// <td width='100px' rowspan={$GR[$i]->player_num}>
			// 	<input type='button' class='btn-blue' value='サプライ' onclick=\"alert('{$supply_str}')\" >
			// </td>
				echo "
			<td width='300px' rowspan={$GR[$i]->player_num}>" . $supply_str . "</td>
			<td width='150px' rowspan={$GR[$i]->player_num}>" . h($GR[$i]->memo) . "</td>
";

				if ( $login ) {
echo <<<EOM
			<td rowspan={$GR[$i]->player_num}>
				<form action='GameResult_AddGame.php' method='post'>
					<input type='submit' class='btn-blue' name='edit' value='修正する'>
					<input type='hidden' name='edit_id' value='{$GR[$i]->id}' >
					<input type='hidden' name='from_main' value='T' >
				</form>
				<form action='GameResult_main.php' method='post'
					onsubmit='return deleteChk({$GR[$i]->id})'>
					<input type='submit' class='btn-blue'
						name='delete-{$GR[$i]->id}' value='削除' >
					<input type='hidden' name='delete_GR'>
				</form>
			</td>
EOM;
// echo <<<EOM
// 			<td rowspan={$GR[$i]->player_num}>
// 				<form action='GameResult_AddGame.php' method='post'>
// 					<input type='submit' class='btn-blue' name='edit' value='修正する'>
// 					<input type='hidden' name='edit_id' value='{$GR[$i]->id}' >
// 					<input type='hidden' name='from_main' value='T' >
// 				</form>
// 			</td>

// 			<td rowspan={$GR[$i]->player_num}>
// 				<form action='GameResult_main.php' method='post'
// 					onsubmit='return deleteChk({$GR[$i]->id})'>
// 					<input type='submit' class='btn-blue'
// 						name='delete-{$GR[$i]->id}' value='削除' >
// 					<input type='hidden' name='delete_GR'>
// 				</form>
// 			</td>
// EOM;
				}
			}
			echo "
		</tr>
";
		}}
		?>
		</tbody>
		</table>
	</div>

	<script type='text/javascript'>
		function deleteChk(i) {
			return confirm ( '削除してもよろしいですか？');
		}
	</script>

	<br><br><br><br><br>
	<br><br><br><br><br>
	<br><br><br><br><br>
	<br><br><br><br><br>
</body>
</html>

