
import B from "./test_sub";

declare var $: any;

declare var FBdatabase: any;


async function f() {
	let a = new B();
	$('body').append('<p></p>');
	return a.sum();
}


