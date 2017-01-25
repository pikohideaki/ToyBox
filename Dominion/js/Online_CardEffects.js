

let CardEffect     = {};  /* library of card effect functions */
let AttackEffect   = {};  /* library of attack card effect functions */
let ReactionEffect = {};  /* library of reaction card effect functions */

let Resolve        = {};  
let GenFuncs       = {};


$( function() {
	$('.OtherPlayers-wrapper').on( 'click', '.OtherPlayer_Buttons .ok.waiting_for_confirmation',
		() => Resolve['confirm_revealed_reaction']()
	);
});



function* GetCardEffect( playing_card_no, playing_card_ID ) {
	const playing_Card = Cardlist[ playing_card_no ];
	FBref_chat.push( `${Game.player().name}が「${playing_Card.name_jp}」を使用しました。` );



	let Monitor_FBref_SignalReactionEnd_on = function () {
		return FBref_SignalReactionEnd.set(false)  /* reset */
		.then( function() {
			FBref_SignalReactionEnd.on( 'value', function(snap) {
				if ( snap.val() ) Resolve['ReactionEnd']();
			} )
		} );
	}


	// アタックカードならまずリアクションカードの解決
	if ( IsAttackCard( Cardlist, playing_card_no ) ) {
		yield FBref_Message.set( 'リアクションカードを公開するプレイヤーがいないか待っています。' );
		for ( let id = Game.NextPlayerID(); id != Game.whose_turn_id; id = Game.NextPlayerID(id) ) {

			// Player[id] がリアクションスキップオプションがオンで手札にリアクションカードがない場合
			if ( Game.Settings.SkipReaction[id] && !Game.Players[id].HasReactionCard() ) continue;

			/* リアクションカードを公開するかどうかはアクションカード1枚ごとに決めてよい */
			yield FBref_Game.child(`TurnInfo/Revealed_Moat/${id}`).set(false);  /* reset */
			yield SendSignal( id, { listen_reaction : true } );
			yield Monitor_FBref_SignalReactionEnd_on();
			yield FBref_SignalRevealReaction.set(false);  /* reset */
			FBref_SignalRevealReaction.on( 'value', function(snap) {
				if ( snap.val() == 'waiting_for_confirmation' ) {
					MyAsync( function*() {
						Show_OKbtn_OtherPlayer( id, 'waiting_for_confirmation' );
						yield new Promise( resolve => Resolve['confirm_revealed_reaction'] = resolve );
						Hide_OKbtn_OtherPlayer( id, 'waiting_for_confirmation' );
						yield FBref_SignalRevealReaction.set('confirmed');
					} );
				}
			} );
			yield new Promise( resolve => Resolve['ReactionEnd'] = resolve );

			FBref_SignalReactionEnd.off();
			FBref_SignalRevealReaction.off();
		}
	}

	// このターンにプレイしたアクションカードの枚数 （for 共謀者）
	if ( IsActionCard( Cardlist, playing_card_no ) ) {
		Game.TurnInfo.played_actioncards_num++;
	}

	Game.TurnInfo.action += playing_Card.action;
	Game.TurnInfo.buy    += playing_Card.buy;
	Game.TurnInfo.coin   += playing_Card.coin;
	Game.player().DrawCards( playing_Card.draw_card );

	let updates = {};
	updates['TurnInfo'] = Game.TurnInfo;
	updates[`Players/${Game.player().id}`] = Game.player();
	yield FBref_Game.update( updates );

	const playing_card_name = Cardlist[ playing_card_no ].name_eng;
	switch ( playing_card_name ) {
		case 'Copper' :  // 銅細工師の効果
			Game.TurnInfo.coin += Game.TurnInfo.add_copper_coin;
			yield FBref_Game.child('TurnInfo/coin').set( Game.TurnInfo.coin );
			break;

		default :
			yield MyAsync( CardEffect[ playing_card_name ], playing_card_ID, playing_card_no );
			break;
	}
}









function AddAvailableToSupplyCardIf( conditions ) {
	$('.SupplyArea').find('.card').each( function() {
		const card_no = $(this).attr('data-card_no');
		// const card_ID = $(this).attr('data-top_card_ID');
		const card = Cardlist[ card_no ];
		if ( $(this).attr('data-card_num_of_remaining') <= 0 ) return;
		if ( conditions( card, card_no ) ) $(this).addClass('available');
	} );
}


// 確認ボタン
function AcknowledgeButton_Me() {
	return MyAsync( function*() {
		$('.action_buttons').append( MakeHTML_button( 'acknowledge', 'OK' ) );
		yield new Promise( resolve => Resolve['acknowledge'] = resolve );
		$('.action_buttons .acknowledge').remove();  /* 完了ボタン消す */
	});
}

function AcknowledgeButton_OtherPlayer( player_id ) {
	return MyAsync( function*() {
		$(`.OtherPlayer[data-player_id=${player_id}] .OtherPlayer_Buttons`)
			.append( MakeHTML_button( 'acknowledge_other_player', 'OK' ) );

		yield new Promise( resolve => Resolve['acknowledge_other_player'] = resolve );

		$(`.OtherPlayer[data-player_id=${player_id}] .OtherPlayer_Buttons .acknowledge_other_player`)
			.remove();  /* 完了ボタン消す */
	});
}
$( function() {
	$('.action_buttons').on( 'click', '.acknowledge',
		() => Resolve['acknowledge']() );
	$('.action_buttons').on( 'click', '.acknowledge_other_player',
		() => Resolve['acknowledge_other_player']() );
} );


// function Show_OKbtn_OtherPlayer( player_id, classes ) {
// 	let $ok_button = $(`.OtherPlayer[data-player_id=${player_id}] .OtherPlayer_Buttons .ok`);
// 	$ok_button.show();
// 	$ok_button.addClass( classes );
// }

// function Hide_OKbtn_OtherPlayer( player_id, classes ) {
// 	let $ok_button = $(`.OtherPlayer[data-player_id=${player_id}] .OtherPlayer_Buttons .ok`);
// 	$ok_button.hide();
// 	$ok_button.removeClass( classes );
// }



/* 他のプレイヤーが終了時に送るEndシグナルを監視 */
// function Monitor_FBref_SignalAttackEnd_on( card_name ) {
// 	return FBref_SignalAttackEnd.set(false)  /* reset */
// 	.then( function() {
// 		FBref_SignalAttackEnd.on( 'value', function(snap) {
// 			if ( snap.val() ) Resolve[ card_name ]();
// 		} )
// 	} );
// }

// function Monitor_FBref_SignalAttackEnd_off() {
// 	FBref_SignalAttackEnd.off();
// }



// function Monitor_FBref_SignalRevealReaction_on() {
// 	return FBref_SignalRevealReaction.set(false)  /* reset */
// 	.then( function() {
// 		FBref_SignalRevealReaction.on( 'value', function(snap) {
// 			if ( snap.val() ) Resolve['RevealedReaction']();
// 		} )
// 	} );
// }




// 共通操作






// 手札の廃棄
function WaitForTrashingHandCard() {
	return new Promise( resolve => Resolve['TrashHandCard'] = resolve )
}

$( function() {
	$('.HandCards').on( 'click', '.card.Trash', function() {
		const clicked_card_ID = $(this).attr('data-card_ID');

		Game.TrashCardByID( clicked_card_ID );

		FBref_Game.update( {
			[`Players/${Game.player().id}/HandCards`] : Game.player().HandCards,
			TrashPile : Game.TrashPile,
		} )
		.then( () => Resolve['TrashHandCard']( clicked_card_ID ) );  // 再開
	} );

	$('.action_buttons').on( 'click', '.Trash_Done', function() {
		Resolve['DiscardHandCard']( 'Trash_Done' );  // 再開
	} );
});




// 手札を捨て札にする
function WaitForDiscaringHandCard() {
	return new Promise( resolve => Resolve['DiscardHandCard'] = resolve )
}

$( function() {
	$('.HandCards').on( 'click', '.card.Trash', function() {
		const clicked_card_ID = $(this).attr('data-card_ID');

		Game.player().AddToDiscardPile( Game.GetCardByID( clicked_card_ID ) );

		FBref_Players.child( Game.player().id ).update( {
			HandCards   : Game.player().HandCards,
			DiscardPile : Game.player().DiscardPile,
		} )
		.then( () => Resolve['DiscardHandCard']( clicked_card_ID ) );  // 再開
	} );

	$('.action_buttons').on( 'click', '.Discard_Done', function() {
		Resolve['DiscardHandCard']( 'Discard_Done' );  // 再開
	} );
});





// 手札を捨て札にする(MyArea)
function WaitForDiscaringMyHandCard() {
	return new Promise( resolve => Resolve['DiscardMyHandCard'] = resolve )
}

$( function() {
	$('.MyHandCards').on( 'click', '.card.Discard', function() {
		const clicked_card_ID = $(this).attr('data-card_ID');

		Game.Me().AddToDiscardPile( Game.GetCardByID( clicked_card_ID ) );

		FBref_Players.child( myid ).update( {
			HandCards   : Game.Me().HandCards,
			DiscardPile : Game.Me().DiscardPile,
		} )
		.then( () => Resolve['DiscardMyHandCard']( clicked_card_ID ) );  // 再開
	} );
});





// 手札を山札に戻す(MyArea)
function WaitForPuttingBackMyHandCard() {
	return new Promise( resolve => Resolve['PutBackMyHandCard'] = resolve )
}
$( function() {
	$('.MyHandCards').on( 'click', '.card.PutBack', function() {
		const clicked_card_ID = $(this).attr('data-card_ID');

		let card = Game.GetCardByID( clicked_card_ID );
		if ( $(this).hasClass('face') ) card.face = true;
		Game.Me().PutBackToDeck( card );

		FBref_Players.child( myid ).update( {
			HandCards : Game.Me().HandCards,
			Deck      : Game.Me().Deck,
		} )
		.then( () => Resolve['PutBackMyHandCard']() );  // 再開
	} );
});









// サプライから獲得

function Get$SupplyAreaWithConditions( conditions, additional_piles = false ) {
	let $piles = $('.SupplyArea').find('.cards');
	if ( additional_piles ) {
		$piles = $('.SupplyArea,.additional-piles').find('.cards');
	}
	return $piles.filter( function() {
		const card_no = $(this).attr('data-card_no');
		const card = Cardlist[ card_no ];
		if ( $(this).attr('data-card_num_of_remaining') <= 0 ) return false;
		if ( conditions( card, card_no ) ) return true;
	});
}

function GainSupplyCardIf( conditions ) {
	$('.SupplyArea').find('.card').each( function() {
		const card_no = $(this).attr('data-card_no');
		// const card_ID = $(this).attr('data-top_card_ID');
		const card = Cardlist[ card_no ];
		if ( $(this).attr('data-card_num_of_remaining') <= 0 ) return;
		if ( conditions( card, card_no ) ) $(this).addClass('available');
	} );
}

function WaitForGainSupplyCard() {
	return new Promise( resolve => Resolve['GainSupplyCard'] = resolve )
}

$( function() {
	$('.SupplyArea').on( 'click', '.card.GainSupplyCard', function() {
		let place_to_gain = 'DiscardPile';
		if ( $(this).hasClass('AddToDiscardPile') ) {
			place_to_gain = 'DiscardPile';
		}
		if ( $(this).hasClass('AddToHandCards') ) {
			place_to_gain = 'HandCards';
		}
		if ( $(this).hasClass('PutBackToDeck') ) {
			place_to_gain = 'Deck';
		}

		const clicked_card_name_eng = $(this).attr('data-card-name-eng');
		const clicked_card = Game.Supply.byName(clicked_card_name_eng).LookTopCard();
		const clicked_card_ID = clicked_card.card_ID;

		GainCard( card_name_eng, place_to_gain )
		.then( () => Resolve['GainSupplyCard']() );
	} );
});

