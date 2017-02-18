

// global objects

let CardEffect     = {};  /* library of functions of card effect */
let AttackEffect   = {};  /* library of functions of attack card effect */
let ReactionEffect = {};  /* library of functions of reaction card effect */

let Resolve        = {};  /* reference to a resolve function of Promise object */


function* GetCardEffect( playing_card_ID ) {
	const playing_card_no = Game.LookCardWithID( playing_card_ID ).card_no;
	const playing_Card = Cardlist[ playing_card_no ];
	FBref_chat.push( `${Game.player().name}が「${playing_Card.name_jp}」を使用しました。` );


	// アタックカードならまずリアクションカードの解決
	if ( IsAttackCard( Cardlist, playing_card_no ) ) {
		yield FBref_Message.set( 'リアクションカードを公開するプレイヤーがいないか待っています。' );
		for ( let id = Game.NextPlayerID(); id != Game.whose_turn_id; id = Game.NextPlayerID(id) ) {

			// Player[id] がリアクションスキップオプションがオンで手札にリアクションカードがない場合
			if ( Game.Settings.SkipReaction[id] && !Game.Players[id].HasReactionCard() ) continue;

			/* リアクションカードを公開するかどうかはアクションカード1枚ごとに決めてよい */
			yield FBref_Game.child(`TurnInfo/Revealed_Moat/${id}`).set(false);  /* reset */
			yield SendSignal( id, { listen_reaction : true } );

			yield FBref_SignalReactionEnd.set(false);  /* reset */
			FBref_SignalReactionEnd.on( 'value', function(snap) {
				if ( snap.val() ) Resolve['ReactionEnd']();
			} )

			yield FBref_SignalRevealReaction.set(false);  /* reset */
			FBref_SignalRevealReaction.on( 'value', function(snap) {
				if ( snap.val() == 'waiting_for_confirmation' ) {
					AcknowledgeButton_OtherPlayer(id)
					.then( () => FBref_SignalRevealReaction.set('confirmed') );
				}
			} );
			yield new Promise( resolve => Resolve['ReactionEnd'] = resolve );

			FBref_SignalReactionEnd.off();
			FBref_SignalRevealReaction.off();
		}
	}

	// このターンにプレイしたアクションカードの枚数 （for 共謀者）
	if ( IsActionCard( Cardlist, playing_card_no ) ) {
		Game.TurnInfo.played_actioncards_num++;
	}

	Game.TurnInfo.action += playing_Card.action;
	Game.TurnInfo.buy    += playing_Card.buy;
	Game.TurnInfo.coin   += playing_Card.coin;
	Game.player().DrawCards( playing_Card.draw_card );

	let updates = {};
	updates['TurnInfo'] = Game.TurnInfo;
	updates[`Players/${Game.player().id}`] = Game.player();
	yield FBref_Game.update( updates );

	const playing_card_name = Cardlist[ playing_card_no ].name_eng;
	yield MyAsync( CardEffect[ playing_card_name ], playing_card_ID, playing_card_no );
}





function WaitForButtonClick_sub( $buttons_area, buttons, multiselect = 1 ) {
	/*
		ボタン入力（multiselect > 1 で複数ボタン非重複選択）
		buttons = {
			{ return_value : 1, label : 'label1' },
			{ return_value : 2, label : 'label2' },
			{ return_value : 3, label : 'label3' },
			...
		}
	*/
	return MyAsync( function*() {
		if ( multiselect < 1 ) {
			throw new Error( `@WaitForButtonClick_sub: invalid value for multiselect "${multiselect}"` );
			return;
		}

		buttons.forEach( ( val, index ) => {
			$buttons_area.append(
				MakeHTML_button( `WaitForButtonClick`, val.label ) );
		} );

		let return_values = [];

		for ( let i = 0; i < multiselect; ++i ) {
			const clicked_btn_index
			  = yield new Promise( resolve => Resolve['WaitForClickingButton'] = resolve );
			return_values.push( buttons[ clicked_btn_index ].return_value );
		}

		$buttons_area.find('.WaitForButtonClick').remove();

		yield Promise.resolve( multiselect === 1 ? return_values[0] : return_values );
	});
}
$( function() {
	$('.PlayersAreaButtons,.MyAreaButtons').on( 'click', '.WaitForButtonClick', function() {
		if ( $(this).hasClass('selected') ) return;  // 選択済みなら反応しない
		$(this).addClass('selected').attr('disabled', 'disabled');  // 使用したボタンを無効化

		const clicked_btn_index = $('.WaitForButtonClick').index(this);
		Resolve['WaitForClickingButton']( clicked_btn_index );
	} );
} );

function WaitForButtonClick( buttons, multiselect = 1 ) {
	return WaitForButtonClick_sub( $('.PlayersAreaButtons'), buttons, multiselect );
}

function WaitForButtonClick_MyArea( buttons, multiselect = 1 ) {
	return WaitForButtonClick_sub( $('.MyAreaButtons'), buttons, multiselect );
}

function WaitForButtonClick_OtherPlayer( buttons, multiselect = 1 ) {
	return WaitForButtonClick_sub(
				$(`.OtherPlayer[data-player_id=${player_id}] .OtherPlayer_Buttons`),
				buttons, multiselect );
}

// 確認ボタン(shortcuts)
function AcknowledgeButton( label = 'OK', return_value ) {
	return WaitForButtonClick( { return_value : return_value, label : label }, 1 );
}

function AcknowledgeButton_MyArea( label = 'OK', return_value ) {
	return WaitForButtonClick_MyArea( { return_value : return_value, label : label }, 1 );
}

function AcknowledgeButton_OtherPlayer( player_id, label = 'OK', return_value ) {
	return WaitForButtonClick_OtherPlayer( { return_value : return_value, label : label }, 1 );
}




// 共通操作

// 手札にチェック
function WaitForMarkingHandCards() {
	return MyAsync( function*() {
		$('.HandCards').children('.card').addClass('MarkHandCards pointer');
		yield AcknowledgeButton();
		$('.HandCards').children('.card').removeClass('MarkHandCards pointer');

		const SelectedCardsID = [];
		$('.HandCards').children('.card.selected')
			.each( function() { SelectedCardsID.push( Number( $(this).attr('data-card_ID') ) ) } );

		yield Promise.resolve( SelectedCardsID );
	});
}
$( function() {
	$('.HandCards').on( 'click', '.card.MarkHandCards', function() {　$(this).toggleClass('selected'); } );
});



// 手札・サプライのカード選択等を終了するボタン
function ShowAbortButton( label = '完了' ) {
	$('.PlayersAreaButtons').append( MakeHTML_button( 'SelectPlayersCard_Done', label ) );
}
function HideAbortButton() {
	$('.PlayersAreaButtons .SelectPlayersCard_Done').remove();
}
function ShowAbortButton_MyArea( label = '完了' ) {
	$('.MyAreaButtons').append( MakeHTML_button( 'SelectPlayersCard_Done', label ) );
}
function HideAbortButton_MyArea() {
	$('.MyAreaButtons .SelectPlayersCard_Done').remove();
}

$( function() {
	// Game.player()
	$('.PlayersAreaButtons').on( 'click', '.SelectPlayersCard_Done', function() {
		Resolve['WaitForClickingCard']( 'SelectPlayersCard_Done' );  // 再開
		$('.PlayersAreaButtons .SelectPlayersCard_Done').remove();  /* 完了ボタン消す */
	} );

	// Game.Me()
	$('.MyAreaButtons').on( 'click', '.SelectPlayersCard_Done', function() {
		Resolve['WaitForClickingCard']( 'SelectPlayersCard_Done' );  // 再開
		$('.MyAreaButtons .SelectPlayersCard_Done').remove();  /* 完了ボタン消す */
	} );

	// Game.player()
	$('.HandCards,.Open').on( 'click', '.card.SelectPlayersCard', function() {
		Resolve['WaitForClickingCard']( Number( $(this).attr('data-card_ID') ) );  // 再開
	} );

	// Game.Me()
	$('.MyHandCards,.MyOpen').on( 'click', '.card.SelectPlayersCard', function() {
		Resolve['WaitForClickingCard']( Number( $(this).attr('data-card_ID') ) );  // 再開
	} );
});




// プレイヤーのカード（手札、公開したカードなど）の選択
function WaitForSelectingPlayersCard( CardArea, MyArea, conditions = (card_no,card_ID) => true ) {
	switch ( CardArea ) {
		case 'HandCards' : break;
		case 'Open' : break;
		default :
			throw new Error( `@WaitForSelectingPlayersCard: invalid value for CardArea "${CardArea}".` );
	}

	const player = ( MyArea ? Game.Me() : Game.player() );

	if ( player[CardArea].IsEmpty() ) {
		return Promise.resolve( { aborted : true, card_ID : undefined } );
	}

	return MyAsync( function*() {
		const $cards = $( ( MyArea ? `.My${CardArea}` : `.${CardArea}` ) )
			.children('.card')
			.filter( function() { return conditions(
					Number( $(this).attr('data-card_no') ),
					Number( $(this).attr('data-card_ID') ) ) } );

		$cards.addClass( 'SelectPlayersCard pointer' );
		const return_value
		  = yield new Promise( resolve => Resolve['WaitForClickingCard'] = resolve );
		$cards.removeClass( 'SelectPlayersCard pointer' );

		if ( return_value === 'SelectPlayersCard_Done' ) {
			yield Promise.resolve( { aborted : true, card_ID : undefined } );
			return;
		}

		const ClickedCardID = return_value;

		yield Promise.resolve( { aborted : false, card_ID : ClickedCardID } );
	});
}


// プレイヤーのカード（手札、公開したカードなど）の移動
function WaitForMovingPlayersCard(
			CardArea,  // HandCards, Open
			operation,
			MyArea,
			conditions = (card_no,card_ID) => true,
			log = true,
			face = 'default' )
{
	const player = ( MyArea ? Game.Me() : Game.player() );

	return MyAsync( function*() {
		const return_value = yield WaitForSelectingPlayersCard( CardArea, MyArea, conditions );

		if ( return_value.aborted ) {
			yield Promise.resolve( { aborted : true, card_ID : undefined } );
			return;
		}

		const ClickedCardID = return_value.card_ID;

		switch ( operation ) {
			case 'Trash' :
				Game.Trash( ClickedCardID );
				yield FBref_Game.update( {
					[`Players/${player.id}`] : player,
					TrashPile : Game.TrashPile,
				} );
				break;

			case 'Discard' :
				yield player.Discard( ClickedCardID, Game );
				break;

			case 'Play' :
				yield player.Play( ClickedCardID, Game );
				break;

			case 'PutBackToDeck' :
				yield player.PutBackToDeck( ClickedCardID, Game, false, face );
				break;

			case 'Reveal' :
				yield player.Reveal( ClickedCardID, Game, false, face );
				break;

			default :
				throw new Error(`@WaitForMovingCard: invalid value for opreation "${operation}"`);
		}

		yield Promise.resolve( { aborted : false, card_ID : ClickedCardID } );  // return value
	});
}



// 手札を1枚選択
function WaitForSelectingHandCard( MyArea, conditions = (card_no,card_ID) => true ) {
	return WaitForSelectingPlayersCard( 'HandCards', MyArea, conditions );
}


// 手札の移動
function WaitForMovingHandCard(
			operation,
			MyArea,
			conditions = (card_no,card_ID) => true,
			log = false,
			face = 'default' )
{
	return WaitForMovingPlayersCard( 'HandCards', operation, MyArea, conditions, log, face );
}


// 手札の廃棄
function WaitForTrashingHandCard( conditions = (card_no,card_ID) => true, log = true ) {
	return WaitForMovingHandCard( 'Trash', false, conditions, log );
}

// 手札の廃棄(MyArea)
function WaitForTrashingMyHandCard( conditions = (card_no,card_ID) => true, log = true ) {
	return WaitForMovingHandCard( 'Trash', true, conditions, log );
}

// 手札を捨て札にする
function WaitForDiscardingHandCard( conditions = (card_no,card_ID) => true, log = true ) {
	return WaitForMovingHandCard( 'Discard', false, conditions, log );
}

// 手札を捨て札にする(MyArea)
function WaitForDiscardingMyHandCard( conditions = (card_no,card_ID) => true, log = true ) {
	return WaitForMovingHandCard( 'Discard', true, conditions, log );
}

// 手札を山札に戻す
function WaitForPuttingBackHandCard( conditions = (card_no,card_ID) => true, log = false, face = 'default' ) {
	return WaitForMovingHandCard( 'PutBackToDeck', false, conditions, log, face );
}

// 手札を山札に戻す(MyArea)
function WaitForPuttingBackMyHandCard( conditions = (card_no,card_ID) => true, log = false, face = 'default' ) {
	return WaitForMovingHandCard( 'PutBackToDeck', true, conditions, log, face );
}

// 手札を場に出す
function WaitForPlayingHandCard( conditions = (card_no,card_ID) => true, log = true ) {
	return WaitForMovingHandCard( 'Play', false, conditions, log );
}

// 手札を場に出す(MyArea)
function WaitForPlayingMyHandCard( conditions = (card_no,card_ID) => true, log = true ) {
	return WaitForMovingHandCard( 'Play', true, conditions, log );
}

// 手札の1枚を公開する
function WaitForRevealingHandCard( conditions = (card_no,card_ID) => true, log = true, face = 'default' ) {
	return WaitForMovingHandCard( 'Reveal', false, conditions, log, face );
}

// 手札の1枚を公開する(MyArea)
function WaitForRevealingMyHandCard( conditions = (card_no,card_ID) => true, log = true, face = 'default' ) {
	return WaitForMovingHandCard( 'Reveal', true, conditions, log, face );
}




// 公開したカードから1枚選択
function WaitForSelectingRevealedCard(
			MyArea,
			conditions = (card_no,card_ID) => true,
			log = true )
{
	return WaitForSelectingPlayersCard( 'Open', MyArea, conditions );
}

// 公開したカードの移動
function WaitForMovingRevealedCard(
			operation,
			MyArea,
			conditions = (card_no,card_ID) => true,
			log = true,
			face = 'default' )
{
	return WaitForMovingPlayersCard( 'Open', operation, MyArea, conditions, log, face );
}

function WaitForPuttingBackRevealedCard(
			conditions = (card_no,card_ID) => true,
			log = true,
			face = 'default' )
{
	return WaitForMovingRevealedCard( 'PutBackToDeck', false, conditions, log, face );
}

function WaitForPuttingBackRevealedCard_MyArea(
			conditions = (card_no,card_ID) => true,
			log = true,
			face = 'default' )
{
	return WaitForMovingRevealedCard( 'PutBackToDeck', true , conditions, log, face );
}






// サプライから獲得

function Get$SupplyAreaWithConditions(
		conditions = (card,card_no) => true,
		additional_piles = false,
		available_card_only = true )  // 山が切れていないという意味（獲得する条件とかはconditionでチェック）
{
	let $piles = $('.SupplyArea').find('.card');
	if ( additional_piles ) {
		$piles = $('.SupplyArea,.additional-piles').find('.card');
	}
	return $piles.filter( function() {
		const card_no = Number( $(this).attr('data-card_no') );
		const card = Cardlist[ card_no ];
		if ( available_card_only && $(this).attr('data-card_num_of_remaining') <= 0 ) return false;
		if ( conditions( card, card_no ) ) return true;
	});
}


function WaitForSelectingSupplyCard(
		conditions,
		additional_piles = false,
		available_card_only = true )
{
	return MyAsync( function*() {
		const $available_piles
		  = Get$SupplyAreaWithConditions( conditions, additional_piles, available_card_only );

		if ( $available_piles.length == 0 ) {
			yield MyAlert( '選択できるカードがありません' );
			yield Promise.resolve( {
				exists : false,
				card_ID : undefined,
				card_no : undefined,
			} );
			return;
		}

		$available_piles.addClass( 'SelectSupplyCard pointer' );
		const [ SelectedPile_card_no, SelectedCardID ]
		  = yield new Promise( resolve => Resolve['WaitForClickingCard'] = resolve );
		$available_piles.removeClass( 'SelectSupplyCard pointer' );

		yield Promise.resolve( {
			exists : true,
			card_ID : SelectedCardID,
			card_no : SelectedPile_card_no,
		} );  // return value
	});
}
$( function() {
	$('.SupplyArea,.additional-piles').on( 'click', '.card.SelectSupplyCard', function() {
		const clicked_pile = Game.Supply.byName( $(this).attr('data-card-name-eng') );
		const clicked_card = clicked_pile.LookTopCard();
		const clicked_card_ID = ( clicked_card == undefined ? undefined : clicked_card.card_ID );
		Resolve['WaitForClickingCard']( [ clicked_pile.card_no, clicked_card_ID ] );
	} );
});



function WaitForGainingSupplyCard(
			AddTo,
			player_id,
			conditions,
			additional_piles = false,
			face = 'default' )
{
	return MyAsync( function*() {
		const return_value
		  = yield WaitForSelectingSupplyCard( conditions, additional_piles, true );
		if ( !return_value.exists ) {
			yield Promise.resolve( return_value );
			return;
		}
		yield Game.GainCardFromSupply( return_value.card_ID, AddTo, player_id, face );
		yield Promise.resolve( return_value );  // return value
	});
}



