







class MargaretGrip {

	constructor(tableName /* String */) {

		this.originRow = null;
		this.tableName = tableName;
		this.tableContent = document.getElementsByClassName("table-content")[0];

		this.manageForm = document.getElementsByClassName("manage-form")[0];

		this.columnsCount;
		this.rowsCount;

		// Deafult titles
		this.localTitles = {

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
			ITEM_SORTING_TOGGLE_TITLE: "Sort"
		};
		this.numberTypeKeys = "0123456789";
		this.dateTypeKeys = "-0123456789";

		this.headers = [];
		this.types = [];
		this.rows = [];

		// this.gripTable()
		this.constructHeaders();
		this.constructRows();
		this.formHandler();
	}
	constructHeaders() {

		let   header;
		let   sortButton;
		const headers = [];

		this.columnsCount = 0;

		for(let i = 2; i <this.tableContent.rows[0].cells.length; ++i) {

			header = this.tableContent.rows[0].cells[i];

			// Adding to header haeder name without sorting button
			this.headers.push(header.innerText.trim().slice(0,-1));
			this.types.push(header.className.split("-")[2]);

			header.getElementsByClassName("table-header-sort")[0].addEventListener("click", event => this.sortToggle(event,i -2));

			++this.columnsCount;
		}
	}
	constructRows() {

		let   i;
		let   j;
		let   currentRow;

		this.rowsCount = 0;

		for(i = 1; i <this.tableContent.rows.length; ++i) {

			currentRow = [];
			this.tableContent.rows[i].cells[0].getElementsByClassName("delete-button")[0].addEventListener("click",event => this.deleteRow(event));
			this.tableContent.rows[i].cells[1].getElementsByClassName("update-button")[0].addEventListener("click",event => this.editRow(event));
			for(j = 0; j <this.columnsCount; ++j) currentRow.push(this.tableContent.rows[i].cells[j+2].innerText);

			this.rows.push(currentRow);
			++this.rowsCount

		}
	}
	formHandler() {

		this.manageForm.elements["submit"].addEventListener("click",event => this.addRow(event));
		this.manageForm.elements["cancel"].addEventListener("click",event => this.clearForm(event));
		this.manageForm.elements["update"].addEventListener("click",event => this.updateRow(event));

		this.types.forEach((T,i) => {
			switch(T) {
				case "10": this.manageForm[i].addEventListener("input", event => {

					if(event.inputType === "insertText" && !this.dateTypeKeys.includes(event.data))
						event.target.value = event.target.value.slice(0,-1)
				});	break;

				case "8": this.manageForm[i].addEventListener("input", event => {
					if(event.inputType === "insertText" && !this.numberTypeKeys.includes(event.data))
						event.target.value = event.target.value.slice(0,-1)
				});	break;
			}
		})
	}
	sortToggle(event /* Event */, orderIndex /* Number */, tabName /* String */) {

		const nextState = event.target.innerHTML.trim().charCodeAt(0) ^2;
		const ascending = Boolean(nextState &2);
		const typeCode = this.types[orderIndex];
		let   r1n;
		let   r2n;

		this.rows.sort((r1,r2) => {

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
		let   rowData;

		this.headers.forEach((header,i) => {

			rowData = this.manageForm[i].value || null;
			if(typeof(rowData) === "string") rowData = rowData.trim().split(" ").filter(Boolean).join(" ");
			query[header] = rowData
		});

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

					this.clearForm();

					let   newCell;
					const newRow = this.tableContent.insertRow();

					const delButton = newRow.insertCell().appendChild(document.createElement("button"));
					delButton.className = "delete-button";
					delButton.addEventListener("click",event => this.deleteRow(event));
					delButton.title = this.localTitles.ITEM_DELETE_ROW_TITLE;
					delButton.innerText = "X";

					const updButton = newRow.insertCell().appendChild(document.createElement("button"));
					updButton.className = "update-button-button";
					updButton.addEventListener("click",event => this.editRow(event));
					updButton.title = this.localTitles.ITEM_EDIT_ROW_TITLE;
					updButton.innerText = "»";

					this.rows.unshift(this.headers.map(header => {

						newCell = newRow.insertCell();
						newCell.appendChild(document.createTextNode(""));
						newCell.className = "table-content-data";

						return query[header] || ""
					}));

					this.updateTable();
					break;

				case 500:	response.json().then(data => alert(data.reason)); break;
				default:	alert(`Unhandled status ${response.status}`);
			}

		}).catch(E => alert(E))
	}
	deleteRow(event /* Event */) {

		event.preventDefault();

		const currentRow = event.target.parentNode.parentNode;
		const rowToDelete = Array.prototype.slice.call(currentRow.cells,2);
		const viewRow = [];
		const query = {};

		this.headers.forEach((header,i) => {

			query[header] = rowToDelete[i].innerText || null;
			viewRow.push(rowToDelete[i].innerText)
		});
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

					const viewRowToDelete = this.findRow(viewRow)

					if(viewRowToDelete === -1) alert("Failed to update view, reload page")
					else {

						this.tableContent.deleteRow(Array.prototype.indexOf.call(this.tableContent.rows,currentRow));
						this.rows.splice(this.findRow(viewRow),1);
						this.updateTable();
					}	break;

				case 500:	response.json().then(data => alert(data.reason)); break;
				default:	alert(`Unhandled status ${response.status}`);
			}

		}).catch(E => alert(E))
	}
	editRow(event /* Event */) {

		event.preventDefault();
		this.originRow = event.target.parentNode.parentNode;
		this.headers.forEach((_,i) => this.manageForm[i].value = this.originRow.cells[i+2].innerText);
	}
	updateRow(event /* Event */) {

		event.preventDefault();
		if(this.originRow) {

			const viewRow = [];
			const query = { origin: {}, update: {}};
			let   current;

			this.headers.forEach((header,i) => {

				query.update[header] = this.manageForm[i].value || null;
				query.origin[header] = this.originRow.cells[i+2].innerText || null;
				viewRow.push(this.originRow.cells[i+2].innerText)
			});
			if(Object.keys(query.origin).reduce((A,k) => A + (query.origin[k] === query.update[k] ? 1 : 0),0) === this.columnsCount) {

				alert("Update with the same content not allowed!");
				return
			}
			if(!confirm(`Commit ${JSON.stringify(query)} update in ${this.tableName}?`)) return;

			fetch(
				`/upd-row-${this.tableName}`,
				{
					method: "UPDATE",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(query)
				}
			).then(response => {

				switch(response.status) {

					case 200:

						const tableIndex = Array.prototype.indexOf.call(this.tableContent.rows,this.originRow);
						const viewIndex = this.findRow(viewRow);
						let   current;

						this.headers.forEach((_,i) => {

							current = this.manageForm[i].value;
							this.tableContent.rows[tableIndex].cells[i+2].innerText = current;
							this.rows[viewIndex][i] = current
						});
						this.clearForm();
						this.updateTable();
						break;

					case 500:	response.json().then(data => alert(data.reason)); break;
					default:	alert(`Unhandled status ${response.status}`);
				}	this.originRow = null

			}).catch(E => alert(E))
		}
	}
	findRow(content /* [ String, ] */) {

		let i;
		let j;

		outer: for(i = 0; i <this.rowsCount; ++i) {
			for(j = 0; j <this.columnsCount; ++j)

				if(this.rows[i][j] !== content[j]) continue outer;

			return  i
		}	return -1
	}
	clearForm(event /* Event */) {

		if(event) event.preventDefault();
		this.headers.forEach((_,i) => this.manageForm[i].value = "");
	}
}







