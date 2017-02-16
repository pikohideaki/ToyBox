

/* class */
function CSelectedCards() {

	/* 植民地場，避難所場 */
	this.Prosperity = false;
	this.DarkAges   = false;

	/* 王国カード */
	this.KingdomCards = [];
	for ( let i = 0; i < KINGDOMCARD_SIZE; i++ ) {
		this.KingdomCards[i] = 0;
	}

	/* EventCards & LandmarkCards */
	this.EventCards       = [];
	this.EventCards[0]    = 0;
	this.EventCards[1]    = 0;
	this.LandmarkCards    = [];
	this.LandmarkCards[0] = 0;
	this.LandmarkCards[1] = 0;

	/* 特殊サプライ */
	this.BaneCard    = 0; // 魔女娘が有効のときは災いカードとしてサプライを1つ追加し表示
	this.Obelisk     = 0;
	this.BlackMarket = []; // 闇市場が有効のときは15種類のサプライを選び3枚ずつめくって1枚選択
	for ( let i = 0; i < BLACKMARKET_SIZE; i++ ) {
		this.BlackMarket[i] = 0;
	}
}


function Randomizer( SelectedCards, UsingSetlist, Cardlist ) {
	SelectKingdomCards( SelectedCards, UsingSetlist, Cardlist );
	SelectBaneCard( SelectedCards, UsingSetlist, Cardlist );
}



function SelectKingdomCards( SelectedCards, UsingSetlist, Cardlist ) {
	let generated_num = 0;  /* 生成した王国カードの数 */

	let count = 999;  /* 最大ループ回数 */

	while ( generated_num < KINGDOMCARD_SIZE && count-- ) {

		let r = RandInt( 1, Cardlist.length - 1 );

		// 未実装カードならばスキップ
		if ( Cardlist[r].implemented != '実装済み' ) continue;

		/* 王国カードでなければスキップ */
		if ( Cardlist[r].class !== '王国' ) continue;

		/* 使わないセットのカードならスキップ */
		if ( !UsingSetlist.includes( Cardlist[r].set_name ) ) continue;

		/* 使用済みカードならスキップ */
		if ( SelectedCards.KingdomCards.includes(r) ) continue;

		/* rが有効なとき */
		SelectedCards.KingdomCards[generated_num] = r;

		generated_num++;
	}

	if ( generated_num < KINGDOMCARD_SIZE ) {
		alert( 'サプライが足りません。選択中のセットに含まれるサプライの種類が少ない可能性があります。'  );
		return 1;
	}

	SelectedCards.Prosperity  = ( Cardlist[ SelectedCards.KingdomCards[0] ].set_name === '繁栄' );
	SelectedCards.DarkAges    = ( Cardlist[ SelectedCards.KingdomCards[9] ].set_name === '暗黒時代' );

	SelectedCards.KingdomCards.sort( (a, b) => ( Cardlist[a].cost_coin - Cardlist[b].cost_coin ) );
}





function SelectBaneCard( SelectedCards, UsingSetlist, Cardlist ) {
	let r = -1;
	let count = 999;  // 最大ループ回数
	while ( count-- ) {
		r = myrand( 1, Cardlist.length - 1 );

		// 未実装カードならばスキップ
		if ( Cardlist[r].implemented != '実装済み' ) continue;

		/* 王国カードでなければスキップ */
		if ( Cardlist[r].class !== '王国' ) continue;

		/* 使わないセットのカードならスキップ */
		if ( !UsingSetlist.includes( Cardlist[r].set_name ) ) continue;

		/* 使用済みカードならスキップ */
		if ( SelectedCards.KingdomCards.includes(r) ) continue;

		/* コストは2~3 */
		if ( Cardlist[r].cost_potion != 0
		  || Cardlist[r].cost_debt   != 0
		  || Cardlist[r].cost_coin   >  3
		  || Cardlist[r].cost_coin   <  2 )
		{
			continue;
		}

		// 有効なカードが見つかったら抜ける
		break;
	}

	if ( r < 0 || count < 1 ) {
		alert('災いカード用のサプライが足りません。チェック中のセットに含まれるサプライの種類が少ない可能性があります。');
		SelectedCards.BaneCard = 0;
		return 1;
	}

	SelectedCards.BaneCard = r;

	return 0;
}



