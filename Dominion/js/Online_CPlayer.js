

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
			this.PutBackToDeck( Supply.byName('Copper').GetTopCard() );
		}
		/* get 3 Estates from supply */
		for ( let i = 0; i < 3; ++i ) {
			this.PutBackToDeck( Supply.byName('Estate').GetTopCard() );
		}

		this.Deck.shuffle();
		this.DrawCards(5);

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




	/* Deck */
	GetDeckTopCard( FBsync = false ) {  /* カード移動基本操作 */
		if ( !this.Drawable() ) return undefined;
		if ( this.Deck.length === 0 ) {
			this.DiscardPile.shuffle();
			this.Deck.copyfrom( this.DiscardPile );
			this.DiscardPile = [];
		}
		let card = this.Deck.shift();
		if ( FBsync ) {
			FBref_Players.child( this.id ).update( {
				Deck        : this.Deck,
				DiscardPile : this.DiscardPile,
			});
		}
		return card;
	}


	GetDeckTopCards( n, FBsync = false ) {  /* カード移動複合操作 */
		let ar = new Array(n);
		for ( let i = 0; i < n; ++i ) {
			ar[i] = this.GetDeckTopCard();
		}
		if ( FBsync ) {
			FBref_Players.child( this.id ).update( {
				Deck        : this.Deck,
				DiscardPile : this.DiscardPile,
			});
		}
		return ar;
	}


	PutBackToDeck( card, FBsync = false ) {  /* カード移動基本操作，山札の一番上に獲得 */
		if ( card == undefined ) return Promise.resolve();
		this.Deck.unshift( card );  /* 先頭に追加 */
		if ( FBsync ) {
			return FBref_Players.child( `${this.id}/Deck` ).set( this.Deck );
		}
	}


	/* HandCards */
	SortHandCards() {
		let sorted = this.HandCards.sort( function(a,b) { return a.card_no - b.card_no; });
		let action_cards, treasure_cards, victory_cards;
		[ action_cards  , sorted ] = sorted.filterRemove( (elm) => IsActionCard  ( Cardlist, elm.card_no ) );
		[ treasure_cards, sorted ] = sorted.filterRemove( (elm) => IsTreasureCard( Cardlist, elm.card_no ) );
		[ victory_cards , sorted ] = sorted.filterRemove( (elm) => IsVictoryCard ( Cardlist, elm.card_no ) );
		this.HandCards = [].concat( action_cards, treasure_cards, victory_cards, sorted );
	}

	AddToHandCards( card, FBsync = false ) {  /* カード移動基本操作 */
		if ( card == undefined ) return;
		/* add and sort */
		this.HandCards.push( card );
		// this.SortHandCards();
		if ( FBsync ) {
			return FBref_Players.child( `${this.id}/HandCards` ).set( this.HandCards );
		}
	}

	/* DiscardPile*/
	AddToDiscardPile( card, FBsync = false ) {  /* カード移動基本操作 */
		if ( card == undefined ) return Promise.resolve();
		this.DiscardPile.push( card );
		if ( FBsync ) {
			return FBref_Players.child( `${this.id}/DiscardPile` ).set( this.DiscardPile );
		}
	}

	/* PlayArea */
	AddToPlayArea( card, FBsync = false ) {  /* カード移動基本操作 */
		if ( card == undefined ) return Promise.resolve();
		this.PlayArea.push( card );
		if ( FBsync ) {
			return FBref_Players.child( `${this.id}/PlayArea` ).set( this.PlayArea );
		}
	}

	/* Aside */
	SetAside( card, FBsync = false ) {  /* カード移動基本操作 */
		if ( card == undefined ) return Promise.resolve();
		this.Aside.push( card );
		if ( FBsync ) {
			return FBref_Players.child( `${this.id}/Aside` ).set( this.Aside );
		}
	}

	/* Open */
	AddToOpen( card, FBsync = false ) {  /* カード移動基本操作 */
		if ( card == undefined ) return Promise.resolve();
		this.Open.push( card );
		if ( FBsync ) {
			return FBref_Players.child( `${this.id}/Open` ).set( this.Open );
		}
	}



	/* draw */
	Drawable() {
		return (( this.Deck.length + this.DiscardPile.length ) > 0 );
	}

	DrawCards( n, FBsync = false ) {  /* カード移動複合操作 */
		if ( n <= 0 ) return Promise.resolve();
		for ( let i = 0; i < n; i++ ) {
			this.AddToHandCards( this.GetDeckTopCard() );
		}
		if ( FBsync ) {
			return FBref_Players.child( this.id ).set( this );
		}
	}


	OpenDeckTop( n, FBsync = false ) { /* カード移動複合操作 */
		this.GetDeckTopCards(n).forEach( (card) => this.AddToOpen(card) );
		if ( FBsync ) {
			return FBref_Players.child( this.id ).update( this );
		}
	}


	GetReactionCards() {
		return this.HandCards
			.filter( (card) => IsReactionCard( Cardlist, card.card_no ) );
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


	CleanUp( FBsync = true ) {
		let CardsToDiscard = [].concat(
				  this.HandCards
				, this.PlayArea
				, this.Aside
			);
		this.DiscardPile = this.DiscardPile.concat( CardsToDiscard );
		this.HandCards = [];
		this.PlayArea  = [];
		this.Aside     = [];

		this.DrawCards(5);
		this.TurnCount++;

		if ( FBsync ) {
			return FBref_Players.child( `${this.id}` ).update( this );
		}
	}


	GetDeckAll() {
		return [].concat(
				  this.Deck
				, this.DiscardPile
				, this.HandCards
				, this.PlayArea
				, this.Aside
			);
	}


	ResetFaceDown() {
		this.GetDeckAll().forEach( function( card ) {
			card.face = false;
			card.down = false;
		});
	}


	// 手札を公開
	RevealHandCards( FBsync = true ) {
		this.HandCards.forEach( function( card ) {
			card.face = true;
			card.down = false;
		});
		if ( FBsync ) {
			return FBref_Players.child( `${this.id}/HandCards` ).update( this.HandCards );
		}
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








	ResetClassStr( FBsync = true ) {
		this.GetDeckAll().forEach( function( card ) {
			card.class_str = '';
		});
		if ( FBsync ) {
			return FBref_Players.child( `${this.id}` ).update( this );
		}
	}


	SumUpVP() {
		const DeckAll = this.GetDeckAll();
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


