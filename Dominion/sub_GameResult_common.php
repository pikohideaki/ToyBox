<?php


function PrintHeaderWithMenu( $selected_title, $login ) {
	$selected = array( '', '', '', '' );
	switch ( $selected_title ) {
		case 'GameResult_main.php'     : $selected[0] = 'selected'; break;
		case 'GameResult_AddGame.php'  : $selected[1] = 'selected'; break;
		case 'GameResult_Scoring.php'  : $selected[2] = 'selected'; break;
		default : break;
	}
	$login_str = ( $login ? 'ログアウト' : 'ログイン' );

	PrintHome();
echo <<<EOM
		<a href="#" class='sub-menu-icon'> <span class='fa fa-bars'></span> </a>
		<div class='sub-menu clear'>
			<a href='/Dominion/GameResult_main.php'     class='$selected[0]'>得点表</a>
			<a href='/Dominion/GameResult_AddGame.php'  class='$selected[1]'>ゲーム結果を追加</a>
			<a href='/Dominion/GameResult_Scoring.php'  class='$selected[2]'>スコアリング</a>
			<a href="/Login.php"> $login_str </a>
		</div>
		<div class='header-right'>
			<a href='/Dominion/GameResult_main.php'     class='$selected[0]'>得点表</a>
			<a href='/Dominion/GameResult_AddGame.php'  class='$selected[1]'>ゲーム結果を追加</a>
			<a href='/Dominion/GameResult_Scoring.php'  class='$selected[2]'>スコアリング</a>
			<a href="/Login.php"> $login_str </a>
		</div>
EOM;
}




function SCORE( $player_num ) {
	// Scoring.tsvを読み込み
	$IFilename = $_SERVER['DOCUMENT_ROOT'] . '/Dominion/tsv/Scoring.tsv';
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

	if ( $player_num === 2 ) {
		$SCORE = array(
			1 => floatval( $scoring[2][0] ),
			floatval( $scoring[2][1] )
			);
	} else if ( $player_num === 3 ) {
		$SCORE = array(
			1 => floatval( $scoring[3][0] ),
			floatval( $scoring[3][1] ),
			floatval( $scoring[3][2] )
			);
	} else if ( $player_num === 4 ) {
		$SCORE = array(
			1 => floatval( $scoring[4][0] ),
			floatval( $scoring[4][1] ),
			floatval( $scoring[4][2] ),
			floatval( $scoring[4][3] )
			);
	} else if ( $player_num === 5 ) {
		$SCORE = array(
			1 => floatval( $scoring[5][0] ),
			floatval( $scoring[5][1] ),
			floatval( $scoring[5][2] ),
			floatval( $scoring[5][3] ),
			floatval( $scoring[5][4] )
			);
	} else { // 4人のとき
		$SCORE = array(
			1 => floatval( $scoring[6][0] ),
			floatval( $scoring[6][1] ),
			floatval( $scoring[6][2] ),
			floatval( $scoring[6][3] ),
			floatval( $scoring[6][4] ),
			floatval( $scoring[6][5] )
			);
	}
	return $SCORE;
}



class GameResult {
	public $id;         // 通し番号
	public $date;       // 日付
	public $place;      // 場所
	public $player_num; // プレイヤー数
	public $player;     // 各プレイヤーのゲーム結果
	public $memo;       // その他メモ
	public $supply;     // サプライ

	function __construct() {
		$this->id = 0;
		$this->date = date("Y-m-d");
		$this->place = '';
		$this->player_num = PLAYER_NUM_DEFAULT;
		$this->player = array();
		for ( $k = 0; $k < PLAYER_NUM_MAX; $k++ ) {
			$this->player[$k]->name  = '';    // プレイヤー名
			$this->player[$k]->VP    = 0;     // 得点(勝利点)
			$this->player[$k]->turn  = false; // ターン数差
			$this->player[$k]->rank  = 0;     // 順位
			$this->player[$k]->score = 0.0;   // 順位得点
		}
		$this->memo = '';

		$this->supply->set = array();  // (array)使用したセット(csv20列確保)
		for ( $k = 0; $k < SET_NUM_MAX; $k++ ) {
			$this->supply->set[$k] = false;
		}
		$this->supply->kingdomcards = array();
		for ( $k = 0; $k < KINGDOMCARD_SIZE; $k++ ) {
			$this->supply->kingdomcards[$k] = 0;
		}
		$this->supply->Prosperity    = false;  // 繁栄場かどうか
		$this->supply->DarkAges      = false;  // 暗黒時代場かどうか
		$this->supply->banecard      = 0;  // 魔女娘の災いカード
		$this->supply->eventcards    = array();  // (array)イベントカード
		$this->supply->eventcards[0] = 0;
		$this->supply->eventcards[1] = 0;
		$this->supply->obelisk       = 0;  // 帝国 obeliskで選択したサプライ
		$this->supply->landmark      = array();  // (array)landmark
		$this->supply->landmark  [0] = 0;
		$this->supply->landmark  [1] = 0;
		$this->supply->blackmarket   = array();  // (array)プロモの闇市場用デッキ
		for ( $k = 0; $k < BLACKMARKET_SIZE; $k++ ) {
			$this->supply->blackmarket[$k] = 0;
		}
	}
}



function GR_cmp( $a, $b ) {
	if ( $a->id === $b->id ) { return 0; }
	return ( $a->id > $b->id );
}

function GR_sort( &$GR ) {
	usort( $GR, 'GR_cmp' );
}

function GR_delete( &$GR, $i, &$GRsize ) {
	unset( $GR[$i] );
	$GR = array_values( $GR );  // 添え字振り直し
	$GRsize--;
}



class DoministGameResult {
	public $checked;
	public $VP;
	public $turn;
	public $start_player;
	function __construct() {
		$this->checked = false;
		$this->VP = 0;
		$this->turn = false;
		$this->start_player = false;
	}
}

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////



function ReadGameResult() {  // read game result
	$IFilename = $_SERVER['DOCUMENT_ROOT'] . '/Dominion/tsv/GameResult.tsv';
	if ( !is_readable( $IFilename ) ) { echo $IFilename . ' is not readable'; exit; }
	$fp = fopen( $IFilename, 'r' );

	$GR = array();
	// $g = fgetcsv( $fp, 10000, "\t" ); // 1行目は廃棄
	$i = 0;
	while ( $g = fgetcsv( $fp, 10000, "\t" ) ) {
		$GR[$i] = new GameResult();
		$h = 0;
		
		$GR[$i]->id         = intval( $g[$h++] );
		$GR[$i]->date       =         $g[$h++];
		$GR[$i]->place      =         $g[$h++];
		$GR[$i]->player_num = intval( $g[$h++] );
		for ( $k = 0; $k < PLAYER_NUM_MAX; $k++ ) {
			$GR[$i]->player[$k]->name  =           $g[$h++];
			$GR[$i]->player[$k]->VP    = intval(   $g[$h++] );
			$GR[$i]->player[$k]->turn  =         ( $g[$h++] === 'T' );
			$GR[$i]->player[$k]->rank  = intval(   $g[$h++] );
			$GR[$i]->player[$k]->score = floatval( $g[$h++] );
		}

		$GR[$i]->memo       =   $g[$h++];

		for ( $k = 0; $k < SET_NUM_MAX; $k++ ) {
			$GR[$i]->supply->set[$k] = ( $g[$h++] === 'T' );
		}
		for ( $k = 0; $k < KINGDOMCARD_SIZE; $k++ ) {
			$GR[$i]->supply->kingdomcards[$k] = intval( $g[$h++] );
		}
		$GR[$i]->supply->Prosperity    = ( $g[$h++] === 'T' );
		$GR[$i]->supply->DarkAges      = ( $g[$h++] === 'T' );
		$GR[$i]->supply->banecard      = intval( $g[$h++] );
		$GR[$i]->supply->eventcards[0] = intval( $g[$h++] );
		$GR[$i]->supply->eventcards[1] = intval( $g[$h++] );
		$GR[$i]->supply->obelisk       = intval( $g[$h++] );
		$GR[$i]->supply->landmark  [0] = intval( $g[$h++] );
		$GR[$i]->supply->landmark  [1] = intval( $g[$h++] );
		for ( $k = 0; $k < BLACKMARKET_SIZE; $k++ ) {
			$GR[$i]->supply->blackmarket[$k] = intval( $g[$h++] );
		}

		$i++;
	}
	fclose( $fp );
	return $GR;  // GRの行数
}


function WriteGameResult( $GR ) {
	$OFilename = $_SERVER['DOCUMENT_ROOT'] . '/Dominion/tsv/GameResult.tsv';
	$GRsize = count( $GR );
	if ( !is_writable( $OFilename ) ) { echo $OFilename . ' is not writable'; exit; }
	$fpg = fopen( $OFilename, 'w' );

	for ( $i = 0; $i < $GRsize; $i++ ) {
		fputs( $fpg, $GR[$i]->id         . "\t" );
		fputs( $fpg, $GR[$i]->date       . "\t" );
		fputs( $fpg, $GR[$i]->place      . "\t" );
		fputs( $fpg, $GR[$i]->player_num . "\t" );
		for ( $k = 0; $k < PLAYER_NUM_MAX; $k++ ) {
			fputs( $fpg,   $GR[$i]->player[$k]->name  . "\t" );
			fputs( $fpg,   $GR[$i]->player[$k]->VP    . "\t" );
			fputs( $fpg, ( $GR[$i]->player[$k]->turn ? 'T' : 'F' ) . "\t" );
			fputs( $fpg,   $GR[$i]->player[$k]->rank  . "\t" );
			fputs( $fpg,   $GR[$i]->player[$k]->score . "\t" );
		}
		
		fputs( $fpg, $GR[$i]->memo       . "\t" );

		for ( $k = 0; $k < SET_NUM_MAX; $k++ ) {
			fputs( $fpg, ( $GR[$i]->supply->set[$k] ? 'T' : 'F' ) . "\t" );
		}
		for ( $k = 0; $k < KINGDOMCARD_SIZE; $k++ ) {
			fputs( $fpg, $GR[$i]->supply->kingdomcards[$k] . "\t" );
		}
		fputs( $fpg, ( $GR[$i]->supply->Prosperity ? 'T' : 'F' ) . "\t" );
		fputs( $fpg, ( $GR[$i]->supply->DarkAges   ? 'T' : 'F' ) . "\t" );
		fputs( $fpg,   $GR[$i]->supply->banecard      . "\t" );
		fputs( $fpg,   $GR[$i]->supply->eventcards[0] . "\t" );
		fputs( $fpg,   $GR[$i]->supply->eventcards[1] . "\t" );
		fputs( $fpg,   $GR[$i]->supply->obelisk       . "\t" );
		fputs( $fpg,   $GR[$i]->supply->landmark  [0] . "\t" );
		fputs( $fpg,   $GR[$i]->supply->landmark  [1] . "\t" );
		for ( $k = 0; $k < BLACKMARKET_SIZE; $k++ ) {
			fputs( $fpg, $GR[$i]->supply->blackmarket[$k] . "\t" );
		}

		fputs( $fpg, "\n" );
	}
	fclose( $fpg );
}



/************************* 共通処理 *************************/

// セッション
// session_start();  /* -> ここで呼び出すと読み込んだソースのページでvar_dumpしたとき警告が出る． */

// 対戦結果を読み込み
$GR = ReadGameResult();
$GRsize = count( $GR );

$message = '';


