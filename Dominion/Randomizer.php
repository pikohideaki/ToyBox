<?php


// 共通ファイル
$Filename_sc  = $_SERVER['DOCUMENT_ROOT'] .'/sub_common.php';
if ( !is_readable( $Filename_sc  ) ) { echo $Filename_sc  . ' is not readable.'; exit; }
include( $Filename_sc );

$Filename_sDc = $_SERVER['DOCUMENT_ROOT'] .'/Dominion/sub_Dominion_common.php';
if ( !is_readable( $Filename_sDc ) ) { echo $Filename_sDc . ' is not readable.'; exit; }
include( $Filename_sDc );

$Filename_sR = $_SERVER['DOCUMENT_ROOT'] .'/Dominion/sub_Randomizer.php';
if ( !is_readable( $Filename_sR ) ) { echo $Filename_sR . ' is not readable.'; exit; }
include( $Filename_sR );


session_start();
$login = isset( $_SESSION['login_id'] );  // ログイン済みならtrue


////////////////////////////////////////////////////////////////////////////////



?>



<!DOCTYPE html>
<html lang='ja'>

<head>
	<?php
		PrintHead( 'サプライ自動生成' );
		PrintHead_Dominion();
	?>
	<style type="text/css">
		.space {
			height : 400px;
		}
	</style>
</head>

<body>
	<header>
		<?= PrintHome(); ?>
	</header>


	<div class='main'>
		<form name='form_add_game'>
			<?php PrintRandomizer( $Setlist );?>
			<p>
				ここで生成したサプライを得点集計表のゲーム結果追加に使いたくなったときは
				「サプライを一時保存」をした後，得点集計表のゲーム結果追加ページで「サプライを復元」とするとコピーできます．
			</p>
			<div id='div_supply'></div>
			<div id='div_blackmarket'></div>
		</form>

		<div class='space'> </div>
	</div>
</body>

<!-- globaly define Cardlist, Setlist in javascript -->
<?php PHP2JS_Cardlist_Setlist( $Cardlist, $Setlist ); ?>

<script type="text/javascript">
	var supply = {};
	initsupply( supply, Cardlist.length );

	$( function() {
		$('#div_supply,#div_blackmarket').on( 'click', '.card_effect', function() {
			const card_no = $(this).attr('data-card_no');
			const Card = Cardlist[card_no];
			const str = ''
				+ `【分類】${Card.class}\n`
				+ `【種類】${Card.category}\n\n`
				+ `${Card.effect1}\n\n`
				+ `${Card.effect2}\n\n`
				+ `${Card.effect3}\n\n`
				+ `${Card.effect4}\n\n`;
			alert(str);
		});
	});
</script>
<script src='/Dominion/js/GameResult_AddGame.js'></script>
<script src='/Dominion/js/Randomizer.js'></script>
<script src='/Dominion/js/GenSupply.js'></script>
</html>

