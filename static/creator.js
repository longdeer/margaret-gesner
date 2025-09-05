







class MargaretGrip {

	constructor() {

		this.creatorTable = document.getElementsByClassName("creator-table")[0];
		// console.log(this.creatorTable);

		this.tableName = this.creatorTable.rows[0];
		this.tableName.getElementsByClassName("clear-button")[0].addEventListener("click", event => this.clearInput(event));
		// this.tafsdfdf = this.tableName.getElementsByClassName("table-input")[0]
		// console.log(this.tableName);

		this.rows = [];
		Array.prototype.slice.call(this.creatorTable.rows,1,-1).forEach(row => {

			row.getElementsByClassName("delete-button")[0].addEventListener("click", event => this.deleteRow(event));
			this.rows.push(row)
		});
		// Array.prototype.forEach.call(this.rows,row => {
			// row.getElementsByClassName("clear-button")[0].addEventListener("click", event => this.clearInput(event, row));
		// })
		// console.log(this.rows);
	}
	constructName() {
	}
	constructRows() {
	}
	updateTable() {
	}
	addRow(event /* Event */) {
	}
	deleteRow(event /* Event */) {

		event.preventDefault();
		console.log(event.target.parentNode.parentNode)
	}
	findRow(content /* [ String, ] */) {
	}
	clearInput(event /* Event */) {

		event.preventDefault();
		console.log(event.target.parentNode.parentNode)
		event.target.parentNode.parentNode.getElementsByClassName("table-input")[0].value = ""
	}
}







