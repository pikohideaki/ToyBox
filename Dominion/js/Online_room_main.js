$( function() {


let SelectedRoomID = undefined;
let myid;


FBref_Rooms.on('value', function( FBsnapshot ) {
	let Rooms = ( FBsnapshot.val() || {});

	/* 部屋リストをfirebaseと同期 */
	let $roomlist = $('#room-list');
	$roomlist.html('');
	for ( let key in Rooms ) {
		if ( Rooms[key].GameEnd ) continue;  // 終了したゲームは非表示（削除は手動）
		$roomlist.prepend( MakeHTML_Room( key, Rooms[key].RoomInfo ) );
	}

	// 選択中の部屋が削除されたらモーダルをオフに
	if ( !Object.keys( Rooms ).val_exists( SelectedRoomID ) ) {
		$('.waiting-modal-wrapper').fadeOut();
		return;
	}

	/* モーダルの部屋情報をfirebaseと同期 */
	if ( SelectedRoomID != undefined ) {
		let RoomObj = Rooms[SelectedRoomID];
		SetModalHTML( SelectedRoomID, RoomObj );
	}

});



function SetModalHTML( RoomID, RoomObj ) {
	let RoomInfo = RoomObj.RoomInfo;

	/* hidden values */
	const myname = $('.my-name').val();

	$('#form-new-game [name=myid]').attr( 'value', myid );
	$('#form-new-game [name=myname]').attr( 'value', myname );
	$('#form-new-game [name=room-id]').attr( 'value', RoomID  );

	$('.modal-RoomNo'          ).html( RoomInfo.RoomNo );
	$('.modal-PlayerNum'       ).html( RoomInfo.PlayerNum );
	$('.modal-UsingSetlist'    ).html( RoomInfo.UsingSetlist.join("，") );
	$('.modal-Status'          ).html( RoomInfo.Status );
	$('.modal-Comment'         ).html( RoomInfo.Comment );
	$('.modal-PlayerNumToCome' ).html( RoomInfo.PlayerNum - RoomInfo.PlayersName.length );
	$('.modal-PlayersName'     ).html( RoomInfo.PlayersName.join("，") );

	if ( RoomInfo.Status == '人数が揃いました。' ) {
		FBref_Rooms.off();   /* listener detached */
		/* buttons */
		$('.modal-cancel').attr('disabled','disabled'); /* キャンセルボタン無効化 */

		/* サプライ＆デッキ準備 */
		if ( myid === RoomInfo.permute[0] ) { /* 代表者がまとめて行う */
			let Game = RoomObj.Game;
			Game.Supply = new CSupply();
			Game.Supply.InitSupply( RoomInfo.SelectedCards, RoomInfo.PlayerNum );
			Game.Players = ( Game.Players || [] );
			for ( let i = 0; i < RoomInfo.PlayerNum; ++i ) {
				const id = RoomInfo.permute[i];
				Game.Players[id] = new CPlayer();
				Game.Players[id].InitDeck( id, RoomInfo.PlayersName[i], Game.Supply );
			}
			/* firebase にアップロード */
			const RoomID = $('#form-new-game [name=room-id]').val();
			FBref_Rooms.child( RoomID ).update( {
				'Game/Players'    : Game.Players,
				'Game/Supply'     : Game.Supply,
				'RoomInfo/Status' : '対戦中',
			} );
		}


		let counter = 3;
		let counter_temp = counter;
		let I = setInterval( function() {
			$('.modal-Status').html( --counter_temp + '秒後に移動します' );
			if ( counter_temp < 0 ) clearInterval( I );
		}, 1000 );

		setTimeout( () => $('#form-new-game').submit() , counter * 1000 );  /* counter秒後に画面遷移 */
		/* ステータス書き換え後に移動 */
	}
}



function MakeHTML_Room( RoomID, RoomInfo ) {
	const disabled_str = ( RoomInfo.Status == '参加者待機中' ? '' : ' disabled ' );
	return `
				<div class='room-list-item-wrapper'>
				<div class='room-list-item ${disabled_str}' data-room-id='${RoomID}'>
					<p>部屋<span class='room-no'>${RoomInfo.RoomNo}</span></p>
					<p>作成日時 ： <span class='room-date'>${RoomInfo.Date}</span></p>
					<p>状態 ： <span class='room-status'>${RoomInfo.Status}</span></p>
					<p>使用する拡張セット ： <span class='room-use-set'>${RoomInfo.UsingSetlist.join('，')}</span></p>
					<p>プレイヤー数 ： <span class='room-player-num'>${RoomInfo.PlayerNum}</span></p>
					<p>参加中のプレイヤー ： <span class='room-players-name'>${RoomInfo.PlayersName.join('，')}</span></p>
					<p>コメント ： <span class='room-comment'>${RoomInfo.Comment}</span></p>
					<button class='btn-blue walkin-room' ${disabled_str}>参加</button>
				</div>
				</div>
			`;
}





/************************* 部屋の作成 *************************/

function GetRoomNoList() {
	let NoList = [];
	$('.room-list-item').each( function() {
		NoList.push( Number( $(this).find('.room-no').html() ) );
	});
	return NoList.sort();
}


$('#make-room-btn').click( function() {
	let UsingSetlist = []; // set name list
	let UseSet = [];  // flag
	for ( let i = 0; i < Setlist.length; ++i ) {
		UseSet[i] = $( `#UseSet${i}` ).prop('checked');
		if ( UseSet[i] ) {
			UsingSetlist.push( Setlist[i] );
			$.cookie( `UseSet${i}`, UseSet[i] );  // memory true or false
		}
	}
	if ( UsingSetlist.length < 1 ) {
		alert('1セット以上選んでください。');   return;
	}

	/* ゲームの共用部分は部屋作成者が計算しておく */
	/* randomizer */
	let SelectedCards = new CSelectedCards();
	Randomizer( SelectedCards, UsingSetlist, Cardlist );

	/* test */
	// SelectedCards.KingdomCards = [ 9,11,13,14,16,17,18,19,21,22, ];  //
	SelectedCards.KingdomCards = [ 21,24,25,26, 27,28,29,31, 15,32 ];  //

	// SelectedCards.KingdomCards[0] = 139;  // 馬上槍試合
	// SelectedCards.KingdomCards[1] = 142;  // 魔女娘
	// SelectedCards.KingdomCards[2] = 128;  // 馬商人
	// SelectedCards.KingdomCards[3] = 92;   // 使い魔

	const date = new Date();

	let NewRoom = {
		RoomInfo : {
			RoomNo        : NotUsedNumber( GetRoomNoList(), 1 ),
			Status        : "参加者待機中",
			PlayerNum     : Number( $('.make-room .player-num').val() ),
			PlayersName   : [ $('.my-name').val() ],
			Comment       : $('[name=make-room-comment]').val(),
			permute       : [],
			UsingSetlist  : UsingSetlist,
			UseSet        : UseSet,
			SelectedCards : SelectedCards,
			Date          : 
			`${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
		},
		Game : {},
	};
	NewRoom.Game = new CGame();
	NewRoom.Game.ResetTurnInfo();
	NewRoom.Game.Settings.SkipReaction = new Array( NewRoom.RoomInfo.PlayerNum ).fill(true);

	NewRoom.RoomInfo.permute = Permutation( NewRoom.RoomInfo.PlayerNum );
	myid = NewRoom.RoomInfo.permute[0];

	/* 今立てた部屋のID */
	const RoomID = FBref_Rooms.push( NewRoom ).key;
	SelectedRoomID = RoomID;
	SetModalHTML( SelectedRoomID, NewRoom );  /* RoomID取得がvalueイベントの後なので最初だけ手動で更新 */

	$('.waiting-modal-wrapper .modal-cancel').addClass( 'room-maker' );

	/* モーダルを表示 */
	$('.waiting-modal-wrapper').fadeIn();
});



$('.modal-cancel').click( function() {
	if ( !$(this).hasClass('room-maker') ) return;

	$('.waiting-modal-wrapper .modal-cancel').removeClass( 'room-maker' );

	/* 今立てた部屋のID */
	const RoomID = $('#form-new-game [name=room-id]').val();
	SelectedRoomID = undefined;

	/* Firebaseのデータベースから削除 */
	FBref_Rooms.child( RoomID ).remove();
	$('.waiting-modal-wrapper').fadeOut();
});





/************************* 既存の部屋への参加 *************************/

$('.room-list').on( 'click', '.walkin-room', function() {
	let   $modal = $(this).parent();
	const RoomNo = Number( $modal.find('.room-no').html() );
	const RoomID = $modal.attr('data-room-id');
	if ( !confirm( `部屋${RoomNo}に入室しますか？` ) ) return;

	/* 部屋データを入手 */
	FBref_Rooms.once('value').then( function( FBsnapshot ) {
		/* 今参加しようとしている部屋 */
		let   RoomObj = FBsnapshot.val()[RoomID];
		const myname = $('.my-name').val();
		const PlayersName = RoomObj.RoomInfo.PlayersName;

		/* 人数チェック */
		if ( RoomObj.RoomInfo.Status != '参加者待機中' ) {
			alert( '既に人数がそろっているので参加できません' );
			return false;
		}

		/* 名前重複チェック */
		for ( let key in PlayersName ) {
			if ( PlayersName[key] == myname ) {
				alert( '既に参加しています！');
				return false;
			}
		}

		SelectedRoomID = RoomID;

		RoomObj.RoomInfo.PlayersName.push( myname );  /* 追加 */
		myid = RoomObj.RoomInfo.permute[ RoomObj.RoomInfo.PlayersName.length - 1];

		if ( PlayersName.length >= RoomObj.RoomInfo.PlayerNum ) {
			RoomObj.RoomInfo.Status = '人数が揃いました。';
		}

		FBref_Rooms.child( RoomID ).set( RoomObj );
		SetModalHTML( SelectedRoomID, RoomObj );

		$('.waiting-modal-wrapper .modal-cancel').addClass( 'newcommer' );

		$('.waiting-modal-wrapper').fadeIn();
	});
});



$('.modal-cancel').click( function() {
	if ( !$(this).hasClass('newcommer') ) return;

	$('.waiting-modal-wrapper .modal-cancel').removeClass( 'newcommer' );

	/* 今立てた部屋のID */
	const RoomID = $('#form-new-game [name=room-id]').val();

	/* 部屋データを入手 */
	FBref_Rooms.once('value').then( function( FBsnapshot ) {
		/* 今参加している部屋 */
		let RoomObj = FBsnapshot.val()[RoomID];

		SelectedRoomID = undefined;

		/* Firebaseのデータベースから自分の名前のみ削除 */
		const myname = $('.my-name').val();
		for ( let key in RoomObj.RoomInfo.PlayersName ) {
			if ( RoomObj.RoomInfo.PlayersName[key] == myname ) RoomObj.RoomInfo.PlayersName.remove(key);
		}
		FBref_Rooms.child( `${RoomID}/RoomInfo/PlayersName` ).set( RoomObj.RoomInfo.PlayersName );

		$('.waiting-modal-wrapper').fadeOut();
	});
});


});
