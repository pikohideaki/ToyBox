<?php

function is_mobile () {
	$useragents = array('iPad*','iPhone','iPod','Android.*Mob','Opera.*Mini','blackberry','Windows.*Phone');
	$pattern = '/'.implode('|', $useragents).'/i';
	return preg_match($pattern, $_SERVER['HTTP_USER_AGENT']);
}

function SetViewport() {
	if ( is_mobile() ) {
		echo "\n<meta name='viewport' content='width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0'>\n";
		// echo "\n<meta name='viewport' content='width=1300px'>\n";
		// echo "\n<meta name='viewport' content='width=device-width,maximum-scale=0.6'>\n";
		// echo "\n<meta name='viewport' content='width=device-width,initial-scale=1.0,minimum-scale=1.0'>\n";
	}
}

