<?php


// 共通ファイル
$Filename_sc  = $_SERVER['DOCUMENT_ROOT'] .'/sub_common.php';
if ( !is_readable( $Filename_sc  ) ) { echo $Filename_sc  . ' is not readable.'; exit; }
include( $Filename_sc );

$Filename_sDc = $_SERVER['DOCUMENT_ROOT'] .'/Dominion/sub_Dominion_common.php';
if ( !is_readable( $Filename_sDc ) ) { echo $Filename_sDc . ' is not readable.'; exit; }
include( $Filename_sDc );


// session_start();
// $login = isset( $_SESSION['login_id'] );  // ログイン済みならtrue


////////////////////////////////////////////////////////////////////////////////


?>



<!DOCTYPE html>
<html lang='ja'>

<head>
	<?php
		PrintHead( 'Dominion Online' );
		PrintHead_Dominion();
	?>
	<!-- <link rel="stylesheet" type="text/css" href="/Dominion/css/Online_game_main.css"> -->
</head>


<body>
	<header>
		<?= PrintHome(); ?>
	</header>

	<div class='main'>
		<!-- <p>generator test</p> -->
		<!-- <button class='btn-blue generator_test next' >++</button> -->
		<!-- <button class='btn-blue generator_test end'>end</button> -->
		<!-- <button class='btn-blue next'>next</button> -->
		<!-- <button class='btn-blue myconfirm_opener' >MyConfirmTest</button> -->
		<!-- <p id='reply'></p> -->
	</div>
</body>

<script type="text/javascript">

$( function() {

	// function* gfn(){
	// 	let end = false;
	// 	for ( let i = 0; i < 10; ++i ) {
	// 		end = yield i;
	// 		if ( end ) return;
	// 	}
	// }

	// let g = gfn(); // ジェネレータを作った

	// $('.generator_test').click( function() {
	// 	if ( $(this).hasClass('end') ) {
	// 		console.log( g.next(true) );
	// 	} else {
	// 		console.log( g.next(false) );
	// 	}
	// });


// 'use strict'

// //無理やり順次処理
// function* hell(n) {
//   console.log(n);
//   const x = yield setTimeout(() => gen.next(n * n), 1000);
//   console.log(x);
//   const y = yield setTimeout(() => gen.next(x * x), 1000);
//   console.log(y);
//   const z = yield setTimeout(() => gen.next(y * y * y), 1000);
//   console.log(z);
// }

// const gen = hell(2);

// console.log('どう動くかな');
// gen.next();


// Promise.resolve(123).then( console.log );



// function delay(s) {
// 	return new Promise(function (resolve) {
// 		setTimeout( function() { console.log(s+'秒経過した'); resolve(s) }, s*1000, s)
// 	})
// }

// function log(s) {
// 	console.log(s+'秒経過した')
// 	return Promise.resolve(s);
// }

// const sec = 1;
// delay(sec).then(delay).then(delay);



// function delay(s) {
// 	return new Promise(function (resolve) {
// 		setTimeout( function() { console.log(s+'秒経過した'); resolve(s) }, s*1000, s)
// 		// setTimeout( resolve, s*1000, s)
// 	})
// 	// var p = new Promise(function (resolve) {
// 	//     setTimeout(resolve, s*1000, s)
// 	// })
// 	// return p  // 「s秒後に数値sをもって解決するpromise」を返す
// }

// function log(s) {
// 	console.log(s+'秒経過した')
// 	// return s  // 「数値sをもって解決されたpromise」にキャストされる
// 	return Promise.resolve(s);
// 	// return new Promise( function( resolve ) { resolve(s); });
// }

// const sec = 1;
// delay(sec).then(delay).then(delay);
// delay(sec).then(log).then(delay).then(log).then(delay).then(log)
  // sec秒間隔で3回ログが出る

// function A() {
// 	return new Promise( function( resolve, reject ) {
// 		setTimeout( resolve, 3000 );
// 	} );
// }

// A().then(alert)

// let prms = new Promise( function(resolve) {
// 		setTimeout( resolve, 5000, 5)
// });

// function delay5() {
// 	return prms;
// }


// delay5().then(log);


// $('.end').click( function() {
// 	delay5.resolve('x');
// } );

{
	// let gen;

	// function* gfn( resolve, str ) {
	// 	console.log( 'generated' );
	// 	yield; /* ボタン操作待ち */
	// 	console.log( 'click 1回目' );
	// 	yield; /* ボタン操作待ち */
	// 	console.log( 'click 2回目' );
	// 	yield; /* ボタン操作待ち */
	// 	console.log( 'click 3回目' );
	// 	resolve( str );  /* 渡されたresolveを解決，promisedgenを解決 */
	// }

	// function promisedgen(str) {
	// 	return new Promise( function(resolve) {
	// 		gen = gfn( resolve, str );  /* resolveを渡しておく */
	// 		gen.next();  /* generator生成 */
	// 	});
	// }

	// function log(str) {
	// 	console.log( str );  /* 解決したらstrが表示される */
	// 	return Promise.resolve(str);
	// }

	// $('.next').click( () => gen.next() );

	// promisedgen('done!').then(log);
}


{
	$main = $('.main');
	function EditDom() {
		console.log('dom append start');
		for ( let i = 0; i < 100000; ++i ) {
			$main.append(`<p>${i}aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</p>`)
		}
		console.log('dom append done');
	}

	console.log('start');
	EditDom();
	console.log('end');
	$main.append('<p>last element</p>');
}
// setTimeout( function() {
// 	setTimeout( function() {
// 		setTimeout( function() {
// 			console.log(1);
// 		}, 1000 )
// 		console.log(2);
// 	}, 1000)
// 	console.log(3);
// }, 1000);


// function wait(n) {
// 	let p = new Promise( function( resolve, reject ) {

// 	} );
// 	return p.promise();
// }




	// $.when(
	// 	setTimeout( function(){ console.log(1); }, 1000 )
	// ).done( function() {
	// 	console.log(2);
	// });

// function p(str) {
//   return new Promise(function(resolve) {
//     setTimeout(function() {
//       resolve(str);
//     }, 1000);
//   });
// }

// var co = require('co');
// co(function *() {
//   var res1 = yield p('Async 1');
//   console.log(res1);

//   var res2 = yield p('Async 2');
//   console.log(res2);

//   var res3 = yield p('Async 3');
//   console.log(res3);
// });

// console.log('Sync 1');

/**
 * 1秒後にHello!を出力するDeferred対応関数。必ずresolveする
 *
 * @returns Promise
 */
//  let n = 0;
// function delayHello() {
// 	var d = new $.Deferred;
// 	setTimeout( function(){
// 		console.log(n++);
// 		d.resolve();
// 	}, 1000);
// 	return d.promise();
// }

// delayHello()
// .then(delayHello)
// .then(delayHello)
// .then(delayHello)
// .then(delayHello);
//一秒おきに'Hello!'が出力される

	// console.log( g.next() ); // { value: 11, done: false }
	// // n++; が実行された後、yield n; によって n の値が返された。

	// console.log( g.next() ); // { value: 22, done: false }
	// // n *= 2; が実行された後、yield n; によって n の値が返された。

	// console.log( g.next() ); // { value: 0, done: false }
	// // n = 0; が実行された後、yield n; によって n の値が返された。

	// console.log( g.next() ); // { value: undefined, done: true }
	// // 関数の実行が終了したので、.done が true になった。

	// function* generator() {
	//   console.log(0);
	//   yield;
	//   console.log(1);
	//   yield;
	//   console.log(2);
	// }

	// //呼び出し方法
	// var g = generator();
	// g.next(); //0が出力
	// g.next(); //1が出力
	// g.next(); //2が出力、StopIteration例外が発生


// 	$('.myconfirm').dialog({
// 		modal : true,
// 		autoOpen : false,
// 		show : {
// 			effect : 'fadeIn',
// 			duration : 300,
// 		},
// 		hide : {
// 			effect : 'fadeOut',
// 			duration : 300,
// 		},
// 		buttons : {
// 			"はい": function(event) {
// 				$('#myconfirm_val').html( $(event.target).text() );
// 				$(this).dialog("close");
// 				// return true;
// 			},
// 			"いいえ": function(event) {
// 				$('#myconfirm_val').html( $(event.target).text() );
// 				$(this).dialog("close");
// 				// return false;
// 			},
// 		},
// 	});



	// function MyConfirm( question ) {
	// 	$('body').append(`<div class='myconfirm' title="${question}"></div>`);
	// 	let MyConfirmReturnValue;

	// 	$('.myconfirm').dialog({
	// 		modal : true,
	// 		autoOpen : false,
	// 		show : {
	// 			effect : 'fadeIn',
	// 			duration : 300,
	// 		},
	// 		hide : {
	// 			effect : 'fadeOut',
	// 			duration : 300,
	// 		},
	// 		buttons : {
	// 			"はい": function(event) {
	// 				MyConfirmReturnValue = true;
	// 				$(this).dialog("close");
	// 			},
	// 			"いいえ": function(event) {
	// 				MyConfirmReturnValue = false;
	// 				$(this).dialog("close");
	// 			},
	// 		},
	// 	});

	// 	// $('.myconfirm').dialog("open");
	// 	return MyConfirmReturnValue;
	// }



	// $('.myconfirm_opener').click( function() {
	// 	if ( MyConfirm('進捗どうですか？') ) {
	// 		$('#reply').html('進捗だめです！');
	// 	} else {
	// 		$('#reply').html('進捗全然だめです！！！');
	// 	}
	// });


});
</script>
</html>
