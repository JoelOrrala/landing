
let loaded = (eventLoaded) => {

	let myform = document.getElementById('subscription-form');
	myform.addEventListener('submit', (eventSubmit) => {
		eventSubmit.preventDefault();
		let element1 = document.getElementById('form_name');
		let element1Value = element1.value;

		const datos = {};

		if (element1Value.length == 0) {
			element1.focus();
			alert('Ingrese un nombre válido');
			return;
		}

		datos['name'] = element1Value;

		let element2 = document.getElementById('form_mail');
		let element2Value = element2.value;

		if (element2Value.length === 0 || !validateEmail(element2Value)) {
			element2.focus();
			alert('Ingrese un email válido');
			return;
		}

		datos['email'] = element2Value;

		let element3 = document.getElementById('form_interes');
		let element3Value = element3.value;

		if (element3Value.length === 0) {
			element3.focus();
			alert('Seleccione un interés válido');
			return;
		}

		datos['interes'] = element3Value;

		fetch('https://dawn-ce34a-default-rtdb.firebaseio.com/collection.json', {
			method: 'POST',
			body: JSON.stringify(datos),
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then(respuesta => respuesta.json())
			.then(datos => {
				console.log(datos);
			})
			.catch(error => console.error(error));

		debugger;
	});

	function validateEmail(email) {
		const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return re.test(email);
	}
};

window.addEventListener("DOMContentLoaded", loaded);
