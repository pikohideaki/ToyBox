
$( function() {
	// CardEffect['Menagerie']       = function*() {}  /*    127. 移動動物園 */
	// CardEffect['Horse Traders']   = function*() {}  /*    128. 馬商人 */
	// CardEffect['Fortune Teller']  = function*() {}  /*    129. 占い師 */
	// CardEffect['Diadem']          = function*() {}  /*    130. 王冠 */
	// CardEffect['Princess']        = function*() {}  /*    131. 王女 */
	// CardEffect['Bag of Gold']     = function*() {}  /*    132. 金貨袋 */
	// CardEffect['Remake']          = function*() {}  /*    133. 再建 */
	// CardEffect['Harvest']         = function*() {}  /*    134. 収穫 */
	// CardEffect['Hunting Party']   = function*() {}  /*    135. 狩猟団 */
	// CardEffect['Hamlet']          = function*() {}  /*    136. 村落 */
	// CardEffect['Jester']          = function*() {}  /*    137. 道化師 */
	// CardEffect['Farming Village'] = function*() {}  /*    138. 農村 */
	// CardEffect['Tournament']      = function*() {}  /*    139. 馬上槍試合 */
	   CardEffect['Fairgrounds']     = function*() {}  /* -- 140. 品評会 */
	// CardEffect['Horn of Plenty']  = function*() {}  /*    141. 豊穣の角笛 */
	// CardEffect['Young Witch']     = function*() {}  /*    142. 魔女娘 */
	// CardEffect['Trusty Steed']    = function*() {}  /*    143. 名馬 */
	// CardEffect['Followers']       = function*() {}  /*    144. 郎党 */





	/* 127. 移動動物園 */
	CardEffect['Menagerie'] = function*() {
	 /*
		+1 Action
		Reveal your hand.
		If there are no duplicate cards in it, +3 Cards. Otherwise, +1 Card. 
	 */
		yield FBref_Message.set( `手札を公開します。
				もし重複しているカードが無ければ +3カード、そうでなければ +1カード。` );

		const pl = Game.player();

		/* 手札を公開 */
		yield pl.FaceUpAllHandCards( Game );

		yield AcknowledgeButton();

		/* 手札を裏に戻す */
		yield Game.ResetFace();
		yield FBref_Players.child( `${pl.id}/HandCards` ).set( pl.HandCards );

		const exist_dupulicate
		  = ( pl.HandCards.uniq( card => card.card_no ).length == pl.HandCards.length );

		// もし重複しているカードが無ければ +3カード、そうでなければ +1カード。
		yield FBref_Message.set( `もし重複しているカードが無ければ +3カード、そうでなければ +1カード。` );
		yield pl.DrawCards( (exist_dupulicate ? 3 : 1) );
	}





	/* 128. 馬商人 */
	CardEffect['Horse Traders'] = function*() {
	 /*
		+1 Buy +3 Coins
		Discard 2 Cards
		-------------------------
		When another player plays an Attack card,
		you may set this aside from your hand.
		If you do, then at the start of your next turn, +1 Card and return this to your hand. 
	 */
		yield FBref_Message.set('手札から2枚捨て札にしてください。');

		let discarded_num = 0;
		while ( Game.player().HandCards.length > 0 && discarded_num < 2 ) {
			$('.HandCards').children('.card').addClass('HorseTraders_Discard pointer');
			yield new Promise( resolve => Resolve['HorseTraders_Discard'] = resolve );
			discarded_num++;
		}
	}

	ReactionEffect['Horse Traders'] = function*( card_no, card_ID ) {
		yield FBref_MessageToMe.set('このカードを脇に置き、 次のターンの最初に+1カードして脇に置いていたこのカードを手札に戻します。');
		Game.Me().AddToAside( Game.GetCardWithID( card_ID ) );
		// Game.Me().DrawCards(1);
		yield FBref_Players.child( myid ).set( Game.Me() );
	};





	/* 129. 占い師 */
	CardEffect['Fortune Teller'] = function*() {
	 /*
		+2 Coin
		Each other player reveals cards from the top of his deck
		until he reveals a Victory of Curse card.
		He puts it on top and discards the other revealed cards. 
	 */
		const msg = `勝利点カードか呪いが公開されるまでカードを公開し、
			そのカードを山札の一番上に置きます。残りの公開したカードは捨て札にします。`;

		yield FBref_Message.set( msg );

		function* attack_effect( player_id ) {
			const pl = Game.Players[ player_id ];

			let LastRevealedCardID = -1;
			let RevealedCardIDs = [];

			while ( pl.Drawable() ) {
				const RevealedCardID = ( yield pl.RevealDeckTop(1) )[0];
				const RevealedCard_no = Game.LookCardWithID( RevealedCardID ).card_no

				// 勝利点カードか呪いが公開されたなら
				if ( IsVictoryCard( Cardlist, RevealedCard_no ) ||
					 Cardlist[ RevealedCard_no ].name_eng == 'Curse' )
				{
					LastRevealedCardID = RevealedCardID;
					break;
				} else {
					RevealedCardIDs.push( RevealedCardID );
				}
			}

			yield AcknowledgeButton();  // 公開したカードの確認

			// 勝利点カードか呪いが公開されたなら
			if ( LastRevealedCardID != -1 ) {
				// 山札の一番上に置く
				yield pl.PutBackToDeck( LastRevealedCardID, Game, true, 'up' );
			}

			// 公開した残りのカードを捨て札にする
			yield RevealedCardIDs.AsyncEach( card_ID => pl.Discard( card_ID, Game ) );
		}


		yield Game.AttackAllOtherPlayers(
				'Fortune Teller',
				msg,
				false,  // send signals
				attack_effect );

		yield AcknowledgeButton();


		// 公開したカードを裏向きに戻す
		yield Game.ResetFace();
		yield Promise.all([
			FBref_Players.set( Game.Players ),
			Game.ResetStackedCardIDs(),
		]);
	}

	// AttackEffect['Fortune Teller'] = function* () {
		/* アタックされる側 */
		// let LastRevealedCardID = -1;
		// let RevealedCardIDs = [];

		// while ( Game.Me().Drawable() ) {
		// 	const RevealedCardID = ( yield Game.Me().RevealDeckTop(1) )[0];
		// 	const RevealedCard_no = Game.LookCardWithID( RevealedCardID ).card_no

		// 	// 勝利点カードか呪いが公開されたなら
		// 	if ( IsVictoryCard( Cardlist, RevealedCard_no ) ||
		// 		 Cardlist[ RevealedCard_no ].name_eng == 'Curse' )
		// 	{
		// 		LastRevealedCardID = RevealedCardID;
		// 		break;
		// 	} else {
		// 		RevealedCardIDs.push( RevealedCardID );
		// 	}
		// }

		// yield AcknowledgeButton_MyArea();  // 公開したカードの確認

		// // 勝利点カードか呪いが公開されたなら
		// if ( LastRevealedCardID != -1 ) {
		// 	// 山札の一番上に置く
		// 	yield Game.Me().PutBackToDeck( LastRevealedCardID, Game, true, 'up' );
		// }

		// // 公開した残りのカードを捨て札にする
		// yield RevealedCardIDs.AsyncEach( card_ID => Game.Me().Discard( card_ID, Game ) );
	// };





	/* 130. 王冠 */
	CardEffect['Diadem'] = function*() {
		yield FBref_Message.set( `このカードを使うとき、
				あなたが使用しなかったアクション1毎に +1 Coin を得ます。` );

		yield AcknowledgeButton();

		Game.TurnInfo.coin += Game.TurnInfo.action;
		yield FBref_TurnInfo.child('coin').set( Game.TurnInfo.coin );
	}





	/* 131. 王女 */
	CardEffect['Princess'] = function*() {
	 /*
		Worth 2 Coins
		When you play this, +1 Coin per unused Action you have (Action, not Action card).
		(This is not in the Supply.) 
	 */
		yield FBref_Message.set( `このカードが場に出ているかぎり、
				カードのコストは2コイン少なくなります（0コイン未満にはなりません）。` );
		yield AcknowledgeButton();
	}





	/* 132. 金貨袋 */
	CardEffect['Bag of Gold'] = function*() {
	 /*
		+1 Action
		Gain a Gold, putting it on top of your deck.
		(This is not in the Supply.) 
	 */
		yield FBref_Message.set( '金貨1枚を獲得し、自分の山札の一番上に置きます。' );

		/* 金貨を山札の一番上に獲得 */
		yield Game.GainCardFromSupplyByName( 'Gold', 'Deck', undefined, 'up' );

		yield AcknowledgeButton();

		// 公開したカードを裏向きに戻す
		yield Game.ResetFace();
		yield Promise.all([
			FBref_Players.child(`${Game.player().id}/Deck`).set( Game.player().Deck ),
			Game.ResetStackedCardIDs(),
		]);
	}





	/* 133. 再建 */
	CardEffect['Remake'] = function*() {
	 /*
		Do this twice:
			Trash a card from your hand,
			then gain a card costing exactly 1 Coin more than the trashed card. 
	 */
		for ( let i = 0; i < 2; ++i ) {
			yield FBref_Message.set( `手札から1枚廃棄し、
					そのカード+1コインのコストのカードを獲得します。（${i + 1}/2回目）` );

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
		}
	}





	/* 134. 収穫 */
	CardEffect['Harvest'] = function*() {
	 /*
		Reveal the top 4 cards of your deck, then discard them.
		+1 Coin per differently named card revealed. 
	 */
		yield FBref_Message.set( `山札から4枚のカードを公開し、捨て札にします。<br>
			このとき公開したカードのうち名前が異なるもの1枚につき +1 コインを得ます。` );

		/* 山札から4枚めくり公開 */
		const RevealedCardIDs = yield Game.player().RevealDeckTop(4);

		yield AcknowledgeButton();

		// 公開したカードのうち名前が異なるもの1枚につき +1コイン
		const differently_named_num
		  = RevealedCardIDs
				.map( card_ID => Game.LookCardWithID( card_ID ).card_no )
				.uniq().length;

		FBref_chat.push( `${differently_named_num}種類のカードを公開しました。` );
		Game.TurnInfo.coin += differently_named_num;
		yield FBref_TurnInfo.child('coin').set( Game.TurnInfo.coin );

		/* 公開したカードを片づける */
		yield RevealedCardIDs.AsyncEach( card_ID => Game.Me().Discard( card_ID, Game ) );
	}





	/* 135. 狩猟団 */
	CardEffect['Hunting Party'] = function*() {
	 /*
		+1 Card +1 Action
		Reveal your hand.
		Reveal cards from your deck
		until you reveal a card that isn't a duplicate of one in your hand.
		Put it into your hand and discard the rest. 
	 */
		yield FBref_Message.set( `手札を公開します。
				あなたの山札のカードを手札のカードと重複していないカードが公開されるまで公開します。
				そのカードをあなたの手札に加え、他の公開したカードは捨て札にします。` );

		/* 手札を公開 */
		yield Game.player().FaceUpAllHandCards( Game );

		let LastRevealedCardID = -1;
		let RevealedCardIDs = [];
		const handcards_no = Game.player().HandCards.map( card => card.card_no );

		while ( Game.player().Drawable() ) {
			const RevealedCardID = ( yield Game.Me().RevealDeckTop(1) )[0];

			if ( handcards_no.includes( Game.LookCardWithID( RevealedCardID ).card_no ) ) {
				RevealedCardIDs.push( RevealedCardID );
			} else {
				LastRevealedCardID = RevealedCardID;
			}
		}

		yield AcknowledgeButton();

		// 手札に加える
		if ( LastRevealedCardID != -1 ) {
			yield Game.player().PutIntoHand( LastRevealedCardID, Game );
		}

		/* 公開したカードを片づける（厳密には捨て札にする順番は手動） */
		yield RevealedCardIDs.AsyncEach( card_ID => Game.player().Discard( card_ID, Game ) );

		/* 手札を裏に戻す */
		yield Game.ResetFace();
		yield FBref_Players.child( `${Game.player().id}/HandCards` ).set( Game.player().HandCards );
	}





	/* 136. 村落 */
	CardEffect['Hamlet'] = function*() {
	 /*
		+1 Card +1 Action
		You may discard a card; If you do, +1 Action.
		You may discard a card; If you do, +1 Buy. 
	 */
		yield FBref_Message.set(
				`カード1枚を捨て札にすることができます。そうした場合、+1 アクション。<br>
				 カード1枚を捨て札にすることができます。そうした場合、+1 カードを購入。` );

		// カード1枚を捨て札にすることができます。そうした場合、+1 アクション。
		ShowAbortButton('捨て札にしない');
		const return_values1 = yield WaitForDiscardingHandCard();
		HideAbortButton();

		if ( !return_values1.aborted ) {
			Game.TurnInfo.action++;
			yield FBref_TurnInfo.child('action').set( Game.TurnInfo.action );
		}

		// カード1枚を捨て札にすることができます。そうした場合、+1 カードを購入。
		yield FBref_Message.set( 'カード1枚を捨て札にすることができます。そうした場合、+1 カードを購入。' );

		ShowAbortButton('捨て札にしない');
		const return_values2 = yield WaitForDiscardingHandCard();
		HideAbortButton();

		if ( !return_values2.aborted ) {
			Game.TurnInfo.buy++;
			yield FBref_TurnInfo.child('buy').set( Game.TurnInfo.buy );
		}
	}





	/* 137. 道化師 */
	CardEffect['Jester'] = function*() {
	 /*
		+2 Coins
		Each other player discards the top card of his deck.
		If it's a Victory card he gains a Curse.
		Otherwise either he gains a copy of the discarded card or you do, your choice. 
	 */
		const msg = `山札の一番上のカードを捨て札にします。
			そのカードが勝利点カードの場合、そのプレイヤーは呪いカード1枚を獲得します。
			勝利点以外のカードの場合、捨て札にしたカードと同じカードをそのプレイヤーが獲得するか、
			あなたが獲得するかをあなたが選びます。`;

		yield FBref_Message.set( `他のプレイヤーは全員、自分の${msg}` );

		function* attack_effect( player_id ) {

			const pl = Game.Players[player_id];

			if ( !pl.Drawable() ) return;

			/* 山札から1枚めくり公開 */
			const DeckTopCardID = ( yield pl.RevealDeckTop(1) )[0];
			const DeckTopCard = Game.LookCardWithID( DeckTopCardID );

			if ( IsVictoryCard( Cardlist, DeckTopCard.card_no ) ) {
				// 勝利点カードの場合、そのプレイヤーは呪いカード1枚を獲得
				yield MyAlert(
					`${pl.name}の山札から${Cardlist[ DeckTopCard.card_no ].name_jp}を捨て札にしました。`,
					{ contents : MakeHTML_Card( DeckTopCard, Game ) } );

				yield pl.Discard( DeckTopCardID, Game );

				yield FBref_MessageTo.child( player_id ).set( '呪いを獲得します。' );

				yield Game.GainCardFromSupplyByName( 'Curse', 'DiscardPile', player_id );

			} else {
				// 勝利点以外のカードの場合、
				// 捨て札にしたカードと同じカードをそのプレイヤーが獲得するか、あなたが獲得するかをあなたが選びます。
				const who_gets_card = yield MyDialog( {
						message  : `「${Cardlist[ DeckTopCard.card_no ].name_jp}」を捨て札にしました。同じカードを`,
						contents : MakeHTML_Card( DeckTopCard, Game ),
						buttons  : [
							{ return_value : Game.player().id, label : '自分が獲得' },
							{ return_value : player_id,        label : `${pl.name}が獲得` },
						],
					} );

				yield pl.Discard( DeckTopCardID, Game );

				// 同じ名前のカード獲得
				yield Game.GainCardFromSupplyByName(
						Cardlist[ DeckTopCard.card_no ].name_eng,
						'DiscardPile', who_gets_card );
			}
		}

		yield Game.AttackAllOtherPlayers(
				'Jester',
				'山札の一番上のカードを捨て札にします。',
				false,  // don't send signals
				attack_effect );
	};





	/* 138. 農村 */
	CardEffect['Farming Village'] = function*() {
	 /*
		+2 Actions
		Reveal cards from the top of your deck
		until you reveal an Action or Treasure card.
		Put that card into your hand and discard the other cards. 
	 */
		yield FBref_Message.set( `アクションカードか財宝カードが公開されるまでカードを公開し、
				そのカードを手札に加えます。残りの公開したカードは捨て札にします。` );

		let LastRevealedCardID = -1;
		let RevealedCardIDs = [];

		while ( Game.player().Drawable() ) {
			const RevealedCardID = ( yield Game.player().RevealDeckTop(1) )[0];
			const RevealedCard_no = Game.LookCardWithID( RevealedCardID ).card_no

			// 勝利点カードか呪いが公開されたなら
			if ( IsActionCard  ( Cardlist, RevealedCard_no ) ||
				 IsTreasureCard( Cardlist, RevealedCard_no )    )
			{
				LastRevealedCardID = RevealedCardID;
				break;
			} else {
				RevealedCardIDs.push( RevealedCardID );
			}
		}

		// 公開したカードを確認
		yield AcknowledgeButton();

		// 手札に加える
		if ( LastRevealedCardID != -1 ) {
			yield Game.player().PutIntoHand( LastRevealedCardID, Game, true );
		}

		// 公開した残りのカードを捨て札にする
		yield RevealedCardIDs.AsyncEach( card_ID => Game.player().Discard( card_ID, Game ) );
	}





	/* 139. 馬上槍試合 */
	CardEffect['Tournament'] = function*() {
	 /*
		+1 Action
		Each player may reveal a Province from his hand.
		If you do, discard it and gain a Prize (from the Prize pile) or a Duchy,
		putting it on top of your deck.
		If no-one else does, +1 Card, +1 Coin. 
	 */
		yield FBref_Message.set( `
				すべてのプレイヤーは、自分の手札から属州1枚を公開することができます。<br>
				あなたがそうした場合、そのカードを捨て札にし、
				褒賞カード1枚（褒賞の山札から）または公領1枚を獲得し、
				それをあなたの山札の一番上に置きます。<br>
				他のプレイヤーが誰も公開しなかった場合、+1 Card, +1 Coin を得ます。 `);

		// 自分を含め全員にシグナル送信
		yield Game.ForAllPlayers( function*( player_id ) {
			SendSignal( player_id, {
				Attack    : false,
				card_name : 'Tournament',
				Message   : '各プレイヤーは、自分の手札から属州を公開することができます。',
			} );
		} );

		// 集計
		let Tournament_RevealedCardIDs = [];
		let done_num = 0;

		FBref_Signal.child('Tournament_gather').on( 'value', function( FBsnapshot ) {
			const passed_val = FBsnapshot.val();
			if ( passed_val == null ) return;

			// 全員分揃ったら次に
			if ( ++done_num === Game.Players.length ) {
				Tournament_RevealedCardIDs = passed_val;
				Resolve['Tournament_gather']();
			}
		} );
		yield new Promise( resolve => Resolve['Tournament_gather'] = resolve );
		FBref_Signal.child('Tournament_gather').off();  // 監視終了
		FBref_Signal.child('Tournament_gather').remove();

		// 公開したカードの確認
		// yield FBref_Message.set( '公開されたカードを確認してください。' );
		yield AcknowledgeButton();

		// 他のプレイヤーの公開した属州を手札に戻す
		yield Game.ForAllPlayers( function*( player_id ) {
			const Province_card_ID = Tournament_RevealedCardIDs[ player_id ];
			if ( Province_card_ID === -1 ) return;
			if ( player_id == Game.player().id ) return; // 自分は飛ばす
			yield Game.Players[ player_id ].PutIntoHand( Province_card_ID, Game, false );
		} );


		// 自分が属州を公開したとき
		if ( Tournament_RevealedCardIDs[ Game.player().id ] !== -1 ) {
			FBref_chat.push( `${Game.player().name}が属州を公開しました。` );
			yield FBref_Message.set( '褒賞カードまたは公領を獲得してください。' );

			// 公開した属州を捨て札に
			const Province_card_ID = Tournament_RevealedCardIDs[ Game.player().id ];
			yield Game.player().Discard( Province_card_ID, Game );

			// 褒賞または公領を獲得し山札の一番上に置く
			const return_values = yield WaitForGainingSupplyCard( 
					'Deck', Game.player().id,
					(card,card_no) => ( IsPrizeCard( Cardlist, card_no ) || card_no === CardName2No['Duchy'] ),
					true, face = 'up' );

			yield AcknowledgeButton();

			// 山札に獲得したカードを裏向きに戻す
			yield Game.ResetFace();
			yield Promise.all([
				FBref_Players.set( Game.Players ),
				Game.ResetStackedCardIDs(),
			]);
		}


		// 他のプレイヤーが誰も属州を公開していないとき
		if ( Tournament_RevealedCardIDs
				.filter( (val, index) => index != Game.Me().id )
				.every( val => val == -1 ) )
		{
			// +1 Card, +1 Coin
			// yield FBref_Message.set(
				// '他のプレイヤーが誰も属州を公開していないので、 +1 Card, +1 Coin を得ます。' );
			Game.TurnInfo.coin += 1;
			yield Promise.all( [
				Game.player().DrawCards(1),
				FBref_TurnInfo.child('coin').set( Game.TurnInfo.coin ),
			]);
		}
	}

	// 自分と他のプレイヤー
	CardEffect['Tournament_RevealProivince'] = function* () {
		const MyArea = ( Game.player().id !== Game.Me().id );

		// 属州を公開できる
		ShowAbortButton_sub( MyArea, '公開しない');
		const return_values
		  = yield WaitForMovingHandCard( 'Reveal', MyArea,
				(card_no,card_ID) => card_no === CardName2No['Province'], true );
		HideAbortButton_sub( MyArea );

		if ( return_values.aborted ) {
			FBref_chat.push( `${Game.Me().name}は属州を公開しませんでした。` );
		} else {
			FBref_chat.push( `${Game.Me().name}は属州を公開しました。` );
		}

		// カードidを送る
		yield FBref_Signal.child(`Tournament_gather/${Game.Me().id}`)
			.set( ( return_values.aborted ? -1 : return_values.card_ID ) );
	}





	/* 141. 豊穣の角笛 */
	CardEffect['Horn of Plenty'] = function*( this_card_ID ) {
	 /*
		Worth 0 Coins
		When you play this, gain a card costing up to
		1 Coin per differently named card you have in play, counting this.
		If it's a Victory card, trash this. 
	 */
		// 場に出ているカードの種類数分のコイン
		const max_cost_coin = Game.player().PlayArea.uniq( card => card.card_no ).length;

		yield FBref_Message.set( `このカードを含めて場に出ているカードの種類数分のコイン
			(=${max_cost_coin})以下のコストのカードを1枚獲得します。
			もし勝利点カードを獲得したならばこのカードを廃棄します。` );

		const return_values
		  = yield WaitForGainingSupplyCard( 'DiscardPile', Game.player().id,
				( card, card_no ) =>
					CostOp( '<=', Game.GetCost( card_no ), [max_cost_coin,0,0] ) );

		if ( IsVictoryCard( Cardlist, return_values.card_no ) ) {
			// もし勝利点カードを獲得したならばこのカードを廃棄
			Game.Trash( this_card_ID );
			yield FBref_Game.update( {
				TrashPile : Game.TrashPile,
				[`Players/${Game.player().id}/PlayArea`] : Game.player().PlayArea,
			} );
		}
	}





	/* 142. 魔女娘 */
	CardEffect['Young Witch'] = function*() {
	 /*
		+2 Cards
		Discard 2 cards.
		Each other player may reveal a Bane card from his hand.
		If he doesn't, he gains a Curse.
		-------------------------
		Setup:
			Add an extra Kingdom card pile costing 2 Coins or 3 Coins to the Supply.
			Cards from that pile are Bane cards. 
	 */
		// 手札から2枚捨て札に
		yield FBref_Message.set('カード2枚を捨て札にしてください。');

		let discarded_num = 0;
		while ( discarded_num < 2 && !Game.player().HandCards.IsEmpty() ) {
			yield WaitForDiscardingHandCard( undefined, false );
			discarded_num++;
		}

		yield FBref_Message.set(`他のプレイヤーは全員、災いカードを公開することができます。
			公開しなかった他のプレイヤーは、呪いカード1枚を獲得します。`);

		// 災いカードの公開を待つ
		function Monitor_FBref_SignalBaneCardEnd_on() {
			return FBref_SignalBaneCardEnd.set(false)  /* reset */
				.then( function() {
				FBref_SignalBaneCardEnd.on( 'value', function(snap) {
					if ( snap.val() ) Resolve['BaneCardEnd']();
				} )
			} );
		}

		yield FBref_Message.set( '災いカードを公開するプレイヤーがいないか待っています。' );

		yield Game.ForAllPlayers( function* ( player_id ) {
			
			const has_banecard
			 = Game.Players[player_id].HandCards
				.map( x => x.card_no )
				.includes( Game.Supply.BaneCard.card_no );

			// Player[player_id] がリアクションスキップオプションがオンで手札に災いカードがない場合
			if ( Game.Settings.SkipReaction[player_id] && !has_banecard ) return;

			/* 災いカードを公開するかどうかは毎回決めてよい */
			yield FBref_Game.child(`TurnInfo/Revealed_BaneCard/${player_id}`).set(false);  /* reset */
			yield SendSignal( player_id, { listen_banecard : true } );
			yield Monitor_FBref_SignalBaneCardEnd_on();
			yield FBref_SignalRevealBaneCard.set(false);  /* reset */
			FBref_SignalRevealBaneCard.on( 'value', function(snap) {
				if ( snap.val() == 'waiting_for_confirmation' ) {
					MyAsync( function*() {
						yield AcknowledgeButton_OtherPlayer( player_id );
						yield FBref_SignalRevealBaneCard.set('confirmed');
					} );
				}
			} );
			yield new Promise( resolve => Resolve['BaneCardEnd'] = resolve );

			FBref_SignalBaneCardEnd.off();
			FBref_SignalRevealBaneCard.off();
		});


		// 災いカードを公開していない他のプレイヤーは全員、呪いカード1枚を獲得します
		yield Game.AttackAllOtherPlayers(
				'Young Witch',
				'',
				false,  // don't send signals
				function*( player_id ) {
					if ( Game.TurnInfo.Revealed_BaneCard[ player_id ] ) return;
					yield FBref_MessageTo.child( player_id ).set( '呪いを獲得します。' );
					yield Game.GainCardFromSupplyByName( 'Curse', 'DiscardPile', player_id );
				} );
	}





	/* 143. 名馬 */
	CardEffect['Trusty Steed'] = function*() {
	 /* Choose two:
	 		+2 Cards;
	 		+2 Actions;
	 		+2 Coins;
	 		gain 4 Silvers and put your deck into your discard pile.
	 		(The choices must be different.)
	 		(This is not in the Supply.)

		memo: 選択した２つの効果は記載されている順番に解決する
	 */
		yield FBref_Message.set( `次のうち異なる二つを選んでください。
			<ul>
				<li> +2 Card   </li>
				<li> +2 Action </li>
				<li> +2 Coin   </li>
				<li> 銀貨を4枚獲得し山札を捨て札に置く </li>
			</ul>` );

		const clicked_btns = yield WaitForButtonClick( [
			{ return_value : 1, label : '+2 Card'   },
			{ return_value : 2, label : '+2 Action' },
			{ return_value : 3, label : '+2 Coin'   },
			{ return_value : 4, label : '銀貨を4枚獲得し山札を捨て札に置く' },
		], 2 );

		function* select_effect( btn_val ) {
			switch ( btn_val ) {
				case 1 : // 2Card
					yield Game.player().DrawCards(2);
					break;

				case 2 : // 2Action
					Game.TurnInfo.action += 2;
					yield FBref_TurnInfo.child('action').set( Game.TurnInfo.action );
					break;

				case 3 : // 2Coin
					Game.TurnInfo.coin += 2;
					yield FBref_TurnInfo.child('coin').set( Game.TurnInfo.coin );
					break;

				case 4 : // 4silvers
					for ( let i = 0; i < 4; ++i ) {
						yield Game.GainCardFromSupplyByName( 'Silver' );
					}
					yield AcknowledgeButton();
					yield Game.player().PutDeckIntoDiscardPile();
					break;
			}
		}

		// 2Card -> 2Action -> 2Coin -> 4silvers の順に解決
		clicked_btns.sort();

		const clicked_btn_names = clicked_btns.map( x => {
			switch (x) {
				case 1 : return '+2 Card';
				case 2 : return '+2 Action';
				case 3 : return '+2 Coin';
				case 4 : return '銀貨を4枚獲得し山札を捨て札に置く';
			}
		});
		FBref_chat.push(`（${clicked_btn_names.join(', ')}）を選択しました。`);

		yield MyAsync( select_effect, clicked_btns[0] );
		yield MyAsync( select_effect, clicked_btns[1] );
	};





	/* 144. 郎党 */
	CardEffect['Followers'] = function*() {
	 /*
		+2 Cards
		Gain an Estate.
		Each other player gains a Curse and discards down to 3 cards in hand.
		(This is not in the Supply.) 
	 */
		yield FBref_Message.set( `屋敷1枚を獲得します。
			他のプレイヤーは全員、呪いカード1枚を獲得し、自分の手札が3枚になるように捨て札をしてください。` );

		// 屋敷を獲得
		yield Game.GainCardFromSupplyByName( 'Estate' );

		yield Game.AttackAllOtherPlayers(
				'Followers',
				'呪いカード1枚を獲得し、手札が3枚になるまで捨てて下さい。',
				true,  // send signals
				undefined );
	}

	AttackEffect['Followers'] = function*() {
		/* アタックされる側 */
		yield Game.GainCardFromSupplyByName( 'Curse', 'DiscardPile', Game.Me().id );
		while ( $('.MyHandCards').children('.card').length > 3 ) {
			yield WaitForDiscardingMyHandCard( undefined, false );
		}
	};

});
