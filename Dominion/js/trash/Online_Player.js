

/* class */
function CPlayer() {
	this.name        = "";
	this.Deck        = [];
	this.DiscardPile = [];
	this.HandCards   = [];
	this.PlayArea    = [];
	this.Aside       = [];
	this.VPtotal     = 0;
}


/* methods */
CPlayer.prototype.InitByObj = function( PlayerObj ) {
	this.name        =   PlayerObj.name;
	this.Deck        = ( PlayerObj.Deck        || [] );
	this.DiscardPile = ( PlayerObj.DiscardPile || [] );
	this.HandCards   = ( PlayerObj.HandCards   || [] );
	this.PlayArea    = ( PlayerObj.PlayArea    || [] );
	this.Aside       = ( PlayerObj.Aside       || [] );
	this.VPtotal     = ( PlayerObj.VPtotal     || 0  );
};



CPlayer.prototype.InitDeck = function( myname ) {
	let self = this;
	FBref_Room.once( 'value', function( FBsnapshot ) {
		let FBobj_Game = FBsnapshot.val().Game;
		let Supply = new CSupply();
		Supply.InitByObj( FBobj_Game.Supply );

		/* get 7 Coppers from supply */
		for ( let i = 0; i < 7; ++i ) {
			self.Deck.push( Supply.byName('Copper').GetTopCard() );
		}
		/* get 3 Estates from supply */
		for ( let i = 0; i < 3; ++i ) {
			self.Deck.push( Supply.byName('Estate').GetTopCard() );
		}

		self.Deck.shuffle();
		self.DrawCards(5);
		self.name = myname;

		let updates = {};
		updates['Players/' + myname] = self;
		updates['Supply']            = Supply;
		FBref_Game.update( updates );
	} );
};



/* methods of CPlayer */

CPlayer.prototype.SortHandCards = function() {
	let sorted = this.HandCards.sort( function(a,b) { return a.card_no - b.card_no; } );
	let action_cards   = [];
	let treasure_cards = [];
	let victory_cards  = [];
	while ( sorted.length > 0 ) {
		let elm = sorted.shift();
		if ( IsActionCard( Cardlist, elm.card_no ) ) {
			action_cards.push( elm );
		} else if ( IsTreasureCard( Cardlist, elm.card_no ) ) {
			treasure_cards.push( elm );
		} else if ( IsVictoryCard( Cardlist, elm.card_no ) ) {
			victory_cards.push( elm );
		}
	}
	this.HandCards = [].concat( action_cards, treasure_cards, victory_cards );
};



/* Deck */
CPlayer.prototype.GetDeckTopCard = function() {  /* カード移動基本操作 */
	if ( !this.Drawable() ) return false;
	if ( this.Deck.length === 0 ) {
		this.DiscardPile.shuffle();
		this.Deck.copyfrom( this.DiscardPile );
		this.DiscardPile = [];
	}
	let card = this.Deck.shift();
	FBref_Game.child( 'Players/' + this.name + '/Deck' ).set( this.Deck );
	return card;
};

CPlayer.prototype.PutBackToDeck = function( card ) {  /* カード移動基本操作 */
	this.Deck.unshift( card );
	FBref_Game.child( 'Players/' + this.name + '/Deck' ).set( this.Deck );
};


/* HandCards */
CPlayer.prototype.AddToHandCards = function( card ) {  /* カード移動基本操作 */
	/* add and sort */
	this.HandCards.push( card );
	this.SortHandCards();
	FBref_Game.child( 'Players/' + this.name + '/HandCards' ).set( this.HandCards );
};

/* DiscardPile*/
CPlayer.prototype.AddToDiscardPile = function( card ) {  /* カード移動基本操作 */
	this.DiscardPile.push( card );
	FBref_Game.child( 'Players/' + this.name + '/DiscardPile' ).set( this.DiscardPile );
};

/* PlayArea */
CPlayer.prototype.AddToPlayArea = function( card ) {  /* カード移動基本操作 */
	this.PlayArea.push( card );
	FBref_Game.child( 'Players/' + this.name + '/PlayArea' ).set( this.PlayArea );
};

/* Aside */
CPlayer.prototype.AddToAside = function( card ) {  /* カード移動基本操作 */
	this.Aside.push( card );
	FBref_Game.child( 'Players/' + this.name + '/Aside' ).set( this.Aside );
};






// CPlayer.prototype.MoveHandCardToPlayArea = function( in_handcard_id ) {  /* カード移動複合操作 */
// 	this.AddToPlayArea( this.HandCards.remove( in_handcard_id ) );
// };
// CPlayer.prototype.MoveHandCardToDiscardPile = function( in_handcard_id ) {
// 	this.AddToDiscardPile( this.HandCards.remove( in_handcard_id ) );
// };
// CPlayer.prototype.Discard = function( in_handcard_id ) {
// 	this.MoveHandCardToDiscardPile( in_handcard_id );
// };




/* draw */
CPlayer.prototype.Drawable = function() {
	return (( this.Deck.length + this.DiscardPile.length ) > 0 );
};

CPlayer.prototype.DrawCards = function(n) {  /* カード移動複合操作 */
	for ( let i = 0; i < n; i++ ) {
		let deck_top_card = this.GetDeckTopCard();
		if ( deck_top_card ) this.AddToHandCards( deck_top_card );
	}
};









CPlayer.prototype.HaveReactionCard = function() {
	for ( let i = 0; i < this.HandCards.length; i++ ) {
		if ( IsReactionCard( Cardlist, this.HandCards[i].card_no ) ) return true;
	}
	return false;
};

CPlayer.prototype.HaveActionCard = function() {
	for ( let i = 0; i < this.HandCards.length; i++ ) {
		if ( IsActionCard( Cardlist, this.HandCards[i].card_no ) ) return true;
	}
	return false;
};







CPlayer.prototype.CleanUp = function() {
	let CardsToDiscard = [].concat(
			  this.HandCards
			, this.PlayArea
			, this.Aside
		);
	Array.prototype.push.apply( this.DiscardPile, CardsToDiscard );
	this.HandCards = [];
	this.PlayArea  = [];
	this.Aside     = [];

	this.DrawCards(5);
	FBref_Game.child('Players/' + this.name).update( this );
};



CPlayer.prototype.GetDeckAll = function() {
	return [].concat(
			  this.Deck
			, this.DiscardPile
			, this.HandCards
			, this.PlayArea
			, this.Aside
		);
};



CPlayer.prototype.SumUpVP = function() {
	let DeckAll = this.GetDeckAll();
	this.VPtotal = 0;
	for ( let i = 0; i < DeckAll.length; i++ ) {
		this.VPtotal += Cardlist[ DeckAll[i].card_no ].VP;
	}
	return Number( this.VPtotal );
};












