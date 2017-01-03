

$( function() {
	Initialize.then( function() {
		FBref_SignalToMe.on( 'value', function( FBsnapshot ) {
			MyAsync( CatchSignal, FBsnapshot.val() );
		});
	});
});





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

	if ( signals_to_me.listen_reaction ) {  // リアクションカードの効果
		yield MyAsync( Reaction );
	}

	/* received a signal from attacker */
	if ( signals_to_me.Attack ) {  /* アタックのとき */
		yield MyAsync( AttackEffect[ signals_to_me.card_name ] );
		yield Promise.all( [
			FBref_MessageToMe.set(''),
			FBref_SignalToMe.remove(),
			FBref_SignalAttackEnd.set(true)  // Endシグナルを送る
		] );
	}

	if ( signals_to_me.card_name == 'Masquerade' ) {
		yield MyAsync( CardEffect['Masquerade_SelectPassCard'] );
		yield FBref_SignalToMe.remove();
	}
}



function* Reaction() {
	$('.MyArea .buttons').append( MakeHTML_button('end_reaction', 'リアクション終了') );
	$end_reaction_btn = $('.MyArea .buttons .end_reaction');

	while (true) {
		yield FBref_MessageToMe.set('リアクションカードがあれば公開することができます。（手札を選択）');

		$reaction_cards = $('.MyHandCards .card')
			.filter( function() { return IsReactionCard( Cardlist, $(this).attr('data-card_no') ); } );

		$reaction_cards.addClass('Reveal pointer');
		$end_reaction_btn.show();

		// リアクションカードか終了ボタンのクリック待ち
		const [clicked_card_ID, end]
			= yield new Promise( resolve => Resolve['SelectReactionCard'] = resolve );

		$end_reaction_btn.hide();

		// 終了ボタンを押した場合 => 終了
		if (end) break;

		// リアクションカードを選択した場合
		// そのカードの公開
		let clicked_card = Game.GetCardByID( clicked_card_ID, false );
		let card_name_jp = Cardlist[ clicked_card.card_no ].name_jp;
		FBref_Room.child('chat').push( `${Game.Me().name}が「${card_name_jp}」を公開しました。` );
		clicked_card.face = true;  // カードを表向きに
		yield FBref_Players.child(`${myid}/HandCards`).set( Game.Me().HandCards );

		// 確認待ち
		ShowDialog( {
			message  : '公開したカードを他のプレイヤーが確認するのを待っています。',
			contents : MakeHTML_Card( clicked_card, Game ),
			buttons  : '',
		} );
		yield FBref_SignalRevealReaction.set('waiting_for_confirmation');
		FBref_SignalRevealReaction.on( 'value', function(snap) {
			if ( snap.val() == 'confirmed' ) {
				Resolve['revealed_reaction_confirmed']();
			}
		});

		yield new Promise( resolve => Resolve['revealed_reaction_confirmed'] = resolve );

		// 公開終了
		HideDialog();
		Game.Me().ResetFaceDown();  // 公開していたカードを裏向きに
		yield Promise.all( [
			FBref_Players.child(`${myid}/HandCards`).set( Game.Me().HandCards ),
			FBref_SignalRevealReaction.set('')  // reset
		]);

		// リアクション効果
		// yield FBref_MessageToMe.set('リアクションカードの効果を解決してください。');
		yield MyAsync( ReactionEffect[ Cardlist[ clicked_card.card_no ].name_eng ] );
	}

	// リアクション 終了処理
	$end_reaction_btn.remove();
	yield Promise.all( [
		FBref_MessageToMe.set(''),
		FBref_SignalToMe.remove(),
		FBref_SignalReactionEnd.set(true)
	] );
}


$( function() {
	Initialize.then( function() {
		$('.MyHandCards').on( 'click', '.card.Reveal', function() {
			Resolve['SelectReactionCard']( [ $(this).attr('data-card_ID'), false ] );
		});

		$('.MyArea').on( 'click', '.buttons .end_reaction', function() {
			Resolve['SelectReactionCard']( [0, true] );
		});
	})
});
