

function SendSignal( player_id, signal ) {
	let updates = {};
	if ( signal.Message != undefined ) {
		updates[`MessageTo/${player_id}`] = signal.Message;
	}
	updates[`Signals/${player_id}`] = signal;
	return FBref_Room.update( updates );
}


function* CatchSignal( signals_to_me ) {
	if ( signals_to_me == null ) return;

	let Me = Game.Me();

	if ( signals_to_me.listen_reaction ) {  // リアクションカードの効果
		FBref_MessageToMe('リアクションカードを公開することができます。');
		while (true) {
			$reaction_cards = $('.MyHandCards .card')
				.filter( function() { return IsReactionCard( Cardlist, $(this).attr('data-card_no') ); } );

			if ( $reaction_cards.length <= 0 ) break;  // 手札にリアクションカードが0枚なら終了

			$reaction_cards.addClass('Reveal pointer');
			$('.MyArea .buttons').append( MakeHTML_button('end', '終了') );

			// リアクションカードか終了ボタンのクリック待ち
			const [clicked_card_ID, end]
				= yield new Promise( resolve => Resolve['SelectReactionCard'] = resolve );

			// 終了ボタンを押した場合 => 終了
			if (end) break;

			// リアクションカードを選択した場合

			// そのカードの公開と確認待ち
			yield FBref_SignalRevealReaction.set('waiting_for_confirmation');
			FBref_SignalRevealReaction.on( function(snap) {
				if ( snap.val() == 'confirmed' ) {
					Resolve['revealed_reaction_confirmed']();
				}
			});

			let clicked_card = Game.GetCardByID( clicked_card_ID, false );
			let card_name_jp = Cardlist[ clicked_card.card_no ].name_jp;
			clicked_card.face = true;  // そのカードを表向きに
			FBref_Room.child('chat').push( `${Me.name}が「${card_name_jp}」を公開しました。` );
			yield FBref_Players.child(`${myid}/HandCards`).set( Me.HandCards );
			yield new Promise( resolve => Resolve['revealed_reaction_confirmed'] = resolve );
			yield FBref_SignalRevealReaction.set('');  // reset

			// リアクション効果
			yield MyAsync( GetReactionCardEffect( clicked_card.card_no, clicked_card_ID ) );
		}

		yield Promise.all( [
			FBref_SignalToMe.remove(),
			FBref_MessageToMe.set(''),
			FBref_SignalReactionEnd.set(true)
		] );

		// const rc = Me.GetReactionCards();
		// for ( let i = 0; i < rc.length; ++i ) {  /* リアクションカードが無いならスキップに */

		// 	ShowDialog( {
		// 		message  : `${card_name_jp}を公開しますか？`,
		// 		contents : '',
		// 		buttons  : 
		// 			MakeHTML_button( 'reaction reveal', '公開' ) +
		// 			MakeHTML_button( 'reaction'       , '公開しない' ),
		// 	} );

		// 	const reveal = yield new Promise( function(resolve) { Resolve['reveal_reaction'] = resolve; });
		// 	HideDialog();

		// 	if ( reveal ) {
		// 		FBref_Room.child('chat').push( `${Me.name}が「${card_name_jp}」を公開しました。` );
		// 		rc[i].face = true;
		// 		yield FBref_Players.child(`${myid}/HandCards`).set( Me.HandCards );
		// 		yield MyAsync( GetReactionCardEffect( card_name_eng ) );
		// 	}
		// }
	}

	/* received a signal from attacker */
	if ( signals_to_me.Attack ) {  /* アタックのとき */
		yield MyAsync( GetAttackCardEffect( signals_to_me.card_name ) );
	}
}





$( function() {
	Initialize.then( function() {
		FBref_SignalToMe.on( 'value', function( FBsnapshot ) {
			MyAsync( CatchSignal( FBsnapshot.val() ) );
		});

		$('.MyHandCards').on( 'click', '.card.Reveal', function() {
			Resolve['SelectReactionCard']( $(this).attr('data-card_ID'), false );
		});

		$('.MyArea').on( 'click', '.buttons .end', function() {
			Resolve['SelectReactionCard']( 0, true );
		});

	});
});
