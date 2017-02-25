
import B from "./test_sub";


async function f() {
	let a = new B();
	$('body').append('<p></p>');
	return a.sum();
}


