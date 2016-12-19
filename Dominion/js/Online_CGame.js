

class CGame {
	constructor( FBobj_Game ) {
		if ( FBobj_Game == undefined ) {
			this.TrashPile     = [];
			this.whose_turn_id = 0;
			this.TurnInfo      = {};
			this.phase         = '';
			this.Supply        = new CSupply();
			this.Players       = [];
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


	ResetTurnInfo() {
		this.TurnInfo = {
			action : 1,
			buy    : 1,
			coin   : 0,
			played_actioncards_num : 0,  // 共謀者
			add_copper_coin : 0,  // 銅細工師
			cost_minus : 0,  // 橋
		};
		this.phase = 'ActionPhase';
	}


	GameEnded() {
		if ( this.Supply.byName('Province').IsEmpty() ) return true;
		if ( RoomInfo.SelectedCards.Prosperity && this.Supply.byName('Colony').IsEmpty() ) return true;
		let empty_pile_num = 0;
		for ( let i = 0; i < this.Supply.Basic.length; ++i ) {
			if ( this.Supply.Basic[i].IsEmpty() ) empty_pile_num++;
		}
		if ( !RoomInfo.SelectedCards.Prosperity ) empty_pile_num -= 2;  // 繁栄場でないとき植民地、白金貨が空で判定される
		for ( let i = 0; i < this.Supply.KingdomCards.length; ++i ) {
			if ( this.Supply.KingdomCards[i].IsEmpty() ) empty_pile_num++;
		}
		/* [ToDo] 闇市場，廃墟などもカウント */
		if ( empty_pile_num >= 3 ) return true;

		return false; /* otherwise */
	}



	MoveToNextPlayer() {
		let G = this;
		let updates = {};

		this.player().CleanUp( false );
		updates[ `Game/Players/${this.whose_turn_id}` ] = this.player();

		if ( this.GameEnded() ) {
			for ( let i = 0; i < this.Players.length; ++i ) {
				this.Players[i].SumUpVP();
				updates[ `Game/Players/${i}` ] = this.Players[i];
			}

			updates['RoomInfo/Status'] = 'ゲーム終了';
			updates['GameEnd'] = true;
			FBref_Room.update( updates );
			return;
		}

		this.whose_turn_id = this.NextPlayerID();
		this.ResetTurnInfo();
		/* アクションカードがなければスキップして購入フェーズに遷移 */
		if ( !this.player().HasActionCard() ) {
			this.phase = 'BuyPhase';
		}
		updates['Game/whose_turn_id'] = this.whose_turn_id;
		updates['Game/TurnInfo'] = this.TurnInfo;
		updates['Game/phase'] = this.phase;
		FBref_Room.update( updates );
		FBref_Room.child('chat').push( `${Game.player().name}のターン` );
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
		if ( Game.phase === 'ActionPhase' && !IsActionCard( Cardlist, playing_card_no ) ) {
			alert( 'アクションカードを選んでください' );   return;
		}
		if ( Game.phase === 'BuyPhase' && !IsTreasureCard( Cardlist, playing_card_no ) ) {
			alert( '財宝カードを選んでください' );   return;
		}
		// if ( Game.phase === 'CleanUpPhase' ) return;

		if ( IsActionCard( Cardlist, playing_card_no ) && Game.TurnInfo.action <= 0 ) {
			alert( 'アクションが足りません' );   return;
		}

		MyAsync( ( function*() {
			switch ( Game.phase ) {
				case 'ActionPhase' :
					Game.phase = 'ActionPhase*';
					break;
				case 'BuyPhase' :
					Game.phase = 'BuyPhase*';
					console.log('BuyPhase*');
					break;
				default :
					console.log( 'ERROR: GetCardEffect should be called in ActionPhase or BuyPhase' );
					break;
			}

			Game.player().AddToPlayArea( Game.GetCardByID( playing_card_ID ) );  /* カード移動 */

			// updates[`Players/${Game.whose_turn_id}/PlayArea`]  = Game.player().PlayArea;
			// updates[`Players/${Game.whose_turn_id}/HandCards`] = Game.player().HandCards;

			// アクションを1消費
			if ( IsActionCard( Cardlist, playing_card_no ) ) Game.TurnInfo.action--;
				// updates['TurnInfo/action'] = Game.TurnInfo.action;
			// }

			// yield FBref_Game.update( updates );  // updateを1回節約（GetCardEffectで更新）
			yield MyAsync( GetCardEffect( playing_card_no, playing_card_ID ) );

			// 終了
			switch ( Game.phase ) {
				case 'ActionPhase*' :
					yield FBref_Game.child('phase').set( 'ActionPhase' );
					break;
				case 'BuyPhase*' :
					console.log('BuyPhase');
					yield FBref_Game.child('phase').set( 'BuyPhase' );
					break;
				default :
					console.log( 'ERROR: GetCardEffect should finish in ActionPhase* or BuyPhase*' );
					break;
			}
		} )() );
	}
}


