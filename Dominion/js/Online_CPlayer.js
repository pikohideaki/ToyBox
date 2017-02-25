
/*
 * CPlayerクラスの定義ファイル．
 * プレイヤー1人のもつ情報
 */


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

		for ( let i = 0; i < 5; ++i ) {
			this.AddToHandCards( this.GetDeckTopCard() );
		}

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
		[ action_cards  , sorted ] = sorted.filterRemove( elm => IsActionCard  ( Cardlist, elm.card_no ) );
		[ treasure_cards, sorted ] = sorted.filterRemove( elm => IsTreasureCard( Cardlist, elm.card_no ) );
		[ victory_cards , sorted ] = sorted.filterRemove( elm => IsVictoryCard ( Cardlist, elm.card_no ) );
		this.HandCards = [].concat( action_cards, treasure_cards, victory_cards, sorted );
	}

	GetCopyOfAllCards() {
		return [].concat(
				  this.Deck
				, this.DiscardPile
				, this.HandCards
				, this.PlayArea
				, this.Aside
				, this.Open
			);
	}


	// ResetFace() {
	// 	this.GetCopyOfAllCards().forEach( card => card.face = 'default' );
	// 	return FBref_Players.child( this.id ).set( this );
	// }



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
		FBref_chat.push( `${pl.name}が山札を捨て札に置きました。` );
		return new Promise( function( resolve ) {
			pl.Deck.reverse();  /* 山札をそのままひっくり返して捨て山に置く */
			pl.Deck.forEach( card => pl.AddToDiscardPile(　card　) );
			pl.Deck = [];
			FBref_Players.child( pl.id ).set( pl ).then( resolve );
		});
	}




	Drawable() {
		return (( this.Deck.length + this.DiscardPile.length ) > 0 );
	}

	MakeDeck() {  // 山札がなければ作る
		this.DiscardPile.shuffle();
		this.Deck.copyfrom( this.DiscardPile );
		this.DiscardPile = [];
	}

	LookDeckTopCard() {  /* カード移動基本操作 */
		if ( !this.Drawable() ) return undefined;
		if ( this.Deck.IsEmpty() ) this.MakeDeck();
		return this.Deck[0];
	}

	GetDeckTopCard() {  /* カード移動基本操作 */
		if ( !this.Drawable() ) return undefined;
		if ( this.Deck.IsEmpty() ) this.MakeDeck();
		return this.Deck.shift();
	}

	DrawCards(n) {  /* カード移動複合操作 */
		let player = this;
		return MyAsync( function*() {
			if ( n <= 0 ) {
				yield Promise.resolve( [] );
				return;
			}

			let DrawedCardIDs = [];
			let i = 0;
			for ( i = 0; i < n; i++ ) {
				if ( !player.Drawable() ) break;
				DrawedCardIDs.push( player.LookDeckTopCard().card_ID );
				player.AddToHandCards( player.GetDeckTopCard() );
			}
			FBref_chat.push( `${player.name}が${i}枚カードを引きました。` );
			yield FBref_Players.child( player.id ).update( {
				HandCards   : player.HandCards,
				Deck        : player.Deck,
				DiscardPile : player.DiscardPile,
			} );
			yield Promise.resolve( DrawedCardIDs );
		});
	}


	RevealDeckTop(n) {  /* カード移動複合操作 */
		let player = this;
		return MyAsync( function*() {
			if ( n <= 0 ) {
				yield Promise.resolve( [] );
				return;
			}

			let RevealedCardIDs = [];

			for ( let i = 0; i < n; i++ ) {
				if ( !player.Drawable() ) break;
				RevealedCardIDs.push( player.LookDeckTopCard().card_ID );
				player.AddToOpen( player.GetDeckTopCard() );
			}

			yield FBref_Players.child( player.id ).update( {
				Deck        : player.Deck,
				DiscardPile : player.DiscardPile,
				Open        : player.Open,
			} );

			let card_names_jp = [];
			RevealedCardIDs.forEach( card_ID =>
				card_names_jp.push( Cardlist[ Game.LookCardWithID( card_ID ).card_no ].name_jp ) );
			FBref_chat.push( `${player.name}が山札から（${card_names_jp.join('，')}）を公開しました。` );

			yield Promise.resolve( RevealedCardIDs );
		});
	}



	// 手札をすべて捨て札にする
	DiscardAll() {  /* カード移動複合操作 */
		FBref_chat.push( `${this.name}が${this.HandCards.length}枚のカードを捨て札にしました。` );
		this.HandCards.forEach( card => this.AddToDiscardPile( card ) );
		this.HandCards = [];
		return FBref_Players.child( this.id ).update( {
			HandCards   : this.HandCards,
			DiscardPile : this.DiscardPile,
		});
	}







	MoveHandCardTo( place, card_ID, Game, log, face ) {
		const player = this;

		if ( !player.GetCopyOfAllCards()
				.map( card => Number( card.card_ID ) )
				.includes( Number(card_ID) ) )
		{
			throw new Error(`@Game.MoveHandCardTo:
				the card is not ${player.name}'s card. (card_ID = ${card_ID})`);
			return Promise.reject();
		}

		const card = Game.LookCardWithID( card_ID );
		if ( log ) {
			let msg = `${player.name}が「${Cardlist[ card.card_no ].name_jp}」を`;
			switch (place) {
				case 'PlayArea'    : msg += "場に出しました。"; break;
				case 'Aside'       : msg += "脇に置きました。"; break;
				case 'DiscardPile' : msg += "捨て札にしました。"; break;
				case 'Deck'        : msg += "山札に戻しました。"; break;
				case 'HandCards'   : msg += "手札に加えました。"; break;
				default : break;
			}
			FBref_chat.push( msg );
		}

		if ( face == 'up' )  Game.FaceUpCard( card_ID );

		player[`AddTo${place}`]( Game.GetCardWithID( card_ID ) );
		return FBref_Players.child( player.id ).set( player );
	}


	/* カード移動複合操作 （場に出す） */
	Play         ( card_ID, Game, log = false, face = 'default' ) {
		return this.MoveHandCardTo( 'PlayArea'   , card_ID, Game, log, face );
	}

	/* カード移動複合操作 （脇に置く） */
	SetAside     ( card_ID, Game, log = true,  face = 'default' ) {
		return this.MoveHandCardTo( 'Aside'      , card_ID, Game, log, face );
	}

	/* カード移動複合操作 （捨て札にする） */
	Discard      ( card_ID, Game, log = true,  face = 'default' ) {
		return this.MoveHandCardTo( 'DiscardPile', card_ID, Game, log, face );
	}

	/* カード移動複合操作 （山札に戻す） */
	PutBackToDeck( card_ID, Game, log = true,  face = 'default' ) {
		return this.MoveHandCardTo( 'Deck'       , card_ID, Game, log, face );
	}

	/* カード移動複合操作 （手札に加える） */
	PutIntoHand  ( card_ID, Game, log = true,  face = 'default' ) {
		return this.MoveHandCardTo( 'HandCards'  , card_ID, Game, log, face );
	}

	/* カード移動複合操作 （公開する） */
	Reveal       ( card_ID, Game, log = true,  face = 'default' ) {
		return this.MoveHandCardTo( 'Open'       , card_ID, Game, log, face );
	}





	// 手札を公開（その場で表にする）
	FaceUpAllHandCards( Game ) {
		const player = this;
		return MyAsync( function*() {
			yield player.HandCards.AsyncEach( card => Game.FaceUpCard( card.card_ID ) );

			yield FBref_Players.child( `${player.id}/HandCards` ).set( player.HandCards );
			let card_names_jp = [];
			player.HandCards.forEach( card =>
				card_names_jp.push( Cardlist[ card.card_no ].name_jp ) );

			FBref_chat.push( `${player.name}は手札（${card_names_jp.join('，')}）を公開しました。` );
		})
	}






	CleanUp() {  /* カード移動複合操作 */
		let DiscardCardIDs = [];

		this.HandCards
			.map( card => card.card_ID )
			.appendTo( DiscardCardIDs );

		[].concat( this.PlayArea, this.Aside )
			.filter( card => card.remain_in_play === 0 )
			.map( card => card.card_ID )
			.appendTo( DiscardCardIDs );

		DiscardCardIDs.forEach( card_ID => this.Discard( card_ID, Game, false ) );

		// draw 5 cards
		for ( let i = 0; i < 5; ++i ) {
			this.AddToHandCards( this.GetDeckTopCard() );
		}

		this.TurnCount++;
	}



	SumUpVP() {
		const DeckAll = this.GetCopyOfAllCards();
		const VictoryCards = 
			DeckAll.filter( card => IsVictoryCard( Cardlist, card.card_no ) );

		this.VPtotal = 0;

		this.VPtotal += this.VPtoken;

		// 呪い
		this.VPtotal -=
			DeckAll.filter( card => ( Cardlist[ card.card_no ].name_eng == 'Curse' ) ).length;

		// 得点固定の勝利点カードの合計
		VictoryCards.forEach( card => { this.VPtotal += Number( Cardlist[ card.card_no ].VP ) });

		// 庭園 : デッキ枚数 ÷ 10 点
		this.VPtotal +=
			Math.floor( DeckAll.length / 10 )
			* VictoryCards.filter( card => ( Cardlist[ card.card_no ].name_eng == 'Gardens' ) ).length;


		// 公爵 : 公領1枚につき1点
		this.VPtotal +=
			VictoryCards.filter( card => ( Cardlist[ card.card_no ].name_eng == 'Duchy' ) ).length
			* VictoryCards.filter( card => ( Cardlist[ card.card_no ].name_eng == 'Duke' ) ).length;

		// ブドウ園 : アクションカード3枚につき1点
		this.VPtotal +=
			Math.floor( DeckAll.filter( card => IsActionCard( Cardlist, card.card_no ) ).length / 3 )
			* VictoryCards.filter( card => ( Cardlist[ card.card_no ].name_eng == 'Vineyard' ) ).length;

		// 品評会 : 異なる名前のカード5枚につき2勝利点
		this.VPtotal +=
			2 * Math.floor(DeckAll.uniq( card => Cardlist[card.card_no].name_eng ).length / 5　)
			* VictoryCards.filter( card => ( Cardlist[ card.card_no ].name_eng == 'Fairgrounds' ) ).length;

		 // シルクロード : 勝利点カード4枚につき1点
		this.VPtotal +=
			Math.floor( VictoryCards.length / 4 )
			* VictoryCards.filter( card => ( Cardlist[ card.card_no ].name_eng == 'Silk Road' ) ).length;

		// 封土 : 銀貨3枚につき1点
		this.VPtotal +=
			Math.floor( DeckAll.filter( card => ( Cardlist[ card.card_no ].name_eng == 'Silver' ) ).length / 3 )
			* VictoryCards.filter( card => ( Cardlist[ card.card_no ].name_eng == 'Feodum' ) ).length;

		// 遠隔地 : 酒場マットの上にあれば4点，そうでなければ0点
		// this.VPtotal +=
		// 	this.TavernMat
		// 	.filter( card => ( Cardlist[ card.card_no ].name_eng == 'Distant Lands' ) )
		// 	.length * 4;

		// Castles

		// landmark cards
	}

}


