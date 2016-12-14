function select_start_player(){
	var tObj = document.getElementById('table_game_result');
	var rowsize_start_player = tObj.rows.length - 1;  // 先頭行を省いた行数
	if( rowsize_start_player <= 1 || 7 <= rowsize_start_player ){
		alert( 'プレイヤーを2～6人選択してください.');
	} else {
		var rnd = Math.floor( rowsize_start_player * Math.random() );  // 0〜(行数 - 1)の乱数
		document.form_add_game.elements['start_player'][rnd].checked = true;
	}
}


function player_num_check(){
	var tObj = document.getElementById('table_body_game_result');
	var rowsize_start_player = tObj.rows.length;  // 先頭行を省いた行数
	if( rowsize_start_player <= 1 || 7 <= rowsize_start_player ){
		alert( 'プレイヤーを2～6人選択してください.');
		return false;
	} else {
		return true;
	}
}



 // ゲーム結果の行を追加or削除
function edit_table_row( k ){
	var chboxObj = document.getElementById('player_name_chbox' + k);
	var tObj = document.getElementById('table_game_result');
	
	var rowlength = tObj.rows.length;
	if( rowlength <= 0 ){  // 初めて行を追加するとき
		var thead = tObj.createTHead();
		var rowh = thead.insertRow(0)
		var th0 = document.createElement( 'th' );
		rowh.appendChild( th0 );
		var th1 = document.createElement( 'th' );
		rowh.appendChild( th1 );
		var th2 = document.createElement( 'th' );
		rowh.appendChild( th2 );
		var th3 = document.createElement( 'th' );
		rowh.appendChild( th3 );

		th0.innerHTML = 'プレイヤー';
		th1.innerHTML = '得点';
		th2.innerHTML = '同点<br>手番勝ち';
		th3.innerHTML = "<input type='button' class='btn-blue' value='最初のプレイヤー' onclick='select_start_player()'>";
	}

	if( chboxObj.checked ){  // チェックをつけたとき
		var tbody = document.getElementById('table_body_game_result');
		var row = tbody.insertRow();

		row.insertCell(0);
		row.cells[0].innerHTML = dominist_name[k];

		row.insertCell(1);
		var str_tmp1 = "<input type='number' class='text' name='D" + k + "-VP' placeholder='0' style='width:50px' autocomplete='off' >"
		row.cells[1].innerHTML = str_tmp1;

		row.insertCell(2);
		var str_tmp2 = ''
			+ "<input type='checkbox' id='D" + k + "-turn' name='D" + k + "-turn' value='true' >"
			+ "<label for='D" + k + "-turn' class='checkbox checkbox0' ></label>";
		row.cells[2].innerHTML = str_tmp2;
		
		row.insertCell(3);
		var str_tmp3 = ''
			+ "<input type='radio' id='start_player_D" + k + "' name='start_player' value='D" + k + "' >"
			+ "<label for='start_player_D" + k + "' class='radio radio0' ></label>";
		row.cells[3].innerHTML = str_tmp3;
	} else {  // チェックを外したとき
		for( var n in tObj.rows ){
			if( tObj.rows[n].cells[0].innerHTML === dominist_name[k] ){
				tObj.deleteRow(n);
				break;
			}
		}
		if( tObj.rows.length <= 1 ){  // 0行になるとき
			tObj.deleteTHead();
		}
	}
}

