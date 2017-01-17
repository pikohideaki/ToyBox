

class CGame {
	constructor( FBobj_Game ) {
		if ( FBobj_Game == undefined ) {
			this.TrashPile     = [];
			this.whose_turn_id = 0;
			this.TurnInfo      = {};
			this.phase         = '';
			this.Supply        = new CSupply();
			this.Players       = [];
			this.Settings      = {};
		} else {
			this.TrashPile     = ( FBobj_Game.TrashPile || [] );
			this.whose_turn_id = FBobj_Game.whose_turn_id;
			this.TurnInfo      = FBobj_Game.TurnInfo;
			this.phase         = FBobj_Game.phase;
			this.Supply        = new CSupply( FBobj_Game.Supply );
			this.Players       = [];
			FBobj_Game.Players = ( FBobj_Game.Players || [] );
			for ( let i = 0; i < RoomInfo.PlayerNum; ++i ) {
				this.Players[i] = new CPlayer( FBobj_Game.Players[i] );
			}
			this.Settings      = ( FBobj_Game.Settings || {} );
		}
	}


	NextPlayerID( current_player_id = this.whose_turn_id ) {
		 /* 0 -> 1 -> 2 -> 3 -> 0 */
		return (current_player_id + 1) % this.Players.length;
	}

	PreviousPlayerID( current_player_id = this.whose_turn_id ) {
		return (this.Players.length + current_player_id - 1) % this.Players.length;
	}

	Me() {
		return this.Players[ myid ];
	}

	player() {
		return this.Players[ this.whose_turn_id ];
	}

	NextPlayer( current_player_id = this.whose_turn_id ) {
		return this.Players[ this.NextPlayerID( current_player_id ) ];
	}

	PreviousPlayer( current_player_id = this.whose_turn_id ) {
		return this.Players[ this.PreviousPlayerID( current_player_id ) ];
	}

	whose_turn() {
		return this.player.name;
	}



	MovePhase( phase ) {
		this.phase = phase;
		FBref_Game.child('phase').set( this.phase );

		let phase_jp;
		switch ( this.phase ) {
			case 'ActionPhase' :
				phase_jp = 'アクションフェーズ';
				break;

			case 'BuyPhase' :
				$('.UseAllTreasures' ).show();  // 1度だけ表示
				phase_jp = '購入フェーズ';
				break;
		}
		$('.phase-dialog-wrapper .dialog_text').html( phase_jp );
		$('.phase-dialog-wrapper').fadeIn().delay(300).fadeOut();
	}


	ResetTurnInfo() {
		this.TurnInfo = {
			action : 1,
			buy    : 1,
			coin   : 0,
			potion : 0,
			played_actioncards_num : 0,  // 共謀者
			add_copper_coin : 0,  // 銅細工師
			cost_down_by_Bridge : 0,  // 橋によるコスト減少量
			Revealed_Moat     : new Array( PLAYER_NUM_MAX ).fill(false),  /* 堀を公開したか */
			Revealed_BaneCard : new Array( PLAYER_NUM_MAX ).fill(false),  /* 災いカードを公開したか */
		};
		this.phase = 'ActionPhase';
	}


	GameEnded() {
		// 属州がなくなったら終了
		if ( this.Supply.byName('Province').IsEmpty() ) return true;

		// 植民地場なら植民地がなくなったら終了
		if ( this.Supply.byName('Colony').in_use
			&& this.Supply.byName('Colony').IsEmpty() ) return true;

		// 使用しているサプライが3山なくなったら終了
		let empty_pile_num = 0;
		[].concat( this.Supply.Basic )
		  .concat( this.Supply.KingdomCards )
		  .concat( [this.Supply.BaneCard] )
		  .forEach( function(pile) {
			if ( pile.in_use && pile.IsEmpty() ) empty_pile_num++;
		});

		/* [ToDo] 闇市場，廃墟などもカウント */
		if ( empty_pile_num >= 3 ) return true;

		return false; /* otherwise */
	}



	MoveToNextPlayer() {
		let G = this;
		return MyAsync( function*() {
			let updates = {};

			G.player().CleanUp( false );
			updates[ `Game/Players/${G.whose_turn_id}` ] = G.player();

			if ( G.GameEnded() ) {
				G.Players.forEach( function( player, id ) {
					player.SumUpVP();
					updates[ `Game/Players/${id}` ] = player;
				} );

				updates['RoomInfo/Status'] = 'ゲーム終了';
				updates['GameEnd'] = true;
				yield FBref_Room.update( updates );
				return;
			}

			G.whose_turn_id = G.NextPlayerID();
			G.ResetTurnInfo();

			updates['Game/whose_turn_id'] = G.whose_turn_id;
			updates['Game/TurnInfo'] = G.TurnInfo;
			updates['Game/phase'] = G.phase;

			yield Promise.all( [
				FBref_Room.update( updates ),
				FBref_chat.push( `${G.player().name}のターン` ),
			]);

			/* アクションカードがなければスキップして購入フェーズに遷移 */
			if ( !G.player().HasActionCard() ) G.MovePhase( 'BuyPhase' );
		});
	}


	// card_no のコスト
	GetCost( card_no, player_id = this.whose_turn_id ) {
		let cost = new CCost( Cardlist[card_no] );

		// 橋によるコスト減少量
		cost = CostOp( '-', cost, new CCost( [ this.TurnInfo.cost_down_by_Bridge ,0,0] ) );

		let playarea = this.Players[ player_id ].PlayArea;

		// 街道（場にある枚数）
		let Highway_num_in_play
			= playarea.filter( card => Cardlist[ card.card_no ].name_eng == 'Highway' ).length;

		// 石切場（場にある枚数）
		let Quarry_num_in_play
			= playarea.filter( card => Cardlist[ card.card_no ].name_eng == 'Quarry' ).length;

		// 王女（場にある枚数）
		let Princess_num_in_play
			= playarea.filter( card => Cardlist[ card.card_no ].name_eng == 'Princess' ).length;

		// 橋の下のトロル（場にある枚数）
		let BridgeTroll_num_in_play
			= playarea.filter( card => Cardlist[ card.card_no ].name_eng == 'Bridge Troll' ).length;

		cost = CostOp( '-', cost, new CCost( [ Highway_num_in_play     , 0, 0 ] ) );
		cost = CostOp( '-', cost, new CCost( [ BridgeTroll_num_in_play , 0, 0 ] ) );
		cost = CostOp( '-', cost, new CCost( [ Princess_num_in_play * 2, 0, 0 ] ) );

		if ( IsActionCard( Cardlist, card_no ) ) {
			cost = CostOp( '-', cost, new CCost( [ Quarry_num_in_play ,0,0] ) );
		}

		if ( cost.coin < 0 ) cost.coin = 0;  // 0未満にはならない
		return cost;
	}



	/* カード移動基本操作 */
	GetCardByID( card_ID, remove_this_card = true, FBsync = false ) {
		let card = new CCard();
		let matched_num = 0;

		for ( let i = 0; i < this.Players.length; ++i ) {
			let pl = this.Players[i];
			for ( let k = 0; k < pl.Deck.length; ++k ) {
				if ( card_ID == pl.Deck[k].card_ID ) {
					card = pl.Deck[k];
					if ( remove_this_card ) {
						pl.Deck.remove(k);
						if ( FBsync ) {
							FBref_Players.child(`${i}/Deck`).set( pl.Deck );
						}
					}
					// return card;
					matched_num++;
				}
			}
			for ( let k = 0; k < pl.DiscardPile.length; ++k ) {
				if ( card_ID == pl.DiscardPile[k].card_ID ) {
					card = pl.DiscardPile[k];
					if ( remove_this_card ) {
						pl.DiscardPile.remove(k);
						if ( FBsync ) {
							FBref_Players.child(`${i}/DiscardPile`).set( pl.DiscardPile );
						}
					}
					// return card;
					matched_num++;
				}
			}
			for ( let k = 0; k < pl.HandCards.length; ++k ) {
				if ( card_ID == pl.HandCards[k].card_ID ) {
					card = pl.HandCards[k];
					if ( remove_this_card ) {
						pl.HandCards.remove(k);
						if ( FBsync ) {
							FBref_Players.child(`${i}/HandCards`).set( pl.HandCards );
						}
					}
					// return card;
					matched_num++;
				}
			}
			for ( let k = 0; k < pl.PlayArea.length; ++k ) {
				if ( card_ID == pl.PlayArea[k].card_ID ) {
					card = pl.PlayArea[k];
					if ( remove_this_card ) {
						pl.PlayArea.remove(k);
						if ( FBsync ) {
							FBref_Players.child(`${i}/PlayArea`).set( pl.PlayArea );
						}
					}
					// return card;
					matched_num++;
				}
			}
			for ( let k = 0; k < pl.Aside.length; ++k ) {
				if ( card_ID == pl.Aside[k].card_ID ) {
					card = pl.Aside[k];
					if ( remove_this_card ) {
						pl.Aside.remove(k);
						if ( FBsync ) {
							FBref_Players.child(`${i}/Aside`).set( pl.Aside );
						}
					}
					// return card;
					matched_num++;
				}
			}
			for ( let k = 0; k < pl.Open.length; ++k ) {
				if ( card_ID == pl.Open[k].card_ID ) {
					card = pl.Open[k];
					if ( remove_this_card ) {
						pl.Open.remove(k);
						if ( FBsync ) {
							FBref_Players.child(`${i}/Open`).set( pl.Open );
						}
					}
					// return card;
					matched_num++;
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
						if ( FBsync ) {
							FBref_Game.child(`Supply/Basic/${i}/pile`).set( spl );
						}
					}
					// return card;
					matched_num++;
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
						if ( FBsync ) {
							FBref_Game.child(`Supply/KingdomCards/${i}/pile`).set( spl );
						}
					}
					// return card;
					matched_num++;
				}
			}
		}

		for ( let i = 0; i < this.Supply.Prize.length; ++i ) {
			let spl = this.Supply.Prize[i].pile;
			for ( let k = 0; k < spl.length; ++k ) {
				if ( card_ID == spl[k].card_ID ) {
					card = spl[k];
					if ( remove_this_card ) {
						spl.remove(k);
						if ( FBsync ) {
							FBref_Game.child(`Supply/Prize/${i}/pile`).set( spl );
						}
					}
					// return card;
					matched_num++;
				}
			}
		}

		{
			const spl = this.Supply.BaneCard.pile;
			for ( let k = 0; k < spl.length; ++k ) {
				if ( card_ID == spl[k].card_ID ) {
					card = spl[k];
					if ( remove_this_card ) {
						spl.remove(k);
						if ( FBsync ) {
							FBref_Game.child(`Supply/Prize/${i}/pile`).set( spl );
						}
					}
					// return card;
					matched_num++;
				}
			}
		}

		for ( let k = 0; k < this.TrashPile.length; ++k ) {
			if ( card_ID == this.TrashPile[k].card_ID ) {
				card = this.TrashPile[k];
				if ( remove_this_card ) {
					this.TrashPile.remove(k);
					if ( FBsync ) {
						FBref_Game.child('TrashPile').set( this.TrashPile );
					}
				}
				// return card;
				matched_num++;
			}
		}

		if ( matched_num < 1 ) {
			console.log( `ERROR: the card with ID:${card_ID} not found.` );
		}
		if ( matched_num > 1 ) {
			console.log( `ERROR: 2 or more cards with ID:${card_ID} found.` );
		}
		return card;
	}


	GetAllCards() {
		let AllCards = [];
		this.Players.forEach( function( player ) {
			AllCards = AllCards.concat( player.GetDeckAll() );
		});
		AllCards = AllCards.concat( this.Supply.GetAllCards() );
		AllCards = AllCards.concat( this.TrashPile );
		return AllCards;
	}



	/* カード移動基本操作 */
	AddToTrashPile( card, FBsync = false ) {
		this.TrashPile.push( card );
		if ( FBsync ) {
			FBref_Game.child('TrashPile').set( this.TrashPile );
		}
	}

	/* カード移動複合操作 */
	TrashCardByID( card_ID, FBsync = false ) {
		this.AddToTrashPile( this.GetCardByID( card_ID ), FBsync );
	}


	UseCard( playing_card_no, playing_card_ID ) {
		let G = this;
		return MyAsync( function*() {
			if ( G.phase === 'ActionPhase' && !IsActionCard( Cardlist, playing_card_no ) ) {
				MyAlert( { message : 'アクションカードを選んでください' } );
				return;
			}
			if ( G.phase === 'BuyPhase' && !IsTreasureCard( Cardlist, playing_card_no ) ) {
				MyAlert( { message : '財宝カードを選んでください' } );
				return;
			}
			if ( IsActionCard( Cardlist, playing_card_no ) && G.TurnInfo.action <= 0 ) {
				MyAlert( { message : 'アクションが足りません' } );
				return;
			}

			switch ( G.phase ) {
				case 'ActionPhase' :
					G.phase = 'ActionPhase*';
					break;
				case 'BuyPhase' :
					G.phase = 'BuyPhase*';
					break;
				default :
					throw new Error('GetCardEffect should be called in ActionPhase or BuyPhase' );
					break;
			}

			G.player().AddToPlayArea( G.GetCardByID( playing_card_ID ) );  /* カード移動 */

			// アクションを1消費
			if ( IsActionCard( Cardlist, playing_card_no ) ) G.TurnInfo.action--;

			let updates = {};
			updates['phase'] = G.phase;
			updates[`Players/${G.whose_turn_id}/PlayArea`]  = G.player().PlayArea;
			updates[`Players/${G.whose_turn_id}/HandCards`] = G.player().HandCards;
			updates['TurnInfo/action'] = G.TurnInfo.action;
			yield FBref_Game.update( updates );

			yield MyAsync( GetCardEffect, playing_card_no, playing_card_ID );

			// 終了
			switch ( G.phase ) {
				case 'ActionPhase*' :
					yield FBref_Game.child('phase').set( 'ActionPhase' );
					break;
				case 'BuyPhase*' :
					yield FBref_Game.child('phase').set( 'BuyPhase' );
					break;
				default :
					throw new Error('GetCardEffect should finish in ActionPhase* or BuyPhase*' );
					break;
			}
		} );
	}



	// カードをサプライから獲得する
	GainCard(
			card_name_eng,
			place_to_gain = 'DiscardPile',
			player_id = this.whose_turn_id )
	{
		const G = this;

		const gained_card = G.Supply.byName( card_name_eng ).GetTopCard();
		const player = G.Players[ player_id ];

		let updates = {};
		updates['Supply'] = Game.Supply;

		switch ( place_to_gain ) {
			case 'Deck' :
				player.PutBackToDeck( gained_card );
				updates[`Players/${player_id}/Deck`] = player.Deck;
				break;

			case 'HandCard' :
				player.AddToHandCards( gained_card )
				updates[`Players/${player_id}/HandCards`] = player.HandCards;
				break;

			case 'DiscardPile' :
				player.AddToDiscardPile( gained_card );
				updates[`Players/${player_id}/DiscardPile`] = player.DiscardPile;
				break;

			default :
				throw new Error(`at Game.GainCard : there is no place named ${place_to_gain}`);
				return;
		}

		return Promise.all( [
			FBref_chat.push( `${player.name}が${Cardlist[ gained_card.card_no ].name_jp}を獲得しました。` ),
			FBref_Game.update( updates ),
		] );
	}




}


