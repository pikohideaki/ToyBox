

let CardEffect     = {};  /* library of card effect functions */
let AttackEffect   = {};  /* library of attack card effect functions */
let ReactionEffect = {};  /* library of reaction card effect functions */

let Resolve        = {};  
let GenFuncs       = {};


$( function() {
	$('.OtherPlayers-wrapper').on( 'click', '.OtherPlayer_Buttons .ok', () => Resolve['reveal_reaction_ok']() );
});



function* GetCardEffect( playing_card_no, playing_card_ID ) {
	const playing_Card = Cardlist[ playing_card_no ];
	FBref_Room.child('chat').push( `${Game.player().name}が「${playing_Card.name_jp}」を使用しました。` );

	// アタックカードならまずリアクションカードの解決
	if ( IsAttackCard( Cardlist, playing_card_no ) ) {
		// 「アタックカードを場に出す」まではやる（update回数を節約した関係でカードがまだ場に出ていない）
		yield FBref_Players.child( Game.player().id ).set( Game.player() );

		yield FBref_Message.set( 'リアクションカードがあれば公開することができます。' );
		for ( let id = Game.NextPlayerID(); id != Game.whose_turn_id; id = Game.NextPlayerID(id) ) {
			SendSignal( id, { listen_reaction : true } );

			Show_OKbtn_OtherPlayer( id );
			yield new Promise( function(resolve) { Resolve['reveal_reaction_ok'] = resolve; });
			Hide_OKbtn_OtherPlayer( id );
			yield FBref_Signal.child( id ).remove();
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
	updates['phase'] = Game.phase;  // Game.UseCard の update を代行
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
			yield MyAsync( CardEffect[ playing_card_name ]( playing_card_ID, playing_card_no ) );
			break;
	}
}






function* GetReactionCardEffect( card_name_eng ) {
	switch ( card_name_eng ) {
		case 'Moat' :  /* 26. 堀 */
			EndAttackCardEffect();
			GenFuncs['CatchSignal'].return();  // アタック効果を飛ばして終了
			return;

		case 'Secret Chamber' : /* 55. 秘密の部屋 */
			yield MyAsync( ReactionEffect[ card_name_eng ]() );
			return;

		default :
			return;
	}
}






function* GetAttackCardEffect( card_name ) {
	yield MyAsync( AttackEffect[ card_name ]() );
	yield EndAttackCardEffect();  // Endシグナルを送る
}






function EndAttackCardEffect() {
	return Promise.all( [
		FBref_SignalToMe.remove(),
		FBref_MessageTo.child(myid).set(''),
		FBref_SignalEnd.set(true)
	] );
}



function AddAvailableToSupplyCardIf( conditions ) {
	$('.SupplyArea').find('.card').each( function() {
		const card_no = $(this).attr('data-card_no');
		const card_ID = $(this).attr('data-card_ID');
		const card = Cardlist[ card_no ];
		if ( conditions( card, card_no, card_ID ) ) $(this).addClass('available');
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
function Monitor_FBref_SignalEnd_on( card_name ) {
	return FBref_SignalEnd.set(false)  /* reset */
	.then( function() {
		FBref_SignalEnd.on( 'value', function(snap) {
			if ( snap.val() ) Resolve[ card_name ]();
		} )
	} );
}

function Monitor_FBref_SignalEnd_off() {
	FBref_SignalEnd.off();
}

