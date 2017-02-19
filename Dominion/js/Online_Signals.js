

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
		yield MyAsync( Reaction, signals_to_me );
	}

	if ( signals_to_me.listen_banecard ) {  // 災いカードの公開を確認
		yield MyAsync( Reveal_BaneCard );
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
		yield Promise.all( [
			FBref_SignalToMe.remove(),
			FBref_MessageToMe.set(''),
		] );
	}

	if ( signals_to_me.card_name == 'Tournament' ) {
		yield MyAsync( CardEffect['Tournament_RevealProivince'] );
		yield Promise.all( [
			FBref_SignalToMe.remove(),
			FBref_MessageToMe.set(''),
		] );
	}

}



function* Reaction( signals_to_me ) {
	$('.MyAreaButtons').append( MakeHTML_button('end_reaction', 'リアクション終了') );
	$end_reaction_btn = $('.MyAreaButtons .end_reaction');

	while (true) {
		yield FBref_MessageToMe.set('リアクションカードがあれば公開することができます。（手札を選択）');

		// リアクションカードをクリック可能に
		$('.MyHandCards .card')
			.filter( function() { return IsReactionCard( Cardlist, Number( $(this).attr('data-card_no') ) ); } )
			.addClass('Reveal_ReactionCard pointer');

		// リアクションカードか終了ボタンのクリック待ち
		$end_reaction_btn.show();
		const [clicked_card_ID, end]
			= yield new Promise( resolve => Resolve['SelectReactionCard'] = resolve );
		$end_reaction_btn.hide();

		// 終了ボタンを押した場合 => 終了
		if (end) break;

		// リアクションカードを選択した場合
		// そのカードの公開
		let clicked_card = Game.LookCardWithID( clicked_card_ID );
		let card_name_jp = Cardlist[ clicked_card.card_no ].name_jp;
		FBref_chat.push( `${Game.Me().name}が「${card_name_jp}」を公開しました。` );
		yield Promise.all( [
			Game.FaceUpCard( clicked_card_ID ),  // カードを表向きに
			FBref_Players.child(`${myid}/HandCards`).set( Game.Me().HandCards ),
		]);

		// 確認待ち
		const ref = {};
		yield FBref_SignalRevealReaction.set('waiting_for_confirmation');
		FBref_SignalRevealReaction.on( 'value', function(snap) {
			if ( snap.val() == 'confirmed' ) ref.close_dialog();
		});

		yield MyDialog( {
				message  : '公開したカードの確認を待っています。',
				contents : MakeHTML_Card( clicked_card, Game ),
				buttons  : [],
			}, ref );

		// 公開終了
		yield Game.ResetFace();  // 公開していたカードを裏向きに
		yield Promise.all( [
			FBref_Players.child(`${myid}/HandCards`).set( Game.Me().HandCards ),
			FBref_SignalRevealReaction.set(''),  // reset
			Game.ResetStackedCardIDs(),
		]);

		// リアクション効果
		// yield FBref_MessageToMe.set('リアクションカードの効果を解決してください。');
		yield MyAsync( ReactionEffect[ Cardlist[ clicked_card.card_no ].name_eng ],
				clicked_card.card_no, clicked_card_ID );
	}

	// リアクション 終了処理
	$end_reaction_btn.remove();
	yield Promise.all( [
		FBref_MessageToMe.set(''),
		FBref_SignalToMe.remove(),
		FBref_SignalReactionEnd.set(true)
	] );
}




function* Reveal_BaneCard( signals_to_me ) {
	$('.MyAreaButtons').append( MakeHTML_button('end_banecard', '災いカードの公開終了') );
	$end_banecard_btn = $('.MyAreaButtons .end_banecard');

	while (true) {
		yield FBref_MessageToMe.set('災いカードがあれば公開することができます。（手札を選択）');

		// 災いカードをクリック可能に
		$('.MyHandCards .card')
			.filter( function() { return Number( $(this).attr('data-card_no') ) == Game.Supply.BaneCard.card_no; } )
			.addClass('Reveal_BaneCard pointer');

		// 災いカードか終了ボタンのクリック待ち
		$end_banecard_btn.show();
		const [clicked_card_ID, end]
			= yield new Promise( resolve => Resolve['SelectBaneCard'] = resolve );
		$end_banecard_btn.hide();

		// 終了ボタンを押した場合 => 終了
		if (end) break;

		// 災いカードカードを選択した場合
		// そのカードの公開
		let clicked_card = Game.LookCardWithID( clicked_card_ID );
		let card_name_jp = Cardlist[ clicked_card.card_no ].name_jp;
		FBref_chat.push( `${Game.Me().name}が災いカード（「${card_name_jp}」）を公開しました。` );
		yield Promise.all( [
			Game.FaceUpCard( clicked_card_ID ),  // カードを表向きに
			FBref_Players.child(`${myid}/HandCards`).set( Game.Me().HandCards ),
		]);

		// 確認待ち
		const ref = {};
		yield FBref_SignalRevealBaneCard.set('waiting_for_confirmation');
		FBref_SignalRevealBaneCard.on( 'value', function(snap) {
			if ( snap.val() == 'confirmed' ) ref.close_dialog();
		});

		yield MyDialog( {
				message  : '公開したカードの確認を待っています。',
				contents : MakeHTML_Card( clicked_card, Game ),
				buttons  : [],
			}, ref );

		// 公開終了
		yield Game.ResetFace();  // 公開していたカードを裏向きに
		yield Promise.all( [
			FBref_Players.child(`${myid}/HandCards`).set( Game.Me().HandCards ),
			FBref_SignalRevealBaneCard.set(''),  // reset
			Game.ResetStackedCardIDs(),
		]);

		yield FBref_Game.child(`TurnInfo/Revealed_BaneCard/${myid}`).set(true);
	}

	// 災いカード 終了処理
	$end_banecard_btn.remove();
	yield Promise.all( [
		FBref_MessageToMe.set(''),
		FBref_SignalToMe.remove(),
		FBref_SignalBaneCardEnd.set(true)
	] );
}



$( function() {
	Initialize.then( function() {
		// リアクションカード
		$('.MyHandCards').on( 'click', '.card.Reveal_ReactionCard', function() {
			Resolve['SelectReactionCard']( [ Number( $(this).attr('data-card_ID') ), false ] );
		});

		$('.MyArea').on( 'click', '.MyAreaButtons .end_reaction', function() {
			Resolve['SelectReactionCard']( [0, true] );
		});

		// 災いカード
		$('.MyHandCards').on( 'click', '.card.Reveal_BaneCard', function() {
			Resolve['SelectBaneCard']( [ Number( $(this).attr('data-card_ID') ), false ] );
		});

		$('.MyArea').on( 'click', '.MyAreaButtons .end_banecard', function() {
			Resolve['SelectBaneCard']( [0, true] );
		});
	})
});
