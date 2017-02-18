
/*
 * CGameクラスの定義ファイル．
 * グローバルに使用されるGameオブジェクト．
 */


class CGame {
	constructor( FBobj_Game ) {
		if ( FBobj_Game == undefined ) {
			this.TrashPile      = [];
			this.whose_turn_id  = 0;
			this.TurnInfo       = {};
			this.phase          = '';
			this.Supply         = new CSupply();
			this.Players        = [];
			this.Settings       = {};
			this.StackedCardIDs = [];
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
			this.StackedCardIDs = ( FBobj_Game.StackedCardIDs || [] );
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


	GetAllCards() {
		let AllCards = [];
		this.Players.forEach( function( player ) {
			AllCards = AllCards.concat( player.GetCopyOfAllCards() );
		});
		AllCards = AllCards.concat( this.Supply.GetAllCards() );
		AllCards = AllCards.concat( this.TrashPile );
		return AllCards;
	}




	MovePhase( phase ) {
		let G = this;
		return MyAsync( function*() {
			G.phase = phase;
			yield FBref_Game.child('phase').set( G.phase );

			let phase_jp;
			switch ( G.phase ) {
				case 'ActionPhase' :
					phase_jp = 'アクションフェーズ';
					break;

				case 'BuyPhase' :
					$('.UseAllTreasures' ).show();  // 1度だけ表示
					phase_jp = '購入フェーズ';
					break;
			}
			$('.phase-dialog-wrapper .dialog_text').html( phase_jp );
			yield new Promise( function( resolve ) {
				$('.phase-dialog-wrapper').fadeIn().delay(300).fadeOut('normal', resolve );
			});
		})
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
			let Room_updates = {};

			G.player().CleanUp();
			Room_updates[ `Game/Players/${G.whose_turn_id}` ] = G.player();

			if ( G.GameEnded() ) {
				G.Players.forEach( function( player, id ) {
					player.SumUpVP();
					Room_updates[ `Game/Players/${id}` ] = player;
				} );

				Room_updates['RoomInfo/Status'] = 'ゲーム終了';
				Room_updates['GameEnd'] = true;
				yield FBref_Room.update( Room_updates );
				return;
			}

			G.whose_turn_id = G.NextPlayerID();
			G.ResetTurnInfo();

			Room_updates['Game/whose_turn_id'] = G.whose_turn_id;
			Room_updates['Game/TurnInfo'] = G.TurnInfo;
			Room_updates['Game/phase'] = G.phase;

			yield Promise.all( [
				FBref_Room.update( Room_updates ),
				FBref_chat.push( `${G.player().name}のターン` ),
			]);

			/* アクションカードがなければスキップして購入フェーズに遷移 */
			if ( !G.player().HasActionCard() ) {
				yield G.MovePhase( 'BuyPhase' );
			}
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



	StackCardID( card_ID ) {
		this.StackedCardIDs.push( card_ID );
		return FBref_StackedCardIDs.set( this.StackedCardIDs );
	}




	/* カード移動基本操作 */
	GetCardWithID( card_ID, remove_this_card = true, FBsync = false ) {
		let card = new CCard();
		let matched_num = 0;
		const G = this;

		for ( let i = 0; i < G.Players.length; ++i ) {
			let pl = G.Players[i];
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

		for ( let i = 0; i < G.Supply.Basic.length; ++i ) {
			let spl = G.Supply.Basic[i].pile;
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
		for ( let i = 0; i < G.Supply.KingdomCards.length; ++i ) {
			let spl = G.Supply.KingdomCards[i].pile;
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

		for ( let i = 0; i < G.Supply.Prize.length; ++i ) {
			let spl = G.Supply.Prize[i].pile;
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
			const spl = G.Supply.BaneCard.pile;
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

		for ( let k = 0; k < G.TrashPile.length; ++k ) {
			if ( card_ID == G.TrashPile[k].card_ID ) {
				card = G.TrashPile[k];
				if ( remove_this_card ) {
					G.TrashPile.remove(k);
					if ( FBsync ) {
						FBref_Game.child('TrashPile').set( G.TrashPile );
					}
				}
				// return card;
				matched_num++;
			}
		}

		if ( matched_num < 1 ) {
			throw new Error( `the card with ID:${card_ID} not found.` );
		}
		if ( matched_num > 1 ) {
			throw new Error( `2 or more cards with ID:${card_ID} found.` );
		}
		return card;
	}


	LookCardWithID( card_ID ) {
		return this.GetCardWithID( card_ID, false, false );
	}





	UseCard( playing_card_no, playing_card_ID ) {
		let G = this;
		return MyAsync( function*() {
			if ( G.phase === 'ActionPhase' && !IsActionCard( Cardlist, playing_card_no ) ) {
				MyAlert( 'アクションカードを選んでください' );
				return;
			}
			if ( G.phase === 'BuyPhase' && !IsTreasureCard( Cardlist, playing_card_no ) ) {
				MyAlert( '財宝カードを選んでください' );
				return;
			}
			if ( IsActionCard( Cardlist, playing_card_no ) && G.TurnInfo.action <= 0 ) {
				MyAlert( 'アクションが足りません' );
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

			G.player().Play( playing_card_ID, G );  /* カード移動 */

			// アクションを1消費
			if ( IsActionCard( Cardlist, playing_card_no ) ) G.TurnInfo.action--;

			yield FBref_Game.update( {
				phase : G.phase,
				[`Players/${G.whose_turn_id}/PlayArea`]  : G.player().PlayArea,
				[`Players/${G.whose_turn_id}/HandCards`] : G.player().HandCards,
				'TurnInfo/action' : G.TurnInfo.action
			} );

			yield MyAsync( GetCardEffect, playing_card_ID );

			// 終了

			switch ( G.phase ) {
				case 'ActionPhase*' :
					G.phase = 'ActionPhase';
					break;
				case 'BuyPhase*' :
					G.phase = 'BuyPhase';
					break;
				default :
					throw new Error('GetCardEffect should be called in ActionPhase or BuyPhase' );
					break;
			}

			// actionが0なら自動でアクションフェーズ終了
			if ( G.phase == 'ActionPhase' && G.TurnInfo.action <= 0 ) {
				yield G.MovePhase( 'BuyPhase' );
			} else {
				yield FBref_Game.child('phase').set( G.phase );
			}
		} );
	}




	// カードを獲得する
	GainCard(
				card_ID,
				place_to_gain = 'DiscardPile',
				player_id = this.whose_turn_id,
				face = 'default',
				buy = false )
	{
		const player = Game.Players[ player_id ];
		const card_no = Game.LookCardWithID( card_ID ).card_no;

		const G = this;

		return MyAsync( function*() {
			if ( face == 'up'   )  G.FaceUpCard  ( card_ID );
			if ( face == 'down' )  G.FaceDownCard( card_ID );

			const player = G.Players[ player_id ];

			let Game_updates = {};
			Game_updates['Supply'] = G.Supply;

			switch ( place_to_gain ) {
				case 'Deck' :
					player.AddToDeck( G.GetCardWithID( card_ID ) );
					Game_updates[`Players/${player_id}/Deck`] = player.Deck;
					break;

				case 'HandCards' :
					player.AddToHandCards( G.GetCardWithID( card_ID ) )
					Game_updates[`Players/${player_id}/HandCards`] = player.HandCards;
					break;

				case 'DiscardPile' :
					player.AddToDiscardPile( G.GetCardWithID( card_ID ) );
					Game_updates[`Players/${player_id}/DiscardPile`] = player.DiscardPile;
					break;

				default :
					throw new Error(`at Game.GainCard : there is no place named ${place_to_gain}`);
					return;
			}

			FBref_chat.push( `${player.name}が「${Cardlist[ card_no ].name_jp}」を${(buy ? '購入' : '獲得')}しました。` );
			yield FBref_Game.update( Game_updates );
		});
	}



	// サプライからカードを獲得する
	GainCardFromSupply(
				card_ID,
				place_to_gain = 'DiscardPile',
				player_id = this.whose_turn_id,
				face = 'default',
				buy = false )
	{
		this.GainCard( card_ID, place_to_gain, player_id, face, buy );
		return FBref_Game.update( {
			[`Players/${player_id}/${place_to_gain}`] : Game.Players[player_id][place_to_gain],
			Supply : Game.Supply,
		});
	}


	// カードを購入する
	BuyCard(
				card_ID,
				place_to_gain = 'DiscardPile',
				player_id = this.whose_turn_id,
				face = 'default' )
	{
		this.GainCard( card_ID, place_to_gain, player_id, face, true );

	}


	// サプライからカードを購入する
	BuyCardFromSupply(
				card_ID,
				place_to_gain = 'DiscardPile',
				player_id = this.whose_turn_id,
				face = 'default' )
	{
		return this.GainCardFromSupply( card_ID, place_to_gain, player_id, face, true );
	}


	// カードをサプライから獲得する
	GainCardFromSupplyByName(
				card_name_eng,
				place_to_gain = 'DiscardPile',
				player_id = this.whose_turn_id,
				face = 'default' )
	{
		const G = this;

		return MyAsync( function*() {
			const SupplyTopCard = G.Supply.byName( card_name_eng ).LookTopCard();
			if ( SupplyTopCard == undefined ) {
				yield MyAlert( '獲得できるカードがありません。' );
				return;
			}
			yield G.GainCardFromSupply( SupplyTopCard.card_ID, place_to_gain, player_id, face );
		});
	}





	/* カード移動基本操作 */
	AddToTrashPile( card ) {
		if ( card == undefined ) return;
		this.TrashPile.push( card );
	}

	/* カード移動複合操作 */
	/* どこから来るか分からないのでfirebase同期はしない */
	Trash( card_ID ) {
		this.AddToTrashPile( this.GetCardWithID( card_ID ) );
		FBref_chat.push( `「${Cardlist[ this.LookCardWithID( card_ID ).card_no ].name_jp}」を廃棄しました。` );
	}



	FaceUpCard( card_ID ) {
		this.LookCardWithID( card_ID ).face = 'up';
		return this.StackCardID( card_ID );
	}

	FaceDownCard( card_ID ) {
		this.LookCardWithID( card_ID ).face = 'down';
		return this.StackCardID( card_ID );
	}



	ResetStackedCardIDs() {
		this.StackedCardIDs = [];
		return FBref_StackedCardIDs.set( [] );
	}


	ResetFace() {
		const G = this;
		G.StackedCardIDs.forEach( card_ID => G.LookCardWithID( card_ID ).face = 'default' );
		return G.ResetStackedCardIDs();
	}


	ResetClassStr() {
		const G = this;
		G.StackedCardIDs.forEach( card_ID => G.LookCardWithID( card_ID ).class_str = '' );
		return G.ResetStackedCardIDs();
	}




	ForAllPlayers( func ) {
		const G = this;
		if ( func instanceof function*(){yield;}.constructor ) {
			return MyAsync( function*() {
				yield MyAsync( func, G.whose_turn_id );   // 自分
				for ( let player_id = G.NextPlayerID();
						player_id != G.whose_turn_id;
						player_id = G.NextPlayerID( player_id ) )
				{
					yield MyAsync( func, player_id );
				}
			});
		} else {
			func( G.whose_turn_id );
			for ( let player_id = G.NextPlayerID();
					player_id != G.whose_turn_id;
					player_id = G.NextPlayerID( player_id ) )
			{
				func( player_id );
			}
		}
	}


	ForAllOtherPlayers( func ) {
		const G = this;
		if ( func instanceof function*(){yield;}.constructor ) {
			return MyAsync( function*() {
				for ( let player_id = G.NextPlayerID();
						player_id != G.whose_turn_id;
						player_id = G.NextPlayerID( player_id ) )
				{
					yield MyAsync( func, player_id );
				}
			});
		} else {
			for ( let player_id = G.NextPlayerID();
					player_id != G.whose_turn_id;
					player_id = G.NextPlayerID( player_id ) )
			{
				func( player_id );
			}
		}
	}



	AttackAllOtherPlayers(
				card_name,
				message,
				send_signals,
				attack_effect = function*() {} )
	{
		const G = this;
		return this.ForAllOtherPlayers( function*( player_id ) {
			if ( G.TurnInfo.Revealed_Moat[ player_id ] ) return;  // 堀を公開していたらスキップ

			yield FBref_MessageTo.child( player_id ).set( message );

			if ( send_signals ) {
				yield FBref_SignalAttackEnd.set(false);  /* reset */
				FBref_SignalAttackEnd.on( 'value', function(snap) {  // 監視開始
					if ( snap.val() ) Resolve[ card_name ]();
				} );

				yield SendSignal( player_id, {
					Attack    : true,
					card_name : card_name,
					Message   : message,
				} );

				yield new Promise( resolve => Resolve[card_name] = resolve );  /* 他のプレイヤー待機 */

				FBref_SignalAttackEnd.off();  // 監視終了
			}

			yield MyAsync( attack_effect, player_id );

			yield FBref_MessageTo.child( player_id ).set('');
		})
	}


}


