<?php


// 共通ファイル
$Filename_sc  = $_SERVER['DOCUMENT_ROOT'] .'/sub_common.php';
if ( !is_readable( $Filename_sc  ) ) { echo $Filename_sc  . ' is not readable.'; exit; }
include( $Filename_sc );

$Filename_sDc = $_SERVER['DOCUMENT_ROOT'] .'/Dominion/sub_Dominion_common.php';
if ( !is_readable( $Filename_sDc ) ) { echo $Filename_sDc . ' is not readable.'; exit; }
include( $Filename_sDc );


////////////////////////////////////////////////////////////////////////////////


?>



<!DOCTYPE html>
<html lang='ja'>

<head>
	<?php
		PrintHead( 'Dominion Online' );
		PrintHead_Dominion();
	?>
</head>


<body>
	<header>
		<?= PrintHome(); ?>
	</header>

	<div class='main'>
		<button class='btn-blue start'>start</button>
		<button class='btn-blue next'>next</button>
		<button class='btn-blue end'>end</button>
		<p class='logs'>
			
		</p>
	</div>
</body>

<script type="text/javascript">

$( function() {

	// function AsyncAwait( genfunc ) {
	// 	// yield の右に書いた文が nextの評価値になる
	// 	genfunc.next();  // start
	// 	// promise が resolve したら next したい
	// 	let p = Promise.resolve();
	// 	genfunc.next().value.resolve(); // promise
	// }

	// let r;

	function sleep(sec) {
		return new Promise( function( resolve, reject ) {
			setTimeout( resolve, sec * 1000 );
		} );
	}

	function* genfunc() {
		console.log('started')
		let n = 0;
		yield sleep(1);
		console.log(++n)
		yield sleep(1);
		console.log(++n)
		yield sleep(1);
		console.log(++n)
		yield 'wait for button';
		console.log('button clicked!');
		yield sleep(1);
		console.log(++n)
		yield sleep(1);
		console.log(++n)
	}

	let g = genfunc();
	let h = genfunc();

	function MyAsync( genfunc ) {
		let n = genfunc.next();
		if ( n.done ) return Promise.resolve();
		if ( n.value instanceof Promise ) return n.value.then( () => MyAsync( genfunc ) );  // if n is undone
		// else return MyAsync( genfunc );
	}

	$('.next').click( () => MyAsync(g) );

	// function MyAsync(g) {
	// 	Promise.resolve()
	// 	.then( () => g.next().value )
	// 	.then( () => g.next().value )
	// 	.then( () => g.next().value )
	// 	.then( () => g.next().value )
	// 	.then( () => g.next().value )
	// 	.then( () => g.next().value )
	// }
	{ // main
		// MyAsync(g);
	}

	// $('.next').click( () => g.next() );
	// $('.next').click( () => console.log( g.next().value ) );
	$('.start').click( () => MyAsync(g) );
	// $('.start').click( () => MyAsync(g).then( () => MyAsync(h) ) );
		// () => Promise.resolve()
		// .then( () => g.next().value )
		// .then( () => g.next().value )
		// .then( () => g.next().value )
		// .then( () => g.next().value )
		// .then( () => g.next().value )
		// .then( () => g.next().value )
	// $('.resolve').click(r);

	// function sleep2( sec ) {
	// 	return new Promise( function( resolve, reject ) {
	// 		setTimeout( resolve, 1000 * sec );
	// 	});
	// }

	// Promise.resolve()
	// .then( () => sleep2(3) )
	// .then( () => console.log('after 3sec') )
	// .then( () => sleep2(2) )
	// .then( () => console.log('after 5sec') )


	// async function asynctest() {
	// 	console.log('start');
	// 	await setTimeout( () => console.log('a'), 1000 );
	// 	await setTimeout( () => console.log('b'), 1000 );
	// 	await setTimeout( () => console.log('c'), 1000 );
	// 	yield;
	// 	console.log('d');
	// 	await setTimeout( () => console.log('e'), 1000 );
	// }

	// $('.next').click( () => asynctest.next() );
	// $('.end' ).click( () => asynctest.return() );

	// asynctest();




	// let gen;

	// function* gfn( resolve, str ) {
	// 	$('.logs').append( 'ジェネレーター 開始！<br>' );
	// 	for ( let i = 1; i <= 10; ++i ) {
	// 		yield; /* ボタン操作待ち */
	// 		$('.logs').append( `click ${i}回目<br>` );
	// 	}
	// 	resolve( str );  /* 渡されたresolveを実行しpromisedgenを解決 */
	// }

	// function promisedgen(str) {
	// 	return new Promise( function(resolve) {
	// 		gen = gfn( resolve, str );  /* resolveを渡しておく */
	// 		gen.next();  /* generator生成 */
	// 	});
	// }

	// function log(str) {
	// 	$('.logs').append( `${str}<br>` );  /* 解決したらstrが表示される */
	// 	return Promise.resolve(str);
	// }

	// $('.next').click( () => gen.next() );
	// $('.end').click( () => gen.return() );

	// promisedgen('ジェネレーター 終了!').then(log);
});
</script>
</html>
