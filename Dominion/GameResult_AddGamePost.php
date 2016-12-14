<?php


// 共通ファイル
$Filename_sc  = $_SERVER['DOCUMENT_ROOT'] .'/sub_common.php';
if ( !is_readable( $Filename_sc  ) ) { echo $Filename_sc  . ' is not readable.'; exit; }
include( $Filename_sc );

$Filename_sDc = $_SERVER['DOCUMENT_ROOT'] .'/Dominion/sub_Dominion_common.php';
if ( !is_readable( $Filename_sDc ) ) { echo $Filename_sDc . ' is not readable.'; exit; }
include( $Filename_sDc );

$Filename_sR = $_SERVER['DOCUMENT_ROOT'] .'/Dominion/sub_Randomizer.php';
if ( !is_readable( $Filename_sR ) ) { echo $Filename_sR . ' is not readable.'; exit; }
include( $Filename_sR );

$Filename_sGc = $_SERVER['DOCUMENT_ROOT'] .'/Dominion/sub_GameResult_common.php';
if ( !is_readable( $Filename_sGc ) ) { echo $Filename_sGc . ' is not readable.'; exit; }
include( $Filename_sGc );


session_start();
$login = isset( $_SESSION['login_id'] );  // ログイン済みならtrue


////////////////////////////////////////////////////////////////////////////////



$Filename_Gsr = $_SERVER['DOCUMENT_ROOT'] . '/Dominion/sub_GameResult_rank.php';
if ( !is_readable( $Filename_Gsr) ) { echo $Filename_Gsr . ' is not readable.'; exit; }
include( $Filename_Gsr );



// $_COOKIE['use_eventcards']             =         $_POST['use_eventcards'] === 'T';
for ( $i = 0; $i < count( $Setlist ); $i++ ) {
	$b = isset( $_POST["use_set{$i}"] ) && ($_POST["use_set{$i}"] === 'T');
	setcookie( "use_set{$i}", ( $b ? 'T' : 'F' ), strtotime( '+30days' ) );
}


$from_main = isset( $_COOKIE['from_main'] ) && $_COOKIE['from_main'];


// POST受け取り
$gr = new GameResult();  // ゲーム結果(1ゲーム分)

$player_num = 0;
{
	$l = 0;
	for ( $k = 0; $k < $dominist_num; $k++ ) {
		setcookie( "D{$k}-checked", isset( $_POST["D{$k}-VP"] ), strtotime( '+30days' ) );
		if ( isset( $_POST["D{$k}-VP"] ) ) {
			$gr->player[$l]->name = $dominist[$k]->name;
			$gr->player[$l]->VP   = intval( $_POST["D{$k}-VP"] );
			$gr->player[$l]->turn = isset( $_POST["D{$k}-turn"] );
			$l++;
		}
	}
	$player_num = $l;
}

$gr->id         = intval( $_POST['edit_id'] );
$gr->date       = date( $_POST['date'] );
$gr->place      = $_POST['place'];
$gr->player_num = $player_num;
$gr->memo       = $_POST['memo'];

setcookie( 'place', $gr->place, strtotime( '+30days' ) );

for ( $i = 0; $i < count( $Setlist ); $i++ ) {
	$gr->supply->set[$i] = isset( $_POST["use_set{$i}"] );
}
$gr->supply->Prosperity  = isset( $_POST['supply_Prosperity'] ) && ( $_POST['supply_Prosperity']  === 'T' );
$gr->supply->DarkAges    = isset( $_POST['supply_DarkAges']   ) && ( $_POST['supply_DarkAges'] === 'T' );
for ( $i = 0; $i < KINGDOMCARD_SIZE; $i++ ) {
	$gr->supply->kingdomcards[$i] = intval( $_POST["supply_kingdomcards{$i}"] );
}
$gr->supply->eventcards[0] = intval( $_POST['supply_eventcards0'] );
$gr->supply->eventcards[1] = intval( $_POST['supply_eventcards1'] );
$gr->supply->landmark  [0] = intval( $_POST['supply_landmark0'] );
$gr->supply->landmark  [1] = intval( $_POST['supply_landmark1'] );
$gr->supply->banecard      = intval( $_POST['supply_banecard'] );
$gr->supply->obelisk       = intval( $_POST['supply_obelisk'] );
for ( $k = 0; $k < BLACKMARKET_SIZE; $k++ ) {
	$gr->supply->blackmarket[$k] = intval( $_POST["supply_blackmarket{$k}"] );
}


// 順位づけとスコア計算
$gr = Rank( $gr );  // sub_GameResult_rank.php


if ( isset( $_POST['edit'] ) ) {
	for ( $i = $GRsize - 1; $i >= 0; $i-- ) {
		if ( $GR[$i]->id === intval( $_POST['edit_id'] ) ) {
			$GR[$i] = $gr;
			break;
		}
	}
} else {
	$GR[$GRsize] = $gr;
}

WriteGameResult( $GR );

$message = '記録しました.';

?>



<!DOCTYPE html>
<html lang='ja'>

<head>
	<?php
		PrintHead( 'ゲーム結果追加' );
		PrintHead_Dominion();
	?>
</head>


<body>
	<header>
		<?= PrintHeaderWithMenu( 'GameResult_AddGame.php', $login ) ?>
	</header>


	<div class='main'>
		
		<table class='tbl-blue'>
			<thead>
				<tr>
					<th>順位</th>
					<th>プレイヤー</th>
					<th>VP</th>
					<th>得点</th>
					<th>同点手番勝ち</th>
				</tr>
			</thead>
			<tbody>
			<?php
			for ( $k = 0; $k < $player_num; $k++ ) {
				$turn = ( $gr->player[$k]->turn ? '*' : '' );
				$name = h( $gr->player[$k]->name );
echo <<<EOM
		<tr>
			<td nowrap>{$gr->player[$k]->rank }</td>
			<td nowrap>{$name}                 </td>
			<td nowrap>{$gr->player[$k]->VP   }</td>
			<td nowrap>{$gr->player[$k]->score}</td>
			<td >{$turn}</td>
		</tr>
EOM;
			}
			?>
			</tbody>
		</table>
		<p>日付：<?= $gr->date ?></p>
		<p>場所：<?= $gr->place ?></p>

		<div id='div_supply'>
		<?php
			if ( $gr->supply->kingdomcards[0] > 0 ) {  // 記録があれば表示
echo <<<EOM
		<h3>サプライ</h3>
EOM;
				PrintSupply( $gr, $Setlist, $Cardlist, false );
			}
		?>
		</div>
		<p>　メモ：<?= h( $gr->memo ) ?></p>

		<form id='form_gr' method='post'>
			<?php
echo <<<EOM
		<input type='hidden' name='start_player' value='{$_POST['start_player']}'>
		<input type='hidden' name='edit_id' value='{$gr->id}'>
		<input type='submit' class='btn-blue' id='btn_edit' name='edit' value='修正する'
			onClick="form.action='GameResult_AddGame.php'; return true; " >
EOM;
				if ( $from_main ) {
echo <<<EOM
		<input type='hidden' name='from_main' value='true'>
		<input type='submit' class='btn-blue' id='btn_back_to_main' name='back' value='戻る'
			onClick="form.action='GameResult_main.php';    return true;" >
EOM;
				} else {
echo <<<EOM
		<input type='submit' class='btn-blue' id='btn_back_to_addgame' name='back' value='戻る'
			onClick="form.action='GameResult_AddGame.php'; return true" >
EOM;
				}
			?>
		</form>
	</div>
</body>

<?php
	/* globaly define Cardlist, Setlist in javascript */
	PHP2JS_Cardlist_Setlist( $Cardlist, $Setlist );
?>
<script type="text/javascript">
$( function() {
	$('#div_supply').on( 'click', '.card_effect', function() {
		const card_no = $(this).attr('data-card_no');
		const Card = Cardlist[card_no];
		const str = ''
			+ `【分類】${Card.class}\n`
			+ `【種類】${Card.category}\n\n`
			+ `${Card.effect1}\n\n`
			+ `${Card.effect2}\n\n`
			+ `${Card.effect3}\n\n`
			+ `${Card.effect4}\n\n`;
		alert(str);
	});
});
</script>

</html>

