$( function() {
	$('.back2roomlist').click( () => { window.location.href = 'Online_room_main.php'; } );


	FBref_Game.once( 'value' ).then( function( FBsnapshot ) {
		let Players = FBsnapshot.val().Players;
		for ( let i = 0; i < Players.length; ++i ) {
			Players[i] = new CPlayer( Players[i] );
			Players[i].HandCards = Players[i].GetDeckAll();
			Players[i].SortHandCards();
			const DeckAll = Players[i].HandCards;

			$deck_all = $(`.${Players[i].name} .deck_all`);
			$deck_all.html('');
			DeckAll.forEach( (card) =>
				$deck_all.append( `
					<button class='card face'
						data-card_no='${card.card_no}'
						data-card_name_jp='${Cardlist[ card.card_no ].name_jp}'>
					</button>
				` )
			);
		}
	} );



	// CardEffectBox

	$('.card_effect').click( function() {
		const card_no = $(this).attr('data-card_no');
		ShowCardEffectBox( Cardlist, card_no );
	});

});
