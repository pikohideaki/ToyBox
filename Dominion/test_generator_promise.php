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
		<button class='btn-blue next'>next</button>
		<button class='btn-blue end'>end</button>
		<p class='logs'>
			
		</p>
	</div>
</body>

<script type="text/javascript">

$( function() {

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
