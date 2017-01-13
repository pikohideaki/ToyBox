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


$selectlist;
$selectlist->set_name = $Setlist;
$selectlist->class    = array();
$selectlist->category = array();
$selectlist->implemented = array();
{
	$class_temparr;
	$category_temparr;
	$implemented_temparr;
	for ( $i = 1; $i < count( $Cardlist ); $i++ ) {
		$class_temparr[]    = $Cardlist[$i]->class;
		$category_temparr[] = $Cardlist[$i]->category;
		$implemented_temparr[] = $Cardlist[$i]->implemented;
	}
	$selectlist->class = array_unique( $class_temparr );

	$category_temparr = array_unique( $category_temparr );
	sort( $category_temparr );
	for ( $i = 0; $i < count( $category_temparr ); $i++ ) {
		$arr = preg_split( "/[\/\-]/", $category_temparr[$i] );  /* split by '/' and '-' */
		$selectlist->category = array_merge( $selectlist->category, $arr );
	}
	$selectlist->category = array_unique( $selectlist->category );

	$selectlist->implemented = array_unique( $implemented_temparr );

	sort( $selectlist->class    );
	sort( $selectlist->category );
	sort( $selectlist->implemented );
}




?>


<!DOCTYPE html>
<html lang='ja'>
<head>
	<?php
		PrintHead( "カードリスト" );
		PrintHead_Dominion();
	?>
	<link rel="stylesheet" type="text/css" href="/Dominion/css/Online_Cards.css">
	<link rel="stylesheet" type="text/css" href="/Dominion/css/Cardlist.css">
	<link rel="stylesheet" type="text/css" href="/Dominion/css/CardEffectBox.css">

</head>


<body style='width:1800px'>
	<header>
		<?= PrintHome(); ?>
	</header>

	<div class='main'>
		<table class='tbl-stripe' id='table_cardlist'>
		<thead>
		<tr>
			<th nowrap></th>
			<th nowrap>Card No.</th>
			<th nowrap>カード名</th>
			<th nowrap>カード名（英語）</th>
			<th nowrap>セット名</th>
			<th nowrap>コスト</th>
			<th nowrap>分類</th>
			<th nowrap>種類</th>
			<th nowrap>能力</th>
			<th nowrap>勝利点</th>
			<th nowrap>card</th>
			<th nowrap>action</th>
			<th nowrap>buy</th>
			<th nowrap>coin</th>
			<th nowrap>VPtoken</th>
			<th nowrap>オンライン対戦<br>実装状況</th>
		</tr>

		<tr>
			<th></th>
			<th></th>

			<th style="text-align:left" nowrap >
				部分一致検索<br>
				<input type='text' class='text' id='textfield_card_name'>
			</th>

			<th style="text-align:left" nowrap >
				部分一致検索<br>
				<input type='text' class='text' id='textfield_card_name_eng'>
			</th>


			<th style="text-align:left" >
				<?php
				for ( $i = 0; $i < count( $selectlist->set_name ); $i++ ) {
echo <<<EOM

				<input type='checkbox' id='cardlist_set_name_chbox{$i}' class='filtering' checked='checked'>
				<label for='cardlist_set_name_chbox{$i}' class='checkbox checkbox_on_blue_header'>
					{$selectlist->set_name[$i]}
				</label>
				<br>

EOM;
				}
				?>
				<p><input type='button' class='btn-white select_all_set'   value='全選択'></p>
				<p><input type='button' class='btn-white deselect_all_set' value='全解除'></p>
			</th>


			<th style='padding: 0'>
<!-- 				<select name='cost_potion' onchange='cardlist_filter()'>
					<option>---</option>
					<option>昇順</option>
					<option>降順</option>
				</select> -->
			</th>


			<th style="text-align:left" >
				<?php
				for ( $i = 0; $i < count( $selectlist->class ); $i++ ) {

echo <<<EOM

				<input type='checkbox' id='cardlist_class_chbox{$i}' checked class='filtering'>
				<label for='cardlist_class_chbox{$i}' class='checkbox checkbox_on_blue_header'>
					{$selectlist->class[$i]}
				</label>
				<br>

EOM;
				}
				?>
				<p><input type='button' class='btn-white select_all_class' value='全選択'></p>
				<p><input type='button' class='btn-white deselect_all_class' value='全解除'></p>
			</th>


			<th style="text-align:left" >
				<?php
				for ( $i = 0; $i < count( $selectlist->category ); $i++ ) {
echo <<<EOM

				<input type='checkbox' id='cardlist_category_chbox{$i}' class='filtering' checked>
				<label for='cardlist_category_chbox{$i}' class='checkbox checkbox_on_blue_header'>
					{$selectlist->category[$i]}
				</label>
				<br>

EOM;
				}
				?>
				<p><input type='button' class='btn-white select_all_category'   value='全選択'></p>
				<p><input type='button' class='btn-white deselect_all_category' value='全解除'></p>
			</th>

			<th></th>

			<th style='padding: 0'>
<!-- 				<select name='VP' onchange='cardlist_filter()'>
					<option>---</option>
					<option>昇順</option>
					<option>降順</option>
				</select> -->
			</th>

			<th style='padding: 0'>
<!-- 				<select name='card' onchange='cardlist_filter()'>
					<option>---</option>
					<option>昇順</option>
					<option>降順</option>
				</select> -->
			</th>

			<th style='padding: 0'>
<!-- 				<select name='action' onchange='cardlist_filter()'>
					<option>---</option>
					<option>昇順</option>
					<option>降順</option>
				</select> -->
			</th>

			<th style='padding: 0'>
<!-- 				<select name='buy' onchange='cardlist_filter()'>
					<option>---</option>
					<option>昇順</option>
					<option>降順</option>
				</select> -->
			</th>

			<th style='padding: 0'>
<!-- 				<select name='coin' onchange='cardlist_filter()'>
					<option>---</option>
					<option>昇順</option>
					<option>降順</option>
				</select> -->
			</th>

			<th style='padding: 0'>
<!-- 				<select name='VPtoken' onchange='cardlist_filter()'>
					<option>---</option>
					<option>昇順</option>
					<option>降順</option>
				</select> -->
			</th>

			<th style="text-align:left" >
				<?php
				for ( $i = 0; $i < count( $selectlist->implemented ); $i++ ) {
echo <<<EOM

				<input type='checkbox' id='cardlist_implemented_chbox{$i}' class='filtering' checked>
				<label for='cardlist_implemented_chbox{$i}' class='checkbox checkbox_on_blue_header'>
					{$selectlist->implemented[$i]}
				</label>
				<br>

EOM;
				}
				?>
				<p><input type='button' class='btn-white select_all_implemented'   value='全選択'></p>
				<p><input type='button' class='btn-white deselect_all_implemented' value='全解除'></p>
			</th>
		</tr>


		</thead>
		<tbody id='tbody_cardlist'> </tbody>
		</table>
	</div>

	<div class='BlackCover MyAlert'>
		<div class='MyAlert-box CardEffect-box'>
			<div class='clear alert_text'></div>
			<div class='clear alert_contents'></div>
			<div class='clear buttons'> <input type='button' class='btn-blue' value='OK'> </div>
			<div class='clear'></div>
		</div>
	</div>
</body>


<?php
	PHP2JS_Cardlist_Setlist( $Cardlist, $Setlist );

	$class_list_tsv    = implode( "\t", $selectlist->class );
	$category_list_tsv = implode( "\t", $selectlist->category );
	$implemented_list_tsv = implode( "\t", $selectlist->implemented );
echo <<<EOM
	<script type="text/javascript">
		var class_list_tsv = "$class_list_tsv";
		var class_list = class_list_tsv.split("\t");
		var category_list_tsv = "$category_list_tsv";
		var category_list = category_list_tsv.split("\t");
		var implemented_list_tsv = "$implemented_list_tsv";
		var implemented_list = implemented_list_tsv.split("\t");
	</script>
EOM;
?>


<script type='text/javascript' src='./js/CardEffectBox.js'></script>
<script type='text/javascript' src='./js/Online_MakeHTML.js'></script>
<script type='text/javascript' src='./js/Cardlist.js'></script>
<script type='text/javascript'>
	for ( var i = 0; i < Cardlist.length; i++ ) {
		Cardlist[i].display_flag = true;
	}
	cardlist_display();
</script>


</html>

