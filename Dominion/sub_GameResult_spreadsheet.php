<?php


function swap_DD( &$DD, $i ) {
	$tmp = new DoministData();
	$tmp        = $DD[$i];
	$DD[$i]     = $DD[$i + 1];
	$DD[$i + 1] = $tmp;
}



function spreadsheet( $GR, $GRsize, $dominist, $dominist_num, $checked_player_num ) {
	$DD = array();

 // まずdominist[]->nameがkeyのDoministData型配列とする(あとでsortのためにkeyを数値に変換)
	for ( $i = 0; $i < $dominist_num; $i++ ) {
		$DD[ $dominist[$i]->name ] = new DoministData();
		$DD[ $dominist[$i]->name ]->name = $dominist[$i]->name;
		$DD[ $dominist[$i]->name ]->play_num_sum = 0;
		$DD[ $dominist[$i]->name ]->score_sum = 0.0;
		$DD[ $dominist[$i]->name ]->rank_num = array( 1 => 0, 0, 0, 0, 0, 0 );
		$DD[ $dominist[$i]->name ]->play_num = array( 1 => 0, 0, 0, 0, 0, 0 );
		$DD[ $dominist[$i]->name ]->score_average = -1.0;
		$DD[ $dominist[$i]->name ]->rank = 1;
	}

	for ( $i = 0; $i < $GRsize; $i++ ) {
		for ( $k = 0; $k < $GR[$i]->player_num; $k++ ) {
			$DD[ $GR[$i]->player[$k]->name ]->play_num_sum++;
			$DD[ $GR[$i]->player[$k]->name ]->rank_num[ $GR[$i]->player[$k]->rank ]++;
			for ( $l = 1; $l <= $GR[$i]->player_num; $l++ ) {
				$DD[ $GR[$i]->player[$k]->name ]->play_num[$l]++;
			}
			$DD[ $GR[$i]->player[$k]->name ]->score_sum += $GR[$i]->player[$k]->score;
		}
	}
	
	for ( $i = 0; $i < $dominist_num; $i++ ) {
		if ( $DD[ $dominist[$i]->name ]->play_num_sum != 0 ) {  // 0割り防止
			$DD[ $dominist[$i]->name ]->score_average = round( $DD[ $dominist[$i]->name ]->score_sum / $DD[ $dominist[$i]->name ]->play_num_sum, 3 );
		}
	}
	for ( $j = 1; $j < $dominist_num; $j++ ) {
		for ( $i = 0; $i < $j; $i++ ) {
			if ( $DD[ $dominist[$j]->name ]->score_average > $DD[ $dominist[$i]->name ]->score_average ) { $DD[ $dominist[$i]->name ]->rank++; }
			if ( $DD[ $dominist[$j]->name ]->score_average < $DD[ $dominist[$i]->name ]->score_average ) { $DD[ $dominist[$j]->name ]->rank++; }
		}
	}
	
 // $DDをrankで昇順ソート(バブルソート)
	$DD = array_values( $DD );
	
	for ( $j = $dominist_num-1; $j >= 0; $j-- ) {
		for ( $i = 0; $i < $j; $i++ ) {
			if ( $DD[$i + 1]->rank < $DD[$i]->rank ) {
				swap_DD( $DD, $i );
			}
		}
	}
	
	return $DD;
}




function MakeSupplyString( $gr_supply, $Cardlist, $Setlist ) {
	$supply_str = '';
	if ( $gr_supply->Prosperity ) {
		$supply_str .= "【植民地場】 ";
	}
	if ( $gr_supply->DarkAges ) {
		$supply_str .= "【避難所場】 ";
	}
	if ( $gr_supply->kingdomcards[0] > 0 ) { // 記録があるときのみ表示.
		for ( $j = 0; $j < count( $Setlist ); $j++ ) {
			if ( $gr_supply->set[$j] ) {
				$supply_str .= '['.h( $Setlist[$j] )."] ";
				for ( $l = 0; $l < KINGDOMCARD_SIZE; $l++ ) {
					if ( $Cardlist[ $gr_supply->kingdomcards[$l] ]->set_name == $Setlist[$j] ) {
						$supply_str .= $Cardlist[ $gr_supply->kingdomcards[$l] ]->name_jp . ", ";
					}
				}
			}
		}

		if ( $gr_supply->banecard > 0 ) {
			$supply_str .= " [災いカード] ";
			$supply_str .=     $Cardlist[ $gr_supply->banecard ]->name_jp;
			$supply_str .= "(".$Cardlist[ $gr_supply->banecard ]->set_name.")";
		}

		if ( $gr_supply->eventcards[0] > 0 || $gr_supply->eventcards[1] > 0 ) {
			$supply_str .= " [Event] ";
			if ( $gr_supply->eventcards[0] > 0 ) {
				$supply_str .= " ".$Cardlist[ $gr_supply->eventcards[0] ]->name_jp;
			}
			if ( $gr_supply->eventcards[1] > 0 ) {
				$supply_str .= " ".$Cardlist[ $gr_supply->eventcards[1] ]->name_jp;
			}
		}

		if ( $gr_supply->landmark[0] > 0 || $gr_supply->landmark[1] > 0 ) {
			$supply_str .= " [Landmark] ";
			if ( $gr_supply->landmark[0] > 0 ) {
				$supply_str .= " ".$Cardlist[ $gr_supply->landmark[0] ]->name_jp;
			}
			if ( $gr_supply->landmark[1] > 0 ) {
				$supply_str .= " ".$Cardlist[ $gr_supply->landmark[1] ]->name_jp;
			}
		}

		if ( $gr_supply->obelisk > 0 ) {
			$supply_str .= " [Obelisk] ";
			$supply_str .= $Cardlist[ $gr_supply->obelisk ]->name_jp;
		}

		if ( $gr_supply->blackmarket[0] > 0 ) {
			$supply_str_blackmarket = " [闇市場デッキ] \\n";
			for ( $j = 0; $j < count( $Setlist ); $j++ ) {
				if ( $gr_supply->set[$j] ) {
					$supply_str_blackmarket .= '【'.$Setlist[$j]."】\\n";
					for ( $l = 0; $l < BLACKMARKET_SIZE; $l++ ) {
						if ( $Cardlist[ $gr_supply->blackmarket[$l] ]->set_name === $Setlist[$j] ) {
							$supply_str_blackmarket .=
								' - ' . $Cardlist[ $gr_supply->blackmarket[$l] ]->name_jp . "\\n";
						}
					}
				}
			}
			$supply_str .= "<input type='button' class='btn-blue' value='闇市場'";
			$supply_str .= "onclick=\"alert('".$supply_str_blackmarket."')\">";
		}
	}

	return $supply_str;
}


