







class MargaretGrip {

	constructor(tableName /* String */) {

		// Deafult titles
		this.localeTitles = {

			ITEM_DELETE_TITLE: "Delete",
			ITEM_EDIT_TITLE: "Edit",
			ITEM_NEW_TABLE_TITLE: "New table",
			ITEM_OPEN_TABLE_TITLE: "Open table",
			ITEM_BACK_TO_STRUCTURE_TITLE: "Back to tables",
			ITEM_SUBMIT_NEW_ROW_TITLE: "Submit new row",
			ITEM_CANCEL_EDIT_TITLE: "Clear",
			ITEM_SUBMIT_ROW_UPDATE_TITLE: "Submit row update",
			ITEM_DELETE_ROW_TITLE: "Delete row",
			ITEM_EDIT_ROW_TITLE: "Edit row",
			ITEM_DELETE_COLUMN_TITLE: "Delete column",
			ITEM_NEW_TABLE_COLUMN_TITLE: "New column",
			ITEM_SUBMIT_NEW_TABLE_TITLE: "Submit new table",
			ITEM_SORTING_TOGGLE_TITLE: "Sort",
			ALERT_UNHANDLED_STATUS: "Unhandled status",
			ALERT_RELOAD_TO_VIEW: "Failed to update view, reload page",
			ALERT_SAME_CONTENT_UPDATE: "Update with the same content not allowed",
			ALERT_NO_TABLE_NAME: "Table name not provided",
			ALERT_NO_COLUMN_NAME: "Table columns not provided",
			ALERT_IMPROPER_COLUMN_NAME: "Invalid column names are found",
			ALERT_TABLE_NOT_MODIFIED: "Table not modified",
			ALERT_NOT_ALLOWED: "Access denied",
			ALERT_PARTIAL_FAIL: "Some actions failed",
			CONFIRM_TABLE_NEW_ROW: "Add row",
			CONFIRM_TABLE_DELETE_ROW: "Delete row",
			CONFIRM_TABLE_UPDATE_ROW: "Commit update",
			CONFIRM_NEW_TABLE: "Create table",
			CONFIRM_DELETE_TABLE: "Delete table",
			CONFIRM_MODIFY_TABLE: "Modify table"
		};


		if(!sessionStorage.getItem("localeTitles")) {

			fetch("/locale-titles")
			.then(response => {

				if(!response.status === 200) console.log(`fetching locale titles status ${response.status}`);
				else {

					const titles = {};
					response.json().then(data => Object.keys(data).forEach(key => titles[key] = data[key]));
					sessionStorage.setItem("localeTitles", titles)
				}
			})
			.catch(E => consle.log(E));
		}
		const titles = sessionStorage.getItem("localeTitles");
		if(titles) Object.keys(titles).forEach(key => this.localeTitles[key] = titles[key]);


		if(tableName) {

			this.tableName = tableName;
			this.tableOriginRow = null;
			this.tableContent = document.getElementsByClassName("table-content")[0];
			this.tableRowsBuilder = document.getElementsByClassName("manage-form")[0];


			this.tableNumberTypeKeys = "0123456789";
			this.tableDateTypeKeys = "-0123456789";


			this.tableHeaders = [];
			this.tableHeadersTypes = [];
			this.tableRows = [];
			this.tableColumnsCount;
			this.tableRowsCount;


			this.tableGetHeaders();
			this.tableGetRows();
			this.tableGetRowsBuilder();

		}	else {

			this.builderForm = document.getElementsByClassName("builder-form")[0];
			this.builderAlias = this.builderForm.getElementsByClassName("table-input")[0];
			this.builderTable = this.builderForm.getElementsByClassName("builder-table")[0];
			this.buildereditMode = this.builderTable.rows[0].cells[0].getElementsByTagName("label")[0].title;


			this.builderTable.rows[0].getElementsByClassName("clear-button")[0].addEventListener("click",event => this.builderClearTableName(event));
			this.builderTable.getElementsByClassName("new-column-button")[0].addEventListener("click",event => this.builderNewColumn(event));
			if(this.buildereditMode) this.builderForm.elements["submit"].addEventListener("click",event => this.builderModifyTable(event));
			else this.builderForm.elements["submit"].addEventListener("click",event => this.builderNewTable(event));


			this.builderOriginalAlias = this.builderAlias.value;
			this.builderOriginalColumnsCount = 0;
			this.builderOriginalColumns = [];
			this.builderColumnsCount = 0;
			this.builderColumns = [];
			this.builderRows = [];

			let rowInput;

			Array.prototype.slice.call(this.builderTable.rows,1,-1).forEach(row => {

				row.getElementsByClassName("delete-button")[0].addEventListener("click",this.buildereditMode ? this.builderToggleColumn : event => this.builderDeleteColumn(event));
				rowInput = row.getElementsByClassName("table-input")[0];
				this.builderOriginalColumns.push(rowInput.value);
				this.builderColumns.push(rowInput);
				this.builderRows.push(row);

				++this.builderOriginalColumnsCount;
				++this.builderColumnsCount
			});


			this.builderColumnRadioIdRegex = /row-(text|date|number)-(\d+)/;
			this.builderColumnRadioNameRegex = /row-(\d+)-type/;
		}
	}
	tableGetHeaders() {

		let   header;
		let   sortButton;
		const headers = [];

		this.tableColumnsCount = 0;

		for(let i = 2; i <this.tableContent.rows[0].cells.length; ++i) {

			header = this.tableContent.rows[0].cells[i];

			// Adding to header haeder name without sorting button
			this.tableHeaders.push(header.innerText.slice(0,-1).trim());
			this.tableHeadersTypes.push(header.className.split("-")[2]);

			header.getElementsByClassName("table-header-sort")[0].addEventListener("click", event => this.tableSortColumn(event,i -2));

			++this.tableColumnsCount;
		}
	}
	tableGetRows() {

		let   i;
		let   j;
		let   currentRow;

		this.tableRowsCount = 0;

		for(i = 1; i <this.tableContent.rows.length; ++i) {

			currentRow = [];
			this.tableContent.rows[i].cells[0].getElementsByClassName("delete-button")[0].addEventListener("click",event => this.tableDeleteRow(event));
			this.tableContent.rows[i].cells[1].getElementsByClassName("update-button")[0].addEventListener("click",event => this.tableEditRow(event));
			for(j = 0; j <this.tableColumnsCount; ++j) currentRow.push(this.tableContent.rows[i].cells[j+2].innerText);

			this.tableRows.push(currentRow);
			++this.tableRowsCount

		}
	}
	tableGetRowsBuilder() {

		this.tableRowsBuilder.elements["submit"].addEventListener("click",event => this.tableNewRow(event));
		this.tableRowsBuilder.elements["cancel"].addEventListener("click",event => this.cleartableRowsBuilder(event));
		this.tableRowsBuilder.elements["update"].addEventListener("click",event => this.tableUpdateRow(event));

		this.tableHeadersTypes.forEach((T,i) => {

			switch(T) {
				case "10": this.tableRowsBuilder[i].addEventListener("input", event => {

					if(event.inputType === "insertText" && !this.tableDateTypeKeys.includes(event.data))
						event.target.value = event.target.value.slice(0,-1)

				});	break;

				case "8": this.tableRowsBuilder[i].addEventListener("input", event => {
					if(event.inputType === "insertText" && !this.tableNumberTypeKeys.includes(event.data))
						event.target.value = event.target.value.slice(0,-1)

				});	break;
			}
		})
	}
	tableSortColumn(event /* Event */, orderIndex /* Number */) {

		const nextState = event.target.innerHTML.trim().charCodeAt(0) ^2;
		const ascending = Boolean(nextState &2);
		const typeCode = this.tableHeadersTypes[orderIndex];
		let   r1n;
		let   r2n;

		this.tableRows.sort((r1,r2) => {

			if(ascending) {
				if(typeCode === "8") {

					r1n = BigInt(r1[orderIndex]);
					r2n = BigInt(r2[orderIndex]);
					return r1n <r2n ? -1 : r2n <r1n ? 1 : 0

				}	else {

					if(r1[orderIndex] <r2[orderIndex]) return -1;
					if(r2[orderIndex] <r1[orderIndex]) return 1;
					return 0
				}
			}
			if(!ascending){
				if(typeCode === "8") {

					r1n = BigInt(r1[orderIndex]);
					r2n = BigInt(r2[orderIndex]);
					return r1n <r2n ? 1 : r2n <r1n ? -1 : 0

				}	else {

					if(r1[orderIndex] <r2[orderIndex]) return 1;
					if(r2[orderIndex] <r1[orderIndex]) return -1;
					return 0
				}
			}
		});

		event.target.innerHTML = `&#${nextState}`;
		this.tableUpdateRows()
	}
	tableUpdateRows() {

		let i;
		let j;

		for(i = 0; i <this.tableContent.rows.length -1; ++i)
			for(j = 0; j <this.tableColumnsCount; ++j)

				this.tableContent.rows[i+1].cells[j+2].innerText = this.tableRows[i][j]
	}
	tableNewRow(event /* Event */) {

		event.preventDefault();

		const query = {};
		let   rowData;

		this.tableHeaders.forEach((header,i) => {

			rowData = this.tableRowsBuilder[i].value || null;
			if(typeof(rowData) === "string") rowData = rowData.trim().split(" ").filter(Boolean).join(" ");
			query[header] = rowData
		});


		if(!confirm(`${this.localeTitles.CONFIRM_TABLE_NEW_ROW} ${JSON.stringify(query)}?`)) return;


		fetch(
			`/add-row-${this.tableName}`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(query)
			})
		.then(response => {

			switch(response.status) {

				case 200:

					this.cleartableRowsBuilder();


					let   newCell;
					const newRow = this.tableContent.insertRow();


					const delButtonCell = newRow.insertCell();
					const updButtonCell = newRow.insertCell();
					const delButton = delButtonCell.appendChild(document.createElement("button"));
					const updButton = updButtonCell.appendChild(document.createElement("button"));


					delButtonCell.className = "table-content-edit";
					delButton.classList.add("delete-button");
					delButton.classList.add("table-menu-item");
					delButton.addEventListener("click",event => this.tableDeleteRow(event));
					delButton.title = this.localeTitles.ITEM_DELETE_ROW_TITLE;
					delButton.innerText = "X";


					updButtonCell.className = "table-content-edit";
					updButton.classList.add("update-button");
					updButton.classList.add("table-menu-item");
					updButton.addEventListener("click",event => this.tableEditRow(event));
					updButton.title = this.localeTitles.ITEM_EDIT_ROW_TITLE;
					updButton.innerText = "»";


					this.tableRows.unshift(this.tableHeaders.map(header => {

						newCell = newRow.insertCell();
						newCell.appendChild(document.createTextNode(""));
						newCell.className = "table-content-data";

						return query[header] || ""
					}));


					++this.tableRowsCount;
					this.tableUpdateRows();
					break;


				case 500:	response.json().then(data => alert(data.reason)); break;
				case 403:	alert(this.localeTitles.ALERT_NOT_ALLOWED); break;
				default:	alert(`${this.localeTitles.ALERT_UNHANDLED_STATUS} ${response.status}`); break;
			}})
		.catch(E => alert(E))
	}
	tableDeleteRow(event /* Event */) {

		event.preventDefault();

		const currentRow = event.target.parentNode.parentNode;
		const rowToDelete = Array.prototype.slice.call(currentRow.cells,2);
		const viewRow = [];
		const query = {};

		this.tableHeaders.forEach((header,i) => {

			query[header] = rowToDelete[i].innerText || null;
			viewRow.push(rowToDelete[i].innerText)
		});


		if(!confirm(`${this.localeTitles.CONFIRM_TABLE_DELETE_ROW} ${JSON.stringify(query)}?`)) return;


		fetch(
			`/del-row-${this.tableName}`,
			{
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(query)
			})
		.then(response => {

			switch(response.status) {

				case 200:

					const viewRowToDelete = this.tableFindRow(viewRow)

					if(viewRowToDelete === -1) alert(this.localeTitles.ALERT_RELOAD_TO_VIEW)
					else {

						this.tableContent.deleteRow(Array.prototype.indexOf.call(this.tableContent.rows,currentRow));
						this.tableRows.splice(viewRowToDelete,1);
						--this.tableRowsCount;
						this.tableUpdateRows();
					}	break;

				case 500:	response.json().then(data => alert(data.reason)); break;
				case 403:	alert(this.localeTitles.ALERT_NOT_ALLOWED); break;
				default:	alert(`${this.localeTitles.ALERT_UNHANDLED_STATUS} ${response.status}`); break;
			}})
		.catch(E => alert(E))
	}
	tableEditRow(event /* Event */) {

		event.preventDefault();
		this.tableOriginRow = event.target.parentNode.parentNode;
		this.tableHeaders.forEach((_,i) => this.tableRowsBuilder[i].value = this.tableOriginRow.cells[i+2].innerText)
	}
	tableUpdateRow(event /* Event */) {

		event.preventDefault();

		if(this.tableOriginRow) {

			const viewRow = [];
			const query = { origin: {}, update: {}};
			let   current;

			this.tableHeaders.forEach((header,i) => {

				query.update[header] = this.tableRowsBuilder[i].value || null;
				query.origin[header] = this.tableOriginRow.cells[i+2].innerText || null;
				viewRow.push(this.tableOriginRow.cells[i+2].innerText)
			});


			if(Object.keys(query.origin).reduce((A,k) => A + (query.origin[k] === query.update[k] ? 1 : 0),0) === this.tableColumnsCount) {

				alert(this.localeTitles.ALERT_SAME_CONTENT_UPDATE);
				return
			}	if(!confirm(`${this.localeTitles.CONFIRM_TABLE_UPDATE_ROW} ${JSON.stringify(query)}?`)) return;


			fetch(
				`/upd-row-${this.tableName}`,
				{
					method: "UPDATE",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(query)
				})
			.then(response => {

				switch(response.status) {

					case 200:

						const tableIndex = Array.prototype.indexOf.call(this.tableContent.rows,this.tableOriginRow);
						const viewIndex = this.tableFindRow(viewRow);
						let   current;

						this.tableHeaders.forEach((_,i) => {

							current = this.tableRowsBuilder[i].value;
							this.tableContent.rows[tableIndex].cells[i+2].innerText = current;
							this.tableRows[viewIndex][i] = current
						});

						this.cleartableRowsBuilder();
						this.tableUpdateRows();
						break;

					case 500:	response.json().then(data => alert(data.reason)); break;
					case 403:	alert(this.localeTitles.ALERT_NOT_ALLOWED); break;
					default:	alert(`${this.localeTitles.ALERT_UNHANDLED_STATUS} ${response.status}`); break;

				}	this.tableOriginRow = null
			})
			.catch(E => alert(E))
		}
	}
	tableFindRow(content /* [ String, ] */) {

		let i;
		let j;

		outer: for(i = 0; i <this.tableRowsCount; ++i) {
			for(j = 0; j <this.tableColumnsCount; ++j)

				if(this.tableRows[i][j] !== content[j]) continue outer;

			return  i
		}	return -1
	}
	cleartableRowsBuilder(event /* Event */) {

		if(event) event.preventDefault();
		this.tableHeaders.forEach((_,i) => this.tableRowsBuilder[i].value = "");
	}
	builderNewTable(event /* Event */) {

		event.preventDefault();


		if(this.builderAlias.value === "") {

			alert(this.localeTitles.ALERT_NO_TABLE_NAME);
			return
		}
		if(!this.builderColumnsCount) {

			alert(this.localeTitles.ALERT_NO_COLUMN_NAME);
			return
		}


		const newTableAlias = this.builderAlias.value.trim().split(" ").filter(Boolean).join(" ");
		const query = { table: newTableAlias, columns: {}};
		const columnIndecies = {};
		const emptyColumns = [];
		const invalid = new Set();
		let   columnName;


		this.builderRows.forEach((row,i) => {

			columnName = this.builderColumns[i].value.trim().split(" ").filter(Boolean).join(" ");

			if(columnName !== "") {
				if(!(columnName in columnIndecies)) columnIndecies[columnName] = new Set();

				query.columns[columnName] = row.querySelector(`input:checked`).value;
				columnIndecies[columnName].add(i);
			}	else emptyColumns.push(i);
		});


		Object.values(columnIndecies).forEach(indecies => {

			if(1 <indecies.size) indecies.forEach(i => invalid.add(i))
		});	emptyColumns.forEach(i => invalid.add(i));


		if(invalid.size) {

			alert(this.localeTitles.ALERT_IMPROPER_COLUMN_NAME);
			invalid.forEach(i => this.builderMarkInvalid(this.builderColumns[i]));
			return
		}	if(!confirm(`${this.localeTitles.CONFIRM_NEW_TABLE} ${newTableAlias}?`)) return;


		fetch(
			"/new-table",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(query)
			})
		.then(response => {

			switch(response.status) {

				case 200:	location.href = "/"; break;
				case 500:	response.json().then(data => alert(data.reason)); break;
				case 403:	alert(this.localeTitles.ALERT_NOT_ALLOWED); break;
				default:	alert(`${this.localeTitles.ALERT_UNHANDLED_STATUS} ${response.status}`); break;
			}})
		.catch(E => alert(E))
	}
	builderModifyTable(event /* Event */) {

		event.preventDefault();


		if(this.builderAlias.value === "") {

			alert(this.localeTitles.ALERT_NO_TABLE_NAME);
			return
		}


		const newTableAlias = this.builderAlias.value.trim().split(" ").filter(Boolean).join(" ");
		const query = {

			name:			this.buildereditMode,
			origin:			this.builderOriginalAlias,
			alias:			newTableAlias,
			delColumns:		[],
			newColumns:		{},
			renamedColumns:	{}
		};
		const columnIndecies = {};
		const emptyColumns = [];
		const invalid = new Set();
		let   originalName;
		let   currentName;


		this.builderRows.forEach((row,i) => {

			originalName = this.builderOriginalColumns[i];
			currentName = this.builderColumns[i].value.trim().split(" ").filter(Boolean).join(" ");

			if(originalName && this.builderColumns[i].disabled) query.delColumns.push(originalName);
			else {

				if(currentName !== "") {

					if(!(currentName in columnIndecies)) columnIndecies[currentName] = new Set();
					if(originalName !== currentName) {

						if(originalName) query.renamedColumns[originalName] = currentName;				// renamed
						else query.newColumns[currentName] = row.querySelector(`input:checked`).value;	// new column
					}
					columnIndecies[currentName].add(i);
				}	else emptyColumns.push(i);
			}
		});


		if(
			this.builderOriginalAlias === newTableAlias &&
			(!query.delColumns.length || query.delColumns.length === this.builderOriginalColumnsCount) &&
			!Object.keys(query.renamedColumns).length &&
			!Object.keys(query.newColumns).length
		) {
			alert(this.localeTitles.ALERT_TABLE_NOT_MODIFIED);
			return
		}


		Object.values(columnIndecies).forEach(indecies => {

			if(1 <indecies.size) indecies.forEach(i => invalid.add(i))
		});	emptyColumns.forEach(i => invalid.add(i));


		if(invalid.size) {

			alert(this.localeTitles.ALERT_IMPROPER_COLUMN_NAME);
			invalid.forEach(i => this.builderMarkInvalid(this.builderColumns[i]));
			return
		}	if(!confirm(`${this.localeTitles.CONFIRM_MODIFY_TABLE} ${this.builderOriginalAlias}?`)) return;


		fetch(
			"/upd-table",
			{
				method: "UPDATE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(query)
			})
		.then(response => {

			switch(response.status) {

				case 202:

					response.json().then(data => alert(`${this.localeTitles.ALERT_PARTIAL_FAIL}: ${data.reason}`));
					location.href = "/";
					break;

				case 200:	location.href = "/"; break;
				case 500:	response.json().then(data => alert(data.reason)); break;
				case 403:	alert(this.localeTitles.ALERT_NOT_ALLOWED); break;
				default:	alert(`${this.localeTitles.ALERT_UNHANDLED_STATUS} ${response.status}`); break;
			}})
		.catch(E => alert(E))
	}
	builderNewColumn(event /* Event */) {

		event.preventDefault();


		const lastRow = this.builderTable.rows[this.builderColumnsCount];
		const newRow = this.builderTable.insertRow(++this.builderColumnsCount);
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


		currentName = inputs[0].name.replace(this.builderColumnRadioNameRegex, this.builderNewRadioName);
		currentId = inputs[0].id.replace(this.builderColumnRadioIdRegex, this.builderNewRadioId);
		typesRadio.className = "builder-input-data";
		radioTextType.value = 0;
		radioTextType.type = "radio";
		radioTextType.name = currentName;
		radioTextType.id = currentId;
		radioTextTypeLabel.htmlFor = currentId;
		radioTextTypeLabel.innerText = labels[0].innerText;
		radioTextType.checked = true;


		currentName = inputs[1].name.replace(this.builderColumnRadioNameRegex, this.builderNewRadioName);
		currentId = inputs[1].id.replace(this.builderColumnRadioIdRegex, this.builderNewRadioId);
		delRow.className = "builder-input-data";
		radioDateType.value = 1;
		radioDateType.type = "radio";
		radioDateType.name = currentName;
		radioDateType.id = currentId;
		radioDateTypeLabel.htmlFor = currentId;
		radioDateTypeLabel.innerText = labels[1].innerText;


		currentName = inputs[2].name.replace(this.builderColumnRadioNameRegex, this.builderNewRadioName);
		currentId = inputs[2].id.replace(this.builderColumnRadioIdRegex, this.builderNewRadioId);
		rowData.className = "builder-input-data";
		radioNumberType.value = 2;
		radioNumberType.type = "radio";
		radioNumberType.name = currentName;
		radioNumberType.id = currentId;
		radioNumberTypeLabel.htmlFor = currentId;
		radioNumberTypeLabel.innerText = labels[2].innerText;


		delButton.classList.add("delete-button");
		delButton.classList.add("table-menu-item");
		delButton.innerText = "X";
		delButton.title = this.localeTitles["ITEM_DELETE_COLUMN_TITLE"];
		delButton.addEventListener("click",event => this.builderDeleteColumn(event));


		rowInput.type = "text";
		rowInput.name = "new-table-row";
		rowInput.className = "table-input";
		rowInput.placeholder = inputs[3].placeholder;


		this.builderColumns.push(rowInput);
		this.builderRows.push(newRow)
	}
	builderDeleteColumn(event /* Event */) {

		event.preventDefault();

		if(1 <this.builderColumnsCount) {

			const targetRow = event.target.parentNode.parentNode;
			this.builderTable.deleteRow(Array.prototype.indexOf.call(this.builderTable.rows, targetRow));
			this.builderColumns.splice(this.builderColumns.indexOf(targetRow.getElementsByClassName("table-input")[0]), 1);
			this.builderRows.splice(this.builderRows.indexOf(targetRow), 1);
			--this.builderColumnsCount
		}
	}
	builderToggleColumn(event /* Event */) {

		event.preventDefault();
		const button = event.target.parentNode.parentNode.getElementsByClassName("table-input")[0];

		if(!button.disabled) {

			button.disabled = true;
			event.target.innerText = "+"

		}	else {

			button.disabled = false;
			event.target.innerText = "X"
		}
	}
	builderClearTableName(event /* Event */) {

		event.preventDefault();
		this.builderAlias.value = ""
	}
	builderNewRadioId = (match, p1, p2) => `row-${p1}-${parseInt(p2)+1}`;
	builderNewRadioName = (match, p1) => `row-${parseInt(p1)+1}-type`;
	builderMarkInvalid = (column) => {

		column.style.backgroundColor = "rgb(255,0,0)";
		(function fader(x) {
			if(x <256) {

				column.style.backgroundColor = `rgb(255,${x},${x})`;
				setTimeout(() => fader(x +15),100)
			}	else column.style.backgroundColor = "rgb(255,255,255)"
		})(1)
	}
	static structureDeleteTable(event /* Event */, tableName /* String */, confirmString, alertString, accessString) {

		event.preventDefault();


		const structureRow = event.target.parentNode.parentNode;
		const tableAlias = structureRow.getElementsByClassName("structure-table-menu-item")[2].innerText.trim();


		if(!confirm(`${confirmString} ${tableAlias}?`)) return;


		fetch(
			`/del-table`,
			{
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ tableName, tableAlias })
			})
		.then(response => {

			switch(response.status) {

				case 200:	location.reload(); break;
				case 500:	response.json().then(data => alert(data.reason)); break;
				case 403:	alert(accessString); break;
				default:	alert(`${alertString} ${response.status}`); break;
			}})
		.catch(E => alert(E))
	}
}







