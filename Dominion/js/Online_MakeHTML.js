
function MakeHTML_button( class_str, button_value ) {
	return `<button class='btn-blue ${class_str}'>${button_value}</button>`;
}


/* supply html */
function MakeHTML_SupplyPile( SupplyPile, Cardlist ) {
	const num           = SupplyPile.pile.length;
	const card_name_eng = Cardlist[ SupplyPile.card_no ].name_eng;
	const card_name_jp  = Cardlist[ SupplyPile.card_no ].name_jp;
	const cost_coin     = Cardlist[ SupplyPile.card_no ].cost;
	const card_no       = SupplyPile.card_no;
	const top_card_ID   = SupplyPile.LookTopCard().card_ID;
	return `
			<div class='supply-card-wrapper' data-card_no=${card_no}>
				<button class="card face"
					data-top_card_ID='${top_card_ID}' 
					data-card_no='${card_no}' 
					data-card-name-eng='${card_name_eng}'
					data-card_name_jp='${card_name_jp}'>
					<span class='card-cost-coin'>${cost_coin}</span>
					<span class="card-num-of-remaining ${( num > 0 ? '' : ' disabled ')}">${num}</span>
				</button>
			</div>
			`;
					// <i class="fa fa-search-plus zoom_card" aria-hidden="true"></i>
}



function MakeHTML_MyArea_Supply() {
	return `
			<div class='Common-Area'>
				<div class='SupplyArea-wrapper'>
					<!-- 基本カード -->
					<div class='SupplyArea line1'> <!-- jsでここを書き換え --> </div>
					<div class='clear'></div>
					<!-- 王国カード -->
					<div class='SupplyArea_line23'>
						<div class='SupplyArea line2'> <!-- jsでここを書き換え --> </div>
						<div class='SupplyArea line3'> <!-- jsでここを書き換え --> </div>
						<div class='clear'></div>
					</div>
					<div class='clear'></div>
				</div>
				<div class='clear'></div>
			</div>
			`;
}



function MakeHTML_Card( card ) {
	return `
		<button
			class='card face ${( card.class_str || '' )}'
			data-card_no='${card.card_no}'
			data-card_ID='${card.card_ID}'
			data-card_name_jp='${Cardlist[ card.card_no ].name_jp}'>
			<span class='card-cost-coin'>${Cardlist[ card.card_no ].cost}</span>
		</button>
		`;
			// <i class="fa fa-search-plus zoom_card" aria-hidden="true"></i>
}


function MakeHTML_CardBiggest( card_no ) {
	return `<button class='card_biggest face' data-card_no='${card_no}'> </button>`;
}




function MakeHTML_OtherPlayerDiv( player_id ) {
	return `
			<div class='OtherPlayer' data-player_id='${player_id}'>
				<div class='player_name'>
					${Game.Players[ player_id ].name}
				</div>
				<div class='player_TurnCount'>
					（ターン数 ： <span class='player_TurnCount_num'>${Game.Players[ player_id ].TurnCount}</span>）
					<span class='player_Connection'></span>
				</div>
				<div class='clear'></div>

				<div class='sCardArea sOpen'>        </div>
				<div class='clear'></div>

				<div class='sCardArea sPlayArea'>    </div>
				<div class='sCardArea sAside'>       </div>
				<div class='clear'></div>

				<div class='sCardArea sDeck'>        </div>
				<div class='sCardArea sHandCards'>   </div>
				<div class='sCardArea sDiscardPile'> </div>
				<div class='OtherPlayer_Buttons'>
					<button class='btn-blue ok'>OK</button>
				</div>
				<div class='clear'></div>
			</div>
			`;
}

