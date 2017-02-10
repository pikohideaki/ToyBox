

let CardEffect     = {};  /* library of card effect functions */
let AttackEffect   = {};  /* library of attack card effect functions */
let ReactionEffect = {};  /* library of reaction card effect functions */

let Resolve        = {};  
let GenFuncs       = {};



function* GetCardEffect( playing_card_ID ) {
	const playing_card_no = Game.LookCardWithID( playing_card_ID ).card_no;
	const playing_Card = Cardlist[ playing_card_no ];
	FBref_chat.push( `${Game.player().name}が「${playing_Card.name_jp}」を使用しました。` );


	// アタックカードならまずリアクションカードの解決
	if ( IsAttackCard( Cardlist, playing_card_no ) ) {
		yield FBref_Message.set( 'リアクションカードを公開するプレイヤーがいないか待っています。' );
		for ( let id = Game.NextPlayerID(); id != Game.whose_turn_id; id = Game.NextPlayerID(id) ) {

			// Player[id] がリアクションスキップオプションがオンで手札にリアクションカードがない場合
			if ( Game.Settings.SkipReaction[id] && !Game.Players[id].HasReactionCard() ) continue;

			/* リアクションカードを公開するかどうかはアクションカード1枚ごとに決めてよい */
			yield FBref_Game.child(`TurnInfo/Revealed_Moat/${id}`).set(false);  /* reset */
			yield SendSignal( id, { listen_reaction : true } );

			yield FBref_SignalReactionEnd.set(false);  /* reset */
			FBref_SignalReactionEnd.on( 'value', function(snap) {
				if ( snap.val() ) Resolve['ReactionEnd']();
			} )

			yield FBref_SignalRevealReaction.set(false);  /* reset */
			FBref_SignalRevealReaction.on( 'value', function(snap) {
				if ( snap.val() == 'waiting_for_confirmation' ) {
					AcknowledgeButton_OtherPlayer(id)
					.then( () => FBref_SignalRevealReaction.set('confirmed') );
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
	yield MyAsync( CardEffect[ playing_card_name ], playing_card_ID, playing_card_no );
	// switch ( playing_card_name ) {
	// 	case 'Copper' :  // 銅細工師の効果
	// 		Game.TurnInfo.coin += Game.TurnInfo.add_copper_coin;
	// 		yield FBref_Game.child('TurnInfo/coin').set( Game.TurnInfo.coin );
	// 		break;

	// 	default :
	// 		break;
	// }
}









function AddAvailableToSupplyCardIf( conditions ) {
	$('.SupplyArea').find('.card').each( function() {
		const card_no = Number( $(this).attr('data-card_no') );
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
			.append( MakeHTML_button( 'acknowledge_others', 'OK' ) );

		yield new Promise( resolve => Resolve['acknowledge_others'] = resolve );

		$(`.OtherPlayer[data-player_id=${player_id}] .OtherPlayer_Buttons .acknowledge_others`)
			.remove();  /* 完了ボタン消す */
	});
}
$( function() {
	$('.action_buttons').on( 'click', '.acknowledge', () => Resolve['acknowledge']() );
	$('.OtherPlayers-wrapper')
	  .on( 'click', '.OtherPlayer_Buttons .acknowledge_others', () => Resolve['acknowledge_others']() );
} );





// 共通操作



// 手札の選択
function WaitForSelectingHandCards() {
	return MyAsync( function*() {
		$('.HandCards').children('.card').addClass('SelectHandCards pointer');
		yield AcknowledgeButton_Me();
		$('.HandCards').children('.card').removeClass('SelectHandCards pointer');

		const SelectedCardsID = [];
		$('.HandCards').children('.card.selected')
			.each( function() { SelectedCardsID.push( Number( $(this).attr('data-card_ID') ) ) } );

		yield Promise.resolve( SelectedCardsID );
	});
}

$( function() {
	$('.HandCards').on( 'click', '.card.SelectHandCards', function() {
		$(this).toggleClass('selected');
		// $(this).effect( 'highlight', "{ 'color' : 'green' }", 500 );
	} );
});











// 手札の廃棄
function WaitForMovingHandCard( operation, MyArea, conditions = (card_no,card_ID) => true, face = 'default' ) {
	const OnesHandCard = ( MyArea ? 'MyHandCard' : 'HandCard' );
	const player = ( MyArea ? Game.Me() : Game.player() );

	return MyAsync( function*() {
		const $handcards
		  = $( `.${OnesHandCard}s` ).children('.card')
			.filter( function() {
				return conditions( Number( $(this).attr('data-card_no') ), Number( $(this).attr('data-card_ID') ) )
			} );
		$handcards.addClass( `Move${OnesHandCard} pointer` );
		const ClickedCardID_or_Done
		  = yield new Promise( resolve => Resolve[`Move${OnesHandCard}`] = resolve );
		$handcards.removeClass( `Move${OnesHandCard} pointer` );

		if ( ClickedCardID_or_Done === `Move${OnesHandCard}s_Done` ) return `Move${OnesHandCard}s_Done`;

		let Game_updates = {};

		switch ( operation ) {
			case 'Trash' :
				Game.Trash( ClickedCardID_or_Done );
				Game_updates['TrashPile'] = Game.TrashPile;
				break;

			case 'Discard' :
				Game.Discard( ClickedCardID_or_Done, player.id );
				Game_updates[`Players/${player.id}/DiscardPile`] = player.DiscardPile;
				break;

			case 'Play' :
				Game.Play( ClickedCardID_or_Done, player.id );
				Game_updates[`Players/${player.id}/PlayArea`] = player.PlayArea;
				break;

			case 'PutBackToDeck' :
				Game.PutBackToDeck( ClickedCardID_or_Done, player.id, true, face );
				Game_updates[`Players/${player.id}/Deck`] = player.Deck;
				break;
		}

		Game_updates[`Players/${player.id}/HandCards`] = player.HandCards;
		yield FBref_Game.update( Game_updates );

		yield Promise.resolve( ClickedCardID_or_Done );
	});
}

// HandCards of Game.player()
function ShowDoneButton() {
	$('.action_buttons').append( MakeHTML_button( 'MoveHandCards_Done', '完了' ) );
}
function HideDoneButton() {
	$('.action_buttons .MoveHandCards_Done').remove();
}


// MyHandCards
function ShowDoneButton_MyArea() {
	$('.MyArea .buttons').append( MakeHTML_button( 'MoveMyHandCards_Done', '完了' ) );
}
function HideDoneButton_MyArea() {
	$('.MyArea .buttons .MoveMyHandCards_Done').remove();
}


$( function() {
	// HandCards of Game.player()
	$('.HandCards').on( 'click', '.card.MoveHandCard', function() {
		Resolve['MoveHandCard']( Number( $(this).attr('data-card_ID') ) );  // 再開
	} );

	$('.action_buttons').on( 'click', '.MoveHandCards_Done', function() {
		Resolve['MoveHandCard']( 'MoveHandCards_Done' );  // 再開
		$('.action_buttons .MoveHandCards_Done').remove();  /* 完了ボタン消す */
	} );

	// MyHandCards
	$('.MyHandCards').on( 'click', '.card.MoveMyHandCard', function() {
		Resolve['MoveMyHandCard']( Number( $(this).attr('data-card_ID') ) );  // 再開
	} );

	$('.MyArea .buttons').on( 'click', '.MoveMyHandCards_Done', function() {
		Resolve['MoveMyHandCard']( 'MoveMyHandCards_Done' );  // 再開
		$('.MyArea .buttons .MoveMyHandCards_Done').remove();  /* 完了ボタン消す */
	} );
});






// 手札の廃棄
function WaitForTrashingHandCard( conditions = (card_no,card_ID) => true ) {
	return WaitForMovingHandCard( 'Trash', false, conditions );
	// return MyAsync( function*() {
	// 	const $handcards
	// 	  = $('.HandCards').children('.card')
	// 		.filter( function() {
	// 			return conditions( Number( $(this).attr('data-card_no') ), Number( $(this).attr('data-card_ID') ) )
	// 		} );

	// 	$handcards.addClass('TrashHandCard pointer');
	// 	const ClickedCardID_or_Done
	// 	  = yield new Promise( resolve => Resolve['TrashHandCard'] = resolve );
	// 	$handcards.removeClass('TrashHandCard pointer');

	// 	if ( ClickedCardID_or_Done === 'TrashHandCard_Done' ) return 'TrashHandCard_Done';

	// 	Game.Trash( ClickedCardID_or_Done );

	// 	yield FBref_Game.update( {
	// 		[`Players/${Game.player().id}/HandCards`] : Game.player().HandCards,
	// 		TrashPile : Game.TrashPile,
	// 	} );

	// 	yield Promise.resolve( ClickedCardID_or_Done );
	// });
}

// function ShowTrashDoneButton() {
// 	$('.action_buttons').append( MakeHTML_button( 'TrashHandCard_Done', '完了' ) );
// }
// function HideTrashDoneButton() {
// 	$('.action_buttons .TrashHandCard_Done').remove();
// }

// $( function() {
// 	$('.HandCards').on( 'click', '.card.TrashHandCard', function() {
// 		Resolve['TrashHandCard']( Number( $(this).attr('data-card_ID') ) );  // 再開
// 	} );

// 	$('.action_buttons').on( 'click', '.TrashHandCard_Done', function() {
// 		Resolve['TrashHandCard']( 'TrashHandCard_Done' );  // 再開
// 		$('.action_buttons .TrashHandCard_Done').remove();  /* 完了ボタン消す */
// 	} );
// });





// 手札を捨て札にする
function WaitForDiscardingHandCard( conditions = (card_no,card_ID) => true ) {
	return WaitForMovingHandCard( 'Discard', false, conditions );
// 	return MyAsync( function*() {
// 		const $handcards
// 		  = $('.HandCards').children('.card')
// 			.filter( function() {
// 				return conditions( Number( $(this).attr('data-card_no') ), Number( $(this).attr('data-card_ID') ) )
// 			} );

// 		$handcards.addClass('DiscardHandCard pointer');
// 		const ClickedCardID_or_Done
// 		  = yield new Promise( resolve => Resolve['DiscardHandCard'] = resolve );
// 		$handcards.removeClass('DiscardHandCard pointer');

// 		if ( ClickedCardID_or_Done === 'DiscardHandCard_Done' ) return 'DiscardHandCard_Done';

// 		Game.Discard( ClickedCardID_or_Done );

// 		yield FBref_Players.child( Game.player().id ).update( {
// 			HandCards   : Game.player().HandCards,
// 			DiscardPile : Game.player().DiscardPile,
// 		} );

// 		yield Promise.resolve( ClickedCardID_or_Done );
// 	});
}

// function ShowDiscardDoneButton() {
// 	$('.action_buttons').append( MakeHTML_button( 'DiscardHandCard_Done', '完了' ) );
// }
// function HideDiscardDoneButton() {
// 	$('.action_buttons .DiscardHandCard_Done').remove();
// }

// $( function() {
// 	$('.HandCards').on( 'click', '.card.DiscardHandCard', function() {
// 		Resolve['DiscardHandCard']( Number( $(this).attr('data-card_ID') ) );  // 再開
// 	} );

// 	$('.action_buttons').on( 'click', '.DiscardHandCard_Done', function() {
// 		Resolve['DiscardHandCard']( 'DiscardHandCard_Done' );  // 再開
// 		$('.action_buttons .DiscardHandCard_Done').remove();  /* 完了ボタン消す */
// 	} );
// });





// 手札を捨て札にする(MyArea)
function WaitForDiscardingMyHandCard( conditions = (card_no,card_ID) => true ) {
	return WaitForMovingHandCard( 'Discard', true, conditions );
	// return MyAsync( function*() {
	// 	const $handcards
	// 	  = $('.MyHandCards').children('.card')
	// 		.filter( function() {
	// 			return conditions( Number( $(this).attr('data-card_no') ), Number( $(this).attr('data-card_ID') ) )
	// 		} );

	// 	$handcards.addClass('DiscardMyHandCard pointer');
	// 	const ClickedCardID_or_Done
	// 	  = yield new Promise( resolve => Resolve['DiscardMyHandCard'] = resolve );
	// 	$handcards.removeClass('DiscardMyHandCard pointer');

	// 	if ( ClickedCardID_or_Done === 'DiscardMyHandCards_Done' ) {
	// 		return 'DiscardMyHandCards_Done';
	// 	}

	// 	Game.Discard( ClickedCardID_or_Done, Game.Me().id );

	// 	yield FBref_Players.child( Game.Me().id ).update( {
	// 		HandCards   : Game.Me().HandCards,
	// 		DiscardPile : Game.Me().DiscardPile,
	// 	} );

	// 	yield Promise.resolve( ClickedCardID_or_Done );  // return value
	// });
}

// function ShowDiscardDoneButton_MyArea() {
// 	$('.MyArea .buttons').append( MakeHTML_button( 'DiscardMyHandCards_Done', '完了' ) );
// }
// function HideDiscardDoneButton_MyArea() {
// 	$('.MyArea .buttons .DiscardMyHandCards_Done').remove();
// }

// $( function() {
// 	$('.MyHandCards').on( 'click', '.card.DiscardMyHandCard', function() {
// 		Resolve['DiscardMyHandCard']( Number( $(this).attr('data-card_ID') ) );  // 再開
// 	} );

// 	$('.MyArea .buttons').on( 'click', '.DiscardMyHandCards_Done', function() {
// 		Resolve['DiscardMyHandCard']( 'DiscardMyHandCards_Done' );  // 再開
// 		$('.MyArea .buttons .DiscardMyHandCards_Done').remove();  /* 完了ボタン消す */
// 	} );
// });





// 手札を山札に戻す
function WaitForPuttingBackHandCard( conditions = (card_no,card_ID) => true, face = 'default' ) {
	return WaitForMovingHandCard( 'PutBackToDeck', false, conditions, face );
	// return MyAsync( function*() {
	// 	const $handcards
	// 	  = $('.HandCards').children('.card')
	// 		.filter( function() {
	// 			return conditions( Number( $(this).attr('data-card_no') ), Number( $(this).attr('data-card_ID') ) )
	// 		} );

	// 	$handcards.addClass('PutBackToDeckHandCard pointer');
	// 	const ClickedCardID_or_Done
	// 	  = yield new Promise( resolve => Resolve['PutBackToDeckHandCard'] = resolve );
	// 	$handcards.removeClass('PutBackToDeckHandCard pointer');

	// 	if ( ClickedCardID_or_Done === 'PutBackToDeckHandCards_Done' ) return 'PutBackToDeckHandCards_Done';

	// 	Game.PutBackToDeck( ClickedCardID_or_Done, Game.player().id, true, face );

	// 	yield FBref_Players.child( Game.player().id ).update( {
	// 		HandCards : Game.player().HandCards,
	// 		Deck      : Game.player().Deck,
	// 	} );

	// 	yield Promise.resolve( ClickedCardID_or_Done );  // return value
	// });
}

// function ShowPutBackToDeckDoneButton() {
// 	$('.action_buttons').append( MakeHTML_button( 'PutBackToDeckHandCards_Done', '完了' ) );
// }
// function HidePutBackToDeckDoneButton() {
// 	$('.action_buttons .PutBackToDeckHandCards_Done').remove();
// }

// $( function() {
// 	$('.HandCards').on( 'click', '.card.PutBackToDeckHandCard', function() {
// 		Resolve['PutBackToDeckHandCard']( Number( $(this).attr('data-card_ID') ) );  // 再開
// 	} );

// 	$('.action_buttons').on( 'click', '.PutBackToDeckHandCards_Done', function() {
// 		Resolve['PutBackToDeckHandCard']( 'PutBackToDeckHandCards_Done' );  // 再開
// 		$('.action_buttons .PutBackToDeckHandCards_Done').remove();  /* 完了ボタン消す */
// 	} );
// });





// 手札を山札に戻す(MyArea)
function WaitForPuttingBackMyHandCard( conditions = (card_no,card_ID) => true, face = 'default' ) {
	return WaitForMovingHandCard( 'PutBackToDeck', true, conditions, face );
	// return MyAsync( function*() {
	// 	const $handcards
	// 	  = $('.MyHandCards').children('.card')
	// 		.filter( function() {
	// 			return conditions( Number( $(this).attr('data-card_no') ), Number( $(this).attr('data-card_ID') ) )
	// 		} );

	// 	$handcards.addClass('PutBackToDeckMyHandCard pointer');
	// 	const ClickedCardID_or_Done
	// 	  = yield new Promise( resolve => Resolve['PutBackToDeckMyHandCard'] = resolve );
	// 	$handcards.removeClass('PutBackToDeckMyHandCard pointer');

	// 	if ( ClickedCardID_or_Done === 'PutBackToDeckMyHandCards_Done' ) {
	// 		return 'PutBackToDeckMyHandCards_Done';
	// 	}

	// 	Game.PutBackToDeck( ClickedCardID_or_Done, Game.Me().id, true, face );

	// 	yield FBref_Players.child( Game.Me().id ).update( {
	// 		HandCards : Game.Me().HandCards,
	// 		Deck      : Game.Me().Deck,
	// 	} );

	// 	yield Promise.resolve( ClickedCardID_or_Done );  // return value
	// });
}

// function ShowPutBackToDeckDoneButton_MyArea() {
// 	$('.MyArea .buttons').append( MakeHTML_button( 'PutBackToDeckMyHandCards_Done', '完了' ) );
// }
// function HidePutBackToDeckDoneButton_MyArea() {
// 	$('.MyArea .buttons .PutBackToDeckMyHandCards_Done').remove();
// }

// $( function() {
// 	$('.MyHandCards').on( 'click', '.card.PutBackToDeckMyHandCard', function() {
// 		Resolve['PutBackToDeckMyHandCard']( Number( $(this).attr('data-card_ID') ) );  // 再開
// 	} );

// 	$('.MyArea .buttons').on( 'click', '.PutBackToDeckMyHandCards_Done', function() {
// 		Resolve['PutBackToDeckMyHandCard']( 'PutBackToDeckMyHandCards_Done' );  // 再開
// 		$('.MyArea .buttons .PutBackToDeckMyHandCards_Done').remove();  /* 完了ボタン消す */
// 	} );
// });






// 手札を場に出す
function WaitForPlayingHandCard( conditions = (card_no,card_ID) => true ) {
	return WaitForMovingHandCard( 'Play', false, conditions );
// 	return MyAsync( function*() {
// 		const $handcards
// 		  = $('.HandCards').children('.card')
// 			.filter( function() {
// 				return conditions( Number( $(this).attr('data-card_no') ), Number( $(this).attr('data-card_ID') ) )
// 			} );

// 		$handcards.addClass('PlayHandCard pointer');
// 		const ClickedCardID_or_Done
// 		  = yield new Promise( resolve => Resolve['PlayHandCard'] = resolve );
// 		$handcards.removeClass('PlayHandCard pointer');

// 		if ( ClickedCardID_or_Done === 'PlayHandCard_Done' ) return 'PlayHandCard_Done';

// 		Game.Play( ClickedCardID_or_Done );

// 		yield FBref_Players.child( Game.player().id ).update( {
// 			HandCards : Game.player().HandCards,
// 			PlayArea  : Game.player().PlayArea,
// 		} );

// 		yield Promise.resolve( ClickedCardID_or_Done );
// 	});
}

// function ShowPlayDoneButton() {
// 	$('.action_buttons').append( MakeHTML_button( 'PlayHandCard_Done', '完了' ) );
// }
// function HidePlayDoneButton() {
// 	$('.action_buttons .PlayHandCard_Done').remove();
// }

// $( function() {
// 	$('.HandCards').on( 'click', '.card.PlayHandCard', function() {
// 		Resolve['PlayHandCard']( Number( $(this).attr('data-card_ID') ) );  // 再開
// 	} );

// 	$('.action_buttons').on( 'click', '.PlayHandCard_Done', function() {
// 		Resolve['PlayHandCard']( 'PlayHandCard_Done' );  // 再開
// 		$('.action_buttons .PlayHandCard_Done').remove();  /* 完了ボタン消す */
// 	} );
// });





// 手札を場に出す(MyArea)
function WaitForPlayingMyHandCard( conditions = (card_no,card_ID) => true ) {
	return WaitForMovingHandCard( 'Play', true, conditions );
	// return MyAsync( function*() {
	// 	const $handcards
	// 	  = $('.MyHandCards').children('.card')
	// 		.filter( function() {
	// 			return conditions( Number( $(this).attr('data-card_no') ), Number( $(this).attr('data-card_ID') ) )
	// 		} );

	// 	$handcards.addClass('PlayMyHandCard pointer');
	// 	const ClickedCardID_or_Done
	// 	  = yield new Promise( resolve => Resolve['PlayMyHandCard'] = resolve );
	// 	$handcards.removeClass('PlayMyHandCard pointer');

	// 	if ( ClickedCardID_or_Done === 'PlayMyHandCards_Done' ) {
	// 		return 'PlayMyHandCards_Done';
	// 	}

	// 	Game.Play( ClickedCardID_or_Done, Game.Me().id );

	// 	yield FBref_Players.child( Game.Me().id ).update( {
	// 		HandCards : Game.Me().HandCards,
	// 		PlayArea  : Game.Me().PlayArea,
	// 	} );

	// 	yield Promise.resolve( ClickedCardID_or_Done );  // return value
	// });
}

// function ShowPlayDoneButton_MyArea() {
// 	$('.MyArea .buttons').append( MakeHTML_button( 'PlayMyHandCards_Done', '完了' ) );
// }
// function HidePlayDoneButton_MyArea() {
// 	$('.MyArea .buttons .PlayMyHandCards_Done').remove();
// }

// $( function() {
// 	$('.MyHandCards').on( 'click', '.card.PlayMyHandCard', function() {
// 		Resolve['PlayMyHandCard']( Number( $(this).attr('data-card_ID') ) );  // 再開
// 	} );

// 	$('.MyArea .buttons').on( 'click', '.PlayMyHandCards_Done', function() {
// 		Resolve['PlayMyHandCard']( 'PlayMyHandCards_Done' );  // 再開
// 		$('.MyArea .buttons .PlayMyHandCards_Done').remove();  /* 完了ボタン消す */
// 	} );
// });







function Get$SupplyAreaWithConditions( conditions = (card,card_no) => true, additional_piles = false ) {
	let $piles = $('.SupplyArea').find('.card');
	if ( additional_piles ) {
		$piles = $('.SupplyArea,.additional-piles').find('.card');
	}
	return $piles.filter( function() {
		const card_no = Number( $(this).attr('data-card_no') );
		const card = Cardlist[ card_no ];
		if ( $(this).attr('data-card_num_of_remaining') <= 0 ) return false;
		if ( conditions( card, card_no ) ) return true;
	});
}


// サプライから獲得

function WaitForGainingSupplyCard(
		AddTo,
		conditions,
		additional_piles = false,
		face = 'default' )
{
	return MyAsync( function*() {
		const $available_piles
		  = Get$SupplyAreaWithConditions( conditions, additional_piles );

		if ( $available_piles.length <= 0 ) {
			yield MyAlert( '獲得できるカードがありません' );
			return;
		}

		let up_or_down = '';
		if ( face == 'up'   ) up_or_down = 'up';
		if ( face == 'down' ) up_or_down = 'down';

		$available_piles.addClass(`GainSupplyCard ${AddTo} ${up_or_down} pointer`);
		const GainedCardID
		  = yield new Promise( resolve => Resolve['GainSupplyCard'] = resolve );
		$available_piles.removeClass(`GainSupplyCard ${AddTo} face${up_or_down} pointer`);
		yield Promise.resolve( GainedCardID );
	});
}

$( function() {
	$('.SupplyArea').on( 'click', '.card.GainSupplyCard', function() {
		let place_to_gain = 'DiscardPile';  // default
		if ( $(this).hasClass('AddToDiscardPile') ) {
			place_to_gain = 'DiscardPile';
		}
		if ( $(this).hasClass('AddToHandCards') ) {
			place_to_gain = 'HandCards';
		}
		if ( $(this).hasClass('PutBackToDeck') ) {
			place_to_gain = 'Deck';
		}

		let face = 'default';
		if ( $(this).hasClass('faceup') )   face = 'up';
		if ( $(this).hasClass('facedown') ) face = 'down';

		const clicked_card_name_eng = $(this).attr('data-card-name-eng');
		const clicked_card = Game.Supply.byName(clicked_card_name_eng).LookTopCard();
		const clicked_card_ID = clicked_card.card_ID;

		Game.GainCardFromSupplyByName( clicked_card_name_eng, place_to_gain, undefined, face )
		.then( () => Resolve['GainSupplyCard']() );
	} );
});




