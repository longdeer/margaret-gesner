







class MargaretGrip {

	constructor() {

		this.newTableForm = document.getElementsByClassName("adding-form")[0];
		this.tableName = this.newTableForm.getElementsByClassName("table-input")[0];
		this.creatorTable = this.newTableForm.getElementsByClassName("creator-table")[0];


		this.creatorTable.rows[0].getElementsByClassName("clear-button")[0].addEventListener("click",event => this.clearInput(event));
		this.creatorTable.getElementsByClassName("new-row-button")[0].addEventListener("click",event => this.addRow(event));
		this.newTableForm.elements["submit"].addEventListener("click",event => this.createTable(event));

		this.columns = 0;
		this.rows = [];

		Array.prototype.slice.call(this.creatorTable.rows,1,-1).forEach(row => {

			row.getElementsByClassName("delete-button")[0].addEventListener("click",event => this.deleteRow(event));
			this.rows.push(row.getElementsByClassName("table-input")[0]);
			++this.columns;
		});
		this.radioIdRegex = /row-(text|date|number)-(\d+)/;
		this.radioNameRegex = /row-(\d+)-type/;
	}
	createTable(event /* Event */) {

		event.preventDefault();
		// const query = { table: this.newTableForm[0].value, columns: []};
		const query = { table: this.tableName.value, columns: []};

		// this.rows.forEach((_,i) => query.columns.push(this.newTableForm[i+1].value));
		this.rows.forEach(row => query.columns.push(row.value));
		console.log(query);

		this.clearForm()
	}
	constructName() {
	}
	constructRows() {
	}
	updateTable() {
	}
	addRow(event /* Event */) {

		event.preventDefault();

		const lastRow = this.creatorTable.rows[this.columns];
		const inputs = lastRow.getElementsByTagName("input");
		const labels = lastRow.getElementsByTagName("label")
		const newRow = this.creatorTable.insertRow(++this.columns);
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

		this.rows.push(rowInput);
	}
	deleteRow(event /* Event */) {

		event.preventDefault();
		console.log(event.target.parentNode.parentNode)
	}
	findRow(content /* [ String, ] */) {
	}
	clearInput(event /* Event */) {

		event.preventDefault();
		console.log(event.target.parentNode.parentNode);
		event.target.parentNode.parentNode.getElementsByClassName("table-input")[0].value = ""
	}
	clearForm(event /* Event */) {

		if(event) event.preventDefault();
		this.tableName.value = "";
		this.rows.forEach(row => row.value = "")
	}
	newRadioId(match, p1, p2) {
		return `row-${p1}-${parseInt(p2)+1}`
	}
	newRadioName(match, p1) {
		return `row-${parseInt(p1)+1}-type`
	}
}







