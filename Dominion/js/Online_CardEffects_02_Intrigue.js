$( function() {


	CardEffect['Great Hall']     = function* () {}  /* 33. 大広間 */
	// CardEffect['Upgrade']        = function* () {}  /* 34. 改良 */
	// CardEffect['Masquerade']     = function* () {}  /* 35. 仮面舞踏会 */
	// CardEffect['Nobles']         = function* () {}  /* 36. 貴族 */
	// CardEffect['Conspirator']    = function* () {}  /* 37. 共謀者 */
	// CardEffect['Trading Post']   = function* () {}  /* 38. 交易場 */
	// CardEffect['Mining Village'] = function* () {}  /* 39. 鉱山の村 */
	// CardEffect['Duke']           = function* () {}  /* 40. 公爵 */
	// CardEffect['Torturer']       = function* () {}  /* 41. 拷問人 */
	// CardEffect['Swindler']       = function* () {}  /* 42. 詐欺師 */
	// CardEffect['Steward']        = function* () {}  /* 43. 執事 */
	// CardEffect['Baron']          = function* () {}  /* 44. 男爵 */
	// CardEffect['Minion']         = function* () {}  /* 45. 寵臣 */
	// CardEffect['Scout']          = function* () {}  /* 46. 偵察員 */
	// CardEffect['Pawn']           = function* () {}  /* 47. 手先 */
	// CardEffect['Ironworks']      = function* () {}  /* 48. 鉄工所 */
	// CardEffect['Coppersmith']    = function* () {}  /* 49. 銅細工師 */
	// CardEffect['Courtyard']      = function* () {}  /* 50. 中庭 */
	// CardEffect['Wishing Well']   = function* () {}  /* 51. 願いの井戸 */
	CardEffect['Harem']          = function* () {}  /* 52. ハーレム */
	// CardEffect['Saboteur']       = function* () {}  /* 53. 破壊工作員 */
	// CardEffect['Bridge']         = function* () {}  /* 54. 橋 */
	// CardEffect['Secret Chamber'] = function* () {}  /* 55. 秘密の部屋 */
	// CardEffect['Shanty Town']    = function* () {}  /* 56. 貧民街 */
	// CardEffect['Tribute']        = function* () {}  /* 57. 貢物 */





	/* 37. 共謀者 */
	CardEffect['Conspirator'] = function* () {
		if ( Game.TurnInfo.played_actioncards_num < 3 ) return;

		// このターンにアクションカードを3枚以上プレイしているときは +1 Card, +1 Action
		Game.player().DrawCards(1);
		Game.TurnInfo.action++;

		let updates = {};
		updates[`Players/${Game.player().id}`] = Game.player();
		updates['TurnInfo'] = Game.TurnInfo;
		yield FBref_Game.update( updates );
	};





	/* 34. 改良 */
	CardEffect['Upgrade'] = function* () {
		if ( Game.player().HandCards.length <= 0 ) {
			yield MyAlert( { message : '手札にカードがありません。' } );
			return;
		}

		yield FBref_Message.set( '手札のカードを1枚廃棄して下さい。' );

		/* 手札のカードのクリック動作を廃棄するカードの選択に変更 */
		$('.HandCards').children('.card').addClass('Upgrade_Trash pointer');

		const TrashedCardCost
			= yield new Promise( resolve => Resolve['Upgrade_Trash'] = resolve );

		yield FBref_Message.set(
			`コストがちょうど廃棄したカード+1(=${TrashedCardCost.coin + 1} )コインのカードを獲得してください。` );

		/* サプライのクラス書き換え */
		$('.SupplyArea').find('.card').addClass('Upgrade_GetCard pointer');

		AddAvailableToSupplyCardIf( ( card, card_no ) =>
			CostOp( '==',
				Game.GetCost( card_no ),
				CostOp( '+', TrashedCardCost, new CCost([1,0,0]) ) ) );

		if ( $('.SupplyArea').find('.available').length <= 0 ) {
			yield MyAlert( { message : '獲得できるカードがありません' } );
		} else {
			yield new Promise( resolve => Resolve['Upgrade_GetCard'] = resolve );
		}
	};

	$('.HandCards').on( 'click', '.card.Upgrade_Trash', function() {
		const clicked_card_no = $(this).attr('data-card_no');
		const clicked_card_ID = $(this).attr('data-card_ID');

		Game.TrashCardByID( clicked_card_ID );  /* 手札廃棄 */

		let updates = {};
		updates[`Players/${Game.player().id}/HandCards`] = Game.player().HandCards;
		updates['TrashPile'] = Game.TrashPile;

		FBref_Game.update( updates )
		.then( () => Resolve['Upgrade_Trash']( Game.GetCost( clicked_card_no ) ) );
	} );

	$('.SupplyArea').on( 'click', '.card.Upgrade_GetCard', function() {
		let $this = $(this);
		MyAsync( function*() {
			const clicked_card_name_eng = $this.attr('data-card-name-eng');
			const clicked_card = Game.Supply.byName(clicked_card_name_eng).LookTopCard();
			const clicked_card_ID = clicked_card.card_ID;

			if ( !$this.hasClass('available') ) {
				yield MyAlert( { message : '獲得できません。' } );
				return;
			}

			Game.player().AddToDiscardPile( Game.GetCardByID( clicked_card_ID ) );

			let updates = {};
			updates[`Players/${Game.player().id}/DiscardPile`] = Game.player().DiscardPile;
			updates['Supply'] = Game.Supply;
			yield FBref_Game.update( updates )
			Resolve['Upgrade_GetCard']();
		});
	} );





	/* 36. 貴族 */
	CardEffect['Nobles'] = function*() {
		yield FBref_Message.set( '次のうち一つを選んでください。' );

		$('.action_buttons')
			.append( MakeHTML_button( 'Nobles 3Cards'  , '+3 Cards'   ) )
			.append( MakeHTML_button( 'Nobles 2Actions', '+2 Actions' ) );

		yield new Promise( resolve => Resolve['Nobles'] = resolve );
		$('.action_buttons .Nobles').remove();  // reset
	};

	$('.action_buttons').on( 'click', '.Nobles.3Cards', function() {
		Game.player().DrawCards(3);
		FBref_Players.child( Game.player().id ).set( Game.player() )
		.then( () => Resolve['Nobles']() );  // 再開
	} );


	$('.action_buttons').on( 'click', '.Nobles.2Actions', function() {
		Game.TurnInfo.action += 2;
		FBref_Game.child('TurnInfo/action').set( Game.TurnInfo.action )
		.then( () => Resolve['Nobles']() );  // 再開
	} );





	/* 44. 男爵 */
	CardEffect['Baron'] = function*() {
		yield FBref_Message.set( '屋敷を捨て札にすることができます。そうした場合4コインを得ます。捨て札にしなかった場合は屋敷を獲得します。' );

		$('.action_buttons').html( MakeHTML_button( 'Baron get_estate', '屋敷を獲得' ) );
		$('.HandCards').children('.card')
			.filter( function() { return $(this).attr('data-card_no') == CardName2No['Estate'] } )
			.addClass('Baron_Discard pointer');  /* 手札のカードのクリック動作を廃棄するカードの選択に変更 */

		yield new Promise( resolve => Resolve['Baron'] = resolve );
		$('.action_buttons .Baron.get_estate').remove();  // reset
	};

	$('.HandCards').on( 'click', '.Baron_Discard', function() {
		const clicked_card_ID = $(this).attr('data-card_ID');
		Game.player().AddToDiscardPile( Game.GetCardByID( clicked_card_ID ) );
		Game.TurnInfo.coin += 4;

		let updates = {};
		updates[`Players/${Game.player().id}/HandCards`]   = Game.player().HandCards;
		updates[`Players/${Game.player().id}/DiscardPile`] = Game.player().DiscardPile;
		updates['TurnInfo/coin'] = Game.TurnInfo.coin;
		FBref_Game.update( updates )
		.then( () => Resolve['Baron']() );  // 再開
	} );

	$('.action_buttons').on( 'click', '.Baron.get_estate', function() {
		Game.player().AddToDiscardPile( Game.Supply.byName('Estate').GetTopCard() );

		let updates = {};
		updates[`Players/${Game.player().id}/DiscardPile`] = Game.player().DiscardPile;
		updates['Supply'] = Game.Supply;
		FBref_Game.update( updates )
		.then( () => Resolve['Baron']() );  // 再開
	} );





	/* 50. 中庭 */
	CardEffect['Courtyard'] = function*() {
		yield FBref_Message.set( '山札に戻すカードを選択してください。' );

		/* 手札のカードのクリック動作を山札に戻すカードの選択に変更 */
		$('.HandCards').children('.card').addClass('Courtyard_PutBackToDeck pointer');

		yield new Promise( resolve => Resolve['Courtyard_PutBackToDeck'] = resolve );
	};

	$('.HandCards').on( 'click', '.Courtyard_PutBackToDeck', function() {
		const clicked_card_ID = $(this).attr('data-card_ID');
		Game.player().PutBackToDeck( Game.GetCardByID( clicked_card_ID ) );
		FBref_Players.child( Game.player().id ).update( {
			Deck      : Game.player().Deck,
			HandCards : Game.player().HandCards,
		} )
		.then( () => Resolve['Courtyard_PutBackToDeck']() );  // 再開
	} );





	/* 38. 交易場 */
	CardEffect['Trading Post'] = function*() {
		yield FBref_Message.set( '廃棄するカードを2枚選択してください。そうした場合銀貨を獲得します。' );

		let trashed_num = 0;
		while ( Game.player().HandCards.length > 0 && trashed_num < 2 ) {
			/* 手札のカードのクリック動作を廃棄するカードの選択に変更 */
			$('.HandCards').children('.card').addClass('TradingPost_Trash pointer');
			yield new Promise( resolve => Resolve['TradingPost_Trash'] = resolve );
			trashed_num++;
		}

		let silver = Game.Supply.byName('Silver').GetTopCard();
		Game.player().AddToHandCards( silver );  /* 銀貨を手札に獲得 */

		let updates = {};
		updates[`Players/${Game.player().id}/HandCards`] = Game.player().HandCards;
		updates['Supply'] = Game.Supply;
		yield FBref_Game.update( updates );
	};

	$('.HandCards').on( 'click', '.TradingPost_Trash', function() {
		const clicked_card_ID = $(this).attr('data-card_ID');
		Game.TrashCardByID( clicked_card_ID );
		let updates = {};
		updates[`Players/${Game.player().id}/HandCards`] = Game.player().HandCards;
		updates['TrashPile'] = Game.TrashPile;
		FBref_Game.update( updates )
		.then( () => Resolve['TradingPost_Trash']() );  // 再開
	} );





	/* 43. 執事 */
	CardEffect['Steward'] = function*() {
		yield FBref_Message.set( '次のうち一つを選んでください。' );
		$('.action_buttons')
			.append( MakeHTML_button( 'Steward 2Cards', '+2 Cards' ) )
			.append( MakeHTML_button( 'Steward 2Coins', '+2 Coins' ) )
			.append( MakeHTML_button( 'Steward trash2', '手札から2枚廃棄' ) );

		const btn_val = yield new Promise( resolve => Resolve['Steward'] = resolve );

		$('.action_buttons .Steward').remove();

		switch ( btn_val ) {
			case '2Cards' :
				Game.player().DrawCards(2);
				yield FBref_Players.child( Game.player().id ).set( Game.player() );
				return;

			case '2Coins' :
				Game.TurnInfo.coin += 2;
				yield FBref_Game.child('TurnInfo/coin').set( Game.TurnInfo.coin );
				return;

			case 'trash2' :
				yield FBref_Message.set('手札から2枚廃棄してください。');

				let trashed_num = 0;
				while ( Game.player().HandCards.length > 0 && trashed_num < 2 ) {
					/* 手札のカードのクリック動作を廃棄するカードの選択に変更 */
					$('.HandCards').children('.card').addClass('Steward_Trash pointer');
					yield new Promise( resolve => Resolve['Steward_Trash'] = resolve );
					trashed_num++;
				}

				let updates = {};
				updates[`Players/${Game.player().id}/HandCards`] = Game.player().HandCards;
				updates['TrashPile'] = Game.TrashPile;
				yield FBref_Game.update( updates );
				return;

			default :
				return;
		}
	};

	$('.action_buttons').on( 'click', '.Steward', function() { 
		if ( $(this).hasClass('2Cards') ) {
			Resolve['Steward']( '2Cards' );
			return;
		}
		if ( $(this).hasClass('2Coins') ) {
			Resolve['Steward']( '2Coins' );
			return;
		}
		if ( $(this).hasClass('trash2') ) {
			Resolve['Steward']( 'trash2' );
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
		.then( () => Resolve['Steward_Trash']() );  // (1) 再開
	} );





	/* 47. 手先 */
	CardEffect['Pawn'] = function*() {
		yield FBref_Message.set( '次のうち異なる二つを選んでください。\
			 - +1 Card<br>\
			 - +1 Action<br>\
			 - +1 Buy<br>\
			 - +1 Coin<br>' );

		$('.action_buttons')
			.append( MakeHTML_button( 'Pawn 1Card'  , '+1 Card'   ) )
			.append( MakeHTML_button( 'Pawn 1Action', '+1 Action' ) )
			.append( MakeHTML_button( 'Pawn 1Buy'   , '+1 Buy'    ) )
			.append( MakeHTML_button( 'Pawn 1Coin'  , '+1 Coin'   ) );

		const first  = yield new Promise( resolve => Resolve['Pawn'] = resolve );
		const second = yield new Promise( resolve => Resolve['Pawn'] = resolve );

		$('.action_buttons .Pawn').remove();

		let updates = {};

		function select_effect( btn_val ) {
			switch ( btn_val ) {
				case '1Card' :
					Game.player().DrawCards(1);
					updates[`Players/${Game.player().id}`] = Game.player();
					break;
				case '1Action' :
					Game.TurnInfo.action++;
					updates['TurnInfo/action'] = Game.TurnInfo.action;
					break;
				case '1Buy' :
					Game.TurnInfo.buy++;
					updates['TurnInfo/buy']    = Game.TurnInfo.buy;
					break;
				case '1Coin' :
					Game.TurnInfo.coin++;
					updates['TurnInfo/coin']   = Game.TurnInfo.coin;
					break;
			}
		}
		select_effect(first);  select_effect(second);

		yield FBref_Game.update( updates );
	};

	$('.action_buttons').on( 'click', '.Pawn', function() {
		if ( $(this).hasClass('selected') ) return;  // 選択済みなら反応しない
		$(this).addClass('selected').attr('disabled', 'disabled');  // 使用したボタンを無効化
		if ( $(this).hasClass('1Card'  ) ) Resolve['Pawn']( '1Card'   );  // 再開
		if ( $(this).hasClass('1Action') ) Resolve['Pawn']( '1Action' );  // 再開
		if ( $(this).hasClass('1Buy'   ) ) Resolve['Pawn']( '1Buy'    );  // 再開
		if ( $(this).hasClass('1Coin'  ) ) Resolve['Pawn']( '1Coin'   );  // 再開
	} );





	/* 46. 偵察員 */
	CardEffect['Scout'] = function*() {
		yield FBref_Message.set( '山札の上から4枚のカードを公開し、勝利点カードが含まれていればそれらを全て手札に加えます。\
			残りは好きな順番で山札に戻してください。' );

		Game.player().OpenDeckTop( 4, true ); // sync

		let victory_cards
			= Game.player().Open.filter( card => IsVictoryCard( Cardlist, card.card_no ) );

		if ( victory_cards.length > 0 ) {
			$('.action_buttons').html( MakeHTML_button( 'Scout_VictoryCards', '勝利点カードを手札に加える' ) );
			yield new Promise( resolve => Resolve['Scout_VictoryCards'] = resolve );
			$('.action_buttons .Scout_VictoryCards').remove();
			victory_cards.forEach( card => Game.player().AddToHandCards( Game.GetCardByID(card.card_ID) ) );

			yield FBref_Players.child( Game.player().id ).update( {
				Open      : Game.player().Open,
				HandCards : Game.player().HandCards,
			});
		}

		while ( Game.player().Open.length > 0 ) {
			/* 公開カードのクリック動作を山札に戻すカードの選択に変更 */
			$('.Open').children('.card').addClass('Scout_PutBackToDeck pointer');
			yield new Promise( resolve => Resolve['Scout_PutBackToDeck'] = resolve );
		}
	};

	$('.action_buttons').on( 'click', '.Scout_VictoryCards', () => Resolve['Scout_VictoryCards']() );

	$('.Open').on( 'click', '.Scout_PutBackToDeck', function() {
		const clicked_card_ID = $(this).attr('data-card_ID');
		Game.player().PutBackToDeck( Game.GetCardByID( clicked_card_ID ) );
		FBref_Players.child( Game.player().id ).update( {
			Open : Game.player().Open,
			Deck : Game.player().Deck,
		} )
		.then( () => Resolve['Scout_PutBackToDeck']() );  // 再開
	} );





	/* 48. 鉄工所 */
	CardEffect['Ironworks'] = function*() {
		yield FBref_Message.set( 'コストが4コイン以下のカードを獲得してください。<br>\
			そのカードが<br>\
			 - アクションカードならば +1 Action<br>\
			 - 財宝カードならば +1 Coin<br>\
			 - 勝利点カードならば +1 Card<br>\
			 ' );

		/* サプライのクラス書き換え */
		$('.SupplyArea').find('.card').addClass('Ironworks_GetCard pointer');

		AddAvailableToSupplyCardIf( ( card, card_no ) =>
			CostOp( '<=', Game.GetCost( card_no ), new CCost([4,0,0]) ) );

		const gotten_card_no
			= yield new Promise( resolve => Resolve['Ironworks_GetCard'] = resolve );

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

		yield FBref_Game.update( updates );
	};

	$('.SupplyArea').on( 'click', '.card.Ironworks_GetCard', function() {
		let $this = $(this);
		MyAsync( function*() {
			const clicked_card_no       = $this.attr('data-card_no');
			const clicked_card_name_eng = $this.attr('data-card-name-eng');
			const clicked_card    = Game.Supply.byName( clicked_card_name_eng ).LookTopCard();
			const clicked_card_ID = clicked_card.card_ID;

			if ( !$this.hasClass('available') ) {
				yield MyAlert( { message : '獲得できるコスト上限を超えています。' } );
				return;
			}

			Game.player().AddToDiscardPile( Game.GetCardByID( clicked_card_ID ) );

			let updates = {};
			updates[`Players/${Game.player().id}/DiscardPile`] = Game.player().DiscardPile;
			updates['Supply'] = Game.Supply;
			yield FBref_Game.update( updates );
			Resolve['Ironworks_GetCard']( clicked_card_no );  // 再開
		});
	} );





	/* 57. 貢物 */
	CardEffect['Tribute'] = function*() {
		yield FBref_Message.set( '左隣りのプレイヤーの山札の上から2枚を公開します。\
			それらのうち異なる名前のカード1枚につき、それが<br>\
			- アクションカードならば +2 Actions<br>\
			- 財宝カードならば +2 Coins<br>\
			- 勝利点カードならば +2 Cards<br>\
			' );

		Game.NextPlayer().OpenDeckTop( 2, true );  // sync

		Show_OKbtn_OtherPlayer( Game.NextPlayerID(), 'Tribute' );
		yield new Promise( resolve => Resolve['Tribute_ok'] = resolve );
		Hide_OKbtn_OtherPlayer( Game.NextPlayerID(), 'Tribute' );

		let updates = {};

		// 公開したカードの違う名前につき
		Game.NextPlayer().Open.uniq( card => card.card_no )
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
		Game.NextPlayer().Open.forEach( card => Game.NextPlayer().AddToDiscardPile( card ) );
		Game.NextPlayer().Open = [];
		updates[`Players/${Game.NextPlayerID()}/DiscardPile`] = Game.NextPlayer().DiscardPile;
		updates[`Players/${Game.NextPlayerID()}/Open`] = [];
		yield FBref_Game.update( updates );
	};

	$('.OtherPlayers-wrapper' ).on( 'click', '.ok.Tribute', () => Resolve['Tribute_ok']() );  /* 確認 */





	/* 39. 鉱山の村 */
	CardEffect['Mining Village'] = function*( playing_card_ID ) {
		yield FBref_Message.set( 'このカードを即座に廃棄することができます。そうした場合、2コインを得ます。' );

		$('.action_buttons')
			.append( MakeHTML_button( 'MiningVillage trash', '廃棄して +2 コイン'   ) )
			.append( MakeHTML_button( 'MiningVillage', '廃棄しない' ) );

		const btn_val = yield new Promise( resolve => Resolve['MiningVillage'] = resolve );

		$('.action_buttons .MiningVillage').remove();  // reset

		if ( btn_val == 'trash' ) {
			Game.TrashCardByID( playing_card_ID );
			Game.TurnInfo.coin += 2;
			let updates = {};
			updates[`Players/${Game.player().id}`] = Game.player();  /* 更新 */
			updates['TrashPile'] = Game.TrashPile;
			updates['TurnInfo/coin'] = Game.TurnInfo.coin;
			yield FBref_Game.update( updates );
			return;
		}
	};

	$('.action_buttons').on( 'click', '.MiningVillage', function() {
		Resolve['MiningVillage']( ( $(this).hasClass('trash') ? 'trash' : '' ) );  // 再開
	} );





	/* 49. 銅細工師 */
	CardEffect['Coppersmith'] = function*() {
		Game.TurnInfo.add_copper_coin++;
		yield FBref_Message.set( 'このターン銅貨は+1コインを生みます。' );
		yield FBref_Game.child('TurnInfo/add_copper_coin').set( Game.TurnInfo.add_copper_coin );
		$('.action_buttons').append( MakeHTML_button( 'Coppersmith_ok', 'OK' ) );
		yield new Promise( resolve => Resolve['Coppersmith_ok'] = resolve );
		$('.action_buttons .Coppersmith_ok').remove();
	};

	$('.action_buttons').on( 'click', '.Coppersmith_ok', () => Resolve['Coppersmith_ok']() );





	/* 56. 貧民街 */
	CardEffect['Shanty Town'] = function*() {
		yield FBref_Message.set( '手札を公開します。手札にアクションカードがない場合2枚カードを引きます。' );

		// 手札を公開
		Game.player().HandCards.forEach( card => Game.player().AddToOpen( card ) );
		Game.player().HandCards = [];
		yield FBref_Players.child( Game.player().id ).set( Game.player() );

		$('.action_buttons').append( MakeHTML_button('ShantyTown_RevealHandCards', 'OK' ) );
		yield new Promise( resolve => Resolve['ShantyTown_RevealHandCards'] = resolve );
		$('.action_buttons .ShantyTown_RevealHandCards').remove();

		// 手札を戻す
		Game.player().Open.forEach( card => Game.player().AddToHandCards( card ) );
		Game.player().Open = [];
		yield FBref_Players.child( Game.player().id ).set( Game.player() );

		let action_cards
			= Game.player().HandCards.filter( card => IsActionCard( Cardlist, card.card_no ) );

		if ( action_cards.length <= 0 ) {
			FBref_chat.push( 'アクションカードがなかったので2枚カードを引きます。' );
			Game.player().DrawCards(2);
			yield FBref_Players.child( Game.player().id ).set( Game.player() );
		}
	};

	$('.action_buttons').on( 'click', '.ShantyTown_RevealHandCards', function() {
		Resolve['ShantyTown_RevealHandCards']();
	} );





	/* 51. 願いの井戸 */
	CardEffect['Wishing Well'] = function*() {
		if ( !Game.player().Drawable() ) return;

		yield FBref_Message.set( 'カード名を1つ指定してください（サプライエリアのカードをクリックしてください）。\
			山札の1番上のカードを公開し、そのカードの名前が指定したカード名だった場合、手札に加えます。' );

		$('.action_buttons').append( MakeHTML_button( 'nonexistent_card_name', '存在しないカード名') );
		$('.SupplyArea,.additional-piles').find('.card').addClass('name_a_card pointer');

		const named_card_no = yield new Promise( resolve => Resolve['name_a_card'] = resolve );

		$('.action_buttons .nonexistent_card_name').remove();
		$('.SupplyArea,.additional-piles').find('.card').removeClass('name_a_card pointer');

		const card_name_jp = ( named_card_no == 999999 ? '存在しないカード名' : `「${Cardlist[ named_card_no ].name_jp}」` );
		yield Promise.all( [
			FBref_chat.push( `${Game.player().name}が${card_name_jp}を指定しました。` ),
			FBref_Message.set( `${card_name_jp}を指定しました。` )
		]);

		// 山札の一番上のカードを公開
		const DeckTopCard = Game.player().GetDeckTopCard();
		Game.player().AddToOpen( DeckTopCard );
		yield Promise.all( [
			FBref_Players.child( Game.player().id ).set( Game.player() ),
			FBref_chat.push( `${Cardlist[ DeckTopCard.card_no ].name_jp}が公開されました。` ),
			FBref_Message.set( `${Cardlist[ DeckTopCard.card_no ].name_jp}が公開されました。` )
		]);

		// 確認 （本当は全員の確認を待つようにするべき）
		$('.action_buttons').append( MakeHTML_button( 'WishingWell_ok', 'OK') );
		yield new Promise( resolve => Resolve['WishingWell_ok'] = resolve );
		$('.action_buttons .WishingWell_ok').remove();

		// 指定したカード名と一致したなら手札に加える。そうでなければ山札に戻す。
		if ( named_card_no == DeckTopCard.card_no ) {
			Game.player().AddToHandCards( Game.GetCardByID( DeckTopCard.card_ID ) );
		} else {
			Game.player().PutBackToDeck( Game.GetCardByID( DeckTopCard.card_ID ) );
		}
		yield FBref_Players.child( Game.player().id ).set( Game.player() );
	};

	$('.action_buttons').on( 'click', '.nonexistent_card_name', function() {
		Resolve['name_a_card']( 999999 );
	} );

	$('.SupplyArea').on( 'click', '.card.name_a_card', function() {
		Resolve['name_a_card']( $(this).attr('data-card_no') );
	} );

	$('.action_buttons').on( 'click', '.WishingWell_ok', () => Resolve['WishingWell_ok']() );





	/* 55. 秘密の部屋 */
	CardEffect['Secret Chamber'] = function*() {
		yield FBref_Message.set( '手札から任意の枚数を捨て札にして下さい。捨て札にした枚数だけコインを得ます。' );

		$('.action_buttons').append( MakeHTML_button( 'SecretChamber Done', '完了' ) );

		let discarded_num = 0;
		while (true) {
			$('.HandCards').children('.card').addClass('SecretChamber_Discard pointer');
			const end = yield new Promise( resolve => Resolve['SecretChamber_Discard'] = resolve );
			if (end) break;
			discarded_num++;
			yield FBref_Message.set( `捨て札にした枚数 ： ${discarded_num}枚` );
		}

		$('.action_buttons .SecretChamber.Done').remove();  /* 完了ボタン消す */
		Game.TurnInfo.coin += discarded_num;
		yield FBref_Game.child('TurnInfo/coin').set( Game.TurnInfo.coin )
	};

	$('.HandCards').on( 'click', '.card.SecretChamber_Discard', function() {
		const clicked_card_ID = $(this).attr('data-card_ID');

		Game.player().AddToDiscardPile( Game.GetCardByID( clicked_card_ID ) );  /* 「地下貯蔵庫」 捨て札 */

		FBref_Players.child( Game.player().id ).update( {
			HandCards   : Game.player().HandCards,
			DiscardPile : Game.player().DiscardPile,
		} )
		.then( () => Resolve['SecretChamber_Discard'](false) );
	} );

	$('.action_buttons').on( 'click', '.SecretChamber.Done', function() {
		Resolve['SecretChamber_Discard'](true);
	} );

	ReactionEffect['Secret Chamber'] = function*() {
		yield FBref_MessageToMe.set('山札から2枚カードを手札に引いた後、手札から2枚山札に戻してください。');
		Game.Me().DrawCards(2);
		yield FBref_Players.child( myid ).set( Game.Me() );

		let put_back_num = 0;
		while ( put_back_num < 2 ) {
			/* 手札のカードのクリック動作を山札に戻すカードの選択に変更 */
			$('.MyHandCards').children('.card').addClass('SecretChamber_PutBackToDeck pointer');
			yield new Promise( resolve => Resolve['SecretChamber_PutBackToDeck'] = resolve );
			put_back_num++;
		}
	};

	$('.MyHandCards').on( 'click', '.card.SecretChamber_PutBackToDeck', function() {
		const clicked_card_ID = $(this).attr('data-card_ID');

		Game.Me().PutBackToDeck( Game.GetCardByID( clicked_card_ID ) );

		FBref_Players.child( myid ).update( {
			HandCards : Game.Me().HandCards,
			Deck      : Game.Me().Deck,
		} )
		.then( () => Resolve['SecretChamber_PutBackToDeck']() );  // (1)
	} );





	/* 41. 拷問人 */
	CardEffect['Torturer'] = function*() {
		yield FBref_Message.set( '他のプレイヤーは次のうち1つを選ぶ ： <br>\
			- 手札からカードを2枚捨て札にする<br>\
			- 呪いを獲得し手札に加える<br>\
			' );

		for ( let id = Game.NextPlayerID(); id != Game.whose_turn_id; id = Game.NextPlayerID(id) ) {
			if ( Game.TurnInfo.Revealed_Moat[id] ) continue;  // 堀を公開していたらスキップ
			yield Monitor_FBref_SignalAttackEnd_on( 'Torturer' );  // End受信 -> Resolve['Torturer']()
			yield SendSignal( id, {
				Attack    : true,
				card_name : 'Torturer',
				Message   : '手札からカードを2枚捨て札にするか呪いを獲得して手札に加えるか選んでください。',
			} );
			yield new Promise( resolve => Resolve['Torturer'] = resolve );  /* 他のプレイヤー待機 */
			Monitor_FBref_SignalAttackEnd_off();  /* 監視終了 */

			// 呪い獲得確認
			Show_OKbtn_OtherPlayer( id, 'Torturer' );
			yield new Promise( resolve => Resolve['Torturer_ok'] = resolve );
			Hide_OKbtn_OtherPlayer( id, 'Torturer' );
		}
		// 公開したカードを裏向きに戻す
		Game.Players.forEach( player => player.ResetFaceDown() );
		yield FBref_Players.set( Game.Players );
	};

	AttackEffect['Torturer'] = function* () {  /* アタックされる側 */
		$('.MyArea .buttons')
			.append( MakeHTML_button( 'Torturer Discard2', '手札からカードを2枚捨て札にする' ) )
			.append( MakeHTML_button( 'Torturer GetCurse', '呪いを獲得し手札に加える' ) );

		const clicked_btn = yield new Promise( resolve => Resolve['Torturer_select'] = resolve );

		$('.MyArea .buttons .Torturer').remove();

		switch ( clicked_btn ) {
			case 'Discard2' :
				yield FBref_MessageTo.child(myid).set('手札からカードを2枚捨て札にしてください。');
				let discarded_num = 0;
				while ( discarded_num < 2 && $('.MyHandCards').children('.card').length > 0 ) {
					$('.MyHandCards').children('.card').addClass('Torturer_Discard pointer');
					yield new Promise( resolve => Resolve['Torturer_Discard'] = resolve );
					discarded_num++;
				}
				return;

			case 'GetCurse' :
				yield FBref_MessageTo.child(myid).set('呪いを獲得して手札に加えてください。');
				const curse = Game.Supply.byName('Curse').GetTopCard();
				if ( curse != undefined ) curse.face = true;
				Game.Me().AddToHandCards( curse );

				let updates = {};
				updates['Supply'] = Game.Supply;
				updates[`Players/${myid}/HandCards`]   = Game.Me().HandCards;
				yield FBref_Game.update( updates );
				return;

			default :
				return;
		}
	};

	$('.MyArea .buttons').on( 'click', '.Torturer', function() {
		let clicked_btn = '';
		if ( $(this).hasClass('Discard2') ) clicked_btn = 'Discard2';
		if ( $(this).hasClass('GetCurse') ) clicked_btn = 'GetCurse';
		Resolve['Torturer_select']( clicked_btn );  // 再開
	});

	$('.MyHandCards').on( 'click', '.card.Torturer_Discard', function() {
		const clicked_card_ID = $(this).attr('data-card_ID');

		Game.Me().AddToDiscardPile( Game.GetCardByID( clicked_card_ID ) );

		FBref_Players.child( myid ).update( {
			HandCards   : Game.Me().HandCards,
			DiscardPile : Game.Me().DiscardPile,
		} )
		.then( () => Resolve['Torturer_Discard']() );  // 再開
	} );

	$('.OtherPlayers-wrapper').on( 'click', '.ok.Torturer', () => Resolve['Torturer_ok']() );  /* 確認 */





	/* 45. 寵臣 */
	CardEffect['Minion'] = function*() {
		yield FBref_Message.set( '次のうち一つを選んでください。' );

		$('.action_buttons')
			.append( MakeHTML_button( 'Minion Discard', '手札を全て捨て札にして+4カード' ) )
			.append( MakeHTML_button( 'Minion 2Coins' , '+2 コイン' ) );

		const clicked_btn = yield new Promise( resolve => Resolve['Minion_select'] = resolve );

		$('.action_buttons .Minion').remove();  // reset

		switch ( clicked_btn ) {
		 case '2Coins' :
			Game.TurnInfo.coin += 2;
			yield FBref_Game.child('TurnInfo/coin').set( Game.TurnInfo.coin );
			return;

		 case 'Discard' :
			Game.player().HandCards
				.forEach( card => Game.player().AddToDiscardPile(card) );
			Game.player().HandCards = [];
			Game.player().DrawCards(4);
			yield FBref_Players.child( Game.player().id ).set( Game.player() );

			for ( let id = Game.NextPlayerID(); id != Game.whose_turn_id; id = Game.NextPlayerID(id) ) {
				if ( Game.TurnInfo.Revealed_Moat[id] ) continue;  // 堀を公開していたらスキップ

				let pl = Game.Players[id];

				// 手札が5枚以上ならば捨て札にして+4Cards
				yield FBref_MessageTo.child(id).set('手札が5枚以上ある人は手札を捨て札にして+4カード');
				if ( pl.HandCards.length >= 5 ) {
					pl.HandCards.forEach( card => pl.AddToDiscardPile(card) );
					pl.HandCards = [];
					pl.DrawCards(4);
					yield FBref_Players.child(id).set( pl );
					continue;
				}
				yield FBref_MessageTo.child(id).set('');
				// yield Monitor_FBref_SignalAttackEnd_on( 'Minion' );  // End受信 -> Resolve['Minion']()
				// yield SendSignal( id, {
				// 	Attack    : true,
				// 	card_name : 'Minion',
				// 	Message   : '手札が5枚以上ある人は手札を捨て札にして+4カード',
				// } );
				// yield new Promise( resolve => Resolve['Minion'] = resolve );  /* 他のプレイヤー待機 */
				// Monitor_FBref_SignalAttackEnd_off();  /* 監視終了 */
			}
			return;

		 default :
			return;
		}
	};

	$('.action_buttons').on( 'click', '.Minion', function() {
		let clicked_btn = '';
		if ( $(this).hasClass('2Coins') )  clicked_btn = '2Coins';
		if ( $(this).hasClass('Discard') ) clicked_btn = 'Discard';
		Resolve['Minion_select']( clicked_btn );  // 再開
	} );





	/* 53. 破壊工作員 */
	CardEffect['Saboteur'] = function*() {
		yield FBref_Message.set(
			'他のプレイヤーは自分の山札からコストが3コイン以上のカードが出るまで公開し、そのカードを廃棄する。\
			廃棄したカードよりも2コイン以上コストが低いカードを1枚獲得してもよい。\
			公開した残りのカードは捨て札にする。' );

		for ( let id = Game.NextPlayerID(); id != Game.whose_turn_id; id = Game.NextPlayerID(id) ) {
			if ( Game.TurnInfo.Revealed_Moat[id] ) continue;  // 堀を公開していたらスキップ
			yield Monitor_FBref_SignalAttackEnd_on( 'Saboteur' );  // End受信 -> Resolve['Saboteur']()
			yield SendSignal( id, {
				Attack    : true,
				card_name : 'Saboteur',
				Message   : '山札からコストが3コイン以上のカードが出るまで公開し，そのカードを廃棄します。\
						廃棄したカードよりも2コイン以上コストが小さいカードをサプライから1枚獲得することができます。\
						公開した残りのカードは捨て札にします。',
			} );
			yield new Promise( resolve => Resolve['Saboteur'] = resolve );  /* 他のプレイヤー待機 */
			Monitor_FBref_SignalAttackEnd_off();  /* 監視終了 */
		}

	};

	AttackEffect['Saboteur'] = function* () {  /* アタックされる側 */
		let LastRevealedCard;
		let TrashedCardCostCoin = -100;

		while ( Game.Me().Drawable() ) {
			const RevealedCard = Game.Me().GetDeckTopCard();

			Game.Me().AddToOpen( RevealedCard );
			yield FBref_Players.child(myid).set( Game.Me() );

			const RevealedCard_cost_coin = Game.GetCost( RevealedCard.card_no ).coin;
			if ( RevealedCard_cost_coin >= 3 ) {
				LastRevealedCard = RevealedCard;
				TrashedCardCostCoin = RevealedCard_cost_coin;
				break;
			}
		}

		// 公開したカードの確認
		$('.MyArea .buttons')
			.append( MakeHTML_button( 'Saboteur_revealed_ok', 'OK' ) )
		yield new Promise( resolve => Resolve['Saboteur_revealed_ok'] = resolve );
		$('.MyArea .buttons .Saboteur_revealed_ok').remove();

		// コスト3以上のカードが公開されたなら廃棄して-2コスト以下のカードを獲得してもよい
		if ( TrashedCardCostCoin >= 3 ) {
			Game.TrashCardByID( LastRevealedCard.card_ID );
			let updates = {};
			updates[`Players/${myid}`] = Game.Me();
			updates['TrashPile'] = Game.TrashPile;
			yield FBref_Game.update( updates );

			/* 灰色画面上にサプライテーブルを表示 */
			$('.MyArea-wrapper .MyArea').prepend( MakeHTML_MyArea_Supply() );
			$('.MyArea-wrapper .MyArea .TrashPile-wrapper').remove()
			PrintSupply();
			/* サプライのクラス書き換え */
			$('.SupplyArea').find('.card').addClass('Saboteur_GetCard pointer');
			AddAvailableToSupplyCardIf( ( card, card_no ) =>
				CostOp( '<=',
					Game.GetCost( card_no ),
					new CCost([TrashedCardCostCoin - 2,0,0])) );

			if ( $('.SupplyArea').find('.available').length > 0 ) {
				yield FBref_MessageToMe.set( `コスト${TrashedCardCostCoin - 2}以下のカードを獲得できます。` );
				$('.MyArea .buttons').append( MakeHTML_button( 'Saboteur_DontGetCard', '獲得しない' ) );
				yield new Promise( resolve => Resolve['Saboteur_GetCard'] = resolve );
				$('.MyArea .buttons .Saboteur_DontGetCard').remove();
			}

			$('.MyArea-wrapper .Common-Area').remove();

			// 獲得したカードの確認
			$('.MyArea .buttons').append( MakeHTML_button( 'Saboteur_gotten_ok', 'OK' ) );
			yield new Promise( resolve => Resolve['Saboteur_gotten_ok'] = resolve );
			$('.MyArea .buttons .Saboteur_gotten_ok').remove();
		}

		// 公開した残りのカードを捨て札にする
		Game.Me().Open.forEach( card => Game.Me().AddToDiscardPile( card ) );
		Game.Me().Open = [];
		yield FBref_Players.child(myid).set( Game.Me() );
	};

	$('.MyArea .buttons').on( 'click', '.Saboteur_revealed_ok', () => Resolve['Saboteur_revealed_ok']() );

	$('.MyArea .buttons').on( 'click', '.Saboteur_DontGetCard', () => Resolve['Saboteur_GetCard']() );

	$('.MyArea .buttons').on( 'click', '.Saboteur_gotten_ok', () => Resolve['Saboteur_gotten_ok']() );

	$('.MyArea-wrapper').on( 'click', '.SupplyArea .card.Saboteur_GetCard', function() {
		let $this = $(this);
		MyAsync( function*() {
			const clicked_card_name_eng = $this.attr('data-card-name-eng');
			const clicked_card = Game.Supply.byName(clicked_card_name_eng).LookTopCard();
			const clicked_card_ID = clicked_card.card_ID;

			if ( !$this.hasClass('available') ) {
				yield MyAlert( { message : '獲得できるコスト上限を超えています。' } );
				return;
			}

			Game.Me().AddToDiscardPile( Game.GetCardByID( clicked_card_ID ) );

			let updates = {};
			updates[`Players/${Game.Me().id}/DiscardPile`] = Game.Me().DiscardPile;
			updates['Supply'] = Game.Supply;
			yield FBref_Game.update( updates );
			Resolve['Saboteur_GetCard']();  // 再開
		});
	} );





	/* 42. 詐欺師 */
	CardEffect['Swindler'] = function*() {
		yield FBref_Message.set( '他のプレイヤーは全員、自分の山札の一番上のカードを廃棄し、\
			廃棄したカードと同じコストのあなたが選んだカード（サプライをクリック）を獲得します。' );

		for ( let id = Game.NextPlayerID(); id != Game.whose_turn_id; id = Game.NextPlayerID(id) ) {
			if ( Game.TurnInfo.Revealed_Moat[id] ) continue;  // 堀を公開していたらスキップ
			yield FBref_MessageTo.child(id).set('山札の一番上のカードを廃棄し、廃棄したカードと同じコストのカードを獲得します。');

			let pl = Game.Players[id];

			// 山札の一番上のカードを公開
			const DeckTopCard = pl.GetDeckTopCard();
			pl.AddToOpen( DeckTopCard );
			yield FBref_Players.child(id).set( pl );

			// 同じコストのカードを1枚獲得
			/* サプライのクラス書き換え */
			$('.SupplyArea').find('.card').addClass('Swindler_GetCard pointer');
			AddAvailableToSupplyCardIf( ( card, card_no ) =>
				CostOp( '==',
					Game.GetCost( card_no ),
					Game.GetCost( DeckTopCard.card_no ) )
			);

			let updates = {};
			if ( $('.SupplyArea').find('.available').length > 0 ) {
				const clicked_card_ID
					= yield new Promise( resolve => Resolve['Swindler_GetCard'] = resolve );
				pl.AddToDiscardPile( Game.GetCardByID( clicked_card_ID ) );
				updates['Supply'] = Game.Supply;
			}

			Game.TrashCardByID( DeckTopCard.card_ID );  // 廃棄
			updates[`Players/${id}`] = Game.Players[id];
			updates['TrashPile'] = Game.TrashPile;
			yield Promise.all( [
				FBref_Game.update( updates ),
				FBref_MessageTo.child(id).set(''),  /* reset */
			] );
		}
	};

	$('.SupplyArea').on( 'click', '.card.Swindler_GetCard', function() {
		let $this = $(this);
		MyAsync( function*() {
			const clicked_card_name_eng = $this.attr('data-card-name-eng');
			const clicked_card = Game.Supply.byName(clicked_card_name_eng).LookTopCard();
			const clicked_card_ID = clicked_card.card_ID;

			if ( !$this.hasClass('available') ) {
				yield MyAlert( { message : 'コストが異なるので選べません。' } );
				return;
			}
			Resolve['Swindler_GetCard']( clicked_card_ID );
		});
	} );





	/* 35. 仮面舞踏会 */
	CardEffect['Masquerade'] = function*() {
		yield FBref_Message.set( '各プレイヤーは自分の手札のカードを1枚選び、次のプレイヤーに同時に渡します。\
			その後、あなたは自分の手札のカードを1枚廃棄することができます。' );

		// 仮面舞踏会使用者が一旦全員分（自分含む）の選択したカードを集める
		for ( let id = 0; id < Game.Players.length; ++id ) {
			yield SendSignal( id, {
				Attack    : false,
				card_name : 'Masquerade',
				Message   : '各プレイヤーは自分の手札のカードを1枚選び、次のプレイヤーに同時に渡します。',
			} );
		}

		// 集計
		let Masquerade_passed_card_IDs = {};
		let done_num = 0;

		FBref_Signal.child('Masquerade_gather').on( 'value', function( FBsnapshot ) {
			const passed_val = FBsnapshot.val();
			if ( passed_val == null ) return;

			// 全員分揃ったら次に
			if ( ++done_num == Game.Players.length ) {
				Masquerade_passed_card_IDs = passed_val;
				Resolve['Masquerade_gather']();
			}
		} );
		yield new Promise( resolve => Resolve['Masquerade_gather'] = resolve );
		FBref_Signal.child('Masquerade_gather').off();  // 監視終了
		FBref_Signal.child('Masquerade_gather').remove();

		// 次のプレイヤーに渡す
		for ( let id = 0; id < Game.Players.length; ++id ) {
			// 手札が無かったプレイヤーの次の人は何も受け取らない
			if ( Masquerade_passed_card_IDs[id] == 99999999 ) continue;

			Game.Players[ Game.NextPlayerID(id) ]
				.AddToHandCards( Game.GetCardByID( Masquerade_passed_card_IDs[id] ) );
			FBref_MessageTo.child(id).set('');
		}
		Game.Players.forEach( player => player.ResetFaceDown() );
		yield FBref_Players.set( Game.Players );

		// 手札を1枚廃棄できる
		yield FBref_Message.set( '手札のカードを1枚廃棄することができます。');

		$('.action_buttons').append( MakeHTML_button( 'Masquerade_trash', '廃棄しない' ) );
		$('.HandCards').children('.card').addClass('Masquerade_trash pointer');
		yield new Promise( resolve => Resolve['Masquerade_trash'] = resolve );
		$('.action_buttons .Masquerade_trash').remove();
		$('.HandCards').children('.card').removeClass('Masquerade_trash pointer');
	};

	// 自分と他のプレイヤー
	CardEffect['Masquerade_SelectPassCard'] = function* () {
		if ( Game.Me().HandCards.length <= 0 ) {
			yield FBref_Signal.child(`Masquerade_gather/${Game.Me().id}`).set( 99999999 );
			return;
		}

		$('.HandCards,.MyHandCards').children('.card')
			.addClass('Masquerade_SelectPassCard pointer');

		// 渡すカードの選択待ち
		const clicked_card_ID
			= yield new Promise( resolve => Resolve['Masquerade_SelectPassCard'] = resolve );

		// カードidを送る
		yield FBref_Signal.child(`Masquerade_gather/${Game.Me().id}`).set( clicked_card_ID );
	}

	// 自分と他のプレイヤー
	$('.HandCards,.MyHandCards').on( 'click', '.card.Masquerade_SelectPassCard', function() {
		const clicked_card_ID = $(this).attr('data-card_ID');
		const clicked_card = Game.GetCardByID( clicked_card_ID );
		clicked_card.down = true;
		Game.Me().AddToOpen( clicked_card );

		FBref_Players.child( Game.Me().id ).set( Game.Me() )
		.then( () => Resolve['Masquerade_SelectPassCard']( clicked_card_ID ) );
	} );

	// 自分
	$('.HandCards').on( 'click', '.card.Masquerade_trash', function() {
		const clicked_card_ID = $(this).attr('data-card_ID');
		Game.TrashCardByID( clicked_card_ID );

		Promise.all( [
			FBref_Game.child('TrashPile').set( Game.TrashPile ),
			FBref_Players.child( `${Game.player().id}/HandCards` ).set( Game.player().HandCards )
		])
		.then( () => Resolve['Masquerade_trash']() );
	} );

	// 自分
	$('.action_buttons').on( 'click', '.Masquerade_trash', () => Resolve['Masquerade_trash']() );





	/* 54. 橋 */
	CardEffect['Bridge'] = function*() {
		yield FBref_Message.set( 'このターン、全てのカードのコストは1コイン少なくなります（0コイン未満にはなりません）。' );
		Game.TurnInfo.cost_down_by_Bridge++;
		yield FBref_Game.child('TurnInfo/cost_down_by_Bridge').set( Game.TurnInfo.cost_down_by_Bridge );

		$('.action_buttons').append( MakeHTML_button( 'Bridge_ok', 'OK' ) );
		yield new Promise( resolve => Resolve['Bridge_ok'] = resolve );
		$('.action_buttons .Bridge_ok').remove();
	};

	$('.action_buttons').on( 'click', '.Bridge_ok', () => Resolve['Bridge_ok']() );


});
