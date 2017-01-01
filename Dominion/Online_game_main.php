<?php


// 共通ファイル
$Filename_sc  = $_SERVER['DOCUMENT_ROOT'] .'/sub_common.php';
if ( !is_readable( $Filename_sc  ) ) { echo $Filename_sc  . ' is not readable.'; exit; }
include( $Filename_sc );

$Filename_sDc = $_SERVER['DOCUMENT_ROOT'] .'/Dominion/sub_Dominion_common.php';
if ( !is_readable( $Filename_sDc ) ) { echo $Filename_sDc . ' is not readable.'; exit; }
include( $Filename_sDc );


session_start();
$login = isset( $_SESSION['login_id'] );  // ログイン済みならtrue


////////////////////////////////////////////////////////////////////////////////

/* posted values */
$myid       = $_POST['myid'];
$myname     = $_POST['myname'];
$GameRoomID = $_POST['room-id'];

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
</head>



<body>

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
			<label for='chbox_multirow' class='checkbox'>多段表示</label>
			<input type='checkbox' id='chbox_SkipReaction' class='chbox_SkipReaction' checked>
			<label for='chbox_SkipReaction' class='checkbox'>リアクションカードがないときの確認をスキップ</label>
			<div>
				<input type='button' class='btn-blue card_view' value='カード一覧'>
				<!-- <input type='button' class='btn-blue logallcards' value='logallcards'> -->
			</div>
			<!-- <button class='btn-blue card_list_view'>カード一覧</button> -->
<!-- 
			<div>
				<input type='button' class='btn-blue text_disconnect' value='接続解除'>
				<input type='button' class='btn-blue text_connect'    value='再接続'>
			</div> -->
		</div>
	</div>


	<div class='rightside'>
		<div class='main'>
			<div class='Common-Area'>
				<div class='SupplyArea-wrapper'>
					<!-- 基本カード -->
					<div class='SupplyArea line1'> <!-- jsでここを書き換え -->
						<div class='supply-card-wrapper'> <button class='card down'> </button> </div>
						<div class='supply-card-wrapper'> <button class='card down'> </button> </div>
						<div class='supply-card-wrapper'> <button class='card down'> </button> </div>
						<div class='supply-card-wrapper'> <button class='card down'> </button> </div>
						<div class='supply-card-wrapper'> <button class='card down'> </button> </div>
						<div class='supply-card-wrapper'> <button class='card down'> </button> </div>
						<div class='supply-card-wrapper'> <button class='card down'> </button> </div>
					</div>
					<div class='clear'></div>

					<!-- 王国カード -->
					<div class='SupplyArea_line23'>
						<div class='SupplyArea line2'> <!-- jsでここを書き換え -->
							<div class='supply-card-wrapper'> <button class='card down'> </button> </div>
							<div class='supply-card-wrapper'> <button class='card down'> </button> </div>
							<div class='supply-card-wrapper'> <button class='card down'> </button> </div>
							<div class='supply-card-wrapper'> <button class='card down'> </button> </div>
							<div class='supply-card-wrapper'> <button class='card down'> </button> </div>
						</div>
						<div class='clear'></div>
						<div class='SupplyArea line3'> <!-- jsでここを書き換え -->
							<div class='supply-card-wrapper'> <button class='card down'> </button> </div>
							<div class='supply-card-wrapper'> <button class='card down'> </button> </div>
							<div class='supply-card-wrapper'> <button class='card down'> </button> </div>
							<div class='supply-card-wrapper'> <button class='card down'> </button> </div>
							<div class='supply-card-wrapper'> <button class='card down'> </button> </div>
						</div>
						<div class='clear'></div>
					</div>
					<div class='TrashPile-wrapper'>
						<div class='TrashPile'> <!-- jsでここを書き換え --> </div>
					</div>
					<div class='clear'></div>
				</div>
				<div class='clear'></div>
			</div>


			<div class="OtherPlayers-wrapper"> <!-- jsでここを書き換え --> 

				<div class="OtherPlayer" data-player_id="0">
					<div class="player_name"> </div>
					<div class="player_TurnCount">
						 （ターン数 ： <span class="player_TurnCount_num">0</span>）
					</div>
					<div class="clear"></div>

					<div class="sCardArea sOpen"></div>
					<div class="OtherPlayer_Buttons"> </div>
					<div class="clear"></div>

					<div class="sCardArea sPlayArea"></div>
					<div class="sCardArea sAside"> </div>
					<div class="clear"></div>

					<div class="sCardArea sDeck">
						<button class="card down" data-card_no="1">
							<span class="card-num-of-remaining">0</span>
						</button>
					</div>
					<div class="sCardArea sHandCards"> </div>
					<div class="sCardArea sDiscardPile"> </div>
					<div class="clear"></div>
				</div>

				<div class="OtherPlayer" data-player_id="1">
					<div class="player_name"> </div>
					<div class="player_TurnCount">
						 （ターン数 ： <span class="player_TurnCount_num">0</span>）
					</div>
					<div class="clear"></div>

					<div class="sCardArea sOpen"></div>
					<div class="OtherPlayer_Buttons"> </div>
					<div class="clear"></div>

					<div class="sCardArea sPlayArea"></div>
					<div class="sCardArea sAside"> </div>
					<div class="clear"></div>

					<div class="sCardArea sDeck">
						<button class="card down" data-card_no="1">
							<span class="card-num-of-remaining">0</span>
						</button>
					</div>
					<div class="sCardArea sHandCards"> </div>
					<div class="sCardArea sDiscardPile"> </div>
					<div class="clear"></div>
				</div>
			</div>

			<div class="clear"></div>


			<div class='TurnAction'>
				<!-- <h1>操作</h1> -->
				<div class='PlayArea-wrapper'>
					<!-- <h2>プレイエリア</h2> -->
					<div class='TurnInfo'>
						<!-- <h1>ターン情報</h1> -->
						<span>（現在 ： <b class='phase'><!-- jsでここを書き換え --></b>，
							アクション ： <b class='TurnInfo-action'></b>，
							購入 ： <b class='TurnInfo-buy'></b>，
							コイン ： <b class='TurnInfo-coin'></b>）
						</span>
					</div>
					<div class='clear'></div>

					<div class='CardAreaOfPlayer Open'> <!-- jsでここを書き換え --> </div>
					<div class='clear'></div>
					<div class='CardAreaOfPlayer PlayArea'> <!-- jsでここを書き換え --> </div>
					<div class='CardAreaOfPlayer Aside'> <!-- jsでここを書き換え --> </div>
					<div class='clear'></div>
				</div>

				<div class='Message'> <!-- jsで書き換え --> </div>

				<div class='PlayersCards'>
					<div class='CardAreaOfPlayer Deck'> <!-- jsでここを書き換え --> </div>
					<div class='CardAreaOfPlayer HandCards'> <!-- jsでここを書き換え --> </div>
					<div class='CardAreaOfPlayer DiscardPile'> <!-- jsでここを書き換え --> </div>
					<div class='clear'></div>
				</div>
				<p>
					<span class='action_buttons'> <!-- jsでここを書き換え --> </span>
					<input type='button' class='btn-blue SortHandCards'    value='手札をソート'>
					<input type='button' class='btn-blue MoveToBuyPhase'   value='購入フェーズへ'>
					<input type='button' class='btn-blue MoveToNextPlayer' value='ターン終了'>
					<!-- <input type='button' class='btn-blue test' value='test'> -->
				</p>
			</div>
			<div class='clear'></div>

			<div class='space'> </div>
		</div>
	</div>

	<div class='clear'></div>






	<div class='BlackCover BlackCover_rightside phase-dialog-wrapper'>
		<div class='dialog'>
			<div> <b class='dialog_text'></b> </div>
			<div class='clear'></div>
		</div>
	</div>

	<div class='BlackCover BlackCover_rightside turn-dialog-wrapper'>
		<div class='dialog'>
			<div> <b class='dialog_text'></b> </div>
			<div class='clear'></div>
		</div>
	</div>


	<div class='BlackCover BlackCover_rightside dialog-wrapper'>
		<div class='dialog'>
			<div class='dialog_text'></div>
			<div class='clear'></div>
			<div class='dialog_contents'></div>
			<div class='clear'></div>
			<div class='dialog_buttons'></div>
		</div>
	</div>


	<div class='BlackCover BlackCover_rightside connection-dialog-wrapper'>
		<div class='dialog'>
			<div class='dialog_text'>接続が切れました。再接続を試みます。</div>
			<div class='clear'></div>
		</div>
	</div>



	<div class='BlackCover BlackCover_rightside MyArea-wrapper'>
		<div class='MyArea'>
			<div class='clear'></div>
			<div class='MessageToMe'> </div>
			<div class='MyCardArea MyOpen'> </div>
			<div class='clear'></div>
			<div class='MyCardArea MyPlayArea'> </div>
			<div class='MyCardArea MyAside'> </div>
			<div class='clear'></div>
			<div class='MyCardArea MyDeck'> </div>
			<div class='MyCardArea MyHandCards'> </div>
			<div class='MyCardArea MyDiscardPile'> </div>
			<div class='clear'></div>
			<div class='buttons'>
				<input type='button' class='btn-blue SortHandCards' value='手札をソート'>
			</div>
		</div>
	</div>


	<div class='BlackCover BlackCover_rightside CardView-wrapper'>
		<div class='CardView'>
			<div class='CardView_zoom'>
				<button class='card_biggest face' data-card_no='1'> </button>
			</div>
			<div class='clear'></div>
			<div class='CardView_list'>
			</div>
			<div class='clear'></div>
		</div>
	</div>


	<div class='BlackCover BlackCover_rightside MyAlert'>
		<div class='MyAlert-box'>
			<div class='clear alert_text'></div>
			<div class='clear alert_contents'></div>
			<div class='clear buttons'> <input type='button' class='btn-blue' value='OK'> </div>
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

	let FBdatabase                 = firebase.database();
	let FBref_connected            = FBdatabase.ref(".info/connected");
	let FBref_Room                 = FBdatabase.ref( `/Rooms/${GameRoomID}` );
	let FBref_Game                 = FBref_Room.child( 'Game' );
	let FBref_Players              = FBref_Room.child( 'Game/Players' );
	let FBref_Message              = FBref_Room.child( 'Message' );
	let FBref_MessageTo            = FBref_Room.child( 'MessageTo' );
	let FBref_MessageToMe          = FBref_Room.child( `MessageTo/${myid}` );
	let FBref_Signal               = FBref_Room.child( 'Signals' );
	let FBref_SignalToMe           = FBref_Room.child( `Signals/${myid}` );
	let FBref_SignalAttackEnd      = FBref_Room.child( 'Signals/AttackEnd' );
	let FBref_SignalReactionEnd    = FBref_Room.child( 'Signals/ReactionEnd' );
	let FBref_SignalRevealReaction = FBref_Room.child( 'Signals/RevealReaction' );
	let FBref_Settings             = FBref_Room.child( 'Game/Settings' );
</script>

<!-- function & class -->
<script type="text/javascript">
	let RoomInfo = {};  /* global object, not changed after initialization */
	let Game = {};  /* global object */
	let Initialize;
	const SizeOf$Card   = new SizeOfjQueryObj( $('.SupplyArea.line2').find('.card') );
	const SizeOf$sCard  = new SizeOfjQueryObj( $('.SupplyArea.line1').find('.card') );
	const SizeOf$ssCard = new SizeOfjQueryObj( $('.OtherPlayers-wrapper').find('.card') );
	const SizeOf$CardArea = new SizeOfjQueryObj( $('.OtherPlayers-wrapper').find('.card') );
</script>

<script type='text/javascript' src='/Dominion/js/Online_Cardlist.js'></script>
<script type='text/javascript'>
	var CardName2No = MakeMap_CardName2No( Cardlist );  /* global object */
</script>
<script type='text/javascript' src='/Dominion/js/Online_MakeHTML.js'></script>
<script type='text/javascript' src='/Dominion/js/Online_Print.js'></script>
<script type='text/javascript' src='/Dominion/js/Online_FBSet.js'></script>
<script type='text/javascript' src='/Dominion/js/Online_SelectCards.js'></script>
<script type='text/javascript' src='/Dominion/js/Online_CSupply.js'></script>
<script type='text/javascript' src='/Dominion/js/Online_CPlayer.js'></script>
<script type='text/javascript' src='/Dominion/js/Online_CardEffects.js'></script>
<script type='text/javascript' src='/Dominion/js/Online_CardEffects_01_Original.js'></script>
<script type='text/javascript' src='/Dominion/js/Online_CardEffects_02_Intrigue.js'></script>
<script type='text/javascript' src='/Dominion/js/Online_CardEffects_03_Seaside.js'></script>
<script type='text/javascript' src='/Dominion/js/Online_CardEffects_04_Alchemy.js'></script>
<script type='text/javascript' src='/Dominion/js/Online_CardEffects_05_Prosperity.js'></script>
<script type='text/javascript' src='/Dominion/js/Online_CardEffects_06_Cornucopia.js'></script>
<script type='text/javascript' src='/Dominion/js/Online_CardEffects_07_Hinterlands.js'></script>
<script type='text/javascript' src='/Dominion/js/Online_CardEffects_08_Dark_Ages.js'></script>
<script type='text/javascript' src='/Dominion/js/Online_CardEffects_09_Guilds.js'></script>
<script type='text/javascript' src='/Dominion/js/Online_CardEffects_10_Adventures.js'></script>
<script type='text/javascript' src='/Dominion/js/Online_CardEffects_11_Empires.js'></script>
<script type='text/javascript' src='/Dominion/js/Online_CGame.js'></script>
<script type='text/javascript' src='/Dominion/js/Online_ButtonActions.js'></script>

<!-- start game -->
<script type='text/javascript' src='/Dominion/js/Online_FirebaseSync.js'></script>
<script type='text/javascript' src='/Dominion/js/Online_Signals.js'></script>


</html>

