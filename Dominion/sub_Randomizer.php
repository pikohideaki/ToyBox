<?php


function blackmarket_cmp($a, $b) { return ( $Cardlist[$a]->cost - $Cardlist[$b]->cost ); }


// 表示関連



function gen_splytbl_row( $selected_card_no, $Cardlist ) {
	$card = $Cardlist[ $selected_card_no ];

	/* 背景色指定 */
	$bg_color = '';
	switch ( $card->set_name ) {
		case '基本'		: $bg_color = 'color_Original';    break;
		case '陰謀'		: $bg_color = 'color_Intrigue';    break;
		case '海辺'		: $bg_color = 'color_Seaside';     break;
		case '錬金術'	: $bg_color = 'color_Alchemy';     break;
		case '繁栄'		: $bg_color = 'color_Prosperity';  break;
		case '収穫祭'	: $bg_color = 'color_Cornucopia';  break;
		case '異郷'		: $bg_color = 'color_Hinterlands'; break;
		case '暗黒時代'	: $bg_color = 'color_Dark_Ages';   break;
		case 'ギルド'		: $bg_color = 'color_Guilds';      break;
		case '冒険'		: $bg_color = 'color_Adventures';  break;
		case '帝国'		: $bg_color = 'color_Empires';     break;
		default : break;
	}

	$htmlstr = <<<EOM
		<td nowrap class='{$bg_color}'>{$card->set_name}</td>
		<td nowrap class='{$bg_color}'>{$card->cost_str}</td>
		<td nowrap class='{$bg_color}'>{$card->name_jp }</td>
		<td nowrap class='{$bg_color}'>{$card->name_eng}</td>
		<td class='padding0'>
			<input type='button' class='btn-white card_effect' data-card_no='{$selected_card_no}' value='効果' >
		</td>
EOM;
	// $btn = ''
	// 	. "<input type='button' class='btn-white' value='効果' onclick=\""
	// 	. "alert('"
	// 	. 	'【分類】'.$card->class."\\n"
	// 	. 	'【種類】'.$card->category."\\n\\n"
	// 	. 	$card->effect1."\\n\\n"
	// 	. 	$card->effect2."\\n\\n"
	// 	. 	$card->effect3."\\n\\n"
	// 	. 	$card->effect4."\\n"
	// 	. "')"
	// 	. "\">";
	return $htmlstr;
}



function PrintRandomizer( $Setlist ) {
echo <<<EOM
		<div class='select-set'>
			<div class='select-all-btn'>
				<input type='button' class='btn-blue' value='全選択'
					onclick='select_all_set(true); ' >
				<input type='button' class='btn-blue' value='全解除'
					onclick='select_all_set(false); ' >
			</div>
EOM;

	for ( $i = 0; $i < count( $Setlist ); $i++ ) {  // $Setlist[0]のプロモは飛ばす
		$checked = ( $_COOKIE["use_set{$i}"] === 'T' ? 'checked' : '' );
echo <<<EOM
			<input type='checkbox' id='use_set{$i}' name='use_set{$i}' value='T' $checked >
			<label for='use_set{$i}' class='checkbox'> $Setlist[$i] </label>
EOM;
	}

echo <<<EOM
			<div class='clear'></div>
		</div>
EOM;

		// $set0checked = ( $_COOKIE["use_set0"] === 'T' ? 'checked' : '' );
		// <table>
		// <tbody id='promo'>
		// 	<td>プロモ</td>
		// 	<td> <input type='checkbox' class='iphone' id='use_set0' name='use_set0' value='T' $set0checked > </td>
		// </tbody>
		// </table>

echo <<<EOM
		<p>
			<input type='button' class='btn-blue' value='サプライをランダム生成' onclick='GenSupply();' >
			<input type='button' class='btn-blue' value='サプライを一時保存' onclick='save_supply();' >
			<input type='button' class='btn-blue' value='サプライを復元' onclick='restore_supply();' >
		</p>
EOM;
}





function PrintSupply( $gr, $Setlist, $Cardlist, $post_supply ) {
	$Prosperity_checked = ( $gr->supply->Prosperity ? 'checked' : '' );
	$DarkAges_checked   = ( $gr->supply->DarkAges ? 'checked' : '' );

echo <<<EOM

	<input type='checkbox' id='chbox_Prosperity' name='supply_Prosperity' value='T' {$Prosperity_checked} >
	<label for='chbox_Prosperity' class='checkbox'>白金貨・植民地</label>
	<input type='checkbox' id='chbox_DarkAges' name='supply_DarkAges' value='T' {$DarkAges_checked} >
	<label for='chbox_DarkAges'   class='checkbox'>避難所</label>

EOM;

// echo <<<EOM

// 	<table>
// 	<tbody>
// 		<tr>
// 			<td>白金貨・植民地</td>
// 			<td><input type='checkbox' class='iphone' name='supply_Prosperity' value='T' {$Prosperity_checked} > </td>
// 		</tr>

// 		<tr>
// 			<td>避難所</td>
// 			<td><input type='checkbox' class='iphone' name='supply_DarkAges' value='T' {$DarkAges_checked} ></td>
// 		</tr>
// 	</tbody>
// 	</table>

// EOM;

echo <<<EOM

	<table class='tbl-blue'>
	<tbody>
		<tr>
			<th nowrap>セット</th>
			<th nowrap>コスト</th>
			<th nowrap>名前</th>
			<th nowrap>name</th>
			<th nowrap>説明</th>
		</tr>

EOM;

	for ( $j = 0; $j < count( $Setlist ); $j++ ) {
		if ( $gr->supply->set[$j] ) {
			for ( $i = 0; $i < KINGDOMCARD_SIZE; $i++ ) {
				if ( $Cardlist[ $gr->supply->kingdomcards[$i] ]->set_name === $Setlist[$j] ) {
					$row = gen_splytbl_row( $gr->supply->kingdomcards[$i], $Cardlist );
echo <<<EOM

		<tr> $row </tr>

EOM;
				}
			}
		}
	}


	if ( $gr->supply->banecard > 0 ) {
		$row = gen_splytbl_row( $gr->supply->banecard, $Cardlist );
echo <<<EOM

		<tr><th colspan='5'>魔女娘 災いカード</th></tr>
		<tr> $row </tr>

EOM;
	}


	if ( $gr->supply->eventcards[0] > 0 || $gr->supply->eventcards[1] > 0 ) {

echo <<<EOM

		<tr><th colspan='5'>Eventカード</th></tr>

EOM;

		for ( $k = 0; $k < 2; $k++ ) {
			if ( $gr->supply->eventcards[$k] > 0 ) {
				$row = gen_splytbl_row( $gr->supply->eventcards[$k], $Cardlist );

echo <<<EOM

		<tr> $row </tr>

EOM;

			}
		}
	}


	if ( $gr->supply->landmark[0] > 0 || $gr->supply->landmark[1] > 0 ) {

echo <<<EOM

		<tr><th colspan='5'>Landmark</th></tr>

EOM;

		for ( $k = 0; $k < 2; $k++ ) {
			if ( $gr->supply->landmark[$k] > 0 ) {
				$row = gen_splytbl_row( $gr->supply->landmark[$k], $Cardlist );

echo <<<EOM

		<tr> $row </tr>

EOM;

			}
		}
	}


	if ( $gr->supply->obelisk > 0 ) {
		$row = gen_splytbl_row( $gr->supply->obelisk, $Cardlist );

echo <<<EOM

		<tr><th colspan='5'>Obelisk</th></tr>
		<tr> $row </tr>

EOM;

	}


	if ( $gr->supply->blackmarket[0] > 0 ) {

echo <<<EOM

		<tr><th colspan='5'>闇市場デッキ</th></tr>

EOM;

		$blackmarket_sorted = array();
		for ( $i = 0; $i < BLACKMARKET_SIZE; $i++ ) {
			$blackmarket_sorted[$i] = $gr->supply->blackmarket[$i];
		}
		usort( $blackmarket_sorted, 'blackmarket_cmp' );
		for ( $j = 0; $j < count( $Setlist ); $j++ ) {
			if ( $gr->supply->set[$j] ) {
				for ( $i = 0; $i < BLACKMARKET_SIZE; $i++ ) {
					if ( $Cardlist[ $blackmarket_sorted[$i] ]->set_name === $Setlist[$j] ) {
						$row = gen_splytbl_row( $blackmarket_sorted[$i], $Cardlist );

echo <<<EOM

		<tr> $row </tr>

EOM;

					}
				}
			}
		}
	}

echo <<<EOM

	</tbody>
	</table>

EOM;

	if ( $post_supply ) {
		for ( $i = 0; $i < KINGDOMCARD_SIZE; $i++ ) {
echo <<<EOM
		<input type='hidden' name='supply_kingdomcards{$i}'
			value= '{$gr->supply->kingdomcards[$i]}' >
EOM;
		}
		$value_Prosperity = ( $gr->supply->Prosperity ? 'T' : 'F' );
		$value_DarkAges   = ( $gr->supply->DarkAges   ? 'T' : 'F' );
echo <<<EOM
		<input type='hidden' name='supply_Prosperity'
			value="{$value_Prosperity}">
		<input type='hidden' name='supply_DarkAges'
			value="{$value_DarkAges}">
		<input type='hidden' name='supply_eventcards0'
			value="{$gr->supply->eventcards[0] } ">
		<input type='hidden' name='supply_eventcards1'
			value="{$gr->supply->eventcards[1] } ">
		<input type='hidden' name='supply_landmark0'
			value="{$gr->supply->landmark[0]   } ">
		<input type='hidden' name='supply_landmark1'
			value="{$gr->supply->landmark[1]   } ">
		<input type='hidden' name='supply_banecard'
			value="{$gr->supply->banecard      } ">
		<input type='hidden' name='supply_obelisk'
			value="{$gr->supply->obelisk       } ">
EOM;
		for ( $i = 0; $i < BLACKMARKET_SIZE; $i++ ) {
echo <<<EOM
		<input type='hidden' name='blackmarket{$i}'
			value="{$gr->supply->blackmarket[$i]}">
EOM;
		}
	}

}


