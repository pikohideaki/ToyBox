

/* 常駐ボタン */

$( function() {

	/* buttons */
	$('.SortHandCards').click( function() {
		Game.Players[myid].SortHandCards();
		FBref_Game.child(`Players/${myid}/HandCards`).set( Game.Players[myid].HandCards );
	});

	$('.MoveToBuyPhase').click( function() {
		Game.MovePhase( 'BuyPhase' );
	});

	$('.MoveToNextPlayer').click( function() {
		Game.MoveToNextPlayer();
	});

	$('.logallcards').click( function() {
		let AllCards = Game.GetAllCards();
		// console.log( AllCards );
		// AllCardsNo = AllCards.map( a => a.card_no ).sort();
		AllCardsNo = AllCards.map( a => a.card_no ).uniq().sortNumeric();
		console.log( AllCardsNo );
	});


	// カードリスト
	function SetZoomedCardBoxSize() {
		$card = $('.CardView_zoom .card_biggest');
		const SizeOf$card = new SizeOfjQueryObj( $card );
		$card.width( SizeOf$card.height * 15 / 23 );
		$card.css( 'borderRadius', $card.width() / 10 );
	}

	$('.card_view').click( function() {
		$('.CardView-wrapper').fadeToggle();
		SetZoomedCardBoxSize();
	});

	$(window).resize( SetZoomedCardBoxSize );

	// ESCで閉じる
	$(document).keydown( function(e) {
		if ( e.keyCode == 27 ) {  // ESC 入力
			$('.CardView-wrapper').fadeOut();
		}
	});


	// $('.main').on( 'click', '.zoom_card', function(event) {
	// 	event.stopImmediatePropagation();
	// 	console.log( $(this).parent().attr('data-card_no') );
	// });

	// $('.HandCards').click( function() { console.log('HandCards'); } );
	// $('.TurnAction').click( function() { console.log('TurnAction'); } );
	// $('.main').click( function() { console.log('main'); } );



	$('.UseAllTreasures').click( () => MyAsync( function*() {
		yield FBref_Game.child('phase').set( 'BuyPhase*' );
		const BasicTreasures
			= Game.player().HandCards.filter( card =>
				card.card_no == CardName2No['Copper'  ] ||
				card.card_no == CardName2No['Silver'  ] ||
				card.card_no == CardName2No['Gold'    ] ||
				card.card_no == CardName2No['Platinum'] ||
				card.card_no == CardName2No['Potion'  ] );

		const card_names = [];
		for( let i = 0; i < BasicTreasures.length; ++i ) {
			Game.Play( BasicTreasures[i].card_ID );  /* カード移動 */
			Game.TurnInfo.coin += Cardlist[ BasicTreasures[i].card_no ].coin;

			// 銅細工師
			if ( BasicTreasures[i].card_no == CardName2No['Copper'] ) {
				Game.TurnInfo.coin += Game.TurnInfo.add_copper_coin;
			}
			card_names.push( Cardlist[ BasicTreasures[i].card_no ].name_jp );
		}

		yield Promise.all( [
			FBref_chat.push(
				`${Game.player().name}が（${card_names.join('，')}）を使用しました。` ),

			FBref_Game.update( {
				[`Players/${Game.player().id}`] : Game.player(),
				'TurnInfo/coin' : Game.TurnInfo.coin,
				phase : 'BuyPhase',
			} ),
		]);
	}) );



	$('.CardAreaOfPlayer.HandCards').on( 'click', '.card.use-this', function() {
		Game.UseCard( Number( $(this).attr('data-card_no') ), Number( $(this).attr('data-card_ID') ) );
	});





	$('.SupplyArea').on( 'click', '.card.BuyCard', function() {
		let $this = $(this);
		return MyAsync( function*() {
			const clicked_pile_num = $this.children('.card-num-of-remaining').html();

			if ( Game.TurnInfo.buy <= 0 ) {
				yield MyAlert( 'これ以上購入できません。' );
				return;
			}

			const clicked_card_name_eng = $this.attr('data-card-name-eng');
			const clicked_card = Game.Supply.byName(clicked_card_name_eng).LookTopCard();
			const clicked_card_no = clicked_card.card_no;
			const clicked_card_ID = clicked_card.card_ID;
			const clicked_card_cost = Game.GetCost( clicked_card_no );

			// [memo] コスト比較において '>' は not <= とは異なる
			if ( !CostOp( '<=', clicked_card_cost,
					[ Game.TurnInfo.coin, Game.TurnInfo.potion, 10000 ] ) )
			{
				yield MyAlert( 'お金が足りません。' );
				return;
			}
			yield Game.BuyCardFromSupply( clicked_card_ID )   /* カード移動 */
			Game.TurnInfo.buy--;
			Game.TurnInfo.coin   -= clicked_card_cost.coin;
			Game.TurnInfo.potion -= clicked_card_cost.potion;

			if ( Game.phase == 'BuyPhase' ) {
				Game.phase = 'BuyPhase_GetCard';  // 一度購入を始めたら以降財宝カードを追加で使用することはできない
			}

			yield FBref_Game.update( {
				TurnInfo : Game.TurnInfo,
				phase : Game.phase,
			} );

			// buyが0なら自動でターン終了
			if ( Game.TurnInfo.buy <= 0 ) {
				yield Game.MoveToNextPlayer();
			}
		});
	});




	$('.CardView_list').on( {
		mouseenter : function(){
			$('.CardView_zoom .card_biggest')
			  .attr('data-card_no', Number( $(this).attr('data-card_no') ) )
		},
		click      : function(){
			$('.CardView_zoom .card_biggest')
			  .attr('data-card_no', Number( $(this).attr('data-card_no') ) )
		},
		// mouseleave : function(){  },
	}, '.card_biggest' );

	$('.chbox_SkipReaction').change( function() {
		FBref_Settings.child(`SkipReaction/${myid}`).set( $(this).prop('checked') );
	});


});
