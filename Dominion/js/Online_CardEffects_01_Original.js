
$( function() {



//	CardEffect['Copper']         = function* () {}  /*  1. 銅貨 */
	CardEffect['Silver']         = function* () {}  /*  2. 銀貨 */
	CardEffect['Gold']           = function* () {}  /*  3. 金貨 */
	CardEffect['Estate']         = function* () {}  /*  4. 屋敷 */
	CardEffect['Duchy']          = function* () {}  /*  5. 公領 */
	CardEffect['Province']       = function* () {}  /*  6. 属州 */
	CardEffect['Curse']          = function* () {}  /*  7. 呪い */
	CardEffect['Market']         = function* () {}  /*  8. 市場 */
//	CardEffect['Remodel']        = function* () {}  /*  9. 改築 */
	CardEffect['Smithy']         = function* () {}  /* 10. 鍛冶屋 */
//	CardEffect['Moneylender']    = function* () {}  /* 11. 金貸し */
	CardEffect['Woodcutter']     = function* () {}  /* 12. 木こり */
//	CardEffect['Council Room']   = function* () {}  /* 13. 議事堂 */
//	CardEffect['Throne Room']    = function* () {}  /* 14. 玉座の間 */
	CardEffect['Laboratory']     = function* () {}  /* 15. 研究所 */
//	CardEffect['Mine']           = function* () {}  /* 16. 鉱山 */
//	CardEffect['Workshop']       = function* () {}  /* 17. 工房 */
//	CardEffect['Chancellor']     = function* () {}  /* 18. 宰相 */
//	CardEffect['Feast']          = function* () {}  /* 19. 祝宴 */
	CardEffect['Festival']       = function* () {}  /* 20. 祝祭 */
//	CardEffect['Library']        = function* () {}  /* 21. 書庫 */
//	CardEffect['Cellar']         = function* () {}  /* 22. 地下貯蔵庫 */
//	CardEffect['Gardens']        = function* () {}  /* 23. 庭園 */
//	CardEffect['Thief']          = function* () {}  /* 24. 泥棒 */
//	CardEffect['Adventurer']     = function* () {}  /* 25. 冒険者 */
	CardEffect['Moat']           = function* () {}  /* 26. 堀 */
//	CardEffect['Witch']          = function* () {}  /* 27. 魔女 */
//	CardEffect['Spy']            = function* () {}  /* 28. 密偵 */
//	CardEffect['Militia']        = function* () {}  /* 29. 民兵 */
	CardEffect['Village']        = function* () {}  /* 30. 村 */
//	CardEffect['Bureaucrat']     = function* () {}  /* 31. 役人 */
//	CardEffect['Chapel']         = function* () {}  /* 32. 礼拝堂 */




	/* 13. 議事堂 */
	CardEffect['Council Room'] = function* () {
		let updates = {};
		for ( let i = Game.NextPlayerID(); i != Game.whose_turn_id; i = Game.NextPlayerID(i) ) {
			Game.Players[i].DrawCards(1);
			updates[i] = Game.Players[i];
		}
		yield FBref_Players.update( updates );
	};





	/* 11. 金貸し */
	CardEffect['Moneylender'] = function* () {
		const Coppers = Game.player().HandCards
			.filter( (card) => ( card.card_no == CardName2No['Copper'] ) );

		if ( Coppers.length <= 0 ) { alert( '手札に銅貨がありません。' );  return; }

		yield FBref_Message.set( '手札の銅貨を1枚廃棄して下さい。' );

		$('.HandCards').children('.card')
			.filter( function() { return $(this).attr('data-card_no') == CardName2No['Copper'] } )
			.addClass('Moneylender_Trash pointer');  /* 手札のカードのクリック動作を廃棄するカードの選択に変更 */

		yield new Promise( resolve => Resolve['Moneylender_Trash'] = resolve );
	};

	$('.HandCards').on( 'click', '.card.Moneylender_Trash', function() {
		const clicked_card_ID = $(this).attr('data-card_ID');

		Game.TrashCardByID( clicked_card_ID );  /* 「金貸し」 銅貨廃棄 */
		Game.TurnInfo.coin += 3;

		let updates = {};
		updates[`Players/${Game.player().id}/HandCards`] = Game.player().HandCards;
		updates['TrashPile'] = Game.TrashPile;
		updates['TurnInfo/coin'] = Game.TurnInfo.coin;
		FBref_Game.update( updates )
		.then( () => Resolve['Moneylender_Trash']() );  // 再開
	} );





	/* 9. 基本 - 改築 */
	CardEffect['Remodel'] = function* () {
		if ( Game.player().HandCards.length <= 0 ) {
			alert( '手札にカードがありません。' );
			return;
		}

		yield FBref_Message.set( '手札のカードを1枚廃棄して下さい。' );

		/* 手札のカードのクリック動作を廃棄するカードの選択に変更 */
		$('.HandCards').children('.card').addClass('Remodel_Trash pointer');

		const TrashedCardCost
			= yield new Promise( resolve => Resolve['Remodel_Trash'] = resolve );

		yield FBref_Message.set(
			`コストが廃棄したカード+2(=${TrashedCardCost.coin + 2} )コインまでのカードを獲得してください。` );

		/* サプライのクラス書き換え */
		$('.SupplyArea').find('.card').addClass('Remodel_GetCard pointer');

		AddAvailableToSupplyCardIf(
			card => CostOp( '<=',
				new CCost(card),
				new CCost([TrashedCardCost.coin + 2, TrashedCardCost.potion, TrashedCardCost.debt]) ) );

		// AddAvailableToSupplyCardIf( card => (
		// 	card.cost        <= TrashedCardCost.coin + 2 &&
		// 	card.cost_potion <= TrashedCardCost.potion &&
		// 	card.cost_debt   <= TrashedCardCost.debt
		// ) );
		if ( $('.SupplyArea').find('.available').length <= 0 ) return;

		yield new Promise( resolve => Resolve['Remodel_GetCard'] = resolve );
	};


	/* 16. 基本 - 鉱山 */
	CardEffect['Mine'] = function* () {
		const Treasure = Game.player().HandCards
			.filter( (card) => IsTreasureCard( Cardlist, card.card_no ) );

		if ( Treasure.length <= 0 ) { alert( '手札に財宝カードがありません。' );  return; }

		yield FBref_Message.set( '手札の財宝カードを1枚廃棄して下さい。' );

		$('.HandCards').children('.card')
			.filter( function() { return IsTreasureCard( Cardlist, $(this).attr('data-card_no') ); } )
			.addClass('Mine_Trash pointer');  /* 手札のカードのクリック動作を廃棄するカードの選択に変更 */

		const TrashedCardCost
			= yield new Promise( resolve => Resolve['Mine_Trash'] = resolve );

		yield FBref_Message.set(
			`コストが廃棄したカード+3(=${TrashedCardCost.coin + 3} )コインまでの財宝カードを獲得してください。` );

		/* サプライのクラス書き換え */
		$('.SupplyArea').find('.card').addClass('Mine_GetCard pointer');
		AddAvailableToSupplyCardIf( ( card, card_no ) => (
			card.cost        <= TrashedCardCost.coin + 3 &&
			card.cost_potion <= TrashedCardCost.potion &&
			card.cost_debt   <= TrashedCardCost.debt &&
			IsTreasureCard( Cardlist, card_no )
		));

		yield new Promise( resolve => Resolve['Mine_GetCard'] = resolve );
	};

	$('.HandCards').on( 'click', '.card.Remodel_Trash,.Mine_Trash', function() {
		let Remodel_or_Mine;
		if ( $(this).hasClass('Remodel_Trash') ) Remodel_or_Mine = 'Remodel_Trash';
		if ( $(this).hasClass('Mine_Trash') )    Remodel_or_Mine = 'Mine_Trash';

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
		.then( () => Resolve[Remodel_or_Mine]( TrashedCardCost ) );
	} );

	$('.SupplyArea').on( 'click', '.card.Remodel_GetCard,.Mine_GetCard', function() {
		let Remodel_or_Mine;
		let DiscardPile_or_HandCards;
		if ( $(this).hasClass('Remodel_GetCard') ) {
			Remodel_or_Mine = 'Remodel_GetCard';
			DiscardPile_or_HandCards = 'DiscardPile';
		}
		if ( $(this).hasClass('Mine_GetCard') ) {
			Remodel_or_Mine = 'Mine_GetCard';
			DiscardPile_or_HandCards = 'HandCards';
		}

		const clicked_card_name_eng = $(this).attr('data-card-name-eng');
		const clicked_card = Game.Supply.byName(clicked_card_name_eng).LookTopCard();
		const clicked_card_ID = clicked_card.card_ID;

		if ( !$(this).hasClass('available') ) {
			alert('コストが大きいので獲得できません。' );
			return;
		}

		Game.player()[`AddTo${DiscardPile_or_HandCards}`]( Game.GetCardByID( clicked_card_ID ) );

		let updates = {};
		updates[`Players/${Game.player().id}/${DiscardPile_or_HandCards}`] = Game.player()[DiscardPile_or_HandCards];
		updates['Supply'] = Game.Supply;
		FBref_Game.update( updates )
		.then( () => Resolve[Remodel_or_Mine]() );
	} );





	/* 18. 宰相 */
	CardEffect['Chancellor'] = function* () {
		yield FBref_Message.set( '山札を捨て札に置きますか？' );

		$('.action_buttons')
			.html(
				MakeHTML_button( 'Chancellor Discard', '捨て札におく' ) +
				MakeHTML_button( 'Chancellor', '何もしない' ) );

		const discard
			= yield new Promise( resolve => Resolve['Chancellor'] = resolve );

		$('.action_buttons').html('');  // reset

		if ( discard ) {
			Game.player().Deck.reverse();  /* 山札をそのままひっくり返して捨て山に置く */
			Game.player().Deck.forEach( (card) => Game.player().AddToDiscardPile(card) );
			Game.player().Deck = [];
			yield FBref_Players.child( Game.player().id ).set( Game.player() );
		}
	};

	$('.action_buttons').on( 'click', '.Chancellor', function() {
		Resolve['Chancellor']( $(this).hasClass('Discard') );  // 再開
	} );





	/* 21. 書庫 */
	CardEffect['Library'] = function* () {
		yield FBref_Message.set( '手札が7枚になるまでカードを引きます。アクションカードを引いたら脇に置くことができます。' );

		while ( Game.player().Drawable() && Game.player().HandCards.length < 7 ) {
			const deck_top_card = Game.player().GetDeckTopCard();

			if ( IsActionCard( Cardlist, deck_top_card.card_no ) ) {
				yield FBref_Players.child( `${Game.player().id}/Deck` ).set( Game.player().Deck );

				ShowDialog( {
					message  : `${Cardlist[ deck_top_card.card_no ].name_jp}を脇に置きますか？`,
					contents : MakeHTML_Card(deck_top_card),
					buttons  :
						MakeHTML_button( 'Library SetAside', '脇に置く' ) + 
						MakeHTML_button( 'Library', '手札に加える' ),
				} );

				const set_aside
					= yield new Promise( resolve => Resolve['Library'] = resolve );

				HideDialog();

				if ( set_aside ) {
					Game.player().AddToAside( deck_top_card );
					yield FBref_Players.child( Game.player().id ).set( Game.player() );
					continue;
				}
			}

			Game.player().AddToHandCards( deck_top_card );
			yield FBref_Players.child( Game.player().id ).set( Game.player() );
		}

		$('.action_buttons').append( MakeHTML_button( 'Library Done', '確認' ) );

		// 脇に置いたカードを確認
		yield new Promise( resolve => Resolve['Library_Done'] = resolve );

		$('.action_buttons .Library.Done').remove();  /* 完了ボタン消す */

		/* move cards in Aside to DiscardPile */
		Game.player().Aside.forEach( (card) => Game.player().AddToDiscardPile(card) );
		Game.player().Aside = [];

		yield FBref_Players.child( Game.player().id ).set( Game.player() );
	};

	/* 確認 */
	$('.dialog_buttons' ).on( 'click', '.Library', function() {
		Resolve['Library']( $(this).hasClass('SetAside') );  // 再開
	} );

	$('.action_buttons').on( 'click', '.Library.Done', function() {
		Resolve['Library_Done']();  // 再開
	} );





	/* 25. 冒険者 */
	CardEffect['Adventurer'] = function*() {
		yield FBref_Message.set( '財宝カードが2枚公開されるまでカードを引きます。' );

		let treasure_num = 0;
		while ( Game.player().Drawable() && treasure_num < 2 ) {
			const deck_top_card = Game.player().GetDeckTopCard();
			if ( IsTreasureCard( Cardlist, deck_top_card.card_no ) )  treasure_num++;
			Game.player().AddToOpen( deck_top_card );
			yield FBref_Players.child( Game.player().id ).set( Game.player() );
		}

		$('.action_buttons').append( MakeHTML_button( 'Adventurer Done', '確認' ) );

		// 公開したカードを確認
		yield new Promise( resolve => Resolve['Adventurer'] = resolve );

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

		yield FBref_Players.child( Game.player().id ).set( Game.player() );
	};

	$('.action_buttons').on( 'click', '.Adventurer.Done', () => Resolve['Adventurer']() );  // 再開





	/* 17. 基本 - 工房 */
	CardEffect['Workshop'] = function* () {
		/* ゲーム未終了でコスト4以下のカードが1枚も無い状態はあり得ないのでチェック省略 */
		yield FBref_Message.set( 'コスト4以下のカードを獲得して下さい。' );

		/* サプライのクラス書き換え */
		$('.SupplyArea').find('.card').addClass('Workshop_GetCard pointer');
		AddAvailableToSupplyCardIf( card => (
			card.cost        <= 4 &&
			card.cost_potion <= 0 &&
			card.cost_debt   <= 0
		) );

		yield new Promise( resolve => Resolve['Workshop_GetCard'] = resolve );
	};


	/* 19. 基本 - 祝宴 */
	CardEffect['Feast'] = function* ( playing_card_ID ) {
		/* ゲーム未終了でコスト5以下のカードが1枚も無い状態はあり得ないのでチェック省略 */
		yield FBref_Message.set( 'コスト5以下のカードを獲得して下さい。' );

		Game.TrashCardByID( playing_card_ID );
		let updates = {};
		updates[`Players/${Game.player().id}`] = Game.player();  /* 更新 */
		updates['TrashPile'] = Game.TrashPile;
		yield FBref_Game.update( updates );

		/* サプライのクラス書き換え */
		$('.SupplyArea').find('.card').addClass('Feast_GetCard pointer');

		AddAvailableToSupplyCardIf(
			card => CostOp( '<=', new CCost(card), new CCost([5,0,0]) ) );

		// AddAvailableToSupplyCardIf( card => (
		// 	card.cost        <= 5 &&
		// 	card.cost_potion <= 0 &&
		// 	card.cost_debt   <= 0
		// ) );

		yield new Promise( resolve => Resolve['Feast_GetCard'] = resolve );
	};

	$('.SupplyArea').on( 'click', '.card.Workshop_GetCard,.Feast_GetCard', function() {
		let Workshop_or_Feast;
		if ( $(this).hasClass('Workshop_GetCard') ) Workshop_or_Feast = 'Workshop_GetCard';
		if ( $(this).hasClass('Feast_GetCard') )    Workshop_or_Feast = 'Feast_GetCard';

		const clicked_card_name_eng = $(this).attr('data-card-name-eng');
		const clicked_card = Game.Supply.byName(clicked_card_name_eng).LookTopCard();
		const clicked_card_ID = clicked_card.card_ID;

		if ( !$(this).hasClass('available') ) {
			alert('コストが大きいので獲得できません。' );  return;
		}

		Game.player().AddToDiscardPile( Game.GetCardByID( clicked_card_ID ) );

		let updates = {};
		updates[`Players/${Game.player().id}/DiscardPile`] = Game.player().DiscardPile;
		updates['Supply'] = Game.Supply;
		FBref_Game.update( updates )
		.then( () => Resolve[Workshop_or_Feast]() );  // 再開
	} );





	/* 22. 地下貯蔵庫 */
	CardEffect['Cellar'] = function* () {
		yield FBref_Message.set( '手札から任意の枚数を捨て札にして下さい。捨て札にした枚数だけカードを引きます。' )
		
		$('.action_buttons').append( MakeHTML_button( 'Cellar Done', '完了' ) );

		let discarded_num = 0;

		while (true) {
			$('.HandCards').children('.card').addClass('Cellar_Discard pointer');
			const end = yield new Promise( resolve => Resolve['Cellar_Discard'] = resolve );
			if (end) break;
			discarded_num++;
			yield FBref_Message.set( `捨て札にした枚数 ： ${discarded_num}枚` );
		}

		$('.action_buttons .Cellar.Done').remove();  /* 完了ボタン消す */
		Game.player().DrawCards( discarded_num );

		yield FBref_Players.child( Game.player().id ).set( Game.player() );
	};

	$('.HandCards').on( 'click', '.card.Cellar_Discard', function() {
		const clicked_card_ID = $(this).attr('data-card_ID');

		Game.player().AddToDiscardPile( Game.GetCardByID( clicked_card_ID ) );  /* 「地下貯蔵庫」 捨て札 */

		FBref_Players.child( Game.player().id ).update( {
			HandCards   : Game.player().HandCards,
			DiscardPile : Game.player().DiscardPile,
		} )
		.then( () => Resolve['Cellar_Discard'](false) );  // 再開
	} );

	$('.action_buttons').on( 'click', '.Cellar.Done', function() {
		Resolve['Cellar_Discard'](true);  // 再開
	} );





	/* 32. 礼拝堂 */
	CardEffect['Chapel'] = function* () {
		yield FBref_Message.set( '手札を4枚まで廃棄して下さい。' );

		$('.action_buttons').append( MakeHTML_button( 'Chapel Done', '完了' ) );

		let trashed_num = 0;

		while ( trashed_num < 4 ) {
			$('.HandCards').children('.card').addClass('Chapel_Trash pointer');
			const end = yield new Promise( resolve => Resolve['Chapel_Trash'] = resolve );
			if ( end ) break;
			trashed_num++;
			yield FBref_Message.set( `あと ${(4 - trashed_num)} 枚廃棄できます。` );
		}

		$('.action_buttons .Chapel.Done').remove();  /* 完了ボタン消す */
	};

	$('.HandCards').on( 'click', '.card.Chapel_Trash', function() {
		const clicked_card_ID = $(this).attr('data-card_ID');

		Game.TrashCardByID( clicked_card_ID );  /* 「礼拝堂」 廃棄 */

		let updates = {};
		updates[`Players/${Game.player().id}/HandCards`] = Game.player().HandCards;
		updates['TrashPile'] = Game.TrashPile;
		FBref_Game.update( updates )
		.then( () => Resolve['Chapel_Trash'](false) );  // 再開
	} );

	$('.action_buttons').on( 'click', '.Chapel.Done', () => Resolve['Chapel_Trash'](true) );  // 再開





	/* 27. 魔女 */
	CardEffect['Witch'] = function* () {
		yield FBref_Message.set( '呪いを獲得して下さい。' );

		for ( let id = Game.NextPlayerID(); id != Game.whose_turn_id; id = Game.NextPlayerID(id) ) {
			if ( Game.TurnInfo.Revealed_Moat[id] ) continue;  // 堀を公開していたらスキップ
			yield Monitor_FBref_SignalAttackEnd_on( 'Witch' );  // End受信 -> Resolve['Witch']()
			yield FBref_MessageTo.child(id).set('呪いを獲得します。');

			Game.Players[id].AddToDiscardPile( Game.Supply.byName('Curse').GetTopCard() );

			let updates = {};
			updates['Supply'] = Game.Supply;
			updates[`Players/${id}/DiscardPile`] = Game.Players[id].DiscardPile;
			yield FBref_Game.update( updates );


			// yield SendSignal( id, {
			// 	Attack    : true,
			// 	card_name : 'Witch',
			// 	Message   : '呪いを獲得します。',
			// } );
			// yield new Promise( resolve => Resolve['Witch'] = resolve );  /* 他のプレイヤー待機 */
			// Monitor_FBref_SignalAttackEnd_off();  /* 監視終了 */

			// Show_OKbtn_OtherPlayer( id, 'Witch' );
			// yield new Promise( resolve => Resolve['Witch_ok'] = resolve );
			// Hide_OKbtn_OtherPlayer( id, 'Witch' );
			yield FBref_MessageTo.child(id).set('');  /* reset */
		}
	};

	// AttackEffect['Witch'] = function* () {  /* アタックされる側 */
	// 	Game.Me().AddToDiscardPile( Game.Supply.byName('Curse').GetTopCard() );

	// 	let updates = {};
	// 	updates['Supply'] = Game.Supply;
	// 	updates[`Players/${myid}/DiscardPile`] = Game.Me().DiscardPile;
	// 	yield FBref_Game.update( updates );
	// };

	// $('.OtherPlayers-wrapper').on( 'click', '.ok.Witch', () => Resolve['Witch_ok']() );  /* 確認 */





	/* 29. 民兵 */
	CardEffect['Militia'] = function* () {
		yield FBref_Message.set( '手札が3枚になるまで捨てて下さい。' );

		for ( let id = Game.NextPlayerID(); id != Game.whose_turn_id; id = Game.NextPlayerID(id) ) {
			if ( Game.TurnInfo.Revealed_Moat[id] ) continue;  // 堀を公開していたらスキップ
			yield Monitor_FBref_SignalAttackEnd_on( 'Militia' );  // End受信 -> Resolve['Militia']()
			yield SendSignal( id, {
				Attack    : true,
				card_name : 'Militia',
				Message   : '手札が3枚になるまで捨てて下さい。',
			} );
			yield new Promise( resolve => Resolve['Militia'] = resolve );  /* 他のプレイヤー待機 */
			Monitor_FBref_SignalAttackEnd_off();  /* 監視終了 */

			// Show_OKbtn_OtherPlayer( id, 'Militia' );
			// yield new Promise( resolve => Resolve['Militia_ok'] = resolve );
			// Hide_OKbtn_OtherPlayer( id, 'Militia' );
			yield FBref_MessageTo.child(id).set('');  /* reset */
		}
	};

	AttackEffect['Militia'] = function*() {  /* アタックされる側 */
		while ( $('.MyHandCards').children('.card').length > 3 ) {
			$('.MyHandCards').children('.card').addClass('Militia_Discard pointer');
			yield new Promise( resolve => Resolve['Militia_Discard'] = resolve );
		}
	};

	$('.MyHandCards').on( 'click', '.card.Militia_Discard', function() {
		const clicked_card_ID = $(this).attr('data-card_ID');

		Game.Me().AddToDiscardPile( Game.GetCardByID( clicked_card_ID ) );

		FBref_Players.child( myid ).update( {
			HandCards   : Game.Me().HandCards,
			DiscardPile : Game.Me().DiscardPile,
		} )
		.then( () => Resolve['Militia_Discard']() );  // 再開
	} );

	// $('.OtherPlayers-wrapper').on( 'click', '.ok.Militia', () => Resolve['Militia_ok']() );  /* 確認 */





	/* 31. 役人 */
	CardEffect['Bureaucrat'] = function* () {
		yield FBref_Message.set( 'プレイヤーは銀貨を山札に獲得します。\
			他のプレイヤーは手札に勝利点カードが1枚以上ある場合はそのうち1枚を山札に戻してください。そうでない場合は手札を公開してください。' );

		let silver = Game.Supply.byName('Silver').GetTopCard();
		silver.face = true;
		Game.player().PutBackToDeck( silver );  /* 銀貨を山札の一番上に獲得 */

		let updates = {};
		updates[`Players/${Game.player().id}/Deck`] = Game.player().Deck;
		updates['Supply'] = Game.Supply;
		yield FBref_Game.update( updates );

		/* 他のプレイヤーが終了時に送るEndシグナルを監視 */

		for ( let id = Game.NextPlayerID(); id != Game.whose_turn_id; id = Game.NextPlayerID(id) ) {
			if ( Game.TurnInfo.Revealed_Moat[id] ) continue;  // 堀を公開していたらスキップ

			yield Monitor_FBref_SignalAttackEnd_on( 'Bureaucrat' );  // End受信 -> Resolve['Bureaucrat']()
			yield SendSignal( id, {
				Attack    : true,
				card_name : 'Bureaucrat',
				Message   : '手札に勝利点カードが1枚以上ある場合はそのうち1枚を山札に戻してください。そうでない場合は手札を公開してください。',
			} );
			yield new Promise( resolve => Resolve['Bureaucrat'] = resolve );  /* 他のプレイヤー待機 */
			Monitor_FBref_SignalAttackEnd_off();  /* 監視終了 */

			// 山札に戻した勝利点カードか公開した手札を確認
			Show_OKbtn_OtherPlayer( id, 'Bureaucrat' );
			yield new Promise( resolve => Resolve['Bureaucrat_ok'] = resolve );
			Hide_OKbtn_OtherPlayer( id, 'Bureaucrat' );
			yield FBref_MessageTo.child(id).set('');  /* reset */
		}
		// 公開したカードを裏向きに戻す
		Game.Players.forEach( player => player.ResetFaceDown() );
		yield FBref_Players.set( Game.Players );
	};

	AttackEffect['Bureaucrat'] = function*() {  /* アタックされる側 */
		const $victory_cards = $('.MyHandCards').children('.card')
			.filter( function() { return IsVictoryCard( Cardlist, $(this).attr('data-card_no') ) } );

		if ( $victory_cards.length == 0 ) {
			Game.Me().OpenHandCards();  /* 手札を公開 */
			yield FBref_MessageToMe.set('手札を公開します。');
			return;
		}

		$victory_cards.addClass('Bureaucrat_PutBack pointer');

		yield new Promise( resolve => Resolve['Bureaucrat_PutBack'] = resolve );
	};

	$('.OtherPlayers-wrapper').on( 'click', '.ok.Bureaucrat', () => Resolve['Bureaucrat_ok']() );  /* 確認 */

	$('.MyHandCards').on( 'click', '.card.Bureaucrat_PutBack', function() {
		const clicked_card_ID = $(this).attr('data-card_ID');

		let victory_card = Game.GetCardByID( clicked_card_ID );
		victory_card.face = true;
		Game.Me().PutBackToDeck( victory_card );

		FBref_Players.child( myid ).update( {
			HandCards : Game.Me().HandCards,
			Deck      : Game.Me().Deck,
		} )
		.then( () => Resolve['Bureaucrat_PutBack']() );  // 再開
	} );





	/* 24. 泥棒 */
	CardEffect['Thief'] = function* () {
		yield FBref_Message.set( '他のプレイヤーの山札の上から2枚を公開し，その中に財宝カードがあればそのうち1枚を選んで廃棄します。\
			これによって廃棄されたカードのうち好きな枚数を獲得できます。' );

		let trashed_card_IDs = [];

		for ( let id = Game.NextPlayerID(); id != Game.whose_turn_id; id = Game.NextPlayerID(id) ) {
			if ( Game.TurnInfo.Revealed_Moat[id] ) continue;  // 堀を公開していたらスキップ
			yield Monitor_FBref_SignalAttackEnd_on( 'Thief' );  // End受信 -> Resolve['Thief']()
			yield SendSignal( id, {
				Attack    : true,
				card_name : 'Thief',
				Message   : '山札の上から2枚を公開してください。財宝カードが公開された場合そのうち1枚が廃棄されます。廃棄されたカード以外は捨て札にしてください。',
			} );
			yield new Promise( resolve => Resolve['Thief'] = resolve );  /* 他のプレイヤー待機 */
			Monitor_FBref_SignalAttackEnd_off();  /* 監視終了 */

			let trasure_cards = 
				$(`.OtherPlayer[data-player_id=${id}] .sOpen`)
					.children('.card')
					.filter( function() { return IsTreasureCard( Cardlist, $(this).attr('data-card_no') ) } );

			if ( trasure_cards.length > 0 ) {
				trasure_cards.addClass('Thief_Trash pointer');
				const trashed_card_ID
					= yield new Promise( resolve => Resolve['Thief_Trash'] = resolve );
				if ( trashed_card_ID != undefined ) trashed_card_IDs.push( trashed_card_ID );
			} else {
				Show_OKbtn_OtherPlayer( id, 'Thief' );
				yield new Promise( resolve => Resolve['Thief_ok'] = resolve );
				Hide_OKbtn_OtherPlayer( id, 'Thief' );
			}
			yield FBref_MessageTo.child(id).set('');  /* reset */

			/* 公開したカードの残りを捨て札に */
			let player = Game.Players[id];
			player.Open.forEach( card => player.AddToDiscardPile( card ) );
			player.Open = [];
			yield FBref_Players.child(id).update( {
				DiscardPile : player.DiscardPile,
				Open        : player.Open,
			} );
		}


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

			yield new Promise( resolve => Resolve['Thief_GainTrashedCard'] = resolve );
			HideDialog();
		}
	};

	AttackEffect['Thief'] = function*() {  /* アタックされる側 */
		/* 山札から2枚めくり公開 */
		Game.Me().AddToOpen( Game.Me().GetDeckTopCard() );
		Game.Me().AddToOpen( Game.Me().GetDeckTopCard() );
		yield FBref_Players.child( myid ).update( {
			Open        : Game.Me().Open,
			Deck        : Game.Me().Deck,
			DiscardPile : Game.Me().DiscardPile,
		} );
	};

	/* 廃棄 */
	$('.OtherPlayers-wrapper').on( 'click', '.sOpen .Thief_Trash', function() {
		const player_id = $(this).parents('.OtherPlayer').attr('data-player_id');
		const clicked_card_ID = $(this).attr('data-card_ID');
		Game.TrashCardByID( clicked_card_ID );

		let updates = {};
		updates['TrashPile'] = Game.TrashPile;
		updates[`Players/${player_id}/Open`] = Game.Players[ player_id ].Open;
		FBref_Game.update( updates )
		.then( () => Resolve['Thief_Trash']( clicked_card_ID ) );  // 再開
	} );

	$('.OtherPlayers-wrapper').on( 'click', '.ok.Thief', () => Resolve['Thief_ok']() );  /* 確認 */

	/* 廃棄したカードの獲得 */
	$('.dialog_contents').on( 'click', '.Thief_GainTrashedCard', function() {
		$('.dialog_contents').find('.card').removeClass('Thief_GainTrashedCard pointer');

		const clicked_card_ID = $(this).attr('data-card_ID');
		Game.player().AddToDiscardPile( Game.GetCardByID( clicked_card_ID ) );
		$(this).remove();  /* クリックしたカードを削除 */

		let updates = {};
		updates['TrashPile'] = Game.TrashPile;
		updates[`Players/${myid}/DiscardPile`] = Game.player().DiscardPile;
		FBref_Game.update( updates )
		.then( () => $('.dialog_contents').find('.card').addClass('Thief_GainTrashedCard pointer') );
	} );

	$('.dialog_buttons').on( 'click', '.ok', function() {
		HideDialog();
		Resolve['Thief_GainTrashedCard']();  // 再開
	} );





	/* 28. 密偵 */
	CardEffect['Spy'] = function* () {
		yield FBref_Message.set( '各プレイヤー（自分を含む）の山札の上から1枚を公開し，それを捨て札にするかそのまま山札に戻すか選んでください。' );

		if ( Game.player().Drawable() ) {
			/* 山札から1枚めくり公開 */
			Game.player().AddToOpen( Game.player().GetDeckTopCard() );

			yield FBref_Players.child( Game.player().id ).update( {
				Open        : Game.player().Open,
				Deck        : Game.player().Deck,
				DiscardPile : Game.player().DiscardPile,
			} );

			$('.action_buttons')
				.html('')
				.append( MakeHTML_button( 'Spy Discard', '捨て札にする' ) )
				.append( MakeHTML_button( 'Spy PutBackToDeck', 'そのまま戻す' ) );

			yield new Promise( resolve => Resolve['Spy_Discard_or_PutBackToDeck_player'] = resolve );
			$('.action_buttons').html('');
		}


		let trashed_card_IDs = [];

		for ( let id = Game.NextPlayerID(); id != Game.whose_turn_id; id = Game.NextPlayerID(id) ) {
			if ( Game.TurnInfo.Revealed_Moat[id] ) continue;  // 堀を公開していたらスキップ
			yield Monitor_FBref_SignalAttackEnd_on( 'Spy' );  // End受信 -> Resolve['Spy']()
			yield SendSignal( id, {
				Attack    : true,
				card_name : 'Spy',
				Message   : '山札の上から1枚を公開してください。公開されたカードは捨て札になるか山札に戻されます。',
			} );
			yield new Promise( resolve => Resolve['Spy'] = resolve );
			// yield FBref_SignalAttackEnd.set(false);  /* reset */
			Monitor_FBref_SignalAttackEnd_off();  /* 監視終了 */

			if ( Game.Players[id].Open.length > 0 ) {  // 1枚以上公開できたとき（drawができないときは0に）
				$(`.OtherPlayer[data-player_id=${id}] .OtherPlayer_Buttons`)
					.append( MakeHTML_button( 'Spy Discard', '捨て札にする' ) )
					.append( "<div class='clear'></div>" )
					.append( MakeHTML_button( 'Spy PutBackToDeck', 'そのまま戻す' ) );

				yield new Promise( resolve => Resolve['Spy_Discard_or_PutBackToDeck'] = resolve );
				$(`.OtherPlayer[data-player_id=${id}] .OtherPlayer_Buttons .Spy`).remove();
			}

			// Show_OKbtn_OtherPlayer( id, 'Spy' );
			// yield new Promise( resolve => Resolve['Spy_ok'] = resolve );
			// Hide_OKbtn_OtherPlayer( id, 'Spy' );
			yield FBref_MessageTo.child(id).set('');  /* reset */
		}
		// 公開したカードを裏向きに戻す
		Game.Players.forEach( player => player.ResetFaceDown() );
		yield FBref_Players.set( Game.Players );
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
		.then( () => Resolve['Spy_Discard_or_PutBackToDeck_player']() );  // 再開
	} );

	/* 他のプレイヤー */
	AttackEffect['Spy'] = function*() {  /* アタックされる側 */
		/* 山札から1枚めくり公開 */
		Game.Me().AddToOpen( Game.Me().GetDeckTopCard() );
		yield FBref_Players.child( myid ).set( Game.Me() );  // Endシグナルを送る
	};

	$('.OtherPlayers-wrapper').on( 'click', '.Spy.Discard,.PutBackToDeck', function() {
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
		.then( () => Resolve['Spy_Discard_or_PutBackToDeck']() );  // 再開
	} );

	// $('.OtherPlayers-wrapper').on( 'click', '.ok.Spy', () => Resolve['Spy_ok']() );  /* 確認 */





	/* 14. 玉座の間 */
	CardEffect['Throne Room'] = function* () {
		let $action_cards = $('.HandCards').children('.card')
			.filter( function() { return IsActionCard( Cardlist, $(this).attr('data-card_no') ) } );

		if ( $action_cards.length > 0 ) {
			FBref_Message.set( '手札のアクションカードを1枚選んで下さい。' );

			$action_cards.addClass('Throne_Room_UseTwice pointer');

			// アクションカード選択待機
			const [clicked_card_no, clicked_card_ID]
				= yield new Promise( resolve => Resolve['Throne_Room_UseTwice'] = resolve );

			yield MyAsync( GetCardEffect, clicked_card_no, clicked_card_ID );  /* 1回目 */
			yield MyAsync( GetCardEffect, clicked_card_no, clicked_card_ID );  /* 2回目 */
		}
	};

	$('.HandCards').on( 'click', '.card.Throne_Room_UseTwice', function() {
		const clicked_card_no = $(this).attr('data-card_no');
		const clicked_card_ID = $(this).attr('data-card_ID');

		/* 選んだアクションカードを場に出す */
		Game.player().AddToPlayArea( Game.GetCardByID( clicked_card_ID ) );

		FBref_Players.child( Game.player().id ).update( {
			HandCards : Game.player().HandCards,
			PlayArea  : Game.player().PlayArea,
		} )
		.then( () => Resolve['Throne_Room_UseTwice']( [clicked_card_no, clicked_card_ID] ) );  // 再開
	} );





	ReactionEffect['Moat'] = function*() {
		yield FBref_Game.child(`TurnInfo/Revealed_Moat/${myid}`).set(true);
	};



} );
