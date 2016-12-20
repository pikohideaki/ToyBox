



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

	if ( signals_to_me.listen_reaction ) {
		// リアクションカードの効果
		const rc = Me.GetReactionCards();
		for ( let i = 0; i < rc.length; ++i ) {  /* リアクションカードが無いならスキップに */
			let card_name_eng = Cardlist[ rc[i].card_no ].name_eng;
			let card_name_jp  = Cardlist[ rc[i].card_no ].name_jp;

			ShowDialog( {
				message  : `${card_name_jp}を公開しますか？`,
				contents : '',
				buttons  : 
					MakeHTML_button( 'reaction reveal', '公開' ) +
					MakeHTML_button( 'reaction'       , '公開しない' ),
			} );

			const reveal = yield new Promise( function(resolve) { Resolve['reveal_reaction'] = resolve; });
			HideDialog();

			if ( reveal ) {
				FBref_Room.child('chat').push( `${Me.name}が「${card_name_jp}」を公開しました。` );
				rc[i].face = true;
				yield FBref_Players.child(`${myid}/HandCards`).set( Me.HandCards );
				yield MyAsync( GetReactionCardEffect( card_name_eng ) );
			}
		}
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
	});


	$('.dialog_buttons').on( 'click', '.reaction', function() {
		Resolve['reveal_reaction']( $(this).hasClass('reveal') );
	});
});
