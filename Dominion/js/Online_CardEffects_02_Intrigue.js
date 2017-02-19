$( function() {


	   CardEffect['Great Hall']     = function* () {}  /* -- 33. 大広間 */
	// CardEffect['Upgrade']        = function* () {}  /* ok 34. 改良 */
	// CardEffect['Masquerade']     = function* () {}  /* ok 35. 仮面舞踏会 */
	// CardEffect['Nobles']         = function* () {}  /* ok 36. 貴族 */
	// CardEffect['Conspirator']    = function* () {}  /* ok 37. 共謀者 */
	// CardEffect['Trading Post']   = function* () {}  /* ok 38. 交易場 */
	// CardEffect['Mining Village'] = function* () {}  /* ok 39. 鉱山の村 */
	// CardEffect['Duke']           = function* () {}  /* -- 40. 公爵 */
	// CardEffect['Torturer']       = function* () {}  /* ok 41. 拷問人 */
	// CardEffect['Swindler']       = function* () {}  /* ok 42. 詐欺師 */
	// CardEffect['Steward']        = function* () {}  /* ok 43. 執事 */
	// CardEffect['Baron']          = function* () {}  /* ok 44. 男爵 */
	// CardEffect['Minion']         = function* () {}  /* ok 45. 寵臣 */
	// CardEffect['Scout']          = function* () {}  /* ok 46. 偵察員 */
	// CardEffect['Pawn']           = function* () {}  /* ok 47. 手先 */
	// CardEffect['Ironworks']      = function* () {}  /* ok 48. 鉄工所 */
	// CardEffect['Coppersmith']    = function* () {}  /* ok 49. 銅細工師 */
	// CardEffect['Courtyard']      = function* () {}  /* ok 50. 中庭 */
	// CardEffect['Wishing Well']   = function* () {}  /* ok 51. 願いの井戸 */
	   CardEffect['Harem']          = function* () {}  /* -- 52. ハーレム */
	// CardEffect['Saboteur']       = function* () {}  /* ok 53. 破壊工作員 */
	// CardEffect['Bridge']         = function* () {}  /* ok 54. 橋 */
	// CardEffect['Secret Chamber'] = function* () {}  /* ok 55. 秘密の部屋 */
	// CardEffect['Shanty Town']    = function* () {}  /* ok 56. 貧民街 */
	// CardEffect['Tribute']        = function* () {}  /* ok 57. 貢物 */






	/* 34. 改良 */
	CardEffect['Upgrade'] = function* () {
	 /*
		+1 Card +1 Action
		Trash a card from your hand. Gain a card costing exactly 1 Coin more than it.
		《2nd edition》
		+1 Card +1 Action
		Trash a card from your hand. Gain a card costing exactly 1 Coin more than it.
	 */
		if ( Game.player().HandCards.IsEmpty() ) {
			FBref_chat.push('手札にカードがありませんでした。');
			yield MyAlert( '手札にカードがありません。' );
			return;
		}

		// (1) 廃棄する手札のカードの選択
		yield FBref_Message.set( '手札のカードを1枚廃棄して下さい。' );

		const TrashedCardID = ( yield WaitForTrashingHandCard() ).card_ID;

		const TrashedCardCost = Game.GetCost( Game.LookCardWithID( TrashedCardID ).card_no );

		// (2) 廃棄したカード+1コインのコストのカードの獲得
		yield FBref_Message.set(
			`コストがちょうど廃棄したカード+1(=${TrashedCardCost.coin + 1} )コインのカードを獲得してください。` );

		yield WaitForGainingSupplyCard( 'DiscardPile', Game.player().id,
				( card, card_no ) =>
					CostOp( '==', Game.GetCost( card_no ), CostOp( '+', TrashedCardCost, [1,0,0] ) ) );
	};





	/* 35. 仮面舞踏会 */
	CardEffect['Masquerade'] = function*() {
	 /*
		+2 Card
		Each player passes a card in his hand to the left at once.
		Then you may trash a card from your hand.
		《2nd edition》
		+2 Cards
		Each player with any cards in hand passes one to the next such player to their left, at once.
		Then you may trash a card from your hand.
	 */
		yield FBref_Message.set( `各プレイヤーは自分の手札のカードを1枚選び、次のプレイヤーに同時に渡します。
			その後、あなたは自分の手札のカードを1枚廃棄することができます。` );

		// 仮面舞踏会使用者が一旦全員分（自分含む）の選択したカードを集める
		yield Game.ForAllPlayers( function*( player_id ) {
			SendSignal( player_id, {
				Attack    : false,
				card_name : 'Masquerade',
				Message   : '各プレイヤーは自分の手札のカードを1枚選び、次のプレイヤーに同時に渡します。',
			} );
		} );

		// 集計
		let PassedCardIDs = {};
		let done_num = 0;

		FBref_Signal.child('Masquerade_gather').on( 'value', function( FBsnapshot ) {
			const passed_val = FBsnapshot.val();
			if ( passed_val == null ) return;

			// 全員分揃ったら次に
			if ( ++done_num === Game.Players.length ) {
				PassedCardIDs = passed_val;
				Resolve['Masquerade_gather']();
			}
		} );
		yield new Promise( resolve => Resolve['Masquerade_gather'] = resolve );
		FBref_Signal.child('Masquerade_gather').off();  // 監視終了
		FBref_Signal.child('Masquerade_gather').remove();

		// 次のプレイヤーに渡す
		yield Game.ForAllPlayers( function*( player_id ) {
			const passed_card_ID = PassedCardIDs[ Game.PreviousPlayerID( player_id ) ];

			// 前の人が手札が無かった場合何も受け取れない
			if ( passed_card_ID == -1 ) return;

			yield Game.StackCardID( passed_card_ID );
			Game.Players[ player_id ].AddToHandCards( Game.GetCardWithID( passed_card_ID ) );
		} );

		// カードを渡した後のPlayersの同期、裏向きを解除
		yield Game.ResetFace();
		yield FBref_Players.set( Game.Players );

		// 手札を1枚廃棄できる
		yield FBref_Message.set( '手札のカードを1枚廃棄することができます。');
		ShowAbortButton('廃棄しない');
		yield WaitForTrashingHandCard();
		HideAbortButton();
	};

	CardEffect['Masquerade_SelectPassCard'] = function* () {
	 /* 自分と他のプレイヤー */
		if ( Game.Me().HandCards.IsEmpty() ) {
			yield FBref_Signal.child(`Masquerade_gather/${Game.Me().id}`).set( -1 );
			return;
		}

		// 渡すカードの選択待ち
		const SelectedCardID
		 = ( yield WaitForSelectingHandCard( Game.player().id != Game.Me().id ) ).card_ID;

		Game.Me().AddToOpen( Game.GetCardWithID( SelectedCardID ) );
		yield Game.FaceDownCard( SelectedCardID );
		yield FBref_Players.child( Game.Me().id ).set( Game.Me() )

		// card_IDを送る
		yield FBref_Signal.child(`Masquerade_gather/${Game.Me().id}`).set( SelectedCardID );
	}





	/* 36. 貴族 */
	CardEffect['Nobles'] = function*() {
	 /*
		Choose one: +3 Cards, or +2 Actions.
		-------------------------
		2 VP
		《2nd edition》
		Choose one: +3 Cards; or +2 Actions.
		-------------------------
		2 VP
	 */
		yield FBref_Message.set( '次のうち一つを選んでください。' );

		const clicked_btn = yield WaitForButtonClick( [
			{ return_value : '3Cards'  , label : '+3 Cards'   },
			{ return_value : '2Actions', label : '+2 Actions' },
		] );

		switch ( clicked_btn ) {
			case '3Cards' :
				FBref_chat.push(`"+3 Cards"を選択しました。`);
				yield Game.player().DrawCards(3);
				break;

			case '2Actions' :
				FBref_chat.push(`"+2 Actions"を選択しました。`);
				Game.TurnInfo.action += 2;
				yield FBref_TurnInfo.child('action').set( Game.TurnInfo.action );
				break;

			default :
				throw new Error(`@Nobles: invalid value for clicked_btn "${clicked_btn}"`);
				break;
		}
	};





	/* 37. 共謀者 */
	CardEffect['Conspirator'] = function* () {
	 /*
		+2 Coins
		If you've played 3 or more Actions this turn (counting this): +1 Card, +1 Action.
		《2nd edition》
		+2 Coins
		If you've played 3 or more Actions this turn (counting this), +1 Card and +1 Action.
	 */
		if ( Game.TurnInfo.played_actioncards_num < 3 ) return;

		// このターンにアクションカードを3枚以上プレイしているときは +1 Card, +1 Action
		Game.TurnInfo.action++;
		yield Promise.all( [
			Game.player().DrawCards(1),
			FBref_TurnInfo.child('action').set( Game.TurnInfo.action ),
		] );
	};





	/* 38. 交易場 */
	CardEffect['Trading Post'] = function*() {
	 /*
		Trash 2 cards from your hand. If you do, gain a silver card; put it into your hand.
		《2nd edition》
		Trash 2 cards from your hand. If you did, gain a Silver to your hand.
	 */
		yield FBref_Message.set( '廃棄するカードを2枚選択してください。そうした場合銀貨を手札に獲得します。' );

		// 廃棄するカードを2枚選択
		let trashed_num = 0;
		while ( trashed_num < 2 && !Game.player().HandCards.IsEmpty() ) {
			yield WaitForTrashingHandCard();
			trashed_num++;
		}

		// 2枚廃棄した場合銀貨を手札に獲得
		if ( trashed_num == 2 ) {
			yield Game.GainCardFromSupplyByName( 'Silver', 'HandCards' );
		}
	};





	/* 39. 鉱山の村 */
	CardEffect['Mining Village'] = function*( playing_card_ID ) {
	 /*
		+1 Card +2 Actions
		You may trash this card immediately. If you do, +2 Coins.
		《2nd edition》
		+1 Card +2 Actions
		You may trash this for + 2 Coins.
	 */
		yield FBref_Message.set( 'このカードを即座に廃棄することができます。そうした場合、2コインを得ます。' );

		const clicked_btn = yield WaitForButtonClick( [
			{ return_value : 'trash'     , label : '廃棄して +2 Coins' },
			{ return_value : 'dont_trash', label : '廃棄しない' },
		] );

		// 廃棄した場合2コインを得る
		if ( clicked_btn == 'trash' ) {
			Game.TurnInfo.coin += 2;
			Game.Trash( playing_card_ID );

			yield FBref_Game.update( {
				[`Players/${Game.player().id}/PlayArea`] : Game.player().PlayArea,
				TrashPile : Game.TrashPile,
				'TurnInfo/coin' : Game.TurnInfo.coin,
			} );
		}
	};





	/* 41. 拷問人 */
	CardEffect['Torturer'] = function*() {
	 /*
		+3 Card
		Each other player chooses one:
		he discards 2 cards; or he gains a Curse card, putting it in his hand.
		《2nd edition》
		+3 Cards
		Each other player either discards 2 cards or gains a Curse to their hand, their choice.
		(They may pick an option they can't do.)
	 */
		yield FBref_Message.set( `他のプレイヤーは次のうち1つを選ぶ ： 
			<ul>
				<li> 手札からカードを2枚捨て札にする </li>
				<li> 呪いを獲得し手札に加える </li>
			</ul>` );

		yield Game.AttackAllOtherPlayers(
				'Torturer',
				'手札からカードを2枚捨て札にするか呪いを獲得して手札に加えるか選んでください。',
				true,  // send signals
				undefined );

		yield AcknowledgeButton();

		// 公開したカードを裏向きに戻す
		yield Game.ResetFace();
		yield Promise.all([
			FBref_Players.set( Game.Players ),
			Game.ResetStackedCardIDs(),
		]);
	};

	AttackEffect['Torturer'] = function* () {
		/* アタックされる側 */
		const clicked_btn = yield WaitForButtonClick_MyArea( [
			{ return_value : 'Discard2', label : '手札からカードを2枚捨て札にする' },
			{ return_value : 'GetCurse', label : '呪いを獲得し手札に加える' },
		] );

		switch ( clicked_btn ) {
			case 'Discard2' :
				FBref_chat.push(`${Game.Me().name}は"手札からカードを2枚捨て札にする"を選択しました。`);
				yield FBref_MessageTo.child(myid).set('手札からカードを2枚捨て札にしてください。');
				let discarded_num = 0;
				while ( discarded_num < 2 && !Game.Me().HandCards.IsEmpty() ) {
					yield WaitForDiscardingMyHandCard( undefined, false );
					discarded_num++;
				}
				break;

			case 'GetCurse' :
				FBref_chat.push(`${Game.Me().name}は"呪いを獲得し手札に加える"を選択しました。`);
				yield FBref_MessageTo.child(myid).set('呪いを獲得して手札に加えてください。');
				yield Game.GainCardFromSupplyByName( 'Curse', 'HandCards', myid, 'up' );
				break;

			default :
				throw new Error(`@AttackEffect.Torturer: invalid value for clicked_btn "${clicked_btn}"`);
				break;
		}
	};





	/* 42. 詐欺師 */
	CardEffect['Swindler'] = function*() {
	 /*
		+2 Coins
		Each other player trashes the top card of his deck
		and gains a card with the same cost that you choose.
		《2nd edition》
		+2 Coins
		Each other player trashes the top card of their deck
		and gains a card with the same cost that you choose.
	 */
		yield FBref_Message.set( '他のプレイヤーは全員、自分の山札の一番上のカードを廃棄し、\
			廃棄したカードと同じコストのあなたが選んだカード（サプライをクリック）を獲得します。' );

		function* attack_effect( player_id ) {

			const pl = Game.Players[player_id];

			if ( !pl.Drawable() ) return;

			/* 山札から1枚めくり公開 */
			const DeckTopCardID = ( yield pl.RevealDeckTop(1) )[0];
			const DeckTopCard = Game.LookCardWithID( DeckTopCardID );

			yield MyAlert(
				`${pl.name}の山札から${Cardlist[ DeckTopCard.card_no ].name_jp}を公開しました。`,
				{ contents : MakeHTML_Card( DeckTopCard, Game ) } );

			// 廃棄
			Game.Trash( DeckTopCardID );
			yield FBref_Game.update( {
				[`Players/${player_id}`] : pl,
				TrashPile : Game.TrashPile,
			});

			// 同じコストのカードを1枚獲得
			yield WaitForGainingSupplyCard( 'DiscardPile', player_id,
					( card, card_no ) =>
						CostOp( '==', Game.GetCost( card_no ), Game.GetCost( DeckTopCard.card_no ) ) );
		}

		yield Game.AttackAllOtherPlayers(
				'Swindler',
				'山札の一番上のカードを廃棄し、廃棄したカードと同じコストのカードを獲得します。',
				false,  // don't send signals
				attack_effect );
	};





	/* 43. 執事 */
	CardEffect['Steward'] = function*() {
	 /*
		Choose one: +2 Cards; or +2 Coins; or trash 2 cards from your hand.
		《2nd edition》
		Choose one: +2 Cards; or +2 Coins; or trash 2 cards from your hand.
	 */
		yield FBref_Message.set( '次のうち一つを選んでください。' );

		const clicked_btn = yield WaitForButtonClick( [
			{ return_value : '2Cards', label : '+2 Cards' },
			{ return_value : '2Coins', label : '+2 Coins' },
			{ return_value : 'trash2', label : '手札から2枚廃棄' },
		] );

		switch ( clicked_btn ) {
			case '2Cards' :
				FBref_chat.push(`"+2 Cards"を選択しました。`);
				yield Game.player().DrawCards(2);
				break;

			case '2Coins' :
				FBref_chat.push(`"+2 Coins"を選択しました。`);
				Game.TurnInfo.coin += 2;
				yield FBref_TurnInfo.child('coin').set( Game.TurnInfo.coin );
				break;

			case 'trash2' :
				FBref_chat.push(`"手札から2枚廃棄"を選択しました。`);
				yield FBref_Message.set('手札から2枚廃棄してください。');

				let trashed_num = 0;
				while ( trashed_num < 2 && !Game.player().HandCards.IsEmpty() ) {
					yield WaitForTrashingHandCard();
					trashed_num++;
				}
				break;

			default :
				throw new Error(`@Steward: invalid value for clicked_btn "${clicked_btn}"`);
				break;
		}
	};





	/* 44. 男爵 */
	CardEffect['Baron'] = function*() {
	 /*
		+1 Buy
		You may discard an Estate card. If you do, +4 Coins. Otherwise, gain an Estate card.
		《2nd edition》
		+1 Buy
		You may discard an Estate for + 4 Coins. If you don't, gain an Estate.
	 */
		yield FBref_Message.set( `屋敷を捨て札にすることができます。
				そうした場合4コインを得ます。捨て札にしなかった場合は屋敷を獲得します。` );

		ShowAbortButton('屋敷を獲得');
		const return_value
		  = yield WaitForDiscardingHandCard( card_no => card_no == CardName2No['Estate'] );
		HideAbortButton();

		if ( return_value.aborted ) {
			yield Game.GainCardFromSupplyByName( 'Estate', 'DiscardPile' );  /* 屋敷を獲得 */
		} else {
			Game.TurnInfo.coin += 4;
			yield FBref_TurnInfo.child('coin').set( Game.TurnInfo.coin );
		}
	};





	/* 45. 寵臣 */
	CardEffect['Minion'] = function*() {
	 /*
		+1 Action
		Choose one:
		+2 Coins; or discard your hand, +4 Cards,
		and each other player with at least 5 cards in hand discards his hand and draws 4 cards.
		《2nd edition》
		+1 Action
		Choose one:
		+2 Coins; or discard your hand, +4 Cards,
		and each other player with at least 5 cards in hand discards their hand and draws 4 cards.
	 */
		yield FBref_Message.set( '次のうち一つを選んでください。' );

		const clicked_btn = yield WaitForButtonClick( [
			{ return_value : 'Discard', label : '手札を全て捨て札にして +4 Cards' },
			{ return_value : '2Coins' , label : '+2 Coins' },
		] );

		switch ( clicked_btn ) {
		 case '2Coins' :
			FBref_chat.push(`"+2 Coins"を選択しました。`);
			Game.TurnInfo.coin += 2;
			yield FBref_TurnInfo.child('coin').set( Game.TurnInfo.coin );
			break;

		 case 'Discard' :
			FBref_chat.push(`"手札を全て捨て札にして +4 Cards"を選択しました。`);

			// 自分
			yield Game.player().DiscardAll();
			yield Game.player().DrawCards(4);

			yield Game.AttackAllOtherPlayers(
					'Minion',
					'手札が5枚以上ある人は手札を捨て札にして+4カード',
					false,  // don't send signals
					function*( player_id ) {
						const pl = Game.Players[ player_id ];
						if ( pl.HandCards.length < 5 ) return;

						// 手札が5枚以上ならば捨て札にして+4Cards
						yield pl.DiscardAll();
						yield pl.DrawCards(4);
					} );
			break;

		 default :
			throw new Error(`@Minion: invalid value for clicked_btn "${clicked_btn}"`);
			break;
		}
	};





	/* 46. 偵察員 */
	CardEffect['Scout'] = function*() {
	 /*
		+1 Action
		Reveal the top 4 cards of your deck.
		Put the revealed Victory cards into your hand.
		Put the other cards on top of your deck in any order.
		《2nd edition》 Removed
	 */
		yield FBref_Message.set( `山札の上から4枚のカードを公開し、
			勝利点カードが含まれていればそれらを全て手札に加えます。
			残りは好きな順番で山札に戻してください。` );

		const RevealedCardIDs = yield Game.player().RevealDeckTop(4);

		const VictoryCardIDs
			= RevealedCardIDs.filter( card_ID =>
				IsVictoryCard( Cardlist, Game.LookCardWithID( card_ID ).card_no ) );

		if ( !VictoryCardIDs.IsEmpty() ) {
			yield AcknowledgeButton( '勝利点カードを手札に加える' );
			yield VictoryCardIDs.AsyncEach( card_ID => Game.player().PutIntoHand( card_ID, Game ) );
		}

		yield FBref_Message.set( '勝利点カード以外は好きな順番で山札に戻してください。' );

		while ( !Game.player().Open.IsEmpty() ) {
			yield WaitForPuttingBackRevealedCard();
		}
	};





	/* 47. 手先 */
	CardEffect['Pawn'] = function*() {
	 /*
		Choose two:
		+1 Card, +1 Action, +1 Buy, +1 Coin. (The choices must be different.)
		《2nd edition》
		Choose two:
		+1 Card; +1 Action; +1 Buy; +1 Coin. The choices must be different.
	 */
		yield FBref_Message.set( `次のうち異なる二つを選んでください。
			<ul>
				<li> +1 Card   </li>
				<li> +1 Action </li>
				<li> +1 Buy    </li>
				<li> +1 Coin   </li>
			</ul>` );

		const clicked_btns = yield WaitForButtonClick( [
			{ return_value : '1Card'  , label : '+1 Card'   },
			{ return_value : '1Action', label : '+1 Action' },
			{ return_value : '1Buy'   , label : '+1 Buy'    },
			{ return_value : '1Coin'  , label : '+1 Coin'   },
		], 2 );

		function* select_effect( clicked_btn ) {
			switch ( clicked_btn ) {
				case '1Card' :
					yield Game.player().DrawCards(1);
					break;

				case '1Action' :
					Game.TurnInfo.action++;
					yield FBref_TurnInfo.child('action').set( Game.TurnInfo.action );
					break;

				case '1Buy' :
					Game.TurnInfo.buy++;
					yield FBref_TurnInfo.child('buy').set( Game.TurnInfo.buy );
					break;

				case '1Coin' :
					Game.TurnInfo.coin++;
					yield FBref_TurnInfo.child('coin').set( Game.TurnInfo.coin );
					break;

				default :
					throw new Error(`@Pawn: invalid value for clicked_btn "${clicked_btn}"`);
					break;
			}
		}

		FBref_chat.push(`（${clicked_btns.join(', ')}）を選択しました。`);

		yield MyAsync( select_effect, clicked_btns[0] );
		yield MyAsync( select_effect, clicked_btns[1] );
	};





	/* 48. 鉄工所 */
	CardEffect['Ironworks'] = function*() {
	 /*
		Gain a card costing up to 4 Coins.
		If it is an... 
			Action card, +1 Action
			Treasure card, +1 Coin
			Victory card, +1 Card
		《2nd edition》
		Gain a card costing up to 4 Coins.
		If the gained card is an...
			Action card, +1 Action
			Treasure card, +1 Coin
			Victory card, +1 Card
	 */
		yield FBref_Message.set( `コストが4コイン以下のカードを獲得してください。
			そのカードが
			<ul>
				<li>アクションカードならば +1 Action</li>
				<li>財宝カードならば +1 Coin</li>
				<li>勝利点カードならば +1 Card</li>
			</ul>` );

		const return_value
		  = yield WaitForGainingSupplyCard( 'DiscardPile', Game.player().id,
				( card, card_no ) => CostOp( '<=', Game.GetCost( card_no ), [4,0,0] ) );

		if ( !return_value.exists ) return;

		const gotten_card_no = return_value.card_no;

		if ( IsActionCard( Cardlist, gotten_card_no ) ) {
			Game.TurnInfo.action++;
			yield FBref_TurnInfo.child('action').set( Game.TurnInfo.action );
		}
		if ( IsTreasureCard( Cardlist, gotten_card_no ) ) {
			Game.TurnInfo.coin++;
			yield FBref_TurnInfo.child('coin').set( Game.TurnInfo.coin );
		}
		if ( IsVictoryCard( Cardlist, gotten_card_no ) ) {
			yield Game.player().DrawCards(1);
		}
	};





	/* 49. 銅細工師 */
	CardEffect['Coppersmith'] = function*() {
	 /*
		Copper produces an extra 1 Coin this turn.
		《2nd edition》 Removed
	 */
		yield FBref_Message.set( 'このターン銅貨は+1コインを生みます。' );
		Game.TurnInfo.add_copper_coin++;
		yield FBref_TurnInfo.child('add_copper_coin').set( Game.TurnInfo.add_copper_coin );
		yield AcknowledgeButton();
	};





	/* 50. 中庭 */
	CardEffect['Courtyard'] = function*() {
	 /*
		+3 Card Put a card from your hand on top of your deck.
		《2nd edition》
		+3 Cards Put a card from your hand onto your deck.
	 */
		yield FBref_Message.set( '山札に戻すカードを選択してください。' );
		yield WaitForPuttingBackHandCard( undefined, false );
	};





	/* 51. 願いの井戸 */
	CardEffect['Wishing Well'] = function*() {
	 /*
		+1 Card +1 Action
		Name a card, then reveal the top card of your deck.
		If it's the named card, put it in your hand.
		《2nd edition》
		+1 Card +1 Action
		Name a card, then reveal the top card of your deck.
		If you named it, put it into your hand.
	 */
		yield FBref_Message.set( `カード名を1つ指定してください（サプライエリアのカードをクリックしてください）。
			山札の1番上のカードを公開し、そのカードの名前が指定したカード名だった場合、手札に加えます。` );

		if ( !Game.player().Drawable() ) {
			FBref_chat.push('山札にカードがありませんでした。');
			yield MyAlert( '山札にカードがありません。' );
			return;
		}

		ShowAbortButton('存在しないカード名');
		const return_value = yield WaitForSelectingSupplyCard( undefined, true, false );
		HideAbortButton();

		const card_name_jp
		  = ( return_value.aborted ?
				'存在しないカード名' : `「${Cardlist[ return_value.card_no ].name_jp}」` );

		const named_card_no = ( return_value.aborted ? -1 : return_value.card_no );

		yield Promise.all( [
			FBref_chat.push( `${Game.player().name}が${card_name_jp}を指定しました。` ),
			FBref_Message.set( `${card_name_jp}を指定しました。` )
		]);

		// 山札の一番上のカードを公開
		const DeckTopCard = Game.player().LookDeckTopCard();

		yield Promise.all( [
			Game.player().RevealDeckTop(1),
			FBref_Message.set( `${Cardlist[ DeckTopCard.card_no ].name_jp}が公開されました。` ),
		]);

		// 確認 （全員の確認を待つようにすべき？）
		yield AcknowledgeButton();

		// 指定したカード名と一致したなら手札に加える．そうでなければ山札に戻す．
		if ( named_card_no == DeckTopCard.card_no ) {
			yield Game.player().PutIntoHand( DeckTopCard.card_ID, Game );
		} else {
			yield Game.player().PutBackToDeck( DeckTopCard.card_ID, Game );
		}
	};





	/* 53. 破壊工作員 */
	CardEffect['Saboteur'] = function*() {
	 /*
		Each other player reveals cards from the top of his deck until revealing one costing 3 Coins or more.
		He trashes that card and may gain a card costing at most 2 Coins less than it.
		He discards the other revealed cards.
		《2nd edition》 Removed
	 */
		const msg = `自分の山札からコストが3コイン以上のカードが出るまで公開し、そのカードを廃棄します。
			廃棄したカードよりも2コイン以上コストが小さいカードをサプライから1枚獲得することができます。
			公開した残りのカードは捨て札にします。`;

		yield FBref_Message.set( `他のプレイヤーは${msg}` );

		yield Game.AttackAllOtherPlayers(
				'Saboteur',
				msg,
				true,  // send signals
				undefined );
	};

	AttackEffect['Saboteur'] = function* () {
		/* アタックされる側 */
		let LastRevealedCardID;
		let TrashedCardCostCoin = -100;
		let RevealedCardIDs = [];

		while ( Game.Me().Drawable() ) {
			const RevealedCardID = ( yield Game.Me().RevealDeckTop(1) )[0];

			const RevealedCard_cost_coin
			  = Game.GetCost( Game.LookCardWithID( RevealedCardID ).card_no ).coin;

			if ( RevealedCard_cost_coin < 3 ) {
				RevealedCardIDs.push( RevealedCardID );
			} else {
				LastRevealedCardID = RevealedCardID;
				TrashedCardCostCoin = RevealedCard_cost_coin;
				break;
			}
		}

		yield AcknowledgeButton_MyArea();  // 公開したカードの確認

		// コスト3以上のカードが公開されたなら廃棄して-2コスト以下のカードを獲得してもよい
		if ( TrashedCardCostCoin >= 3 ) {
			Game.Trash( LastRevealedCardID );
			yield FBref_Game.update( {
				TrashPile : Game.TrashPile,
				[`Players/${myid}`] : Game.Me(),
			} );

			yield FBref_MessageToMe.set( `コスト${TrashedCardCostCoin - 2}以下のカードを獲得できます。` );

			ShowSupplyAreaInMyArea();
			ShowAbortButton_MyArea('獲得しない');
			const return_values
			 = yield WaitForGainingSupplyCard( 'DiscardPile', Game.Me().id,
					( card, card_no ) =>
						CostOp( '<=', Game.GetCost( card_no ), [TrashedCardCostCoin - 2,0,0] ) );
			HideAbortButton_MyArea();
			HideSupplyAreaInMyArea();

			yield FBref_MessageToMe.set('');

			if ( !return_values.aborted ) {
				yield AcknowledgeButton_MyArea();  // 獲得したカードの確認
			}
		}

		// 公開した残りのカードを捨て札にする
		yield RevealedCardIDs.AsyncEach( card_ID => Game.Me().Discard( card_ID, Game ) );
	};





	/* 54. 橋 */
	CardEffect['Bridge'] = function*() {
	 /*
		+1 Buy +1 Coin
		All cards (including cards in players' hands) cost 1 Coin less this turn,
		but not less than 0 Coins.
		《2nd edition》
		+1 Buy +1 Coin
		This turn, cards (everywhere) cost 1 Coin less,
		but not less than 0 Coins.
	 */
		yield FBref_Message.set( 'このターン、全てのカードのコストは1コイン少なくなります（0コイン未満にはなりません）。' );
		Game.TurnInfo.cost_down_by_Bridge++;
		yield FBref_TurnInfo.child('cost_down_by_Bridge').set( Game.TurnInfo.cost_down_by_Bridge );
		yield AcknowledgeButton();
	};





	/* 55. 秘密の部屋 */
	CardEffect['Secret Chamber'] = function*() {
	 /*
		Discard any number of cards. +1 Coin per card discarded.
		-------------------------
		When another player plays an Attack card,
		you may reveal this from your hand.
		If you do, +2 cards, then put 2 cards from your hand on top of your deck.
		《2nd edition》 Removed
	 */
		yield FBref_Message.set( '手札から任意の枚数を捨て札にして下さい。捨て札にした枚数だけコインを得ます。' );

		// 手札のカードを任意枚数選択
		const SelectedCardsID = yield WaitForMarkingHandCards();

		// 選択したカードを捨て札に
		yield SelectedCardsID.AsyncEach( card_ID => Game.player().Discard( card_ID, Game, false ) );

		yield Promise.all( [
			FBref_Message.set( `捨て札にした枚数 ： ${SelectedCardsID.length}枚` ),
			FBref_chat.push( `${Game.player().name}が${SelectedCardsID.length}枚のカードを捨て札にしました。` ),
		] );

		yield AcknowledgeButton();

		Game.TurnInfo.coin += SelectedCardsID.length;
		yield FBref_TurnInfo.child('coin').set( Game.TurnInfo.coin )
	};

	ReactionEffect['Secret Chamber'] = function*() {
	 /*
		When another player plays an Attack card,
		you may reveal this from your hand.
		If you do, +2 cards, then put 2 cards from your hand on top of your deck.
	 */
		yield FBref_MessageToMe.set('山札から2枚カードを手札に引いた後、手札から2枚山札に戻してください。');
		yield Game.Me().DrawCards(2);

		let put_back_num = 0;
		while ( put_back_num < 2 ) {
			yield WaitForPuttingBackMyHandCard( undefined, false );
			put_back_num++;
		}
	};





	/* 56. 貧民街 */
	CardEffect['Shanty Town'] = function*() {
	 /*
		+2 Actions
		Reveal your hand. If you have no Action cards in hand, +2 Cards.
		《2nd edition》
		+2 Actions
		Reveal your hand. If you have no Action cards in hand, +2 Cards.
	 */
		yield FBref_Message.set( '手札を公開します。手札にアクションカードがない場合2枚カードを引きます。' );

		/* 手札を公開 */
		yield Game.player().FaceUpAllHandCards( Game );

		yield AcknowledgeButton();

		/* 手札を裏に戻す */
		yield Game.ResetFace();
		yield FBref_Players.child( `${Game.player().id}/HandCards` ).set( Game.player().HandCards );

		const Action
			= Game.player().HandCards.filter( card => IsActionCard( Cardlist, card.card_no ) );

		if ( Action.IsEmpty() ) {
			FBref_chat.push( '手札にアクションカードがありませんでした。' );
			yield Game.player().DrawCards(2);
		}
	};





	/* 57. 貢物 */
	CardEffect['Tribute'] = function*() {
	 /*
		The player to your left reveals then discards the top 2 cards of his deck.
		For each differently named card revealed,
		if it is an...
			Action Card, +2 Actions
			Treasure Card, +2 Coins
			Victory Card, +2 Cards
		《2nd edition》 Removed
	 */
		yield FBref_Message.set( `左隣りのプレイヤーの山札の上から2枚を公開します。
			それらのうち異なる名前のカード1枚につき、それが
			<ul>
				<li> アクションカードならば +2 Actions </li>
				<li> 財宝カードならば +2 Coins </li>
				<li> 勝利点カードならば +2 Cards </li>
			</ul>` );

		const RevealedCardIDs = yield Game.NextPlayer().RevealDeckTop(2);

		yield AcknowledgeButton();

		let drawcards_num = 0;

		// 公開したカードの違う名前につき
		RevealedCardIDs
		  .map( card_ID => Game.LookCardWithID( card_ID ).card_no )
		  .uniq()
		  .forEach( card_no => {
			if ( IsActionCard  ( Cardlist, card_no ) ) Game.TurnInfo.action += 2;
			if ( IsTreasureCard( Cardlist, card_no ) ) Game.TurnInfo.coin += 2;
			if ( IsVictoryCard ( Cardlist, card_no ) ) drawcards_num += 2;
		});

		yield FBref_TurnInfo.set( Game.TurnInfo );
		if ( drawcards_num > 0 ) {
			yield Game.player().DrawCards( drawcards_num );
		}

		// 公開したカードを捨て札に
		yield RevealedCardIDs.AsyncEach( card_ID => Game.NextPlayer().Discard( card_ID, Game ) );
	};


});
