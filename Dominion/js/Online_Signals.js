



function SendSignal( player_id, signal ) {
	FBref_Room.child( `Signals/${player_id}` ).set( signal );
}


function* CatchSignal( signals_to_me ) {
	let Me = Game.Me();

	if ( signals_to_me == null ) return;

	/* received a signal from attacker */

	if ( signals_to_me.listen_reaction ) {
		// リアクションカードの効果
		rc = Me.GetReactionCards();
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

			reveal = yield;
			HideDialog();

			if ( reveal ) {
				FBref_Room.child('chat').push( `${Me.name}が「${card_name_jp}」を公開しました。` );
				rc[i].face = true;
				FBref_Players.child(`${myid}/HandCards`).set( Me.HandCards )
				.then( () => GetReactionCardEffect( card_name_eng ) );
				yield;
			}
		}
	}

	if ( signals_to_me.Attack ) {  /* アタックのとき */
		GetAttackCardEffect( signals_to_me.card_name );
	}
}





$( function() {
	Initialize.then( function() {
		FBref_SignalToMe.on( 'value', function( FBsnapshot ) {
			GenFuncs['CatchSignal'] = CatchSignal( FBsnapshot.val() );  /* generator 作成 */
			GenFuncs['CatchSignal'].next();  /* generator開始 */
		});
	});


	$('.dialog_buttons').on( 'click', '.reaction', function() {
		GenFuncs['CatchSignal'].next( $(this).hasClass('reveal') );
	});
});
