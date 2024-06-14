let submitValues = (datos) => {
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
			obtenerDatos();
			const myform = document.getElementById('subscription-form');
        	myform.reset();
		})
		.catch(error => console.error(error));
};

let validateEmail = (email) => {
	const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return re.test(email);
};

let loaded = (eventLoaded) => {
	let myform = document.getElementById('subscription-form');

	myform.addEventListener('submit', (eventSubmit) => {
		eventSubmit.preventDefault();

		let element1 = document.getElementById('form_name');
		let element2 = document.getElementById('form_mail');
		let element3 = document.getElementById('form_interes');

		let element1Value = element1.value.trim();
		let element2Value = element2.value.trim();
		let element3Value = element3.value.trim();

		if (element1Value.length === 0) {
			element1.focus();
			alert('Ingrese un nombre válido');
			return;
		}

		if (element2Value.length === 0 || !validateEmail(element2Value)) {
			element2.focus();
			alert('Ingrese un email válido');
			return;
		}

		if (element3Value.length === 0) {
			element3.focus();
			alert('Seleccione un interés válido');
			return;
		}

		const datos = {
			name: element1Value,
			email: element2Value,
			interes: element3Value
		};

		submitValues(datos);
	});
};

async function obtenerDatos() {
    const url = "https://dawn-ce34a-default-rtdb.firebaseio.com/collection.json";
    const respuesta = await fetch(url);
    
    if (!respuesta.ok) {
        console.error("Error:", respuesta.status);
        return;
    }
    
    const datos = await respuesta.json();
    console.log(datos);
    
    
    const conteoIntereses = new Map();
    
    for (const key in datos) {
        if (datos.hasOwnProperty(key)) {
            const interes = datos[key].interes;
            if (conteoIntereses.has(interes)) {
                conteoIntereses.set(interes, conteoIntereses.get(interes) + 1);
            } else {
                conteoIntereses.set(interes, 1);
            }
        }
    }
    
    console.log(conteoIntereses); 
    
    const sortedConteoIntereses = new Map([...conteoIntereses.entries()].sort((a, b) => b[1] - a[1]));
    
    console.log(sortedConteoIntereses); 
    
  
    const tableBody = document.getElementById("tablebody");
    tableBody.innerHTML = ""; 
    
    sortedConteoIntereses.forEach((conteo, interes) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${interes}</td>
            <td>${conteo}</td>
        `;
        tableBody.appendChild(row);
    });
}


document.addEventListener("DOMContentLoaded", () => {
	loaded();
	obtenerDatos();
});