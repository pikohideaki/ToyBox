

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

function IsAttackCard( Cardlist, card_no ) {
	return Cardlist[ card_no ].category.match( /Attack/ );
}

// 褒賞カード
function IsPrizeCard( Cardlist, card_no ) {
	return Cardlist[ card_no ].category.match( /Prize/ );
}



class CCost {
	constructor( Obj ) {
		if ( Obj == undefined ) {
			this.coin   = 0;
			this.potion = 0;
			this.debt   = 0;
		} else if ( Obj instanceof Array ) {
			this.coin   = Obj[0];
			this.potion = Obj[1];
			this.debt   = Obj[2];
		} else {
			this.coin   = Obj.cost;
			this.potion = Obj.cost_potion;
			this.debt   = Obj.cost_debt;
		}
	}
}



/* comp_by : '<', '<=', '==', '>=', '>' */
function CostOp( comp_by, CardA_Cost, CardB_Cost ) {
	switch (comp_by) {
		case '<'  :
			return CardA_Cost.coin   < CardB_Cost.coin
			    && CardA_Cost.potion < CardB_Cost.potion
			    && CardA_Cost.debt   < CardB_Cost.debt;

		case '<=' :
			return CardA_Cost.coin   <= CardB_Cost.coin
			    && CardA_Cost.potion <= CardB_Cost.potion
			    && CardA_Cost.debt   <= CardB_Cost.debt;

		case '==' :
			return CardA_Cost.coin   == CardB_Cost.coin
			    && CardA_Cost.potion == CardB_Cost.potion
			    && CardA_Cost.debt   == CardB_Cost.debt;

		case '>=' :
			return CardA_Cost.coin   >= CardB_Cost.coin
			    && CardA_Cost.potion >= CardB_Cost.potion
			    && CardA_Cost.debt   >= CardB_Cost.debt;

		case '>'  :
			return CardA_Cost.coin   > CardB_Cost.coin
			    && CardA_Cost.potion > CardB_Cost.potion
			    && CardA_Cost.debt   > CardB_Cost.debt;

		case '+'  :
			return new CCost( [
				CardA_Cost.coin   + CardB_Cost.coin,
				CardA_Cost.potion + CardB_Cost.potion,
				CardA_Cost.debt   + CardB_Cost.debt
			]);

		case '-'  :
			return new CCost( [
				CardA_Cost.coin   - CardB_Cost.coin,
				CardA_Cost.potion - CardB_Cost.potion,
				CardA_Cost.debt   - CardB_Cost.debt
			]);

		default   :
			return false;
	}
}

