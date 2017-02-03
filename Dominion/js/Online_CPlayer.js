

class CPlayer {
	constructor( PlayerObj ) {
		if ( PlayerObj == undefined ) {
			this.id            = 0;
			this.name          = "";
			this.Deck          = [];
			this.DiscardPile   = [];
			this.HandCards     = [];
			this.PlayArea      = [];
			this.Aside         = [];
			this.Open          = []; /* 一時的に公開 */
			this.VPtoken       = 0;
			this.VPtotal       = 0;
			this.TurnCount     = 1;
			this.Connection    = true;
		} else {
			this.id            =   PlayerObj.id;
			this.name          =   PlayerObj.name;
			this.Deck          = ( PlayerObj.Deck        || [] );
			this.DiscardPile   = ( PlayerObj.DiscardPile || [] );
			this.HandCards     = ( PlayerObj.HandCards   || [] );
			this.PlayArea      = ( PlayerObj.PlayArea    || [] );
			this.Aside         = ( PlayerObj.Aside       || [] );
			this.Open          = ( PlayerObj.Open        || [] );
			this.VPtoken       = ( Number( PlayerObj.VPtoken ) || 0 );
			this.VPtotal       = ( Number( PlayerObj.VPtotal ) || 0 );
			this.TurnCount     = PlayerObj.TurnCount;
			this.Connection    = PlayerObj.Connection;
		}
	}



	InitDeck( myid, myname, SupplyObj ) {
		let Supply = new CSupply( SupplyObj );

		/* get 7 Coppers from supply */
		for ( let i = 0; i < 7; ++i ) {
			this.AddToDeck( Supply.byName('Copper').GetTopCard() );
		}
		/* get 3 Estates from supply */
		for ( let i = 0; i < 3; ++i ) {
			this.AddToDeck( Supply.byName('Estate').GetTopCard() );
		}

		this.Deck.shuffle();
		this.DrawCards(5,false,false);

		this.id   = myid;
		this.name = myname;

		// let updates = {};
		// updates[`Players/${this.id}`] = this;
		// updates['Supply']           = Supply;
		// if ( !this.HasActionCard() ) {
		// 	updates['phase'] = 'BuyPhase';
		// }
		// FBref_Game.update( updates );
	}



	SortHandCards() {
		let sorted = this.HandCards.sort( function(a,b) { return a.card_no - b.card_no; });
		let action_cards, treasure_cards, victory_cards;
		[ action_cards  , sorted ] = sorted.filterRemove( (elm) => IsActionCard  ( Cardlist, elm.card_no ) );
		[ treasure_cards, sorted ] = sorted.filterRemove( (elm) => IsTreasureCard( Cardlist, elm.card_no ) );
		[ victory_cards , sorted ] = sorted.filterRemove( (elm) => IsVictoryCard ( Cardlist, elm.card_no ) );
		this.HandCards = [].concat( action_cards, treasure_cards, victory_cards, sorted );
	}

	GetCopyOfPlayersAllCards() {
		return [].concat(
				  this.Deck
				, this.DiscardPile
				, this.HandCards
				, this.PlayArea
				, this.Aside
				, this.Open
			);
	}




	/* カード移動基本操作 */

	AddToDeck( card ) {  /* カード移動基本操作 */
		if ( card == undefined ) return;
		this.Deck.unshift( card );  /* 先頭に追加 */
	}

	AddToHandCards( card ) {  /* カード移動基本操作 */
		if ( card == undefined ) return;
		this.HandCards.push( card );
	}

	AddToDiscardPile( card ) {  /* カード移動基本操作 */
		if ( card == undefined ) return;
		this.DiscardPile.push( card );
	}

	AddToPlayArea( card ) {  /* カード移動基本操作 */
		if ( card == undefined ) return;
		this.PlayArea.push( card );
	}

	AddToAside( card ) {  /* カード移動基本操作 */
		if ( card == undefined ) return;
		this.Aside.push( card );
	}

	AddToOpen( card ) {  /* カード移動基本操作 */
		if ( card == undefined ) return;
		this.Open.push( card );
	}


	// 山札をそのままひっくり返して捨て山に置く（宰相など）
	PutDeckIntoDiscardPile() {
		const pl = this;
		return new Promise( function( resolve ) {
			pl.Deck.reverse();  /* 山札をそのままひっくり返して捨て山に置く */
			pl.Deck.forEach( card => pl.AddToDiscardPile(card) );
			pl.Deck = [];
			FBref_Players.child( pl.id ).set( pl ).then( resolve );
		})
	}




	Drawable() {
		return (( this.Deck.length + this.DiscardPile.length ) > 0 );
	}

	LookDeckTopCard() {  /* カード移動基本操作 */
		if ( !this.Drawable() ) return undefined;
		if ( this.Deck.length === 0 ) {
			this.DiscardPile.shuffle();
			this.Deck.copyfrom( this.DiscardPile );
			this.DiscardPile = [];
		}
		return this.Deck[0];
	}

	GetDeckTopCard() {  /* カード移動基本操作 */
		const DeckTopCard = this.LookDeckTopCard();
		if ( DeckTopCard == undefined ) return undefined;
		return this.Deck.shift();
		// if ( !this.Drawable() ) return undefined;
		// if ( this.Deck.length === 0 ) {
		// 	this.DiscardPile.shuffle();
		// 	this.Deck.copyfrom( this.DiscardPile );
		// 	this.DiscardPile = [];
		// }
	}

	// GetDeckTopCards(n) {  /* カード移動複合操作 */
	// 	const ar = new Array(n);
	// 	ar.forEach( ( val, index, array ) => array[index] = this.GetDeckTopCard() );
	// 	return ar;
	// }

	DrawCards( n, log = true, FBsync = true ) {  /* カード移動複合操作 */
		if ( n <= 0 ) return Promise.resolve();
		for ( let i = 0; i < n; i++ ) {
			this.AddToHandCards( this.GetDeckTopCard() );
		}
		if ( log ) {
			FBref_chat.push( `${this.name}が${n}枚カードを引きました。` );
		}
		if ( FBsync ) {
			return FBref_Players.child( this.id ).update( {
					HandCards   : this.HandCards,
					Deck        : this.Deck,
					DiscardPile : this.DiscardPile,
				} );
		} else {
			return Promise.resolve();
		}
	}


	RevealDeckTop(n) {  /* カード移動複合操作 */
		if ( n <= 0 ) return Promise.resolve();
		for ( let i = 0; i < n; i++ ) {
			this.AddToOpen( this.GetDeckTopCard() );
		}
		return FBref_Players.child( this.id ).update( {
			Deck        : this.Deck,
			DiscardPile : this.DiscardPile,
			Open        : this.Open,
		} );
	}





	HasReactionCard() {
		for ( let i = 0; i < this.HandCards.length; i++ ) {
			if ( IsReactionCard( Cardlist, this.HandCards[i].card_no ) ) return true;
		}
		return false;
	}

	HasActionCard() {
		for ( let i = 0; i < this.HandCards.length; i++ ) {
			if ( IsActionCard( Cardlist, this.HandCards[i].card_no ) ) return true;
		}
		return false;
	}


	CleanUp() {  /* カード移動複合操作 */
		let CardsToDiscard = [].concat(
				  this.HandCards
				, this.PlayArea
				, this.Aside
			);
		this.DiscardPile = this.DiscardPile.concat( CardsToDiscard );
		this.HandCards = [];
		this.PlayArea  = [];
		this.Aside     = [];

		this.DrawCards(5,false,false);
		this.TurnCount++;
	}


	ResetFace() {
		this.GetCopyOfPlayersAllCards().forEach( card => card.face = 'default' );
	}


	// ResetClassStr( FBsync = true ) {
	// 	this.GetCopyOfPlayersAllCards().forEach( function( card ) {
	// 		card.class_str = '';
	// 	});
	// 	if ( FBsync ) {
	// 		return FBref_Players.child( `${this.id}` ).update( this );
	// 	}
	// }


	SumUpVP() {
		const DeckAll = this.GetCopyOfPlayersAllCards();
		const VictoryCards = 
			DeckAll.filter( (card) => IsVictoryCard( Cardlist, card.card_no ) );

		this.VPtotal = 0;

		this.VPtotal += this.VPtoken;

		// 呪い
		this.VPtotal -=
			DeckAll.filter( (card) => ( Cardlist[ card.card_no ].name_eng == 'Curse' ) ).length;

		// 得点固定の勝利点カードの合計
		VictoryCards.forEach( (card) => { this.VPtotal += Number( Cardlist[ card.card_no ].VP ) });

		// 庭園 : デッキ枚数 ÷ 10 点
		this.VPtotal +=
			Math.floor( DeckAll.length / 10 )
			* VictoryCards.filter( (card) => ( Cardlist[ card.card_no ].name_eng == 'Gardens' ) ).length;


		// 公爵 : 公領1枚につき1点
		this.VPtotal +=
			VictoryCards.filter( (card) => ( Cardlist[ card.card_no ].name_eng == 'Duchy' ) ).length
			* VictoryCards.filter( (card) => ( Cardlist[ card.card_no ].name_eng == 'Duke' ) ).length;

		// ブドウ園 : アクションカード3枚につき1点
		this.VPtotal +=
			Math.floor( DeckAll.filter( (card) => IsActionCard( Cardlist, card.card_no ) ).length / 3 )
			* VictoryCards.filter( (card) => ( Cardlist[ card.card_no ].name_eng == 'Vineyard' ) ).length;

		// 品評会 : 異なる名前のカード5枚につき2勝利点
		this.VPtotal +=
			2 * Math.floor(DeckAll.uniq( (card) => Cardlist[card.card_no].name_eng ).length / 5)
			* VictoryCards.filter( (card) => ( Cardlist[ card.card_no ].name_eng == 'Fairgrounds' ) ).length;

		 // シルクロード : 勝利点カード4枚につき1点
		this.VPtotal +=
			Math.floor( VictoryCards.length / 4 )
			* VictoryCards.filter( (card) => ( Cardlist[ card.card_no ].name_eng == 'Silk Road' ) ).length;

		// 封土 : 銀貨3枚につき1点
		this.VPtotal +=
			Math.floor( DeckAll.filter( (card) => ( Cardlist[ card.card_no ].name_eng == 'Silver' ) ).length / 3 )
			* VictoryCards.filter( (card) => ( Cardlist[ card.card_no ].name_eng == 'Feodum' ) ).length;

		// 遠隔地 : 酒場マットの上にあれば4点，そうでなければ0点
		// this.VPtotal +=
		// 	this.TavernMat
		// 	.filter( (card) => ( Cardlist[ card.card_no ].name_eng == 'Distant Lands' ) )
		// 	.length * 4;

		// Castles

		// landmark cards
	}

}


