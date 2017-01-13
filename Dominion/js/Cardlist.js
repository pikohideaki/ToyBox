
/* reset */

// 拡張セットなどのオンオフ
function changechbox_set_name( flag ) {
	for ( let s = 0; s < Setlist.length; s++ ) {
		$('input[id=cardlist_set_name_chbox'+s+']').prop("checked",flag);
	}
}


function changechbox_class( flag ) {
	for ( let s = 0; s < class_list.length; s++ ) {
		$('input[id=cardlist_class_chbox'+s+']').prop("checked",flag);
	}
}


function changechbox_category( flag ) {
	for ( let s = 0; s < category_list.length; s++ ) {
		$('input[id=cardlist_category_chbox'+s+']').prop("checked",flag);
	}
}


function changechbox_implemented( flag ) {
	for ( let s = 0; s < implemented_list.length; s++ ) {
		$('input[id=cardlist_implemented_chbox'+s+']').prop("checked",flag);
	}
}



function cardlist_filter() {
	let display_flag_temp = [];

	/* reset */
	for ( let i = 0; i < Cardlist.length; i++ ) {
		Cardlist[i].display_flag = true;
		display_flag_temp[i] = true;
	}

	/* 列同士はANDで結ぶが，
	   各列のcheckboxはどれかがに一致すればtrueのOR条件なので，
	   各列の条件を display_flag_temp で集計して書き戻す */

	let filter_val = {};

	filter_val.card_name = $( '#textfield_card_name' ).val();
	if ( filter_val.card_name !== '' ) {  // 「全て」でないとき
		display_flag_temp.fill(false);
		reg = new RegExp( filter_val.card_name );
		for ( let i = 0; i < Cardlist.length; i++ ) {
			if ( Cardlist[i].name_jp.match(reg) ) {
				display_flag_temp[i] = true;
			}
		}
	}
	for ( let i = 0; i < Cardlist.length; i++ ) {
		if ( display_flag_temp[i] === false ) Cardlist[i].display_flag = false;
	}

	filter_val.card_name_eng = $( '#textfield_card_name_eng' ).val();
	if ( filter_val.card_name_eng !== '' ) {  // 「全て」でないとき
		display_flag_temp.fill(false);
		reg = new RegExp( filter_val.card_name_eng );
		for ( let i = 0; i < Cardlist.length; i++ ) {
			if ( Cardlist[i].name_eng.match(reg) ) {
				display_flag_temp[i] = true;
			}
		}
	}
	for ( let i = 0; i < Cardlist.length; i++ ) {
		if ( display_flag_temp[i] === false ) Cardlist[i].display_flag = false;
	}

	display_flag_temp.fill(false);
	for ( let s = 0; s < Setlist.length; s++ ) {
		if ( $('input[id=cardlist_set_name_chbox'+s+']').prop("checked") ) {
			for ( let i = 0; i < Cardlist.length; i++ ) {
				if ( Cardlist[i].set_name === Setlist[s] ) {
					display_flag_temp[i] = true;
				}
			}
		}
	}
	for ( let i = 0; i < Cardlist.length; i++ ) {
		if ( display_flag_temp[i] === false ) Cardlist[i].display_flag = false;
	}

	display_flag_temp.fill(false);
	for ( let s = 0; s < class_list.length; s++ ) {
		if ( $('input[id=cardlist_class_chbox'+s+']').prop("checked") ) {
			for ( let i = 0; i < Cardlist.length; i++ ) {
				if ( Cardlist[i].class === class_list[s] ) {
					display_flag_temp[i] = true;
				}
			}
		}
	}
	for ( let i = 0; i < Cardlist.length; i++ ) {
		if ( display_flag_temp[i] === false ) Cardlist[i].display_flag = false;
	}

	display_flag_temp.fill(false);
	for ( let s = 0; s < category_list.length; s++ ) {
		if ( $('input[id=cardlist_category_chbox'+s+']').prop("checked") ) {
			reg = new RegExp( category_list[s] );
			for ( let i = 0; i < Cardlist.length; i++ ) {
				if ( Cardlist[i].category.match(reg) ) {
					display_flag_temp[i] = true;
				}
			}
		}
	}
	for ( let i = 0; i < Cardlist.length; i++ ) {
		if ( display_flag_temp[i] === false ) Cardlist[i].display_flag = false;
	}

	display_flag_temp.fill(false);
	for ( let s = 0; s < implemented_list.length; s++ ) {
		if ( $('input[id=cardlist_implemented_chbox'+s+']').prop("checked") ) {
			reg = new RegExp( implemented_list[s] );
			for ( let i = 0; i < Cardlist.length; i++ ) {
				if ( Cardlist[i].implemented.match(reg) ) {
					display_flag_temp[i] = true;
				}
			}
		}
	}
	for ( let i = 0; i < Cardlist.length; i++ ) {
		if ( display_flag_temp[i] === false ) Cardlist[i].display_flag = false;
	}

	cardlist_display();
}



function cardlist_display() {
	$('#tbody_cardlist').html(''); // reset

	let rowsize = 0;
	for ( let i = 1; i < Cardlist.length; i++ ) {
		if ( Cardlist[i].display_flag ) {
			rowsize++;
			$( '#tbody_cardlist' ).append( 
				`<tr>
					<td>${rowsize}</td>
					<td>${i}</td>
					<td>${Cardlist[i].name_jp }</td>
					<td>${Cardlist[i].name_eng}</td>
					<td>${Cardlist[i].set_name}</td>
					<td>${Cardlist[i].cost_str}</td>
					<td>${Cardlist[i].class   }</td>
					<td>${Cardlist[i].category}</td>
					<td class='padding0'>
						<input type='button' class='btn-white card_effect' data-card_no='${i}' value='効果' >
					</td>
					<td>${( Cardlist[i].VP        > 0 ? Cardlist[i].VP        : '-' )}</td>
					<td>${( Cardlist[i].draw_card > 0 ? Cardlist[i].draw_card : '-' )}</td>
					<td>${( Cardlist[i].action    > 0 ? Cardlist[i].action    : '-' )}</td>
					<td>${( Cardlist[i].buy       > 0 ? Cardlist[i].buy       : '-' )}</td>
					<td>${( Cardlist[i].coin      > 0 ? Cardlist[i].coin      : '-' )}</td>
					<td>${( Cardlist[i].VPtoken   > 0 ? Cardlist[i].VPtoken   : '-' )}</td>
					<td>${Cardlist[i].implemented}</td>
				</tr>
				` );

			if ( rowsize % 20 === 0 ) {
				$( '#tbody_cardlist' ).append(
				`<tr>
					<th nowrap></th>
					<th nowrap>Card No.</th>
					<th nowrap>カード名</th>
					<th nowrap>カード名（英語）</th>
					<th nowrap>セット名</th>
					<th nowrap>コスト</th>
					<th nowrap>分類</th>
					<th nowrap>種類</th>
					<th nowrap>効果</th>
					<th nowrap>勝利点</th>
					<th nowrap>+card</th>
					<th nowrap>+action</th>
					<th nowrap>+buy</th>
					<th nowrap>+coin</th>
					<th nowrap>VPtoken</th>
					<th nowrap>オンライン対戦<br>実装状況</th>
				</tr>
				` );
			}
		}
	}
}







$( function() {
	$('.select_all_set'          ).click( () => { changechbox_set_name   (true ); cardlist_filter(); } );
	$('.deselect_all_set'        ).click( () => { changechbox_set_name   (false); cardlist_filter(); } );
	$('.select_all_category'     ).click( () => { changechbox_category   (true ); cardlist_filter(); } );
	$('.deselect_all_category'   ).click( () => { changechbox_category   (false); cardlist_filter(); } );
	$('.select_all_class'        ).click( () => { changechbox_class      (true ); cardlist_filter(); } );
	$('.deselect_all_class'      ).click( () => { changechbox_class      (false); cardlist_filter(); } );
	$('.select_all_implemented'  ).click( () => { changechbox_implemented(true ); cardlist_filter(); } );
	$('.deselect_all_implemented').click( () => { changechbox_implemented(false); cardlist_filter(); } );

	$('.filtering').click( cardlist_filter );

	$('#textfield_card_name,#textfield_card_name_eng').change( cardlist_filter );



	// CardEffectBox

	$('#tbody_cardlist').on( 'click', '.card_effect', function() {
		const card_no = $(this).attr('data-card_no');
		ShowCardEffectBox( Cardlist, card_no );
	});

} );

