

let CardEffect     = {};  /* library of card effect functions */
let AttackEffect   = {};  /* library of attack card effect functions */
let ReactionEffect = {};  /* library of reaction card effect functions */
let GenFuncs       = {};  /* object to access from everywhere */

let AsyncFuncs     = {};  /* async functions (object globally access) */



function GetCardEffect( playing_card_no, playing_card_ID ) {
 return new Promise( function( resolve, reject ) {
	const playing_Card = Cardlist[ playing_card_no ];
	FBref_Room.child('chat').push( `${Game.player().name}が「${playing_Card.name_jp}」を使用しました。` );

	Game.TurnInfo.action += playing_Card.action;
	Game.TurnInfo.buy    += playing_Card.buy;
	Game.TurnInfo.coin   += playing_Card.coin;
	Game.player().DrawCards( playing_Card.draw_card );

	// 共謀者 このターンにプレイしたアクションカードの枚数
	if ( IsActionCard( Cardlist, playing_card_no ) ) {
		Game.TurnInfo.played_actioncards_num++;
	}

	let updates = {};
	updates['TurnInfo'] = Game.TurnInfo;
	updates[`Players/${Game.player().id}`] = Game.player();

	FBref_Game.update( updates )
	.then( function() {
		const playing_card_name = Cardlist[ playing_card_no ].name_eng;
		switch ( playing_card_name ) {
			case 'Copper' : // 銅細工師の効果
				Game.TurnInfo.coin += Game.TurnInfo.add_copper_coin;
				FBref_Game.child('TurnInfo/coin').set( Game.TurnInfo.coin )
				.then( resolve );
				break;

			/* 中断なし */
			case 'Council Room' :  // 13. 議事堂

			case 'Conspirator'  :  // 37. 共謀者
			case 'Coppersmith'  :  // 49. 銅細工師
			case 'Bridge'       :  // 54. 橋

				CardEffect[ playing_card_name ]( resolve );
				break;


			/* 中断あり （generator function使用） */
			case 'Chancellor'     :  // 18. 宰相
			case 'Library'        :  // 21. 書庫
			case 'Adventurer'     :  // 25. 冒険者
			case 'Remodel'        :  //  9. 改築
			case 'Moneylender'    :  // 11. 金貸し
			case 'Mine'           :  // 16. 鉱山
			case 'Workshop'       :  // 17. 工房
			case 'Feast'          :  // 19. 祝宴
			case 'Cellar'         :  // 22. 地下貯蔵庫
			case 'Chapel'         :  // 32. 礼拝堂
			case 'Witch'          :  // 27. 魔女
			case 'Militia'        :  // 29. 民兵
			case 'Thief'          :  // 24. 泥棒
			case 'Spy'            :  // 28. 密偵
			case 'Bureaucrat'     :  // 31. 役人
			case 'Throne Room'    :  // 14. 玉座の間

			case 'Upgrade'        :  // 34. 改良
			case 'Nobles'         :  // 36. 貴族
			case 'Baron'          :  // 44. 男爵
			case 'Courtyard'      :  // 50. 中庭
			case 'Steward'        :  // 43. 執事
			case 'Shanty Town'    :  // 56. 貧民街
			case 'Trading Post'   :  // 38. 交易場
			case 'Pawn'           :  // 47. 手先
			case 'Scout'          :  // 46. 偵察員
			case 'Ironworks'      :  // 48. 鉄工所
			case 'Tribute'        :  // 57. 貢物
			case 'Mining Village' :  // 39. 鉱山の村
			case 'Torturer'       :  // 41. 拷問人
			case 'Swindler'       :  // 42. 詐欺師
			case 'Minion'         :  // 45. 寵臣
			case 'Saboteur'       :  // 53. 破壊工作員
			case 'Wishing Well'   :  // 51. 願いの井戸
			case 'Secret Chamber' :  // 55. 秘密の部屋
			case 'Masquerade'     :  // 35. 仮面舞踏会

				GenFuncs[ playing_card_name ]
					= CardEffect[ playing_card_name ]( resolve, playing_card_ID, playing_card_no );  // generator 作成
				GenFuncs[ playing_card_name ].next();  // generator開始
				break;

			default :
				resolve();
				break;
		}
	} );
 } );
}






function StartActionCardEffect( Message ) {
	return FBref_Room.update( {
		Message    : Message,
		'Game/phase' : 'ActionPhase*',
	} );
}

function EndActionCardEffect( Resolve_GetCardEffect ) {
	return new Promise( function( resolve, reject ) {
		FBref_Game.child('phase').set( 'ActionPhase' )
		.then( Resolve_GetCardEffect )  /* GetCardEffectを終了 */
		.then( resolve );
	} );
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
	$ok_button.removeClass('Spy');
}