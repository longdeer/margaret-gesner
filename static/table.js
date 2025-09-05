







class MargaretGrip {

	constructor(tableName /* String */) {

		this.tableName = tableName;
		this.tableContent = document.getElementsByClassName("table-content")[0];
		this.addingForm = document.getElementsByClassName("manage-form")[0];
		this.addingForm.addEventListener("submit",event => this.addRow(event));

		this.columnsCount;
		this.rowsCount;

		this.headers = this.constructHeaders();
		this.rows = this.constructRows();
	}
	constructHeaders() {

		let   header;
		let   sortButton;
		const headers = [];

		this.columnsCount = 0;

		for(let i = 2; i <this.tableContent.rows[0].cells.length; ++i) {

			sortButton = document.createElement("button");
			sortButton.addEventListener("click", event => this.sortToggle(event,i -2));
			sortButton.classList.add("table-header-sort");
			sortButton.innerHTML = "&#11123";

			header = this.tableContent.rows[0].cells[i];
			headers.push(header.innerText.trim());
			header.append(sortButton);

			++this.columnsCount;

		}	return headers
	}
	constructRows() {

		let   i;
		let   j;
		let   currentRow;
		const rowsContent = [];

		this.rowsCount = 0;

		for(i = 1; i <this.tableContent.rows.length; ++i) {

			currentRow = [];
			this.tableContent.rows[i].cells[0].getElementsByClassName("delete-button")[0].addEventListener("click",event => this.deleteRow(event));
			this.tableContent.rows[i].cells[1].getElementsByClassName("update-button")[0].addEventListener("click",event => this.updateRow(event));
			for(j = 0; j <this.columnsCount; ++j) currentRow.push(this.tableContent.rows[i].cells[j+2].innerText);

			rowsContent.push(currentRow);
			++this.rowsCount

		}	return rowsContent
	}
	sortToggle(event /* Event */, orderIndex /* Number */, tabName /* String */) {

		const nextState = event.target.innerHTML.trim().charCodeAt(0) ^2;
		const ascending = Boolean(nextState &2);

		event.target.innerHTML = `&#${nextState}`;

		this.rows.sort((r1,r2) => {

			if(ascending) {

				if(r1[orderIndex] <r2[orderIndex]) return -1;
				if(r2[orderIndex] <r1[orderIndex]) return 1;
				return 0
			}
			if(!ascending){
				if(r1[orderIndex] <r2[orderIndex]) return 1;
				if(r2[orderIndex] <r1[orderIndex]) return -1;
				return 0
			}
		});

		this.updateTable()
	}
	updateTable() {

		let i;
		let j;

		for(i = 0; i <this.tableContent.rows.length -1; ++i)
			for(j = 0; j <this.columnsCount; ++j)

				this.tableContent.rows[i+1].cells[j+2].innerText = this.rows[i][j]
	}
	addRow(event /* Event */) {

		event.preventDefault();
		const query = {};

		this.headers.forEach((header,i) => query[header] = event.target[i].value || null);
		if(!confirm(`Add row ${JSON.stringify(query)} to ${this.tableName}?`)) return;

		fetch(
			`/add-row-${this.tableName}`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(query)
			}
		).then(response => {

			switch(response.status) {

				case 200:

					this.headers.forEach((_,i) => event.target[i].value = "");

					let   newCell;
					const newRow = this.tableContent.insertRow();

					const delButton = newRow.insertCell().appendChild(document.createElement("button"));
					delButton.className = "delete-button";
					delButton.addEventListener("click",event => this.deleteRow(event));
					delButton.innerText = "X";

					const updButton = newRow.insertCell().appendChild(document.createElement("button"));
					updButton.className = "update-button-button";
					updButton.addEventListener("click",event => this.updateRow(event));
					updButton.innerText = "»";

					this.rows.unshift(this.headers.map(header => {

						newCell = newRow.insertCell();
						newCell.appendChild(document.createTextNode(""));
						newCell.className = "table-content-data";

						return query[header]
					}));

					this.updateTable();
					break;

				case 500:	response.json().then(data => alert(data.reason)); break;
				default:	break;
			}

		}).catch(E => alert(E))
	}
	deleteRow(event /* Event */) {

		event.preventDefault();
		const currentRow = event.target.parentNode.parentNode;
		const rowToDelete = Array.prototype.slice.call(currentRow.cells,2);
		const viewRow = this.headers.map((_,i) => rowToDelete[i].innerText);
		const query = {};

		this.headers.forEach((header,i) => query[header] = viewRow[i] || null);
		if(!confirm(`Delete row ${JSON.stringify(query)} from ${this.tableName}?`)) return;

		fetch(
			`/del-row-${this.tableName}`,
			{
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(query)
			}
		).then(response => {

			switch(response.status) {

				case 200:

					this.tableContent.deleteRow(Array.prototype.indexOf.call(this.tableContent.rows,currentRow));
					this.rows.splice(this.findRow(viewRow),1);
					this.updateTable();
					break;

				case 500:	response.json().then(data => alert(data.reason)); break;
				default:	break;
			}

		}).catch(E => alert(E))
	}
	updateRow(event /* Event */) {

		event.preventDefault();
		console.log(this);
		console.log(event.target.parentNode.parentNode)
	}
	findRow(content /* [ String, ] */) {

		let i;
		let j;

		outer: for(i = 0; i <this.rowsCount; ++i) {
			for(j = 0; j <this.columnsCount; ++j)

				if(this.rows[i][j] !== content[j]) continue outer;
				return  i
		}		return -1;
	}
}
















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







