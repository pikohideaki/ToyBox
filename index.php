<?php

// 共通ファイル
$Filename_sc = $_SERVER['DOCUMENT_ROOT'] .'/sub_common.php';
if ( !is_readable( $Filename_sc ) ) { echo $Filename_sc . ' is not readable.'; exit; }
include( $Filename_sc );


session_start();
$login = isset( $_SESSION['login_id'] );

?>



<!DOCTYPE html>
<html lang='ja'>

<head>
	<?php PrintHead( 'Toy Box' ); ?>
	<link rel="stylesheet" type="text/css" href="/css/toppage.css">
	<link rel="stylesheet" type="text/css" href="/css/responsive.css">
</head>


<body>
	<header>
		<div class='header-left'>
			<img class='logo' src="/image/450px-DomimionLogo.jpg">
		</div>
		<?php $login_str = ( $login ? 'ログアウト' : 'ログイン' ); ?>
		<a href="#" class='sub-menu-icon'> <span class='fa fa-bars'></span> </a>
		<div class='sub-menu clear'>
			<a href="/Readme.php"> 更新履歴 </a>
			<a href="/Login.php"> <?= $login_str ?> </a>
		</div>
		<div class='header-right'>
			<a href="/Request.php"> ご意見箱 </a>
			<a href="/Readme.php"> 更新履歴 </a>
			<a href="/Login.php"> <?= $login_str ?> </a>
		</div>
	</header>

	<div class='main'>
		<div class='contents-list'>
			<div class='dominion-section'>
				<div class='contents-list-item' id='GameResult_main'>
					<h3><a href='/Dominion/GameResult_main.php'>得点集計表</a></h3>
					<p>
						得点集計表です．<br>
						<?php if ( !$login ) { echo "※編集するにはログインしてください．"; } ?>
					</p>
				</div>
				<div class='contents-list-item' id='Online_room_main'>
					<h3><a href='/Dominion/Online_room_main.php'>ドミニオンオンライン</a></h3>
					<p> ブラウザ上でドミニオンをオンライン対戦できます． </p>
				</div>
				<div class='contents-list-item' id='Players'>
					<h3><a href='/Dominion/Players.php'>プレイヤー管理</a></h3>
					<p>
						プレイヤーの新規追加や編集画面です．<br>
						<?php if ( !$login ) { echo "※編集するにはログインしてください．"; } ?>
					</p>
				</div>
				<div class='contents-list-item' id='Cardlist'>
					<h3><a href='/Dominion/Cardlist.php'>カードリスト</a></h3>
					<p>
						Dominionの全カードリストです．<br>
						（フィルタリング対応）
					</p>
				</div>
				<div class='contents-list-item' id='Rulebooks'>
					<h3><a href='/Dominion/Rulebooks.php'>ルールブック</a></h3>
					<p>
						ルールブックのpdfを置いています．<br>
						ファイルサイズの大きいものもあるので注意してください．
					</p>
				</div>
				<div class='contents-list-item' id='Randomizer'>
					<h3><a href='/Dominion/Randomizer.php' >サプライ自動生成</a></h3>
					<p>
						ランダマイザーのみのページです．<br>
						得点集計を行う場合は<br>
						「得点集計表」→「ゲーム結果を追加」<br>
						を使用してください．<br>
					</p>
				</div>
				<div class='clear'></div>
			</div>


<!-- 			<div class='majan'>
				<h2>麻雀</h2>
				<div class='contents-list-item'>
					<h3><a href='/majan/main.php' >麻雀得点集計表（テスト）</a></h3>
					<p>麻雀得点集計表です．</p>
				</div>
				<div class='clear'></div>
			</div> -->
		</div>
	</div>
	

<!--	<h3><a href='/majan/majan_spreadsheet/main.php' >麻雀得点集計表（作成中）</a></h3>
	<h3>麻雀得点計算機（作成中）</h3>
	-->
</body>



<script type="text/javascript">
$( function() {

	$('.contents-list-item').click( function() {
		const id = $(this).attr('id');
		window.location.href = `/Dominion/${id}.php`;
	} );

} );
</script>


</html>

