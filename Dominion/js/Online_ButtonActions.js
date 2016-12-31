$( function() {



	/* buttons */
	$('.SortHandCards').click( function() {
		Game.Players[myid].SortHandCards();
		FBref_Game.child(`Players/${myid}/HandCards`).set( Game.Players[myid].HandCards );
	});

	$('.MoveToBuyPhase').click( function() {
		// Game.phase = 'BuyPhase';
		// FBref_Game.child('phase').set( Game.phase );
		MovePhase( 'BuyPhase' );
	});

	$('.MoveToNextPlayer').click( function() {
		Game.MoveToNextPlayer();
	});

	$('.logallcards').click( function() {
		let AllCards = Game.GetAllCards();
		// console.log( AllCards );
		// AllCardsNo = AllCards.map( a => a.card_no ).sort();
		AllCardsNo = AllCards.map( a => a.card_no ).uniq().sortNumeric();
		console.log( AllCardsNo );
	});


	// カードリスト
	$('.card_view').click( function() {
		$('.CardView-wrapper').fadeToggle();
		$card = $('.CardView_zoom .card_biggest');
		$card.width( $card.height() * 14.9 / 23 );
	});

	$(window).resize( function() {
		$card = $('.CardView_zoom .card_biggest');
		$card.width( $card.height() * 14.9 / 23 );
	} );

	// ESCで閉じる
	$(document).keydown( function(e) {
		if ( e.keyCode == 27 ) {  // ESC 入力
			$('.CardView-wrapper').fadeOut();
		}
	});


	// $('.main').on( 'click', '.zoom_card', function(event) {
	// 	event.stopImmediatePropagation();
	// 	console.log( $(this).parent().attr('data-card_no') );
	// });

	// $('.HandCards').click( function() { console.log('HandCards'); } );
	// $('.TurnAction').click( function() { console.log('TurnAction'); } );
	// $('.main').click( function() { console.log('main'); } );



	// $('#UseAllTreasure').click( function() {
	// 	let Me = Game.player();
	// 	for ( let i = Me.HandCards.length - 1; i >= 0; --i ) {
	// 		let Card = Me.HandCards[i];
	// 		if ( IsTreasureCard( Cardlist, Card.card_no ) ) {
	// 			Game.UseCard( Card.card_no, Card.card_ID );
	// 			Me.AddToPlayArea( Game.GetCardByID( Card.card_ID ) );
	// 		}
	// 	}
	// });

	// $('.Common-Area').on( 'click', '.card-cost-coin', function() {
	// 	alert( 'info ' + $(this).parent().attr('data-card_no') );
	// });



	$('.CardAreaOfPlayer.HandCards').on( 'click', '.card.use-this', function() {
		Game.UseCard( $(this).attr('data-card_no'), $(this).attr('data-card_ID') );
	});





	$('.SupplyArea').on( 'click', '.card.BuyCard', function() {
		const clicked_pile_num = $(this).children('.card-num-of-remaining').html();
		if ( clicked_pile_num <= 0 ) {
			alert( 'そのサプライは空です。' );
			return;
		}

		if ( Game.TurnInfo.buy <= 0 ) {
			alert( 'これ以上購入できません。' );
			return;
		}

		const clicked_card_name_eng = $(this).attr('data-card-name-eng');
		const clicked_card = Game.Supply.byName(clicked_card_name_eng).LookTopCard();
		const clicked_card_no = clicked_card.card_no;
		const clicked_card_ID = clicked_card.card_ID;
		const Card = Cardlist[ clicked_card_no ];
		if ( Card.cost > Game.TurnInfo.coin ) {
			alert( 'お金が足りません。' );
			return;
		}
		Game.player().AddToDiscardPile( Game.GetCardByID( clicked_card_ID ) );
		FBref_Room.child('chat').push( `${Game.player().name}が「${Card.name_jp}」を購入しました。` );

		let updates = {};
		updates[ `Players/${Game.whose_turn_id}/DiscardPile` ] = Game.player().DiscardPile;
		updates['Supply'] = Game.Supply;
		Game.TurnInfo.buy--;
		updates['TurnInfo/buy' ] = Game.TurnInfo.buy;
		Game.TurnInfo.coin -= Card.cost;
		updates['TurnInfo/coin'] = Game.TurnInfo.coin;
		if ( Game.phase == 'BuyPhase' ) {  // 一度購入を始めたら以降財宝カードを追加で使用することはできない
			Game.phase = 'BuyPhase_GetCard';
			updates['phase'] = Game.phase;
		}
		FBref_Game.update( updates );
	});


	$('.chat-wrapper .chat_enter').click( function() {
		const msg = $('.chat-wrapper .chat_textbox').val();
		FBref_Room.child('chat').push( `<font color='red'>${Game.Players[myid].name}</font> : ${msg}` );
		$('.chat-wrapper .chat_textbox').val('');
	});



	$('.CardView_list').on( {
		mouseenter : function(){ $('.CardView_zoom .card_biggest').attr('data-card_no', $(this).attr('data-card_no') ) },
		click      : function(){ $('.CardView_zoom .card_biggest').attr('data-card_no', $(this).attr('data-card_no') ) },
		// mouseleave : function(){  },
	}, '.card_biggest' );

	$('.chbox_SkipReaction').change( function() {
		FBref_Settings.child(`SkipReaction/${myid}`).set( $(this).prop('checked') );
	})


});
