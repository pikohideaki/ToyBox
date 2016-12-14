


//function CSupplyCard( card_no, card_ID ) {
//	/* no : カードの種類を識別する番号
//	 * ID : ゲームに使われるカード1枚1枚を全て区別するための通し番号 */
//	this.card_no = Number( card_no );
//	this.card_ID = Number( card_ID );
//}




// function CSupply( in_card_no, size ) {
// 	this.card_no = Number( in_card_no );
// 	this.pile    = new Array(size);
// 	for ( var i = 0; i < size; ++i ) {
// 		this.pile[i] = new CSupplyCard( in_card_no, global_card_ID++ );
// 	}
// }

// CSupply.prototype.TopCardNo = function() {
// 	if ( this.pile.length > 0 ) {
// 		return this.pile[0].card_no;
// 	} else {
// 		return this.card_no;
// 	}
// };
// CSupply.prototype.IsEmpty = function() {
// 	return this.pile.length <= 0;
// };




// function CGame( player_num, in_Cardlist, in_CardName2No ) {
	// this.Cardlist    = in_Cardlist.concat();
	// this.CardName2No = $.extend( true, {}, in_CardName2No ); /* copy */

	// this.TempObj = {};

	// this.whose_turn = 0;
	// this.TurnInfo = { phase : 'ActionPhase', action : 1, buy : 1, coin : 0 };
	// this.SelectedKingdomCards = [ 8,9,10,11,12, 13,14,15,16,17 ];
	// this.Name2SupplyID = {};  /* reverse dictionary */

	/* area */
	// this.Players = [];
	// for ( var i = 0; i < player_num; i++ ) {
	// 	this.Players[i] = new CPlayer( 'player'+i, in_Cardlist, in_CardName2No );
	// }
	// this.Supply = [];
	// this.TrashPile = [];


	/* constructor */
// 	this.InitSupply();
// 	this.ResetTurn();
// 	this.PrintHTML_default();
// }



// CGame.prototype.DeleteTempObj = function() {
// 	for ( var key in this.TempObj ) {
// 		delete this.TempObj[key];
// 	}
// };



// CGame.prototype.LogAllCards = function() {
// 	console.log( this.TrashPile );
// 	for ( var i = 0; i < this.Players.length; ++i ) { 
// 		console.log( 'player' + i + ' : ', this.Players[i].GetDeckAll() );
// 	}
// 	for ( var i = 0; i < this.Supply.length; ++i ) {
// 		console.log( 'supply' + i + ' : ', this.Supply[i].pile );
// 	}
// };



// CGame.prototype.InitSupply = function() {
// 	var k = 0;
// 	while ( k < 10 ) {
// 		this.Supply[k] = new CSupply( this.SelectedKingdomCards[k], 10 );
// 		++k;
// 	}
// 	this.Supply[k] = new CSupply( this.CardName2No['Copper'  ], 60 - this.Players.length * 7         );   ++k;
// 	this.Supply[k] = new CSupply( this.CardName2No['Silver'  ], 40                                   );   ++k;
// 	this.Supply[k] = new CSupply( this.CardName2No['Gold'    ], 30                                   );   ++k;
// 	this.Supply[k] = new CSupply( this.CardName2No['Estate'  ], ( this.Players.length > 2 ? 12 : 8 ) );   ++k;
// 	this.Supply[k] = new CSupply( this.CardName2No['Duchy'   ], ( this.Players.length > 2 ? 12 : 8 ) );   ++k;
// 	this.Supply[k] = new CSupply( this.CardName2No['Province'], ( this.Players.length > 2 ? 12 : 8 ) );   ++k;
// 	this.Supply[k] = new CSupply( this.CardName2No['Curse'   ], 10 * ( this.Players.length - 1 )     );   ++k;


// 	/* make reverse dictionary */
// 	var l = 0;
// 	while ( l < 10 ) {
// 		this.Name2SupplyID[ this.Cardlist[ this.Supply[l].card_no ].name_eng ] = l;
// 		++l;
// 	}
// 	this.Name2SupplyID['Copper'  ] = l;   ++l;
// 	this.Name2SupplyID['Silver'  ] = l;   ++l;
// 	this.Name2SupplyID['Gold'    ] = l;   ++l;
// 	this.Name2SupplyID['Estate'  ] = l;   ++l;
// 	this.Name2SupplyID['Duchy'   ] = l;   ++l;
// 	this.Name2SupplyID['Province'] = l;   ++l;
// 	this.Name2SupplyID['Curse'   ] = l;   ++l;

// 	if ( k != l ) alert( "error at making Name2SupplyID (in CGame::InitSupply() )");
// };



//CGame.prototype.NextPlayerID = function( current_player_id ) {
//	 /* 0 -> 1 -> 2 -> 3 -> 0 */
//	return (current_player_id + 1) % this.Players.length;
//};



// CGame.prototype.ResetTurn = function() {
// 	this.TurnInfo.phase  = 'ActionPhase';
// 	this.TurnInfo.action = 1;
// 	this.TurnInfo.buy    = 1;
// 	this.TurnInfo.coin   = 0;

// 	/* アクションカードがなければスキップして購入フェーズに遷移 */
// 	var pl = this.Players[ this.whose_turn ];
// 	if ( pl.HandCards.findIndex( function( element, index, array ) {
// 				return IsActionCard( this.Cardlist, element.card_no );
// 			} ) < 0 )
// 	{
// 		this.TurnInfo.phase = 'BuyPhase';
// 	}
// };



// CGame.prototype.GameEnded = function() {
// 	if ( this.Supply[ this.Name2SupplyID['Province'] ].pile.length <= 0 ) return true;
// 	var empty_pile_num = 0;
// 	for ( var i = 0; i < this.Supply.length; i++ ) {
// 		if ( this.Supply[i].pile.length <= 0 ) empty_pile_num++;
// 	}
// 	if ( empty_pile_num >= 3 ) return true;

// 	return false; /* otherwise */
// };



// CGame.prototype.SumUpVP = function() {
// 	for ( var i = 0; i < this.Players.length; i++ ) {
// 		this.Players[i].SumUpVP();
// 	}
// };



// CGame.prototype.GetCardByID = function( card_ID, remove_this_card ) {
// 	for ( var i = 0; i < this.Players.length; ++i ) {
// 		var pl = this.Players[i];
// 		for ( var k = 0; k < pl.Deck.length       ; ++k ) {
// 			if ( card_ID === pl.Deck[k].card_ID        ) {
// 				var card = pl.Deck[k];
// 				if ( remove_this_card === true ) pl.Deck.splice( k, 1 );
// 				return card;
// 			}
// 		}
// 		for ( var k = 0; k < pl.DiscardPile.length; ++k ) {
// 			if ( card_ID === pl.DiscardPile[k].card_ID ) {
// 				var card = pl.DiscardPile[k];
// 				if ( remove_this_card === true ) pl.DiscardPile.splice( k, 1 );
// 				return card;
// 			}
// 		}
// 		for ( var k = 0; k < pl.HandCards.length  ; ++k ) {
// 			if ( card_ID === pl.HandCards[k].card_ID   ) {
// 				var card = pl.HandCards[k];
// 				if ( remove_this_card === true ) pl.HandCards.splice( k, 1 );
// 				return card;
// 			}
// 		}
// 		for ( var k = 0; k < pl.PlayArea.length   ; ++k ) {
// 			if ( card_ID === pl.PlayArea[k].card_ID    ) {
// 				var card = pl.PlayArea[k];
// 				if ( remove_this_card === true ) pl.PlayArea.splice( k, 1 );
// 				return card;
// 			}
// 		}
// 		for ( var k = 0; k < pl.Aside.length       ; ++k ) {
// 			if ( card_ID === pl.Aside[k].card_ID        ) {
// 				var card = pl.Aside[k];
// 				if ( remove_this_card === true ) pl.Aside.splice( k, 1 );
// 				return card;
// 			}
// 		}
// 	}
// 	for ( var i = 0; i < this.Supply.length; ++i ) {
// 		var spl = this.Supply[i].pile;
// 		for ( var k = 0; k < spl.length; ++k ) {
// 			if ( card_ID === spl[k].card_ID ) {
// 				var card = spl[k];
// 				if ( remove_this_card === true ) spl.splice( k, 1 );
// 				return card;
// 			}
// 		}
// 	}
// 	for ( var k = 0; k < this.TrashPile.length; ++k ) {
// 		if ( card_ID === this.TrashPile[k].card_ID ) {
// 			var card = this.TrashPile[k];
// 			if ( remove_this_card === true ) this.TrashPile.splice( k, 1 );
// 			return card;
// 		}
// 	}

// 	return false;
// };



// CGame.prototype.TrashCardByID = function( card_ID ) {
// 	this.TrashPile.push( this.GetCardByID( card_ID, true ) );
// };



// CGame.prototype.GetCardFromSupply = function( supply_id ) {
// 	var supply = this.Supply[ supply_id ];

// 	 check if the card is buyable 
// 	if ( supply.IsEmpty() ) {
// 		alert( 'そのサプライはカードが残っていません。' );
// 		return new CSupplyCard( -1, -1 );
// 	}

// 	return supply.pile.shift();
// };



// CGame.prototype.GainCardToDiscardPile = function( supply_id, player_id ) {
// 	var gained_card = this.GetCardFromSupply( supply_id );
// 	var pl = this.Players[ player_id ];
// 	if ( gained_card.card_no >= 0 ) { pl.DiscardPile.push( gained_card ); }
// };

// CGame.prototype.GainCardToHandCards = function( supply_id, player_id ) {
// 	var gained_card = this.GetCardFromSupply( supply_id );
// 	var pl = this.Players[ player_id ];
// 	if ( gained_card.card_no >= 0 ) { pl.AddToHandCards( gained_card ); }
// };

// CGame.prototype.GainCardToDeck = function( supply_id, player_id ) {
// 	var gained_card = this.GetCardFromSupply( supply_id );
// 	var pl = this.Players[ player_id ];
// 	if ( gained_card.card_no >= 0 ) { pl.Deck.unshift( gained_card ); }
// };





/****************************** button actions *******************************/


// CGame.prototype.BA_BuyCard = function( supply_id ) {
	// var pl     = this.Players[ this.whose_turn ];  /* alias */
	// var supply = this.Supply[ supply_id ];

	/* check if the card is buyable */
	// if ( this.TurnInfo.coin < pl.Cardlist[ supply.TopCardNo() ].cost ) {
	// 	alert( 'お金が足りません。' );
	// 	return false;
	// }

	// if ( this.TurnInfo.buy <= 0 ) {
	// 	alert( 'これ以上購入できません。' );
	// 	return false;
	// }

	// var gained_card = this.GetCardFromSupply( supply_id );
	//pl.DiscardPile.push( gained_card );
	// pl.AddToDiscardPile( gained_card );
	// this.TurnInfo.buy--;
	// this.TurnInfo.coin -= pl.Cardlist[ gained_card.card_no ].cost;
	// this.PrintHTML_default();
	// return true;
// };



// CGame.prototype.BA_MoveToBuyPhase = function() {
// 	this.TurnInfo.phase = 'BuyPhase';
// 	this.PrintHTML_default();
// };



// CGame.prototype.BA_MoveToCleanUpPhase = function() {
// 	this.TurnInfo.phase = 'CleanUpPhase';
// 	this.Players[ this.whose_turn ].CleanUp();
// 	this.PrintHTML_default();
// };



// CGame.prototype.BA_MoveToNextPlayer = function() {
// 	if ( this.GameEnded() ) {
// 		this.SumUpVP();
// 		var VPmax       = this.Players[0].VPtotal;
// 		var VPmaxPlayer = 0;
// 		for ( var i = 1; i < this.Players.length; i++ ) {
// 			if ( VPmax < this.Players[i].VPtotal ) {
// 				VPmax = this.Players[i].VPtotal;
// 				VPmaxPlayer = i;
// 			}
// 		}
// 		alert( this.Players[VPmaxPlayer].name+'の勝ちです！' );
// 		return;
// 	}

// 	this.whose_turn = this.NextPlayerID( this.whose_turn );
// 	this.ResetTurn();
// 	this.PrintHTML_default();
// };



// CGame.prototype.BA_UseAllTreasure = function() {
// 	var pl = this.Players[ this.whose_turn ];
// 	for ( var i = pl.HandCards.length - 1; i >= 0; --i ) {
// 		if ( IsTreasureCard( this.Cardlist, pl.HandCards[i].card_no ) ) {
// 			this.BA_UseCard(i);
// 		}
// 	}
// 	this.PrintHTML_default();
// };





// CGame.prototype.BA_UseCard = function( in_handCard_id ) {
// 	var G = this;
// 	var pl              = G.Players[ G.whose_turn ];
// 	var playing_card_no = pl.HandCards[ in_handCard_id ].card_no;
// 	var playing_card_ID = pl.HandCards[ in_handCard_id ].card_ID;

	// if ( IsVictoryCard( G.Cardlist, playing_card_no ) ) {
	// 	alert( '勝利点カードは使用できません' );
	// 	return;
	// }
	// if ( G.TurnInfo.phase === 'ActionPhase'
	// 	  && !IsActionCard( G.Cardlist, playing_card_no ) ) {
	// 	alert( 'アクションカードを選んでください' );
	// 	return;
	// }
	// if ( G.TurnInfo.phase === 'BuyPhase'
	// 	  && !IsTreasureCard( G.Cardlist, playing_card_no ) ) {
	// 	alert( '財宝カードを選んでください' );
	// 	return;
	// }
	// if ( G.TurnInfo.phase === 'CleanUpPhase' ) {
	// 	return;
	// }
	// if ( IsActionCard( G.Cardlist, playing_card_no )
	// 	  && G.TurnInfo.action <= 0 ) {
	// 	alert( 'アクションが足りません' );
	// 	return;
	// }

	// pl.MoveHandCardToPlayArea( in_handCard_id );

	// if ( IsActionCard( G.Cardlist, playing_card_no ) ) {
	// 	G.TurnInfo.action--;
	// }

	// G.GetCardEffect( playing_card_no, playing_card_ID );
// }





/* used in GetCardEffect() */


CGame.prototype.GetCardEffect = function( playing_card_no, playing_card_ID ) {
// 	var G = this;
// 	// console.log( 'GetCardEffect' , playing_card_no, playing_card_ID );
// 	var pl           = G.Players[ this.whose_turn ];
// 	var playing_card = G.Cardlist[ playing_card_no ];

// 	G.TurnInfo.action += playing_card.action;
// 	G.TurnInfo.buy    += playing_card.buy;
// 	G.TurnInfo.coin   += playing_card.coin;
// 	pl.DrawCards( playing_card.draw_card );

// 	if ( G.TurnInfo.phase === 'ActionPhase' ) {
// 		G.TurnInfo.phase = 'ActionPhase*';
// 		G.PrintHTML_Phase_Buttons();
// 	}

	G.PrintHTML_default();


	switch ( playing_card_no ) {

		// case G.CardName2No['Remodel'] : /* 9. 改築 */
		// 	$('#Message').html('手札のカードを1枚廃棄して下さい。')
		// 	/* 手札のボタンを改築するカードの選択ボタンに変更 */
		// 	var $HandCard = $('.HandCard');
		// 	for ( var i = 0; i < $HandCard.length; ++i ) {
		// 		$HandCard.eq(i).removeClass('UseCard');
		// 		$HandCard.eq(i).addClass('Remodel_HandCard');
		// 	}
		// 	/* サプライの購入を無効化 */
		// 	var $Supply = $('.Supply');
		// 	for ( var i = 0; i < $Supply.length; ++i ) {
		// 		$Supply.eq(i).removeClass('BuyCard');
		// 	}
		// 	/* アクションカード使用中に隠すボタン */
		// 	$('.HideWhileActionInEffect').hide();


			// G.PrintHTML_HandCards( function(i) {
			// 		var card = pl.Cardlist[ pl.HandCards[i].card_no ];
			// 		return " Game.TrashCardByID("+ pl.HandCards[i].card_ID +");" +
			// 			" Game.TrashedCardCost = "+card.cost+"; " +
			// 			" Game.PrintHTML_ReadOnlyObj(); " +
			// 			" Game.TempObj.print_html2(); "
			// } );
			// G.PrintHTML_ReadOnlyObj();

			// G.TempObj.TrashedCardCost;

			// G.TempObj.print_html2 = function() {
			// 	G.PrintHTML_ReadOnlyObj();
			// 	$('#Message').html('廃棄したカードのコスト+2（＝'+(self.TrashedCardCost + 2)+'）コスト以下のカードを獲得してください。');
			// 	var value = '獲得';
			// 	var onclick_action = function( i ) {
			// 		var card = pl.Cardlist[ G.Supply[i].TopCardNo() ];
			// 		if ( G.Supply[i].IsEmpty() ) {
			// 			return " alert(\"サプライが空です。\"); ";
			// 		} else if ( card.cost > G.TrashedCardCost + 2 ) {
			// 			return " alert(\"コストが超えているので獲得できません。\"); ";
			// 		} else {
			// 			return
			// 				" Game.GainCardToDiscardPile("+i+','+G.whose_turn+"); " +
			// 				" Game.DeleteTempObj(); " +
			// 				" Game.TurnInfo.phase = 'ActionPhase'" +
			// 				" Game.PrintHTML_default(); ";
			// 		}
			// 	}
			// 	G.PrintHTML_Supply( value, onclick_action );
			// };
			// break;



		// case this.CardName2No['Moneylender'] : /* 11. 金貸し */
		// 	var index = pl.HandCards.findIndex( function(element, index, array) {
		// 		if ( element.card_no === this.CardName2No['Copper'] ) return true;
		// 		return false;
		// 	} );
		// 	if ( index >= 0 ) {
		// 		this.TrashCardByID( pl.HandCards[ index ].card_ID );
		// 		this.TurnInfo.coin += 3;
		// 	}
		// 	this.TurnInfo.phase = 'ActionPhase';
		// 	this.PrintHTML_default();
		// 	break;



		// case this.CardName2No['Council Room'] : /* 13. 議事堂 */
		// 	for ( var i = this.NextPlayerID( this.whose_turn ); i != this.whose_turn; i = this.NextPlayerID(i) ) {
		// 		this.Players[i].DrawCards(1);
		// 	}
		// 	this.TurnInfo.phase = 'ActionPhase';
		// 	this.PrintHTML_default();
		// 	break;



		// case this.CardName2No['Throne Room'] : /* 14. 玉座の間 */
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



		case this.CardName2No['Mine'] : /* 16. 鉱山 */
			$('#Message').html('手札の財宝カードを1枚廃棄して下さい。');

			this.PrintHTML_HandCards( function(i) {
					var card = this.Cardlist[ pl.HandCards[i].card_no ];
					if ( IsTreasureCard( this.Cardlist, pl.HandCards[i].card_no ) ) {
						return " Game.TrashHandCard("+i+");"
							+ " Game.PrintHTML_default(); "
							+ " Game.TempObj.TrashedCardCost = "+card.cost+"; "
							+ " Game.TempObj.print_html2(); "
					} else {
						return "alert(\"このカードは財宝カードではありません。\")";
					}
			} );
			this.PrintHTML_ReadOnlyObj();

			this.TempObj.TrashedCardCost;
			this.TempObj.print_html2 = function() {
				$('#Message').html('廃棄したカードのコスト+3（＝'+(this.TrashedCardCost + 3)+'コスト以下の財宝カードを獲得してください。');

				this.PrintHTML_Supply(
					'手札に獲得',
					function(i) {
						var card = this.Cardlist[ this.Supply[i].TopCardNo() ];
						if ( !IsTreasureCard( this.Cardlist, this.Supply[i].TopCardNo() ) ) {
							return " alert(\"そのカードは財宝カードではありません。\"); ";
						} else if ( card.cost > this.TrashedCardCost + 3 ) {
							return " alert(\"コストが超えているので獲得できません。\"); ";
						} else {
							return " Game.GainCardToHandCards("+i+','+this.whose_turn+"); " +
								" this.TurnInfo.phase = 'ActionPhase'; " +
								" Game.DeleteTempObj(); " +
								" Game.PrintHTML_default(); ";
						}
					} );
			};

			break;



		case this.CardName2No['Workshop'] : /* 17. 工房 */
			$('#Message').html('コスト4以下のカードを獲得して下さい。');
			this.PrintSupply_GainCardWithCost( function( card ) {
				return card.cost <= 4;
			} );
			this.PrintHTML_ReadOnlyObj();
			break;



		case this.CardName2No['Chancellor'] : /* 18. 宰相 */
			if ( confirm( '山札を捨て札に置きますか？' ) ) {
				pl.Deck.reverse();  /* 山札をそのままひっくり返して捨て山に置く */
				pl.DiscardPile.copyfrom( pl.Deck );
				pl.Deck = [];
			}
			this.TurnInfo.phase = 'ActionPhase';
			this.PrintHTML_default();
			break;



		case this.CardName2No['Feast'] : /* 19. 祝宴 */
			this.TrashCardByID( playing_card_ID );
			$('#Message').html('コスト5以下のカードを獲得して下さい。');
			this.PrintSupply_GainCardWithCost( function( card ) {
				return card.cost <= 5;
			} );
			this.PrintHTML_ReadOnlyObj();
			break;



		case this.CardName2No['Library'] : /* 21. 書庫 */
			while ( pl.Drawable() && pl.HandCards.length < 7 ) {
				var deck_top_card = pl.GetDeckTopCard();
				if ( IsActionCard( this.Cardlist, deck_top_card.card_no ) ) {
					var msg = this.Cardlist[ deck_top_card.card_no ].name_jp+'を脇に置きますか？';
					if ( confirm( msg ) ) {
						pl.Aside.push( deck_top_card );
						this.PrintHTML_default();
						continue;
					}
				}
				pl.AddToHandCards( deck_top_card );
			}

			/* move cards in pl.Aside to DiscardPile */
			Array.prototype.push.apply( pl.DiscardPile, pl.Aside );
			pl.Aside = [];
			this.TurnInfo.phase = 'ActionPhase';

			this.PrintHTML_default();
			break;



		case this.CardName2No['Cellar'] : /* 22. 地下貯蔵庫 */
			$('#Message').html('手札から任意の枚数を捨て札にして下さい。');
			this.PrintHTML_Buttons(
					'完了', 
					" Game.Players[ Game.whose_turn ].DrawCards( Game.DiscardedNum ); " +
					" Game.DeleteTempObj(); " +
					" Game.PrintHTML_default(); "
				);
			this.TempObj.print_html2();

			this.TempObj.DiscardedNum = 0;  /* 捨て札にした枚数 */
			this.TempObj.print_html2 = function() {
				this.PrintHTML_HandCards( function(i) {
							return 
								" Game.Players[ Game.whose_turn ].Discard("+i+"); " +
								" Game.TempObj.DiscardedNum++; " +
								" Game.PrintHTML_ReadOnlyObj(); " +
								" Game.TempObj.print_html2(); " +
								" $(\"#Message\").html(\"手札から任意の枚数を捨て札にして下さい。&emsp;捨て札にした枚数 ： \"+Game.DiscardedNum+\"枚\"); ";
					} );
			};
			break;



		case this.CardName2No['Thief'] : /* 24. 泥棒 */
			for ( var i = this.NextPlayerID(this.whose_turn); i != this.whose_turn; i = this.NextPlayerID(i) ) {
				var opponent = this.Players[i];
				if ( opponent.HaveReactionCard() ) {

				}
			}
			this.PrintHTML_default();
			break;



		case this.CardName2No['Adventurer'] : /* 25. 冒険者 */
			var treasure_num = 0;
			while ( pl.Drawable() && treasure_num < 2 ) {
				var deck_top_card = pl.GetDeckTopCard()
				if ( IsTreasureCard( this.Cardlist, deck_top_card.card_no ) ) {
					treasure_num++;
				}
				pl.Aside.push( deck_top_card );
				this.PrintHTML_default();
			}
			while ( pl.Aside.length > 0 ) {
				var elm = pl.Aside.pop();
				if ( IsTreasureCard( this.Cardlist, elm.card_no ) ) {
					pl.AddToHandCards( elm );
				} else {
					pl.DiscardPile.push( elm );
				}
			}
			this.PrintHTML_default();
			break;



		case this.CardName2No['Witch'] : /* 27. 魔女 */
			for ( var i = this.NextPlayerID(this.whose_turn); i != this.whose_turn; i = this.NextPlayerID(i) ) {
				var opponent = this.Players[i];
				if ( opponent.HaveReactionCard() ) {

				}
				this.GainCardToDiscardPile( this.Name2SupplyID['Curse'], i );
			}
			this.PrintHTML_default();
			break;



		case this.CardName2No['Spy'] : /* 28. 密偵 */
			for ( var i = this.NextPlayerID(this.whose_turn); i != this.whose_turn; i = this.NextPlayerID(i) ) {
				var opponent = this.Players[i];
				if ( opponent.HaveReactionCard() ) {

				}
			}
			this.PrintHTML_default();
			break;



		case this.CardName2No['Militia'] : /* 29. 民兵 */
			for ( var i = this.NextPlayerID(this.whose_turn); i != this.whose_turn; i = this.NextPlayerID(i) ) {
				var opponent = this.Players[i];
				if ( opponent.HaveReactionCard() ) {

				}
				this.ReduceHandCardsTo( 3, i );
			}
			this.PrintHTML_default();
			break;



		case this.CardName2No['Bureaucrat'] : /* 31. 役人 */
			this.GainCardToDeck( this.Name2SupplyID['Silver'  ], this.whose_turn );
			for ( var i = this.NextPlayerID(this.whose_turn); i != this.whose_turn; i = this.NextPlayerID(i) ) {
				var opponent = this.Players[i];
				if ( opponent.HaveReactionCard() ) {

				}
				/* 公開 */
				/* 勝利点カードを1枚戻す */
			}
			this.PrintHTML_default();
			break;



		case this.CardName2No['Chapel'] : /* 32. 礼拝堂 */
			$('#Message').html('手札を4枚まで廃棄して下さい。');

			var finished_action = " Game.PrintHTML_default(); Game.DeleteTempObj(); ";

			this.PrintHTML_Buttons( '完了', finished_action );

			this.TempObj.TrashedNum = 0;

			this.TempObj.print_html2 = function() {
				this.PrintHTML_HandCards( function(i) {
						return 
							" Game.TrashHandCard("+i+"); " +
							" Game.TrashedNum++; " +
							" if ( Game.TrashedNum >= 4 ) {" +
							      finished_action +
							" } else {" +
							"     Game.TempObj.print_html2();" +
							"     Game.PrintHTML_ReadOnlyObj(); " +
							" }";
					} );
			};
			this.TempObj.print_html2();
			break;



		// default :
		// 	if ( this.TurnInfo.phase === 'ActionPhase*' ) {
		// 		this.TurnInfo.phase = 'ActionPhase';
		// 	}
		// 	this.PrintHTML_default();
		// 	break;
	}

	/* アクションがなくなったら自動で購入フェーズに */
	// var pl = this.Players[ this.whose_turn ];
	// if ( this.TurnInfo.action <= 0 || 
	// 	 pl.HandCards.findIndex( function( element, index, array ) {
	// 			return IsActionCard( this.Cardlist, element.card_no );
	// 		} ) < 0 )
	// {
	// 	this.TurnInfo.phase = 'BuyPhase';
	// }
};



