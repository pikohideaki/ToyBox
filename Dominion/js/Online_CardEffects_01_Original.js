
$( function() {

	/* 13. 議事堂 */
	CardEffect['Council Room'] = function( Resolve_GetCardEffect ) {
		let updates = {};
		for ( let i = Game.NextPlayerID(); i != Game.whose_turn_id; i = Game.NextPlayerID(i) ) {
			Game.Players[i].DrawCards(1);
			updates[i] = Game.Players[i];
		}
		FBref_Players.update( updates )
		.then( EndActionCardEffect( Resolve_GetCardEffect ) );
	};





	/* 11. 金貸し */
	CardEffect['Moneylender'] = function*( Resolve_GetCardEffect ) {
		const Coppers = Game.player().HandCards
			.filter( (card) => ( card.card_no == CardName2No['Copper'] ) );

		if ( Coppers.length <= 0 ) {
			alert( '手札に銅貨がありません。' );
			Resolve_GetCardEffect();  /* GetCardEffectを終了 */
			return;
		}

		StartActionCardEffect( '手札の銅貨を1枚廃棄して下さい。' )
		.then( function() {
			$('.HandCards').children('.card')
				.filter( function() { return $(this).attr('data-card_no') == CardName2No['Copper'] } )
				.addClass('Moneylender_Trash pointer');  /* 手札のカードのクリック動作を廃棄するカードの選択に変更 */
		} );

		yield;  // (1)
		EndActionCardEffect( Resolve_GetCardEffect );
	};

	$('.HandCards').on( 'click', '.card.Moneylender_Trash', function() {
		const clicked_card_ID = $(this).attr('data-card_ID');

		Game.TrashCardByID( clicked_card_ID );  /* 「金貸し」 銅貨廃棄 */

		let updates = {};
		updates[`Players/${Game.player().id}/HandCards`] = Game.player().HandCards;
		updates['TrashPile'] = Game.TrashPile;
		updates['TurnInfo/coin'] = Game.TurnInfo.coin + 3;
		FBref_Game.update( updates )
		.then( GenFuncs.Moneylender.next() );  // (1) 再開
	} );





	/* 9. 基本 - 改築 */
	CardEffect['Remodel'] = function* ( Resolve_GetCardEffect ) {
		if ( Game.player().HandCards.length <= 0 ) {
			alert( '手札にカードがありません。' );
			Resolve_GetCardEffect();  /* GetCardEffectを終了 */
			return;
		}

		StartActionCardEffect( '手札のカードを1枚廃棄して下さい。' )
		.then( () => $('.HandCards').children('.card').addClass('Remodel_Trash pointer') );
		  /* 手札のカードのクリック動作を廃棄するカードの選択に変更 */

		const TrashedCardCost = yield;  // (1)

		FBref_Room.child('Message')
			.set( `コストが廃棄したカード+2(=${TrashedCardCost.coin + 2} )コインまでのカードを獲得してください。` );

		/* サプライのクラス書き換え */
		$('.SupplyArea').find('.card').addClass('Remodel_GetCard pointer');
		AddAvailableToSupplyCardIf( (card) => (
			card.cost        <= TrashedCardCost.coin + 2 &&
			card.cost_potion <= TrashedCardCost.potion &&
			card.cost_debt   <= TrashedCardCost.debt
		) );

		yield;  // (2)
		EndActionCardEffect( Resolve_GetCardEffect );
	};


	/* 16. 基本 - 鉱山 */
	CardEffect['Mine'] = function* ( Resolve_GetCardEffect ) {
		const Treasure = Game.player().HandCards
			.filter( (card) => IsTreasureCard( Cardlist, card.card_no ) );

		if ( Treasure.length <= 0 ) {
			alert( '手札に財宝カードがありません。' );
			Resolve_GetCardEffect();  /* GetCardEffectを終了 */
			return;
		}

		StartActionCardEffect( '手札の財宝カードを1枚廃棄して下さい。' )
		.then( function() {
			$('.HandCards').children('.card')
				.filter( function() { return IsTreasureCard( Cardlist, $(this).attr('data-card_no') ); } )
				.addClass('Mine_Trash pointer');  /* 手札のカードのクリック動作を廃棄するカードの選択に変更 */
		} );

		const TrashedCardCost = yield;  // (1)

		FBref_Room.child('Message')
			.set( `コストが廃棄したカード+3(=${TrashedCardCost.coin + 3} )コインまでの財宝カードを獲得してください。` );

		/* サプライのクラス書き換え */
		$('.SupplyArea').find('.card').addClass('Mine_GetCard pointer');
		AddAvailableToSupplyCardIf( ( card, card_no ) => (
			card.cost        <= TrashedCardCost.coin + 3 &&
			card.cost_potion <= TrashedCardCost.potion &&
			card.cost_debt   <= TrashedCardCost.debt &&
			IsTreasureCard( Cardlist, card_no )
		));

		yield;  // (2)
		EndActionCardEffect( Resolve_GetCardEffect );
	};

	$('.HandCards').on( 'click', '.card.Remodel_Trash,.Mine_Trash', function() {
		let Remodel_or_Mine;
		if ( $(this).hasClass('Remodel_Trash') ) Remodel_or_Mine = 'Remodel';
		if ( $(this).hasClass('Mine_Trash') )    Remodel_or_Mine = 'Mine';

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
		.then( GenFuncs[Remodel_or_Mine].next( TrashedCardCost ) );  // (1) 再開
	} );

	$('.SupplyArea').on( 'click', '.card.Remodel_GetCard,.Mine_GetCard', function() {
		let Remodel_or_Mine;
		let DiscardPile_or_HandCards;
		if ( $(this).hasClass('Remodel_GetCard') ) {
			Remodel_or_Mine = 'Remodel';
			DiscardPile_or_HandCards = 'DiscardPile';
		}
		if ( $(this).hasClass('Mine_GetCard') ) {
			Remodel_or_Mine = 'Mine';
			DiscardPile_or_HandCards = 'HandCards';
		}

		const clicked_card_name_eng = $(this).attr('data-card-name-eng');
		const clicked_card = Game.Supply.byName(clicked_card_name_eng).LookTopCard();
		const clicked_card_ID = clicked_card.card_ID;

		if ( !$(this).hasClass('available') ) {
			alert('コストが大きいので獲得できません。' );   return;
		}

		Game.player()[`AddTo${DiscardPile_or_HandCards}`]( Game.GetCardByID( clicked_card_ID ) );

		let updates = {};
		updates[`Players/${Game.player().id}/${DiscardPile_or_HandCards}`] = Game.player()[DiscardPile_or_HandCards];
		updates['Supply'] = Game.Supply;
		FBref_Game.update( updates )
		.then( GenFuncs[Remodel_or_Mine].next() );  // (2) 再開
	} );





	/* 18. 宰相 */
	CardEffect['Chancellor'] = function*( Resolve_GetCardEffect ) {
		StartActionCardEffect( '山札を捨て札に置きますか？' )
		.then( function() {
			$('.action_buttons')
				.html('')
				.append( MakeHTML_button( 'Chancellor Discard', '捨て札におく' ) )
				.append( MakeHTML_button( 'Chancellor', '何もしない' ) );
		} );

		discard = yield;  // (1)

		$('.action_buttons').html('');  // reset

		if ( discard ) {
			Game.player().Deck.reverse();  /* 山札をそのままひっくり返して捨て山に置く */
			Game.player().Deck.forEach( (card) => Game.player().AddToDiscardPile(card) );
			Game.player().Deck = [];
			FBref_Players.child( Game.player().id ).set( Game.player() );
		}
		EndActionCardEffect( Resolve_GetCardEffect );
	};

	$('.action_buttons').on( 'click', '.Chancellor', function() {
		GenFuncs.Chancellor.next( $(this).hasClass('Discard'));  // (1) 再開
	} );





	/* 21. 書庫 */
	CardEffect['Library'] = function*( Resolve_GetCardEffect ) {
		StartActionCardEffect( '手札が7枚になるまでカードを引きます。アクションカードを引いたら脇に置くことができます。' );

		while ( Game.player().Drawable() && Game.player().HandCards.length < 7 ) {
			const deck_top_card = Game.player().GetDeckTopCard();

			if ( IsActionCard( Cardlist, deck_top_card.card_no ) ) {
				FBref_Players.child( `${Game.player().id}/Deck` ).set( Game.player().Deck );

				ShowDialog( {
					message  : `${Cardlist[ deck_top_card.card_no ].name_jp}を脇に置きますか？`,
					contents : MakeHTML_Card(deck_top_card),
					buttons  :
						MakeHTML_button( 'Library SetAside', '脇に置く' ) + 
						MakeHTML_button( 'Library', '手札に加える' ),
				} );

				let set_aside = yield;  // (1)

				HideDialog();

				if ( set_aside ) {
					Game.player().AddToAside( deck_top_card );
					FBref_Players.child( Game.player().id ).set( Game.player() );
					continue;
				}
			}

			Game.player().AddToHandCards( deck_top_card );
			FBref_Players.child( Game.player().id ).set( Game.player() );
		}

		$('.action_buttons').append( MakeHTML_button( 'Library Done', '確認' ) );

		yield;  // (2) 脇に置いたカードを確認

		$('.action_buttons .Library.Done').remove();  /* 完了ボタン消す */

		/* move cards in Aside to DiscardPile */
		Game.player().Aside.forEach( (card) => Game.player().AddToDiscardPile(card) );
		Game.player().Aside = [];

		FBref_Players.child( Game.player().id ).set( Game.player() )
		.then( EndActionCardEffect( Resolve_GetCardEffect ) );
	};

	/* 確認 */
	$('.dialog_buttons' ).on( 'click', '.Library', function() {
		GenFuncs.Library.next( $(this).hasClass('SetAside') );  // (1) 再開
	} );

	$('.action_buttons').on( 'click', '.Library.Done', function() {
		GenFuncs.Library.next();  // (2) 再開
	} );





	/* 25. 冒険者 */
	CardEffect['Adventurer'] = function*( Resolve_GetCardEffect ) {
		StartActionCardEffect( '財宝カードが2枚公開されるまでカードを引きます。' );

		let treasure_num = 0;
		while ( Game.player().Drawable() && treasure_num < 2 ) {
			let deck_top_card = Game.player().GetDeckTopCard();
			if ( IsTreasureCard( Cardlist, deck_top_card.card_no ) ) {
				treasure_num++;
			}
			Game.player().AddToOpen( deck_top_card, false );
			FBref_Players.child( Game.player().id ).set( Game.player() );
		}

		$('.action_buttons').append( MakeHTML_button( 'Adventurer Done', '確認' ) );

		yield;  // (1) 公開したカードを確認

		$('.action_buttons .Adventurer.Done').remove();  /* 完了ボタン消す */

		/* 公開したカードを片づける */
		while ( Game.player().Open.length > 0 ) {
			let card = Game.player().Open.pop();
			if ( IsTreasureCard( Cardlist, card.card_no ) ) {
				Game.player().AddToHandCards( card );
			} else {
				Game.player().AddToDiscardPile( card );
			}
		}

		FBref_Players.child( Game.player().id ).set( Game.player() )
		.then( EndActionCardEffect( Resolve_GetCardEffect ) );
	};

	$('.action_buttons').on( 'click', '.Adventurer.Done', function() {
		GenFuncs.Adventurer.next();  // (1) 再開
	} );





	/* 17. 基本 - 工房 */
	CardEffect['Workshop'] = function* ( Resolve_GetCardEffect ) {
		/* ゲーム未終了でコスト4以下のカードが1枚も無い状態はあり得ないのでチェック省略 */
		StartActionCardEffect( 'コスト4以下のカードを獲得して下さい。' )
		.then( function() {
			/* サプライのクラス書き換え */
			$('.SupplyArea').find('.card').addClass('Workshop_GetCard pointer');
			AddAvailableToSupplyCardIf( (card) => (
				card.cost        <= 4 &&
				card.cost_potion <= 0 &&
				card.cost_debt   <= 0
			) );
		} );

		yield;  // (1)
		EndActionCardEffect( Resolve_GetCardEffect );
	};


	/* 19. 基本 - 祝宴 */
	CardEffect['Feast'] = function* ( Resolve_GetCardEffect, playing_card_ID ) {
		/* ゲーム未終了でコスト5以下のカードが1枚も無い状態はあり得ないのでチェック省略 */
		StartActionCardEffect( 'コスト5以下のカードを獲得して下さい。' )
		.then( function() {
			Game.TrashCardByID( playing_card_ID );
			let updates = {};
			updates[`Players/${Game.player().id}`] = Game.player();  /* 更新 */
			updates['TrashPile'] = Game.TrashPile;
			return FBref_Game.update( updates );
		} )
		.then( function() {
			/* サプライのクラス書き換え */
			$('.SupplyArea').find('.card').addClass('Feast_GetCard pointer');
			AddAvailableToSupplyCardIf( (card) => (
				card.cost        <= 5 &&
				card.cost_potion <= 0 &&
				card.cost_debt   <= 0
			) );
		} );

		yield;  // (1)
		EndActionCardEffect( Resolve_GetCardEffect );
	};

	$('.SupplyArea').on( 'click', '.card.Workshop_GetCard,.Feast_GetCard', function() {
		let Workshop_or_Feast;
		if ( $(this).hasClass('Workshop_GetCard') ) Workshop_or_Feast = 'Workshop';
		if ( $(this).hasClass('Feast_GetCard') )    Workshop_or_Feast = 'Feast';

		const clicked_card_name_eng = $(this).attr('data-card-name-eng');
		const clicked_card = Game.Supply.byName(clicked_card_name_eng).LookTopCard();
		const clicked_card_ID = clicked_card.card_ID;

		if ( !$(this).hasClass('available') ) {
			alert('コストが大きいので獲得できません。' );   return;
		}

		Game.player().AddToDiscardPile( Game.GetCardByID( clicked_card_ID ) );

		let updates = {};
		updates[`Players/${Game.player().id}/DiscardPile`] = Game.player().DiscardPile;
		updates['Supply'] = Game.Supply;
		FBref_Game.update( updates )
		.then( GenFuncs[Workshop_or_Feast].next() );  // (1) 再開
	} );





	/* 22. 地下貯蔵庫 */
	CardEffect['Cellar'] = function* ( Resolve_GetCardEffect ) {
		StartActionCardEffect( '手札から任意の枚数を捨て札にして下さい。捨て札にした枚数だけカードを引きます。' )
		.then( $('.action_buttons').append( MakeHTML_button( 'Cellar Done', '完了' ) ) );

		let discarded_num = 0;
		let end = false;

		while (true) {
			$('.HandCards').children('.card').addClass('Cellar_Discard pointer');
			end = yield;  // (1)
			if (end) break;
			discarded_num++;
			FBref_Message.set( `捨て札にした枚数 ： ${discarded_num}枚` );
		}

		$('.action_buttons .Cellar.Done').remove();  /* 完了ボタン消す */
		Game.player().DrawCards( discarded_num );

		FBref_Players.child( Game.player().id ).set( Game.player() )
		.then( EndActionCardEffect( Resolve_GetCardEffect ) );
	};

	$('.HandCards').on( 'click', '.card.Cellar_Discard', function() {
		const clicked_card_ID = $(this).attr('data-card_ID');

		Game.player().AddToDiscardPile( Game.GetCardByID( clicked_card_ID ) );  /* 「地下貯蔵庫」 捨て札 */

		FBref_Players.child( Game.player().id ).update( {
			HandCards   : Game.player().HandCards,
			DiscardPile : Game.player().DiscardPile,
		} )
		.then( GenFuncs.Cellar.next(false) );  // (1) 再開
	} );

	$('.action_buttons').on( 'click', '.Cellar.Done', function() {
		GenFuncs.Cellar.next(true);  // (1) 再開
	} );





	/* 32. 礼拝堂 */
	CardEffect['Chapel'] = function* ( Resolve_GetCardEffect ) {
		StartActionCardEffect( '手札を4枚まで廃棄して下さい。' );

		$('.action_buttons').append( MakeHTML_button( 'Chapel Done', '完了' ) );

		let trashed_num = 0;
		let end = false;

		while ( trashed_num < 4 ) {
			$('.HandCards').children('.card').addClass('Chapel_Trash pointer');
			end = yield;  // (1)
			if ( end ) break;
			trashed_num++;
			FBref_Message.set( `あと ${(4 - trashed_num)} 枚廃棄できます。` );
		}

		$('.action_buttons .Chapel.Done').remove();  /* 完了ボタン消す */

		EndActionCardEffect( Resolve_GetCardEffect );
	};

	$('.HandCards').on( 'click', '.card.Chapel_Trash', function() {
		const clicked_card_ID = $(this).attr('data-card_ID');

		Game.TrashCardByID( clicked_card_ID );  /* 「礼拝堂」 廃棄 */

		let updates = {};
		updates[`Players/${Game.player().id}/HandCards`] = Game.player().HandCards;
		updates['TrashPile'] = Game.TrashPile;
		FBref_Game.update( updates )
		.then( GenFuncs.Chapel.next(false) );  // (1) 再開
	} );

	$('.action_buttons').on( 'click', '.Chapel.Done', function() {
		GenFuncs.Chapel.next(true);  // (1) 再開
	} );





	/* 27. 魔女 */
	CardEffect['Witch'] = function* ( Resolve_GetCardEffect ) {
		StartActionCardEffect( '呪いを獲得して下さい。' );

		/* 他のプレイヤーが終了時に送るEndシグナルを監視 */
		FBref_SignalEnd.on( 'value', function(snap) { if ( snap.val() ) GenFuncs.Witch.next(); } );  // (1) 再開

		for ( let id = Game.NextPlayerID(); id != Game.whose_turn_id; id = Game.NextPlayerID(id) ) {
			SendSignal( id, { Attack : true, card_name : 'Witch', } );
			FBref_MessageTo.child(id).set('呪いを獲得します。');  // reset

			yield;  // (1)
			FBref_SignalEnd.set(false);  /* reset */

			Show_OKbtn_OtherPlayer( id, 'Witch' );
			yield;  // (2)
			Hide_OKbtn_OtherPlayer( id, 'Witch' );
			FBref_MessageTo.child(id).set('');  // reset
		}

		/* 終了処理 */
		FBref_SignalEnd.off();  /* 監視終了 */
		Game.Players.forEach( (player) => player.ResetFaceDown(true) );  // 公開したリアクションカードを戻す
		EndActionCardEffect( Resolve_GetCardEffect );
	};

	AttackEffect['Witch'] = function() {  /* アタックされる側 */
		Game.Me().AddToDiscardPile( Game.Supply.byName('Curse').GetTopCard() );

		let updates = {};
		updates['Supply'] = Game.Supply;
		updates[`Players/${myid}/DiscardPile`] = Game.Me().DiscardPile;
		FBref_Game.update( updates ).then( EndAttackCardEffect );  // Endシグナルを送る
	};

	/* 確認 */
	$('.OtherPlayers-wrapper' ).on( 'click', '.ok.Witch', function() {
		GenFuncs.Witch.next();  // (2) 再開
	} );





	/* 29. 民兵 */
	CardEffect['Militia'] = function* ( Resolve_GetCardEffect ) {
		StartActionCardEffect( '手札が3枚になるまで捨てて下さい。' );

		/* 他のプレイヤーが終了時に送るEndシグナルを監視 */
		FBref_SignalEnd.on( 'value', function(snap) { if ( snap.val() ) GenFuncs.Militia.next(); } );  // (1) 再開

		for ( let id = Game.NextPlayerID(); id != Game.whose_turn_id; id = Game.NextPlayerID(id) ) {
			SendSignal( id, { Attack : true, card_name : 'Militia', } );
			FBref_MessageTo.child(id).set('手札が3枚になるまで捨てて下さい。');  // reset

			yield;  // (1)
			FBref_SignalEnd.set(false);  /* reset */

			Show_OKbtn_OtherPlayer( id, 'Militia' );
			yield;  // (2)
			Hide_OKbtn_OtherPlayer( id, 'Militia' );
			FBref_MessageTo.child(id).set('');  // reset
		}

		/* 終了処理 */
		FBref_SignalEnd.off();  /* 監視終了 */
		Game.Players.forEach( (player) => player.ResetFaceDown(true) );  // 公開したリアクションカードを戻す
		EndActionCardEffect( Resolve_GetCardEffect );
	};

	AttackEffect['Militia'] = function*() {  /* アタックされる側 */
		while ( $('.MyHandCards').children('.card').length > 3 ) {
			$('.MyHandCards').children('.card').addClass('Militia_Discard pointer');
			yield;  // (a)
		}
		EndAttackCardEffect();  // Endシグナルを送る
	};

	$('.MyHandCards').on( 'click', '.card.Militia_Discard', function() {
		const clicked_card_ID = $(this).attr('data-card_ID');

		Game.Me().AddToDiscardPile( Game.GetCardByID( clicked_card_ID ) );

		FBref_Players.child( myid ).update( {
			HandCards   : Game.Me().HandCards,
			DiscardPile : Game.Me().DiscardPile,
		} )
		.then( GenFuncs.AttackEffect_Militia.next() );  // (a) 再開
	} );

	/* 確認 */
	$('.OtherPlayers-wrapper' ).on( 'click', '.ok.Militia', function() {
		GenFuncs.Militia.next();  // (1) 再開
	} );





	/* 31. 役人 */
	CardEffect['Bureaucrat'] = function* ( Resolve_GetCardEffect ) {
		StartActionCardEffect( 'プレイヤーは銀貨を山札に獲得します。\
			他のプレイヤーは手札に勝利点カードが1枚以上ある場合はそのうち1枚を山札に戻してください。そうでない場合は手札を公開してください。' );

		let silver = Game.Supply.byName('Silver').GetTopCard();
		silver.face = true;
		Game.player().PutBackToDeck( silver );  /* 銀貨を山札の一番上に獲得 */

		let updates = {};
		updates[`Players/${Game.player().id}/Deck`] = Game.player().Deck;
		updates['Supply'] = Game.Supply;
		FBref_Game.update( updates );

		/* 他のプレイヤーが終了時に送るEndシグナルを監視 */
		FBref_SignalEnd.on( 'value', function(snap) { if ( snap.val() ) GenFuncs.Bureaucrat.next(); } );  // (1) 再開

		for ( let id = Game.NextPlayerID(); id != Game.whose_turn_id; id = Game.NextPlayerID(id) ) {
			SendSignal( id, { Attack : true, card_name : 'Bureaucrat', } );
			FBref_MessageTo.child(id)
				.set('手札に勝利点カードが1枚以上ある場合はそのうち1枚を山札に戻してください。そうでない場合は手札を公開してください。');

			yield;  // (1)
			FBref_SignalEnd.set(false);  /* reset */

			Show_OKbtn_OtherPlayer( id, 'Bureaucrat' );
			yield;  // (2)
			Hide_OKbtn_OtherPlayer( id, 'Bureaucrat' );
			FBref_MessageTo.child(id).set('');  // reset
		}

		/* 終了処理 */
		FBref_SignalEnd.off();  /* 監視終了 */
		Game.Players.forEach( (player) => player.ResetFaceDown(true) );  // 公開したリアクションカードを戻す
		EndActionCardEffect( Resolve_GetCardEffect );
	};

	$('.OtherPlayers-wrapper' ).on( 'click', '.ok.Bureaucrat', function() {
		GenFuncs.Bureaucrat.next();  // (2) 再開
	} );

	AttackEffect['Bureaucrat'] = function*() {  /* アタックされる側 */
		const $victory_cards = $('.MyHandCards').children('.card')
			.filter( function() { return IsVictoryCard( Cardlist, $(this).attr('data-card_no') ) } );

		if ( $victory_cards.length == 0 ) {
			Game.Me().OpenHandCards();  /* 手札を公開 */
			EndAttackCardEffect();  // Endシグナルを送る
			return;
		}

		$victory_cards.addClass('Bureaucrat_PutBack pointer');

		yield;  // (a)
		EndAttackCardEffect();  // Endシグナルを送る
	};

	$('.MyHandCards').on( 'click', '.card.Bureaucrat_PutBack', function() {
		const clicked_card_ID = $(this).attr('data-card_ID');

		let victory_card = Game.GetCardByID( clicked_card_ID );
		victory_card.face = true;
		Game.Me().PutBackToDeck( victory_card );

		FBref_Players.child( myid ).update( {
			HandCards : Game.Me().HandCards,
			Deck      : Game.Me().Deck,
		} )
		.then( GenFuncs.AttackEffect_Bureaucrat.next() );  // (a) 再開
	} );





	/* 24. 泥棒 */
	CardEffect['Thief'] = function* ( Resolve_GetCardEffect ) {
		StartActionCardEffect( '他のプレイヤーの山札の上から2枚を公開し，その中に財宝カードがあればそのうち1枚を選んで廃棄します。\
			これによって廃棄されたカードのうち好きな枚数を獲得できます。' );

		/* 他のプレイヤーが終了時に送るEndシグナルを監視 */
		FBref_SignalEnd.on( 'value', function(snap) { if ( snap.val() ) GenFuncs.Thief.next(); } );  // (1) 再開

		let trashed_card_IDs = [];

		for ( let id = Game.NextPlayerID(); id != Game.whose_turn_id; id = Game.NextPlayerID(id) ) {
			SendSignal( id, { Attack : true, card_name : 'Thief', } );
			FBref_MessageTo.child(id)
				.set('山札の上から2枚を公開してください。財宝カードが公開された場合そのうち1枚が廃棄されます。廃棄されたカード以外は捨て札にしてください。');

			yield;  // (1)
			FBref_SignalEnd.set(false);  /* reset */

			let trasure_cards = 
				$(`.OtherPlayer[data-player_id=${id}] .sOpen`)
					.children('.card')
					.filter( function() { return IsTreasureCard( Cardlist, $(this).attr('data-card_no') ) } );

			if ( trasure_cards.length > 0 ) {
				trasure_cards.addClass('Thief_Trash pointer');
				let trashed_card_ID = yield;  // (2)
				if ( trashed_card_ID != undefined ) trashed_card_IDs.push( trashed_card_ID );
			}

			Show_OKbtn_OtherPlayer( id, 'Thief' );
			yield;  // (3)
			Hide_OKbtn_OtherPlayer( id, 'Thief' );
			FBref_MessageTo.child(id).set('');  // reset

			/* 公開したカードの残りを捨て札に */
			let player = Game.Players[id];
			player.Open.forEach( (card) => player.AddToDiscardPile( card ) );
			player.Open = [];
			FBref_Players.child(id).update( {
				DiscardPile : player.DiscardPile,
				Open        : player.Open,
			} );
		}

		FBref_SignalEnd.off();  /* 監視終了 */


		if ( trashed_card_IDs.length > 0 ) {
			/* 廃棄したカードの獲得画面 */
			ShowDialog( {
				message  : '廃棄したカードから好きな枚数獲得してください。',
				contents : '',
				buttons  : MakeHTML_button( 'ok', 'OK' ),
			} );

			trashed_card_IDs.forEach( function(id) {
				const card = Game.GetCardByID( id, false );
				$('.dialog_contents').append( MakeHTML_Card(card) );
			} );
			$('.dialog_contents').find('.card').addClass('Thief_GainTrashedCard pointer');

			yield;  // (4)
			HideDialog();
		}

		/* 終了処理 */
		FBref_SignalEnd.off();  /* 監視終了 */
		Game.Players.forEach( (player) => player.ResetFaceDown(true) );  // 公開したリアクションカードを戻す
		EndActionCardEffect( Resolve_GetCardEffect );
	};

	AttackEffect['Thief'] = function*() {  /* アタックされる側 */
		/* 山札から2枚めくり公開 */
		Game.Me().AddToOpen( Game.Me().GetDeckTopCard() );
		Game.Me().AddToOpen( Game.Me().GetDeckTopCard() );
		FBref_Players.child( myid ).update( {
			Open        : Game.Me().Open,
			Deck        : Game.Me().Deck,
			DiscardPile : Game.Me().DiscardPile,
		} );
		EndAttackCardEffect();  // Endシグナルを送る
	};

	/* 廃棄 */
	$('.OtherPlayers-wrapper' ).on( 'click', '.sOpen .Thief_Trash', function() {
		const player_id = $(this).parents('.OtherPlayer').attr('data-player_id');
		const clicked_card_ID = $(this).attr('data-card_ID');
		Game.TrashCardByID( clicked_card_ID );

		let updates = {};
		updates['TrashPile'] = Game.TrashPile;
		updates[`Players/${player_id}/Open`] = Game.Players[ player_id ].Open;
		FBref_Game.update( updates )
		.then( GenFuncs.Thief.next( clicked_card_ID ) );  // (2) 再開
	} );

	/* 確認 */
	$('.OtherPlayers-wrapper' ).on( 'click', '.ok.Thief', function() {
		GenFuncs.Thief.next();  // (3) 再開
	} );

	/* 廃棄したカードの獲得 */
	$('.dialog_contents').on( 'click', '.Thief_GainTrashedCard', function() {
		const clicked_card_ID = $(this).attr('data-card_ID');
		Game.player().AddToDiscardPile( Game.GetCardByID( clicked_card_ID ) );
		$(this).remove();  /* クリックしたカードを削除 */

		let updates = {};
		updates['TrashPile'] = Game.TrashPile;
		updates[`Players/${myid}/DiscardPile`] = Game.player().DiscardPile;
		FBref_Game.update( updates );
	} );

	$('.dialog_buttons').on( 'click', '.ok', function() {
		HideDialog();
		GenFuncs.Thief.next();  // (4) 再開
	} );





	/* 28. 密偵 */
	CardEffect['Spy'] = function* ( Resolve_GetCardEffect ) {
		StartActionCardEffect( '各プレイヤー（自分を含む）の山札の上から1枚を公開し，それを捨て札にするかそのまま山札に戻すか選んでください。' );

		if ( Game.player().Drawable() ) {
			/* 山札から1枚めくり公開 */
			Game.player().AddToOpen( Game.player().GetDeckTopCard() );

			FBref_Players.child( Game.player().id ).update( {
				Open        : Game.player().Open,
				Deck        : Game.player().Deck,
				DiscardPile : Game.player().DiscardPile,
			} );

			$('.action_buttons')
				.html('')
				.append( MakeHTML_button( 'Spy Discard', '捨て札にする' ) )
				.append( MakeHTML_button( 'Spy PutBackToDeck', 'そのまま戻す' ) );

			yield;  // (1)
			$('.action_buttons').html('');
		}

		/* 他のプレイヤーが終了時に送るEndシグナルを監視 */
		FBref_SignalEnd.on( 'value', function(snap) { if ( snap.val() ) GenFuncs.Spy.next(); } );  // (1) 再開

		let trashed_card_IDs = [];

		for ( let id = Game.NextPlayerID(); id != Game.whose_turn_id; id = Game.NextPlayerID(id) ) {
			SendSignal( id, { Attack : true, card_name : 'Spy', } );
			FBref_MessageTo.child(id)
				.set('山札の上から1枚を公開してください。公開されたカードは捨て札になるか山札に戻されます。');

			yield;  // (2)
			FBref_SignalEnd.set(false);  /* reset */

			if ( Game.Players[id].Open.length > 0 ) {  // 1枚以上公開できたとき（drawができないときは0に）
				$(`.OtherPlayer[data-player_id=${id}] .OtherPlayer_Buttons`)
					.append( MakeHTML_button( 'Spy Discard', '捨て札にする' ) )
					.append( "<div class='clear'></div>" )
					.append( MakeHTML_button( 'Spy PutBackToDeck', 'そのまま戻す' ) );

				yield;  // (3)
				$(`.OtherPlayer[data-player_id=${id}] .OtherPlayer_Buttons .Spy`).remove();
			}

			Show_OKbtn_OtherPlayer( id, 'Spy' );
			yield;  // (4)
			Hide_OKbtn_OtherPlayer( id, 'Spy' );
			FBref_MessageTo.child(id).set('');  // reset
		}

		/* 終了処理 */
		FBref_SignalEnd.off();  /* 監視終了 */
		Game.Players.forEach( (player) => player.ResetFaceDown(true) );  // 公開したリアクションカードを戻す
		EndActionCardEffect( Resolve_GetCardEffect );
	};

	$('.action_buttons').on( 'click', '.Spy.Discard,.PutBackToDeck', function() {
		let Discard_or_PutBackToDeck;
		if ( $(this).hasClass('Discard') )       Discard_or_PutBackToDeck = 'Discard';
		if ( $(this).hasClass('PutBackToDeck') ) Discard_or_PutBackToDeck = 'PutBackToDeck';

		let card = Game.player().Open[0];
		if ( Discard_or_PutBackToDeck == 'Discard' ) {
			Game.player().AddToDiscardPile( card );
		} else {
			card.face = true;
			Game.player().PutBackToDeck( card );
		}
		Game.player().Open = [];

		FBref_Players.child( Game.player().id ).set( Game.player() )
		.then( GenFuncs.Spy.next() );  // (1) 再開
	} );


	/* 他のプレイヤー */
	AttackEffect['Spy'] = function*() {  /* アタックされる側 */
		/* 山札から1枚めくり公開 */
		Game.Me().AddToOpen( Game.Me().GetDeckTopCard() );
		FBref_Players.child( myid ).set( Game.Me() ).then( EndAttackCardEffect );  // Endシグナルを送る
	};

	$('.OtherPlayers-wrapper' ).on( 'click', '.Spy.Discard,.PutBackToDeck', function() {
		let Discard_or_PutBackToDeck;
		if ( $(this).hasClass('Discard') )       Discard_or_PutBackToDeck = 'Discard';
		if ( $(this).hasClass('PutBackToDeck') ) Discard_or_PutBackToDeck = 'PutBackToDeck';

		const player_id = $(this).parents('.OtherPlayer').attr('data-player_id');

		player = Game.Players[ player_id ];
		let card = player.Open[0];
		if ( Discard_or_PutBackToDeck == 'Discard' ) {
			player.AddToDiscardPile( card );
		} else {
			card.face = true;
			player.PutBackToDeck( card );
		}
		player.Open = [];

		FBref_Players.child( player_id ).set( player )
		.then( GenFuncs.Spy.next() );  // (3) 再開
	} );

	/* 確認 */
	$('.OtherPlayers-wrapper' ).on( 'click', '.ok.Spy', function() {
		GenFuncs.Spy.next();  // (4) 再開
	} );





	/* 14. 玉座の間 */
	CardEffect['Throne Room'] = function* ( Resolve_GetCardEffect ) {
		StartActionCardEffect('');

		let action_cards = $('.HandCards').children('.card')
			.filter( function() { return IsActionCard( Cardlist, $(this).attr('data-card_no') ) } );

		if ( action_cards.length > 0 ) {
			FBref_Message.set( '手札のアクションカードを1枚選んで下さい。' );

			action_cards.addClass('Throne_Room_UseTwice pointer');

			const [clicked_card_no, clicked_card_ID] = yield;  // (1) アクションカード選択待機

			GetCardEffect( clicked_card_no, clicked_card_ID )  /* 1回目 */
			.then( () => GetCardEffect( clicked_card_no, clicked_card_ID ) )  /* 2回目 */
			.then( () => EndActionCardEffect( Resolve_GetCardEffect ) );
		} else {
			EndActionCardEffect( Resolve_GetCardEffect );
		}
	};


	$('.HandCards').on( 'click', '.card.Throne_Room_UseTwice', function() {
		const clicked_card_ID = $(this).attr('data-card_ID');
		const clicked_card_no = $(this).attr('data-card_no');

		/* 選んだアクションカードを場に出す */
		Game.player().AddToPlayArea( Game.GetCardByID( clicked_card_ID ) );

		FBref_Players.child( Game.player().id ).update( {
			HandCards : Game.player().HandCards,
			PlayArea  : Game.player().PlayArea,
		} )
		.then( GenFuncs['Throne Room'].next( [clicked_card_no, clicked_card_ID] ) );  // (1) 再開
	} );

} );
