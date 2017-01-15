



function FBSet_TurnCount( player_id, FBsnapshot ) {
	Game.Players[ player_id ].TurnCount = ( FBsnapshot.val() || 0 );
}

function FBSet_Connection( player_id, FBsnapshot ) {
	Game.Players[ player_id ].Connection = ( FBsnapshot.val() || false );
}

function FBSet_Open( player_id, FBsnapshot ) {
	Game.Players[ player_id ].Open = ( FBsnapshot.val() || [] );
}

function FBSet_PlayArea( player_id, FBsnapshot ) {
	Game.Players[ player_id ].PlayArea = ( FBsnapshot.val() || [] );
}

function FBSet_Aside( player_id, FBsnapshot ) {
	Game.Players[ player_id ].Aside = ( FBsnapshot.val() || [] );
}

function FBSet_Deck( player_id, FBsnapshot ) {
	Game.Players[ player_id ].Deck = ( FBsnapshot.val() || [] );
}

function FBSet_HandCards( player_id, FBsnapshot ) {
	Game.Players[ player_id ].HandCards = ( FBsnapshot.val() || [] );
}

function FBSet_DiscardPile( player_id, FBsnapshot ) {
	Game.Players[ player_id ].DiscardPile = ( FBsnapshot.val() || [] );
}

function FBSet_Phase( FBsnapshot ) {
	Game.phase = ( FBsnapshot.val() || '' );
}

function FBSet_TurnInfo( FBsnapshot ) {
	Game.TurnInfo = ( FBsnapshot.val() || {} );
}

function FBSet_Supply( FBsnapshot ) {
	Game.Supply = new CSupply( FBsnapshot.val() );
}

function FBSet_TrashPile( FBsnapshot ) {
	Game.TrashPile = ( FBsnapshot.val() || [] );
}



/* shortcut */
function SetAndPrintTurnCount( player_id, FBsnapshot ) {
	FBSet_TurnCount( player_id, FBsnapshot );
	PrintTurnCount( player_id );
}

function SetAndPrintConnection( player_id, FBsnapshot ) {
	FBSet_Connection( player_id, FBsnapshot );
	PrintConnection( player_id );
}

function SetAndPrintOpen( player_id, FBsnapshot ) {
	FBSet_Open( player_id, FBsnapshot );
	PrintOpen( player_id );
}
function SetAndPrintPlayArea( player_id, FBsnapshot ) {
	FBSet_PlayArea( player_id, FBsnapshot );
	PrintPlayArea( player_id );
}
function SetAndPrintAside( player_id, FBsnapshot ) {
	FBSet_Aside( player_id, FBsnapshot );
	PrintAside( player_id );
}
function SetAndPrintDeck( player_id, FBsnapshot ) {
	FBSet_Deck( player_id, FBsnapshot );
	PrintDeck( player_id );
}
function SetAndPrintHandCards( player_id, FBsnapshot ) {
	FBSet_HandCards( player_id, FBsnapshot );
	PrintHandCards( player_id );
}
function SetAndPrintDiscardPile( player_id, FBsnapshot ) {
	FBSet_DiscardPile( player_id, FBsnapshot );
	PrintDiscardPile( player_id );
}



function SetAndPrintPhase( FBsnapshot ) {
	FBSet_Phase( FBsnapshot );

	// switch ( Game.phase ) {
	// 	case 'ActionPhase' :
	// 		// アクションフェーズでアクションか手札にアクションカードが無いならば購入フェーズに自動で移行
	// 		if ( Game.TurnInfo.action <= 0 || !Game.player().HasActionCard() ) {
	// 			// Game.phase = 'BuyPhase';
	// 			// FBref_Game.child('phase').set( Game.phase );
	// 			Game.MovePhase('BuyPhase');
	// 			return;
	// 		}
	// 		break;

	// 	case 'BuyPhase*' :
	// 	case 'BuyPhase' :
	// 	case 'BuyPhase_GetCard' :
	// 		// 購入フェーズで購入が無いならばクリーンアップフェーズに自動で移行
	// 		if ( Game.TurnInfo.buy <= 0 ) {
	// 			Game.MoveToNextPlayer();
	// 			return;
	// 		}
	// 		break;

	// }
	PrintPhase();
}

function SetAndPrintTurnInfo( FBsnapshot ) {
	FBSet_TurnInfo( FBsnapshot );
	PrintTurnInfo();
}

function SetAndPrintSupply( FBsnapshot ) {
	FBSet_Supply( FBsnapshot );
	PrintSupply();
}

function SetAndPrintTrashPile( FBsnapshot ) {
	FBSet_TrashPile( FBsnapshot );
	PrintTrashPile();
}







