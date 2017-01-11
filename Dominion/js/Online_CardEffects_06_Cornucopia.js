
$( function() {
	// CardEffect['Menagerie']       = function*() {}  /* 127. 移動動物園 */
	// CardEffect['Horse Traders']   = function*() {}  /* 128. 馬商人 */
	// CardEffect['Fortune Teller']  = function*() {}  /* 129. 占い師 */
	// CardEffect['Diadem']          = function*() {}  /* 130. 王冠 */
	// CardEffect['Princess']        = function*() {}  /* 131. 王女 */
	// CardEffect['Bag of Gold']     = function*() {}  /* 132. 金貨袋 */
	// CardEffect['Remake']          = function*() {}  /* 133. 再建 */
	// CardEffect['Harvest']         = function*() {}  /* 134. 収穫 */
	// CardEffect['Hunting Party']   = function*() {}  /* 135. 狩猟団 */
	// CardEffect['Hamlet']          = function*() {}  /* 136. 村落 */
	// CardEffect['Jester']          = function*() {}  /* 137. 道化師 */
	// CardEffect['Farming Village'] = function*() {}  /* 138. 農村 */
	// CardEffect['Tournament']      = function*() {}  /* 139. 馬上槍試合 */
	CardEffect['Fairgrounds']     = function*() {}  /* 140. 品評会 */
	// CardEffect['Horn of Plenty']  = function*() {}  /* 141. 豊穣の角笛 */
	// CardEffect['Young Witch']     = function*() {}  /* 142. 魔女娘 */
	// CardEffect['Trusty Steed']    = function*() {}  /* 143. 名馬 */
	// CardEffect['Followers']       = function*() {}  /* 144. 郎党 */






	/* 127. 移動動物園 */
	CardEffect['Menagerie'] = function*() {
		yield FBref_Message.set( '手札を公開します。もし重複しているカードが無ければ +3カード、そうでなければ +1カード。' );

		let exist_dupulicate =
			Game.player().Open.uniq( card => card.card_no ).length == Game.player().Open.length;

		// 公開したカードの確認
		$('.action_buttons').append( MakeHTML_button( 'Menagerie_ok', 'OK' ) );
		yield new Promise( resolve => Resolve['Menagerie_ok'] = resolve );
		$('.action_buttons .Menagerie_ok').resolve();

		// もし重複しているカードが無ければ +3カード、そうでなければ +1カード。
		Game.player().DrawCards( (exist_dupulicate ? 3 : 1) );

		/* 公開したカードを片づける */
		Game.player().Open.forEach( card => Game.player().AddToDiscardPile(card) );
		Game.player().Open = [];

		yield FBref_Players.child( Game.player().id ).set( Game.player() );
	}

	$('.action_buttons').on( 'click', '.Menagerie_ok', () => Resolve['Menagerie_ok']() );





	/* 128. 馬商人 */
	CardEffect['Horse Traders'] = function*() {
		yield FBref_Message.set('手札から2枚捨て札にしてください。');

		let discarded_num = 0;
		while ( Game.player().HandCards.length > 0 && discarded_num < 2 ) {
			$('.HandCards').children('.card').addClass('HorseTraders_Discard pointer');
			yield new Promise( resolve => Resolve['HorseTraders_Discard'] = resolve );
			discarded_num++;
		}
	}

	$('.HandCards').on( 'click', '.card.HorseTraders_Discard', function() {
		const clicked_card_ID = $(this).attr('data-card_ID');

		Game.player().AddToDiscardPile( Game.GetCardByID( clicked_card_ID ) );

		FBref_Players.child( Game.player().id ).update( {
			HandCards   : Game.player().HandCards,
			DiscardPile : Game.player().DiscardPile,
		} )
		.then( () => Resolve['HorseTraders_Discard']() );  // 再開
	} );


	ReactionEffect['Horse Traders'] = function*( card_no, card_ID ) {
		yield FBref_MessageToMe.set('このカードを脇に置き、 +1カード。');
		Game.Me().SetAside( Game.GetCardByID( card_ID ) );
		Game.Me().DrawCards(1);
		yield FBref_Players.child( myid ).set( Game.Me() );
	};





	/* 129. 占い師 */
	CardEffect['Fortune Teller'] = function*() {
		yield FBref_Message.set( '勝利点カードか呪いが公開されるまでカードを公開し、そのカードを山札の一番上に置きます。\
			残りの公開したカードは捨て札にします。' );

		for ( let id = Game.NextPlayerID(); id != Game.whose_turn_id; id = Game.NextPlayerID(id) ) {
			if ( Game.TurnInfo.Revealed_Moat[id] ) continue;  // 堀を公開していたらスキップ

			let pl = Game.Players[id];

			yield FBref_MessageTo.child(id).set('勝利点カードか呪いが公開されるまでカードを公開し、\
				そのカードを山札の一番上に置きます。残りの公開したカードは捨て札にします。');

			let deck_top_card;
			let revealed;
			while ( pl.Drawable() ) {
				revealed = true;
				deck_top_card = pl.GetDeckTopCard();
				pl.AddToOpen( deck_top_card );
				yield FBref_Players.child( pl.id ).set( pl );
				if ( IsVictoryCard( Cardlist, deck_top_card.card_no ) ) break;
				if ( Cardlist[ deck_top_card.card_no ].name_eng == 'Curse' ) break;
				revealed = false;
			}

			// 公開したカードを確認
			Show_OKbtn_OtherPlayer( id, 'FortuneTeller' );
			yield new Promise( resolve => Resolve['FortuneTeller_ok'] = resolve );
			Hide_OKbtn_OtherPlayer( id, 'FortuneTeller' );

			// 山札の一番上に置く
			if ( revealed ) {
				deck_top_card.face = true;
				pl.PutBackToDeck( Game.GetCardByID( deck_top_card.card_ID ) );
				yield FBref_Players.child( pl.id ).set( pl );
			}

			/* 公開したカードを片づける */
			pl.Open.forEach( card => pl.AddToDiscardPile(card) );
			pl.Open = [];

			yield Promise.all( [
				FBref_Players.child( pl.id ).set( pl ),
				FBref_MessageTo.child(id).set(''),
			] );
		}

		// 公開したカードを裏向きに戻す
		Game.Players.forEach( player => player.ResetFaceDown() );
		yield FBref_Players.set( Game.Players );
	}





	/* 130. 王冠 */
	CardEffect['Diadem'] = function*() {

	}





	/* 131. 王女 */
	CardEffect['Princess'] = function*() {

	}





	/* 132. 金貨袋 */
	CardEffect['Bag of Gold'] = function*() {

	}





	/* 133. 再建 */
	CardEffect['Remake'] = function*() {
		yield FBref_Message.set( '次の操作を2回行います ： <br>\
			手札から1枚廃棄し、そのカード+1コインのコストのカードを獲得します。' );

		for ( let i = 0; i < 2; ++i ) {
			yield FBref_Message.set( '手札から1枚廃棄し、そのカード+1コインのコストのカードを獲得します。' );

			if ( Game.player().HandCards.length <= 0 ) {
				yield MyAlert( { message : '手札にカードがありません。' } );
				return;
			}

			/* 手札のカードのクリック動作を廃棄するカードの選択に変更 */
			$('.HandCards').children('.card').addClass('Remake_Trash pointer');

			const TrashedCardCost
				= yield new Promise( resolve => Resolve['Remake_Trash'] = resolve );

			yield FBref_Message.set(
				`コストがちょうど廃棄したカード+1(=${TrashedCardCost.coin + 1} )コインのカードを獲得してください。` );

			/* サプライのクラス書き換え */
			$('.SupplyArea').find('.card').addClass('Remake_GetCard pointer');

			AddAvailableToSupplyCardIf( ( card, card_no ) =>
				CostOp( '==',
					Game.GetCost( card_no ),
					CostOp( '+', TrashedCardCost, new CCost([1,0,0]) ) ) );

			if ( $('.SupplyArea').find('.available').length <= 0 ) {
				yield MyAlert( { message : '獲得できるカードがありません' } );
				continue;
			}

			yield new Promise( resolve => Resolve['Remake_GetCard'] = resolve );
		}
	}

	$('.HandCards').on( 'click', '.card.Remake_Trash', function() {
		const clicked_card_no = $(this).attr('data-card_no');
		const clicked_card_ID = $(this).attr('data-card_ID');

		Game.TrashCardByID( clicked_card_ID );  /* 手札廃棄 */

		let updates = {};
		updates[`Players/${Game.player().id}/HandCards`] = Game.player().HandCards;
		updates['TrashPile'] = Game.TrashPile;

		FBref_Game.update( updates )
		.then( () => Resolve['Remake_Trash']( Game.GetCost( clicked_card_no ) ) );
	} );

	$('.SupplyArea').on( 'click', '.card.Remake_GetCard', function() {
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
			Resolve['Remake_GetCard']();
		});
	} );





	/* 134. 収穫 */
	CardEffect['Harvest'] = function*() {
		yield FBref_Message.set( '山札から4枚のカードを公開し、捨て札にします。<br>\
			このとき公開したカードのうち名前が異なるもの1枚につき +1 コインを得ます。' );

		/* 山札から4枚めくり公開 */
		for ( let i = 0; i < 4; ++i ) {
			if ( !Game.player().Drawable() ) break;
			Game.player().AddToOpen( Game.player().GetDeckTopCard() );
		}

		// 公開したカードの確認
		$('.action_buttons').append( MakeHTML_button( 'Harvest_ok', 'OK' ) );
		yield new Promise( resolve => Resolve['Harvest_ok'] = resolve );
		$('.action_buttons .Harvest_ok').resolve();

		// 公開したカードのうち名前が異なるもの1枚につき +1コイン
		Game.TurnInfo.coin += Game.player().Open.uniq( card => card.card_no ).length;

		/* 公開したカードを片づける */
		Game.player().Open.forEach( card => Game.player().AddToDiscardPile(card) );
		Game.player().Open = [];

		yield Primise.all( [
			FBref_Players.child( Game.player().id ).set( Game.player() ),
			FBref_Game.child('TurnInfo/coin').set( Game.TurnInfo.coin ),
		]);
	}

	$('.action_buttons').on( 'click', '.Harvest_ok', () => Resolve['Harvest_ok']() );





	/* 135. 狩猟団 */
	CardEffect['Hunting Party'] = function*() {
		yield FBref_Message.set( '手札を公開します。\
			あなたの山札のカードを手札のカードと重複していないカードが公開されるまで公開します。\
			そのカードをあなたの手札に加え、他の山札から公開したカードは捨て札に置きます。' );

		// 手札を公開
		Game.player().HandCards.forEach( card => card.face = true );
		yield FBref_Players.child( `${Game.player().id}/HandCards` ).set( Game.player().HandCards );


		let deck_top_card;
		let revealed;
		while ( Game.player().Drawable() ) {
			revealed = true;
			deck_top_card = Game.player().GetDeckTopCard();
			Game.player().AddToOpen( deck_top_card );
			yield FBref_Players.child( Game.player().id ).set( Game.player() );
			if ( IsActionCard  ( Cardlist, deck_top_card.card_no ) ) break;
			if ( IsTreasureCard( Cardlist, deck_top_card.card_no ) ) break;
			revealed = false;
		}

		// 公開したカードを確認
		$('.action_buttons').append( MakeHTML_button( 'HuntingParty Done', '確認' ) );
		yield new Promise( resolve => Resolve['HuntingParty'] = resolve );
		$('.action_buttons .HuntingParty.Done').remove();  /* 完了ボタン消す */

		// 手札に加える
		Game.player().AddToHandCards( Game.GetCardByID( deck_top_card.card_ID ) );
		if ( revealed ) {
			Game.player().AddToHandCards( Game.GetCardByID( deck_top_card.card_ID ) );
			yield FBref_Players.child( pl.id ).set( pl );
		}

		/* 公開したカードを片づける */
		Game.player().Open.forEach( card => Game.player().AddToDiscardPile(card) );
		Game.player().Open = [];
		yield FBref_Players.child( Game.player().id ).set( Game.player() );
	}

	$('.action_buttons').on( 'click', '.HuntingParty.Done', () => Resolve['HuntingParty']() );




	/* 136. 村落 */
	CardEffect['Hamlet'] = function*() {
		yield FBref_Message.set( 'カード1枚を捨て札にすることができます。そうした場合、+1 アクション。<br>\
			カード1枚を捨て札にすることができます。そうした場合、+1 カードを購入。' );

		// カード1枚を捨て札にすることができます。そうした場合、+1 アクション。
		$('.HandCards').find('.card').addClass( 'Hamlet_Discard pointer' );
		$('.action_buttons').html( MakeHTML_button( 'Hamlet_Discard', '捨て札しない' ) );

		let discard = yield new Promise( resolve => Resolve['Hamlet_Discard'] = resolve );

		$('.action_buttons .Hamlet_Discard').remove();  // reset

		if ( discard ) {
			Game.TurnInfo.action++;
			yield FBref_Game.child('TurnInfo/action').set( Game.TurnInfo.action );
		}

		yield FBref_Message.set( 'カード1枚を捨て札にすることができます。そうした場合、+1 カードを購入。' );

		// カード1枚を捨て札にすることができます。そうした場合、+1 カードを購入。
		$('.HandCards').find('.card').addClass( 'Hamlet_Discard pointer' );
		$('.action_buttons').html( MakeHTML_button( 'Hamlet_Discard', '捨て札しない' ) );

		discard = yield new Promise( resolve => Resolve['Hamlet_Discard'] = resolve );

		$('.action_buttons .Hamlet_Discard').remove();  // reset

		if ( discard ) {
			Game.TurnInfo.buy++;
			yield FBref_Game.child('TurnInfo/buy').set( Game.TurnInfo.buy );
		}
	}

	$('.action_buttons').on( 'click', '.Hamlet_Discard', () => Resolve['Hamlet_Discard']( false ) );

	$('.HandCards').on( 'click', '.card.Hamlet_Discard', function() {
		const clicked_card_ID = $(this).attr('data-card_ID');

		Game.player().AddToDiscardPile( Game.GetCardByID( clicked_card_ID ) );  /* 捨てにする */

		FBref_Players.child( Game.player().id ).update( {
			HandCards   : Game.player().HandCards,
			DiscardPile : Game.player().DiscardPile,
		} )
		.then( () => Resolve['Hamlet_Discard'](true) );  // 再開
	} );





	/* 137. 道化師 */
	CardEffect['Jester'] = function*() {

	}





	/* 138. 農村 */
	CardEffect['Farming Village'] = function*() {
		yield FBref_Message.set( 'アクションカードか財宝カードが公開されるまでカードを公開し、そのカードを手札に加えます。\
			残りの公開したカードは捨て札にします。' );

		let deck_top_card;
		let revealed;
		while ( Game.player().Drawable() ) {
			revealed = true;
			deck_top_card = Game.player().GetDeckTopCard();
			Game.player().AddToOpen( deck_top_card );
			yield FBref_Players.child( Game.player().id ).set( Game.player() );
			if ( IsActionCard  ( Cardlist, deck_top_card.card_no ) ) break;
			if ( IsTreasureCard( Cardlist, deck_top_card.card_no ) ) break;
			revealed = false;
		}

		// 公開したカードを確認
		$('.action_buttons').append( MakeHTML_button( 'FarmingVillage Done', '確認' ) );
		yield new Promise( resolve => Resolve['FarmingVillage'] = resolve );
		$('.action_buttons .FarmingVillage.Done').remove();  /* 完了ボタン消す */

		// 手札に加える
		Game.player().AddToHandCards( Game.GetCardByID( deck_top_card.card_ID ) );
		if ( revealed ) {
			Game.player().AddToHandCards( Game.GetCardByID( deck_top_card.card_ID ) );
			yield FBref_Players.child( pl.id ).set( pl );
		}

		/* 公開したカードを片づける */
		Game.player().Open.forEach( card => Game.player().AddToDiscardPile(card) );
		Game.player().Open = [];
		yield FBref_Players.child( Game.player().id ).set( Game.player() );
	}

	$('.action_buttons').on( 'click', '.FarmingVillage.Done', () => Resolve['FarmingVillage']() );





	/* 139. 馬上槍試合 */
	CardEffect['Tournament'] = function*() {

	}





	/* 141. 豊穣の角笛 */
	CardEffect['Horn of Plenty'] = function*() {

	}





	/* 142. 魔女娘 */
	CardEffect['Young Witch'] = function*() {

	}





	/* 143. 名馬 */
	CardEffect['Trusty Steed'] = function*() {

	}





	/* 144. 郎党 */
	CardEffect['Followers'] = function*() {

	}








});
