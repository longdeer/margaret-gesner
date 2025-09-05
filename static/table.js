







class MargaretGrip {

	constructor(tableName /* String */) {

		this.originRow = null;
		this.tableName = tableName;
		this.tableContent = document.getElementsByClassName("table-content")[0];

		this.manageForm = document.getElementsByClassName("manage-form")[0];
		this.manageForm.elements["submit"].addEventListener("click",event => this.addRow(event));
		this.manageForm.elements["cancel"].addEventListener("click",event => this.clearForm(event));
		this.manageForm.elements["update"].addEventListener("click",event => this.updateRow(event));

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
			this.tableContent.rows[i].cells[1].getElementsByClassName("update-button")[0].addEventListener("click",event => this.editRow(event));
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

		this.headers.forEach((header,i) => query[header] = this.manageForm[i].value || null);
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

					this.headers.forEach((_,i) => this.manageForm[i].value = "");

					let   newCell;
					const newRow = this.tableContent.insertRow();

					const delButton = newRow.insertCell().appendChild(document.createElement("button"));
					delButton.className = "delete-button";
					delButton.addEventListener("click",event => this.deleteRow(event));
					delButton.innerText = "X";

					const updButton = newRow.insertCell().appendChild(document.createElement("button"));
					updButton.className = "update-button-button";
					updButton.addEventListener("click",event => this.editRow(event));
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

					this.tableContent.deleteRow(Array.prototype.indexOf.call(this.tableContent.rows,currentRow));
					this.rows.splice(this.findRow(viewRow),1);
					this.updateTable();
					break;

				case 500:	response.json().then(data => alert(data.reason)); break;
				default:	break;
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
					default:	break;
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
		}		return -1
	}
	clearForm(event /* Event */) {

		if(event) event.preventDefault();
		this.headers.forEach((_,i) => this.manageForm[i].value = "");
	}
}







