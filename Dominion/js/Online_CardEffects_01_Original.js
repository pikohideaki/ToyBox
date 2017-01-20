
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
			.filter( card => card.card_no == CardName2No['Copper'] );

		if ( Coppers.length <= 0 ) {
			yield MyAlert( { message : '手札に銅貨がありません。' } );
			return;
		}

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
			yield MyAlert( { message : '手札にカードがありません。' } );
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

		AddAvailableToSupplyCardIf( ( card, card_no ) =>
			CostOp( '<=',
				Game.GetCost( card_no ),
				CostOp( '+', TrashedCardCost, new CCost([2,0,0]) ) ) );

		if ( $('.SupplyArea').find('.available').length <= 0 ) {
			yield MyAlert( { message : '獲得できるカードがありません' } );
			return;
		}

		yield new Promise( resolve => Resolve['Remodel_GetCard'] = resolve );
	};

	/* 16. 基本 - 鉱山 */
	CardEffect['Mine'] = function* () {
		const Treasure = Game.player().HandCards
			.filter( card => IsTreasureCard( Cardlist, card.card_no ) );

		if ( Treasure.length <= 0 ) {
			yield MyAlert( { message : '手札に財宝カードがありません。' } );
			return;
		}

		yield FBref_Message.set( '手札の財宝カードを1枚廃棄して下さい。' );

		/* 手札のカードのクリック動作を廃棄するカードの選択に変更 */
		$('.HandCards').children('.card')
			.filter( function() { return IsTreasureCard( Cardlist, $(this).attr('data-card_no') ); } )
			.addClass('Mine_Trash pointer');  /* 手札のカードのクリック動作を廃棄するカードの選択に変更 */

		const TrashedCardCost
			= yield new Promise( resolve => Resolve['Mine_Trash'] = resolve );

		yield FBref_Message.set(
			`コストが廃棄したカード+3(=${TrashedCardCost.coin + 3} )コインまでの財宝カードを獲得してください。` );

		/* サプライのクラス書き換え */
		$('.SupplyArea').find('.card').addClass('Mine_GetCard pointer');

		AddAvailableToSupplyCardIf( ( card, card_no ) =>
			CostOp( '<=',
				Game.GetCost( card_no ),
				CostOp( '+', TrashedCardCost, new CCost([3,0,0]) ) )
			&& IsTreasureCard( Cardlist, card_no ) );

		if ( $('.SupplyArea').find('.available').length <= 0 ) {
			yield MyAlert( { message : '獲得できるカードがありません' } );
			return;
		}

		yield new Promise( resolve => Resolve['Mine_GetCard'] = resolve );
	};

	$('.HandCards').on( 'click', '.card.Remodel_Trash,.Mine_Trash', function() {
		let Remodel_or_Mine;
		if ( $(this).hasClass('Remodel_Trash') ) Remodel_or_Mine = 'Remodel_Trash';
		if ( $(this).hasClass('Mine_Trash') )    Remodel_or_Mine = 'Mine_Trash';

		const clicked_card_no = $(this).attr('data-card_no');
		const clicked_card_ID = $(this).attr('data-card_ID');

		Game.TrashCardByID( clicked_card_ID );  /* 手札廃棄 */

		let updates = {};
		updates[`Players/${Game.player().id}/HandCards`] = Game.player().HandCards;
		updates['TrashPile'] = Game.TrashPile;

		FBref_Game.update( updates )
		.then( () => Resolve[Remodel_or_Mine]( Game.GetCost( clicked_card_no ) ) );
	} );

	$('.SupplyArea').on( 'click', '.card.Remodel_GetCard,.Mine_GetCard', function() {
		let $this = $(this);
		MyAsync( function*() {
			let Remodel_or_Mine;
			let DiscardPile_or_HandCards;
			if ( $this.hasClass('Remodel_GetCard') ) {
				Remodel_or_Mine = 'Remodel_GetCard';
				DiscardPile_or_HandCards = 'DiscardPile';
			}
			if ( $this.hasClass('Mine_GetCard') ) {
				Remodel_or_Mine = 'Mine_GetCard';
				DiscardPile_or_HandCards = 'HandCards';
			}

			const clicked_card_name_eng = $this.attr('data-card-name-eng');
			const clicked_card = Game.Supply.byName(clicked_card_name_eng).LookTopCard();
			const clicked_card_ID = clicked_card.card_ID;

			if ( !$this.hasClass('available') ) {
				yield MyAlert( { message : '獲得できるコスト上限を超えています。' } );
				return;
			}

			Game.player()[`AddTo${DiscardPile_or_HandCards}`]( Game.GetCardByID( clicked_card_ID ) );

			let updates = {};
			updates[`Players/${Game.player().id}/${DiscardPile_or_HandCards}`]
				= Game.player()[DiscardPile_or_HandCards];
			updates['Supply'] = Game.Supply;
			yield FBref_Game.update( updates );
			Resolve[Remodel_or_Mine]();
		})
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
		$('.action_buttons .Chancellor').remove();  // reset

		if ( discard ) {
			yield Game.player().PutDeckIntoDiscardPile();  /* 山札をそのままひっくり返して捨て山に置く */
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

				// ShowDialog( {
				// 	message  : `${Cardlist[ deck_top_card.card_no ].name_jp}を脇に置きますか？`,
				// 	contents : MakeHTML_Card( deck_top_card, Game ),
				// 	buttons  :
				// 		MakeHTML_button( 'Library SetAside', '脇に置く' ) + 
				// 		MakeHTML_button( 'Library', '手札に加える' ),
				// } );

				// const set_aside
				// 	= yield new Promise( resolve => Resolve['Library'] = resolve );

				// HideDialog();

				const set_aside
				 = yield MyDialog( {
					message  : `${Cardlist[ deck_top_card.card_no ].name_jp}を脇に置きますか？`,
					contents : MakeHTML_Card( deck_top_card, Game ),
					buttons  : [
						{
							class_str :'Library SetAside',
							name : '脇に置く',
							return_value : true,
						},
						{
							class_str :'Library',
							name : '手札に加える',
							return_value : false,
						},
					],
				} );

				if ( set_aside ) {
					Game.player().SetAside( deck_top_card );
					yield FBref_Players.child( Game.player().id ).set( Game.player() );
					continue;
				}
			}

			Game.player().AddToHandCards( deck_top_card );
			yield FBref_Players.child( Game.player().id ).set( Game.player() );
		}

		yield AcknowledgeButton_Me();  // 脇に置いたカードを確認

		/* move cards in Aside to DiscardPile */
		Game.player().Aside.forEach( card => Game.player().AddToDiscardPile(card) );
		Game.player().Aside = [];
		yield FBref_Players.child( Game.player().id ).set( Game.player() );
	};

	/* 確認 */
	$('.dialog_buttons' ).on( 'click', '.Library', function() {
		Resolve['Library']( $(this).hasClass('SetAside') );  // 再開
	} );

	// $('.action_buttons').on( 'click', '.Library.Done', function() {
	// 	Resolve['Library_Done']();  // 再開
	// } );





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

		yield AcknowledgeButton_Me();  // 脇に置いたカードを確認

		// 公開したカードを確認
		// $('.action_buttons').append( MakeHTML_button( 'Adventurer Done', '確認' ) );
		// yield new Promise( resolve => Resolve['Adventurer'] = resolve );
		// $('.action_buttons .Adventurer.Done').remove();  /* 完了ボタン消す */

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

	// $('.action_buttons').on( 'click', '.Adventurer.Done', () => Resolve['Adventurer']() );





	/* 17. 基本 - 工房 */
	CardEffect['Workshop'] = function* () {
		yield FBref_Message.set( 'コスト4以下のカードを獲得して下さい。' );

		/* サプライのクラス書き換え */
		$('.SupplyArea').find('.card').addClass('Workshop_GetCard pointer');
		AddAvailableToSupplyCardIf( ( card, card_no ) =>
			CostOp( '<=', Game.GetCost( card_no ), new CCost([4,0,0]) ) );

		if ( $('.SupplyArea').find('.available').length <= 0 ) {
			yield MyAlert( { message : '獲得できるカードがありません' } );
			return;
		}

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

		AddAvailableToSupplyCardIf( ( card, card_no ) =>
			CostOp( '<=', Game.GetCost( card_no ), new CCost([5,0,0]) ) );

		yield new Promise( resolve => Resolve['Feast_GetCard'] = resolve );
	};

	$('.SupplyArea').on( 'click', '.card.Workshop_GetCard,.Feast_GetCard', function() {
		let $this = $(this);
		MyAsync( function*() {
			let Workshop_or_Feast;
			if ( $this.hasClass('Workshop_GetCard') ) Workshop_or_Feast = 'Workshop_GetCard';
			if ( $this.hasClass('Feast_GetCard') )    Workshop_or_Feast = 'Feast_GetCard';

			const clicked_card_name_eng = $this.attr('data-card-name-eng');
			const clicked_card = Game.Supply.byName(clicked_card_name_eng).LookTopCard();
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
			Resolve[Workshop_or_Feast]();  // 再開
		});
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

		yield Game.AttackAllPlayers(
				'Witch',
				'呪いを獲得します。',
				false,  // don't send signals
				function*() {
					// 呪いを獲得
					yield Game.GainCard( 'Curse', 'DiscardPile', id );
				} );
	};





	/* 29. 民兵 */
	CardEffect['Militia'] = function* () {
		yield FBref_Message.set( '手札が3枚になるまで捨てて下さい。' );

		yield Game.AttackAllPlayers(
				'Militia',
				'手札が3枚になるまで捨てて下さい。',
				true,  // send signals
				function*() {} );
	};

	/* アタックされる側 */
	AttackEffect['Militia'] = function*() {
		while ( $('.MyHandCards').children('.card').length > 3 ) {
			$('.MyHandCards').children('.card').addClass('Militia_Discard pointer');
			yield new Promise( resolve => Resolve['Militia_Discard'] = resolve );
		}
	};

	/* アタックされる側 */
	$('.MyHandCards').on( 'click', '.card.Militia_Discard', function() {
		const clicked_card_ID = $(this).attr('data-card_ID');

		Game.Me().AddToDiscardPile( Game.GetCardByID( clicked_card_ID ) );

		FBref_Players.child( myid ).update( {
			HandCards   : Game.Me().HandCards,
			DiscardPile : Game.Me().DiscardPile,
		} )
		.then( () => Resolve['Militia_Discard']() );  // 再開
	} );





	/* 31. 役人 */
	CardEffect['Bureaucrat'] = function* () {
		yield FBref_Message.set( 'プレイヤーは銀貨を山札に獲得します。\
			他のプレイヤーは手札に勝利点カードが1枚以上ある場合はそのうち1枚を山札に戻してください。そうでない場合は手札を公開してください。' );

		const silver = Game.Supply.byName('Silver').GetTopCard();
		if ( silver != undefined ) silver.face = true;
		Game.player().PutBackToDeck( silver );  /* 銀貨を山札の一番上に獲得 */

		let updates = {};
		updates[`Players/${Game.player().id}/Deck`] = Game.player().Deck;
		updates['Supply'] = Game.Supply;
		yield FBref_Game.update( updates );

		yield Game.AttackAllPlayers(
				'Bureaucrat',
				'手札に勝利点カードが1枚以上ある場合はそのうち1枚を山札に戻してください。そうでない場合は手札を公開してください。',
				true,  // send signals
				function*() {} );

		// 全プレイヤーの山札に戻した勝利点カードか公開した手札を確認
		yield AcknowledgeButton_Me();

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

		yield new Promise( resolve => Resolve['Bureaucrat_PutBack'] = resolve );
	};

	// アタックされる側
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
		yield FBref_Message.set(
			'他のプレイヤーの山札の上から2枚を公開し、\
			その中に財宝カードがあればそのうち1枚を選んで廃棄します。\
			これによって廃棄されたカードのうち好きな枚数を獲得できます。' );

		function* attack_effects( player_id, passing_object ) {
			const pl = Game.Players[player_id];
			/* 山札から2枚めくり公開 */
			pl.AddToOpen( pl.GetDeckTopCard() );
			pl.AddToOpen( pl.GetDeckTopCard() );
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
				const trashed_card_ID
					= yield new Promise( resolve => Resolve['Thief_Trash'] = resolve );
				if ( trashed_card_ID != undefined ) {
					passing_object.trashed_card_IDs.push( trashed_card_ID );
				}
			} else {
				yield AcknowledgeButton_OtherPlayer( player_id );
			}

			/* 公開したカードの残りを捨て札に */
			pl.Open.forEach( card => pl.AddToDiscardPile( card ) );
			pl.Open = [];
			yield FBref_Players.child(id).update( {
				DiscardPile : pl.DiscardPile,
				Open        : pl.Open,
			} );
		}

		let passing_object = { trashed_card_IDs : [] };

		yield Game.AttackAllPlayers(
				'Thief',
				'山札の上から2枚を公開してください。\
				財宝カードが公開された場合そのうち1枚が廃棄されます。\
				廃棄されたカード以外は捨て札にしてください。',
				false,  // don't send signals
				attack_effects, passing_object );


		// 1枚以上廃棄したならばその中から好きな枚数獲得
		if ( passing_object.trashed_card_IDs.length > 0 ) {
			/* 廃棄したカードの獲得画面 */
			let trashed_cards_html;

			passing_object.trashed_card_IDs.forEach( function( card_ID ) {
				const card = Game.GetCardByID( card_ID, false );
				card.class_str = 'Thief_GainTrashedCard pointer';
				trashed_cards_html += MakeHTML_Card( card, Game );
			} );

			yield MyAlert( {
				message  : '廃棄したカードから好きな枚数獲得してください。',
				contents : trashed_cards_html,
			} );

			// class_str をリセット
			ResetClassStr( passing_object.trashed_card_IDs );
			yield FBref_Game.update( {
				TrashPile : Game.TrashPile,
				Players   : Game.Players ,
			} );
		}
	};

	/* 廃棄するカードの選択 */
	$('.OtherPlayers-wrapper').on( 'click', '.sOpen .Thief_Trash', function() {
		const player_id = $(this).parents('.OtherPlayer').attr('data-player_id');
		const clicked_card_ID = $(this).attr('data-card_ID');
		Game.TrashCardByID( clicked_card_ID );

		FBref_Game.update( {
			TrashPile : Game.TrashPile,
			[`Players/${player_id}/Open`] : Game.Players[ player_id ].Open,
		} )
		.then( () => Resolve['Thief_Trash']( clicked_card_ID ) );  // 再開
	} );

	/* 廃棄したカードの獲得 */
	$('.MyAlert').on( 'click', '.Thief_GainTrashedCard', function() {
		$('.MyAlert').find('.card').removeClass('Thief_GainTrashedCard pointer');

		const clicked_card_ID = $(this).attr('data-card_ID');
		Game.player().AddToDiscardPile( Game.GetCardByID( clicked_card_ID ) );
		$(this).remove();  /* クリックしたカードを非表示 */

		FBref_Game.update( {
			TrashPile : Game.TrashPile,
			[`Players/${Game.player().id}/DiscardPile`] : Game.player().DiscardPile,
		} )
		// .then( () => $('.MyAlert').find('.card').addClass('Thief_GainTrashedCard pointer') );
	} );





	/* 28. 密偵 */
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
					Game.player().PutBackToDeck( revealed_card );
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
			passing_object.revealed_card_IDs.push( revealed_card_ID );
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
					pl.PutBackToDeck( revealed_card );
					break;

				default :
					throw new Error( "return value of Spy must be 'Discard' or 'PutBackToDeck' ");
					break;
			}

			yield FBref_Players.child( player_id ).set( pl );
		}

		yield Game.AttackAllPlayers(
				'Spy',
				'山札の上から1枚を公開してください。公開されたカードは捨て札になるか山札に戻されます。',
				false,  // don't send signals
				attack_effects, passing_object );

		// 公開したカードを裏向きに戻す
		yield Game.ResetFaceDown( passing_object.revealed_card_IDs );
	};

	$('.action_buttons').on( 'click', '.Spy.Discard',
		() => Resolve['Spy_Me']( 'Discard' ) );
	$('.action_buttons').on( 'click', '.Spy.PutBackToDeck',
		() => Resolve['Spy_Me']( 'PutBackToDeck' ) );

	$('.OtherPlayers-wrapper').on( 'click', '.Spy.Discard',
		() => Resolve['Spy_OtherPlayer']( 'Discard' ) );
	$('.OtherPlayers-wrapper').on( 'click', '.Spy.PutBackToDeck',
		() => Resolve['Spy_OtherPlayer']( 'PutBackToDeck' ) );





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
