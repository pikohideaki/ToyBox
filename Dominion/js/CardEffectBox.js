
function SetCardEffectBoxSize() {
	const SizeOf$image_box = new SizeOfjQueryObj( $('.card_effect_image') );
	const box_height = SizeOf$image_box.height_without_padding();
	const box_width  = SizeOf$image_box.width_without_padding();
	$card = $('.card_biggest');

	if ( box_width < box_height * 15 / 23 ) {  // 横幅の方が狭い
		$card.width ( box_width );
		$card.height( box_width * 23 / 15 );
	} else {  // 縦幅の方が狭い
		$card.height( box_height );
		$card.width ( box_height * 15 / 23 );
	}
	$card.css( 'borderRadius', $card.width() / 10 );
}

function ShowCardEffectBox( Cardlist, card_no ) {
	const Card = Cardlist[card_no];
	MyAlert( {
		contents : `
			<div class='card_effect_text'>
				${Card.effect1}<br><br>
				${Card.effect2}<br><br>
				${Card.effect3}<br><br>
				${Card.effect4}<br><br>
			</div>
			<div class='card_effect_image'>
				${MakeHTML_CardBiggest( card_no )}
			</div> `,
	});

	SetCardEffectBoxSize();
}

$( function() {
	$(window).resize( SetCardEffectBoxSize );
});

