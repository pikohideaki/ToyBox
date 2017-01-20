// 「各セットから均等に選ぶ」が有効なときに各セットからの最大選択枚数を設定するためにwhileループを用いて実装した.

// 「錬金術重み付け」は、簡単のために、まず錬金術セットが選択されているときにそれを使用するかどうかをランダムに決定して、
// 使用するとなった場合3～5枚錬金術のカードを選出したのち他のセットのカード選出を行うようにした.
// 実際にはwhileループで錬金術から3～5枚選ぶまで他は選ばず, 選んだら錬金術からは選ばないようにした.

function randomizer( Setlist, UseSet_flag, Cardlist, Supply )
{
	var supply10 = 0;

	var count = 999;  // 最大ループ回数
	while ( supply10 < KINGDOMCARD_SIZE && count-- ) {

		var r = myrand( 1, Cardlist.length - 1 );

		var continue__ = false;
	 // 王国カードでなければcontinue__
		if ( Cardlist[r].class !== '王国' ) continue__ = true;
	 // 使わないセットのカードならcontinue__
		for ( var j = 0; j < UseSet_flag.length; j++ ) {
			if ( !UseSet_flag[j] ) {
				if ( Cardlist[r].set_name ===  Setlist[j] ) continue__ = true;
			}
		}
	 // 使用済みカードならcontinue__
		for ( var k = 0; k < supply10; k++ ) {
			if ( Supply.kingdomcards[k] === r ) continue__ = true;
		}

		if ( continue__ ) continue;


	 // rが有効なとき
		Supply.kingdomcards[supply10] = r;

		if ( supply10 === 0 ) {
			Supply.Prosperity  = ( Cardlist[r].set_name === '繁栄' );
		}
		if ( supply10 === 9 ) {
			Supply.DarkAges = ( Cardlist[r].set_name === '暗黒時代' );
		}

		supply10++;
	}


	if ( supply10 < KINGDOMCARD_SIZE ) {
		alert( 'サプライが足りません。選択中のセットに含まれるサプライの種類が少ない可能性があります。' );
		return 1;
	}

	Supply.kingdomcards.sort(
		function(a, b) {
			return ( Cardlist[a].cost_coin - Cardlist[b].cost_coin );
		}
	);
}



function select_banecard( Setlist, UseSet_flag, Cardlist, Supply )
{
	var r = -1;
	var count = 999;  // 最大ループ回数
	while ( count-- ) {
		r = myrand( 1, Cardlist.length - 1 );

		var continue__ = false;
	 // 王国カードでなければcontinue__
		if ( Cardlist[r].class !== '王国' ) continue__ = true;
	 // 使わないセットのカードならcontinue__
		for ( var j = 0; j < UseSet_flag.length; j++ ) {
			if ( !UseSet_flag[j] ) {
				if ( Cardlist[r].set_name ===  Setlist[j] ) continue__ = true;
			}
		}
		/* サプライに使用済みのカードならスキップ */
		for ( var j = 0; j < KINGDOMCARD_SIZE; j++ ) {
			if ( r === Supply.kingdomcards[j] ) continue__ = true;
		}
		/* コストは2~3 */
		if ( Cardlist[r].cost_coin > 3 || Cardlist[r].cost_coin < 2 ) continue__ = true;

		if ( continue__ )  continue;
		break;
	}

	if ( r < 0 || count < 1 ) {
		alert('災いカード用のサプライが足りません。チェック中のセットに含まれるサプライの種類が少ないか、除外サプライが多すぎる可能性があります。');
		Supply.banecard = 0;
		return 1;
	}

	Supply.banecard = r;

	return 0;
}



function select_obelisk( Setlist, UseSet_flag, Cardlist, Supply, banecard )
{
	var actioncards = [];

	for ( var i = 0; i < KINGDOMCARD_SIZE; i++ ) {
		if ( ( Cardlist[ Supply.kingdomcards[i] ].category ).match(/Action/) ) {
			actioncards.push( Supply.kingdomcards[i] );
		}
	}
	if ( banecard ) {
		if ( ( Cardlist[ Supply.banecard ].category ).match(/Action/) ) {
			actioncards.push( Supply.banecard );
		}
	}
	/* 廃墟 */
	for ( var i = 0; i < KINGDOMCARD_SIZE; i++ ) {
		if ( ( Cardlist[ Supply.kingdomcards[i] ].category ).match(/Looter/) ) {
			for ( var k = 1; k < Cardlist.length; k++ ) {
				if ( Cardlist[k].name_jp === '廃墟' ) {
					actioncards.push(k);
					break
				}
			}
			break;
		}
	}

	var r = myrand( 0, actioncards.length - 1 );
	Supply.obelisk = actioncards[r];
}



function select_event_and_landmark( Setlist, UseSet_flag, Cardlist, Supply )
{
	Supply.eventcards[0] = 0;
	Supply.eventcards[1] = 0;
	Supply.landmark  [0] = 0;
	Supply.landmark  [1] = 0;

 // ランドマークはイベントと同様の選出方法で, イベントと合わせて2枚を上限とする.
	var event_and_landmark_num = myrand( 0, 2 );

	var count = 999;  // 最大ループ回数
	var continue__ = false;  /* continue flag */
	while ( event_and_landmark_num && count-- ) {
		var r = myrand( 1, Cardlist.length - 1 );
		continue__ = false;

	 // イベントカードかLandmarkカードでなければcontinue
		if ( Cardlist[r].class !== 'Event' && Cardlist[r].class !== 'Landmark' )
			continue__ = true;

	 // 使わないセットのカードならcontinue
		for ( var j = 0; j < UseSet_flag.length; j++ ) {
			if ( !UseSet_flag[j] ) {  /* 使わないセット */
				if ( Cardlist[r].set_name ===  Setlist[j] ) continue__ = true;
			}
		}

	 // 使用済みカードならcontinue
		for ( var k = 0; k < event_and_landmark_num; k++ ) {
			if ( Supply.eventcards[k] === r )  continue__ = true;
			if ( Supply.landmark  [k] === r )  continue__ = true;
		}

		if ( continue__ )  continue;

		if ( Cardlist[r].class === 'Event' ) {
			if      ( Supply.eventcards[0] == 0 ) Supply.eventcards[0] = r;
			else if ( Supply.eventcards[1] == 0 ) Supply.eventcards[1] = r;
		} else { /* Cardlist[r].class === 'Landmark' */
			if      ( Supply.landmark[0] == 0 ) Supply.landmark[0] = r;
			else if ( Supply.landmark[1] == 0 ) Supply.landmark[1] = r;
		}
		event_and_landmark_num--;
	}

	Supply.eventcards.sort(
		function(a, b) {
			return ( Cardlist[a].cost_coin - Cardlist[b].cost_coin );
		}
	);
	Supply.landmark.sort(
		function(a, b) {
			return ( Cardlist[a].cost_coin - Cardlist[b].cost_coin );
		}
	);
}


function select_blackmarket( Setlist, UseSet_flag, Cardlist, Supply )
{
	var r = -1;
	var i = 0;
	var count = 999;  // 最大ループ回数
	while ( ( count-- > 0 ) && ( i < BLACKMARKET_SIZE ) ) {
		r = myrand( 0, Cardlist.length - 1 );

		var continue__ = false;
	 // 王国カードでなければcontinue__
		if ( Cardlist[r].class !== '王国' ) continue__ = true;
	 // 使わないセットのカードならcontinue__
		for ( var j = 0; j < UseSet_flag.length; j++ ) {
			if ( !UseSet_flag[j] ) {
				if ( Cardlist[r].set_name ===  Setlist[j] ) continue__ = true;
			}
		}
	 // サプライに使用済みのカードならcontinue__
		for ( var j = 0; j < KINGDOMCARD_SIZE; j++ ) {
			if ( r === Supply.kingdomcards[j] ) continue__ = true;
		}
	 // 使用済みカードならcontinue__
		for ( var k = 0; k < i; k++ ) {
			if ( Supply.blackmarket[k] === r ) continue__ = true;
		}

		if ( continue__ ) { continue; }

		Supply.blackmarket[i] = r;
		i++;
	}

	if ( i < BLACKMARKET_SIZE || count < 1 ) {
		alert('闇市場デッキ用のサプライが足りません。チェック中のセットに含まれるサプライの種類が少ないか、除外サプライが多すぎる可能性があります。');
		return 1;
	}

	return 0;
}


