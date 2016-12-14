<?php


define( PLAYER_NUM_MIN, 2 );
define( PLAYER_NUM_DEFAULT, 4 );
define( PLAYER_NUM_MAX, 6 );
define( KINGDOMCARD_SIZE, 10 );
define( BLACKMARKET_SIZE, 15 );
define( SET_NUM_MAX, 20 );




function PrintHead_Dominion() {
echo <<<EOM

	<link rel='stylesheet' type="text/css" href='/css/responsive.css'/>
	<link rel="stylesheet" type="text/css" href="/Dominion/css/Dominion.css">

	<script src='/Dominion/js/sub_Dominion_common.js'></script>

EOM;
}



class Card {
	public $name_jp;       // カード名
	public $name_jp_yomi;  // カード名（読み）
	public $name_eng;      // 英名
	public $set_name;      // このカードが入っているセットの名前
	public $cost_str;      // コスト（+や*の表記も）
	public $cost;          // コスト（ソート用）
	public $cost_potion;   // ポーションコスト
	public $cost_debt;     // コスト（借金）
	public $class;         // 種類
	public $category;      // 分類
	public $VP;            // 勝利点
	public $draw_card;     // +card
	public $action;        // +action
	public $buy;           // +buy
	public $coin;          // +coin
	public $VPtoken;       // +VPtoken
	public $effect1;       // 効果
	public $effect2;       // 効果
	public $effect3;       // 効果
	public $effect4;       // 効果
	public $implemented;   // オンライン対戦用項目，実装済みかどうか
	function __construct() {
		$this->name_jp      = '';
		$this->name_jp_yomi = '';
		$this->name_eng     = '';
		$this->set_name     = '';
		$this->cost_str     = '';
		$this->cost         = -1;
		$this->cost_potion  = -1;
		$this->cost_debt    = -1;
		$this->class        = '';
		$this->category     = '';
		$this->VP           = -1;
		$this->draw_card    = -1;
		$this->action       = -1;
		$this->buy          = -1;
		$this->coin         = -1;
		$this->VPtoken      = -1;
		$this->effect1      = '';
		$this->effect2      = '';
		$this->effect3      = '';
		$this->effect4      = '';
		$this->implemented  = '';
	}
}




/* セット名リスト読み込み */
function ReadSetlist() {
	$IFilename = $_SERVER['DOCUMENT_ROOT'] .'/Dominion/tsv/Setlist.tsv';
	if ( !is_readable( $IFilename ) ) { echo $IFilename . ' is not readable'; exit; }
	$fpd = fopen( $IFilename, 'r' );
	$Setlist = fgetcsv( $fpd, 10000, "\t" );
	fclose( $fpd );
	return $Setlist;
}


/* カードリスト読み込み */
function ReadCardlist() {
	$IFilename = $_SERVER['DOCUMENT_ROOT'] .'/Dominion/tsv/Cardlist.tsv';
	if ( !is_readable( $IFilename ) ) { echo $IFilename . ' is not readable'; exit; }
	$fpd = fopen( $IFilename, 'r' );

	$d = fgetcsv( $fpd, 100000, "\t" );  // 1行目を捨てる
	$Cardlist = array();
	$Cardlist[0] = new Card();
	$i = 1;
	while ( $d = fgetcsv( $fpd, 100000, "\t" ) ) {
		$Cardlist[$i] = new Card();
		$it = 1;
		// $Cardlist[$i]->card_no      =         $d[ 0];
		$Cardlist[$i]->name_jp      = $d[$it++];
		$Cardlist[$i]->name_jp_yomi = $d[$it++];
		$Cardlist[$i]->name_eng     = $d[$it++];
		$Cardlist[$i]->set_name     = $d[$it++];
		$Cardlist[$i]->cost_str     = $d[$it++];
		$Cardlist[$i]->cost         = $d[$it++];
		$Cardlist[$i]->cost_potion  = $d[$it++];
		$Cardlist[$i]->cost_debt    = $d[$it++];
		$Cardlist[$i]->class        = $d[$it++];
		$Cardlist[$i]->category     = $d[$it++];
		$Cardlist[$i]->VP           = $d[$it++];
		$Cardlist[$i]->draw_card    = $d[$it++];
		$Cardlist[$i]->action       = $d[$it++];
		$Cardlist[$i]->buy          = $d[$it++];
		$Cardlist[$i]->coin         = $d[$it++];
		$Cardlist[$i]->VPtoken      = $d[$it++];
		$Cardlist[$i]->effect1      = $d[$it++];
		$Cardlist[$i]->effect2      = $d[$it++];
		$Cardlist[$i]->effect3      = $d[$it++];
		$Cardlist[$i]->effect4      = $d[$it++];
		$Cardlist[$i]->implemented  = $d[$it++];
		$i++;
	}
	fclose( $fpd );
	return $Cardlist;
}


function Cardlist2tsv( $Cardlist ) {
	for ( $i = 0; $i < count( $Cardlist ); $i++ ) {
		$Cardlist_tsv .= $Cardlist[$i]->name_jp      ."\t";
		$Cardlist_tsv .= $Cardlist[$i]->name_jp_yomi ."\t";
		$Cardlist_tsv .= $Cardlist[$i]->name_eng     ."\t";
		$Cardlist_tsv .= $Cardlist[$i]->set_name     ."\t";
		$Cardlist_tsv .= $Cardlist[$i]->cost_str     ."\t";
		$Cardlist_tsv .= $Cardlist[$i]->cost         ."\t";
		$Cardlist_tsv .= $Cardlist[$i]->cost_potion  ."\t";
		$Cardlist_tsv .= $Cardlist[$i]->cost_debt    ."\t";
		$Cardlist_tsv .= $Cardlist[$i]->class        ."\t";
		$Cardlist_tsv .= $Cardlist[$i]->category     ."\t";
		$Cardlist_tsv .= $Cardlist[$i]->VP           ."\t";
		$Cardlist_tsv .= $Cardlist[$i]->draw_card    ."\t";
		$Cardlist_tsv .= $Cardlist[$i]->action       ."\t";
		$Cardlist_tsv .= $Cardlist[$i]->buy          ."\t";
		$Cardlist_tsv .= $Cardlist[$i]->coin         ."\t";
		$Cardlist_tsv .= $Cardlist[$i]->VPtoken      ."\t";
		$Cardlist_tsv .= $Cardlist[$i]->effect1      ."\t";
		$Cardlist_tsv .= $Cardlist[$i]->effect2      ."\t";
		$Cardlist_tsv .= $Cardlist[$i]->effect3      ."\t";
		$Cardlist_tsv .= $Cardlist[$i]->effect4      ."\t";
		$Cardlist_tsv .= $Cardlist[$i]->implemented  ."\t";
	}
	return substr( $Cardlist_tsv, 0, strlen( $Cardlist_tsv ) - 1 );  // 最後のタブを省く
}





function PHP2JS_Cardlist_Setlist( $Cardlist, $Setlist ) {
 // [PHP to JavaScript]
	$Cardlist_tsv = Cardlist2tsv( $Cardlist );
	$Setlist_tsv = implode( "\t", $Setlist );
	$Cardlist_length = count( $Cardlist );

echo <<<EOM
	<script>
		var Cardlist_tsv   = "$Cardlist_tsv";
		var Cardlist_1array = Cardlist_tsv.split("\t");
		var Cardlist = [];
		PHP2JS_Cardlist( Cardlist, Cardlist_1array, $Cardlist_length );

		var Setlist_tsv = "$Setlist_tsv";
		var Setlist = Setlist_tsv.split("\t");
	</script>
EOM;
}




class DoministData {
	public $name;          // 名前
	public $play_num_sum;  // 総プレイ回数
	public $score_sum;     // 総得点
	public $rank_num;      // 1～6位回数(array)
	public $play_num;      // 各ゲーム参加人数のゲームについて, 参加したゲーム数(array)
	public $score_average; // 得点率
	public $rank;          // 総合順位
}

class DoministName {
	public $name;
	public $yomi;
}
function cmp( $a, $b ) {
	return strcmp( $a->yomi, $b->yomi );
}


// プレイヤー名を読み込み
function ReadDominist() {
	$IFilename = $_SERVER['DOCUMENT_ROOT'] . '/Dominion/tsv/Players.tsv';
	if ( !is_readable( $IFilename ) ) { echo $IFilename . ' is not readable'; exit; }
	$fpp = fopen( $IFilename, 'r' );

	$dominist = array();
	$d = fgetcsv( $fpp, 100000, "\t" );
	$size = count( $d ) / 2;
	for ( $i = 0; $i < $size; $i++ ) {
		$dominist[$i] = new DoministName();
		$dominist[$i]->name = $d[2 * $i];
		$dominist[$i]->yomi = $d[2 * $i + 1];
	}
	fclose( $fpp );
	return $dominist;
}




/************************* 共通処理 *************************/


// Set, Card list 読み込み
$Setlist  = ReadSetlist ();
$Cardlist = ReadCardlist();

// Dominist名前リストを読み込み
$dominist = ReadDominist();
$dominist_num = count( $dominist );

