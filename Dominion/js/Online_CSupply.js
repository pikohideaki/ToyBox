

class CCard {
	constructor( card_no, card_ID ) {
		/* no : カードの種類を識別する番号
		 * ID : ゲームに使われるカード1枚1枚を全て区別するための通し番号 */
		this.card_no = Number( card_no );
		this.card_ID = Number( card_ID );
		this.face = false;  /* 表向きにするか */
		this.down = false;  /* 裏向きにするか */
		this.class_str = '';  /* 一時的に付加しデータとして共有するクラス文字列 */
	}
}



// function add_class( card, class_str ) {
	// card.class_array.push( class_str );
// }
// function remove_class( card, class_str ) {
	// card.class_array.remove_val( class_str );
// }



function SetSizeOfSupplyPile( card_no, PlayerNum, SelectedCards ) {
	/* カード追加時に書き足し */
	switch ( Number(card_no) ) {
		case 0 : return 0; /* dummy */
		case CardName2No['Copper'  ] : return 60;
		case CardName2No['Silver'  ] : return 40;
		case CardName2No['Gold'    ] : return 30;
		case CardName2No['Platinum'] : return 12;
		case CardName2No['Curse'   ] : return ( PlayerNum - 1 ) * 10;
		default : break;
	}
	if ( Number(card_no) === CardName2No['Estate'] ) {
		if ( SelectedCards.DarkAges ) return ( PlayerNum > 2 ? 12 : 8 );
		return PlayerNum * 3 + ( PlayerNum > 2 ? 12 : 8 );
	}
	if ( IsVictoryCard( Cardlist, card_no ) ) {
		return ( PlayerNum > 2 ? 12 : 8 );
	}
	if ( IsPrizeCard( Cardlist, card_no ) ) {
		return 1;
	}
	return 10; /* KingdomCard default */
}



class CSupplyPile {
	constructor( SupplyPileObj ) {
		if ( SupplyPileObj == undefined ) {
			this.card_no  = 0;
			this.pile     = [];
			this.IsSupply = true;
			this.in_use   = true;
		} else {
			this.card_no  = ( SupplyPileObj.card_no  || 0  );
			this.pile     = ( SupplyPileObj.pile     || [] );
			this.IsSupply = ( SupplyPileObj.IsSupply || false );
			this.in_use   = ( SupplyPileObj.in_use   || false );
		}
	}

	InitSupplyPile( card_no, PlayerNum, SelectedCards ) {
		let size = SetSizeOfSupplyPile( card_no, PlayerNum, SelectedCards );
		this.card_no = Number( card_no );
		this.pile    = new Array(size);
		for ( let i = 0; i < size; ++i ) {
			this.pile[i] = new CCard( card_no, global_card_ID++, [] );
		}
	}

	IsEmpty() { return (this.pile.length <= 0); }

	IsSupply() { return this.IsSupply; }

	LookTopCard() {
		if ( this.IsEmpty() ) return undefined;
		return this.pile[0];
	}

	GetTopCard() {  /* カード移動基本操作 */
		/* blackmarket 以外 */
		if ( this.IsEmpty() ) return undefined;
		return this.pile.shift();
	}
}






class CSupply {
	constructor( SupplyObj ) {
		this.Basic = [];
		this.KingdomCards = [];
		this.Prize = [];  // prize is not supply
		this.BaneCard;
		this.BlackMarket = [];

		if ( SupplyObj == undefined ) return;


		for ( let i = 0; i <= 9; ++i ) {
			this.Basic[i] = new CSupplyPile( SupplyObj.Basic[i] );
		}

		for ( let i = 0; i < KINGDOMCARD_SIZE; ++i ) {
			this.KingdomCards[i] = new CSupplyPile( SupplyObj.KingdomCards[i] );
		}


		for ( let i = 0; i < PRIZECARD_SIZE; ++i ) {
			this.Prize[i] = new CSupplyPile( SupplyObj.Prize[i] );
		}

		this.BaneCard = new CSupplyPile( SupplyObj.BaneCard );

		for ( let i = 0; i < BLACKMARKET_SIZE; ++i ) {
			if ( SupplyObj.BlackMarket[i] == undefined ) continue;
			this.BlackMarket[i] = SupplyObj.BlackMarket[i];
		}
	}



	byName( name ) {
		/* reverse dictionary */
		switch (name) {
			case 'Copper'   : return this.Basic[0];
			case 'Silver'   : return this.Basic[1];
			case 'Gold'     : return this.Basic[2];
			case 'Platinum' : return this.Basic[3];
			case 'Potion'   : return this.Basic[4];
			case 'Estate'   : return this.Basic[5];
			case 'Duchy'    : return this.Basic[6];
			case 'Province' : return this.Basic[7];
			case 'Colony'   : return this.Basic[8];
			case 'Curse'    : return this.Basic[9];

			case Cardlist[ this.BaneCard.card_no ].name_eng : return this.BaneCard[i];
			default: break;
		}
		for ( let i = 0; i < KINGDOMCARD_SIZE; ++i ) {
			if ( name === Cardlist[ this.KingdomCards[i].card_no ].name_eng ) {
				return this.KingdomCards[i];
			}
		}
		if ( name === Cardlist[ this.BaneCard.card_no ].name_eng ) {
			return this.BaneCard;
		}
		for ( let i = 0; i < BLACKMARKET_SIZE; ++i ) {
			if ( name === Cardlist[ this.BlackMarket[i].card_no ].name_eng ) {
				return this.BlackMarket[i];
			}
		}
	}




	InitSupply( SelectedCards, PlayerNum ) {
		/* initialize supply */
		for ( let i = 0; i <= 9; ++i ) {
			this.Basic[i] = new CSupplyPile();
		}
		this.Basic[0].InitSupplyPile( CardName2No['Copper'  ], PlayerNum, SelectedCards );
		this.Basic[1].InitSupplyPile( CardName2No['Silver'  ], PlayerNum, SelectedCards );
		this.Basic[2].InitSupplyPile( CardName2No['Gold'    ], PlayerNum, SelectedCards );
		this.Basic[3].InitSupplyPile( CardName2No['Platinum'], PlayerNum, SelectedCards );
		this.Basic[4].InitSupplyPile( CardName2No['Potion'  ], PlayerNum, SelectedCards );
		this.Basic[5].InitSupplyPile( CardName2No['Estate'  ], PlayerNum, SelectedCards );
		this.Basic[6].InitSupplyPile( CardName2No['Duchy'   ], PlayerNum, SelectedCards );
		this.Basic[7].InitSupplyPile( CardName2No['Province'], PlayerNum, SelectedCards );
		this.Basic[8].InitSupplyPile( CardName2No['Colony'  ], PlayerNum, SelectedCards );
		this.Basic[9].InitSupplyPile( CardName2No['Curse'   ], PlayerNum, SelectedCards );

		if ( !SelectedCards.KingdomCards.val_exists( CardName2No['Tournament'] ) ) {
			this.Prize.forEach( p => p.in_use = false );
		}

		if ( !SelectedCards.Prosperity ) {
			this.byName('Platinum').in_use = false;
			this.byName('Colony'  ).in_use = false;
		}

		for ( let i = 0; i < KINGDOMCARD_SIZE; ++i ) {
			this.KingdomCards[i] = new CSupplyPile();
			this.KingdomCards[i].InitSupplyPile( SelectedCards.KingdomCards[i], PlayerNum, SelectedCards );
		}

		this.BaneCard = new CSupplyPile();
		this.BaneCard.InitSupplyPile( SelectedCards.BaneCard, PlayerNum, SelectedCards );


		this.BlackMarket = [];
		for ( let i = 0; i < BLACKMARKET_SIZE; ++i ) {
			this.BlackMarket[i] = new CCard( SelectedCards.BlackMarket[i], global_card_ID++, [] );
		}
	}




	GetAllCards() {
		let AllCards = [];
		this.Basic.forEach( function( supply ) {
			AllCards = AllCards.concat( supply.pile );
		});
		this.KingdomCards.forEach( function( supply ) {
			AllCards = AllCards.concat( supply.pile );
		});
		AllCards = AllCards.concat( this.BaneCard.pile );
		AllCards = AllCards.concat( this.BlackMarket );
		return AllCards;
	}
}
