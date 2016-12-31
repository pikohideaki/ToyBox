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

	<link rel="stylesheet" href="/Dominion/css/Online_game_main.css">
	<link rel="stylesheet" href="/Dominion/css/Online_Cards.css">
	<style type="text/css">
		.leftside {
			top : 65px;
		}
		.rightside {
			margin-top : 65px;
		}
		.back2roomlist {
			margin-top : 10px;
		}
		.score_tables {
			float: left;
			width : 30%;
			min-width : 400px;
		}
		.players_decks {
			float: left;
			margin-left : 20px;
			width : 60%;
		}
		.players_decks .card {
			width:45px;
			height:69px;
			margin: 1px;
		}
		.player_cards {
			margin : 10px;
		}
		.player_name {
			margin-bottom : 10px;
		}
}

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
		</div>

		<div class='clear'></div>

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

<script type='text/javascript' src='/Dominion/js/Online_Cardlist.js'></script>
<script type='text/javascript' src='/Dominion/js/Online_MakeHTML.js'></script>
<script type='text/javascript' src='/Dominion/js/Online_CPlayer.js'></script>



<script type="text/javascript">
$( function() {
	$('.back2roomlist').click( () => { window.location.href = 'Online_room_main.php'; } );


	FBref_Game.once( 'value' ).then( function( FBsnapshot ) {
		let Players = FBsnapshot.val().Players;
		for ( let i = 0; i < Players.length; ++i ) {
			Players[i] = new CPlayer( Players[i] );
			Players[i].HandCards = Players[i].GetDeckAll();
			Players[i].SortHandCards();
			const DeckAll = Players[i].HandCards;

			$deck_all = $(`.${Players[i].name} .deck_all`);
			$deck_all.html('');
			DeckAll.forEach( (card) =>
				$deck_all.append( `
					<button class='card face'
						data-card_no='${card.card_no}'
						data-card_name_jp='${Cardlist[ card.card_no ].name_jp}'>
					</button>
				` )
			);
		}
	} );



	FBref_Room.child('chat').on('value', function( FBsnapshot ) {
		const msgs = FBsnapshot.val();

		$('.chat_list').html(''); // reset
		for ( let key in msgs ) {
			$('.chat_list').append(`<p>${msgs[key]}</p>`);
		}
		if ( $('.auto_scroll').prop('checked') ) {
			$('.chat_list').animate({scrollTop: $('.chat_list')[0].scrollHeight}, 'normal');
		}
	});


	$('.chat-wrapper .chat_enter').click( function() {
		const msg = $('.chat-wrapper .chat_textbox').val();
		FBref_Room.child('chat').push( `<font color='red'>${myname}</font> : ${msg}` );
		$('.chat-wrapper .chat_textbox').val('');
	});



});
</script>




</html>

