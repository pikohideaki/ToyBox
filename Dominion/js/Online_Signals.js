



function SendSignal( player_id, signal ) {
	FBref_Room.child( `Signals/${player_id}` ).set( signal );
}


async function CatchSignal( signals_to_me ) {
	let Me = Game.Me();

	if ( signals_to_me == null ) return;


	/* received a signal from attacker */
	if ( signals_to_me.Attack ) {  /* アタックのとき */
		rc = Me.GetReactionCards();
		for ( let i = 0; i < rc.length; ++i ) {  /* リアクションカードが無いならスキップに */
			let card_name_eng = Cardlist[ rc[i].card_no ].name_eng;
			let card_name_jp = Cardlist[ rc[i].card_no ].name_jp;

			ShowDialog( {
				message  : `${card_name_jp}を公開しますか？`,
				contents : '',
				buttons  : 
					MakeHTML_button( `${card_name_eng} reveal`, '公開' ) +
					MakeHTML_button( `${card_name_eng}`       , '公開しない' ),
			} );

			reveal = yield;
			HideDialog();

			if ( reveal ) {
				rc[i].face = true;
				FBref_Room.child('chat').push( `${Me.name}が「${card_name_jp}」を公開しました。` );

				FBref_Players.child(`${myid}/HandCards`).set( Me.HandCards )
				.then( function() {
					switch ( card_name_eng ) {
						case 'Moat' :  /* 26. 堀 */
							EndAttackCardEffect();
							GenFuncs['CatchSignal'].return();  // アタック効果を飛ばして終了
							return;

						case 'Secret Chamber' : /* 55. 秘密の部屋 */
							FBref_Players.child(`${myid}/HandCards`).set( Me.HandCards )
							.then( function() {
								GenFuncs['Secret Chamber'] = ReactionEffect['Secret Chamber']();  /* generator 作成 */
								GenFuncs['Secret Chamber'].next();  /* generator開始 */
							} );
							return;

						default :
							break;
					}
				});
			}

		}
		const cardname = signals_to_me.card_name;
		switch ( cardname ) {
			case 'Witch'      :  /* 27. 魔女 */
			case 'Swindler'   :  /* 42. 詐欺師 */
			case 'Minion'     :  /* 45. 寵臣 */
				AttackEffect[cardname]();
				break;

			case 'Militia'    :  /* 29. 民兵 */
			case 'Bureaucrat' :  /* 31. 役人 */
			case 'Thief'      :  /* 24. 泥棒 */
			case 'Spy'        :  /* 28. 密偵 */

			case 'Torturer'   :  /* 41. 拷問人 */
			case 'Saboteur'   :  /* 53. 破壊工作員 */

				GenFuncs[ `AttackEffect_${cardname}` ] = AttackEffect[ cardname ]();  /* generator 作成 */
				GenFuncs[ `AttackEffect_${cardname}` ].next();  /* generator開始 */
				break;

			default : break;
		}
	}
}






$( function() {
	Initialize.then( function() {
		FBref_SignalToMe.on( 'value', function( FBsnapshot ) {
			GenFuncs['CatchSignal'] = CatchSignal( FBsnapshot.val() );  /* generator 作成 */
			GenFuncs['CatchSignal'].next();  /* generator開始 */
			// AsyncFuncs['CatchSignal']
		});
	});


	$('.dialog_buttons').on( 'click', '.reveal', function() {
		GenFuncs['CatchSignal'].next( $(this).hasClass('reveal') );
	});
});