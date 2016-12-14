

/* class */
function CCard( card_no, card_ID, class_str = "" ) {
	/* no : カードの種類を識別する番号
	 * ID : ゲームに使われるカード1枚1枚を全て区別するための通し番号 */
	this.card_no = Number( card_no );
	this.card_ID = Number( card_ID );
	this.class_str = class_str;
}



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
	return 10; /* KingdomCard default */
}



/* class */
function CSupplyPile() {
	this.card_no = 0;
	this.pile    = [];
}


CSupplyPile.prototype.InitSupplyPile = function( card_no, PlayerNum, SelectedCards ) {
	size = SetSizeOfSupplyPile( card_no, PlayerNum, SelectedCards );
	this.card_no = Number( card_no );
	this.pile    = new Array(size);
	for ( let i = 0; i < size; ++i ) {
		this.pile[i] = new CCard( card_no, global_card_ID++ );
	}
};


CSupplyPile.prototype.InitByObj = function( SupplyPileObj ) {
	if ( !SupplyPileObj ) {
		this.card_no = 0;
		this.pile = [];
		return;
	}
	this.card_no = ( SupplyPileObj.card_no || 0  );
	this.pile    = ( SupplyPileObj.pile    || [] );
};




CSupplyPile.prototype.IsEmpty = function() {
	return this.pile.length <= 0;
};

CSupplyPile.prototype.LookTopCard = function() {
	if ( this.IsEmpty() ) return false;
	return this.pile[0];
};

CSupplyPile.prototype.GetTopCard = function() {  /* カード移動基本操作 */
	/* blackmarket 以外 */
	if ( this.IsEmpty() ) return false;
	let card = this.pile.shift();
	FBref_Game.child('Supply/' + Cardlist[ this.card_no ].name_eng ).set( this );
	return card;
};







/* class */
function CSupply() {
	this.Basic = [];
	this.KingdomCards = [];
}


CSupply.prototype.InitSupply = function( SelectedCards, PlayerNum ) {
	/* initialize supply */
	for ( let i = 0; i <= 8; ++i ) {
		this.Basic[i] = new CSupplyPile();
	}
	this.Basic[0].InitSupplyPile( CardName2No['Copper'  ], PlayerNum, SelectedCards );
	this.Basic[1].InitSupplyPile( CardName2No['Silver'  ], PlayerNum, SelectedCards );
	this.Basic[2].InitSupplyPile( CardName2No['Gold'    ], PlayerNum, SelectedCards );
	this.Basic[3].InitSupplyPile( CardName2No['Estate'  ], PlayerNum, SelectedCards );
	this.Basic[4].InitSupplyPile( CardName2No['Duchy'   ], PlayerNum, SelectedCards );
	this.Basic[5].InitSupplyPile( CardName2No['Province'], PlayerNum, SelectedCards );
	this.Basic[6].InitSupplyPile( CardName2No['Curse'   ], PlayerNum, SelectedCards );

	// if ( SelectedCards.Prosperity ) {
		this.Basic[7].InitSupplyPile( CardName2No['Platinum'], PlayerNum, SelectedCards );
		this.Basic[8].InitSupplyPile( CardName2No['Colony'  ], PlayerNum, SelectedCards );
	// }

	for ( let i = 0; i < KINGDOMCARD_SIZE; ++i ) {
		this.KingdomCards[i] = new CSupplyPile();
		this.KingdomCards[i].InitSupplyPile( SelectedCards.KingdomCards[i], PlayerNum, SelectedCards );
	}

	// if ( SelectedCards.BaneCard !== 0 ) {
		this.BaneCard = new CSupplyPile();
		this.BaneCard.InitSupplyPile( SelectedCards.BaneCard, PlayerNum, SelectedCards );
	// }

	// if ( SelectedCards.BlackMarket[0] !== 0 ) {
		this.BlackMarket = [];
		for ( let i = 0; i < BLACKMARKET_SIZE; ++i ) {
			this.BlackMarket[i] = new CCard( SelectedCards.BlackMarket[i], global_card_ID++ );
		}
	// }
};


CSupply.prototype.InitByObj = function( SupplyObj ) {
	for ( let i = 0; i <= 8; ++i ) {
		this.Basic[i] = new CSupplyPile();
		this.Basic[i].InitByObj( SupplyObj.Basic[i] );
	}
	// if ( SelectedCards.Prosperity ) {
		// this.Basic[4] = new CSupplyPile();   this.Basic[4].InitByObj( SupplyObj.Basic[4] );
		// this.Basic[8] = new CSupplyPile();   this.Basic[8].InitByObj( SupplyObj.Basic[8] );
	// }

	this.KingdomCards = [];
	for ( let i = 0; i < KINGDOMCARD_SIZE; ++i ) {
		this.KingdomCards[i] = new CSupplyPile();
		this.KingdomCards[i].InitByObj( SupplyObj.KingdomCards[i] );
	}

	// if ( SelectedCards.BaneCard !== 0 ) {
		this.BaneCard = new CSupplyPile()
		this.BaneCard.InitByObj( SupplyObj.BaneCard );
	// }

	// if ( SelectedCards.BlackMarket[0] !== 0 ) {
		this.BlackMarket = [];
		for ( let i = 0; i < BLACKMARKET_SIZE; ++i ) {
			this.BlackMarket[i] = SupplyObj.BlackMarket[i];
		}
	// }
};


CSupply.prototype.byName = function( name ) {
	/* reverse dictionary */
	switch (name) {
		case 'Copper'   : return this.Basic[0];
		case 'Silver'   : return this.Basic[1];
		case 'Gold'     : return this.Basic[2];
		case 'Estate'   : return this.Basic[3];
		case 'Duchy'    : return this.Basic[4];
		case 'Province' : return this.Basic[5];
		case 'Curse'    : return this.Basic[6];
		case 'Platinum' : return this.Basic[7];
		case 'Colony'   : return this.Basic[8];
		case Cardlist[ this.BaneCard.card_no ].name_eng : return this.BaneCard[i];
		default: break;
	}
	// if ( SelectedCards.Prosperity ) {
	// 	this.byName['Platinum'] = this.Basic[4];
	// 	this.byName['Colony'  ] = this.Basic[8];
	// }
	for ( let i = 0; i < KINGDOMCARD_SIZE; ++i ) {
		if ( name === Cardlist[ this.KingdomCards[i].card_no ].name_eng ) {
			return this.KingdomCards[i];
		}
		// this.byName[ Cardlist[ this.KingdomCards[i].card_no ].name_eng ] = this.KingdomCards[i];
	}
	if ( name === Cardlist[ this.BaneCard.card_no ].name_eng ) {
		return this.BaneCard;
	}
	// if ( SelectedCards.BaneCard !== 0 ) {
	// 	this.byName[ Cardlist[ this.BaneCard.card_no ].name_eng ] = this.BaneCard[i];
	// }
	// if ( SelectedCards.BlackMarket[0] !== 0 ) {
		for ( let i = 0; i < BLACKMARKET_SIZE; ++i ) {
			if ( name === Cardlist[ this.BlackMarket[i].card_no ].name_eng ) {
				return this.BlackMarket[i];
			}
			// this.byName[ Cardlist[ this.BlackMarket[i].card_no ].name_eng ] = this.BlackMarket[i];
		}
	// }
};






