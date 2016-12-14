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


$dominist_num = count( $dominist );

$myname = ( isset( $_COOKIE['myname'] ) ? $_COOKIE['myname'] : '' );

$dominist_selected = array();
for ( $i = 0; $i < $dominist_num; $i++ ) {
	// $dominist_selected[$i] = ( isset( $_COOKIE[ $dominist->name . 'selected' ] ) ? 'selected' : '' );
	$dominist_selected[$i] = ( $dominist[$i]->name == $myname  ?  'selected' : '' );
}


?>



<!DOCTYPE html>
<html lang='ja'>

<head>
	<?php
		PrintHead( 'Dominion Online' );
		PrintHead_Dominion();
	?>
	<link rel="stylesheet" type="text/css" href="/Dominion/css/Online_room_main.css">
</head>


<body>
	<header>
		<?= PrintHome(); ?>
	</header>

	<div class='main'>

		<div class='make-room'>
			<!-- <h1>部屋を作る</h1> -->

			<div>
				プレイヤー数を決めて下さい ： 
				<select class='player-num' name='player_num'>
					<option value='2' selected>2人</option>
					<option value='3'>3人</option>
					<option value='4'>4人</option>
				</select>
			</div>

			<div class='make-room-use-set'>
				<h3>使用する拡張セット</h3>
				<p>現在は基本セットのみ対応しています。</p>
				<div>
					<input type="checkbox" name="" id='UseSet0' disabled="disabled">
					<label for='UseSet0' class='checkbox disabled' >プロモ</label>
					<input type="checkbox" name="" id='UseSet1' checked>
					<label for='UseSet1' class='checkbox' >基本</label>
					<input type="checkbox" name="" id='UseSet2' checked>
					<label for='UseSet2' class='checkbox' >陰謀</label>
					<?php
						for ( $i = 3; $i < count( $Setlist ); $i++ ) {
echo <<<EOM
					<input type="checkbox" id='UseSet{$i}' disabled="disabled">\n
					<label for='UseSet{$i}' class='checkbox disabled' >{$Setlist[$i]}</label>\n
EOM;
						}
					?>
				</div>
			</div>

			<div class='comment-wrapper'>
				コメント ： <input type="text" name="make-room-comment" class='text'>
			</div>
			<button class='btn-blue' id='make-room-btn'>部屋を作成</button>
		</div>

		<hr>


		<div class='my-name-wrapper'>
			自分の名前 ： 
			<select class='my-name'>
				<option>-----</option>
				<?php
					for ( $i = 0; $i < $dominist_num; $i++ ) {
echo "
				<option value='{$dominist[$i]->name}' {$dominist_selected[$i]}>
					{$dominist[$i]->name}
				</option>
";
					}
				?>
			</select>
		</div>

		<hr>

		<div class='room-list-wrapper'>
			<!-- <h1>部屋リスト</h1> -->
			<div class='room-list' id='room-list'>
				<!-- jsで編集 -->
			</div>
		</div>
		<div class='clear'></div>

	</div>


	<form id='form-new-game' action='Online_game_main.php' method='post'>
		<div class='waiting-modal-wrapper'>  <!-- room-maker か newcommer クラスを後で付与 -->
			<div class='modal' data-room-id=''>
				<h3>部屋<span class='modal-RoomNo'></span></h3>
				<p>拡張セット	： <span class='modal-UsingSetlist'></span></p>
				<!-- <p>サプライ	： <span class='modal-Supply'></span></p> -->
				<p>募集人数	： <span class='modal-PlayerNum'></span>人
					（あと <span class='modal-PlayerNumToCome'></span>人）</p>
				<p>コメント	： <span class='modal-Comment'></span></p>
				<p>入室中	： <span class='modal-PlayersName'></span></p>
				<p>状態		： <span class='modal-Status'></span></p>
				<input type='button' value='キャンセル'  class='btn-blue modal-cancel' >
				<!-- <input type='button' value='ゲーム開始' class='btn-blue gotogame' disabled> -->
				<!-- Firebaseで引き継げるものはpostで送らない -->
				<input type='hidden' value='' name='myname'>
				<input type='hidden' value='' name='myid'>
				<input type='hidden' value='' name='room-id'>
			</div>
		</div>
	</form>

</body>



<!-- Firebase -->
<script src="https://www.gstatic.com/firebasejs/3.4.1/firebase.js"></script>
<script>
	// Initialize Firebase
	var config = {
		apiKey: "AIzaSyDWW2ktQrzDX1H3CzDcgUGwIv-JAnrLa5k",
		authDomain: "dominiononline-3e224.firebaseapp.com",
		databaseURL: "https://dominiononline-3e224.firebaseio.com",
		storageBucket: "",
		messagingSenderId: "417434662660"
	};
	firebase.initializeApp(config);

	let FBref_Rooms = firebase.database().ref( '/Rooms/' );
</script>

<?php
	PHP2JS_Cardlist_Setlist( $Cardlist, $Setlist );
?>

<script type='text/javascript' src='/Dominion/js/Online_Cardlist.js'></script>
<script type='text/javascript' src='/Dominion/js/Online_SelectCards.js'></script>
<script type='text/javascript' src='/Dominion/js/Online_CSupply.js'></script>
<script type='text/javascript' src='/Dominion/js/Online_CPlayer.js'></script>
<script type='text/javascript' src='/Dominion/js/Online_CGame.js'></script>

<script type='text/javascript'>
	var CardName2No = MakeMap_CardName2No( Cardlist );
	var global_card_ID = 1000;  /* global variable, used to set card_id */
</script>

<script type='text/javascript' src='/Dominion/js/Online_room_main.js'></script>


</html>
