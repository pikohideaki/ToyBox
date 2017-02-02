
$( function() {



	// CardEffect['Copper']       = function* () {}  /* ok  1. 銅貨 */
	   CardEffect['Silver']       = function* () {}  /* ok  2. 銀貨 */
	   CardEffect['Gold']         = function* () {}  /* ok  3. 金貨 */
	   CardEffect['Estate']       = function* () {}  /* ok  4. 屋敷 */
	   CardEffect['Duchy']        = function* () {}  /* ok  5. 公領 */
	   CardEffect['Province']     = function* () {}  /* ok  6. 属州 */
	   CardEffect['Curse']        = function* () {}  /* ok  7. 呪い */
	   CardEffect['Market']       = function* () {}  /* ok  8. 市場 */
	// CardEffect['Remodel']      = function* () {}  /* ok  9. 改築 */
	   CardEffect['Smithy']       = function* () {}  /* ok 10. 鍛冶屋 */
	// CardEffect['Moneylender']  = function* () {}  /* ok 11. 金貸し */
	   CardEffect['Woodcutter']   = function* () {}  /* ok 12. 木こり */
	// CardEffect['Council Room'] = function* () {}  /* ok 13. 議事堂 */
	// CardEffect['Throne Room']  = function* () {}  /* ok 14. 玉座の間 */
	   CardEffect['Laboratory']   = function* () {}  /* ok 15. 研究所 */
	// CardEffect['Mine']         = function* () {}  /* ok 16. 鉱山 */
	// CardEffect['Workshop']     = function* () {}  /* ok 17. 工房 */
	// CardEffect['Chancellor']   = function* () {}  /* ok 18. 宰相 */
	// CardEffect['Feast']        = function* () {}  /* ok 19. 祝宴 */
	   CardEffect['Festival']     = function* () {}  /* ok 20. 祝祭 */
	// CardEffect['Library']      = function* () {}  /* ?? 21. 書庫 */
	// CardEffect['Cellar']       = function* () {}  /* ok 22. 地下貯蔵庫 */
	// CardEffect['Gardens']      = function* () {}  /* ok 23. 庭園 */
	// CardEffect['Thief']        = function* () {}  /* ?? 24. 泥棒 */
	// CardEffect['Adventurer']   = function* () {}  /* ?? 25. 冒険者 */
	   CardEffect['Moat']         = function* () {}  /*    26. 堀 */
	// CardEffect['Witch']        = function* () {}  /* ?? 27. 魔女 */
	// CardEffect['Spy']          = function* () {}  /* ?? 28. 密偵 */
	// CardEffect['Militia']      = function* () {}  /* ok 29. 民兵 */
	   CardEffect['Village']      = function* () {}  /* ok 30. 村 */
	// CardEffect['Bureaucrat']   = function* () {}  /* ?? 31. 役人 */
	// CardEffect['Chapel']       = function* () {}  /* ok 32. 礼拝堂 */






	/* 1. 銅貨 */
	CardEffect['Copper'] = function* () {
		 // 銅細工師の効果
		Game.TurnInfo.coin += Game.TurnInfo.add_copper_coin;
		yield FBref_Game.child('TurnInfo/coin').set( Game.TurnInfo.coin );
	}





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
			`コストが廃棄したカード+2(=${TrashedCardCost.coin + 2})コインまでのカードを獲得してください。` );

		yield WaitForGainingSupplyCard( 'AddToDiscardPile',
			( card, card_no ) =>
				CostOp( '<=', Game.GetCost( card_no ), CostOp( '+', TrashedCardCost, [2,0,0] ) ) );
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
		Game.Play( clicked_card_ID )
		.then( () => Resolve['Throne_Room_UseTwice']( [clicked_card_no, clicked_card_ID] ) );  // 再開
	} );





	/* 16. 基本 - 鉱山 */
	/* Trash a Treasure card from your hand.
	   Gain a Treasure card costing up to 3 Coins more; put it into your hand.
	   《2nd edition》 You may trash a Treasure from your hand.
	   Gain a Treasure to your hand costing up to 3 Coins more than it. */
	CardEffect['Mine'] = function* () {
		const Treasure
		  = Game.player().HandCards.filter( card => IsTreasureCard( Cardlist, card.card_no ) );

		if ( Treasure.length <= 0 ) {
			yield MyAlert( '手札に財宝カードがありません。' );
			return;
		}

		// (1) 廃棄する手札の財宝カードの選択
		yield FBref_Message.set( '手札の財宝カードを1枚廃棄して下さい。' );

		const TrashedCardID
		  = yield WaitForTrashingHandCard( card_no => IsTreasureCard( Cardlist, card_no ) );

		const TrashedCardCost = Game.GetCost( Game.GetCardByID( TrashedCardID ).card_no );

		// (2) 廃棄したカード+3コインまでのコストの財宝カードの獲得
		yield FBref_Message.set(
			`コストが廃棄したカード+3(=${TrashedCardCost.coin + 3})コインまでの財宝カードを獲得してください。` );

		yield WaitForGainingSupplyCard( 'AddToHandCards',
			( card, card_no ) =>
				CostOp( '<=', Game.GetCost( card_no ), CostOp( '+', TrashedCardCost, [3,0,0] ) )
				&& IsTreasureCard( Cardlist, card_no ) );
	};





	/* 17. 基本 - 工房 */
	/* Gain a card costing up to 4 Coins. */
	CardEffect['Workshop'] = function* () {
		yield FBref_Message.set( 'コスト4以下のカードを獲得して下さい。' );

		yield WaitForGainingSupplyCard( 'AddToDiscardPile',
			( card, card_no ) => CostOp( '<=', Game.GetCost( card_no ), [4,0,0] ) );
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
		Game.Trash( playing_card_ID );
		yield FBref_Game.update( {
			TrashPile : Game.TrashPile,
			[`Players/${Game.player().id}/PlayArea`] : Game.player().PlayArea,
		} );

		yield WaitForGainingSupplyCard( 'AddToDiscardPile',
			( card, card_no ) => CostOp( '<=', Game.GetCost( card_no ), [5,0,0] ) );
	};





	/* 21. 書庫 */
	/* Draw until you have 7 cards in hand.
	   You may set aside any Action cards drawn this way, as you draw them;
	   discard the set aside cards after you finish drawing.
	   《2nd edition》 Draw until you have 7 cards in hand, skipping any Action cards you choose to;
	   set those aside, discarding them afterwards. */
	CardEffect['Library'] = function* () {
		yield FBref_Message.set( '手札が7枚になるまでカードを引きます。アクションカードを引いたら脇に置くことができます。' );

		const AsideCardsID = [];

		while ( Game.player().Drawable() && Game.player().HandCards.length < 7 ) {
			const DeckTopCard = Game.player().LookDeckTopCard();

			if ( !IsActionCard( Cardlist, DeckTopCard.card_no ) ) {
				yield Game.player().DrawCards(1);
			} else {
				const set_aside
				  = yield MyDialog( {
						message  : `${Cardlist[ DeckTopCard.card_no ].name_jp}を脇に置きますか？`,
						contents : MakeHTML_Card( DeckTopCard, Game ),
						buttons  : [
							{ return_value : true , label : '脇に置く', },
							{ return_value : false, label : '手札に加える', }, ],
					} );

				if ( set_aside ) {
					AsideCardsID.push( DeckTopCard.card_ID );
					Game.player().AddToAside( Game.GetCardByID( DeckTopCard.card_ID ) );
					yield FBref_Players.set( Game.player() );
				} else {
					yield Game.player().DrawCards(1);
				}
			}
		}

		yield AcknowledgeButton_Me();  // 脇に置いたカードを確認

		/* move cards in Aside to DiscardPile */
		AsideCardsID.forEach(
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
		SelectedCardsID.forEach( card_ID => Game.Discard( card_ID, undefined, false ) );

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

		function* attack_effects( player_id ) {
			const pl = Game.Players[player_id];

			/* 山札から2枚めくり公開 */
			yield pl.RevealDeckTop(2);
			const RevealedCardIDs = [
				pl.Open[ pl.Open.length - 1 ].card_ID,
				pl.Open[ pl.Open.length - 2 ].card_ID, ];

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

				Game.Trash( clicked_card_ID );
				yield FBref_Game.update( {
					TrashPile : Game.TrashPile,
					[`Players/${player_id}/Open`] : Game.Players[ player_id ].Open,
				} );
				Game.StackedCardIDs.push( clicked_card_ID );
			} else {
				yield AcknowledgeButton_OtherPlayer( player_id );
			}

			/* 公開したカードの残りを捨て札に */
			RevealedCardIDs.forEach( card_ID => Game.Discard( card_ID, player_id ) );
			yield FBref_Players.child( player_id ).update( {
				DiscardPile : pl.DiscardPile,
				Open        : pl.Open,
			} );
		}

		yield Game.AttackAllOtherPlayers(
				'Thief',
				'山札の上から2枚を公開してください。\
				財宝カードが公開された場合そのうち1枚が廃棄されます。\
				廃棄されたカード以外は捨て札にしてください。',
				false,  // don't send signals
				attack_effects );


		// 1枚以上廃棄したならばその中から好きな枚数獲得
		if ( Game.StackedCardIDs.length > 0 ) {
			/* 廃棄したカードの獲得画面 */
			let trashed_cards_html;

			Game.StackedCardIDs.forEach( function( card_ID ) {
				const card = Game.GetCardByID( card_ID, false );
				card.class_str = 'Thief_GainTrashedCard pointer';
				trashed_cards_html += MakeHTML_Card( card, Game );
			} );

			yield MyAlert( '廃棄したカードから好きな枚数獲得してください。', 
				{ contents : trashed_cards_html } );

			Game.ResetClassStr( Game.StackedCardIDs );
			yield FBref_Game.update( {
				TrashPile : Game.TrashPile,
				Players   : Game.Players ,
			} );

			Game.StackedCardIDs = [];
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

		Game.AddToDiscardPile( Game.GetCardByID( clicked_card_ID ) );

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

		const RevealedCardIDs = [];

		let treasure_num = 0;
		while ( Game.player().Drawable() && treasure_num < 2 ) {
			const DeckTopCard = Game.player().LookDeckTopCard();
			if ( IsTreasureCard( Cardlist, DeckTopCard.card_no ) ) treasure_num++;
			RevealedCardIDs.push( DeckTopCard.card_ID );
			yield Game.player().RevealDeckTop(1);
		}

		yield AcknowledgeButton_Me();  // 脇に置いたカードを確認

		/* 公開したカードを片づける */
		RevealedCardIDs.forEach( function( card_ID ) {
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
				function*( player_id ) {
					// 呪いを獲得
					yield Game.GainCardByName( 'Curse', 'DiscardPile', player_id );
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

		Game.ForAllPlayers( function*( player_id ) {
			const pl = Game.Players[player_id];

			if ( !pl.Drawable() ) return;

			/* 山札から1枚めくり公開 */
			const DeckTopCard = pl.LookDeckTopCard();
			yield pl.RevealDeckTop(1);

			const return_value
			  = yield MyDialog( {
					message  : `${Cardlist[ DeckTopCard.card_no ].name_jp}を公開しました。`,
					contents : MakeHTML_Card( DeckTopCard, Game ),
					buttons  : [
						{ return_value : 'Discard'      , label : '捨て札にする', },
						{ return_value : 'PutBackToDeck', label : 'そのまま戻す', }, ],
				} );

			switch ( return_value ) {
				case 'Discard' :
					Game.Discard( DeckTopCard.card_ID, player_id );
					break;

				case 'PutBackToDeck' :
					Game.PutBackToDeck( DeckTopCard.card_ID, player_id, undefined, 'up' );
					break;
			}

			yield FBref_Players.child( player_id ).set( pl );
		});


		yield Game.AttackAllOtherPlayers(
				'Spy',
				'山札の上から1枚を公開してください。公開されたカードは捨て札になるか山札に戻されます。',
				false,  // don't send signals
				undefined );

		// 公開したカードを裏向きに戻す
		yield Game.ResetFace();
	};





	/* 29. 民兵 */
	/* +2 Coins Each other player discards down to 3 cards in his hand.
	   《2nd edition》 +2 Coins Each other player discards down to 3 cards in hand. */
	CardEffect['Militia'] = function* () {
		yield FBref_Message.set( '手札が3枚になるまで捨てて下さい。' );

		yield Game.AttackAllOtherPlayers(
				'Militia',
				'手札が3枚になるまで捨てて下さい。',
				true,  // send signals
				undefined );
	};

	/* アタックされる側 */
	AttackEffect['Militia'] = function*() {
		while ( $('.MyHandCards').children('.card').length > 3 ) {
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

		/* 銀貨を山札の一番上に獲得 */
		yield Game.GainCardByName( 'Silver', 'Deck', undefined, 'up' );

		yield Game.AttackAllOtherPlayers(
				'Bureaucrat',
				'手札に勝利点カードが1枚以上ある場合はそのうち1枚を山札に戻してください。そうでない場合は手札を公開してください。',
				true,  // send signals
				undefined );

		// 全プレイヤーの山札に戻した勝利点カードか公開した手札を確認
		yield AcknowledgeButton_Me();

		// 公開したカードを裏向きに戻す
		Game.ResetFace();
		yield FBref_Players.set( Game.Players );
	};

	// アタックされる側
	AttackEffect['Bureaucrat'] = function*() {  /* アタックされる側 */
		const VictoryCards
		  = Game.Me().HandCards.filter( card => IsVictoryCard( Cardlist, card.card_no ) );

		// 手札に勝利点カードが無ければ手札を公開
		if ( VictoryCards.length == 0 ) {
			yield Game.Me().RevealHandCards();  /* 手札を公開 */
			return;
		}

		// 手札に勝利点カードがあればそのうち1枚を選んで山札に戻す
		yield WaitForPuttingBackMyHandCard( card_no => IsVictoryCard( Cardlist, card_no ), 'up' );
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

		HideTrashDoneButton();
	};
} );
