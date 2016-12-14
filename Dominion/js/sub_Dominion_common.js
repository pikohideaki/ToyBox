

const PLAYER_NUM_MIN     = 2;
const PLAYER_NUM_DEFAULT = 4;
const PLAYER_NUM_MAX     = 6;
const KINGDOMCARD_SIZE   = 10;
const BLACKMARKET_SIZE   = 15;
const SET_NUM_MAX        = 20;


// php to js
function PHP2JS_Cardlist( Cardlist, Cardlist_1array, Cardlist_length ) {
	var k = 0;
	for ( var i = 0; i < Cardlist_length; i++ ) {
		Cardlist[i] = {};
		Cardlist[i].name_jp     =         Cardlist_1array[k++];
		Cardlist[i].name_yomi   =         Cardlist_1array[k++];
		Cardlist[i].name_eng    =         Cardlist_1array[k++];
		Cardlist[i].set_name    =         Cardlist_1array[k++];
		Cardlist[i].cost_str    =         Cardlist_1array[k++];
		Cardlist[i].cost        = Number( Cardlist_1array[k++] );
		Cardlist[i].cost_potion = Number( Cardlist_1array[k++] );
		Cardlist[i].cost_debt   = Number( Cardlist_1array[k++] );
		Cardlist[i].class       =         Cardlist_1array[k++];
		Cardlist[i].category    =         Cardlist_1array[k++];
		Cardlist[i].VP          = Number( Cardlist_1array[k++] );
		Cardlist[i].draw_card   = Number( Cardlist_1array[k++] );
		Cardlist[i].action      = Number( Cardlist_1array[k++] );
		Cardlist[i].buy         = Number( Cardlist_1array[k++] );
		Cardlist[i].coin        = Number( Cardlist_1array[k++] );
		Cardlist[i].VPtoken     = Number( Cardlist_1array[k++] );
		Cardlist[i].effect1     =         Cardlist_1array[k++];
		Cardlist[i].effect2     =         Cardlist_1array[k++];
		Cardlist[i].effect3     =         Cardlist_1array[k++];
		Cardlist[i].effect4     =         Cardlist_1array[k++];
		Cardlist[i].implemented =         Cardlist_1array[k++];
	}
}

function initsupply( supply, Cardlist_length ) {
	supply.kingdomcards = [];
	for ( var i = 0; i < KINGDOMCARD_SIZE; i++ ) {
		supply.kingdomcards[i] = 0;
	}
	supply.Prosperity         = false;
	supply.DarkAges           = false;
	supply.eventcards         = [];
	supply.eventcards[0]      = 0;
	supply.eventcards[1]      = 0;
	supply.landmark           = [];
	supply.landmark[0]        = 0;
	supply.landmark[1]        = 0;
	supply.banecard           = 0; // 魔女娘が有効のときは災いカードとしてサプライを1つ追加し表示
	supply.obelisk            = 0;
	supply.blackmarket        = []; // 闇市場が有効のときは15種類のサプライを選び3枚ずつめくって1枚選択
	supply.blackmarket_bought = [];
	for ( var i = 0; i < BLACKMARKET_SIZE; i++ ) {
		supply.blackmarket[i] = 0;
		supply.blackmarket_bought[i] = false;
	}
	supply.recentgame = [];
	for ( var i = 0; i < Cardlist_length; i++ ) {
		supply.recentgame[i] = 0;
	}
}


// function CSupply( Cardlist_length ) {
// 	this.kingdomcards = [];
// 	for ( var i = 0; i < KINGDOMCARD_SIZE; i++ ) {
// 		this.kingdomcards[i] = 0;
// 	}
// 	this.Prosperity         = false;
// 	this.DarkAges           = false;
// 	this.eventcards         = [];
// 	this.eventcards[0]      = 0;
// 	this.eventcards[1]      = 0;
// 	this.landmark           = [];
// 	this.landmark[0]        = 0;
// 	this.landmark[1]        = 0;
// 	this.banecard           = 0; // 魔女娘が有効のときは災いカードとしてサプライを1つ追加し表示
// 	this.obelisk            = 0;
// 	this.blackmarket        = []; // 闇市場が有効のときは15種類のサプライを選び3枚ずつめくって1枚選択
// 	this.blackmarket_bought = [];
// 	for ( var i = 0; i < BLACKMARKET_SIZE; i++ ) {
// 		this.blackmarket[i] = 0;
// 		this.blackmarket_bought[i] = false;
// 	}
// 	this.recentgame = [];
// 	for ( var i = 0; i < Cardlist_length; i++ ) {
// 		this.recentgame[i] = 0;
// 	}
// }



// CSupply.prototype.text = function() {
// 	return "";
// };

