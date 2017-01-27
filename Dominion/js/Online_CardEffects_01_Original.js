
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








	/* 9. 基本 - 改築 */
	/* Trash a card from your hand. Gain a card costing up to 2 Coins more than the trashed card.
	   《2nd edition》 Trash a card from your hand. Gain a card costing up to 2 Coins more than it. */
	CardEffect['Remodel'] = function* () {
		if ( Game.player().HandCards.length <= 0 ) {
			yield MyAlert( '手札にカードがありません。' );
			return;
		}

		// (1) 廃棄する手札のカードの選択
		yield FBref_Message.set( '手札のカードを1枚廃棄して下さい。' );

		const TrashedCardID = yield WaitForTrashingHandCard();

		const TrashedCardCost = Game.GetCost( Game.GetCardByID( TrashedCardID ).card_no );

		// (2) 廃棄したカード+2コインまでのコストのカードの獲得
		yield FBref_Message.set(
			`コストが廃棄したカード+2(=${TrashedCardCost.coin + 2} )コインまでのカードを獲得してください。` );

		yield WaitForGainingSupplyCard(
				( card, card_no ) =>
					CostOp( '<=',
						Game.GetCost( card_no ),
						CostOp( '+', TrashedCardCost, new CCost([2,0,0]) ) ),
				'AddToDiscardPile' );
	};





	/* 11. 金貸し */
	/* Trash a Copper card from your hand. If you do, +3 Coins. */
	CardEffect['Moneylender'] = function* () {
		const Coppers 
		  = Game.player().HandCards.filter( card => CardName2No['Copper'] == card.card_no );

		if ( Coppers.length <= 0 ) {
			yield MyAlert( '手札に銅貨がありません。' );
			return;
		}

		yield FBref_Message.set( '手札の銅貨を1枚廃棄して下さい。' );

		/* 手札のカードのクリック動作を廃棄するカードの選択に変更 */
		yield WaitForTrashingHandCard( card_no => card_no == CardName2No['Copper'] );

		// +3 Coins
		Game.TurnInfo.coin += 3;
		yield FBref_Game.child('TurnInfo/coin').set( Game.TurnInfo.coin );
	};





	/* 13. 議事堂 */
	/* +4 Cards +1 Buy Each other player draws a card.
	   《2nd edition》 +4 Cards +1 Buy Each other player draws a card. */
	CardEffect['Council Room'] = function* () {
		Game.ForAllOtherPlayers( player_id => Game.Players[player_id].DrawCards(1) )
		yield FBref_Players.update( Game.Players );
	};





	/* 14. 玉座の間 */
	/* Choose an Action card in your hand. Play it twice.
	   《2nd edition》 You may play an Action card from your hand twice. */
	/* 1st editionで実装 */
	CardEffect['Throne Room'] = function* () {
		const $action_cards
			= $('.HandCards').children('.card')
				.filter( function() { return IsActionCard( Cardlist, $(this).attr('data-card_no') ) } );

		const Action
		  = Game.player().HandCards.filter( card => IsActionCard( Cardlist, card.card_no ) );

		if ( $action_cards.length <= 0 ) {
			yield MyAlert( '手札にアクションカードがありません。' );
			return;
		}

		yield FBref_Message.set( '手札のアクションカードを1枚選んで下さい。' );

		$action_cards.addClass('Throne_Room_UseTwice pointer');

		// アクションカード選択待機
		const [clicked_card_no, clicked_card_ID]
			= yield new Promise( resolve => Resolve['Throne_Room_UseTwice'] = resolve );
		$action_cards.removeClass('Throne_Room_UseTwice pointer');

		yield MyAsync( GetCardEffect, clicked_card_no, clicked_card_ID );  /* 1回目 */
		yield MyAsync( GetCardEffect, clicked_card_no, clicked_card_ID );  /* 2回目 */
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





	/* 16. 基本 - 鉱山 */
	/* Trash a Treasure card from your hand.
	   Gain a Treasure card costing up to 3 Coins more; put it into your hand.
	   《2nd edition》 You may trash a Treasure from your hand.
	   Gain a Treasure to your hand costing up to 3 Coins more than it. */
	CardEffect['Mine'] = function* () {
		const Treasure
		  = Game.player().HandCards.filter( card => IsTrasureCard( Cardlist, card.card_no ) );

		if ( Treasure.length <= 0 ) {
			yield MyAlert( '手札に財宝カードがありません。' );
			return;
		}

		// (1) 廃棄する手札の財宝カードの選択
		yield FBref_Message.set( '手札の財宝カードを1枚廃棄して下さい。' );

		const TrashedCardID
		  = yield WaitForTrashingHandCard( card_no => IsTrasureCard( Cardlist, card_no ) );

		const TrashedCardCost = Game.GetCost( Game.GetCardByID( TrashedCardID ).card_no );

		// (2) 廃棄したカード+3コインまでのコストの財宝カードの獲得
		yield FBref_Message.set(
			`コストが廃棄したカード+3(=${TrashedCardCost.coin + 3} )コインまでの財宝カードを獲得してください。` );

		yield WaitForGainingSupplyCard(
				( card, card_no ) =>
					CostOp( '<=',
						Game.GetCost( card_no ),
						CostOp( '+', TrashedCardCost, new CCost([3,0,0]) ) )
					&& IsTreasureCard( Cardlist, card_no ),
				'AddToHandCards' );
	};





	/* 17. 基本 - 工房 */
	/* Gain a card costing up to 4 Coins. */
	CardEffect['Workshop'] = function* () {
		yield FBref_Message.set( 'コスト4以下のカードを獲得して下さい。' );

		yield WaitForGainingSupplyCard(
				( card, card_no ) =>
					CostOp( '<=', Game.GetCost( card_no ), new CCost([4,0,0]) ),
				'AddToDiscardPile' );
	};





	/* 18. 宰相 */
	/* +2 Coins You may immediately put your deck into your discard pile.
	   《2nd edition》 Removed  */
	CardEffect['Chancellor'] = function* () {
		yield FBref_Message.set( '山札を捨て札に置きますか？' );

		$('.action_buttons').html(
				MakeHTML_button( 'Chancellor Discard', '捨て札におく' ) +
				MakeHTML_button( 'Chancellor', '何もしない' ) );
		const discard = yield new Promise( resolve => Resolve['Chancellor'] = resolve );
		$('.action_buttons .Chancellor').remove();  // reset

		if ( discard ) {
			yield Game.player().PutDeckIntoDiscardPile();  /* 山札をそのままひっくり返して捨て山に置く */
		}
	};

	$('.action_buttons').on( 'click', '.Chancellor', function() {
		Resolve['Chancellor']( $(this).hasClass('Discard') );  // 再開
	} );





	/* 19. 基本 - 祝宴 */
	/* Trash this card. Gain a card costing up to 5 Coins. 《2nd edition》 Removed */
	CardEffect['Feast'] = function* ( playing_card_ID ) {
		yield FBref_Message.set( 'コスト5以下のカードを獲得して下さい。' );

		// このカードを廃棄する
		Game.TrashCardByID( playing_card_ID );
		yield FBref_Game.update( {
			TrashPile : Game.TrashPile,
			[`Players/${Game.player().id}/PlayArea`] : Game.player().PlayArea,
		} );

		yield WaitForGainingSupplyCard(
				( card, card_no ) =>
					CostOp( '<=', Game.GetCost( card_no ), new CCost([5,0,0]) ),
				'AddToDiscardPile' );
	};





	/* 21. 書庫 */
	/* Draw until you have 7 cards in hand.
	   You may set aside any Action cards drawn this way, as you draw them;
	   discard the set aside cards after you finish drawing.
	   《2nd edition》 Draw until you have 7 cards in hand, skipping any Action cards you choose to;
	   set those aside, discarding them afterwards. */
	CardEffect['Library'] = function* () {
		yield FBref_Message.set( '手札が7枚になるまでカードを引きます。アクションカードを引いたら脇に置くことができます。' );

		const SetAsideCardsID = [];

		while ( Game.player().Drawable() && Game.player().HandCards.length < 7 ) {
			const deck_top_card = Game.player().GetDeckTopCard();

			if ( !IsActionCard( Cardlist, deck_top_card.card_no ) ) {
				Game.player().AddToHandCards( deck_top_card );
				yield FBref_Players.child( Game.player().id ).set( Game.player() );
			} else {
				yield FBref_Players.child( `${Game.player().id}/Deck` ).set( Game.player().Deck );

				const set_aside
				  = yield MyDialog( {
						message  : `${Cardlist[ deck_top_card.card_no ].name_jp}を脇に置きますか？`,
						contents : MakeHTML_Card( deck_top_card, Game ),
						buttons  : [
							{ return_value : true , label : '脇に置く', },
							{ return_value : false, label : '手札に加える', }, ],
					} );

				if ( set_aside ) {
					SetAsideCardsID.push( deck_top_card.card_ID );
					Game.player().AddToAside( deck_top_card );
				} else {
					Game.player().AddToHandCards( deck_top_card );
				}
				yield FBref_Players.child( Game.player().id ).set( Game.player() );
			}
		}

		yield AcknowledgeButton_Me();  // 脇に置いたカードを確認

		/* move cards in Aside to DiscardPile */
		SetAsideCardsID.forEach(
			card_ID => Game.player().AddToDiscardPile( Game.GetCardByID( card_ID ) ) );
		yield FBref_Players.child( Game.player().id ).set( Game.player() );
	};





	/* 22. 地下貯蔵庫 */
	/* +1 Action Discard any number of cards. +1 Card per card discarded.
	《2nd edition》 +1 Action Discard any number of cards, then draw that many. */
	// 捨て札にする枚数は公開だが内訳は非公開
	CardEffect['Cellar'] = function* () {
		yield FBref_Message.set( '手札から任意の枚数を捨て札にして下さい。捨て札にした枚数だけカードを引きます。' );

		// 手札のカードを任意枚数選択
		const SelectedCardsID = yield WaitForSelectingHandCards();

		// 選択したカードを捨て札に
		SelectedCardsID.forEach( card_ID => Game.Discard( card_ID, { chat : false } ) );

		yield FBref_Message.set( `捨て札にした枚数 ： ${SelectedCardsID.length}枚` );

		// 捨て札にした枚数カードを引く
		Game.player().DrawCards( SelectedCardsID.length );
		yield FBref_Players.child( Game.player().id ).set( Game.player() );
	};





	/* 24. 泥棒 */
	/* Each other player reveals the top 2 cards of his deck.
	   If they revealed any Treasure cards, they trash one of them that you choose.
	   You may gain any or all of these trashed cards.
	   They discard the other revealed cards.
	   《2nd edition》 Removed */
	CardEffect['Thief'] = function* () {
		yield FBref_Message.set(
			'他のプレイヤーの山札の上から2枚を公開し、\
			その中に財宝カードがあればそのうち1枚を選んで廃棄します。\
			これによって廃棄されたカードのうち好きな枚数を獲得できます。' );

		function* attack_effects( player_id, passing_object ) {
			const pl = Game.Players[player_id];
			const RevealedCardsID = [];  // 公開したカードを記憶

			/* 山札から2枚めくり公開 */
			for ( let i = 0; i < 2; ++i ) {
				revealed_card = pl.GetDeckTopCard()
				RevealedCardsID.push( revealed_card.card_ID );
				pl.AddToOpen( revealed_card );
			}
			yield FBref_Players.child( player_id ).update( {
				Open        : pl.Open,
				Deck        : pl.Deck,
				DiscardPile : pl.DiscardPile,
			} );

			const $trasure_cards
			 = $(`.OtherPlayer[data-player_id=${player_id}] .sOpen`)
					.children('.card')
					.filter( function() {
						return IsTreasureCard( Cardlist, $(this).attr('data-card_no') )
					} );

			// 財宝カードがあれば1枚廃棄
			if ( $trasure_cards.length > 0 ) {
				$trasure_cards.addClass('Thief_Trash pointer');
				const clicked_card_ID
					= yield new Promise( resolve => Resolve['Thief_Trash'] = resolve );
				$trasure_cards.removeClass('Thief_Trash pointer');

				Game.TrashCardByID( clicked_card_ID );
				yield FBref_Game.update( {
					TrashPile : Game.TrashPile,
					[`Players/${player_id}/Open`] : Game.Players[ player_id ].Open,
				} );
				passing_object.TrashedCardsID.push( clicked_card_ID );
			} else {
				yield AcknowledgeButton_OtherPlayer( player_id );
			}

			/* 公開したカードの残りを捨て札に */
			RevealedCardsID.forEach( card_ID => Game.Discard( card_ID, { player_id : player_id } ) );

			yield FBref_Players.child( player_id ).update( {
				DiscardPile : pl.DiscardPile,
				Open        : pl.Open,
			} );
		}

		let passing_object = { TrashedCardsID : [] };

		yield Game.AttackAllOtherPlayers(
				'Thief',
				'山札の上から2枚を公開してください。\
				財宝カードが公開された場合そのうち1枚が廃棄されます。\
				廃棄されたカード以外は捨て札にしてください。',
				false,  // don't send signals
				attack_effects, passing_object );


		// 1枚以上廃棄したならばその中から好きな枚数獲得
		if ( passing_object.TrashedCardsID.length > 0 ) {
			/* 廃棄したカードの獲得画面 */
			let trashed_cards_html;

			passing_object.TrashedCardsID.forEach( function( card_ID ) {
				const card = Game.GetCardByID( card_ID, false );
				card.class_str = 'Thief_GainTrashedCard pointer';
				trashed_cards_html += MakeHTML_Card( card, Game );
			} );

			yield MyAlert( '廃棄したカードから好きな枚数獲得してください。', 
				{ contents : trashed_cards_html } );

			// class_str をリセット
			ResetClassStr( passing_object.TrashedCardsID );
			yield FBref_Game.update( {
				TrashPile : Game.TrashPile,
				Players   : Game.Players ,
			} );
		}
	};

	/* 廃棄するカードの選択 */
	$('.OtherPlayers-wrapper').on( 'click', '.sOpen .Thief_Trash', function() {
		Resolve['Thief_Trash']( $(this).attr('data-card_ID') );  // 再開
	} );

	/* 廃棄したカードの獲得 */
	$('.MyAlert').on( 'click', '.Thief_GainTrashedCard', function() {
		const clicked_card_ID = $(this).attr('data-card_ID');
		$(this).remove();  /* クリックしたカードを非表示 */

		Game.Discard( clicked_card_ID );

		FBref_Game.update( {
			TrashPile : Game.TrashPile,
			[`Players/${Game.player().id}/DiscardPile`] : Game.player().DiscardPile,
		} );
	} );





	/* 25. 冒険者 */
	/* Reveal cards from your deck until you reveal 2 Treasure cards.
	   Put those Treasure cards in your hand and discard the other revealed cards.
	   《2nd edition》 Removed */
	CardEffect['Adventurer'] = function*() {
		yield FBref_Message.set( '財宝カードが2枚公開されるまでカードを引きます。' );

		const RevealedCardsID = [];

		let treasure_num = 0;
		while ( Game.player().Drawable() && treasure_num < 2 ) {
			const deck_top_card = Game.player().GetDeckTopCard();
			if ( IsTreasureCard( Cardlist, deck_top_card.card_no ) ) treasure_num++;
			RevealedCardsID.push( deck_top_card.card_ID );
			Game.player().AddToOpen( deck_top_card );
			yield FBref_Players.child( Game.player().id ).set( Game.player() );
		}

		yield AcknowledgeButton_Me();  // 脇に置いたカードを確認

		/* 公開したカードを片づける */
		RevealedCardsID.forEach( function( card_ID ) {
			const card = Game.GetCardByID( card_ID );
			if ( IsTreasureCard( Cardlist, card.card_no ) ) {
				Game.player().AddToHandCards( card );
			} else {
				Game.player().AddToDiscardPile( card );
				
			}
		});

		yield FBref_Players.child( Game.player().id ).set( Game.player() );
	};





	/* 26. 堀 */
	/* +2 Cards
	   -------------------------
	   When another player plays an Attack card, you may reveal this from your hand.
	   If you do, you are unaffected by that Attack.

	   《2nd edition》
	   +2 Cards
	   -------------------------
	   When another player plays an Attack card, you may first reveal this from your hand,
	   to be unaffected by it. */
	ReactionEffect['Moat'] = function*() {
		Game.TurnInfo.Revealed_Moat[myid] = true;
		yield FBref_Game.child(`TurnInfo/Revealed_Moat/${myid}`).set(true);
	};





	/* 27. 魔女 */
	/* +2 Cards Each other player gains a Curse card.
	   《2nd edition》 +2 Cards Each other player gains a Curse. */
	CardEffect['Witch'] = function* () {
		yield FBref_Message.set( '呪いを獲得して下さい。' );

		yield Game.AttackAllOtherPlayers(
				'Witch',
				'呪いを獲得します。',
				false,  // don't send signals
				function*() {
					// 呪いを獲得
					yield Game.GainCard( 'Curse', 'DiscardPile', id );
				} );
	};





	/* 28. 密偵 */
	/* +1 Card +1 Action
	   Each player (including you) reveals the top card of his deck
	   and either discards it or puts it back, your choice.
	   《2nd edition》 Removed */
	CardEffect['Spy'] = function* () {
		yield FBref_Message.set(
			'各プレイヤー（自分を含む）の山札の上から1枚を公開し、\
			それを捨て札にするかそのまま山札に戻すか選んでください。' );

		// 自分
		if ( Game.player().Drawable() ) {
			/* 山札から1枚めくり公開 */
			const revealed_card_ID = Game.player().GetDeckTopCard().card_ID;
			Game.player().AddToOpen( Game.GetCardByID( revealed_card_ID ) );

			yield FBref_Players.child( Game.player().id ).update( {
				Open        : Game.player().Open,
				Deck        : Game.player().Deck,
				DiscardPile : Game.player().DiscardPile,
			} );

			$('.action_buttons')
				.append( MakeHTML_button( 'Spy Discard',       '捨て札にする' ) )
				.append( MakeHTML_button( 'Spy PutBackToDeck', 'そのまま戻す' ) );
			const return_value = yield new Promise( resolve => Resolve['Spy_Me'] = resolve );
			$('.action_buttons .Spy').remove();

			switch ( return_value ) {
				case 'Discard' :
					Game.player().AddToDiscardPile( Game.GetCardByID( revealed_card_ID ) );
					break;

				case 'PutBackToDeck' :
					const revealed_card = Game.GetCardByID( revealed_card_ID );
					revealed_card.face = true;
					Game.player().AddToDeck( revealed_card );
					break;

				default :
					throw new Error( "return value of Spy must be 'Discard' or 'PutBackToDeck' ");
					break;
			}

			yield FBref_Players.child( Game.player().id ).set( Game.player() );
		}


		// 他のプレイヤー
		function attack_effects( player_id, passing_object ) {
			const pl = Game.Players[player_id];

			if ( !pl.Drawable() ) return;

			/* 山札から1枚めくり公開 */
			const revealed_card_ID = pl.GetDeckTopCard().card_ID;
			passing_object.RevealedCardsID.push( revealed_card_ID );
			pl.AddToOpen( Game.GetCardByID( revealed_card_ID ) );

			yield FBref_Players.child( pl.id ).update( {
				Open        : pl.Open,
				Deck        : pl.Deck,
				DiscardPile : pl.DiscardPile,
			} );

			$(`.OtherPlayer[data-player_id=${player_id}] .OtherPlayer_Buttons`)
				.append( MakeHTML_button( 'Spy Discard',       '捨て札にする' ) )
				.append( MakeHTML_button( 'Spy PutBackToDeck', 'そのまま戻す' ) );
			const return_value = yield new Promise( resolve => Resolve['Spy_OtherPlayer'] = resolve );
			$(`.OtherPlayer[data-player_id=${player_id}] .OtherPlayer_Buttons .Spy`).remove();

			switch ( return_value ) {
				case 'Discard' :
					pl.AddToDiscardPile( Game.GetCardByID( revealed_card_ID ) );
					break;

				case 'PutBackToDeck' :
					const revealed_card = Game.GetCardByID( revealed_card_ID );
					revealed_card.face = true;
					pl.AddToDeck( revealed_card );
					break;

				default :
					throw new Error( "return value of Spy must be 'Discard' or 'PutBackToDeck' ");
					break;
			}

			yield FBref_Players.child( player_id ).set( pl );
		}

		yield Game.AttackAllOtherPlayers(
				'Spy',
				'山札の上から1枚を公開してください。公開されたカードは捨て札になるか山札に戻されます。',
				false,  // don't send signals
				attack_effects, passing_object );

		// 公開したカードを裏向きに戻す
		yield Game.ResetFaceDown( passing_object.RevealedCardsID );
	};

	$('.action_buttons').on( 'click', '.Spy.Discard',
		() => Resolve['Spy_Me']( 'Discard' ) );
	$('.action_buttons').on( 'click', '.Spy.PutBackToDeck',
		() => Resolve['Spy_Me']( 'PutBackToDeck' ) );

	$('.OtherPlayers-wrapper').on( 'click', '.Spy.Discard',
		() => Resolve['Spy_OtherPlayer']( 'Discard' ) );
	$('.OtherPlayers-wrapper').on( 'click', '.Spy.PutBackToDeck',
		() => Resolve['Spy_OtherPlayer']( 'PutBackToDeck' ) );





	/* 29. 民兵 */
	/* +2 Coins Each other player discards down to 3 cards in his hand.
	   《2nd edition》 +2 Coins Each other player discards down to 3 cards in hand. */
	CardEffect['Militia'] = function* () {
		yield FBref_Message.set( '手札が3枚になるまで捨てて下さい。' );

		yield Game.AttackAllOtherPlayers(
				'Militia',
				'手札が3枚になるまで捨てて下さい。',
				true,  // send signals
				function*() {} );
	};

	/* アタックされる側 */
	AttackEffect['Militia'] = function*() {
		while ( $('.MyHandCards').children('.card').length > 3 ) {
			$('.MyHandCards').children('.card').addClass('Discard pointer');
			yield WaitForDiscaringMyHandCard();
		}
	};





	/* 31. 役人 */
	/* Gain a silver card; put it on top of your deck.
	   Each other player reveals a Victory card from his hand and puts it on his deck
	   (or reveals a hand with no Victory cards).
	   《2nd edition》 Gain a Silver onto your deck.
	   Each other player reveals a Victory card from their hand and puts it onto their deck
	   (or reveals a hand with no Victory cards). */
	CardEffect['Bureaucrat'] = function* () {
		yield FBref_Message.set( 'プレイヤーは銀貨を山札に獲得します。\
			他のプレイヤーは手札に勝利点カードが1枚以上ある場合はそのうち1枚を山札に戻してください。そうでない場合は手札を公開してください。' );

		const silver = Game.Supply.byName('Silver').GetTopCard();
		if ( silver != undefined ) silver.face = true;
		Game.player().AddToDeck( silver );  /* 銀貨を山札の一番上に獲得 */

		yield FBref_Game.update( {
			[`Players/${Game.player().id}/Deck`] : Game.player().Deck,
			Supply : Game.Supply,
		} );

		yield Game.AttackAllOtherPlayers(
				'Bureaucrat',
				'手札に勝利点カードが1枚以上ある場合はそのうち1枚を山札に戻してください。そうでない場合は手札を公開してください。',
				true,  // send signals
				function*() {} );

		// 全プレイヤーの山札に戻した勝利点カードか公開した手札を確認
		// yield AcknowledgeButton_Me();

		// 公開したカードを裏向きに戻す
		Game.Players.forEach( player => player.ResetFaceDown() );
		yield FBref_Players.set( Game.Players );
	};

	// アタックされる側
	AttackEffect['Bureaucrat'] = function*() {  /* アタックされる側 */
		const $victory_cards = $('.MyHandCards').children('.card')
			.filter( function() { return IsVictoryCard( Cardlist, $(this).attr('data-card_no') ) } );

		if ( $victory_cards.length == 0 ) {
			Game.Me().RevealHandCards();  /* 手札を公開 */
			yield FBref_MessageToMe.set('手札を公開します。');
			return;
		}

		$victory_cards.addClass('Bureaucrat_PutBack pointer');

		yield WaitForPuttingBackMyHandCard();
	};





	/* 32. 礼拝堂 */
	/* Trash up to 4 cards from your hand.
	   《2nd edition》 Trash up to 4 cards from your hand. */
	CardEffect['Chapel'] = function* () {
		yield FBref_Message.set( '手札を4枚まで廃棄して下さい。' );

		ShowTrashDoneButton();

		let trashed_num = 0;
		while ( trashed_num < 4 ) {
			const return_value = yield WaitForTrashingHandCard();
			if ( return_value === 'TrashHandCard_Done' ) break;
			trashed_num++;
			yield FBref_Message.set( `あと ${(4 - trashed_num)} 枚廃棄できます。` );
		}
	};
} );
