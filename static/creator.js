







class MargaretGrip {

	constructor() {

		this.newTableForm = document.getElementsByClassName("adding-form")[0];
		this.tableName = this.newTableForm.getElementsByClassName("table-input")[0];
		this.creatorTable = this.newTableForm.getElementsByClassName("creator-table")[0];


		this.creatorTable.rows[0].getElementsByClassName("clear-button")[0].addEventListener("click",event => this.clearTableName(event));
		this.creatorTable.getElementsByClassName("new-row-button")[0].addEventListener("click",event => this.addRow(event));
		this.newTableForm.elements["submit"].addEventListener("click",event => this.createTable(event));

		this.columnsCount = 0;
		this.columns = [];
		this.rows = [];

		Array.prototype.slice.call(this.creatorTable.rows,1,-1).forEach(row => {

			row.getElementsByClassName("delete-button")[0].addEventListener("click",event => this.deleteRow(event));
			this.columns.push(row.getElementsByClassName("table-input")[0]);
			this.rows.push(row);

			++this.columnsCount
		});
		this.radioIdRegex = /row-(text|date|number)-(\d+)/;
		this.radioNameRegex = /row-(\d+)-type/;
	}
	createTable(event /* Event */) {

		event.preventDefault();

		if(this.tableName.value === "") {

			alert("Table name not provided!");
			return
		}
		if(!this.columnsCount) {

			alert("Table columns not provided");
			return
		}
		const query = { table: this.tableName.value, columns: {}};
		const columnIndecies = {};
		const emptyColumns = [];
		const invalid = new Set();
		let   columnName;
		let   columnRadio;

		this.rows.forEach((row,i) => {

			columnName = this.columns[i].value;

			if(columnName !== "") {
				if(!(columnName in columnIndecies)) columnIndecies[columnName] = new Set();

				columnRadio = row.querySelector(`input:checked`).value;
				query.columns[columnName] = row.querySelector(`input:checked`).value;
				columnIndecies[columnName].add(i);
			}	else emptyColumns.push(i);
		});

		Object.values(columnIndecies).forEach(indecies => {

			if(1 <indecies.size) indecies.forEach(i => invalid.add(i))
		});	emptyColumns.forEach(i => invalid.add(i));

		if(invalid.size) {

			alert("Invalid column names are found!");
			invalid.forEach(i => this.markInvalid(this.columns[i]));
			return
		}	if(!confirm(`Create table ${this.tableName.value}?`)) return;

		fetch(
			"/new-table",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(query)
			}
		).then(response => {

			switch(response.status) {

				case 200:	location.href = "/"; break;
				case 500:	response.json().then(data => alert(data.reason)); break;
				default:	alert(`Unhandled status ${response.status}`);
			}

		}).catch(E => alert(E))
	}
	addRow(event /* Event */) {

		event.preventDefault();

		const lastRow = this.creatorTable.rows[this.columnsCount];
		const newRow = this.creatorTable.insertRow(++this.columnsCount);
		const inputs = lastRow.getElementsByTagName("input");
		const labels = lastRow.getElementsByTagName("label")
		const typesRadio = newRow.insertCell();
		const delRow = newRow.insertCell();
		const rowData = newRow.insertCell();
		const radioTextType = typesRadio.appendChild(document.createElement("input"));
		const radioTextTypeLabel = typesRadio.appendChild(document.createElement("label"));
		const radioDateType = typesRadio.appendChild(document.createElement("input"));
		const radioDateTypeLabel = typesRadio.appendChild(document.createElement("label"));
		const radioNumberType = typesRadio.appendChild(document.createElement("input"));
		const radioNumberTypeLabel = typesRadio.appendChild(document.createElement("label"));
		const delButton = delRow.appendChild(document.createElement("button"));
		const rowInput = rowData.appendChild(document.createElement("input"));
		let   currentName;
		let   currentId;

		currentName = inputs[0].name.replace(this.radioNameRegex, this.newRadioName);
		currentId = inputs[0].id.replace(this.radioIdRegex, this.newRadioId);
		radioTextType.value = 0;
		radioTextType.type = "radio";
		radioTextType.name = currentName;
		radioTextType.id = currentId;
		radioTextTypeLabel.for = currentId;
		radioTextTypeLabel.innerText = labels[0].innerText;
		radioTextType.checked = true;

		currentName = inputs[1].name.replace(this.radioNameRegex, this.newRadioName);
		currentId = inputs[1].id.replace(this.radioIdRegex, this.newRadioId);
		radioDateType.value = 1;
		radioDateType.type = "radio";
		radioDateType.name = currentName;
		radioDateType.id = currentId;
		radioDateTypeLabel.for = currentId;
		radioDateTypeLabel.innerText = labels[1].innerText;

		currentName = inputs[2].name.replace(this.radioNameRegex, this.newRadioName);
		currentId = inputs[2].id.replace(this.radioIdRegex, this.newRadioId);
		radioNumberType.value = 2;
		radioNumberType.type = "radio";
		radioNumberType.name = currentName;
		radioNumberType.id = currentId;
		radioNumberTypeLabel.for = currentId;
		radioNumberTypeLabel.innerText = labels[2].innerText;

		delButton.className = "delete-button";
		delButton.innerText = "X";
		delButton.addEventListener("click",event => this.deleteRow(event));

		rowInput.type = "text";
		rowInput.name = "new-table-row";
		rowInput.className = "table-input";
		rowInput.placeholder = inputs[3].placeholder;

		this.columns.push(rowInput);
		this.rows.push(newRow);
	}
	deleteRow(event /* Event */) {

		event.preventDefault();

		if(1 <this.columnsCount) {

			const targetRow = event.target.parentNode.parentNode;
			this.creatorTable.deleteRow(Array.prototype.indexOf.call(this.creatorTable.rows, targetRow));
			this.columns.splice(this.columns.indexOf(targetRow.getElementsByClassName("table-input")[0]), 1);
			this.rows.splice(this.rows.indexOf(targetRow), 1);
			--this.columnsCount;
		}
	}
	clearTableName(event /* Event */) {

		event.preventDefault();
		this.tableName.value = ""
	}
	clearForm(event /* Event */) {

		if(event) event.preventDefault();
		this.tableName.value = "";
		this.columns.forEach(row => row.value = "")
	}
	newRadioId(match, p1, p2) {
		return `row-${p1}-${parseInt(p2)+1}`
	}
	newRadioName(match, p1) {
		return `row-${parseInt(p1)+1}-type`
	}
	markInvalid(column) {

		column.style.backgroundColor = "rgb(255,0,0)";
		setTimeout(() => {

			if(column) column.style.backgroundColor = "rgb(255,255,255)"
		},	5000)
	}
}







