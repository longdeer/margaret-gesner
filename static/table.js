







function openTab(event /* Event */, tabName /* String */, orderBy /* Number */, descending /* Boolean */) {

	Array.prototype.forEach.call(

		document.getElementsByClassName("office-tab-content"),
		E => E.style.display = 'none'
	);
	Array.prototype.forEach.call(

		document.getElementsByClassName("office-tab"),
		E => E.className.replace(" active","")
	);
	document.getElementById(tabName).style.display = "block";
	event.currentTarget.className += " active";

	fetchTabData(tabName, orderBy, descending);
}








function fetchTabData(tabName /* String */, orderBy /* Number */, descending /* Boolean */) {

	fetch(`/office-tab-${tabName}?${new URLSearchParams({ orderBy, descending })}`, { method: "GET" })
		.then(response => {

			if(!response.ok) throw new Error(`Get office tab status: ${response.status}`);
			return response.json();

		}).then(view => {

			var row;
			var col;
			var newRow;
			var delButton;
			var updButton;
			var tab = view[tabName];
			var table = document.getElementById(tabName).getElementsByTagName("table")[0];
			var current = table.getElementsByTagName("tbody")[0];

			if(current) current.remove();

			table =	table.appendChild(document.createElement("tbody"));
			tab.forEach(row => {

				newRow = table.insertRow();

				for(col = 1; col <row.length; ++col) newRow.insertCell().appendChild(document.createTextNode(row[col]));

				delButton = newRow.insertCell().appendChild(document.createElement("button"));
				delButton.className = "office-tab-content-del";
				delButton.textContent = "X";
				delButton.type = "button";
				delButton.id = `${tabName}-${row[0]}`;
				delButton.onclick = delRow;

				updButton = newRow.insertCell().appendChild(document.createElement("button"));
				updButton.className = "office-tab-content-upd";
				updButton.textContent = "U";
				updButton.type = "button";
				updButton.id = `${tabName}-${row[0]}`;
				updButton.onclick = updRow;
			})
		})
}








function sortToggle(event /* Event */, orderBy /* Number */, tabName /* String */) {

	var nextState = event.target.innerHTML.trim().charCodeAt(0) ^2;
	var nextDescending = Boolean(nextState &2);
	event.target.innerHTML = `&#${nextState}`;
	fetchTabData(tabName, orderBy, nextDescending);
}








function inputsAdapter() {

	document.querySelectorAll("input").forEach(node => {
		node.addEventListener("input", event => {

			event.preventDefault();
			node.style.width = "146px";
			node.style.backgroundColor = "white";
			node.style.width = node.scrollWidth + "px";
		})
	})
}








function delRow(event /* Event */) {

	var tabName;
	var rowId;

	[ tabName,rowId ] = event.target.id.split("-");

	if(confirm(`Delete row ${rowId} from ${tabName} table?`)) {

		fetch("/office-del",{ method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tabName,rowId }) })
			.then(response => {

				switch(response.status) {

					case 200: fetchTabData(tabName, 2, true); break;
					/*
						Despite endpoint might return 405, no need for handling it,
						cause it's only for other than POST methods
					*/
					case 500: response.json().then(data => alert(data.exception)); break;
				}
			})
	}
}








function updRow(event /* Event */) {

	// console.log(event.target);
	// console.log(event.target.parentNode);
	// console.log(event.target.parentNode.parentNode);

	var tabName;
	var scroll;
	var rowId;
	var text;
	var i,c;

	[ tabName,rowId ] = event.target.id.split("-");

	var currentRow = event.target.parentNode.parentNode.children;
	var currentForm = document.getElementById(`office-tab-content-add-form-${tabName}`).getElementsByTagName("input");

	// currentForm[currentForm.length -1].style.display = "inline";
	// console.log(`currentRow = ${currentRow}`);
	// console.log(`currentRow.length = ${currentRow.length}`);
	// console.log(`currentForm = ${currentForm}`);
	// console.log(`currentForm.length = ${currentForm.length}`);

	for(i = 0; i <currentForm.length -2; ++i) {

		// console.log(`currentRow[i] = ${currentRow[i].innerText}`);
		// console.log(`currentForm[i] = ${currentForm[i].value}`);
		text = currentRow[i].innerText;
		// console.log(CanvasRenderingContext2D.measureText(text).width);
		// console.log(canvas.measureText(text).width);
		currentForm[i].value = "";
		currentForm[i].style.width = "146px";

		for(c of text) {

			currentForm[i].value += c;
			if(150 <(scroll = currentForm[i].scrollWidth)) currentForm[i].style.width = scroll + "px";
		}
	}
}








function submitTabInput(Tab) {

	var tabName = Tab.id.split("-").slice(-1);
	var query = {};
	var filled = false;

	query[tabName] = {};

	Array.prototype.forEach.call(Tab, item => {

		if(item.name !== "submit" && (data = item.value)) {

			query[tabName][item.name] = data;
			filled = true;
		}
	});

	if(!filled) {

		alert("Empty form not allowed");
		return;
	}

	fetch("/office-add",{ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(query) })
		.then(response => {

			switch(response.status) {

				case 200:

					Array.prototype.forEach.call(Tab, item => {

						if(item.name !== "submit") {

							item.value = "";
							item.style.width = "146px";
						}
					});

					fetchTabData(tabName, 2, true);
					break;

				case 400:

					response.json().then(data => {

						for(var field in data)
							if(field !== "success")
								Tab.elements[field].style.backgroundColor = "red";
					});
					break;

				/*
					Despite endpoint might return 405, no need for handling it,
					cause it's only for other than POST methods
				*/

				case 500:

					response.json().then(data => alert(data.exception));
					break;
			}
		})
}







