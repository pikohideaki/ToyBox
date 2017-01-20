
$( function() {
	// CardEffect['Menagerie']       = function*() {}  /* ok 127. 移動動物園 */
	// CardEffect['Horse Traders']   = function*() {}  /*    128. 馬商人 */
	// CardEffect['Fortune Teller']  = function*() {}  /* ok 129. 占い師 */
	// CardEffect['Diadem']          = function*() {}  /* ok 130. 王冠 */
	// CardEffect['Princess']        = function*() {}  /* ok 131. 王女 */
	// CardEffect['Bag of Gold']     = function*() {}  /* ok 132. 金貨袋 */
	// CardEffect['Remake']          = function*() {}  /* ok 133. 再建 */
	// CardEffect['Harvest']         = function*() {}  /* ok 134. 収穫 */
	// CardEffect['Hunting Party']   = function*() {}  /* ok 135. 狩猟団 */
	// CardEffect['Hamlet']          = function*() {}  /* ok 136. 村落 */
	// CardEffect['Jester']          = function*() {}  /* ok 137. 道化師 */
	// CardEffect['Farming Village'] = function*() {}  /* ok 138. 農村 */
	// CardEffect['Tournament']      = function*() {}  /* ok 139. 馬上槍試合 */
	   CardEffect['Fairgrounds']     = function*() {}  /* ok 140. 品評会 */
	// CardEffect['Horn of Plenty']  = function*() {}  /* ok 141. 豊穣の角笛 */
	// CardEffect['Young Witch']     = function*() {}  /* ok 142. 魔女娘 */
	// CardEffect['Trusty Steed']    = function*() {}  /* ok 143. 名馬 */
	// CardEffect['Followers']       = function*() {}  /* ok 144. 郎党 */


	/* 127. 移動動物園 */
	CardEffect['Menagerie'] = function*() {
		yield FBref_Message.set( '手札を公開します。もし重複しているカードが無ければ +3カード、そうでなければ +1カード。' );
		let pl = Game.player();

		// 手札を公開
		pl.HandCards.forEach( card => pl.AddToOpen( card ) );
		pl.HandCards = [];
		yield FBref_Players.child( pl.id ).set( pl );

		let exist_dupulicate
			= pl.Open.uniq( card => card.card_no ).length == pl.Open.length;

		// 公開したカードの確認
		$('.action_buttons').append( MakeHTML_button( 'Menagerie_ok', 'OK' ) );
		yield new Promise( resolve => Resolve['Menagerie_ok'] = resolve );
		$('.action_buttons .Menagerie_ok').remove();

		/* 公開したカードを手札に戻す */
		pl.Open.forEach( card => pl.AddToHandCards(card) );
		pl.Open = [];
		yield FBref_Players.child( pl.id ).set( pl );

		// もし重複しているカードが無ければ +3カード、そうでなければ +1カード。
		pl.DrawCards( (exist_dupulicate ? 3 : 1) );
		yield FBref_Players.child( pl.id ).set( pl );
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
		yield FBref_MessageToMe.set('このカードを脇に置き、 次のターンの最初に+1カードして脇に置いていたこのカードを手札に戻します。');
		Game.Me().SetAside( Game.GetCardByID( card_ID ) );
		// Game.Me().DrawCards(1);
		yield FBref_Players.child( myid ).set( Game.Me() );
	};





	/* 129. 占い師 */
	CardEffect['Fortune Teller'] = function*() {
		const msg = '勝利点カードか呪いが公開されるまでカードを公開し、そのカードを山札の一番上に置きます。残りの公開したカードは捨て札にします。';
		yield FBref_Message.set( msg );

		for ( let id = Game.NextPlayerID(); id != Game.whose_turn_id; id = Game.NextPlayerID(id) ) {
			if ( Game.TurnInfo.Revealed_Moat[id] ) continue;  // 堀を公開していたらスキップ

			yield FBref_MessageTo.child( id ).set( msg );

			let pl = Game.Players[id];

			let deck_top_card;
			let revealed;
			while ( pl.Drawable() ) {
				revealed = true;
				deck_top_card = pl.GetDeckTopCard();
				pl.AddToOpen( deck_top_card );
				yield FBref_Players.child( pl.id ).set( pl );
				if ( IsVictoryCard( Cardlist, deck_top_card.card_no ) ) break;
				if ( Cardlist[ deck_top_card.card_no ].name_eng == 'Curse' ) break;
				revealed = false;  // 1枚でも勝利点カードか呪いをめくったならtrueで終わる
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
				FBref_MessageTo.child( id ).set(''),
			] );
		}

		// 公開したカードを裏向きに戻す
		Game.Players.forEach( player => player.ResetFaceDown() );
		yield FBref_Players.set( Game.Players );
	}

	$('.OtherPlayers-wrapper').on( 'click', '.ok.FortuneTeller', () => Resolve['FortuneTeller_ok']() );  /* 確認 */




	/* 130. 王冠 */
	CardEffect['Diadem'] = function*() {
		yield FBref_Message.set('このカードを使うとき、あなたが使用しなかったアクション1毎に +1 Coin を得ます。');

		yield AcknowledgeButton_Me();

		Game.TurnInfo.coin += Game.TurnInfo.action;
		yield FBref_Game.child('TurnInfo').set( Game.TurnInfo );
	}





	/* 131. 王女 */
	CardEffect['Princess'] = function*() {
		yield FBref_Message.set( 'このカードが場に出ているかぎり、カードのコストは2コイン少なくなります（0コイン未満にはなりません）。' );
		yield AcknowledgeButton_Me();
	}





	/* 132. 金貨袋 */
	CardEffect['Bag of Gold'] = function*() {
		yield FBref_Message.set( '金貨1枚を獲得し、自分の山札の一番上に置きます。' );

		const gold = Game.Supply.byName('Gold').GetTopCard();
		if ( gold != undefined ) gold.face = true;
		Game.player().PutBackToDeck( gold );  /* 金貨を山札の一番上に獲得 */
		yield FBref_Game.update( {
			[`Players/${Game.player().id}/Deck`] : Game.player().Deck,
			Supply : Game.Supply,
		} );

		yield AcknowledgeButton_Me();  // 確認

		// 公開したカードを裏向きに戻す
		Game.player().ResetFaceDown();
		yield FBref_Players.child( `${Game.player().id}/Deck` ).set( Game.player().Deck );
	}





	/* 133. 再建 */
	CardEffect['Remake'] = function*() {

		for ( let i = 0; i < 2; ++i ) {
			yield FBref_Message.set( `手札から1枚廃棄し、そのカード+1コインのコストのカードを獲得します。（${i + 1}/2回目）` );

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
		yield FBref_Players.child( Game.player().id ).set( Game.player() );

		// 公開したカードの確認
		$('.action_buttons').append( MakeHTML_button( 'Harvest_ok', 'OK' ) );
		yield new Promise( resolve => Resolve['Harvest_ok'] = resolve );
		$('.action_buttons .Harvest_ok').remove();

		// 公開したカードのうち名前が異なるもの1枚につき +1コイン
		Game.TurnInfo.coin += Game.player().Open.uniq( card => card.card_no ).length;

		/* 公開したカードを片づける */
		Game.player().Open.forEach( card => Game.player().AddToDiscardPile(card) );
		Game.player().Open = [];

		yield Promise.all( [
			FBref_Players.child( Game.player().id ).set( Game.player() ),
			FBref_Game.child('TurnInfo/coin').set( Game.TurnInfo.coin ),
		]);
	}

	$('.action_buttons').on( 'click', '.Harvest_ok', () => Resolve['Harvest_ok']() );





	/* 135. 狩猟団 */
	CardEffect['Hunting Party'] = function*() {
		yield FBref_Message.set( '手札を公開します。\
			あなたの山札のカードを手札のカードと重複していないカードが公開されるまで公開します。\
			そのカードをあなたの手札に加え、他の公開したカードは捨て札にします。' );

		let pl = Game.player();

		// 手札を公開（Openは使うのでその場で）
		pl.HandCards.forEach( card => card.face = true );
		yield FBref_Players.child( `${pl.id}/HandCards` ).set( pl.HandCards );

		let deck_top_card;
		let revealed;
		while ( pl.Drawable() ) {
			revealed = true;
			deck_top_card = pl.GetDeckTopCard();
			pl.AddToOpen( deck_top_card );
			yield FBref_Players.child( pl.id ).set( pl );
			if ( !pl.HandCards.map( card => card.card_no ).val_exists( deck_top_card.card_no ) ) break;
			revealed = false;
		}

		// 公開したカードを確認
		$('.action_buttons').append( MakeHTML_button( 'HuntingParty Done', '確認' ) );
		yield new Promise( resolve => Resolve['HuntingParty'] = resolve );
		$('.action_buttons .HuntingParty.Done').remove();  /* 完了ボタン消す */

		// 手札に加える
		if ( revealed ) {
			pl.AddToHandCards( Game.GetCardByID( deck_top_card.card_ID ) );
			yield FBref_Players.child( pl.id ).set( pl );
		}

		/* 公開したカードを片づける（厳密には捨て札にする順番は手動） */
		pl.Open.forEach( card => pl.AddToDiscardPile(card) );
		pl.Open = [];
		pl.ResetFaceDown();  // 裏に戻す
		yield FBref_Players.child( pl.id ).set( Game.player() );
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
		const msg = '山札の一番上のカードを捨て札にします。\
			そのカードが勝利点カードの場合、そのプレイヤーは呪いカード1枚を獲得します。\
			勝利点以外のカードの場合、捨て札にしたカードと同じカードをそのプレイヤーが獲得するか、あなたが獲得するかをあなたが選びます。';

		yield FBref_Message.set( `他のプレイヤーは全員、自分の${msg}` );

		for ( let id = Game.NextPlayerID(); id != Game.whose_turn_id; id = Game.NextPlayerID(id) ) {
			if ( Game.TurnInfo.Revealed_Moat[id] ) continue;  // 堀を公開していたらスキップ
			yield FBref_MessageTo.child( id ).set( msg );

			let pl = Game.Players[id];

			// 山札の一番上のカードを公開
			const DeckTopCard = pl.GetDeckTopCard();
			pl.AddToOpen( DeckTopCard );
			yield FBref_Players.child( id ).set( pl );

			if ( IsVictoryCard( Cardlist, DeckTopCard.card_no ) ) {
				// 勝利点カードの場合、そのプレイヤーは呪いカード1枚を獲得
				yield FBref_MessageTo.child( id ).set( '呪いを獲得します。' );

				// 確認
				$(`.OtherPlayer[data-player_id=${id}] .OtherPlayer_Buttons`)
					.append( MakeHTML_button( 'Jester_GetCurse', '呪いを獲得させる' ) );
				yield new Promise( resolve => Resolve['Jester_GetCurse'] = resolve );
				$(`.OtherPlayer[data-player_id=${id}] .OtherPlayer_Buttons .Jester_GetCurse`).remove();

				// 公開したカードを捨て札に
				pl.AddToDiscardPile( Game.GetCardByID( DeckTopCard.card_ID ) );
				yield FBref_Players.child( id ).set( pl );

				// 呪いを獲得
				pl.AddToDiscardPile( Game.Supply.byName('Curse').GetTopCard() );
			} else {
				// 勝利点以外のカードの場合、
				// 捨て札にしたカードと同じカードをそのプレイヤーが獲得するか、あなたが獲得するかをあなたが選びます。
				ShowDialog( {
					message  : `「${Cardlist[ DeckTopCard.card_no ].name_jp}」を捨て札にしました。このカードを`,
					contents : MakeHTML_Card( DeckTopCard, Game ),
					buttons  : MakeHTML_button( 'me',  '自分が獲得' )
					         + MakeHTML_button( 'you', `${pl.name}が獲得` ),
				} );
				const who_get_card = yield new Promise( resolve => Resolve['Thief_GainTrashedCard'] = resolve );
				HideDialog();

				// 公開したカードを捨て札に
				pl.AddToDiscardPile( Game.GetCardByID( DeckTopCard.card_ID ) );
				yield FBref_Players.child( id ).set( pl );

				// 同じ名前のカード獲得
				const the_same_card = Game.Supply.byName( Cardlist[ DeckTopCard.card_no ].name_eng ).GetTopCard();
				if ( who_get_card == 'me'  ) Game.player().AddToDiscardPile( the_same_card );
				if ( who_get_card == 'you' )            pl.AddToDiscardPile( the_same_card );
			}

			yield FBref_Room.update( {
				'Game/Supply' : Game.Supply,
				'Game/Players' : Game.Players,
				[`MessageTo/${id}`] : '',
			} );
		}
	};

	$('.OtherPlayers-wrapper' ).on( 'click', '.Jester_GetCurse', () => Resolve['Jester_GetCurse']() );  /* 確認 */

	$('.dialog_buttons').on( 'click', '.me',  () => Resolve['Thief_GainTrashedCard']('me')  );  // 再開
	$('.dialog_buttons').on( 'click', '.you', () => Resolve['Thief_GainTrashedCard']('you') );  // 再開







	/* 138. 農村 */
	CardEffect['Farming Village'] = function*() {
		yield FBref_Message.set( 'アクションカードか財宝カードが公開されるまでカードを公開し、そのカードを手札に加えます。\
			残りの公開したカードは捨て札にします。' );

		let pl = Game.player();

		let deck_top_card;
		let revealed;
		while ( pl.Drawable() ) {
			revealed = true;
			deck_top_card = pl.GetDeckTopCard();
			pl.AddToOpen( deck_top_card );
			yield FBref_Players.child( pl.id ).set( pl );
			if ( IsActionCard  ( Cardlist, deck_top_card.card_no ) ) break;
			if ( IsTreasureCard( Cardlist, deck_top_card.card_no ) ) break;
			revealed = false;
		}

		// 公開したカードを確認
		$('.action_buttons').append( MakeHTML_button( 'FarmingVillage Done', '確認' ) );
		yield new Promise( resolve => Resolve['FarmingVillage'] = resolve );
		$('.action_buttons .FarmingVillage.Done').remove();  /* 完了ボタン消す */

		// 手札に加える
		if ( revealed ) {
			pl.AddToHandCards( Game.GetCardByID( deck_top_card.card_ID ) );
			yield FBref_Players.child( pl.id ).set( pl );
		}

		/* 公開したカードを片づける */
		pl.Open.forEach( card => pl.AddToDiscardPile(card) );
		pl.Open = [];
		yield FBref_Players.child( pl.id ).set( pl );
	}

	$('.action_buttons').on( 'click', '.FarmingVillage.Done', () => Resolve['FarmingVillage']() );





	/* 139. 馬上槍試合 */
	CardEffect['Tournament'] = function*() {
		yield FBref_Message.set( '\
			すべてのプレイヤーは、自分の手札から属州1枚を公開することができます。<br>\
			あなたがそうした場合、そのカードを捨て札にし、\
			褒賞カード1枚（褒賞の山札から）または公領1枚を獲得し、\
			それをあなたの山札の一番上に置きます。<br>\
			他のプレイヤーが誰も公開しなかった場合、+1 Card, +1 Coin を得ます。 ');

		// 自分を含め全員にシグナル送信
		for ( let id = 0; id < Game.Players.length; ++id ) {
			yield SendSignal( id, {
				Attack    : false,
				card_name : 'Tournament',
				Message   : '各プレイヤーは、自分の手札から属州を公開することができます。',
			} );
		}

		// 集計
		let Tournament_Revealed_card_IDs = [];
		let done_num = 0;

		FBref_Signal.child('Tournament_gather').on( 'value', function( FBsnapshot ) {
			const passed_val = FBsnapshot.val();
			if ( passed_val == null ) return;

			// 全員分揃ったら次に
			if ( ++done_num == Game.Players.length ) {
				Tournament_Revealed_card_IDs = passed_val;
				Resolve['Tournament_gather']();
			}
		} );
		yield new Promise( resolve => Resolve['Tournament_gather'] = resolve );
		FBref_Signal.child('Tournament_gather').off();  // 監視終了
		FBref_Signal.child('Tournament_gather').remove();

		yield FBref_Message.set( '公開されたカードを確認してください。' );

		// 公開したカードの確認
		$('.action_buttons').append( MakeHTML_button( 'Tournament_RevealProvince_ok', 'OK' ) );
		yield new Promise( resolve => Resolve['Tournament_RevealProvince_ok'] = resolve );
		$('.action_buttons .Tournament_RevealProvince_ok').remove();

		// 他のプレイヤーの公開したカードを戻す
		for ( let id = 0; id < Game.Players.length; ++id ) {
			if ( Tournament_Revealed_card_IDs[id] == 99999999 ) continue;
			if ( id == Game.player().id ) continue; // 自分は飛ばす
			Game.Players[id].AddToHandCards( Game.GetCardByID( Tournament_Revealed_card_IDs[id] ) );
		}
		yield FBref_Players.set( Game.Players );


		// 自分が属州を公開したとき
		if ( Tournament_Revealed_card_IDs[ Game.player().id ] != 99999999 ) {
			FBref_chat.push( `${Game.player().name}が属州を公開しました。` );
			yield FBref_Message.set( '褒賞カードまたは公領を獲得してください。' );

			// 公開した属州を捨て札に
			const MyProvince_card_ID = Tournament_Revealed_card_IDs[ Game.player().id ];
			Game.player().AddToDiscardPile( Game.GetCardByID( MyProvince_card_ID ) );
			yield FBref_Players.child( Game.player().id ).set( Game.player() );

			// 褒賞または公領を獲得し山札の一番上に置く

			/* サプライと褒賞カードのクラス書き換え */
			$('.SupplyArea').find('.card')
				.filter( function() { return $(this).attr('data-card_num_of_remaining') > 0; } )
				.filter( function() { return $(this).attr('data-card_no') == CardName2No['Duchy'] } )
				.addClass('Tournament_GetCard available pointer');

			$('.Prize').find('.card')
				.filter( function() { return $(this).attr('data-card_num_of_remaining') > 0; } )
				.addClass('Tournament_GetCard available pointer');

			if ( $('.SupplyArea-wrapper').find('.available').length <= 0 ) {
				yield MyAlert( { message : '獲得できるカードがありません' } );
			} else {
				yield new Promise( resolve => Resolve['Tournament_GetCard'] = resolve );

				// 獲得したカードの確認
				$('.action_buttons').append( MakeHTML_button( 'Tournament_GetCard_ok', 'OK' ) );
				yield new Promise( resolve => Resolve['Tournament_GetCard_ok'] = resolve );
				$('.action_buttons .Tournament_GetCard_ok').remove();

				// 裏向きに
				Game.player().ResetFaceDown();
				yield FBref_Players.child( Game.player().id ).set( Game.player() );
			}
		}


		// 他のプレイヤーが誰も属州を公開していないとき
		if ( Tournament_Revealed_card_IDs
				.filter( (val, index) => index != Game.Me().id )
				.every( val => val == 99999999 ) )
		{
			// +1 Card, +1 Coin
			// yield FBref_Message.set(
				// '他のプレイヤーが誰も属州を公開していないので、 +1 Card, +1 Coin を得ます。' );
			Game.TurnInfo.coin += 1;
			Game.player().DrawCards(1);
			yield FBref_Game.update( {
				'TurnInfo/coin' : Game.TurnInfo.coin,
				[`Players/${Game.player().id}`] : Game.player(),
			});
		}
	}

	// 自分と他のプレイヤー
	CardEffect['Tournament_RevealProivince'] = function* () {
		// 属州を公開できる
		$('.HandCards,.MyHandCards').children('.card')
			.filter( function() { return $(this).attr('data-card_no') == CardName2No['Province'] } )
			.addClass('Tournament_RevealProivince pointer');

		// 公開したかどうか
		$('.action_buttons')
			.append( MakeHTML_button('dont_reveal_province', '公開しない' ) );
		$('.MyArea .buttons' )
			.append( MakeHTML_button('dont_reveal_province', '公開しない' ) );
		const revealed_card_ID
		  = yield new Promise( resolve => Resolve['Tournament_RevealProivince'] = resolve );
		$('.action_buttons  .dont_reveal_province').remove();
		$('.MyArea .buttons .dont_reveal_province').remove();

		if ( revealed_card_ID == 99999999 ) {
			FBref_chat.push( `${Game.Me().name}は属州を公開しませんでした。` );
		} else {
			FBref_chat.push( `${Game.Me().name}は属州を公開しました。` );
		}

		// reset
		FBref_SignalToMe.remove();
		FBref_MessageToMe.set('');

		// カードidを送る
		yield FBref_Signal.child(`Tournament_gather/${Game.Me().id}`).set( revealed_card_ID );
	}

	// 自分と他のプレイヤー
	$('.HandCards,.MyHandCards').on( 'click', '.card.Tournament_RevealProivince', function() {
		const clicked_card_ID = $(this).attr('data-card_ID');
		Game.Me().AddToOpen( Game.GetCardByID( clicked_card_ID ) );
		FBref_Players.child( `${Game.Me().id}` ).set( Game.Me() )
		.then( () => Resolve['Tournament_RevealProivince']( clicked_card_ID ) );
	} );

	// 自分と他のプレイヤー
	$('.action_buttons,.MyArea .buttons').on( 'click', '.dont_reveal_province',
		() => Resolve['Tournament_RevealProivince']( 99999999 ) );

	// 自分
	$('.SupplyArea,.Prize').on( 'click', '.card.Tournament_GetCard', function() {
		let $this = $(this);
		MyAsync( function*() {
			if ( !$this.hasClass('available') ) {
				yield MyAlert( { message : '獲得できません。' } );
				return;
			}

			const clicked_card_name_eng = $this.attr('data-card-name-eng');
			const clicked_card = Game.Supply.byName(clicked_card_name_eng).LookTopCard();
			const clicked_card_ID = clicked_card.card_ID;

			const gotten_card = Game.GetCardByID( clicked_card_ID );
			FBref_chat.push(
				`${Game.player().name}が${Cardlist[ gotten_card.card_no ].name_jp}を獲得しました。` );

			gotten_card.face = true;
			Game.player().PutBackToDeck( gotten_card );

			let updates = {};
			updates[`Players/${Game.player().id}/Deck`] = Game.player().Deck;
			updates['Supply'] = Game.Supply;
			yield FBref_Game.update( updates )
			Resolve['Tournament_GetCard']();
		});
	} );

	// 自分
	$('.action_buttons').on( 'click', '.Tournament_RevealProvince_ok',
		() => Resolve['Tournament_RevealProvince_ok']() );
	$('.action_buttons').on( 'click', '.Tournament_GetCard_ok',
		() => Resolve['Tournament_GetCard_ok']() );





	/* 141. 豊穣の角笛 */
	CardEffect['Horn of Plenty'] = function*( this_card_ID ) {
		// 場に出ているカードの種類数分のコイン
		const max_cost_coin = Game.player().PlayArea.uniq( card => card.card_no ).length;

		yield FBref_Message.set( `このカードを含めて場に出ているカードの種類数分のコイン(=${max_cost_coin})以下のコストのカードを1枚獲得します。\
			もし勝利点カードを獲得したならばこのカードを廃棄します。` );

		/* サプライのクラス書き換え */
		$('.SupplyArea').find('.card').addClass('HornOfPlenty_GetCard pointer');

		AddAvailableToSupplyCardIf( ( card, card_no ) =>
			CostOp( '<=', Game.GetCost( card_no ), new CCost( [max_cost_coin,0,0] ) ) );

		if ( $('.SupplyArea').find('.available').length <= 0 ) {
			yield MyAlert( { message : '獲得できるカードがありません' } );
			return;
		}

		const gained_victory
			= yield new Promise( resolve => Resolve['HornOfPlenty_GetCard'] = resolve );

		if ( gained_victory ) {
			// もし勝利点カードを獲得したならばこのカードを廃棄
			Game.TrashCardByID( this_card_ID );
			yield FBref_Game.update( {
				TrashPile : Game.TrashPile,
				[`Players/${Game.player().id}`] : Game.player(),
			} );
		}
	}


	$('.SupplyArea').on( 'click', '.card.HornOfPlenty_GetCard', function() {
		let $this = $(this);
		MyAsync( function*() {
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
			yield FBref_Game.update( updates )
			Resolve['HornOfPlenty_GetCard']( IsVictoryCard( Cardlist, clicked_card.card_no ) );
		});
	} );





	/* 142. 魔女娘 */
	CardEffect['Young Witch'] = function*() {

		// 手札から2枚捨て札に
		yield FBref_Message.set('カード2枚を捨て札にしてください。');
		let discarded_num = 0;
		while ( discarded_num < 2 && $('.HandCards').children('.card').length > 0 ) {
			$('.HandCards').children('.card').addClass('YoungWitch_Discard pointer');
			yield new Promise( resolve => Resolve['YoungWitch_Discard'] = resolve );
			discarded_num++;
		}

		yield FBref_Message.set('他のプレイヤーは全員、災いカードを公開することができます。\
			公開しなかった他のプレイヤーは、呪いカード1枚を獲得します。');

		// 災いカードの公開を待つ
		let Monitor_FBref_SignalBaneCardEnd_on = function () {
			return FBref_SignalBaneCardEnd.set(false)  /* reset */
				.then( function() {
				FBref_SignalBaneCardEnd.on( 'value', function(snap) {
					if ( snap.val() ) Resolve['BaneCardEnd']();
				} )
			} );
		}


		yield FBref_Message.set( '災いカードを公開するプレイヤーがいないか待っています。' );
		for ( let id = Game.NextPlayerID(); id != Game.whose_turn_id; id = Game.NextPlayerID(id) ) {

			const has_banecard
			 = Game.Players[id].HandCards
				.map( x => x.card_no )
				.val_exists( Game.Supply.BaneCard.card_no );

			// Player[id] がリアクションスキップオプションがオンで手札に災いカードがない場合
			if ( Game.Settings.SkipReaction[id] && !has_banecard ) continue;

			/* 災いカードを公開するかどうかは毎回決めてよい */
			yield FBref_Game.child(`TurnInfo/Revealed_BaneCard/${id}`).set(false);  /* reset */
			yield SendSignal( id, { listen_banecard : true } );
			yield Monitor_FBref_SignalBaneCardEnd_on();
			yield FBref_SignalRevealBaneCard.set(false);  /* reset */
			FBref_SignalRevealBaneCard.on( 'value', function(snap) {
				if ( snap.val() == 'waiting_for_confirmation' ) {
					MyAsync( function*() {
						Show_OKbtn_OtherPlayer( id, 'waiting_for_confirmation_banecard' );
						yield new Promise( resolve => Resolve['confirm_revealed_banecard'] = resolve );
						Hide_OKbtn_OtherPlayer( id, 'waiting_for_confirmation_banecard' );
						yield FBref_SignalRevealBaneCard.set('confirmed');
					} );
				}
			} );
			yield new Promise( resolve => Resolve['BaneCardEnd'] = resolve );

			FBref_SignalBaneCardEnd.off();
			FBref_SignalRevealBaneCard.off();
		}


		// 他のプレイヤーは全員、呪いカード1枚を獲得します
		for ( let id = Game.NextPlayerID(); id != Game.whose_turn_id; id = Game.NextPlayerID(id) ) {
			if ( Game.TurnInfo.Revealed_Moat[id] ) continue;  // 堀を公開していたらスキップ
			if ( Game.TurnInfo.Revealed_BaneCard[id] ) continue;  // 災いカードを公開していたらスキップ

			// 呪いを獲得
			yield FBref_MessageTo.child(id).set('呪いを獲得します。');
			yield Game.GainCard( 'Curse', 'DiscardPile', id );
			yield FBref_MessageTo.child(id).set('');
		}
	}

	$('.HandCards').on( 'click', '.card.YoungWitch_Discard', function() {
		const clicked_card_ID = $(this).attr('data-card_ID');

		Game.player().AddToDiscardPile( Game.GetCardByID( clicked_card_ID ) );

		FBref_Players.child( Game.player().id ).update( {
			HandCards   : Game.player().HandCards,
			DiscardPile : Game.player().DiscardPile,
		} )
		.then( () => Resolve['YoungWitch_Discard']() );  // 再開
	} );

	$('.OtherPlayers-wrapper').on( 'click',
		'.OtherPlayer_Buttons .ok.waiting_for_confirmation_banecard',
		() => Resolve['confirm_revealed_banecard']()
	);





	/* 143. 名馬 */
	CardEffect['Trusty Steed'] = function*() {
		yield FBref_Message.set( '次のうち異なる二つを選んでください。<br>\
			 - +2 Card<br>\
			 - +2 Action<br>\
			 - +2 Coin<br>\
			 - 銀貨を4枚獲得し山札を捨て札に置く<br>' );

		$('.action_buttons')
			.append( MakeHTML_button( 'TrustySteed 2Card'   , '+2 Card'   ) )
			.append( MakeHTML_button( 'TrustySteed 2Action' , '+2 Action' ) )
			.append( MakeHTML_button( 'TrustySteed 2Coin'   , '+2 Coin'   ) )
			.append( MakeHTML_button( 'TrustySteed 4silvers', '銀貨を4枚獲得し山札を捨て札に置く' ) );
		let first  = yield new Promise( resolve => Resolve['TrustySteed'] = resolve );
		let second = yield new Promise( resolve => Resolve['TrustySteed'] = resolve );
		$('.action_buttons .TrustySteed').remove();

		let updates = {};

		function* select_effect( btn_val ) {
			switch ( btn_val ) {
				case 1 : // 2Card
					Game.player().DrawCards(2);
					updates[`Players/${Game.player().id}`] = Game.player();
					break;

				case 2 : // 2Action
					Game.TurnInfo.action += 2;
					updates['TurnInfo/action'] = Game.TurnInfo.action;
					break;

				case 3 : // 2Coin
					Game.TurnInfo.coin += 2;
					updates['TurnInfo/coin']   = Game.TurnInfo.coin;
					break;

				case 4 : // 4silvers
					for ( let i = 0; i < 4; ++i ) {
						yield Game.GainCard( 'Silver' );
					}
					yield Game.player().PutDeckIntoDiscardPile();
					break;
			}
		}

		// 2Card -> 2Action -> 2Coin -> 4silvers の順に解決
		[first, second] = [first,second].sort();
		console.log( first );
		console.log( second );
		yield MyAsync( select_effect, first );
		yield MyAsync( select_effect, second );

		yield FBref_Game.update( updates );
	};

	$('.action_buttons').on( 'click', '.TrustySteed', function() {
		if ( $(this).hasClass('selected') ) return;  // 選択済みなら反応しない
		$(this).addClass('selected').attr('disabled', 'disabled');  // 使用したボタンを無効化
		if ( $(this).hasClass('2Card'   ) ) Resolve['TrustySteed'](1);  // 再開
		if ( $(this).hasClass('2Action' ) ) Resolve['TrustySteed'](2);  // 再開
		if ( $(this).hasClass('2Coin'   ) ) Resolve['TrustySteed'](3);  // 再開
		if ( $(this).hasClass('4silvers') ) Resolve['TrustySteed'](4);  // 再開
	} );





	/* 144. 郎党 */
	CardEffect['Followers'] = function*() {
		yield FBref_Message.set(
			'屋敷1枚を獲得します。\
			他のプレイヤーは全員、呪いカード1枚を獲得し、自分の手札が3枚になるように捨て札をしてください。' );

		// 屋敷を獲得
		yield Game.GainCard( 'Estate' );


		// 他のプレイヤーは全員、呪いカード1枚を獲得し、自分の手札が3枚になるように捨て札をする
		for ( let id = Game.NextPlayerID(); id != Game.whose_turn_id; id = Game.NextPlayerID(id) ) {
			if ( Game.TurnInfo.Revealed_Moat[id] ) continue;  // 堀を公開していたらスキップ

			// 呪いを獲得
			yield FBref_MessageTo.child(id).set('呪いを獲得します。');
			yield Game.GainCard( 'Curse', 'DiscardPile', id );

			// 手札が3枚になるまで捨てる（民兵の関数を転用）
			yield Monitor_FBref_SignalAttackEnd_on( 'Followers' );  // End受信 -> Resolve['Followers']()
			yield SendSignal( id, {
				Attack    : true,
				card_name : 'Militia',
				Message   : '手札が3枚になるまで捨てて下さい。',
			} );
			yield new Promise( resolve => Resolve['Followers'] = resolve );  /* 他のプレイヤー待機 */
			Monitor_FBref_SignalAttackEnd_off();  /* 監視終了 */
		}
	}








});
