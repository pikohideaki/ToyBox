<?php


function swap_gr( &$gr, $k ) {
	$tmp = new GameResult();
	$tmp->player[0]     = $gr->player[$k + 1];
	$gr->player[$k + 1] = $gr->player[$k];
	$gr->player[$k]     = $tmp->player[0];
}


// rankによって昇順ソート（順位順で表示するため）
function Rank( $gr ) {
	$player_num = $gr->player_num;
 // 順位付け ( $gr[$i]->rank, $gr[$i]->score )
	for ( $i = 0; $i < $player_num; $i++ ) {
		$gr->player[$i]->rank = 1;  // 初期化
	}
	for ( $j = 1; $j < $player_num; $j++ ) {
		for ( $i = 0; $i < $j; $i++ ) {
			// 自分よりもVPが大きい要素があるごとにrank++. 等しいときは何もしない.
			if ( $gr->player[$j]->VP > $gr->player[$i]->VP ) { $gr->player[$i]->rank++; }
			if ( $gr->player[$j]->VP < $gr->player[$i]->VP ) { $gr->player[$j]->rank++; }
			if ( $gr->player[$j]->VP === $gr->player[$i]->VP ) {
				if ( $gr->player[$j]->turn ) { $gr->player[$i]->rank++; }
				if ( $gr->player[$i]->turn ) { $gr->player[$j]->rank++; }
			}
		}
	}

 // 各順位に与えるpointの計算
 // rankのみ取り出してソート
	$rank = array();
	for ( $i = 0; $i < $player_num; $i++ ) {
		$rank[$i] = $gr->player[$i]->rank;
	}
	sort( $rank );
	$rank[] = $player_num + 1; // 最終要素に大きな数字
 // 人数により得点を以下のように設定
	$SCORE = array();
	$SCORE = SCORE( $player_num );
 // 同着の数をそれぞれ数えて平均を得点としてSCOREに書き込んで更新
	$count = 0;
	$sum = 0.0;
	$k = 1;
	for ( $i = 0; $i < $player_num; $i++ ) {
		if ( $rank[$i + 1] === $rank[$i] ) {
			$count++;
			$sum += $SCORE[$k++];
		} else {
			$count++;
			$sum += $SCORE[$k++];
			$SCORE[ $rank[$i] ] = round( $sum / $count, 3 );  // 同着がいる順位に与えるスコアを更新
			$sum = 0.0;  // リセット 
			$count = 0;  // リセット 
		}
	}

 // SCOREを参照してscoreを与える
	for ( $i = 0; $i < $player_num; $i++ ) {
		$gr->player[$i]->score = $SCORE[ $gr->player[$i]->rank ];
	}

 // バブルソート
	for ( $j = $player_num-1; $j >= 0; $j-- ) {
		for ( $i = 0; $i < $j; $i++ ) {
			if ( $gr->player[$i + 1]->rank < $gr->player[$i]->rank ) { swap_gr( $gr, $i ); }
		}
	}
	return $gr;
}

