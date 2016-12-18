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

	function MyAsync( genfunc ) {
		let n = genfunc.next();
		if ( n.done ) {
			console.log('(done)');
			return Promise.resolve();
		}
		// if n is undone
		else if ( n.value instanceof Promise ) {
			console.log('(pro)');
			return n.value.then( () => MyAsync( genfunc ) );
		}
		else if ( n.value instanceof (function*(){}).constructor ) {
			console.log('(gen)');
			return MyAsync( n.value() ).then( () => MyAsync( genfunc ) );
		}
		else {
			console.log('(else)');
		}
		// else return MyAsync( genfunc );
	}


	function* genfunc() {
		console.log('genfunc started');
		yield sleep(1); console.log('a');
		yield sleep(1); console.log('b');
		yield 'wait for button';
		console.log('button clicked!');
		yield sleep(1); console.log('c');
		console.log( 'genfunc end' );
	}

	let g = genfunc();


	function* genfunc2() {
		console.log('genfunc2 started');
		yield sleep(1); console.log('A');
		yield sleep(1); console.log('B');
		yield genfunc;//MyAsync(g)
		yield sleep(1); console.log('C');
		console.log( 'genfunc2 end' );
	}

	let h = genfunc2();


	$('.next').click( () => h.next() );

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



// console.log( genfunc2 instanceof (function*(){}).constructor );


	// $('.next').click( () => g.next() );
	// $('.next').click( () => console.log( g.next().value ) );
	$('.start').click( () => MyAsync(h) );
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
