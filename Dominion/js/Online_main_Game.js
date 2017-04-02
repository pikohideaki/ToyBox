// import * as firebase from 'firebase';
// import FBdatabase from '/Dominion/js/sub_InitializeFirebase.js';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// async function asfn() {
// 	await new Promise( resolve => setTimeout( resolve, 3000 ) );
// 	// console.log( "3 seconds passed.");
// 	return "hello";
// }
// import ( "sub_InitializeFirebase.js" );
// function f( a : number, b : number , c : string ) {
// 	return a + b;
// }
// console.log( f(1, 2, "3") );
function StartTurnOf(player_id) {
    return __awaiter(this, void 0, void 0, function* () {
        yield new Promise(resolve => setTimeout(resolve, 1000));
        yield new Promise(resolve => setTimeout(resolve, 1000));
        return '2[s]';
    });
}
