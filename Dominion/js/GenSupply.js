
function select_all_set(flag) {
	for ( var i = 0; i < Setlist.length; ++i ) {
		$('#use_set' + i ).prop( 'checked', flag );
	}
}



function gen_splytbl_row( selected_card_no, Cardlist ) {
	let card = Cardlist[ selected_card_no ];

	/* 背景色指定 */
	let bg_color = '';
	switch ( card.set_name ) {
		case '基本'		: bg_color = 'color_Original';    break;
		case '陰謀'		: bg_color = 'color_Intrigue';    break;
		case '海辺'		: bg_color = 'color_Seaside';     break;
		case '錬金術'	: bg_color = 'color_Alchemy';     break;
		case '繁栄'		: bg_color = 'color_Prosperity';  break;
		case '収穫祭'	: bg_color = 'color_Cornucopia';  break;
		case '異郷'		: bg_color = 'color_Hinterlands'; break;
		case '暗黒時代'	: bg_color = 'color_Dark_Ages';   break;
		case 'ギルド'		: bg_color = 'color_Guilds';      break;
		case '冒険'		: bg_color = 'color_Adventures';  break;
		case '帝国'		: bg_color = 'color_Empires';     break;
		default : break;
	}

	let htmlstr = `
		<td nowrap class='${bg_color}'>${card.set_name}</td>
		<td nowrap class='${bg_color}'>${card.cost_str}</td>
		<td nowrap class='${bg_color}'>${card.name_jp }</td>
		<td nowrap class='${bg_color}'>${card.name_eng}</td>
		<td class='padding0'>
			<input type='button' class='btn-white card_effect' data-card_no='${selected_card_no}' value='効果' >
		</td>`;
	// var btn = ''
	//  + "<input type='button' class='btn-white' value='効果' onclick=\""
	//  + "alert('"
	//  + '【分類】'+card.class+"\\n"
	//  + '【種類】'+card.category+"\\n\\n"
	//  + card.effect1+"\\n\\n"
	//  + card.effect2+"\\n\\n"
	//  + card.effect3+"\\n\\n"
	//  + card.effect4+"\\n"
	//  + "')"
	//  + "\">";
	// htmlstr_tmp += "<td class='padding0'>"+btn+'</td>';

	return htmlstr;
}





function GenSupply()
{
	initsupply( supply, Cardlist, Setlist );
	var flag = false;
	var use_set = [];
	var use_set_num = 0;
	for ( var i = 0; i < Setlist.length; i++ ) {
		use_set[i] = document.form_add_game.elements['use_set'+i].checked;
		$.cookie('use_set' + i, (use_set[i] ? 'T' : 'F' ) );
		if ( use_set[i] ) {
			if ( i !== 0 ) { // プロモのみの場合alertするためにi = 0ではflagは立てない
				flag = true; // 1つでもtrueがあればtrue.
			}
			use_set_num++;
		}
	}
	if ( !flag ) { // 1つもチェックされていないとき
		alert( '使用するセット名を1つ以上選択してください.' );
		return;
	}

 // randomizer (Randomizer.js)
	randomizer( Setlist, use_set, Cardlist, supply );
	select_event_and_landmark( Setlist, use_set, Cardlist, supply );

 // 選ばれた event card, landmark card の枚数を調べる
	var eventcard_num = 0;
	var landmark_num = 0;
	if ( supply.eventcards[0] > 0 ) eventcard_num++;
	if ( supply.eventcards[1] > 0 ) eventcard_num++;
	if ( supply.landmark  [0] > 0 ) landmark_num++;
	if ( supply.landmark  [1] > 0 ) landmark_num++;

 // 特殊カードの処理
	var banecard    = false; // 魔女娘が有効のときは災いカードとしてサプライを1つ追加し表示
	var blackmarket = false; // 闇市場が有効のときはBLACKMARKET_SIZE種類のサプライを選び3枚ずつめくって1枚選択
	var obelisk     = false; // obelisk が有効の時はサプライの中からアクションカードを1枚選ぶ（選べないときは何もしない）
	for ( var i = 0; i < KINGDOMCARD_SIZE; i++ ) {
		if ( Cardlist[ supply.kingdomcards[i] ].name_jp === '魔女娘' ) banecard    = true;
		if ( Cardlist[ supply.kingdomcards[i] ].name_jp === '闇市場' ) blackmarket = true;
	}
	if ( Cardlist[ supply.landmark[0] ].name_jp === 'Obelisk' ) obelisk = true;
	if ( Cardlist[ supply.landmark[1] ].name_jp === 'Obelisk' ) obelisk = true;

	if ( banecard ) {
		select_banecard( Setlist, use_set, Cardlist, supply );
	}
	if ( blackmarket ) {
		select_blackmarket( Setlist, use_set, Cardlist, supply );
	}
	if ( obelisk ) {
		select_obelisk( Setlist, use_set, Cardlist, supply, banecard );
	}

	print_supply();
}



function save_supply() {
	var use_set = [];
	for ( var i = 0; i < Setlist.length; i++ ) {
		// use_set[i] = document.form_add_game.elements['use_set'+i].checked;
		use_set[i] = $( '#use_set'+i ).prop('checked');
		$.cookie('use_set' + i, (use_set[i] ? 'T' : 'F' ) );
	}
	$.cookie( 'save_Prosperity', $( '#supply_Prosperity' ).prop('checked') );
	$.cookie( 'save_DarkAges'  , $( '#supply_DarkAges'   ).prop('checked') );
	for ( var i = 0; i < KINGDOMCARD_SIZE; i++ ) {
		$.cookie( 'save_kingdomcards' + i, supply.kingdomcards[i] );
	}
	$.cookie( 'save_banecard'   , supply.banecard      );
	$.cookie( 'save_obelisk'    , supply.obelisk       );
	$.cookie( 'save_eventcards0', supply.eventcards[0] );
	$.cookie( 'save_eventcards1', supply.eventcards[1] );
	$.cookie( 'save_landmark0'  , supply.landmark[0]   );
	$.cookie( 'save_landmark1'  , supply.landmark[1]   );
	for ( var i = 0; i < BLACKMARKET_SIZE; i++ ) {
		$.cookie( 'save_blackmarket' + i, supply.blackmarket[i] );
	}
	alert( 'サプライを一時保存しました。' );
}




function restore_supply() {
	var use_set = [];
	for ( var i = 0; i < Setlist.length; i++ ) {
		if ( $.cookie('use_set' + i ) === 'T' ) {
			$( '#use_set'+i ).prop('checked', true );
		}
	}
	supply.Prosperity    = ( $.cookie( 'save_Prosperity' ) == 'true' );
	supply.DarkAges      = ( $.cookie( 'save_DarkAges'   ) == 'true' );
	for ( var i = 0; i < KINGDOMCARD_SIZE; i++ ) {
		supply.kingdomcards[i] = Number( $.cookie( 'save_kingdomcards' + i ) );
	}
	supply.banecard      = Number( $.cookie( 'save_banecard'    ) );
	supply.obelisk       = Number( $.cookie( 'save_obelisk'     ) );
	supply.eventcards[0] = Number( $.cookie( 'save_eventcards0' ) );
	supply.eventcards[1] = Number( $.cookie( 'save_eventcards1' ) );
	supply.landmark[0]   = Number( $.cookie( 'save_landmark0'   ) );
	supply.landmark[1]   = Number( $.cookie( 'save_landmark1'   ) );
	for ( var i = 0; i < BLACKMARKET_SIZE; i++ ) {
		supply.blackmarket[i] = Number( $.cookie( 'save_blackmarket' + i ) );
	}

	print_supply();
	alert( 'サプライを復元しました。' );
}




function print_supply() /* globaly declared : Setlist.length, set_name, card, supply */
{
	var use_set = [];
	for ( var i = 0; i < Setlist.length; i++ ) {
		use_set[i] = $( '#use_set'+i ).prop('checked');
	}

	var eventcard_num = 0;
	var landmark_num = 0;
	if ( supply.eventcards[0] > 0 ) eventcard_num++;
	if ( supply.eventcards[1] > 0 ) eventcard_num++;
	if ( supply.landmark  [0] > 0 ) landmark_num++;
	if ( supply.landmark  [1] > 0 ) landmark_num++;

 // 特殊カードの処理
	var banecard    = false; // 魔女娘が有効のときは災いカードとしてサプライを1つ追加し表示
	var blackmarket = false; // 闇市場が有効のときはBLACKMARKET_SIZE種類のサプライを選び3枚ずつめくって1枚選択
	var obelisk     = false; // obelisk が有効の時はサプライの中からアクションカードを1枚選ぶ（選べないときは何もしない）
	for ( var i = 0; i < KINGDOMCARD_SIZE; i++ ) {
		if ( Cardlist[ supply.kingdomcards[i] ].name_jp === '魔女娘' ) banecard    = true;
		if ( Cardlist[ supply.kingdomcards[i] ].name_jp === '闇市場' ) blackmarket = true;
	}
	if ( Cardlist[ supply.landmark[0] ].name_jp === 'Obelisk' ) obelisk = true;
	if ( Cardlist[ supply.landmark[1] ].name_jp === 'Obelisk' ) obelisk = true;



 // html書き換え用文字列準備
	var htmlstr = ''
	 + "<input type='checkbox'\
		 name='supply_Prosperity' id='supply_Prosperity'  value='T'"
	 + ( supply.Prosperity  ? 'checked' : '' ) + ">"
	 + "<label for='supply_Prosperity' class='checkbox'>白金貨・植民地</label>"
	 + "<input type='checkbox'\
		 name='supply_DarkAges' id='supply_DarkAges'  value='T'"
	 + ( supply.DarkAges  ? 'checked' : '' ) + ">"
	 + "<label for='supply_DarkAges' class='checkbox'>避難所</label>";


	// htmlstr += 
	// "<table>\
	// <tbody>\
	// <tr>\
	// 	<td>白金貨・植民地</td>\
	// 	<td><input type='checkbox' class='iphone'\
	// 	  name='supply_Prosperity' id='supply_Prosperity'  value='T'"
	// 	 + ( supply.Prosperity  ? 'checked' : '' ) + ">\
	// 	</td>\
	// </tr>\
	// \
	// <tr>\
	// 	<td>避難所</td>\
	// 	<td><input type='checkbox' class='iphone'\
	// 	  name='supply_DarkAges' id='supply_DarkAges'  value='T'"
	// 	 + ( supply.DarkAges ? 'checked' : '' ) + "></td>\
	// </tr>\
	// </tbody>\
	// </table>\n";


	SUPPLY_HEADER =
	"<tr>\
	<th nowrap>セット</th>\
	<th nowrap>コスト</th>\
	<th nowrap>名前</th>\
	<th nowrap>name</th>\
	<th nowrap>説明</th>\
	</tr>\n";

	htmlstr += 
	"<table class='tbl-blue'>\
	<tbody>\n"
	 + SUPPLY_HEADER;

 // 王国カード
	for ( var j = 0; j < Setlist.length; j++ ) {
		if ( use_set[j] ) {
			for ( var i = 0; i < KINGDOMCARD_SIZE; i++ ) {
				if ( Cardlist[ supply.kingdomcards[i] ].set_name ===  Setlist[j] ) {
					htmlstr += '<tr>';
					htmlstr += gen_splytbl_row( supply.kingdomcards[i], Cardlist );
					htmlstr += "</tr>\n";
				}
			}
		}
	}


 // 災いカード
	if ( banecard ) {
		htmlstr +=
		   "<tr><th colspan='5'>魔女娘 災いカード</th></tr>"
		 + SUPPLY_HEADER
		 + "<tr>"
		 + gen_splytbl_row( supply.banecard, Cardlist )
		 + "</tr>\n";
	}

 // イベントカード
	if ( eventcard_num > 0 ) {
		htmlstr +=
		"<tr><th colspan='5'> Eventカード</th></tr>\n"
		 + SUPPLY_HEADER;
		for ( var i = 0; i < 2; i++ ) {
			if ( supply.eventcards[i] > 0 ) {
				htmlstr +=
				   '<tr>'
				 + gen_splytbl_row( supply.eventcards[i], Cardlist )
				 + "</tr>\n";
			}
		}
	}

 // Landmark cards
	if ( landmark_num > 0 ) {
		htmlstr +=
		"<tr><th colspan='5'> Landmarkカード</th></tr>\n"
		 + SUPPLY_HEADER;
		for ( var i = 0; i < 2; i++ ) {
			if ( supply.landmark[i] > 0 ) {
				htmlstr +=
				   '<tr>'
				 + gen_splytbl_row( supply.landmark[i], Cardlist )
				 + "</tr>\n";
			}
		}
	}

 /* Obelisk */
	if ( obelisk ) {
		htmlstr +=
		   "<tr><th colspan='5'>Obelisk</th></tr>\n"
		 + SUPPLY_HEADER
		 + "<tr>"
		 + gen_splytbl_row( supply.obelisk, Cardlist )
		 + "</tr>\n";
	}

 /* 闇市場 */
	if ( blackmarket ) {
		var blackmarket_sorted = [];  // 表示用
		for ( var i = 0; i < BLACKMARKET_SIZE; i++ ) {
			blackmarket_sorted[i] = supply.blackmarket[i];
		}
		blackmarket_sorted.sort(
			function(a, b) {
				return ( Cardlist[a].cost_coin - Cardlist[b].cost_coin );
			}
		);

		// var str_blackmarket = '';
		htmlstr +=
		 "<tr><th colspan='5'>闇市場デッキ</th></tr>\n"
		 + SUPPLY_HEADER;
		for ( var j = 0; j < Setlist.length; j++ ) {
			if ( use_set[j] ) {
				for ( var i = 0; i < BLACKMARKET_SIZE; i++ ) {
					if ( Cardlist[ blackmarket_sorted[i] ].set_name ===  Setlist[j] ) {
						htmlstr +=
						   "<tr>"
						 + gen_splytbl_row( blackmarket_sorted[i], Cardlist )
						 + "</tr>\n";
					}
				}
			}
		}
	}
	htmlstr +=
	"</tbody>\
	</table>\n";

	if ( blackmarket ) {
		htmlstr +=
		"<input type='button' class='btn-blue' name='blackmarket' value='上から3枚めくる'\
		 onclick='blackmarket_open();'>\n";
	}


 // hidden 処理
	for ( var i = 0; i < KINGDOMCARD_SIZE; i++ ) {
		htmlstr +=
		"<input type='hidden' name='supply_kingdomcards"+i+"'\
		 value='" + supply.kingdomcards[i] + "'>\n";
	}
	if ( banecard ) {
		htmlstr +=
		"<input type='hidden' name='supply_banecard'\
		 value='" + supply.banecard + "'>\n";
	}
	if ( obelisk ) {
		htmlstr +=
		"<input type='hidden' name='supply_obelisk'\
		 value='" + supply.obelisk + "'>\n";
	}
	{
		htmlstr +=
		"<input type='hidden' name='supply_eventcards0'\
		 value='"+supply.eventcards[0]+"'>\n\
		 <input type='hidden' name='supply_eventcards1'\
		 value='"+supply.eventcards[1]+"'>\n";
	}
	{
		htmlstr +=
		"<input type='hidden' name='supply_landmark0'\
		 value='"+supply.landmark[0]+"'>\n\
		 <input type='hidden' name='supply_landmark1'\
		 value='"+supply.landmark[1]+"'>\n";
	}
	if ( blackmarket ) {
		for ( var i = 0; i < BLACKMARKET_SIZE; i++ ) {
			htmlstr +=
			"<input type='hidden' name='supply_blackmarket"+i+"'\
			 value='"+supply.blackmarket[i]+"'>\n";
		}
	}


 // html書き換え
	$("#div_supply").html(htmlstr);
	$("#div_blackmarket").html('');
	// $(function() { $('.iphone:checkbox').iphoneStyle(); });
}



function blackmarket_open() {
	var unbought_num = 0;
	for ( var i = 0; i < BLACKMARKET_SIZE; i++ ) {
		if ( !supply.blackmarket_bought[i] ) unbought_num++;
	}
	var open_num = Math.min( 3, unbought_num );  // 上からめくる枚数

	var top3 = [];
	var t = 0;
	for ( var i = 0; i < supply.blackmarket.length; i++ ) {
		if ( supply.blackmarket_bought[i] ) continue;
		top3[t] = i;
		if ( ++t >= open_num ) break;
	}


	var htmlstr = '残り'+ unbought_num +"枚<br>\n";
	if ( unbought_num > 0 ) {
		htmlstr += "<table class='tbl-blue'>"
		htmlstr += SUPPLY_HEADER;
		for ( var i = 0; i < open_num; i++ ) {
			htmlstr += "<tr>";
			htmlstr += gen_splytbl_row( supply.blackmarket[top3[i]], Cardlist );
			htmlstr += "<td class='padding0'><input type='button' class='btn-white'";
			htmlstr += "name='blackmarket_three' value='購入'";
			htmlstr += "onclick=\"confirm_buy("+top3[i]+")\" ></td>";
			htmlstr += "</tr>\n";
		}
		htmlstr += "<input type='button' class='btn-blue' name='blackmarket_three' value='購入しない'";
		htmlstr += "onclick=\"confirm_buy(-1)\"";
		htmlstr += "</table>\n";
	}

// html書き換え
	$("#div_blackmarket").html(htmlstr);

	return 0;
}


function confirm_buy( t ) {
	if ( t >= 0 ) {  // 「購入」を押して来たときはtは0~14, そうでなければ-1
		if ( confirm('「'+ Cardlist[ supply.blackmarket[t] ].name_jp+'」を購入しますか?') ) {
			blackmarket_buy(t);
		}
	} else {
		if ( confirm('「購入しない」でよろしいですか?') ) {
			blackmarket_buy(-1);
		}
	}
}

function blackmarket_buy( t ) {
	var unbought_num = 0;  // 残り枚数カウント
	for ( var i = 0; i < BLACKMARKET_SIZE; i++ ) {
		if ( !supply.blackmarket_bought[i] ) unbought_num++;
	}

	var buy_flag = ( t >= 0 );
	if ( buy_flag ) {
		supply.blackmarket_bought[t] = true;
		unbought_num--;
	}

	var htmlstr = '';
	htmlstr += '残り'+ unbought_num +"枚<br>\n";


	if ( unbought_num > 3 ) {
		// rearrangeがtrueのときのみ使用. 購入しないときで3枚, 購入したときで2枚を下に置く.
		var rearrange_num = ( buy_flag ? 2 : 3 );

		var top3 = [];
		var t = 0;
		for ( var i = 0; i < supply.blackmarket.length; i++ ) {
			if ( supply.blackmarket_bought[i] ) continue;
			top3[t] = i;
			if ( ++t >= rearrange_num ) break;
		}

		htmlstr += "ドラッグ&ドロップして並べ替えてください（下側が底側になります）.\n";
		htmlstr += "<input type='button' class='btn-blue' value='ok'";
		htmlstr += "onclick=\"confirm_rearrange("+rearrange_num+");\" >\n";

		htmlstr += "<table class='tbl-blue' id='blackmarket_sortable'>";
		htmlstr += "<tbody>";
		htmlstr += SUPPLY_HEADER;
		for ( var i = 0; i < rearrange_num; i++ ) {
			htmlstr += `<tr data-card_no='${supply.blackmarket[top3[i]]}'>`;
			htmlstr += gen_splytbl_row( supply.blackmarket[top3[i]], Cardlist );
			// htmlstr += "<td><font color='white'>"+supply.blackmarket[top3[i]]+"</font></td>";
			htmlstr += "</tr>\n";
		}
		htmlstr += "</tbody>\n";
		htmlstr += "</table>\n";
	}

	$("#div_blackmarket").html(htmlstr);

	$(function() {
		$( '#blackmarket_sortable tbody' ).sortable();
	});

	return 0;
}


function confirm_rearrange( rearrange_num ) {
	if ( confirm('この順番でよろしいですか?') ) {
		blackmarket_rearrange( rearrange_num );
	}
}


function blackmarket_rearrange( rearrange_num ) {
	var bottom = [];
	var i = 0;
	$('#blackmarket_sortable tbody tr').map( function() {
		var num = Number( $(this).attr('data-card_no') );
		// var num = $(this).find(':nth-child(6)').children('font').text();
		if ( num > 0 ) {
			bottom[i] = Number( num );
			i++;
		}
	});

	for ( var i = 0; i < bottom.length; i++ ) {
		supply.blackmarket_bought[BLACKMARKET_SIZE + i] = false;
		supply.blackmarket[BLACKMARKET_SIZE + i] = bottom[i];
	}

	for ( var j = 0; j < rearrange_num; j++ ) {  // unboughtを先頭から2枚を消す
		for ( var i = 0; i < BLACKMARKET_SIZE; i++ ) {
			if ( !supply.blackmarket_bought[i] ) {
				supply.blackmarket_bought.splice(i,1);
				supply.blackmarket.splice(i,1);
				break;
			}
		}
	}

	var unbought_num = 0;  // 残り枚数カウント
	for ( var i = 0; i < BLACKMARKET_SIZE; i++ ) {
		if ( !supply.blackmarket_bought[i] ) unbought_num++;
	}
	var htmlstr = '';
	htmlstr += '残り'+ unbought_num +"枚<br>\n";

	$("#div_blackmarket").html(htmlstr);
}
