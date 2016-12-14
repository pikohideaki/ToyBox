

function MakeMap_CardName2No( Cardlist )
{
	CardName2No = {};
	for ( var i = 1; i < Cardlist.length; i++ ) {
		CardName2No[ Cardlist[i].name_eng ] = i;
	}
	return CardName2No;
}


function CSupplyCardArray2NamejpArray( Cardlist, array ) {
	var namearray = [];
	for ( var i = 0; i < array.length; i++ ) {
		namearray[i] = Cardlist[ array[i].card_no ].name_jp;
	}
	return namearray;
}


function IsActionCard( Cardlist, card_no ) {
	return Cardlist[ card_no ].category.match( /Action/ );
}

function IsTreasureCard( Cardlist, card_no ) {
	return Cardlist[ card_no ].category.match( /Treasure/ );
}

function IsVictoryCard( Cardlist, card_no ) {
	return Cardlist[ card_no ].category.match( /Victory/ );
}

function IsReactionCard( Cardlist, card_no ) {
	return Cardlist[ card_no ].category.match( /Reaction/ );
}

