
function ShowDialog( options ) {
	$('.dialog_text'    ).html( options.message  || '' );
	$('.dialog_contents').html( options.contents || '' );
	$('.dialog_buttons' ).html( options.buttons  || '' );
	$('.dialog-wrapper').fadeIn();
}


function HideDialog() {
	/* リセット */
	$('.dialog_text').html('');
	$('.dialog_contents').html('');
	$('.dialog_buttons').html('');
	$('.dialog-wrapper').fadeOut();
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







function PrintCardArea_sub( CardArea, $CardArea, face_down = 'face' ) {
	$CardArea.html('');
	CardArea.forEach( (card) => $CardArea.append( MakeHTML_Card( card ) ) );

	switch ( face_down ) {
		case 'face' :  /* デフォルトは表 */
			$CardArea.children('.card').removeClass('down').addClass('face'); break;
		case 'down' :  /* デフォルトは裏 */
			$CardArea.children('.card').removeClass('face').addClass('down'); break;
		default :
			break;
	}
	/* 裏表に特別な指定があれば優先 */
	for ( let i = 0; i < CardArea.length; ++i ) {
		if ( CardArea[i].face == true ) $CardArea.children('.card').eq(i).removeClass('down').addClass('face');
		if ( CardArea[i].down == true ) $CardArea.children('.card').eq(i).removeClass('face').addClass('down');
	}

	// $CardArea.children('.card.down').children('.card-cost-coin').remove();
	$CardArea.children('.card').css( 'box-shadow', '0 0 20px #3DAAEE' ).animate({boxShadow: 'none'}, 'slow');
}

function PrintCardAreaOfPlayer( CardAreaName, face_down, displaynone = false ) {
	let $CardArea = $(`.CardAreaOfPlayer.${CardAreaName}`);
	let CardArea = Game.player()[CardAreaName];
	PrintCardArea_sub( CardArea, $CardArea, face_down );
	ChangeHeightOrShrinkWidth( $CardArea, SizeOf$Card );  /* 圧縮表示 or 多段表示 */
	if ( displaynone && CardArea.length == 0 ) { $CardArea.hide(); } else { $CardArea.show(); }
}

function PrintMyCardArea( CardAreaName, face_down, displaynone ) {
	let MyCardArea = Game.Players[ myid ][ CardAreaName ];
	let $MyCardArea = $(`.My${CardAreaName}`);
	PrintCardArea_sub( MyCardArea, $MyCardArea, face_down );
	ChangeHeightOrShrinkWidth( $MyCardArea, SizeOf$Card );  /* 圧縮表示 or 多段表示 */
	if ( displaynone && MyCardArea.length == 0 ) { $MyCardArea.hide(); } else { $MyCardArea.show(); }
	// ChangeHeight( $MyCardArea );
}

function PrintCardAreaSmall( player_id, CardAreaName, face_down, displaynone ) {
	let $CardArea = $(`.OtherPlayer[data-player_id='${player_id}'] .s${CardAreaName}`);
	let CardArea = Game.Players[ player_id ][CardAreaName];
	PrintCardArea_sub( CardArea, $CardArea, face_down );
	ShrinkWidth( $CardArea, SizeOf$ssCard );  /* 圧縮表示 or 多段表示 */
	if ( displaynone && CardArea.length == 0 ) { $CardArea.hide(); } else { $CardArea.show(); }
}


function PrintHandCardsOfPlayer() {
	let $HandCards = $('.CardAreaOfPlayer.HandCards');
	let HandCards = Game.player().HandCards;
	PrintCardArea_sub( HandCards, $HandCards, ( Game.whose_turn_id == myid ? 'face' : 'down' ) );

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
	$HandCards.children('.card').css( 'box-shadow', '0 0 20px #3DAAEE' ).animate({boxShadow: 'none'}, 'slow');
}


function PrintDeck_sub( player_id, $Deck ) {
	let Deck = Game.Players[ player_id ].Deck;
	$Deck.html('');
	if ( Deck.length > 0 ) {
		$Deck.html( MakeHTML_Card( Deck[0] ) );
		/* 山札枚数表示 */
		$Deck.find('.card')
			.append(`<span class='card-num-of-remaining'>${Deck.length}</span>` )
			// .children('.card-cost-coin').remove();

		/* デフォルトは裏 */
		$Deck.find('.card').removeClass('face').addClass('down');
		/* 裏表に特別な指定があれば優先 */
		if ( Deck[0].face == true ) $Deck.children('.card').removeClass('down').addClass('face');
		if ( Deck[0].down == true ) $Deck.children('.card').removeClass('face').addClass('down');
		$Deck.find('.card').css( 'box-shadow', '0 0 20px #3DAAEE' ).animate({boxShadow: 'none'}, 'slow');
	}
}

function PrintDiscardPile_sub( player_id, $DiscardPile ) {
	let DiscardPile = Game.Players[ player_id ].DiscardPile;
	$DiscardPile.html('');
	if ( DiscardPile.length > 0 ) {
		$DiscardPile.html( MakeHTML_Card( DiscardPile.back() ) );

		/* デフォルトは表 */
		$DiscardPile.find('.card').removeClass('down').addClass('face');
		/* 裏表に特別な指定があれば優先 */
		if ( DiscardPile.back().face == true ) $DiscardPile.children('.card').removeClass('down').addClass('face');
		if ( DiscardPile.back().down == true ) $DiscardPile.children('.card').removeClass('face').addClass('down');
		$DiscardPile.find('.card').css( 'box-shadow', '0 0 20px #3DAAEE' ).animate({boxShadow: 'none'}, 'slow');
	}
}



function PrintPlayArea( player_id ) {
	if ( player_id == Game.whose_turn_id ) PrintCardAreaOfPlayer( 'PlayArea', 'face', false );
	if ( player_id == myid ) PrintMyCardArea( 'PlayArea', 'face', true );
	PrintCardAreaSmall( player_id, 'PlayArea', 'face', true );
}

function PrintAside( player_id ) {
	if ( player_id == Game.whose_turn_id ) PrintCardAreaOfPlayer( 'Aside', 'face', false );
	if ( player_id == myid ) PrintMyCardArea( 'Aside', 'face', true );
	PrintCardAreaSmall( player_id, 'Aside', 'face', true );
}

function PrintOpen( player_id ) {
	if ( player_id == Game.whose_turn_id ) PrintCardAreaOfPlayer( 'Open', 'face', true );
	if ( player_id == myid ) PrintMyCardArea( 'Open', 'face', true );
	PrintCardAreaSmall( player_id, 'Open', 'face', true );
}

function PrintHandCards( player_id ) {
	if ( player_id == Game.whose_turn_id ) PrintHandCardsOfPlayer();
	if ( player_id == myid ) PrintMyCardArea( 'HandCards', 'face', false );
	PrintCardAreaSmall( player_id, 'HandCards', ( player_id == myid ? 'face' : 'down' ), false );
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
	let $SupplyArea1 = $('.SupplyArea.line1');
	$SupplyArea1.html('');

	$SupplyArea1.append( MakeHTML_SupplyPile( Game.Supply.byName('Copper'  ), Cardlist ) );
	$SupplyArea1.append( MakeHTML_SupplyPile( Game.Supply.byName('Silver'  ), Cardlist ) );
	$SupplyArea1.append( MakeHTML_SupplyPile( Game.Supply.byName('Gold'    ), Cardlist ) );
	if ( RoomInfo.SelectedCards.Prosperity ) {
		$SupplyArea1.append( MakeHTML_SupplyPile( Game.Supply.byName('Platinum'), Cardlist ) );
	}
	$SupplyArea1.append( MakeHTML_SupplyPile( Game.Supply.byName('Estate'  ), Cardlist ) );
	$SupplyArea1.append( MakeHTML_SupplyPile( Game.Supply.byName('Duchy'   ), Cardlist ) );
	$SupplyArea1.append( MakeHTML_SupplyPile( Game.Supply.byName('Province'), Cardlist ) );
	if ( RoomInfo.SelectedCards.Prosperity ) {
		$SupplyArea1.append( MakeHTML_SupplyPile( Game.Supply.byName('Colony'), Cardlist ) );
	}
	$SupplyArea1.append( MakeHTML_SupplyPile( Game.Supply.byName('Curse'   ), Cardlist ) );

	/* SupplyArea line2 */
	let $SupplyArea2 = $('.SupplyArea.line2');
	$SupplyArea2.html('');
	for ( let i = 0; i < KINGDOMCARD_SIZE / 2; ++i ) {
		$SupplyArea2.append( MakeHTML_SupplyPile( Game.Supply.KingdomCards[i], Cardlist ) );
	}

	/* SupplyArea line3 */
	let $SupplyArea3 = $('.SupplyArea.line3');
	$SupplyArea3.html('');
	for ( let i = KINGDOMCARD_SIZE / 2; i < KINGDOMCARD_SIZE; ++i ) {
		$SupplyArea3.append( MakeHTML_SupplyPile( Game.Supply.KingdomCards[i], Cardlist ) );
	}

	if ( Game.phase == 'BuyPhase' || Game.phase == 'BuyPhase_GetCard' ) {
		$('.SupplyArea').find('.card').each( function() {
			$(this).addClass('BuyCard pointer');
		});
	}
	$('.SupplyArea').find('.card').css( 'box-shadow', '0 0 20px #3DAAEE' ).animate({boxShadow: 'none'}, 'slow');

}




function PrintPhase() {
	/* phase変更時に，データの変更の有無にかかわらず再表示しないといけないもの（クラスの書き換えなど） */
	PrintSupply();
	PrintHandCardsOfPlayer();

	switch ( Game.phase ) {
		case 'ActionPhase' : {
			FBref_Message.set( 'アクションカードを選択してください。' );
			$('.phase').html('アクションフェーズ');
			$('.SortHandCards').show();
			$('.MoveToBuyPhase').show();
			$('.MoveToNextPlayer').show();
		} break;

		case 'ActionPhase*' : {
			$('.phase').html('アクションフェーズ');
			$('.SortHandCards').hide();
			$('.MoveToBuyPhase').hide();
			$('.MoveToNextPlayer').hide();
		} break;

		case 'BuyPhase' : {
			FBref_Message.set( '財宝カードを場に出した後カードを購入してください。' );
			$('.phase').html('購入フェーズ');
			$('.SortHandCards').show();
			$('.MoveToBuyPhase').hide();
			$('.MoveToNextPlayer').show();
		} break;

		case 'BuyPhase_GetCard' : {
			FBref_Message.set( 'カードを購入してください。' );
			$('.phase').html('購入フェーズ');
			$('.SortHandCards').show();
			$('.MoveToBuyPhase').hide();
			$('.MoveToNextPlayer').show();
		} break;

		default : {
			$('.phase').html('');
			$('.SortHandCards').show();
			$('.MoveToBuyPhase').hide();
			$('.MoveToNextPlayer').show();
		} break;
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
		$TrashPile.html( MakeHTML_Card( Game.TrashPile.back() ) );
		$TrashPile.children('.card').addClass('face');  /* デフォルトは表 */
		$TrashPile.find('.card').css( 'box-shadow', '0 0 20px #3DAAEE' ).animate({boxShadow: 'none'}, 'slow');
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


