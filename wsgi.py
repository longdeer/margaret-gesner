import	json
from	os					import getenv
from	ops					import in_access_list
from	ops					import serialize_alias
from	ops					import deserialize_alias
from	modules.logger		import Logger
from	modules.connector	import get_structure
from	modules.connector	import get_table_structure
from	modules.connector	import get_table_content
from	modules.connector	import create_table
from	modules.connector	import update_table
from	modules.connector	import delete_table
from	modules.connector	import add_table_row
from	modules.connector	import delete_table_row
from	modules.connector	import update_table_row
from	flask				import Flask
from	flask				import request
from	flask				import render_template
from	dotenv				import load_dotenv








load_dotenv()
APP_NAME = getenv("APP_NAME")
app = Flask(

	APP_NAME,
	static_folder=getenv("APP_STATIC_FOLDER"),
	template_folder=getenv("APP_TEMPLATES_FOLDER")
)
loggy = Logger(getenv("LOGGY_FILE"), getenv("APP_NAME"), getenv("LOGGY_LEVEL"))








@app.route("/locale-titles")
def get_locale_titles() -> str :

	if	in_access_list((rsrc := request.remote_addr), "/locale-titles", "DB_ACCESS_LIST", loggy):
		return json.dumps({

			"ITEM_DELETE_TITLE": getenv("ITEM_DELETE_TITLE"),
			"ITEM_EDIT_TITLE": getenv("ITEM_EDIT_TITLE"),
			"ITEM_NEW_TABLE_TITLE": getenv("ITEM_NEW_TABLE_TITLE"),
			"ITEM_OPEN_TABLE_TITLE": getenv("ITEM_OPEN_TABLE_TITLE"),
			"ITEM_BACK_TO_STRUCTURE_TITLE": getenv("ITEM_BACK_TO_STRUCTURE_TITLE"),
			"ITEM_SUBMIT_NEW_ROW_TITLE": getenv("ITEM_SUBMIT_NEW_ROW_TITLE"),
			"ITEM_CANCEL_EDIT_TITLE": getenv("ITEM_CANCEL_EDIT_TITLE"),
			"ITEM_SUBMIT_ROW_UPDATE_TITLE": getenv("ITEM_SUBMIT_ROW_UPDATE_TITLE"),
			"ITEM_DELETE_ROW_TITLE": getenv("ITEM_DELETE_ROW_TITLE"),
			"ITEM_EDIT_ROW_TITLE": getenv("ITEM_EDIT_ROW_TITLE"),
			"ITEM_DELETE_COLUMN_TITLE": getenv("ITEM_DELETE_COLUMN_TITLE"),
			"ITEM_NEW_TABLE_COLUMN_TITLE": getenv("ITEM_NEW_TABLE_COLUMN_TITLE"),
			"ITEM_SUBMIT_NEW_TABLE_TITLE": getenv("ITEM_SUBMIT_NEW_TABLE_TITLE"),
			"ITEM_SORTING_TOGGLE_TITLE": getenv("ITEM_SORTING_TOGGLE_TITLE"),
			"ALERT_UNHANDLED_STATUS": getenv("ALERT_UNHANDLED_STATUS"),
			"ALERT_RELOAD_TO_VIEW": getenv("ALERT_RELOAD_TO_VIEW"),
			"ALERT_SAME_CONTENT_UPDATE": getenv("ALERT_SAME_CONTENT_UPDATE"),
			"ALERT_NO_TABLE_NAME": getenv("ALERT_NO_TABLE_NAME"),
			"ALERT_NO_COLUMN_NAME": getenv("ALERT_NO_COLUMN_NAME"),
			"ALERT_IMPROPER_COLUMN_NAME": getenv("ALERT_IMPROPER_COLUMN_NAME"),
			"ALERT_TABLE_NOT_MODFIED": getenv("ALERT_TABLE_NOT_MODFIED"),
			"ALERT_NOT_ALLOWED": getenv("ALERT_NOT_ALLOWED"),
			"CONFIRM_TABLE_NEW_ROW": getenv("CONFIRM_TABLE_NEW_ROW"),
			"CONFIRM_TABLE_DELETE_ROW": getenv("CONFIRM_TABLE_DELETE_ROW"),
			"CONFIRM_TABLE_UPDATE_ROW": getenv("CONFIRM_TABLE_UPDATE_ROW"),
			"CONFIRM_NEW_TABLE": getenv("CONFIRM_NEW_TABLE"),
			"CONFIRM_DELETE_TABLE": getenv("CONFIRM_DELETE_TABLE"),
			"CONFIRM_MODIFY_TABLE": getenv("CONFIRM_MODIFY_TABLE")
		})
	return	render_template("restricted.html", title=getenv("ITEM_ERROR_TITLE"), text=getenv("ERROR_ACCESS_DENIED"))




@app.route("/")
async def index() -> str :

	if	in_access_list((rsrc := request.remote_addr), "/", "DB_ACCESS_LIST", loggy):

		tables = await get_structure(rsrc, loggy)
		names = sorted(tables)
		aliases = [ tables[name] for name in names ]
		serials = list(map(serialize_alias,aliases))

		return render_template(

			"index.html",
			names=names,
			aliases=aliases,
			serials=serials,
			rsrc=rsrc,
			TOOLTIP_INDEX_LIST=json.loads(getenv("TOOLTIP_INDEX_LIST","[]")),
			ITEM_INDEX_PAGE_TITLE=getenv("ITEM_INDEX_PAGE_TITLE"),
			ITEM_DELETE_TITLE=getenv("ITEM_DELETE_TITLE"),
			ITEM_EDIT_TITLE=getenv("ITEM_EDIT_TITLE"),
			ITEM_NEW_TABLE_TITLE=getenv("ITEM_NEW_TABLE_TITLE"),
			ITEM_OPEN_TABLE_TITLE=getenv("ITEM_OPEN_TABLE_TITLE"),
			CONFIRM_DELETE_TABLE=getenv("CONFIRM_DELETE_TABLE"),
			ALERT_UNHANDLED_STATUS=getenv("ALERT_UNHANDLED_STATUS"),
			ALERT_NOT_ALLOWED=getenv("ALERT_NOT_ALLOWED")
		)
	return	render_template("restricted.html", title=getenv("ITEM_ERROR_TITLE"), text=getenv("ERROR_ACCESS_DENIED"))




@app.route("/table-builder")
def table_builder() -> str :

	if	in_access_list((rsrc := request.remote_addr), "/table-builder", "DB_BUILDER_LIST", loggy):
		return render_template(

			"builder.html",
			TOOLTIP_BUILDER_LIST=json.loads(getenv("TOOLTIP_BUILDER_LIST","[]")),
			NEW_TABLE_ALIAS=getenv("NEW_TABLE_ALIAS"),
			RADIO_TEXT=getenv("RADIO_TEXT"),
			RADIO_DATE=getenv("RADIO_DATE"),
			RADIO_NUMBER=getenv("RADIO_NUMBER"),
			ITEM_BUILDER_PAGE_TITLE=getenv("ITEM_BUILDER_PAGE_TITLE"),
			ITEM_ROW_PLACEHOLDER=getenv("ITEM_ROW_PLACEHOLDER"),
			ITEM_BACK_TO_STRUCTURE_TITLE=getenv("ITEM_BACK_TO_STRUCTURE_TITLE"),
			ITEM_CANCEL_EDIT_TITLE=getenv("ITEM_CANCEL_EDIT_TITLE"),
			ITEM_DELETE_COLUMN_TITLE=getenv("ITEM_DELETE_COLUMN_TITLE"),
			ITEM_NEW_TABLE_COLUMN_TITLE=getenv("ITEM_NEW_TABLE_COLUMN_TITLE"),
			ITEM_SUBMIT_NEW_TABLE_TITLE=getenv("ITEM_SUBMIT_NEW_TABLE_TITLE")
		)
	return	render_template("restricted.html", title=getenv("ITEM_ERROR_TITLE"), text=getenv("ERROR_ACCESS_DENIED"))




@app.route("/edit-<name>-<serial>")
async def table_editor(name :str, serial :str) -> str :

	if	in_access_list((rsrc := request.remote_addr), f"/edit-{name}-{serial}", "DB_EDITOR_LIST", loggy):

		content = await get_table_structure(name, rsrc, loggy)
		alias = deserialize_alias(serial)

		return render_template(

			"editor.html",
			name=name,
			alias=alias,
			content=content,
			TOOLTIP_EDITOR_LIST=json.loads(getenv("TOOLTIP_EDITOR_LIST","[]")),
			NEW_TABLE_ALIAS=getenv("NEW_TABLE_ALIAS"),
			RADIO_TEXT=getenv("RADIO_TEXT"),
			RADIO_DATE=getenv("RADIO_DATE"),
			RADIO_NUMBER=getenv("RADIO_NUMBER"),
			ITEM_EDITOR_PAGE_TITLE=getenv("ITEM_EDITOR_PAGE_TITLE"),
			ITEM_ROW_PLACEHOLDER=getenv("ITEM_ROW_PLACEHOLDER"),
			ITEM_BACK_TO_STRUCTURE_TITLE=getenv("ITEM_BACK_TO_STRUCTURE_TITLE"),
			ITEM_CANCEL_EDIT_TITLE=getenv("ITEM_CANCEL_EDIT_TITLE"),
			ITEM_DELETE_COLUMN_TITLE=getenv("ITEM_DELETE_COLUMN_TITLE"),
			ITEM_NEW_TABLE_COLUMN_TITLE=getenv("ITEM_NEW_TABLE_COLUMN_TITLE"),
			ITEM_SUBMIT_NEW_TABLE_TITLE=getenv("ITEM_SUBMIT_NEW_TABLE_TITLE")
		)
	return	render_template("restricted.html", title=getenv("ITEM_ERROR_TITLE"), text=getenv("ERROR_ACCESS_DENIED"))




@app.route("/table-<name>-<serial>")
async def table(name :str, serial :str) -> str :

	if	in_access_list((rsrc := request.remote_addr), f"/table-{name}-{serial}", "DB_TABLE_ACCESS_LIST", loggy):

		alias = deserialize_alias(serial)
		# content will have structure:
		# [
		# 	[ column names ],
		# 	[ col1_type, col2_type, ... ],
		# 	[
		# 		[ row1_col1, row1_col2, ... ],
		# 		[ row2_col1, row2_col2, ... ],
		# 		...
		# 	]
		# ]
		content = await get_table_content(name, alias, rsrc, loggy)

		return render_template(

			"table.html",
			name=name,
			alias=alias,
			content=content,
			TOOLTIP_TABLE_LIST=json.loads(getenv("TOOLTIP_TABLE_LIST","[]")),
			ITEM_DATE_TYPE_PLACEHOLDER=getenv("ITEM_DATE_TYPE_PLACEHOLDER"),
			ITEM_BACK_TO_STRUCTURE_TITLE=getenv("ITEM_BACK_TO_STRUCTURE_TITLE"),
			ITEM_SUBMIT_NEW_ROW_TITLE=getenv("ITEM_SUBMIT_NEW_ROW_TITLE"),
			ITEM_CANCEL_EDIT_TITLE=getenv("ITEM_CANCEL_EDIT_TITLE"),
			ITEM_SUBMIT_ROW_UPDATE_TITLE=getenv("ITEM_SUBMIT_ROW_UPDATE_TITLE"),
			ITEM_DELETE_ROW_TITLE=getenv("ITEM_DELETE_ROW_TITLE"),
			ITEM_EDIT_ROW_TITLE=getenv("ITEM_EDIT_ROW_TITLE"),
			ITEM_SORTING_TOGGLE_TITLE=getenv("ITEM_SORTING_TOGGLE_TITLE")
		)
	return	render_template("restricted.html", title=getenv("ITEM_ERROR_TITLE"), text=getenv("ERROR_ACCESS_DENIED"))




@app.route("/new-table", methods=[ "POST" ])
async def new_table() -> str :

	if	in_access_list((rsrc := request.remote_addr), "/new-table", "DB_BUILDER_POST_LIST", loggy):

		match (db_response := await create_table(request.get_json(), rsrc, loggy)):

			case None:	return json.dumps({ "success": True }), 200, { "ContentType": "application/json" }
			case _:		return json.dumps({ "success": False, "reason": db_response }), 500, { "ContentType": "application/json" }

	return	json.dumps({ "success": False }), 403, { "ContentType": "application/json" }




@app.route("/upd-table", methods=[ "UPDATE" ])
async def upd_table() -> str :

	if	in_access_list((rsrc := request.remote_addr), "/upd-table", "DB_BUILDER_UPDATE_LIST", loggy):

		match (db_response := await update_table(request.get_json(), rsrc, loggy)):

			case None:	return json.dumps({ "success": True }), 200, { "ContentType": "application/json" }
			case _:		return json.dumps({ "success": False, "reason": db_response }), 500, { "ContentType": "application/json" }

	return	json.dumps({ "success": False }), 403, { "ContentType": "application/json" }




@app.route("/del-table", methods=[ "DELETE" ])
async def del_table() -> str :

	if	in_access_list((rsrc := request.remote_addr), "/del-table", "DB_BUILDER_DELETE_LIST", loggy):

		match (db_response := await delete_table(request.get_json(), rsrc, loggy)):

			case None:	return json.dumps({ "success": True }), 200, { "ContentType": "application/json" }
			case _:		return json.dumps({ "success": False, "reason": db_response }), 500, { "ContentType": "application/json" }

	return	json.dumps({ "success": False }), 403, { "ContentType": "application/json" }




@app.route("/add-row-<name>", methods=[ "POST" ])
async def add_row(name :str) -> str :

	if	in_access_list((rsrc := request.remote_addr), f"/add-row-{name}", "DB_TABLE_POST_LIST", loggy):

		match (db_response := await add_table_row(name, request.get_json(), rsrc, loggy)):

			case None:	return json.dumps({ "success": True }), 200, { "ContentType": "application/json" }
			case _:		return json.dumps({ "success": False, "reason": db_response }), 500, { "ContentType": "application/json" }

	return	json.dumps({ "success": False }), 403, { "ContentType": "application/json" }




@app.route("/upd-row-<name>", methods=[ "UPDATE" ])
async def upd_row(name :str) -> str :

	if	in_access_list((rsrc := request.remote_addr), f"/upd-row-{name}", "DB_TABLE_UPDATE_LIST", loggy):

		match (db_response := await update_table_row(name, request.get_json(), rsrc, loggy)):

			case None:	return json.dumps({ "success": True }), 200, { "ContentType": "application/json" }
			case _:		return json.dumps({ "success": False, "reason": db_response }), 500, { "ContentType": "application/json" }

	return	json.dumps({ "success": False }), 403, { "ContentType": "application/json" }




@app.route("/del-row-<name>", methods=[ "DELETE" ])
async def del_row(name :str) -> str :

	if	in_access_list((rsrc := request.remote_addr), f"/del-row-{name}", "DB_TABLE_DELETE_LIST", loggy):

		match (db_response := await delete_table_row(name, request.get_json(), rsrc, loggy)):

			case None:	return json.dumps({ "success": True }), 200, { "ContentType": "application/json" }
			case _:		return json.dumps({ "success": False, "reason": db_response }), 500, { "ContentType": "application/json" }

	return	json.dumps({ "success": False }), 403, { "ContentType": "application/json" }








if	__name__ == "__main__":


	loggy.info(f"Starting {APP_NAME}")
	app.run(host=getenv("LISTEN_ADDRESS"), port=getenv("LISTEN_PORT"))







