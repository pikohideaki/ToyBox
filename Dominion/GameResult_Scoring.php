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



// Scoring.tsvを読み込み
$IFilename = $_SERVER['DOCUMENT_ROOT'] .'/Dominion/tsv/Scoring.tsv';
if ( !is_readable( $IFilename ) ) { echo $IFilename . ' is not readable'; exit; }
$fps = fopen( $IFilename, 'r' );
$scoring = array();
$scoring[2] = fgetcsv( $fps, 10000, "\t" );  // 2人のときのスコア
$scoring[3] = fgetcsv( $fps, 10000, "\t" );  // 3人のときのスコア
$scoring[4] = fgetcsv( $fps, 10000, "\t" );  // 4人のときのスコア
$scoring[5] = fgetcsv( $fps, 10000, "\t" );  // 5人のときのスコア
$scoring[6] = fgetcsv( $fps, 10000, "\t" );  // 6人のときのスコア
$memo = fgets( $fps, 10000 );
fclose( $fps );

if ( isset( $_POST['edit'] ) ) {
	$eflag = true;
}


if ( isset( $_POST['submit_new_scoring'] ) ) {
	$scoring = array();
	$scoring[2] = array();
	$scoring[2][0] = floatval( $_POST['scoring_2-0'] );
	$scoring[2][1] = floatval( $_POST['scoring_2-1'] );
	$scoring[3] = array();
	$scoring[3][0] = floatval( $_POST['scoring_3-0'] );
	$scoring[3][1] = floatval( $_POST['scoring_3-1'] );
	$scoring[3][2] = floatval( $_POST['scoring_3-2'] );
	$scoring[4] = array();
	$scoring[4][0] = floatval( $_POST['scoring_4-0'] );
	$scoring[4][1] = floatval( $_POST['scoring_4-1'] );
	$scoring[4][2] = floatval( $_POST['scoring_4-2'] );
	$scoring[4][3] = floatval( $_POST['scoring_4-3'] );
	$scoring[5] = array();
	$scoring[5][0] = floatval( $_POST['scoring_5-0'] );
	$scoring[5][1] = floatval( $_POST['scoring_5-1'] );
	$scoring[5][2] = floatval( $_POST['scoring_5-2'] );
	$scoring[5][3] = floatval( $_POST['scoring_5-3'] );
	$scoring[5][4] = floatval( $_POST['scoring_5-4'] );
	$scoring[6] = array();
	$scoring[6][0] = floatval( $_POST['scoring_6-0'] );
	$scoring[6][1] = floatval( $_POST['scoring_6-1'] );
	$scoring[6][2] = floatval( $_POST['scoring_6-2'] );
	$scoring[6][3] = floatval( $_POST['scoring_6-3'] );
	$scoring[6][4] = floatval( $_POST['scoring_6-4'] );
	$scoring[6][5] = floatval( $_POST['scoring_6-5'] );
	$memo = $_POST['memo'];
	
 // Scoring.tsv書き込み
	$OFilename = $_SERVER['DOCUMENT_ROOT'] .'/Dominion/tsv/Scoring.tsv';
	if ( !is_writable( $OFilename ) ) { echo $OFilename . ' is not writable.'; exit; }
	$fps = fopen( $OFilename, 'w' );
	fputs( $fps,
		$scoring[2][0] . "\t" .
		$scoring[2][1] . "\n" );
	fputs( $fps,
		$scoring[3][0] . "\t" .
		$scoring[3][1] . "\t" .
		$scoring[3][2] . "\n" );
	fputs( $fps,
		$scoring[4][0] . "\t" .
		$scoring[4][1] . "\t" .
		$scoring[4][2] . "\t" .
		$scoring[4][3] . "\n" );
	fputs( $fps,
		$scoring[5][0] . "\t" .
		$scoring[5][1] . "\t" .
		$scoring[5][2] . "\t" .
		$scoring[5][3] . "\t" .
		$scoring[5][4] . "\n" );
	fputs( $fps,
		$scoring[6][0] . "\t" .
		$scoring[6][1] . "\t" .
		$scoring[6][2] . "\t" .
		$scoring[6][3] . "\t" .
		$scoring[6][4] . "\t" .
		$scoring[6][5] . "\n" );
	fputs( $fps, $memo . "\n" );
	fclose( $fps );
	
 /* GRのscoreの書き換え */
	$Filename = $_SERVER['DOCUMENT_ROOT'] .'/Dominion/sub_GameResult_rank.php';
	if ( !is_readable( $Filename ) ) { echo $Filename . ' is not readable.'; exit; }
	include( $Filename );
	for ( $i = 0; $i < $GRsize; $i++ ) {
		$GR[$i] = Rank( $GR[$i] ); /* 順位とスコアの再計算 */
	}

	WriteGameResult( $GR );

	$message = '更新しました.';
}



?>




<!DOCTYPE html>
<html lang='ja'>

<head>
	<?php
		PrintHead( 'スコアリング' );
		PrintHead_Dominion();
	?>
</head>


<body>
	<header>
		<?= PrintHeaderWithMenu( 'GameResult_Scoring.php', $login ) ?>
	</header>


	<div class='main'>
		
		<h2>得点計算</h2>
		<p>
			<form action='./GameResult_Scoring.php' method='post'>
			<?php
			if ( $eflag ) {
echo "
		<textarea name='memo' rows='6' cols='80'>" . h($memo) . "</textarea>
";
			} else {
echo "
			<p>" . h( $memo ) ."</p>
";
			}
			?>
				
			<table class='tbl-stripe'>
			<thead>
				<tr>
					<th nowrap>人数</th>
					<th nowrap>1位得点</th>
					<th nowrap>2位得点</th>
					<th nowrap>3位得点</th>
					<th nowrap>4位得点</th>
					<th nowrap>5位得点</th>
					<th nowrap>6位得点</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td nowrap>2人のとき</td>
					<?php
						for ( $i = 0; $i < 2; $i++ ) {
echo "
		<td nowrap>
";
							if ( $eflag ) {
echo "
		<input type='number' class='text' step='0.1' name='scoring_2-{$i}' value=" . floatval($scoring[2][$i]) . "
			style='width:50px' autocomplete='off' >
";
							} else{
								echo floatval( $scoring[2][$i] );
							}
							echo "点
		</td>";
						}
					?>
					<td nowrap>---</td>
					<td nowrap>---</td>
					<td nowrap>---</td>
					<td nowrap>---</td>
				</tr>
				<tr>
					<td nowrap>3人のとき</td>
					<?php
						for ( $i = 0; $i < 3; $i++ ) {
echo "
		<td nowrap>
";
							if ( $eflag ) {
echo "
		<input type='number' class='text' step='0.1' name='scoring_3-{$i}' value=" . floatval($scoring[3][$i] ) . "
		style='width:50px' autocomplete='off' >
";
							} else{
								echo floatval( $scoring[3][$i] );
							}
echo "点
		</td>
";
						}
					?>
					<td nowrap>---</td>
					<td nowrap>---</td>
					<td nowrap>---</td>
				</tr>
				<tr>
					<td nowrap>4人のとき</td>
					<?php
						for ( $i = 0; $i < 4; $i++ ) {
echo "
		<td nowrap>
";
							if ( $eflag ) {
echo "
		<input type='number' class='text' step='0.1' name='scoring_4-{$i}' value=" . floatval($scoring[4][$i]) . "
		style='width:50px' autocomplete='off' >
";
							} else{
								echo floatval( $scoring[4][$i] );
							}
echo "点
		</td>
";
						}
					?>
					<td nowrap>---</td>
					<td nowrap>---</td>
				</tr>
				<tr>
					<td nowrap>5人のとき</td>
					<?php
						for ( $i = 0; $i < 5; $i++ ) {
echo "
		<td nowrap>
";
							if ( $eflag ) {
echo "
		<input type='number' class='text' step=\"0.1\" name='scoring_5-{$i}' value=" . floatval($scoring[5][$i]) . "
		style='width:50px' autocomplete='off' >
";
							} else{
								echo floatval( $scoring[5][$i] );
							}
echo "点
		</td>
";
						}
					?>
					<td nowrap>---</td>
				</tr>
				<tr>
					<td nowrap>6人のとき</td>
					<?php
						for ( $i = 0; $i < 6; $i++ ) {
echo "
		<td nowrap>
";
							if ( $eflag ) {
echo "
		<input type='number' class='text' step=\"0.1\" name='scoring_6-{$i}' value=" . floatval($scoring[6][$i]) . "
		style='width:50px' autocomplete='off' >
";
							} else{
								echo floatval( $scoring[6][$i] );
							}
echo "点
		</td>
";
						}
					?>
				</tr>
			</tbody>
			</table>
			<?php
			if ( $eflag ) {
echo "
		<input type='submit' class='btn-blue' value='ok' name='submit_new_scoring'>
";
			} else {
				if ( $login ) {
echo "
		<input type='submit' class='btn-blue' value='編集' name='edit'>
";
				}
			}
			?>
			</form>
		</p>
	</div>


</body>
</html>

