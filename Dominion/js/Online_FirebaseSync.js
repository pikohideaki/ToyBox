$( function() {


/* firebase */


/* 初期設定（1回呼び出し） */
Initialize = FBref_Room.once('value').then( function( FBsnapshot ) {
	console.log( myid, myname );

	let Room = FBsnapshot.val();
	RoomInfo = Room.RoomInfo;   // set global object 
	Game = new CGame( Room.Game );

	// make OtherPlayers wrapper
	$('.OtherPlayers-wrapper').html('');
	for ( let id = 0; id < Game.Players.length; ++id ) {
		// if ( id == myid ) continue;
		$('.OtherPlayers-wrapper').append( MakeHTML_OtherPlayerDiv( id ) );
	}
	$( '.OtherPlayer_Buttons .ok' ).hide();

	// make CardView
	$CardViewlist = $('.CardView_list');
	

	let AllCardNo = Game.GetAllCards().map( a => a.card_no ).uniq().sortNumeric().remove_val(0);
	AllCardNo.forEach( (card_no) => $CardViewlist.append( MakeHTML_CardBiggest( card_no ) ) );
	$('.CardView_zoom .card_biggest').attr('data-card_no', AllCardNo[0] );  // 初期値
});



Initialize.then( function() {  /* 初期設定終わったら */

	// 通信状態の表示
	FBref_connected.on('value', function(snap) {
		if ( snap.val() === true ) {
			$('.connection-dialog-wrapper').fadeOut();
			FBref_Players.child( `${myid}/Connection` ).set(true);
			FBref_Players.child( `${myid}/Connection` ).onDisconnect().set(false)
			// .then( FBref_Room.child('chat').push( `${Game.Players[myid]name}が再接続中です…。` ) );
		} else {
			$('.connection-dialog-wrapper').fadeIn();
		}
	});

	// その他共有する設定
	FBref_Settings.on('value', snap => Game.Settings = snap.val() );



	// $('.text_disconnect').click( () => FBdatabase.goOffline() );
	// $('.text_connect'   ).click( () => FBdatabase.goOnline()  );

	/* 誰のターンか */
	FBref_Game.child(`whose_turn_id`).on('value', function( FBsnapshot ) {
		Game.whose_turn_id = Number( FBsnapshot.val() );

		if ( Game.whose_turn_id === myid ) {  /* 自分の手番のとき以外はグレーに */
			$('.MyArea-wrapper').fadeOut();
		} else {
			$('.MyArea-wrapper').fadeIn();
		}

		for ( let player_id = 0; player_id < Game.Players.length; ++player_id ) {
			PrintPlayersCardAreas( player_id );
		}

		// 手番 アニメーション
		$('.turn-dialog-wrapper .dialog_text').html( `${Game.player().name}のターン` );
		$('.turn-dialog-wrapper').fadeIn().delay(300).fadeOut();

		/* 他のプレイヤーの背景 */
		/* 背景色リセット */
		$('.OtherPlayers-wrapper').find(`.OtherPlayer`)
			.css( {
				'background-color' : '#AFA78F',
				'box-shadow' : 'none',
			});
		/* 手番中の人の背景はハイライト */
		$('.OtherPlayers-wrapper').find(`.OtherPlayer[data-player_id='${Game.whose_turn_id}']`)
			.css( {
				'background-color' : '#9CBE5C',
				'box-shadow' : '0 0 20px #44f',
			} )
	});


	for ( let player_id = 0; player_id < Game.Players.length; ++player_id ) {
		let FBref_pl = FBref_Game.child(`Players/${player_id}`);
		FBref_pl.child('TurnCount'  ).on('value', (snap) => SetAndPrintTurnCount  ( player_id, snap ) );
		FBref_pl.child('Connection' ).on('value', (snap) => SetAndPrintConnection ( player_id, snap ) );
		FBref_pl.child('Open'       ).on('value', (snap) => SetAndPrintOpen       ( player_id, snap ) );
		FBref_pl.child('PlayArea'   ).on('value', (snap) => SetAndPrintPlayArea   ( player_id, snap ) );
		FBref_pl.child('Aside'      ).on('value', (snap) => SetAndPrintAside      ( player_id, snap ) );
		FBref_pl.child('Deck'       ).on('value', (snap) => SetAndPrintDeck       ( player_id, snap ) );
		FBref_pl.child('HandCards'  ).on('value', (snap) => SetAndPrintHandCards  ( player_id, snap ) );
		FBref_pl.child('DiscardPile').on('value', (snap) => SetAndPrintDiscardPile( player_id, snap ) );
	}

	FBref_Game.child('TurnInfo' ).on('value', SetAndPrintTurnInfo  );
	FBref_Game.child('Supply'   ).on('value', SetAndPrintSupply    );
	FBref_Game.child('TrashPile').on('value', SetAndPrintTrashPile );
	FBref_Game.child('phase'    ).on('value', SetAndPrintPhase     );

	/* TrashPile は消えたときに親階層から監視しておかないと反応しない */
	FBref_Game.on( 'child_removed', function( FBsnapshot ) {
		if ( !FBsnapshot.hasChild('TrashPile') ) {
			Game.TrashPile = [];
			$('.TrashPile').html('');
		}
	});

	FBref_Message.on( 'value', ( FBsnapshot ) => $('.Message').html( FBsnapshot.val() ) );

	FBref_MessageToMe.on( 'value', function( FBsnapshot ) {
		const MessageToMe = ( FBsnapshot.val() || '' );
		$('.MessageToMe').html( MessageToMe + '&nbsp' );   // MessageToMeが''でも高さ0にならないように空白文字追加
	});



	FBref_Room.child('chat').on('value', function( FBsnapshot ) {
		const msgs = FBsnapshot.val();

		$('.chat_list').html(''); // reset
		for ( let key in msgs ) {
			$('.chat_list').append(`<p>${msgs[key]}</p>`);
		}
		if ( $('.auto_scroll').prop('checked') ) {
			$('.chat_list').animate({scrollTop: $('.chat_list')[0].scrollHeight}, 'normal');
		}
	});


	FBref_Room.child('GameEnd').on('value', function( FBsnapshot ) {
		const GameEnd = FBsnapshot.val();
		if ( GameEnd ) {
			FBref_Players.once('value').then( function(snap) {
				const Players = snap.val();
				$.cookie( 'Prosperity'    , RoomInfo.SelectedCards.Prosperity       );
				$.cookie( 'DarkAges'      , RoomInfo.SelectedCards.DarkAges         );
				$.cookie( 'EventCards0'   , RoomInfo.SelectedCards.EventCards[0]    );
				$.cookie( 'EventCards1'   , RoomInfo.SelectedCards.EventCards[1]    );
				$.cookie( 'LandmarkCards0', RoomInfo.SelectedCards.LandmarkCards[0] );
				$.cookie( 'LandmarkCards1', RoomInfo.SelectedCards.LandmarkCards[1] );
				$.cookie( 'Banecard'      , RoomInfo.SelectedCards.Banecard         );
				$.cookie( 'Obelisk'       , RoomInfo.SelectedCards.Obelisk          );
				$.cookie( 'player_num'    , Players.length                          );

				for ( let i = 0; i < RoomInfo.UseSet.length; ++i ) {
					$.cookie( `UseSet${i}`, RoomInfo.UseSet[i] );
				}
				for ( let i = 0; i < KINGDOMCARD_SIZE; ++i ) {
					$.cookie( `KingdomCards${i}`, RoomInfo.SelectedCards.KingdomCards[i] );
				}
				for ( let i = 0; i < BLACKMARKET_SIZE; ++i ) {
					$.cookie( `BlackMarket${i}`, RoomInfo.SelectedCards.BlackMarket[i] );
				}

				// 手番勝ちを計算

				/*
				 *  example (ranked)
				 *  index  VP   TurnCount
				 *  2      6    15
				 *  1      3    14         *
				 *  4      3    14         *
				 *  3      3    15
				 */
				let ranked = Players.map( (p, index) => [ index, p.VPtotal, p.TurnCount ] )
								.sort( (a,b) => ( b[1] - a[1] || a[2] - b[2] ) ); // 順位順にソートしたもの

				let turn = new Array( ranked.length ).fill(false);
				for ( let i = ranked.length - 2; i >= 0; --i ) {
					if ( ranked[i][1] != ranked[i + 1][1] ) continue;  // VPtotalが異なるなら何もしないでスキップ
					if ( ranked[i][2] == ranked[i + 1][2] ) {
						turn[i] = turn[i + 1];
					}  // VPtotalもTurnCountも同じなら1つ後ろと同じ
					turn[i] = true;  // VPtotalが同じでTurnCountが小さいなら新たにtrueとする
				}
				turn = turn
					.map( (t) => [ ranked[0], t ] )
					.sort()
					.map( (t) => t[1] );

				for ( let i = 0; i < Players.length; ++i ) {
					$.cookie( `Player${i}-name`   , Players[i].name );
					$.cookie( `Player${i}-VPtotal`, Players[i].VPtotal );
					$.cookie( `Player${i}-turn`   , turn[i] );
				}

				$.cookie( 'myid'      , myid );
				$.cookie( 'myname'    , myname );
				$.cookie( 'GameRoomID', GameRoomID );

				window.location.href = 'Online_game_end.php';
			})
		}
	});
});

});
