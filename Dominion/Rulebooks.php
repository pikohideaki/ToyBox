<?php


// 共通ファイル
$Filename_sc  = $_SERVER['DOCUMENT_ROOT'] .'/sub_common.php';
if ( !is_readable( $Filename_sc  ) ) { echo $Filename_sc  . ' is not readable.'; exit; }
include( $Filename_sc );

$Filename_sDc = $_SERVER['DOCUMENT_ROOT'] .'/Dominion/sub_Dominion_common.php';
if ( !is_readable( $Filename_sDc ) ) { echo $Filename_sDc . ' is not readable.'; exit; }
include( $Filename_sDc );


session_start();
$login = isset( $_SESSION['login_id'] );  // ログイン済みならtrue


////////////////////////////////////////////////////////////////////////////////



$len = 11;
$rulebook_url = array();
$rulebook_url[ 1] = "./rulebooks/Dominion_gameRules_01_Original.pdf"   ;
$rulebook_url[ 2] = "./rulebooks/Dominion_gameRules_02_Intrigue.pdf"   ;
$rulebook_url[ 3] = "./rulebooks/Dominion_gameRules_03_Seaside.pdf"    ;
$rulebook_url[ 4] = "./rulebooks/Dominion_gameRules_04_Alchemy.pdf"    ;
$rulebook_url[ 5] = "./rulebooks/Dominion_gameRules_05_Prosperity.pdf" ;
$rulebook_url[ 6] = "./rulebooks/Dominion_gameRules_06_Cornucopia.pdf" ;
$rulebook_url[ 7] = "./rulebooks/Dominion_gameRules_07_Hinterlands.pdf";
$rulebook_url[ 8] = "./rulebooks/Dominion_gameRules_08_Dark_Ages.pdf"  ;
$rulebook_url[ 9] = "./rulebooks/Dominion_gameRules_09_Guilds.pdf"     ;
$rulebook_url[10] = "./rulebooks/Dominion_gameRules_10_Adventures.pdf" ;
$rulebook_url[11] = "./rulebooks/Dominion_gameRules_11_Empires.pdf"    ;

$rulebook_name[ 1] = "「基本」";
$rulebook_name[ 2] = "「陰謀」";
$rulebook_name[ 3] = "「海辺」";
$rulebook_name[ 4] = "「錬金術」";
$rulebook_name[ 5] = "「繁栄」";
$rulebook_name[ 6] = "「収穫祭」";
$rulebook_name[ 7] = "「異郷」";
$rulebook_name[ 8] = "「暗黒時代」";
$rulebook_name[ 9] = "「ギルド」";
$rulebook_name[10] = "「冒険」";
$rulebook_name[11] = "「帝国」";


$cover_img_name[ 1] = "./image/cover/01_Dominion_Cover@2x.png"    ;
$cover_img_name[ 2] = "./image/cover/02_Intrigue_Cover@2x.png"    ;
$cover_img_name[ 3] = "./image/cover/03_Seaside_Cover@2x.png"     ;
$cover_img_name[ 4] = "./image/cover/04_Alchemy_Cover@2x.png"     ;
$cover_img_name[ 5] = "./image/cover/05_Prosperity_Cover@2x.png"  ;
$cover_img_name[ 6] = "./image/cover/06_Cornucopia_Cover@2x.png"  ;
$cover_img_name[ 7] = "./image/cover/07_Hinterlands_Cover@2x.png" ;
$cover_img_name[ 8] = "./image/cover/08_Dark_Ages_Cover@2x.png"   ;
$cover_img_name[ 9] = "./image/cover/09_Guilds_Cover@2x.png"      ;
$cover_img_name[10] = "./image/cover/10_Adventures_Cover@2x.png"  ;
$cover_img_name[11] = "./image/cover/11_Empires_Cover@2x.png"     ;




function myfilesize( $path, $precision = 2 ) {
	$bytes = sprintf('%u', filesize($path));

	if ($bytes > 0) {
		$unit = intval(log($bytes, 1024));
		$units = array('B', 'KB', 'MB', 'GB');

		if (array_key_exists($unit, $units) ) {
			return sprintf('%.' . $precision . 'f %s', $bytes / pow(1024, $unit), $units[$unit]);
		}
	}

	return $bytes;
}


$filesize = array();
for ( $i = 1; $i <= $len; $i++ ) {
	$filesize[$i] = myfilesize( $rulebook_url[$i], 2 );
}


?>



<!DOCTYPE html>
<html lang='ja'>

<head>
	<?php
		PrintHead( 'ルールブック' );
		PrintHead_Dominion();
	?>
	<link rel="stylesheet" type="text/css" href="/Dominion/css/Rulebooks.css">
</head>


<body>
	<header>
		<?= PrintHome(); ?>
	</header>


	<div class='main'>
		<h2>ルールブック(pdf)</h2>
		<?php
		for ( $i = 1; $i <= $len; $i++ ) {
echo <<<EOM
			<a class='rulebook-box' href="$rulebook_url[$i]" target='_blank'>
				<img src='$cover_img_name[$i]'
					alt='$rulebook_url[$i]'
					class='rulebook-cover' ><br>
				$rulebook_name[$i] ($filesize[$i])
			</a>
EOM;
		}
		?>
	</div>

</body>
</html>
