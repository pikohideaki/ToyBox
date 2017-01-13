$( function() {

	$('.chat-wrapper .chat_enter').click( function() {
		const msg = $('.chat-wrapper .chat_textbox').val();
		FBref_Room.child('chat').push( `<font color='red'>${myname}</font> : ${msg}` );
		$('.chat-wrapper .chat_textbox').val('');
	});

	$('.chat-wrapper .leave_a_room').click( function() { return MyAsync( function*() {
		const yn = yield MyConfirm( {
			message : "退室しますか？<font color='red'>（再びゲームに戻ることはできません）</font>"
		} );
		if ( yn ) {
			const msg = `${myname}が退室しました。`;
			FBref_Room.child('chat').push( `<font color='red'>${msg}</font>`,
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


});