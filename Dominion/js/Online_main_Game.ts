// import * as firebase from 'firebase';
// import FBdatabase from '/Dominion/js/sub_InitializeFirebase.js';



// import ( "sub_InitializeFirebase.js" );



declare function NextPlayerID( player_id: number, player_num: number ): number;
declare function GameFinished( SupplyCards: Object ): boolean;
declare var SupplyCards: Object;

declare class CPlayer {
	constructor() {}
	InitDeck( myid: number, myname: string, SupplyObj: Obj ): void;
}
declare var Players: CPlayer[];


async function Game_main( player_id: number ): Promise<void> {

	// 対戦中
	while ( !GameFinished( SupplyCards ) ) {


		player_id = NextPlayerID( player_id );
	}


	// game has finished


	return;
}


