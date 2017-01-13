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

$Filename_sGr = $_SERVER['DOCUMENT_ROOT'] .'/Dominion/sub_GameResult_rank.php';
if ( !is_readable( $Filename_sGr ) ) { echo $Filename_sGr . ' is not readable.'; exit; }
include( $Filename_sGr );


session_start();
$login = isset( $_SESSION['login_id'] );  // ログイン済みならtrue


////////////////////////////////////////////////////////////////////////////////

// var_dump($_COOKIE);

// POST受け取り
$myid       = $_COOKIE['myid'];
$myname     = $_COOKIE['myname'];
$GameRoomID = $_COOKIE['GameRoomID'];



$gr = new GameResult();  // ゲーム結果(1ゲーム分)

$gr->id         = time();
$gr->date       = date("Y-m-d");
$gr->place      = 'Online';
$gr->player_num = intval( $_COOKIE['player_num'] );
$gr->memo       = '';

setcookie( 'place', 'Online', strtotime( '+30days' ) );
$player_num = $gr->player_num;
for ( $i = 0; $i < $player_num; $i++ ) {
	$gr->player[$i]->name = $_COOKIE["Player{$i}-name"];
	$gr->player[$i]->VP   = intval( $_COOKIE["Player{$i}-VPtotal"] );
	$gr->player[$i]->turn = ($_COOKIE["Player{$i}-turn"] == 'true');
}


for ( $i = 0; $i < count( $Setlist ); $i++ ) {
	$gr->supply->set[$i] = ( $_COOKIE["UseSet{$i}"] == 'true' );
}
for ( $i = 0; $i < KINGDOMCARD_SIZE; $i++ ) {
	$gr->supply->kingdomcards[$i] = intval( $_COOKIE["KingdomCards{$i}"] );
}
for ( $i = 0; $i < BLACKMARKET_SIZE; $i++ ) {
	$gr->supply->blackmarket[$i] = intval( $_COOKIE["BlackMarket{$i}"] );
}
$gr->supply->Prosperity    = ( $_COOKIE['Prosperity'] == 'true' );
$gr->supply->DarkAges      = ( $_COOKIE['DarkAges']   == 'true' );
$gr->supply->eventcards[0] = intval( $_COOKIE['EventCards0'] );
$gr->supply->eventcards[1] = intval( $_COOKIE['EventCards1'] );
$gr->supply->landmark  [0] = intval( $_COOKIE['LandmarkCards0'] );
$gr->supply->landmark  [1] = intval( $_COOKIE['LandmarkCards1'] );
$gr->supply->banecard      = intval( $_COOKIE['Banecard'] );
$gr->supply->obelisk       = intval( $_COOKIE['Obelisk'] );

// 順位づけとスコア計算
$gr = Rank( $gr );  // sub_GameResult_rank.php

if ( $myname == $gr->player[0]->name ) { // 書き込みは代表者が行う
	$GR[$GRsize] = $gr;
	WriteGameResult( $GR );
}






// var_dump($gr);

?>



<!DOCTYPE html>
<html lang='ja'>

<head>
	<?php
		PrintHead( 'Dominion Online' );
		PrintHead_Dominion();
	?>

	<link rel="stylesheet" type="text/css" href="/Dominion/css/Online_ChatArea.css">
	<link rel="stylesheet" type="text/css" href="/Dominion/css/Online_game_main.css">
	<link rel="stylesheet" type="text/css" href="/Dominion/css/Online_Cards.css">
	<link rel="stylesheet" type="text/css" href="/Dominion/css/CardEffectBox.css">
	<link rel="stylesheet" type="text/css" href="/Dominion/css/Online_game_end.css">

	</style>
</head>



<body>
	<header>
		<div class='header-left'>
			<?= PrintHome(); ?>
		</div>
		<div class='header-right'>
			
		</div>
	</header>


	<div class='leftside'>
		<div class='chat-wrapper'>
			<div class='chat_list'> </div>
			<div class='chat_mymsgbox'>
				<input type='checkbox' id='auto_scroll' class='auto_scroll' checked='checked'>
				<label for='auto_scroll' class='checkbox'>自動スクロール</label>
				<textarea rows='3'  wrap='soft' class='chat_textbox'></textarea>
				<button class='btn-blue chat_enter'>送信</button>
				<button class='btn-green leave_a_room'>退室</button>
			</div>
		</div>
		<div class='settings'>
			<input type='checkbox' id='chbox_multirow' class='chbox_multirow'>
		</div>
	</div>

	<div class='rightside'>

		<div class='main'>
			<button class='btn-blue back2roomlist'>部屋一覧に戻る</button>

			<h2><span class='winner-name'><?= h( $gr->player[0]->name ) ?></span> さんの勝ちです！</h2>
			<div class='clear'></div>

			<!-- 左側 -->
			<div class='score_tables'>
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


				<h3>サプライ</h3>
				<?php PrintSupply( $gr, $Setlist, $Cardlist, false ); ?>
			</div>

			<!-- 右側 -->
			<div class='players_decks'>
				<?php
				for ( $k = 0; $k < $player_num; $k++ ) {
echo <<<EOM
					<div class='player_cards {$gr->player[$k]->name}'>
						<h4 class='player_name'> {$gr->player[$k]->name} </h4>
						<div class='deck_all'></div>
					</div>
					<div class='clear'></div>
EOM;
				}
				?>
			</div>
			<div class='clear'></div>

		</div>
		<div class='clear'></div>
	</div>

	<div class='clear'></div>



	<!-- alert, confirm -->
	<div class='BlackCover BlackCover_rightside MyAlert'>
		<div class='MyAlert-box CardEffect-box'>
			<div class='clear alert_text'></div>
			<div class='clear alert_contents'></div>
			<div class='clear buttons'> <input type='button' class='btn-blue' value='OK'> </div>
			<div class='clear'></div>
		</div>
	</div>

	<div class='BlackCover BlackCover_rightside MyConfirm'>
		<div class='MyConfirm-box'>
			<div class='clear confirm_text'></div>
			<div class='clear confirm_contents'></div>
			<div class='clear buttons'>
				<input type='button' class='btn-blue yes' value='はい'>
				<input type='button' class='btn-blue no'  value='いいえ'>
			</div>
			<div class='clear'></div>
		</div>
	</div>
</body>




<!-- php to js (Setlist, Cardlist) -->
<?php
	PHP2JS_Cardlist_Setlist( $Cardlist, $Setlist );
?>

<!-- variables -->
<script type="text/javascript">
	const myid       = Number( "<?=$myid?>" );
	const myname     = "<?=$myname?>";
	const GameRoomID = "<?=$GameRoomID?>";
</script>



<!-- Firebase -->
<script src="https://www.gstatic.com/firebasejs/3.4.1/firebase.js"></script>
<script>
	// Initialize Firebase
	let config = {
		apiKey: "AIzaSyDWW2ktQrzDX1H3CzDcgUGwIv-JAnrLa5k",
		authDomain: "dominiononline-3e224.firebaseapp.com",
		databaseURL: "https://dominiononline-3e224.firebaseio.com",
		storageBucket: "",
		messagingSenderId: "417434662660"
	};
	firebase.initializeApp(config);

	let FBref_Room = firebase.database().ref( `/Rooms/${GameRoomID}` );
	let FBref_Game = FBref_Room.child( 'Game' );
</script>

<!-- function & class -->
<script type="text/javascript">
	let RoomInfo = {};  /* global object, not changed after initialization */
	let Game = {};  /* global object */
	let Initialize;
	const SizeOf$Card  = new SizeOfjQueryObj( $('.SupplyArea.line2').find('.card') );
	const SizeOf$sCard = new SizeOfjQueryObj( $('.SupplyArea.line1').find('.card') );
</script>

<script type='text/javascript' src='/Dominion/js/CardEffectBox.js'></script>
<script type='text/javascript' src='/Dominion/js/Cardlist.js'></script>
<script type='text/javascript' src='/Dominion/js/Online_ChatArea.js'></script>
<script type='text/javascript' src='/Dominion/js/Online_Cardlist.js'></script>
<script type='text/javascript' src='/Dominion/js/Online_MakeHTML.js'></script>
<script type='text/javascript' src='/Dominion/js/Online_CPlayer.js'></script>
<script type='text/javascript' src='/Dominion/js/Online_game_end.js'></script>



</html>

