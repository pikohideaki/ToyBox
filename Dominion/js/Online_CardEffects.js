

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
	FBref_Room.child('chat').push( `${Game.player().name}が「${playing_Card.name_jp}」を使用しました。` );

	// アタックカードならまずリアクションカードの解決
	if ( IsAttackCard( Cardlist, playing_card_no ) ) {
		yield FBref_Message.set( 'リアクションカードを公開するプレイヤーがいないか待っています。' );
		for ( let id = Game.NextPlayerID(); id != Game.whose_turn_id; id = Game.NextPlayerID(id) ) {

			// Player[id] がリアクションスキップオプションがオンで手札にリアクションカードがない場合
			if ( Game.Settings.SkipReaction[id] && !Game.Players[id].HasReactionCard() ) continue;

			/* 堀を公開するかどうかはアクションカード1枚ごとに決めてよい */
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

			Monitor_FBref_SignalReactionEnd_off();
			Monitor_FBref_SignalRevealReaction_off();
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






// function* GetReactionCardEffect( card_no, card_ID ) {
// 	yield MyAsync( ReactionEffect[ Cardlist[ card_no ].name_eng ] );
// 	yield FBref_MessageToMe.set('');
// }



// function* GetAttackCardEffect( card_name ) {
// 	yield MyAsync( AttackEffect[ card_name ] );
// 	yield Promise.all( [
// 		FBref_SignalToMe.remove(),
// 		FBref_MessageToMe.set(''),
// 		FBref_SignalAttackEnd.set(true)  // Endシグナルを送る
// 	] );
// }



// function EndAttackCardEffect() {
// 	;
// }



function AddAvailableToSupplyCardIf( conditions ) {
	$('.SupplyArea').find('.card').each( function() {
		const card_no = $(this).attr('data-card_no');
		// const card_ID = $(this).attr('data-top_card_ID');
		const card = Cardlist[ card_no ];
		if ( conditions( card, card_no ) ) $(this).addClass('available');
	} );
}



function Show_OKbtn_OtherPlayer( player_id, classes ) {
	let $ok_button = $(`.OtherPlayer[data-player_id=${player_id}] .OtherPlayer_Buttons .ok`);
	$ok_button.show();
	$ok_button.addClass( classes );
}

function Hide_OKbtn_OtherPlayer( player_id, classes ) {
	let $ok_button = $(`.OtherPlayer[data-player_id=${player_id}] .OtherPlayer_Buttons .ok`);
	$ok_button.hide();
	$ok_button.removeClass( classes );
}



/* 他のプレイヤーが終了時に送るEndシグナルを監視 */
function Monitor_FBref_SignalAttackEnd_on( card_name ) {
	return FBref_SignalAttackEnd.set(false)  /* reset */
	.then( function() {
		FBref_SignalAttackEnd.on( 'value', function(snap) {
			if ( snap.val() ) Resolve[ card_name ]();
		} )
	} );
}

function Monitor_FBref_SignalAttackEnd_off() {
	FBref_SignalAttackEnd.off();
}



function Monitor_FBref_SignalRevealReaction_on() {
	return FBref_SignalRevealReaction.set(false)  /* reset */
	.then( function() {
		FBref_SignalRevealReaction.on( 'value', function(snap) {
			if ( snap.val() ) Resolve['RevealedReaction']();
		} )
	} );
}

function Monitor_FBref_SignalRevealReaction_off() {
	FBref_SignalRevealReaction.off();
}



function Monitor_FBref_SignalReactionEnd_on() {
	return FBref_SignalReactionEnd.set(false)  /* reset */
	.then( function() {
		FBref_SignalReactionEnd.on( 'value', function(snap) {
			if ( snap.val() ) Resolve['ReactionEnd']();
		} )
	} );
}

function Monitor_FBref_SignalReactionEnd_off() {
	FBref_SignalReactionEnd.off();
}
