
$( function() {



	// CardEffect['Copper']       = function* () {}  /* ok  1. 銅貨 */
	   CardEffect['Silver']       = function* () {}  /* --  2. 銀貨 */
	   CardEffect['Gold']         = function* () {}  /* --  3. 金貨 */
	   CardEffect['Estate']       = function* () {}  /* --  4. 屋敷 */
	   CardEffect['Duchy']        = function* () {}  /* --  5. 公領 */
	   CardEffect['Province']     = function* () {}  /* --  6. 属州 */
	   CardEffect['Curse']        = function* () {}  /* --  7. 呪い */
	   CardEffect['Market']       = function* () {}  /* --  8. 市場 */
	// CardEffect['Remodel']      = function* () {}  /* ok  9. 改築 */
	   CardEffect['Smithy']       = function* () {}  /* -- 10. 鍛冶屋 */
	// CardEffect['Moneylender']  = function* () {}  /* ok 11. 金貸し */
	   CardEffect['Woodcutter']   = function* () {}  /* -- 12. 木こり */
	// CardEffect['Council Room'] = function* () {}  /* ok 13. 議事堂 */
	// CardEffect['Throne Room']  = function* () {}  /* ok 14. 玉座の間 */
	   CardEffect['Laboratory']   = function* () {}  /* -- 15. 研究所 */
	// CardEffect['Mine']         = function* () {}  /* ok 16. 鉱山 */
	// CardEffect['Workshop']     = function* () {}  /* ok 17. 工房 */
	// CardEffect['Chancellor']   = function* () {}  /* ok 18. 宰相 */
	// CardEffect['Feast']        = function* () {}  /* ok 19. 祝宴 */
	   CardEffect['Festival']     = function* () {}  /* -- 20. 祝祭 */
	// CardEffect['Library']      = function* () {}  /* ok 21. 書庫 */
	// CardEffect['Cellar']       = function* () {}  /* ok 22. 地下貯蔵庫 */
	// CardEffect['Gardens']      = function* () {}  /* -- 23. 庭園 */
	// CardEffect['Thief']        = function* () {}  /* ok 24. 泥棒 */
	// CardEffect['Adventurer']   = function* () {}  /* ok 25. 冒険者 */
	   CardEffect['Moat']         = function* () {}  /* ok 26. 堀 */
	// CardEffect['Witch']        = function* () {}  /* ok 27. 魔女 */
	// CardEffect['Spy']          = function* () {}  /* ok 28. 密偵 */
	// CardEffect['Militia']      = function* () {}  /* ok 29. 民兵 */
	   CardEffect['Village']      = function* () {}  /* -- 30. 村 */
	// CardEffect['Bureaucrat']   = function* () {}  /* ok 31. 役人 */
	// CardEffect['Chapel']       = function* () {}  /* ok 32. 礼拝堂 */






	/* 1. 銅貨 */
	CardEffect['Copper'] = function* () {
	 /* 銅細工師の効果 */
		Game.TurnInfo.coin += Game.TurnInfo.add_copper_coin;
		yield FBref_TurnInfo.child('coin').set( Game.TurnInfo.coin );
	}





	/* 9. 基本 - 改築 */
	CardEffect['Remodel'] = function* () {
	 /*
		Trash a card from your hand.
		Gain a card costing up to 2 Coins more than the trashed card.
		《2nd edition》 Trash a card from your hand.
		Gain a card costing up to 2 Coins more than it.
	 */
		if ( Game.player().HandCards.IsEmpty() ) {
			yield MyAlert( '手札にカードがありません。' );
			return;
		}

		// (1) 廃棄する手札のカードの選択
		yield FBref_Message.set( '手札のカードを1枚廃棄して下さい。' );

		const TrashedCardID = ( yield WaitForTrashingHandCard() ).card_ID;

		const TrashedCardCost = Game.GetCost( Game.LookCardWithID( TrashedCardID ).card_no );

		// (2) 廃棄したカード+2コインまでのコストのカードの獲得
		yield FBref_Message.set( `コストが廃棄したカード+2(=${TrashedCardCost.coin + 2})
				コインまでのカードを獲得してください。` );

		yield WaitForGainingSupplyCard( 'DiscardPile', Game.player().id,
				( card, card_no ) =>
					CostOp( '<=', Game.GetCost( card_no ), CostOp( '+', TrashedCardCost, [2,0,0] ) ) );
	};





	/* 11. 金貸し */
	CardEffect['Moneylender'] = function* () {
	 /* Trash a Copper card from your hand. If you do, +3 Coins. */
		const Coppers 
		  = Game.player().HandCards.filter( card => card.card_no === CardName2No['Copper'] );

		if ( Coppers.IsEmpty() ) {
			yield MyAlert( '手札に銅貨がありません。' );
			return;
		}

		yield FBref_Message.set( '手札の銅貨を1枚廃棄して下さい。' );

		/* 手札のカードのクリック動作を廃棄するカードの選択に変更 */
		yield WaitForTrashingHandCard( card_no => card_no === CardName2No['Copper'] );

		// +3 Coins
		Game.TurnInfo.coin += 3;
		yield FBref_TurnInfo.child('coin').set( Game.TurnInfo.coin );
	};





	/* 13. 議事堂 */
	CardEffect['Council Room'] = function* () {
	 /*
		+4 Cards +1 Buy
		Each other player draws a card.
		《2nd edition》
		+4 Cards +1 Buy
		Each other player draws a card.
	 */
		yield Game.ForAllOtherPlayers( player_id => Game.Players[ player_id ].DrawCards(1) )
	};





	/* 14. 玉座の間 */
	CardEffect['Throne Room'] = function* () {
	 /*
		Choose an Action card in your hand. Play it twice.
		《2nd edition》 You may play an Action card from your hand twice.
	 */
	 /* 1st editionで実装 */
		const Action
		  = Game.player().HandCards.filter( card => IsActionCard( Cardlist, card.card_no ) );

		if ( Action.IsEmpty() ) {
			yield MyAlert( '手札にアクションカードがありません。' );
			return;
		}

		yield FBref_Message.set( '手札のアクションカードを1枚選んで下さい。' );

		// アクションカード選択待機
		const UseTwiceAction_card_ID
		 = ( yield WaitForPlayingHandCard( card_no => IsActionCard( Cardlist, card_no ) ) ).card_ID;

		yield MyAsync( GetCardEffect, UseTwiceAction_card_ID );  /* 1回目 */
		yield MyAsync( GetCardEffect, UseTwiceAction_card_ID );  /* 2回目 */
	};





	/* 16. 基本 - 鉱山 */
	CardEffect['Mine'] = function* () {
	 /*
		Trash a Treasure card from your hand.
		Gain a Treasure card costing up to 3 Coins more; put it into your hand.
		《2nd edition》 You may trash a Treasure from your hand.
		Gain a Treasure to your hand costing up to 3 Coins more than it.
	 */
		const Treasure
		  = Game.player().HandCards.filter( card => IsTreasureCard( Cardlist, card.card_no ) );

		if ( Treasure.IsEmpty() ) {
			yield MyAlert( '手札に財宝カードがありません。' );
			return;
		}

		// (1) 廃棄する手札の財宝カードの選択
		yield FBref_Message.set( '手札の財宝カードを1枚廃棄して下さい。' );

		const TrashedCardID
		  = ( yield WaitForTrashingHandCard( card_no => IsTreasureCard( Cardlist, card_no ) ) ).card_ID;

		const TrashedCardCost = Game.GetCost( Game.LookCardWithID( TrashedCardID ).card_no );

		// (2) 廃棄したカード+3コインまでのコストの財宝カードの獲得
		yield FBref_Message.set( `コストが廃棄したカード+3(=${TrashedCardCost.coin + 3})
				コインまでの財宝カードを獲得してください。` );

		yield WaitForGainingSupplyCard( 'HandCards', Game.player().id,
				( card, card_no ) =>
					CostOp( '<=', Game.GetCost( card_no ), CostOp( '+', TrashedCardCost, [3,0,0] ) )
					&& IsTreasureCard( Cardlist, card_no ) );
	};





	/* 17. 基本 - 工房 */
	CardEffect['Workshop'] = function* () {
	 /* Gain a card costing up to 4 Coins. */
		yield FBref_Message.set( 'コスト4以下のカードを獲得して下さい。' );

		yield WaitForGainingSupplyCard( 'DiscardPile', Game.player().id,
				( card, card_no ) => CostOp( '<=', Game.GetCost( card_no ), [4,0,0] ) );
	};





	/* 18. 宰相 */
	CardEffect['Chancellor'] = function* () {
	 /*
		+2 Coins
		You may immediately put your deck into your discard pile.
		《2nd edition》 Removed.
	 */
		yield FBref_Message.set( '山札を捨て札に置きますか？' );

		const clicked_btn = yield WaitForButtonClick( [
			{ return_value : 'Discard'    , label : '捨て札におく' },
			{ return_value : 'DontDiscard', label : '何もしない' },
		] );

		if ( clicked_btn == 'Discard' ) {
			yield Game.player().PutDeckIntoDiscardPile();  /* 山札をそのままひっくり返して捨て山に置く */
		}
	};





	/* 19. 基本 - 祝宴 */
	CardEffect['Feast'] = function* ( playing_card_ID ) {
	 /*
		Trash this card. Gain a card costing up to 5 Coins.
		《2nd edition》 Removed
	 */
		yield FBref_Message.set( 'コスト5以下のカードを獲得して下さい。' );

		// このカードを廃棄する
		Game.Trash( playing_card_ID );
		yield FBref_Game.update( {
			TrashPile : Game.TrashPile,
			[`Players/${Game.player().id}/PlayArea`] : Game.player().PlayArea,
		} );

		yield WaitForGainingSupplyCard( 'DiscardPile', Game.player().id,
				( card, card_no ) => CostOp( '<=', Game.GetCost( card_no ), [5,0,0] ) );
	};





	/* 21. 書庫 */
	CardEffect['Library'] = function* () {
	 /*
		Draw until you have 7 cards in hand.
		You may set aside any Action cards drawn this way, as you draw them;
		discard the set aside cards after you finish drawing.
		《2nd edition》 Draw until you have 7 cards in hand, skipping any Action cards you choose to;
		set those aside, discarding them afterwards.
	 */
		yield FBref_Message.set( `手札が7枚になるまでカードを引きます。
				アクションカードを引いたら脇に置くことができます。` );

		const AsideCardsID = [];

		while ( Game.player().Drawable() && Game.player().HandCards.length < 7 ) {
			const DeckTopCard = Game.player().LookDeckTopCard();

			if ( !IsActionCard( Cardlist, DeckTopCard.card_no ) ) {
				yield Game.player().DrawCards(1);
				continue;
			}
			
			// アクションカードのとき
			const set_aside = yield MyDialog( {
					message  : `${Cardlist[ DeckTopCard.card_no ].name_jp}を脇に置きますか？`,
					contents : MakeHTML_Card( DeckTopCard, Game ),
					buttons  : [
						{ return_value : true , label : '脇に置く', },
						{ return_value : false, label : '手札に加える', }, ],
				} );

			if ( set_aside ) {
				AsideCardsID.push( DeckTopCard.card_ID );
				yield Game.player().SetAside( DeckTopCard.card_ID, Game );
			} else {
				yield Game.player().DrawCards(1);
			}
		}

		yield AcknowledgeButton();  // 脇に置いたカードを確認

		/* move cards in Aside to DiscardPile */
		yield AsideCardsID.AsyncEach( card_ID => Game.player().Discard( card_ID, Game ) );
	};





	/* 22. 地下貯蔵庫 */
	CardEffect['Cellar'] = function* () {
	 /*
		+1 Action
		Discard any number of cards. +1 Card per card discarded.
		《2nd edition》
		+1 Action
		Discard any number of cards, then draw that many.
	 */
		yield FBref_Message.set( '手札から任意の枚数を捨て札にして下さい。捨て札にした枚数だけカードを引きます。' );

		// 手札のカードを任意枚数選択
		const SelectedCardsID = yield WaitForMarkingHandCards();

		const pl = Game.player();

		// 選択したカードを捨て札に
		yield SelectedCardsID.AsyncEach( card_ID => pl.Discard( card_ID, Game, false ) );

		yield Promise.all( [
			FBref_Message.set( `捨て札にした枚数 ： ${SelectedCardsID.length}枚` ),
			FBref_chat.push( `${pl.name}が${SelectedCardsID.length}枚のカードを捨て札にしました。` ),
		] );

		yield AcknowledgeButton();

		// 捨て札にした枚数カードを引く
		yield pl.DrawCards( SelectedCardsID.length );
	};





	/* 24. 泥棒 */
	CardEffect['Thief'] = function* () {
	 /*
		Each other player reveals the top 2 cards of his deck.
		If they revealed any Treasure cards, they trash one of them that you choose.
		You may gain any or all of these trashed cards.
		They discard the other revealed cards.
		《2nd edition》 Removed
	 */
		yield FBref_Message.set( `他のプレイヤーの山札の上から2枚を公開し、
			その中に財宝カードがあればそのうち1枚を選んで廃棄します。
			これによって廃棄されたカードのうち好きな枚数を獲得できます。` );

		function* attack_effects( player_id ) {
			const pl = Game.Players[player_id];

			/* 山札から2枚めくり公開（山札が無いときがあるので2枚とは限らない） */
			const RevealedCardIDs = yield pl.RevealDeckTop(2);

			const $TreasureCards
			 = $(`.OtherPlayer[data-player_id=${player_id}] .sOpen`)
					.children('.card')
					.filter( function() {
						return IsTreasureCard( Cardlist, Number( $(this).attr('data-card_no') ) )
					} );

			// 財宝カードがあれば1枚廃棄
			if ( $TreasureCards.length == 0 ) {
				yield AcknowledgeButton_OtherPlayer( player_id );
			} else {
				$TreasureCards.addClass('Thief_Trash pointer');
				const clicked_card_ID
				  = yield new Promise( resolve => Resolve['Thief_Trash'] = resolve );
				$TreasureCards.removeClass('Thief_Trash pointer');

				Game.Trash( clicked_card_ID );
				yield FBref_Game.update( {
					TrashPile : Game.TrashPile,
					[`Players/${player_id}/Open`] : Game.Players[ player_id ].Open,
				} );
				yield Game.StackCardID( clicked_card_ID );
			}

			/* 公開したカードの残りを捨て札に */
			yield RevealedCardIDs.AsyncEach( card_ID => pl.Discard( card_ID, Game ) );
		}

		yield Game.AttackAllOtherPlayers(
				'Thief',
				'山札の上から2枚を公開してください。\
				財宝カードが公開された場合そのうち1枚が廃棄されます。\
				廃棄されたカード以外は捨て札にしてください。',
				false,  // don't send signals
				attack_effects );

		if ( Game.StackedCardIDs.IsEmpty() ) return;

		// 1枚以上廃棄したならばその中から好きな枚数獲得
		/* 廃棄したカードの獲得画面 */
		let trashed_cards_html = "";

		Game.StackedCardIDs.forEach( card_ID => {
			const card = Game.LookCardWithID( card_ID );
			card.class_str = 'Thief_GainTrashedCard pointer';
			trashed_cards_html += MakeHTML_Card( card, Game );
		} );

		yield MyAlert( '廃棄したカードから好きな枚数獲得してください。', 
			{ contents : trashed_cards_html } );

		yield Game.ResetClassStr();
		//yield Game.ResetStackedCardIDs();
	};

	/* 廃棄するカードの選択 */
	$('.OtherPlayers-wrapper').on( 'click', '.sOpen .Thief_Trash', function() {
		Resolve['Thief_Trash']( Number( $(this).attr('data-card_ID') ) );  // 再開
	} );

	/* 廃棄したカードの獲得 */
	$('.MyAlert').on( 'click', '.Thief_GainTrashedCard', function() {
		const clicked_card_ID = Number( $(this).attr('data-card_ID') );
		$(this).remove();  /* クリックしたカードを非表示 */
		Game.GainCard( clicked_card_ID );
	} );





	/* 25. 冒険者 */
	CardEffect['Adventurer'] = function*() {
	 /*
	 	Reveal cards from your deck until you reveal 2 Treasure cards.
		Put those Treasure cards in your hand and discard the other revealed cards.
		《2nd edition》 Removed
	 */
		yield FBref_Message.set( '財宝カードが2枚公開されるまでカードを引きます。' );

		const RevealedCardIDs = [];

		let treasure_num = 0;
		while ( Game.player().Drawable() && treasure_num < 2 ) {
			const DeckTopCard = ( yield Game.player().RevealDeckTop(1) )[0];
			if ( IsTreasureCard( Cardlist, DeckTopCard.card_no ) ) treasure_num++;
			RevealedCardIDs.push( DeckTopCard.card_ID );
		}

		yield AcknowledgeButton();  // 脇に置いたカードを確認

		/* 公開したカードを片づける */
		RevealedCardIDs.forEach( function( card_ID ) {
			const card = Game.LookCardWithID( card_ID );
			if ( IsTreasureCard( Cardlist, card.card_no ) ) {
				Game.player().PutIntoHand( card_ID, Game );
			} else {
				Game.player().Discard( card_ID, Game );
			}
		});

		yield FBref_Players.child( Game.player().id ).set( Game.player() );
	};





	/* 26. 堀 */
	ReactionEffect['Moat'] = function*() {
	 /*
		+2 Cards
		-------------------------
		When another player plays an Attack card, you may reveal this from your hand.
		If you do, you are unaffected by that Attack.

		《2nd edition》
		+2 Cards
		-------------------------
		When another player plays an Attack card, you may first reveal this from your hand,
		to be unaffected by it.
	 */
		Game.TurnInfo.Revealed_Moat[myid] = true;
		yield FBref_Game.child(`TurnInfo/Revealed_Moat/${myid}`).set(true);
	};





	/* 27. 魔女 */
	CardEffect['Witch'] = function* () {
	 /*
		+2 Cards
		Each other player gains a Curse card.
		《2nd edition》
		+2 Cards
		Each other player gains a Curse.
	 */
		yield FBref_Message.set( '呪いを獲得して下さい。' );

		yield Game.AttackAllOtherPlayers(
				'Witch',
				'呪いを獲得します。',
				false,  // don't send signals
				function*( player_id ) {
					// 呪いを獲得
					yield Game.GainCardFromSupplyByName( 'Curse', 'DiscardPile', player_id );
				} );
	};





	/* 28. 密偵 */
	CardEffect['Spy'] = function* () {
	 /*
		+1 Card +1 Action
		Each player (including you) reveals the top card of his deck
		and either discards it or puts it back, your choice.
		《2nd edition》 Removed
	 */
		yield FBref_Message.set( `各プレイヤー（自分を含む）の山札の上から1枚を公開し、
			それを捨て札にするかそのまま山札に戻すか選んでください。` );

		function* Spy_Reveal( player_id ) {
			const pl = Game.Players[player_id];

			if ( !pl.Drawable() ) return;

			/* 山札から1枚めくり公開 */
			const DeckTopCard = pl.LookDeckTopCard();
			yield pl.RevealDeckTop(1);

			const clicked_btn
			  = yield MyDialog( {
					message  : `${pl.name}の山札から${Cardlist[ DeckTopCard.card_no ].name_jp}を公開しました。`,
					contents : MakeHTML_Card( DeckTopCard, Game ),
					buttons  : [
						{ return_value : 'Discard'      , label : '捨て札にする', },
						{ return_value : 'PutBackToDeck', label : 'そのまま戻す', }, ],
				} );

			switch ( clicked_btn ) {
				case 'Discard' :
					yield pl.Discard( DeckTopCard.card_ID, Game );
					break;

				case 'PutBackToDeck' :
					yield pl.PutBackToDeck( DeckTopCard.card_ID, Game, true, 'up' );
					break;

				default :
					throw new Error(`@Spy: invalid value for clicked_btn "${clicked_btn}"`);
					break;
			}
		}

		yield MyAsync( Spy_Reveal, Game.player().id );  // 自分

		yield Game.AttackAllOtherPlayers(
				'Spy',
				'山札の上から1枚を公開してください。公開されたカードは捨て札になるか山札に戻されます。',
				false,  // don't send signals
				Spy_Reveal );

		yield AcknowledgeButton();

		// 公開したカードを裏向きに戻す
		yield Game.ResetFace();
		yield FBref_Players.set( Game.Players );
	};





	/* 29. 民兵 */
	CardEffect['Militia'] = function* () {
	 /*
		+2 Coins
		Each other player discards down to 3 cards in his hand.
		《2nd edition》
		+2 Coins
		Each other player discards down to 3 cards in hand.
	 */
		yield FBref_Message.set( '手札が3枚になるまで捨てて下さい。' );

		yield Game.AttackAllOtherPlayers(
				'Militia',
				'手札が3枚になるまで捨てて下さい。',
				true,  // send signals
				undefined );
	};

	AttackEffect['Militia'] = function*() {
		/* アタックされる側 */
		while ( $('.MyHandCards').children('.card').length > 3 ) {
			yield WaitForDiscardingMyHandCard( undefined, false );
		}
	};





	/* 31. 役人 */
	CardEffect['Bureaucrat'] = function* () {
	 /*
		Gain a silver card; put it on top of your deck.
		Each other player reveals a Victory card from his hand and puts it on his deck
		(or reveals a hand with no Victory cards).
		《2nd edition》
		Gain a Silver onto your deck.
		Each other player reveals a Victory card from their hand and puts it onto their deck
		(or reveals a hand with no Victory cards).
	 */
		const msg = '手札に勝利点カードが1枚以上ある場合はそのうち1枚を山札に戻してください。\
					そうでない場合は手札を公開してください。';

		yield FBref_Message.set( `プレイヤーは銀貨を山札に獲得します。他のプレイヤーは${msg}` );

		/* 銀貨を山札の一番上に獲得 */
		yield Game.GainCardFromSupplyByName( 'Silver', 'Deck', undefined, 'up' );

		yield Game.AttackAllOtherPlayers(
				'Bureaucrat',
				msg,
				true,  // send signals
				undefined );

		// 全プレイヤーの山札に戻した勝利点カードか公開した手札を確認
		yield AcknowledgeButton();

		// 公開したカードを裏向きに戻す
		yield Game.ResetFace();
		yield Promise.all([
			FBref_Players.set( Game.Players ),
			Game.ResetStackedCardIDs(),
		])
	};

	AttackEffect['Bureaucrat'] = function*() {
		/* アタックされる側 */
		const VictoryCards
		  = Game.Me().HandCards.filter( card => IsVictoryCard( Cardlist, card.card_no ) );

		// 手札に勝利点カードが無ければ手札を公開
		if ( VictoryCards.IsEmpty() ) {
			yield Game.Me().FaceUpAllHandCards( Game );  /* 手札を公開 */
			return;
		}

		// 手札に勝利点カードがあればそのうち1枚を選んで山札に戻す
		yield WaitForPuttingBackMyHandCard( card_no => IsVictoryCard( Cardlist, card_no ), true, 'up' );
	};





	/* 32. 礼拝堂 */
	CardEffect['Chapel'] = function* () {
	 /*
		Trash up to 4 cards from your hand.
		《2nd edition》
		Trash up to 4 cards from your hand.
	 */
		yield FBref_Message.set( '手札を4枚まで廃棄して下さい。' );

		ShowAbortButton();

		let trashed_num = 0;
		while ( trashed_num < 4 && !Game.player().HandCards.IsEmpty() ) {
			const return_value = yield WaitForTrashingHandCard();
			if ( return_value.aborted ) break;
			trashed_num++;
			yield FBref_Message.set( `あと ${(4 - trashed_num)} 枚廃棄できます。` );
		}

		HideAbortButton();
	};
} );
