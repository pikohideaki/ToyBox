


function CGame( FBobj_Room ) {
	let FBobj_Game = FBobj_Room.Game;

	this.Message       = ( FBobj_Game.Message == '' ? undefined : FBobj_Game.Message );
	this.PlayerOrdered = FBobj_Room.PlayerOrdered;
	this.SelectedCards = FBobj_Room.SelectedCards;
	this.whose_turn_ID = FBobj_Game.whose_turn_ID;
	this.whose_turn    = FBobj_Room.PlayerOrdered[ this.whose_turn_ID ];
	this.TrashPile     = ( FBobj_Game.TrashPile || [] );
	this.TurnInfo      = FBobj_Game.TurnInfo;

	this.Supply        = new CSupply();
	this.Supply.InitByObj( FBobj_Game.Supply );

	this.Players       = {};
	for ( let key in FBobj_Game.Players ) {
		this.Players[key] = new CPlayer();
		this.Players[key].InitByObj( FBobj_Game.Players[key] );
	}

	this.temp = {};
}



CGame.prototype.NextPlayerID = function( current_player_id ) {
	 /* 0 -> 1 -> 2 -> 3 -> 0 */
	return (current_player_id + 1) % this.PlayerOrdered.length;
};



CGame.prototype.ResetTurnInfo = function() {
	this.TurnInfo.phase  = 'ActionPhase';
	this.TurnInfo.action = 1;
	this.TurnInfo.buy    = 1;
	this.TurnInfo.coin   = 0;

	/* アクションカードがなければスキップして購入フェーズに遷移 */
	// let pl = this.Players[ this.whose_turn ];
	// if ( pl.HandCards.findIndex( function( element, index, array ) {
	// 			return IsActionCard( Cardlist, element.card_no );
	// 		} ) < 0 )
	// {
	// 	this.TurnInfo.phase = 'BuyPhase';
	// }
	FBref_Game.child( 'TurnInfo' ).set( this.TurnInfo );
};


CGame.prototype.GameEnded = function() {
	if ( this.Supply.byName('Province').IsEmpty() ) return true;
	if ( this.Supply.byName('Colony').IsEmpty() ) return true;
	let empty_pile_num = 0;
	for ( let i = 0; i < this.Supply.Basic.length; ++i ) {
		if ( this.Supply.Basic[i].IsEmpty() ) empty_pile_num++;
	}
	for ( let i = 0; i < this.Supply.KingdomCards.length; ++i ) {
		if ( this.Supply.KingdomCards[i].IsEmpty() ) empty_pile_num++;
	}
	/* [ToDo] 闇市場，廃墟などもカウント */
	if ( empty_pile_num >= 3 ) return true;

	return false; /* otherwise */
};



CGame.prototype.SumUpVP = function() {
	for ( let key in this.Players ) {
		this.Players[key].SumUpVP();
	}
};



CGame.prototype.MoveToNextPlayer = function() {
	let G = this;
	// console.log( 'MoveToNextPlayer', G );
	// G.TurnInfo.phase = 'CleanUpPhase';
	G.Players[ G.whose_turn ].CleanUp();
	if ( G.GameEnded() ) {
		G.SumUpVP();
		let VPmax       = G.Players[myname].VPtotal;
		let VPmaxPlayer = myname;
		for ( let key in G.Players ) {
			if ( VPmax < G.Players[key].VPtotal ) {
				VPmax = G.Players[key].VPtotal;
				VPmaxPlayer = key;
			}
		}
		/* ゲーム結果画面へ遷移．得点等はfirebaseから読みこむ */
		FBref_Room.child('Status').set('ゲーム終了');
		return;
	}
	G.whose_turn_ID = G.NextPlayerID( G.whose_turn_ID );
	G.ResetTurnInfo();

	let updates = {};
	updates['Players/' + G.whose_turn ] = G.Players[ G.whose_turn ];
	updates['whose_turn_ID'] = G.whose_turn_ID;
	FBref_Game.update( updates );
};










CGame.prototype.TrashCardByID = function( card_ID ) {
	this.TrashPile.push( this.GetCardByID( card_ID, true ) );
};




CGame.prototype.GetCardByID = function( card_ID, remove_this_card = true ) {
	let card = new CCard();

	for ( let key in this.Players ) {
		let pl = this.Players[key];
		for ( let k = 0; k < pl.Deck.length; ++k ) {
			if ( card_ID == pl.Deck[k].card_ID ) {
				card = pl.Deck[k];
				if ( remove_this_card ) {
					pl.Deck.remove(k);
					FBref_Game.child('Players/' + key + '/Deck').set( pl.Deck );
				}
				return card;
			}
		}
		for ( let k = 0; k < pl.DiscardPile.length; ++k ) {
			if ( card_ID == pl.DiscardPile[k].card_ID ) {
				card = pl.DiscardPile[k];
				if ( remove_this_card ) {
					pl.DiscardPile.remove(k);
					FBref_Game.child('Players/' + key + '/DiscardPile').set( pl.DiscardPile );
				}
				return card;
			}
		}
		for ( let k = 0; k < pl.HandCards.length; ++k ) {
			if ( card_ID == pl.HandCards[k].card_ID ) {
				card = pl.HandCards[k];
				if ( remove_this_card ) {
					pl.HandCards.remove(k);
					FBref_Game.child('Players/' + key + '/HandCards').set( pl.HandCards );
				}
				return card;
			}
		}
		for ( let k = 0; k < pl.PlayArea.length; ++k ) {
			if ( card_ID == pl.PlayArea[k].card_ID ) {
				card = pl.PlayArea[k];
				if ( remove_this_card ) {
					pl.PlayArea.remove(k);
					FBref_Game.child('Players/' + key + '/PlayArea').set( pl.PlayArea );
				}
				return card;
			}
		}
		for ( let k = 0; k < pl.Aside.length; ++k ) {
			if ( card_ID == pl.Aside[k].card_ID ) {
				card = pl.Aside[k];
				if ( remove_this_card ) {
					pl.Aside.remove(k);
					FBref_Game.child('Players/' + key + '/Aside').set( pl.Aside );
				}
				return card;
			}
		}
	}

	for ( let i = 0; i < this.Supply.Basic.length; ++i ) {
		let spl = this.Supply.Basic[i].pile;
		for ( let k = 0; k < spl.length; ++k ) {
			if ( card_ID == spl[k].card_ID ) {
				card = spl[k];
				if ( remove_this_card ) {
					spl.remove(k);
					FBref_Game.child('Supply/Basic/' + i + '/pile').set( spl );
				}
				return card;
			}
		}
	}
	for ( let i = 0; i < this.Supply.KingdomCards.length; ++i ) {
		let spl = this.Supply.KingdomCards[i].pile;
		for ( let k = 0; k < spl.length; ++k ) {
			if ( card_ID == spl[k].card_ID ) {
				card = spl[k];
				if ( remove_this_card ) {
					spl.remove(k);
					FBref_Game.child('Supply/KingdomCards/' + i + '/pile').set( spl );
				}
				return card;
			}
		}
	}


	for ( let k = 0; k < this.TrashPile.length; ++k ) {
		if ( card_ID == this.TrashPile[k].card_ID ) {
			card = this.TrashPile[k];
			if ( remove_this_card ) {
				this.TrashPile.remove(k);
				FBref_Game.child('TrashPile').set( this.TrashPile );
			}
			return card;
		}
	}

	alert( 'ERROR: the card with ID:' + card_ID +' not found.' );
	return false;
};






CGame.prototype.GainCardToDiscardPile = function( supply_name, player_id ) {
	let gained_card = this.Supply.byName( supply_name ).GetTopCard();
	let pl = this.Players[ this.PlayerOrdered[player_id] ];
	if ( gained_card !== false ) { pl.AddToDiscardPile( gained_card ); }
};

CGame.prototype.GainCardToHandCards = function( supply_name, player_id ) {
	let gained_card = this.Supply.byName( supply_name ).GetTopCard();
	let pl = this.Players[ this.PlayerOrdered[player_id] ];
	if ( gained_card !== false ) { pl.AddToHandCards( gained_card ); }
};

CGame.prototype.GainCardToDeck = function( supply_name, player_id ) {
	let gained_card = this.Supply.byName( supply_name ).GetTopCard();
	let pl = this.Players[ this.PlayerOrdered[player_id] ];
	if ( gained_card !== false ) { pl.PutBackToDeck( gained_card ); }
};












CGame.prototype.UseCard = function( playing_card_no, playing_card_ID ) {
// console.log( "use-this" );
	if ( IsVictoryCard( Cardlist, playing_card_no ) ) {
		alert( '勝利点カードは使用できません' );   return;
	}
	if ( Game.TurnInfo.phase === 'ActionPhase'
		  && !IsActionCard( Cardlist, playing_card_no ) ) {
		alert( 'アクションカードを選んでください' );   return;
	}
	if ( Game.TurnInfo.phase === 'BuyPhase'
		  && !IsTreasureCard( Cardlist, playing_card_no ) ) {
		alert( '財宝カードを選んでください' );   return;
	}
	if ( Game.TurnInfo.phase === 'CleanUpPhase' ) {
		return;
	}
	if ( IsActionCard( Cardlist, playing_card_no )
		  && Game.TurnInfo.action <= 0 ) {
		alert( 'アクションが足りません' );   return;
	}
	/* カード移動 */
	let Me = Game.Players[ Game.whose_turn ];
	Me.AddToPlayArea( Game.GetCardByID( playing_card_ID, true ) );

	if ( IsActionCard( Cardlist, playing_card_no ) ) {
		Game.TurnInfo.action--;
		FBref_Game.child('TurnInfo').set( Game.TurnInfo );
	}

	Game.GetCardEffect( playing_card_no, playing_card_ID );
};




CGame.prototype.GetCardEffect = function( playing_card_no, playing_card_ID ) {
	let   G = this;
	let   Me           = G.Players[ G.whose_turn ];
	const playing_Card = Cardlist[ playing_card_no ];

	G.TurnInfo.action += playing_Card.action;
	G.TurnInfo.buy    += playing_Card.buy;
	G.TurnInfo.coin   += playing_Card.coin;
	Me.DrawCards( playing_Card.draw_card );

	if ( G.TurnInfo.phase === 'ActionPhase' ) {
		G.TurnInfo.phase = 'ActionPhase*';
	}
	if ( G.TurnInfo.phase === 'BuyPhase' ) {
		G.TurnInfo.phase = 'BuyPhase*';
	}

	let updates = {};
	updates['TurnInfo'] = G.TurnInfo;
	updates['Players/' + G.whose_turn] = Me;
	FBref_Game.update( updates );


	switch ( Cardlist[ playing_card_no ].name_eng ) {

		case 'Remodel' : { /* 9. 改築 */
			if ( $('.HandCards').children('.card').length <= 0 ) {
				FBref_Game.update( {
					'Message' : '手札にカードがありません。',
					'TurnInfo/phase' : 'ActionPhase'
				});
				break;
			} else {
				FBref_Game.child('Message').set( '手札のカードを1枚廃棄して下さい。' );
				/* 手札のカードのクリック動作を廃棄するカードの選択に変更 */
				$('.HandCards').children('.card').each( function() {
					$(this).addClass('Remodel_TrashHandCard');
				});
				break;
			}
		}

		case 'Moneylender' : { /* 11. 金貸し */
			let copper_card_ID = ( function() {
					for ( let i = 0; i < Me.HandCards.length; ++i ) {
						if ( Me.HandCards[i].card_no == CardName2No['Copper'] )
							return Me.HandCards[i].card_ID;
					}
					return -1;
				})();
			let updates = {};
			if ( copper_card_ID >= 0 ) {  /* copper found */
				G.TrashCardByID( copper_card_ID );
				updates['Players/' + G.whose_turn] = Me;
				updates['TrashPile'] = G.TrashPile;
				updates['TurnInfo/coin'] = G.TurnInfo.coin + 3;
			}
			updates['TurnInfo/phase'] = 'ActionPhase';
			FBref_Game.update( updates );
			break;
		}

		case 'Council Room' : { /* 13. 議事堂 */
			for ( let i = G.NextPlayerID( G.whose_turn_ID ); i != G.whose_turn_ID; i = G.NextPlayerID(i) ) {
				G.Players[ G.PlayerOrdered[i] ].DrawCards(1);
			}
			FBref_Game.child('TurnInfo/phase').set( 'ActionPhase' );
			break;
		}


		// case 'Throne Room' :  /* 14. 玉座の間 */
				// FBref_Game.child('Message').set( '手札のカードを1枚廃棄して下さい。' );
		// 	$('#Message').html('手札のアクションカードを1枚選択して下さい。');
		// 	this.PrintHTML_Buttons( '完了', 'Game.PrintHTML_default();' );

		// 	this.MakeHTML_HandCards( function(i) {
		// 			var card = this.Cardlist[ pl.HandCards[i].card_no ];
		// 			if ( IsActionCard( this.Cardlist, pl.HandCards[i].card_no ) ) {
		// 				return " Game.Players[ Game.whose_turn ].MoveHandCardToPlayArea("+i+");"
		// 					+ " Game.PrintHandCards(); "
		// 					+ " Game.PrintPlayerInfo(); "
		// 					+ " Game.GetCardEffect(" + pl.HandCards[i].card_no + ',' + pl.HandCards[i].card_ID + ");"
		// 					+ " Game.GetCardEffect(" + pl.HandCards[i].card_no + ',' + pl.HandCards[i].card_ID + ");";
		// 			} else {
		// 				return " alert(\"このカードはアクションカードではありません。\"); ";
		// 			}

		// 			return " Game.TrashHandCard("+i+");"
		// 				+ " Game.PrintHTML(); "
		// 				+ " Game.TrashedCardCost = "+card.cost+"; "
		// 				+ " Game.TempObj.print_html2(); "
		// 	} );
		// 	break;



		case 'Mine' : { /* 16. 鉱山 */
			let $handcards_treasure
				= $('.HandCards')
					.children('.card')
					.filter( function() {
						return IsTreasureCard( Cardlist, Number( $(this).attr('data-card_no') ) );
					});

			if ( $handcards_treasure.length <= 0 ) {
				FBref_Game.update( {
					'Message' : '手札に財宝カードがありません。',
					'TurnInfo/phase' : 'ActionPhase'
				} );
				break;
			} else {
				FBref_Game.child('Message').set( '手札の財宝カードを1枚廃棄して下さい。' );
				/* 手札の財宝カードのクリック動作を廃棄するカードの選択に変更 */
				$('.HandCards')
					.children('.card')
					.filter( function() {
						return IsTreasureCard( Cardlist, Number( $(this).attr('data-card_no') ) );
					})
					.each( function() {
						$(this).addClass('Mine_TrashHandCard');
					});
				break;
			}
			break;
		}



		case 'Workshop' : { /* 17. 工房 */
			FBref_Game.child('Message').set( 'コスト4以下のカードを獲得して下さい。' );
			$('.SupplyArea').find('.card')
				.each( function() { $(this).addClass('Workshop_GetCard'); } );
			break;
		}



		case 'Chancellor' : { /* 18. 宰相 */
			let updates = {};
			if ( confirm( '山札を捨て札に置きますか？' ) ) {
				Me.Deck.reverse();  /* 山札をそのままひっくり返して捨て山に置く */
				Me.DiscardPile.copyfrom( Me.Deck );
				Me.Deck = [];
				updates[ 'Players/' + G.whose_turn ] = Me;
			}
			updates['TurnInfo/phase'] = 'ActionPhase';
			FBref_Game.update( updates );
			break;
		}



		case 'Feast' : { /* 19. 祝宴 */
			G.TrashCardByID( playing_card_ID );
			FBref_Game.child('Message').set( 'コスト5以下のカードを獲得して下さい。' );
			$('.SupplyArea').find('.card')
				.each( function() { $(this).addClass('Feast_GetCard'); } );
			break;
		}



		// case 'Library' :  /* 21. 書庫 */
		// 	while ( pl.Drawable() && pl.HandCards.length < 7 ) {
		// 		var deck_top_card = pl.GetDeckTopCard();
		// 		if ( IsActionCard( this.Cardlist, deck_top_card.card_no ) ) {
		// 			var msg = this.Cardlist[ deck_top_card.card_no ].name_jp+'を脇に置きますか？';
		// 			if ( confirm( msg ) ) {
		// 				pl.Aside.push( deck_top_card );
		// 				this.PrintHTML_default();
		// 				continue;
		// 			}
		// 		}
		// 		pl.AddToHandCards( deck_top_card );
		// 	}

		// 	/* move cards in pl.Aside to DiscardPile */
		// 	Array.prototype.push.apply( pl.DiscardPile, pl.Aside );
		// 	pl.Aside = [];
		// 	this.TurnInfo.phase = 'ActionPhase';

		// 	this.PrintHTML_default();
		// 	break;



		case 'Cellar' : { /* 22. 地下貯蔵庫 */
			FBref_Game.child('Message').set( '手札から任意の枚数を捨て札にして下さい。' );
			temp = {}; /* reset */
			temp.discard_num = 0;
			console.log( temp.discard_num );
			$('#action_buttons').append( "<input type='button'\
					class='btn-blue Cellar_DiscardDone' value='OK' >" );
			$('.HandCards')
				.children('.card').each( function() {
					$(this).addClass('Cellar_DiscardHandCard');
				});
			break;
		}

		// 	this.PrintHTML_Buttons(
		// 			'完了', 
		// 			" Game.Players[ Game.whose_turn ].DrawCards( Game.DiscardedNum ); " +
		// 			" Game.DeleteTempObj(); " +
		// 			" Game.PrintHTML_default(); "
		// 		);
		// 	this.TempObj.print_html2();

		// 	this.TempObj.DiscardedNum = 0;  /* 捨て札にした枚数 */
		// 	this.TempObj.print_html2 = function() {
		// 		this.PrintHTML_HandCards( function(i) {
		// 					return 
		// 						" Game.Players[ Game.whose_turn ].Discard("+i+"); " +
		// 						" Game.TempObj.DiscardedNum++; " +
		// 						" Game.PrintHTML_ReadOnlyObj(); " +
		// 						" Game.TempObj.print_html2(); " +
		// 						" $(\"#Message\").html(\"手札から任意の枚数を捨て札にして下さい。&emsp;捨て札にした枚数 ： \"+Game.DiscardedNum+\"枚\"); ";
		// 			} );
		// 	};



		// case 'Thief' :  /* 24. 泥棒 */
		// 	for ( var i = this.NextPlayerID(this.whose_turn); i != this.whose_turn; i = this.NextPlayerID(i) ) {
		// 		var opponent = this.Players[i];
		// 		if ( opponent.HaveReactionCard() ) {

		// 		}
		// 	}
		// 	this.PrintHTML_default();
		// 	break;



		// case 'Adventurer' :  /* 25. 冒険者 */
		// 	var treasure_num = 0;
		// 	while ( pl.Drawable() && treasure_num < 2 ) {
		// 		var deck_top_card = pl.GetDeckTopCard()
		// 		if ( IsTreasureCard( this.Cardlist, deck_top_card.card_no ) ) {
		// 			treasure_num++;
		// 		}
		// 		pl.Aside.push( deck_top_card );
		// 		this.PrintHTML_default();
		// 	}
		// 	while ( pl.Aside.length > 0 ) {
		// 		var elm = pl.Aside.pop();
		// 		if ( IsTreasureCard( this.Cardlist, elm.card_no ) ) {
		// 			pl.AddToHandCards( elm );
		// 		} else {
		// 			pl.DiscardPile.push( elm );
		// 		}
		// 	}
		// 	this.PrintHTML_default();
		// 	break;



		// case 'Witch' :  /* 27. 魔女 */
		// 	for ( var i = this.NextPlayerID(this.whose_turn); i != this.whose_turn; i = this.NextPlayerID(i) ) {
		// 		var opponent = this.Players[i];
		// 		if ( opponent.HaveReactionCard() ) {

		// 		}
		// 		this.GainCardToDiscardPile( this.Name2SupplyID['Curse'], i );
		// 	}
		// 	this.PrintHTML_default();
		// 	break;



		// case 'Spy' :  /* 28. 密偵 */
		// 	for ( var i = this.NextPlayerID(this.whose_turn); i != this.whose_turn; i = this.NextPlayerID(i) ) {
		// 		var opponent = this.Players[i];
		// 		if ( opponent.HaveReactionCard() ) {

		// 		}
		// 	}
		// 	this.PrintHTML_default();
		// 	break;



		// case 'Militia' :  /* 29. 民兵 */
		// 	for ( var i = this.NextPlayerID(this.whose_turn); i != this.whose_turn; i = this.NextPlayerID(i) ) {
		// 		var opponent = this.Players[i];
		// 		if ( opponent.HaveReactionCard() ) {

		// 		}
		// 		this.ReduceHandCardsTo( 3, i );
		// 	}
		// 	this.PrintHTML_default();
		// 	break;



		// case 'Bureaucrat' :  /* 31. 役人 */
		// 	this.GainCardToDeck( this.Name2SupplyID['Silver'  ], this.whose_turn );
		// 	for ( var i = this.NextPlayerID(this.whose_turn); i != this.whose_turn; i = this.NextPlayerID(i) ) {
		// 		var opponent = this.Players[i];
		// 		if ( opponent.HaveReactionCard() ) {

		// 		}
		// 		/* 公開 */
		// 		/* 勝利点カードを1枚戻す */
		// 	}
		// 	this.PrintHTML_default();
		// 	break;



		// case 'Chapel' :  /* 32. 礼拝堂 */
			// FBref_Game.child('Message').set( '手札を4枚まで廃棄して下さい。' );

		// 	var finished_action = " Game.PrintHTML_default(); Game.DeleteTempObj(); ";

		// 	this.PrintHTML_Buttons( '完了', finished_action );

		// 	this.TempObj.TrashedNum = 0;

		// 	this.TempObj.print_html2 = function() {
		// 		this.PrintHTML_HandCards( function(i) {
		// 				return 
		// 					" Game.TrashHandCard("+i+"); " +
		// 					" Game.TrashedNum++; " +
		// 					" if ( Game.TrashedNum >= 4 ) {" +
		// 					      finished_action +
		// 					" } else {" +
		// 					"     Game.TempObj.print_html2();" +
		// 					"     Game.PrintHTML_ReadOnlyObj(); " +
		// 					" }";
		// 			} );
		// 	};
		// 	this.TempObj.print_html2();
		// 	break;




		default :
			if ( G.TurnInfo.phase === 'ActionPhase*' ) {
				FBref_Game.child('TurnInfo/phase').set( 'ActionPhase' );
			}
			if ( G.TurnInfo.phase === 'BuyPhase*' ) {
				FBref_Game.child('TurnInfo/phase').set( 'BuyPhase' );
			}
			break;
	}




};
