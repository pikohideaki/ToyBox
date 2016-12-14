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



////// フォームの入力内容を復元 //////


// ページ遷移識別
setcookie( 'from_main', isset( $_POST['from_main'] ) );

$edit = isset( $_POST['edit'] );  // mainかadd_game_messageから「修正する」で遷移したとき.
$back = isset( $_POST['back'] );  // add_game_messageから「戻る」で遷移したとき


$gr = new GameResult();  // ゲーム結果(1ゲーム分)


// id
$gr->id = time();  // 新規追加の場合（デフォルト）
// $gr->id = $GR[$GRsize - 1]->id + 1;  // 新規追加の場合（デフォルト）
$n = $GRsize - 1;  // 修正のとき
if ( $edit ) {
	$gr->id = intval( $_POST['edit_id'] );
	for ( ; $n >= 0; $n-- ) {
		if ( $GR[$n]->id === $gr->id )  break;
	}
}


// 日付
$date = date("Y-m-d");  // デフォルト
if ( $edit ) { $gr->date = $GR[$n]->date; }

/* 場所 */
$place = $_COOKIE['place'];  // デフォルト
if ( $edit ) { $gr->place = $GR[$n]->place; }

for ( $i = 0; $i < $GRsize; $i++ ) {
	$place_list[ $GR[$i]->place ] = 'dummy';
}
$place_list = array_keys( $place_list );
sort( $place_list );
$place_listsize = count( $place_list );


// player_num
$player_num = 0;
if ( $edit ) { $gr->player_num = $GR[$n]->player_num; }
if ( $back ) { $gr->player_num = intval( $_POST['player_num'] ); }


// Dominist checkbox
$D = array();
for ( $k = 0; $k < $dominist_num; $k++ ) {
	$D[$k] = new DoministGameResult();
}
// for ( $k = 0; $k < $dominist_num; $k++ ) {
// 	$D[$k]->checked = ( isset( $_COOKIE["D{$k}-checked"] ) && $_COOKIE["D{$k}-checked"] );
// }
if ( $edit || $back ) {
	for ( $l = 0; $l < PLAYER_NUM_MAX; $l++ ) {
		for ( $k = 0; $k < $dominist_num; $k++ ) {
			if ( $GR[$n]->player[$l]->name === $dominist[$k]->name ) {
				$D[$k]->checked = true;
				if ( $edit ) {
					$D[$k]->VP      = $GR[$n]->player[$l]->VP;
					$D[$k]->turn    = $GR[$n]->player[$l]->turn;
				}
			}
		}
	}
}


// memo
$memo = '';
if ( $edit ) { $gr->memo = $GR[$n]->memo;  }


// 使用する拡張セットの初期値
for ( $i = 0; $i < count( $Setlist ); $i++ ) {
	if ( isset( $_COOKIE["use_set{$i}"] ) ) {
		$gr->supply->set[$i] = ($_COOKIE["use_set{$i}"] === 'T');
	}
}
if ( $edit ) {
	for ( $i = 0; $i < count( $Setlist ); $i++ ) {
		$gr->supply->set[$i] = $GR[$n]->supply->set[$i];
		setcookie("use_set{$i}", ( $gr->supply->set[$i] ? 'T' : 'F' ), strtotime('+30days') );
	}
}


// supply
$display_supply = false;

if ( $edit ) {
	$gr->supply->Prosperity = $GR[$n]->supply->Prosperity;
	$gr->supply->DarkAges   = $GR[$n]->supply->DarkAges;
	if ( $GR[$n]->supply->kingdomcards[0] > 0 ) { /* 記録あり */
		$display_supply = true;
		for ( $i = 0; $i < KINGDOMCARD_SIZE; $i++ ) {
			$gr->supply->kingdomcards[$i] = $GR[$n]->supply->kingdomcards[$i];
		}
		$gr->supply->eventcards[0] = $GR[$n]->supply->eventcards[0];
		$gr->supply->eventcards[1] = $GR[$n]->supply->eventcards[1];
		$gr->supply->banecard      = $GR[$n]->supply->banecard;
		$gr->supply->landmark[0]   = $GR[$n]->supply->landmark[0];
		$gr->supply->landmark[1]   = $GR[$n]->supply->landmark[1];
		$gr->supply->obelisk       = $GR[$n]->supply->obelisk;
		for ( $i = 0; $i < BLACKMARKET_SIZE; $i++ ) {
			$gr->supply->blackmarket[$i] = $GR[$n]->supply->blackmarket[$i];
		}
	}
}


?>


<!DOCTYPE html>
<html lang='ja'>

<head>
	<?php
		PrintHead( 'ゲーム結果追加' );
		PrintHead_Dominion();
	?>
	<link rel="stylesheet" type="text/css" href="/Dominion/css/GameResult_AddGame.css">
</head>


<body>
	<header>
		<?= PrintHeaderWithMenu( 'GameResult_AddGame.php', $login ) ?>
	</header>


	<div class='main'>

		<form name='form_add_game' action='GameResult_AddGamePost.php' method='post'
			onsubmit="return player_num_check()" >
			<p><b>日付</b> <input type='date' class='text' name='date'  value="<?= ( $edit ? $gr->date  : $date  ) ?>" ></p>
			<p><b>場所</b> <input type='text' class='text' name='place' value="<?= ( $edit ? $gr->place : $place ) ?>" autocomplete="on" list="place_list"></p>
			<datalist id="place_list">
			<?php
				for ( $i = 0; $i < count( $place_list ); $i++ ) {
echo <<<EOM

				<option value="{$place_list[$i]}">

EOM;
				}
			?>
			</datalist>

			<div>
			<h3>参加するプレイヤー名を選択して下さい.</h3>
			<div class='select-player'>
			<?php
				for ( $k = 0; $k < $dominist_num; $k++ ) {
					$checked = ( $D[$k]->checked ? 'checked' : '' );
					$name = h($dominist[$k]->name);
echo <<<EOM

				<input type='checkbox'
					id='player_name_chbox{$k}'
					onchange='edit_table_row({$k})'
					{$checked}
				>
				<label for="player_name_chbox{$k}" class="checkbox">{$name}</label>

EOM;
				}
			?>
				<div class='clear'></div>
			</div>
			</div>

			<table name='table_game_result' class='tbl-blue' id='table_game_result'>
			<thead>
			<?php
				if ( $edit || $back ) {
echo <<<EOM

				<tr>
					<th>プレイヤー</th>
					<th>得点</th>
					<th>同点<br>手番勝ち</th>
					<th>
						<input type='button' class='btn-blue' value='最初のプレイヤー'
							onclick='select_start_player()' />
					</th>
				</tr>

EOM;
				}
			?>
			</thead>
			<tbody id='table_body_game_result'>
			<?php
			if ( $edit || $back ) {
				for ( $k = 0; $k < $dominist_num; $k++ ) {
					if ( $D[$k]->checked ) {
						$attr1 = ( $back ? 'placeholder' : 'value' );
						$checked1 = ( $D[$k]->turn ? 'checked' : '' );
						$checked2 = ( $D[$k]->start_player ? 'checked' : '' );
echo <<<EOM

				<tr>
					<td>{$dominist[$k]->name}</td>
					<td> <input type='number' class='text'  name='D{$k}-VP'
						{$attr1}='{$D[$k]->VP}' style='width:50px' autocomplete='off' >
					</td>
					<td>
						<input type='checkbox' id='D{$k}-turn' name='D{$k}-turn' value='true' {$checked1} >
						<label for='D{$k}-turn' class='checkbox checkbox0'> </label>
					</td>
					<td>
						<input type='radio'   id='start_player_D{$k}' name='start_player' value='D{$k}' {$checked2} >
						<label for='start_player_D{$k}' class='radio radio0'> </label>
					</td>
				</tr>

EOM;
					}
				}
			}
			?>
			</tbody>
			</table>

			<h3>サプライ</h3>

			<?php PrintRandomizer( $Setlist );?>

			<div id='div_supply'>
				<?php
					if ( $display_supply ) {
						PrintSupply( $gr, $Setlist, $Cardlist, true );
					}
				?>
				<!-- js で書き換え -->
			</div>

			<div id='div_blackmarket'>
				<!-- js で書き換え -->
			</div>

<?php
echo <<<EOM

			<p>
				メモ ：
				<input type="text" class='text' name="memo" value="{$gr->memo}" autocomplete='off'>
			</p>
			<input type='hidden' name='edit_id' value="{$gr->id}">

EOM;

				if ( $edit ) {
echo <<<EOM

			<input type='hidden' name='edit' value='true' >

EOM;
				}

				if ( $back ) {
echo <<<EOM

			<input type='hidden' name='back' value='true' >

EOM;
				}

echo <<<EOM
			<input type='submit' class='btn-blue' style='width:100px' value='登録'>
EOM;

?>

		</form>

	</div>
</body>



<?php
	/* globaly define Cardlist, Setlist in javascript */
	PHP2JS_Cardlist_Setlist( $Cardlist, $Setlist );

	/* [php to js] $dominist[]->name配列 */
	$dominist_name = array();  /* ここでは読みは不要なので省く */
	for ( $i = 0; $i < $dominist_num; $i++ ) {
		$dominist_name[$i] = $dominist[$i]->name;
	}
	$dominist_name_tsv = implode( "\t", $dominist_name );

echo <<<EOM
	<script> 
		var dominist_name_tsv = "$dominist_name_tsv"
		var dominist_name = dominist_name_tsv.split("\t");
		var dominist_num = $dominist_num
		var player_num =  {$gr->player_num}
	</script>
EOM;
?>

<script type="text/javascript">
	var supply = {};
	initsupply( supply, Cardlist.length );
	$( function() {
		$('#div_supply,#div_blackmarket').on( 'click', '.card_effect', function() {
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

<script src='/Dominion/js/GameResult_AddGame.js'></script>
<script src='/Dominion/js/Randomizer.js'></script>
<script src='/Dominion/js/GenSupply.js'></script>

</html>

