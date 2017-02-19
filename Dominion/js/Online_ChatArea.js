$( function() {

	$('.chat-wrapper .chat_enter').click( function() {
		const msg = $('.chat-wrapper .chat_textbox').val();
		FBref_chat.push( `<font color='red'>${myname}</font> : ${msg}` );
		$('.chat-wrapper .chat_textbox').val('');
	});

	$('.chat-wrapper .leave_a_room').click( function() { return MyAsync( function*() {
		const yn = yield MyConfirm( 
			"退室しますか？<font color='red'>（再びゲームに戻ることはできません）</font>" );
		if ( yn ) {
			const msg = `${myname}が退室しました。`;
			FBref_chat.push( `<font color='red'>${msg}</font>`,
				() => window.location.href = 'Online_room_main.php' );
		}
	}); });


	firebase.database().ref( `/Rooms/${GameRoomID}/chat` )
	.on('value', function( FBsnapshot ) {
		const msgs = FBsnapshot.val();

		$('.chat_list').html(''); // reset
		for ( let key in msgs ) {
			$('.chat_list').append(`<p>${msgs[key]}</p>`);
		}
		if ( $('.auto_scroll').prop('checked') ) {
			$('.chat_list').animate({scrollTop: $('.chat_list')[0].scrollHeight}, 'normal');
		}
	});

	$('.chat-wrapper .reset_phase').click( function() { return MyAsync( function*() {
		const yn = yield MyConfirm( 
			`強制的にアクションフェーズに戻しますか？<br>
			<font color='red'>（不具合発生時）</font>` );
		if ( yn ) {
			Game.phase = 'ActionPhase';
			Game.TurnInfo.action = Math.max( 1, Game.TurnInfo.action );  // アクション1まで回復

			yield Promise.all( [
				FBref_Game.update( {
					phase : Game.phase,
					'TurnInfo/action' : Game.TurnInfo.action,
				}),

				// reset
				FBref_Message.remove(),
				FBref_MessageTo.remove(),
				FBref_Signal.remove(),
				FBref_StackedCardIDs.remove(),
			]);

			FBref_chat.push( `<font color='red'>【アクションフェーズに戻しました】</font>` );
		}
	}); });



});
