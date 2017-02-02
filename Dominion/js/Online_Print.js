

// カード強調
jQuery.fn.extend( {
	emphasize_card : function( vars ) {
		$(this)
			.css( 'box-shadow', '0 0 20px #3DAAEE' )
			.animate({boxShadow: 'none'}, 'slow', undefined,
				function() { $(this).css( 'box-shadow', '' ) } )
			
		return this;
	},
} );




function FaceUpDown( face, $card ) {
	switch ( face ) {
		case 'default' :
			break;
		case 'up'   :
			$card.removeClass('down').addClass('up');
			break;
		case 'down' :
			$card.removeClass('up').addClass('down');
			break;
		default :
			throw new Error(`@FaceUpDown : invalid value "${face}" for card.face`);
			break;
	}
}



function ChangeHeight( $CardArea, reset = false ) {
	// カードの枚数が多いとき多段表示
	const SizeOf$CardArea = new SizeOfjQueryObj( $CardArea );
	const cards_num_in_line = Math.floor( SizeOf$CardArea.width_without_padding() / SizeOf$Card.width_with_margin() );
	let lines = Math.max( 1, Math.ceil( $CardArea.children('.card').length / cards_num_in_line ) );
	if ( reset ) lines = 1;
	const heightAfter = lines * SizeOf$Card.height_with_margin() + SizeOf$CardArea.padding.top + SizeOf$CardArea.padding.bottom;
	$CardArea.css( 'height', heightAfter );
}


function ResetWidth( $CardArea, SizeOfCard ) {
	$CardArea.children('.card')
	.css( {
		'margin-right' : SizeOfCard.margin.right,
		'margin-left'  : SizeOfCard.margin.left,
		'width'        : `${SizeOfCard.width}px`,
	});
}

function ShrinkWidth( $CardArea, SizeOfCard ) {
	// カードの枚数が多いとき圧縮表示
	const SizeOf$CardArea = new SizeOfjQueryObj( $CardArea );
	let $cards = $CardArea.children('.card');
	if ( $cards.length * SizeOfCard.width_with_margin() > SizeOf$CardArea.width_without_padding() ) {
		const width = Math.floor( ( SizeOf$CardArea.width_without_padding() - SizeOfCard.width_with_margin() ) / ( $cards.length - 1) );
		const br = SizeOfCard.border_radius;
		for ( let i = 0; i < $cards.length - 1; ++i ) {
			$cards.eq(i).css( { 'width' : `${width}px`, 'border-radius' : `${br}px 0 0 ${br}px`, });
		}
		for ( let i = 0; i < $cards.length; ++i ) {
			$cards.eq(i).css( { 'margin-right' : 0, 'margin-left' : 0, });
		}
	} else {  /* reset */
		ResetWidth( $CardArea, SizeOfCard );
	}
}


function ChangeHeightOrShrinkWidth( $CardArea, SizeOfCard ) {
	if ( $('.chbox_multirow').prop('checked') ) {
		ResetWidth( $CardArea , SizeOfCard );
		ChangeHeight( $CardArea );
	} else {
		ChangeHeight( $CardArea, true );
		ShrinkWidth( $CardArea , SizeOfCard );
	}
}

$( function() {
	function ResizeCardAreas() {
		ChangeHeightOrShrinkWidth( $('.CardAreaOfPlayer.Open'      ), SizeOf$Card );
		ChangeHeightOrShrinkWidth( $('.CardAreaOfPlayer.PlayArea'  ), SizeOf$Card );
		ChangeHeightOrShrinkWidth( $('.CardAreaOfPlayer.Aside'     ), SizeOf$Card );
		ChangeHeightOrShrinkWidth( $('.CardAreaOfPlayer.HandCards' ), SizeOf$Card );
		ChangeHeightOrShrinkWidth( $('.MyOpen'      ), SizeOf$Card );
		ChangeHeightOrShrinkWidth( $('.MyPlayArea'  ), SizeOf$Card );
		ChangeHeightOrShrinkWidth( $('.MyHandCards' ), SizeOf$Card );
		ChangeHeightOrShrinkWidth( $('.MyAside'     ), SizeOf$Card );
	}

	$(window).resize( ResizeCardAreas );
	$('.chbox_multirow').click( ResizeCardAreas );
})




function PrintTurnCount( player_id ) {
	$(`.OtherPlayer[data-player_id='${player_id}'] .player_TurnCount_num`)
		.html( Game.Players[ player_id ].TurnCount );
}

function PrintConnection( player_id ) {
	$(`.OtherPlayer[data-player_id='${player_id}'] .player_Connection`)
		.html( ( Game.Players[ player_id ].Connection ? '' : '再接続中…' ) );
}







function PrintCardArea_sub( CardArea, $CardArea, face = 'default' ) {
	$CardArea.html('');
	CardArea.forEach( card => $CardArea.append( MakeHTML_Card( card, Game ) ) );

	// デフォルト値
	FaceUpDown( face, $CardArea.children('.card') );
	/* カード1枚ごとに裏表の指定があれば優先 */
	for ( let i = 0; i < CardArea.length; ++i ) {
		FaceUpDown( CardArea[i].face, $CardArea.children('.card').eq(i) );
	}

	// 更新時のアニメーション
	$CardArea.children('.card').emphasize_card();
}

function PrintCardAreaOfPlayer( CardAreaName, face, displaynone = false ) {
	let $CardArea = $(`.CardAreaOfPlayer.${CardAreaName}`);
	let CardArea = Game.player()[CardAreaName];
	PrintCardArea_sub( CardArea, $CardArea, face );
	ChangeHeightOrShrinkWidth( $CardArea, SizeOf$Card );  /* 圧縮表示 or 多段表示 */
	if ( displaynone && CardArea.length == 0 ) { $CardArea.hide(); } else { $CardArea.show(); }
}

function PrintMyCardArea( CardAreaName, face, displaynone ) {
	let MyCardArea = Game.Players[ myid ][ CardAreaName ];
	let $MyCardArea = $(`.My${CardAreaName}`);
	PrintCardArea_sub( MyCardArea, $MyCardArea, face );
	ChangeHeightOrShrinkWidth( $MyCardArea, SizeOf$Card );  /* 圧縮表示 or 多段表示 */
	if ( displaynone && MyCardArea.length == 0 ) { $MyCardArea.hide(); } else { $MyCardArea.show(); }
	// ChangeHeight( $MyCardArea );
}

function PrintCardAreaSmall( player_id, CardAreaName, face, displaynone ) {
	let $CardArea = $(`.OtherPlayer[data-player_id='${player_id}'] .s${CardAreaName}`);
	let CardArea = Game.Players[ player_id ][CardAreaName];
	PrintCardArea_sub( CardArea, $CardArea, face );
	ShrinkWidth( $CardArea, SizeOf$ssCard );  /* 圧縮表示 or 多段表示 */
	if ( displaynone && CardArea.length == 0 ) { $CardArea.hide(); } else { $CardArea.show(); }
}


function PrintHandCardsOfPlayer() {
	let $HandCards = $('.CardAreaOfPlayer.HandCards');
	let HandCards = Game.player().HandCards;
	PrintCardArea_sub( HandCards, $HandCards, ( Game.whose_turn_id == myid ? 'up' : 'down' ) );
	// PrintCardArea_sub( HandCards, $HandCards, 'down' );

	if ( Game.whose_turn_id == myid ) {
		switch ( Game.phase ) {
			case 'ActionPhase' :
				$HandCards.children('.card')
					.filter( function() { return IsActionCard( Cardlist, $(this).attr('data-card_no') ); } )
					.addClass('use-this pointer');
				break;
			case 'BuyPhase' :
				$HandCards.children('.card')
					.filter( function() { return IsTreasureCard( Cardlist, $(this).attr('data-card_no') ); } )
					.addClass('use-this pointer');
				break;
			default :
				break;
		}
	}
	ChangeHeightOrShrinkWidth( $HandCards, SizeOf$Card );
	$HandCards.children('.card').emphasize_card();
}


function PrintDeck_sub( player_id, $Deck ) {
	let Deck = Game.Players[ player_id ].Deck;
	$Deck.html('');
	if ( Deck.length > 0 ) {
		$Deck.html( MakeHTML_Card( Deck[0], Game ) );
		/* 山札枚数表示 */
		$Deck.find('.card')
		  .append(`<span class='card-num-of-remaining'>${Deck.length}</span>` )

		/* デフォルトは裏 */
		$Deck.find('.card').removeClass('up').addClass('down');
		/* 裏表の指定があれば優先 */
		FaceUpDown( Deck[0].face, $Deck.children('.card') );
		// 更新時のアニメーション
		$Deck.find('.card').emphasize_card();
	}
}

function PrintDiscardPile_sub( player_id, $DiscardPile ) {
	let DiscardPile = Game.Players[ player_id ].DiscardPile;
	$DiscardPile.html('');
	if ( DiscardPile.length > 0 ) {
		$DiscardPile.html( MakeHTML_Card( DiscardPile.back(), Game ) );

		/* デフォルトは表 */
		$DiscardPile.find('.card').removeClass('down').addClass('up');
		/* 裏表の指定があれば優先 */
		FaceUpDown( DiscardPile.back().face, $DiscardPile.children('.card') );
		// 更新時のアニメーション
		$DiscardPile.find('.card').emphasize_card();
	}
}



function PrintPlayArea( player_id ) {
	if ( player_id == Game.whose_turn_id ) PrintCardAreaOfPlayer( 'PlayArea', 'up', false );
	if ( player_id == myid ) PrintMyCardArea( 'PlayArea', 'up', true );
	PrintCardAreaSmall( player_id, 'PlayArea', 'up', player_id != Game.whose_turn_id );
	// 手番プレイヤーの小画面のプレイエリアは表示（1枚出したときに画面が動くのが嫌）
}

function PrintAside( player_id ) {
	if ( player_id == Game.whose_turn_id ) PrintCardAreaOfPlayer( 'Aside', 'up', false );
	if ( player_id == myid ) PrintMyCardArea( 'Aside', 'up', true );
	PrintCardAreaSmall( player_id, 'Aside', 'up', true );
}

function PrintOpen( player_id ) {
	if ( player_id == Game.whose_turn_id ) PrintCardAreaOfPlayer( 'Open', 'up', true );
	if ( player_id == myid ) PrintMyCardArea( 'Open', 'up', true );
	PrintCardAreaSmall( player_id, 'Open', 'up', true );
}

function PrintHandCards( player_id ) {
	if ( player_id == Game.whose_turn_id ) PrintHandCardsOfPlayer();
	if ( player_id == myid ) PrintMyCardArea( 'HandCards', 'up', false );
	PrintCardAreaSmall( player_id, 'HandCards', 'down', false );
	// PrintCardAreaSmall( player_id, 'HandCards', ( player_id == myid ? 'up' : 'down' ), false );
}

function PrintDeck( player_id ) {
	if ( player_id == Game.whose_turn_id ) {
		PrintDeck_sub( player_id, $('.CardAreaOfPlayer.Deck') );
	}
	PrintDeck_sub( player_id, $(`.OtherPlayer[data-player_id='${player_id}'] .sDeck`) );
	if ( player_id == myid ) PrintDeck_sub( myid, $('.MyDeck') );
}

function PrintDiscardPile( player_id ) {
	if ( player_id == Game.whose_turn_id ) {
		PrintDiscardPile_sub( player_id, $('.CardAreaOfPlayer.DiscardPile') );
	}
	PrintDiscardPile_sub( player_id, $(`.OtherPlayer[data-player_id='${player_id}'] .sDiscardPile`) );
	if ( player_id == myid ) {
		PrintDiscardPile_sub( myid, $('.MyDiscardPile') );
	}
}









function PrintSupply() {

	/* SupplyArea line1 */
	const $SupplyArea1 = $('.SupplyArea.line1');
	$SupplyArea1.html('');
	Game.Supply.Basic.filter( pile => pile.in_use ).forEach( function(pile) {
		$SupplyArea1.append( MakeHTML_SupplyPile( pile, Cardlist, Game ) );
	} );

	/* SupplyArea line2 */
	const $SupplyArea2 = $('.SupplyArea.line2');
	$SupplyArea2.html('');
	for ( let i = 0; i < KINGDOMCARD_SIZE / 2; ++i ) {
		$SupplyArea2.append( MakeHTML_SupplyPile( Game.Supply.KingdomCards[i], Cardlist, Game ) );
	}

	/* SupplyArea line3 */
	const $SupplyArea3 = $('.SupplyArea.line3');
	$SupplyArea3.html('');
	for ( let i = KINGDOMCARD_SIZE / 2; i < KINGDOMCARD_SIZE; ++i ) {
		$SupplyArea3.append( MakeHTML_SupplyPile( Game.Supply.KingdomCards[i], Cardlist, Game ) );
	}

	// 褒賞カード（5枚）
	const $PrizeArea = $('.Prize');
	$PrizeArea.html('');
	Game.Supply.Prize.forEach( function( prize_pile ) {
		if ( prize_pile.in_use ) {
			$PrizeArea.append( MakeHTML_SupplyPile( prize_pile, Cardlist, Game ) );
		}
	});
	if ( Game.Supply.Prize[0].in_use ) {
		$('.Prize-wrapper').show();
	}

	// 魔女娘 災いカード
	if ( Game.Supply.BaneCard.in_use ) {
		const $BaneCardArea = $('.SupplyArea.BaneCard');
		$BaneCardArea.html( MakeHTML_SupplyPile( Game.Supply.BaneCard, Cardlist, Game ) );
		$('.BaneCard-wrapper').show();
	}


	// 購入フェーズならクリック可能に（災いカードも対象）
	if ( Game.phase == 'BuyPhase' || Game.phase == 'BuyPhase_GetCard' ) {
		// $('.SupplyArea').find('.card')
		Get$SupplyAreaWithConditions( undefined, false ).addClass('BuyCard pointer');
	}


	// 更新時アニメーション
	$('.SupplyArea').find('.card').emphasize_card();
}




function PrintPhase() {
	/* phase変更時に，データの変更の有無にかかわらず再表示しないといけないもの（クラスの書き換えなど） */
	PrintSupply();
	PrintHandCardsOfPlayer();

	switch ( Game.phase ) {
		case 'ActionPhase' :
			FBref_Message.set( 'アクションカードを選択してください。' );
			$('.phase').html('アクションフェーズ');
			$('.SortHandCards'   ).show();
			$('.UseAllTreasures' ).hide();
			$('.MoveToBuyPhase'  ).show();
			$('.MoveToNextPlayer').show();
			break;

		case 'ActionPhase*' : 
			$('.phase').html('アクションフェーズ');
			$('.SortHandCards'   ).hide();
			$('.UseAllTreasures' ).hide();
			$('.MoveToBuyPhase'  ).hide();
			$('.MoveToNextPlayer').hide();
			break;

		case 'BuyPhase'  :
			FBref_Message.set( '財宝カードを場に出した後カードを購入してください。' );
			$('.phase').html('購入フェーズ');
			$('.SortHandCards'   ).show();
			$('.UseAllTreasures' ).show();
			$('.MoveToBuyPhase'  ).hide();
			$('.MoveToNextPlayer').show();
			break;

		case 'BuyPhase*' :
			FBref_Message.set( '財宝カードを場に出した後カードを購入してください。' );
			$('.phase').html('購入フェーズ');
			$('.SortHandCards'   ).hide();
			$('.UseAllTreasures' ).hide();
			$('.MoveToBuyPhase'  ).hide();
			$('.MoveToNextPlayer').hide();
			break;

		case 'BuyPhase_GetCard' :
			FBref_Message.set( 'カードを購入してください。' );
			$('.phase').html('購入フェーズ');
			$('.SortHandCards'   ).show();
			$('.UseAllTreasures' ).hide();
			$('.MoveToBuyPhase'  ).hide();
			$('.MoveToNextPlayer').show();
			break;

		default :
			$('.phase').html('');
			$('.SortHandCards'   ).show();
			$('.UseAllTreasures' ).hide();
			$('.MoveToBuyPhase'  ).hide();
			$('.MoveToNextPlayer').show();
			break;
	}
}



function PrintTurnInfo() {
	$('.TurnInfo-action').html( Game.TurnInfo.action );
	$('.TurnInfo-buy'   ).html( Game.TurnInfo.buy    );
	$('.TurnInfo-coin'  ).html( Game.TurnInfo.coin   );
}




function PrintTrashPile() {
	let $TrashPile = $('.TrashPile');
	if ( Game.TrashPile.length > 0 ) {
		$TrashPile.html( MakeHTML_Card( Game.TrashPile.back(), Game ) );
		$TrashPile.children('.card').addClass('up');  /* デフォルトは表 */
		$TrashPile.find('.card').emphasize_card();
	}
}







/* shortcut */
function PrintPlayersCardAreas( player_id ) {
	PrintOpen       ( player_id );
	PrintPlayArea   ( player_id );
	PrintAside      ( player_id );
	PrintDeck       ( player_id );
	PrintHandCards  ( player_id );
	PrintDiscardPile( player_id );
}






