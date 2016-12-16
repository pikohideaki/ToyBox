$( function() {



	/* 37. 共謀者 */
	CardEffect['Conspirator'] = function() {
		if ( Game.TurnInfo.played_actioncards_num < 3 ) {
			EndActionCardEffect();
			return
		}
		// このターンにアクションカードを3枚以上プレイしているとき
		Game.TurnInfo.action++;
		Game.player().DrawCards(1);

		let updates = {};
		updates['TurnInfo'] = Game.TurnInfo;
		updates[`Players/${Game.player().id}`] = Game.player();
		FBref_Game.update( updates )
		.then( EndActionCardEffect );
	};





	/* 34. 改良 */
	CardEffect['Upgrade'] = function* () {
		if ( Game.player().HandCards.length <= 0 ) {
			alert( '手札にカードがありません。' );
			// Resolve_GetCardEffect();  /* GetCardEffectを終了 */
			return;
		}

		StartActionCardEffect( '手札のカードを1枚廃棄して下さい。' )
		.then( () => $('.HandCards').children('.card').addClass('Upgrade_Trash pointer') );
		  /* 手札のカードのクリック動作を廃棄するカードの選択に変更 */

		const TrashedCardCost = yield;  // (1)

		FBref_Room.child('Message')
			.set( `コストがちょうど廃棄したカード+1(=${TrashedCardCost.coin + 1} )コインのカードを獲得してください。` );

		/* サプライのクラス書き換え */
		$('.SupplyArea').find('.card').addClass('Upgrade_GetCard pointer');
		AddAvailableToSupplyCardIf( (card) => (
			card.cost        == TrashedCardCost.coin + 1 &&
			card.cost_potion == TrashedCardCost.potion &&
			card.cost_debt   == TrashedCardCost.debt
		) );
		if ( $('.SupplyArea').find('.available').length <= 0 ) {
			EndActionCardEffect();
			return;
		}

		yield;  // (2)
		EndActionCardEffect();
	};

	$('.HandCards').on( 'click', '.card.Upgrade_Trash', function() {
		const clicked_card_no = $(this).attr('data-card_no');
		const clicked_card_ID = $(this).attr('data-card_ID');

		Game.TrashCardByID( clicked_card_ID );  /* 「鉱山」 手札廃棄 */

		const TrashedCard = Cardlist[ clicked_card_no ];
		const TrashedCardCost = {
			coin   : TrashedCard.cost,
			potion : TrashedCard.cost_potion,
			debt   : TrashedCard.cost_debt,
		};

		let updates = {};
		updates[`Players/${Game.player().id}/HandCards`] = Game.player().HandCards;
		updates['TrashPile'] = Game.TrashPile;

		FBref_Game.update( updates )
		.then( () => GenFuncs.Upgrade.next( TrashedCardCost ) );  // (1) 再開
	} );

	$('.SupplyArea').on( 'click', '.card.Upgrade_GetCard', function() {
		const clicked_card_name_eng = $(this).attr('data-card-name-eng');
		const clicked_card = Game.Supply.byName(clicked_card_name_eng).LookTopCard();
		const clicked_card_ID = clicked_card.card_ID;

		if ( !$(this).hasClass('available') ) {
			alert('獲得できません。' );   return;
		}

		Game.player().AddToDiscardPile( Game.GetCardByID( clicked_card_ID ) );

		let updates = {};
		updates[`Players/${Game.player().id}/DiscardPile`] = Game.player().DiscardPile;
		updates['Supply'] = Game.Supply;
		FBref_Game.update( updates )
		.then( () => GenFuncs.Upgrade.next() );  // (2) 再開
	} );





	/* 36. 貴族 */
	CardEffect['Nobles'] = function*() {
		StartActionCardEffect( '次のうち一つを選んでください。' )
		.then( function() {
			$('.action_buttons')
				.html('')
				.append( MakeHTML_button( 'Nobles 3Cards'  , '+3 Cards'   ) )
				.append( MakeHTML_button( 'Nobles 2Actions', '+2 Actions' ) );
		} );
		yield;  // (1)
		$('.action_buttons').html('');  // reset
		EndActionCardEffect();
	};

	$('.action_buttons').on( 'click', '.Nobles.3Cards', function() {
		Game.player().DrawCards(3);
		FBref_Players.child( Game.player().id ).set( Game.player() )
		.then( () => GenFuncs.Nobles.next() );  // (1) 再開
	} );


	$('.action_buttons').on( 'click', '.Nobles.2Actions', function() {
		FBref_Game.child('TurnInfo/action').set( Game.TurnInfo.action + 2 )
		.then( () => GenFuncs.Nobles.next() );  // (1) 再開
	} );





	/* 44. 男爵 */
	CardEffect['Baron'] = function*() {
		StartActionCardEffect( '屋敷を捨て札にすることができます。そうした場合4コインを得ます。捨て札にしなかった場合は屋敷を獲得します。' )
		.then( function() {
			$('.action_buttons').html( MakeHTML_button( 'Baron get_estate', '屋敷を獲得' ) );
			$('.HandCards').children('.card')
				.filter( function() { return $(this).attr('data-card_no') == CardName2No['Estate'] } )
				.addClass('Baron_Discard pointer');  /* 手札のカードのクリック動作を廃棄するカードの選択に変更 */
		} );
		yield;  // (1)
		$('.action_buttons').html('');  // reset
		EndActionCardEffect();
	};

	$('.HandCards').on( 'click', '.Baron_Discard', function() {
		const clicked_card_ID = $(this).attr('data-card_ID');
		Game.player().AddToDiscardPile( Game.GetCardByID( clicked_card_ID ) );
		let updates = {};
		updates[`Players/${Game.player().id}/DiscardPile`] = Game.player().DiscardPile;
		updates['TurnInfo/coin'] = Game.TurnInfo.coin + 4;
		FBref_Game.update( updates )
		.then( () => GenFuncs.Baron.next() );  // (1) 再開
	} );

	$('.action_buttons').on( 'click', '.Baron.get_estate', function() {
		Game.player().AddToDiscardPile( Game.Supply.byName('Estate').GetTopCard() );
		let updates = {};
		updates[`Players/${Game.player().id}/Deck`] = Game.player().Deck;
		updates['Supply'] = Game.Supply;
		FBref_Game.update( updates )
		.then( () => GenFuncs.Baron.next() );  // (1) 再開
	} );





	/* 50. 中庭 */
	CardEffect['Courtyard'] = function*() {
		StartActionCardEffect( '山札に戻すカードを選択してください。' )
		.then( function() {
			/* 手札のカードのクリック動作を山札に戻すカードの選択に変更 */
			$('.HandCards').children('.card').addClass('Courtyard_PutBackToDeck pointer');
		} );
		yield;  // (1)
		EndActionCardEffect();
	};

	$('.HandCards').on( 'click', '.Courtyard_PutBackToDeck', function() {
		const clicked_card_ID = $(this).attr('data-card_ID');
		Game.player().PutBackToDeck( Game.GetCardByID( clicked_card_ID ) );
		FBref_Players.child( Game.player().id ).update( {
			Deck      : Game.player().Deck,
			HandCards : Game.player().HandCards,
		} )
		.then( () => GenFuncs.Courtyard.next() );  // (1) 再開
	} );





	/* 38. 交易場 */
	CardEffect['Trading Post'] = function*() {
		StartActionCardEffect( '廃棄するカードを2枚選択してください。そうした場合銀貨を獲得します。' )
		.then( function() {
			/* 手札のカードのクリック動作を山札に戻すカードの選択に変更 */
			$('.HandCards').children('.card').addClass('TradingPost_Trash pointer');
		} );

		let trashed_num = 0;
		while ( Game.player().HandCards.length > 0 && trashed_num < 2 ) {
			/* 手札のカードのクリック動作を廃棄するカードの選択に変更 */
			$('.HandCards').children('.card').addClass('TradingPost_Trash pointer');
			yield;  // (1)
			trashed_num++;
		}

		let silver = Game.Supply.byName('Silver').GetTopCard();
		Game.player().AddToHandCards( silver );  /* 銀貨を手札に獲得 */

		let updates = {};
		updates[`Players/${Game.player().id}/HandCards`] = Game.player().HandCards;
		updates['Supply'] = Game.Supply;
		FBref_Game.update( updates )
		.then( EndActionCardEffect );
	};

	$('.HandCards').on( 'click', '.TradingPost_Trash', function() {
		const clicked_card_ID = $(this).attr('data-card_ID');
		Game.TrashCardByID( clicked_card_ID );
		let updates = {};
		updates[`Players/${Game.player().id}/HandCards`] = Game.player().HandCards;
		updates['TrashPile'] = Game.TrashPile;
		FBref_Game.update( updates )
		.then( () => GenFuncs['Trading Post'].next() );  // (1) 再開
	} );





	/* 43. 執事 */
	CardEffect['Steward'] = function*() {
		StartActionCardEffect( '次のうち一つを選んでください。' )
		.then( function() {
			$('.action_buttons')
				.html('')
				.append( MakeHTML_button( 'Steward 2Cards', '+2 Cards' ) )
				.append( MakeHTML_button( 'Steward 2Coins', '+2 Coins' ) )
				.append( MakeHTML_button( 'Steward trash2', '手札から2枚廃棄' ) );
		} );

		btn_val = yield;  // (1)

		$('.action_buttons').html('');

		switch ( btn_val ) {
			case '2Cards' :
				Game.player().DrawCards(2);
				FBref_Players.child( Game.player().id ).set( Game.player() )
				.then( EndActionCardEffect );
				return;

			case '2Coins' :
				FBref_Game.child('TurnInfo/coin').set( Game.TurnInfo.coin + 2 )
				.then( EndActionCardEffect );
				return;

			case 'trash2' :
				FBref_Message.set('手札から2枚廃棄してください。');

				let trashed_num = 0;
				while ( Game.player().HandCards.length > 0 && trashed_num < 2 ) {
					/* 手札のカードのクリック動作を廃棄するカードの選択に変更 */
					$('.HandCards').children('.card').addClass('Steward_Trash pointer');
					yield;  // (2)
					trashed_num++;
				}

				let updates = {};
				updates[`Players/${Game.player().id}/HandCards`] = Game.player().HandCards;
				updates['TrashPile'] = Game.TrashPile;
				FBref_Game.update( updates )
				.then( EndActionCardEffect );
				return;

			default :
				EndActionCardEffect();
				return;
		}
	};

	$('.action_buttons').on( 'click', '.Steward', function() { 
		if ( $(this).hasClass('2Cards') ) {
			GenFuncs.Steward.next( '2Cards' );  // (1)
			return;
		}
		if ( $(this).hasClass('2Coins') ) {
			GenFuncs.Steward.next( '2Coins' );  // (1)
			return;
		}
		if ( $(this).hasClass('trash2') ) {
			GenFuncs.Steward.next( 'trash2' );  // (1)
			return;
		}
	});

	$('.HandCards').on( 'click', '.Steward_Trash', function() {
		const clicked_card_ID = $(this).attr('data-card_ID');
		Game.TrashCardByID( clicked_card_ID );
		let updates = {};
		updates[`Players/${Game.player().id}/HandCards`] = Game.player().HandCards;
		updates['TrashPile'] = Game.TrashPile;
		FBref_Game.update( updates )
		.then( () => GenFuncs.Steward.next() );  // (1) 再開
	} );





	/* 56. 貧民街 */
	CardEffect['Shanty Town'] = function*() {
		StartActionCardEffect( '手札にアクションカードがない場合2枚カードを引きます。' )

		let action_cards
			= Game.player().HandCards.filter( (card) => IsActionCard( Cardlist, card.card_no ) );

		if ( action_cards.length <= 0 ) {
			Game.player().DrawCards(2);
			FBref_Players.child( Game.player().id ).set( Game.player() )
			.then( EndActionCardEffect );
			return;
		}
		EndActionCardEffect();
	};





	/* 47. 手先 */
	CardEffect['Pawn'] = function*() {
		StartActionCardEffect( '次のうち異なる二つを選んでください。' )
		.then( function() {
			$('.action_buttons')
				.html('')
				.append( MakeHTML_button( 'Pawn 1Card'  , '+1 Card'   ) )
				.append( MakeHTML_button( 'Pawn 1Action', '+1 Action' ) )
				.append( MakeHTML_button( 'Pawn 1Buy'   , '+1 Buy'    ) )
				.append( MakeHTML_button( 'Pawn 1Coin'  , '+1 Coin'   ) );
		} );

		const first  = yield;
		const second = yield;

		$('.action_buttons').html('');

		let updates = {};

		let f = function( btn_val ) {
			switch ( btn_val ) {
				case '1Card' :
					Game.player().DrawCards(1);
					updates[`Players/${Game.player().id}`] = Game.player();
					break;
				case '1Action' :
					updates['TurnInfo/action'] = Game.TurnInfo.action + 1;
					break;
				case '1Buy' :
					updates['TurnInfo/buy']    = Game.TurnInfo.buy    + 1;
					break;
				case '1Coin' :
					updates['TurnInfo/coin']   = Game.TurnInfo.coin   + 1;
					break;
			}
		}
		f(first);  f(second);

		FBref_Game.update( updates )
		.then( EndActionCardEffect );  // 再開
	};

	$('.action_buttons').on( 'click', '.Pawn', function() {
		$(this).removeClass('Pawn').attr('disabled', 'disabled');  // 使用したボタンを無効化
		if ( $(this).hasClass('1Card'  ) ) GenFuncs.Pawn.next( '1Card'   );  // 再開
		if ( $(this).hasClass('1Action') ) GenFuncs.Pawn.next( '1Action' );  // 再開
		if ( $(this).hasClass('1Buy'   ) ) GenFuncs.Pawn.next( '1Buy'    );  // 再開
		if ( $(this).hasClass('1Coin'  ) ) GenFuncs.Pawn.next( '1Coin'   );  // 再開
	} );





	/* 46. 偵察員 */
	CardEffect['Scout'] = function*() {
		StartActionCardEffect( '山札の上から4枚のカードを公開し、勝利点カードが含まれていればそれらを全て手札に加えます。\
			残りは好きな順番で山札に戻してください。' )

		Game.player().OpenDeckTop( 4, true ); // sync
		// FBref_Players.child( Game.player().id ).set( Game.player() );

		$('.action_buttons').html( MakeHTML_button( 'Scout_VictoryCards', '勝利点カードを手札に加える' ) );
		yield;  // (1)

		$('.action_buttons').html('');
		Game.player().Open
			.filter( (card) => IsVictoryCard( Cardlist, card.card_no ) )
			.forEach( (card) => Game.player().AddToHandCards( Game.GetCardByID(card.card_ID) ) );

		FBref_Players.child( Game.player().id ).update( {
			Open      : Game.player().Open,
			HandCards : Game.player().HandCards,
		});

		while ( Game.player().Open.length > 0 ) {
			/* 公開カードのクリック動作を山札に戻すカードの選択に変更 */
			$('.Open').children('.card').addClass('Scout_PutBackToDeck pointer');
			yield;  // (2)
		}
		EndActionCardEffect();
	};

	$('.action_buttons').on( 'click', '.Scout_VictoryCards', function() { 
		GenFuncs.Scout.next();
	});

	$('.Open').on( 'click', '.Scout_PutBackToDeck', function() {
		const clicked_card_ID = $(this).attr('data-card_ID');
		Game.player().PutBackToDeck( Game.GetCardByID( clicked_card_ID ) );
		FBref_Players.child( Game.player().id ).update( {
			Open : Game.player().Open,
			Deck : Game.player().Deck,
		} )
		.then( () => GenFuncs.Scout.next() );  // (2) 再開
	} );





	/* 48. 鉄工所 */
	CardEffect['Ironworks'] = function*() {
		StartActionCardEffect( 'コストが4コイン以下のカードを獲得してください。<br>\
			そのカードが<br>\
			 - アクションカードならば +1 Action<br>\
			 - 財宝カードならば +1 Coin<br>\
			 - 勝利点カードならば +1 Card<br>\
			 ' )
		.then( function() {
			/* サプライのクラス書き換え */
			$('.SupplyArea').find('.card').addClass('Ironworks_GetCard pointer');
			AddAvailableToSupplyCardIf( (card) => (
				card.cost        <= 4 &&
				card.cost_potion <= 0 &&
				card.cost_debt   <= 0
			) );
		} );

		gotten_card_no = yield;

		let updates = {};
		if ( IsActionCard( Cardlist, gotten_card_no ) ) {
			Game.TurnInfo.action++;
			updates['TurnInfo/action'] = Game.TurnInfo.action;
		}
		if ( IsTreasureCard( Cardlist, gotten_card_no ) ) {
			Game.TurnInfo.coin++;
			updates['TurnInfo/coin'] = Game.TurnInfo.coin;
		}
		if ( IsVictoryCard( Cardlist, gotten_card_no ) ) {
			Game.player().DrawCards(1);
			updates[`Players/${Game.player().id}`] = Game.player();
		}

		FBref_Game.update( updates )
		.then( EndActionCardEffect );
	};

	$('.SupplyArea').on( 'click', '.card.Ironworks_GetCard', function() {
		const clicked_card_no       = $(this).attr('data-card_no');
		const clicked_card_name_eng = $(this).attr('data-card-name-eng');
		const clicked_card    = Game.Supply.byName(clicked_card_name_eng).LookTopCard();
		const clicked_card_ID = clicked_card.card_ID;

		if ( !$(this).hasClass('available') ) {
			alert('コストが大きいので獲得できません。' );   return;
		}

		Game.player().AddToDiscardPile( Game.GetCardByID( clicked_card_ID ) );

		let updates = {};
		updates[`Players/${Game.player().id}/DiscardPile`] = Game.player().DiscardPile;
		updates['Supply'] = Game.Supply;
		FBref_Game.update( updates )
		.then( () => GenFuncs.Ironworks.next( clicked_card_no ) );  // (1) 再開
	} );





	/* 57. 貢物 */
	CardEffect['Tribute'] = function*() {
		StartActionCardEffect( '左隣りのプレイヤーの山札の上から2枚を公開します。\
			それらのうち異なる名前のカード1枚につき、それが<br>\
			- アクションカードならば +2 Actions<br>\
			- 財宝カードならば +2 Coins<br>\
			- 勝利点カードならば +2 Cards<br>\
			' )
		.then( function() {
			Game.NextPlayer().OpenDeckTop( 2, true );  // sync
			Show_OKbtn_OtherPlayer( Game.NextPlayerID(), 'Tribute' );
		});

		yield;  // (1)

		Hide_OKbtn_OtherPlayer( Game.NextPlayerID(), 'Tribute' );

		let updates = {};

		// 公開したカードの違う名前につき
		Game.NextPlayer().Open.uniq( (card) => card.card_no )
		.forEach( function(card) {
			if ( IsActionCard( Cardlist, card.card_no ) ) {
				Game.TurnInfo.action += 2;
				updates['TurnInfo/action'] = Game.TurnInfo.action;
			}
			if ( IsTreasureCard( Cardlist, card.card_no ) ) {
				Game.TurnInfo.coin += 2;
				updates['TurnInfo/coin'] = Game.TurnInfo.coin;
			}
			if ( IsVictoryCard( Cardlist, card.card_no ) ) {
				Game.player().DrawCards(2);
				updates[`Players/${Game.player().id}`] = Game.player();
			}
		});

		// 公開したカードを捨て札に
		Game.NextPlayer().Open.forEach( (card) => Game.NextPlayer().AddToDiscardPile( card ) );
		updates[`Players/${Game.NextPlayerID()}/Open`] = [];
		updates[`Players/${Game.NextPlayerID()}/DiscardPile`] = Game.NextPlayer().DiscardPile;

		FBref_Game.update( updates )
		.then( EndActionCardEffect );
	};

	/* 確認 */
	$('.OtherPlayers-wrapper' ).on( 'click', '.ok.Tribute', () => GenFuncs.Tribute.next() );  // (1) 再開





	/* 39. 鉱山の村 */
	CardEffect['Mining Village'] = function*( playing_card_ID ) {
		StartActionCardEffect( 'このカードを即座に廃棄することができます。そうした場合、2コインを得ます。' )
		.then( function() {
			$('.action_buttons')
				.html('')
				.append( MakeHTML_button( 'MiningVillage trash', '廃棄して +2 コイン'   ) )
				.append( MakeHTML_button( 'MiningVillage', '廃棄しない' ) );
		} );

		btn_val = yield;  // (1)
		$('.action_buttons').html('');  // reset

		if ( btn_val == 'trash' ) {
			Game.TrashCardByID( playing_card_ID );
			let updates = {};
			updates[`Players/${Game.player().id}`] = Game.player();  /* 更新 */
			updates['TrashPile'] = Game.TrashPile;
			updates['TurnInfo/coin'] = Game.TurnInfo.coin + 2;
			FBref_Game.update( updates )
			.then( EndActionCardEffect );
			return;
		}
		EndActionCardEffect();
	};

	$('.action_buttons').on( 'click', '.MiningVillage', function() {
		GenFuncs['Mining Village'].next( ( $(this).hasClass('trash') ? 'trash' : '' ) );  // (1) 再開
	} );






	/* 41. 拷問人 */
	CardEffect['Torturer'] = function*() {
		StartActionCardEffect( '他のプレイヤーは次のうち1つを選ぶ ： <br>\
			- 手札からカードを2枚捨て札にする<br>\
			- 呪いを獲得し手札に加える<br>\
			' );

		/* 他のプレイヤーが終了時に送るEndシグナルを監視 */
		FBref_SignalEnd.on( 'value', function(snap) { if ( snap.val() ) GenFuncs.Torturer.next(); } );  // (1) 再開

		for ( let id = Game.NextPlayerID(); id != Game.whose_turn_id; id = Game.NextPlayerID(id) ) {
			SendSignal( id, { Attack : true, card_name : 'Torturer', } );
			FBref_MessageTo.child(id).set('手札からカードを2枚捨て札にするか呪いを獲得して手札に加えるか選んでください。');  // reset

			yield;  // (1)
			FBref_SignalEnd.set(false);  /* reset */

			Show_OKbtn_OtherPlayer( id, 'Torturer' );
			yield;  // (2)
			Hide_OKbtn_OtherPlayer( id, 'Torturer' );
			FBref_MessageTo.child(id).set('');  // reset
		}

		/* 終了処理 */
		FBref_SignalEnd.off();  /* 監視終了 */
		Game.Players.forEach( (player) => player.ResetFaceDown(true) );  // 公開したリアクションカードを戻す
		EndActionCardEffect();
	};

	AttackEffect['Torturer'] = function*() {  /* アタックされる側 */
		$('.MyArea .buttons')
			.append( MakeHTML_button( 'Torturer Discard2', '手札からカードを2枚捨て札にする' ) )
			.append( MakeHTML_button( 'Torturer GetCurse', '呪いを獲得し手札に加える' ) );

		const clicked_btn = yield;  // (a)
		$('.MyArea .buttons .Torturer').remove();

		if ( clicked_btn == 'Discard2' ) {
			FBref_MessageTo.child(myid).set('手札からカードを2枚捨て札にしてください。');
			let discarded_num = 0;
			while ( discarded_num < 2 && $('.MyHandCards').children('.card').length > 0 ) {
				$('.MyHandCards').children('.card').addClass('Torturer_Discard pointer');
				yield;  // (b)
				discarded_num++;
			}
			FBref_Players.child( myid ).update( {
				HandCards   : Game.Me().HandCards,
				DiscardPile : Game.Me().DiscardPile,
			} )
			.then( EndAttackCardEffect );
			return;
		}

		if ( clicked_btn == 'GetCurse' ) {
			FBref_MessageTo.child(myid).set('呪いを獲得して手札に加えてください。');
			let curse = Game.Supply.byName('Curse').GetTopCard();
			curse.face = true;
			Game.Me().AddToHandCards( curse );

			let updates = {};
			updates['Supply'] = Game.Supply;
			updates[`Players/${myid}/HandCards`]   = Game.Me().HandCards;
			FBref_Game.update( updates ).then( EndAttackCardEffect );
			return;
		}
	};

	$('.MyArea .buttons').on( 'click', '.Torturer', function() {
		let clicked_btn = '';
		if ( $(this).hasClass('Discard2') ) clicked_btn = 'Discard2';
		if ( $(this).hasClass('GetCurse') ) clicked_btn = 'GetCurse';
		GenFuncs.AttackEffect_Torturer.next( clicked_btn );  // (a) 再開
	});

	$('.MyHandCards').on( 'click', '.card.Torturer_Discard', function() {
		const clicked_card_ID = $(this).attr('data-card_ID');

		Game.Me().AddToDiscardPile( Game.GetCardByID( clicked_card_ID ) );

		FBref_Players.child( myid ).update( {
			HandCards   : Game.Me().HandCards,
			DiscardPile : Game.Me().DiscardPile,
		} )
		.then( () => GenFuncs.AttackEffect_Torturer.next() );  // (b) 再開
	} );

	/* 確認 */
	$('.OtherPlayers-wrapper' ).on( 'click', '.ok.Torturer', function() {
		GenFuncs.Torturer.next();  // (2) 再開
	} );





	/* 42. 詐欺師 */
	CardEffect['Swindler'] = function*() {
		StartActionCardEffect( '' )
		.then( function() {

		} );
		EndActionCardEffect();
	};





	/* 45. 寵臣 */
	CardEffect['Minion'] = function*() {
		StartActionCardEffect( '次のうち一つを選んでください。' )
		.then( function() {
			$('.action_buttons')
				.html('')
				.append( MakeHTML_button( 'Minion Discard', '手札を全て捨て札にして+4カード' ) )
				.append( MakeHTML_button( 'Minion 2Coins' , '+2 コイン' ) );
		} );

		const clicked_btn = yield;
		$('.action_buttons').html('');  // reset

		if ( clicked_btn == '2Coins' ) {
			FBref_Game.child('TurnInfo/coin').set( Game.TurnInfo.coin + 2 )
			.then( EndActionCardEffect );
			return;
		}
		if ( clicked_btn == 'Discard' ) {
			Game.player().HandCards
				.forEach( (card) => Game.player().AddToDiscardPile(card) );
			Game.player().HandCards = [];
			Game.player().DrawCards(4);
			FBref_Players.child( Game.player().id ).set( Game.player() );

			/* 他のプレイヤーが終了時に送るEndシグナルを監視 */
			FBref_SignalEnd.on( 'value', function(snap) { if ( snap.val() ) GenFuncs.Minion.next(); } );  // (1) 再開

			for ( let id = Game.NextPlayerID(); id != Game.whose_turn_id; id = Game.NextPlayerID(id) ) {
				SendSignal( id, { Attack : true, card_name : 'Minion', } );
				FBref_MessageTo.child(id).set('手札が5枚以上ある人は手札を捨て札にして+4カード');  // reset

				yield;  // (1)
				FBref_SignalEnd.set(false);  /* reset */

				Show_OKbtn_OtherPlayer( id, 'Minion' );
				yield;  // (2)
				Hide_OKbtn_OtherPlayer( id, 'Minion' );
				FBref_MessageTo.child(id).set('');  // reset
			}

			/* 終了処理 */
			FBref_SignalEnd.off();  /* 監視終了 */
			Game.Players.forEach( (player) => player.ResetFaceDown(true) );  // 公開したリアクションカードを戻す
			EndActionCardEffect();
			return;
		}
	};

	$('.action_buttons').on( 'click', '.Minion', function() {
		let clicked_btn = '';
		if ( $(this).hasClass('2Coins') )  clicked_btn = '2Coins';
		if ( $(this).hasClass('Discard') ) clicked_btn = 'Discard';
		GenFuncs.Minion.next( clicked_btn );  // (1) 再開
	} );

	AttackEffect['Minion'] = function() {  /* アタックされる側 */
		// 手札が5枚以上ならば捨て札にして+4Cards
		if ( Game.Me().HandCards.length >= 5 ) {
			Game.Me().HandCards
				.forEach( (card) => Game.Me().AddToDiscardPile(card) );
			Game.Me().HandCards = [];
			Game.Me().DrawCards(4);
			FBref_Players.child(myid).set( Game.Me() )
			.then( EndAttackCardEffect );  // Endシグナルを送る
			return;
		}
		EndAttackCardEffect();  // Endシグナルを送る
	};

	/* 確認 */
	$('.OtherPlayers-wrapper' ).on( 'click', '.ok.Minion', function() {
		GenFuncs.Minion.next();  // (2) 再開
	} );




	/* 53. 破壊工作員 */
	CardEffect['Saboteur'] = function*() {
		StartActionCardEffect( '' )
		.then( function() {

		} );
		EndActionCardEffect();
	};





	/* 49. 銅細工師 */
	CardEffect['Coppersmith'] = function() {
		StartActionCardEffect( 'このターン銅貨は+1コインを生みます。' )
		.then( () => FBref_Game.child('TurnInfo/add_copper_coin').set( Game.TurnInfo.add_copper_coin + 1 ) )
		.then( EndActionCardEffect );
	};





	/* 54. 橋 */
	CardEffect['Bridge'] = function*() {
		StartActionCardEffect( '' )
		.then( function() {

		} );
		EndActionCardEffect();
	};





	/* 51. 願いの井戸 */
	CardEffect['Wishing Well'] = function*() {
		StartActionCardEffect( '' )
		.then( function() {

		} );
		EndActionCardEffect();
	};





	/* 55. 秘密の部屋 */
	CardEffect['Secret Chamber'] = function*() {
		StartActionCardEffect( '手札から任意の枚数を捨て札にして下さい。捨て札にした枚数だけコインを得ます。' )
		.then( function() {
			$('.action_buttons').append( MakeHTML_button( 'SecretChamber Done', '完了' ) );
		} );

		let discarded_num = 0;
		let end = false;

		while (true) {
			$('.HandCards').children('.card').addClass('SecretChamber_Discard pointer');
			end = yield;  // (1)
			if (end) break;
			discarded_num++;
			FBref_Message.set( `捨て札にした枚数 ： ${discarded_num}枚` );
		}

		$('.action_buttons .SecretChamber.Done').remove();  /* 完了ボタン消す */

		FBref_Game.child('TurnInfo/coin').set( Game.TurnInfo.coin + discarded_num )
		.then( EndActionCardEffect );
	};

	$('.HandCards').on( 'click', '.card.SecretChamber_Discard', function() {
		const clicked_card_ID = $(this).attr('data-card_ID');

		Game.player().AddToDiscardPile( Game.GetCardByID( clicked_card_ID ) );  /* 「地下貯蔵庫」 捨て札 */

		FBref_Players.child( Game.player().id ).update( {
			HandCards   : Game.player().HandCards,
			DiscardPile : Game.player().DiscardPile,
		} )
		.then( () => GenFuncs.GetCardEffect.next(false) );  // (1) 再開
		// .then( GenFuncs['Secret Chamber'].next(false) );  // (1) 再開
	} );

	$('.action_buttons').on( 'click', '.SecretChamber.Done', function() {
		GenFuncs.GetCardEffect.next(true);  // (1) 再開
		// GenFuncs['Secret Chamber'].next(true);  // (1) 再開
	} );



	ReactionEffect['Secret Chamber'] = function*( Resolve_GetReactionCardEffect ) {
		Game.Me().DrawCards(2);
		FBref_Players.child( myid ).set( Game.Me() );

		let put_back_num = 0;
		while ( put_back_num < 2 ) {
			/* 手札のカードのクリック動作を山札に戻すカードの選択に変更 */
			$('.MyHandCards').children('.card').addClass('SecretChamber_PutBackToDeck pointer');
			yield;  // (1)
			put_back_num++;
		}
		Resolve_GetReactionCardEffect();
		GenFuncs['CatchSignal'].next();
	};

	$('.MyHandCards').on( 'click', '.card.SecretChamber_PutBackToDeck', function() {
		const clicked_card_ID = $(this).attr('data-card_ID');

		Game.Me().HandCards.forEach( (card) => card.face = false );  // 裏向きに
		Game.Me().PutBackToDeck( Game.GetCardByID( clicked_card_ID ) );

		FBref_Players.child( myid ).update( {
			HandCards : Game.Me().HandCards,
			Deck      : Game.Me().Deck,
		} )
		.then( () => GenFuncs['Secret Chamber'].next() );  // (1)
	} );





	/* 35. 仮面舞踏会 */
	CardEffect['Masquerade'] = function*() {
		StartActionCardEffect( '' )
		.then( function() {

		} );
		EndActionCardEffect();
	};





	/*  */
	// CardEffect[''] = function*() {
	// 	StartActionCardEffect( '' )
	// 	.then( function() {

	// 	} );
	// 	EndActionCardEffect();
	// };


});
