

import FBdatabase from '/Dominion/js/sub_InitializeFirebase.js';


// <!-- function & class -->
	let RoomInfo = {};  /* global object, not changed after initialization */
	let Game = {};  /* global object */
	// let CardName2No = MakeMap_CardName2No( Cardlist );  /* global object */
	let Initialize;
	const SizeOf$Card   = new SizeOfjQueryObj( $('.SupplyArea.line2').find('.card') );
	const SizeOf$sCard  = new SizeOfjQueryObj( $('.SupplyArea.line1').find('.card') );
	const SizeOf$ssCard = new SizeOfjQueryObj( $('.OtherPlayers-wrapper').find('.card') );
	const SizeOf$CardArea = new SizeOfjQueryObj( $('.OtherPlayers-wrapper').find('.card') );

// '/Dominion/js/Online_Cardlist.js'
// '/Dominion/js/Online_ChatArea.js'
// '/Dominion/js/Online_MakeHTML.js'
// '/Dominion/js/Online_Print.js'
// '/Dominion/js/Online_FBSet.js'
// '/Dominion/js/Online_SelectCards.js'
// '/Dominion/js/Online_CSupply.js'
// '/Dominion/js/Online_CPlayer.js'
// '/Dominion/js/Online_CardEffects.js'
// '/Dominion/js/Online_CardEffects_01_Original.js'
// '/Dominion/js/Online_CardEffects_02_Intrigue.js'
// '/Dominion/js/Online_CardEffects_03_Seaside.js'
// '/Dominion/js/Online_CardEffects_04_Alchemy.js'
// '/Dominion/js/Online_CardEffects_05_Prosperity.js'
// '/Dominion/js/Online_CardEffects_06_Cornucopia.js'
// '/Dominion/js/Online_CardEffects_07_Hinterlands.js'
// '/Dominion/js/Online_CardEffects_08_Dark_Ages.js'
// '/Dominion/js/Online_CardEffects_09_Guilds.js'
// '/Dominion/js/Online_CardEffects_10_Adventures.js'
// '/Dominion/js/Online_CardEffects_11_Empires.js'
// '/Dominion/js/Online_CGame.js'
// '/Dominion/js/Online_ButtonActions.js'

// '/Dominion/js/Online_FirebaseSync.js'
// '/Dominion/js/Online_Signals.js'


const FBref_Rooms = FBdatabase.ref('/Rooms');

const FBref_connected            = FBdatabase.ref(".info/connected");
const FBref_Room                 = FBref_Rooms.child( GameRoomID );
const FBref_chat                 = FBref_Room.child('chat');

const FBref_Message              = FBref_Room.child( 'Message' );
const FBref_MessageTo            = FBref_Room.child( 'MessageTo' );
const FBref_MessageToMe          = FBref_Room.child( `MessageTo/${myid}` );

const FBref_Game                 = FBref_Room.child( 'Game' );
const FBref_Settings             = FBref_Game.child( 'Settings' );
const FBref_Supply               = FBref_Game.child( 'Supply' );
const FBref_Players              = FBref_Game.child( 'Players' );
const FBref_TurnInfo             = FBref_Game.child( 'TurnInfo' );
const FBref_StackedCardIDs       = FBref_Game.child( 'StackedCardIDs' );

const FBref_Signal               = FBref_Room.child( 'Signals' );
const FBref_SignalToMe           = FBref_Signal.child( myid );
const FBref_SignalAttackEnd      = FBref_Signal.child( 'AttackEnd' );
const FBref_SignalReactionEnd    = FBref_Signal.child( 'ReactionEnd' );
const FBref_SignalRevealReaction = FBref_Signal.child( 'RevealReaction' );
const FBref_SignalBaneCardEnd    = FBref_Signal.child( 'BaneCardEnd' );
const FBref_SignalRevealBaneCard = FBref_Signal.child( 'RevealBaneCard' );





