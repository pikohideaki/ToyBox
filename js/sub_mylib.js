

function myrand( left, right ){
	return left + Math.floor( Math.random() * ( right - left + 1 ) );
}


function RandInt( Min, Max ) {
	return Min + Math.floor( Math.random() * ( Max - Min + 1 ) );
}


// let ar = [3,6,7,9,1,2,4,5];
// console.log( NotUsedNumber([], 2) ); -> 8
function NotUsedNumber( NumberArray, start_number ) {
	let ArraySorted = NumberArray.sort();
	while ( ArraySorted[0] < start_number ) ArraySorted.shift();
	if ( ArraySorted.length === 0 ) return start_number;
	for ( let i = 0; i < ArraySorted.length; ++i ) {
		if ( Number( ArraySorted[i] ) !== start_number + i ) return start_number + i;
	}
	return start_number + ArraySorted.length;
}



function myprint( obj ){
	console.log( obj );
}

Array.prototype.filterRemove = function(f) {
	let others = this.filter( (e) => !f(e) );
	return [ this.filter(f), others ];
};

Array.prototype.copyfrom = function( array ) {
	for ( let i = 0; i < array.length; i++ ) this[i] = array[i]; /* rewrite */
}


Array.prototype.shuffle = function() {
	let array = this.map( (a) => [a, Math.random()] )
				.sort( (a, b) => a[1] - b[1] )
				.map( (a) => a[0] );
	this.copyfrom(array);
	return this;
}


function Permutation(n) { 
	let ar = new Array(n);
	for ( let i = 0; i < n; ++i ) { ar[i] = i; }
	return ar.shuffle();
}


Array.prototype.remove = function( index ) {
	return this.splice( index, 1 );
};

Array.prototype.val_exists = function( val ) {
	for ( let i = 0; i < this.length; ++i ) {
		if ( this[i] === val ) return true;
	}
	return false;
};

Array.prototype.remove_val = function( val ) {
	let ar = this.filter( function( element ) {
		return element != val;
	});
	this.length = 0;
	this.copyfrom(ar);
	return this;
};
	// let ar = [1,2,3];
	// ar.remove_val(2);
	// console.log( ar );
	// ar = [1,2,3];
	// ar.remove_val(2).push(4);
	// console.log( ar );


Array.prototype.back = function() {
	return this[ this.length - 1 ];
};



Array.prototype.uniq = function( f = ( (a) => a ) ) {  // 要素の値を定義する関数（この値の同値性でuniqをかける
	return this.map( (a) => [ f(a), a ] )
			.sort()
			.filter( (val, index, array) => array.map( a => a[0] ).indexOf( val[0] ) === index )
			.map( a => a[1] );
};

Array.prototype.sortNumeric = function() {
	return this.sort( (a,b) => ( parseFloat(a) - parseFloat(b) ) );
};


function MakeTableRowString( array ) {
	let str = '';
	str += '<tr> ';
	for ( let i = 0; i < array.length; i++ ) {
		str += '<td>' + array[i] + '</td> ';
	}
	str +="</tr>\n";
	return str;
}





/* class */
// function class_test() {
// 	this.x = 10;
// 	this.y = 20;
// 	this.ar = [];
// 	for ( let i = 0; i < 5; i++ ) {
// 		this.ar[i] = 2 * i;
// 	}
// }
//
// class_test.prototype.do = function() {
// 	alert( "test!!" );
// }
//
// let cl1 = new class_test();
// let cl2 = new class_test();
// cl2.x = 30;
// console.log( cl1, cl2 );
// cl1.do();


// box-sizing : border-box を仮定（paddingはwidthやheightに含まれる）
class SizeOfjQueryObj {
	constructor( $obj ) {
		this.width   = parseFloat( $obj.css('width' ) );
		this.height  = parseFloat( $obj.css('height') );
		this.padding = {};
		this.margin  = {};
		this.padding.top    = parseFloat( $obj.css('padding-top'   ) );
		this.padding.right  = parseFloat( $obj.css('padding-right' ) );
		this.padding.bottom = parseFloat( $obj.css('padding-bottom') );
		this.padding.left   = parseFloat( $obj.css('padding-left'  ) );
		this.margin.top     = parseFloat( $obj.css('margin-top'    ) );
		this.margin.right   = parseFloat( $obj.css('margin-right'  ) );
		this.margin.bottom  = parseFloat( $obj.css('margin-bottom' ) );
		this.margin.left    = parseFloat( $obj.css('margin-left'   ) );
		this.border_radius  = parseFloat( $obj.css('border-radius' ) );
	}

	width_with_margin() {
		return this.width + this.margin.right + this.margin.left;
	}

	height_with_margin() {
		return this.height + this.margin.top + this.margin.bottom;
	}

	width_without_padding() {
		return this.width - this.padding.right - this.padding.left;
	}

	height_without_padding() {
		return this.height - this.padding.top - this.padding.bottom;
	}
}




// yield の右に書いた文が nextの評価値になる
// promise が resolve したら next したい
// promise が渡されないyield文は許可しない
//  - MyAsyncからMyAsyncを呼びたいときに困る．
//  - ボタン操作待ちなどはPromise化してresolveをボタン操作から実行するように

function MyAsync( GenFunc, ...Args ) {

	function MyAsync_sub( g, passed_value ) {
		let n = g.next(passed_value);
		if ( n.done ) {
			return Promise.resolve(passed_value);
		} else if ( n.value instanceof Promise ) {
			return n.value.then( (val) => MyAsync_sub( g, val ) );
		} else {
			throw new Error('Promise or Generator constructor should be passed to MyAsync');
		}
	}

	let gfn = GenFunc( ...Args );
	let m = gfn.next();  // start gfn
	if ( m.done ) {
		return Promise.resolve();
	} else if ( m.value instanceof Promise ) {
		return m.value.then( (val) => MyAsync_sub( gfn, val ) );
	} else {
		throw new Error('Promise or Generator constructor should be passed to MyAsync');
	}
}



/*
	<div class='BlackCover MyAlert'>
		<div class='MyAlert-box'>
			<div class='clear alert_text'></div>
			<div class='clear alert_contents'></div>
			<div class='clear buttons'> <input type='button' class='btn-blue' value='OK'> </div>
			<div class='clear'></div>
		</div>
	</div>

	<div class='BlackCover MyConfirm'>
		<div class='MyConfirm-box'>
			<div class='clear confirm_text'></div>
			<div class='clear confirm_contents'></div>
			<div class='clear buttons'>
				<input type='button' class='btn-blue yes' value='はい'>
				<input type='button' class='btn-blue no' value='いいえ'>
			</div>
			<div class='clear'></div>
		</div>
	</div>
*/
function MyAlert( options ) {
	return new Promise( function( resolve, reject ) {
		$('.alert_text').html( options.message );
		$('.alert_contents').html( options.contents );
		$('.MyAlert').fadeIn( 'normal' );

		$('.MyAlert .buttons input[type=button]').click( function() {
			$('.MyAlert').fadeOut( 'normal', resolve );
		} );
	});
}

function MyConfirm( options ) {
	return new Promise( function( resolve, reject ) {
		$('.confirm_text').html( options.message );
		$('.confirm_contents').html( options.contents );
		$('.MyConfirm').fadeIn( 'normal' );

		$('.MyConfirm .buttons input[type=button]').click( function() {
			$('.MyConfirm').fadeOut( 'normal', () => resolve( $(this).hasClass('yes') ) );
			// $('.MyConfirm').fadeOut();
			// resolve( $(this).hasClass('yes') );
		} );
	});
}





// http://www.programming-magic.com/file/20080205232140/keycode_table.html
// $( function() {
// 	$(document).keydown( function(e) {
		// if ( e.keyCode == 27 ) {  // ESC 入力
		// 	$('.MyAlert').fadeOut();
		// }
		// if ( e.keyCode == 13 ) {  // ESC 入力
		// 	$('.MyAlert').fadeOut();
		// }
// 	});
// });


