console.log('開始！');
setTimeout( function() { console.log('1秒経過') }, 1000 );
console.log('終了！');

開始！
終了！
1秒経過


console.log('開始！');
setTimeout( function() {
	console.log("1秒経過");
	setTimeout( function() {
		console.log('2秒経過');
		setTimeout( function() {
			console.log('3秒経過');
			console.log('終了！');
		}, 1000 );
	}, 1000 );
}, 1000 );


開始！
1秒経過
2秒経過
3秒経過
終了！


$('.buttonA').click( function() {
	console.log('おはよう');
	$('.buttonA').hide();
	$('.buttonB').show();
});

$('.buttonB').click( function() {
	console.log('こんにちは');
	$('.buttonB').hide();
	$('.buttonC').show();
});

$('.buttonC').click( function() {
	console.log('おやすみ');
	$('.buttonC').hide();
});



function* genfunc() {
	yield;  // ボタンAのクリック待ち
	console.log('おはよう');
	$('.Others').hide();
	$('.buttonA').hide();
	$('.buttonB').show();

	yield;  // ボタンBのクリック待ち
	console.log('こんにちは');
	$('.buttonB').hide();
	$('.buttonC').show();

	yield;  // ボタンCのクリック待ち
	console.log('おやすみ');
	$('.buttonC').hide();
	$('.Others').show();
	$('.buttonA').show();  // 最初の状態に戻る
}

let g = genfunc();  // generator 生成

$('.buttonA').click( function() { g.next(); });  // 開始
$('.buttonB').click( function() { g.next(); });  // 次へ
$('.buttonC').click( function() { g.next(); });  // 次へ



