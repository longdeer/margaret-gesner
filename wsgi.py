import	json
from	os					import getenv
from	ops					import in_access_list
from	ops					import serialize_alias
from	ops					import deserialize_alias
from	modules.logger		import Logger
from	modules.connector	import get_structure
from	modules.connector	import get_table_content
from	modules.connector	import add_table_row
from	modules.connector	import delete_table_row
from	modules.connector	import update_table_row
from	flask				import Flask
from	flask				import request
from	flask				import render_template
from	dotenv				import load_dotenv








load_dotenv()
app = Flask(

	getenv("APP_NAME"),
	static_folder=getenv("APP_STATIC_FOLDER"),
	template_folder=getenv("APP_TEMPLATES_FOLDER")
)
loggy = Logger(getenv("LOGGY_FILE"), getenv("APP_NAME"), getenv("LOGGY_LEVEL"))








@app.route("/")
async def index():

	if	in_access_list((rsrc := request.remote_addr), loggy):

		tables = await get_structure(rsrc, loggy)
		names = sorted(tables)
		aliases = [ tables[name] for name in names ]
		serials = list(map(serialize_alias,aliases))

		return render_template("index.html", names=names, aliases=aliases, serials=serials, rsrc=rsrc)
	return render_template("restricted.html")




@app.route("/table-<name>-<serial>")
async def table(name :str, serial :str) -> str :

	if	in_access_list((rsrc := request.remote_addr), loggy):

		# content will have structure:
		# ( column names ),(( row1_col1, row1_col2, ... ),( row2_col1, row2_col2, ... ), ... )
		content = await get_table_content(name, rsrc, loggy)
		alias = deserialize_alias(serial)

		return render_template("table.html", name=name, alias=alias, content=content)
	return render_template("restricted.html")




@app.route("/add-row-<name>", methods=[ "POST" ])
async def add_row(name :str) -> str :

	if	in_access_list((rsrc := request.remote_addr), loggy):

		match (db_response := await add_table_row(name, request.get_json(), rsrc, loggy)):

			case None:	return json.dumps({ "success": True }), 200, { "ContentType": "application/json" }
			case _:		return json.dumps({ "success": False, "reason": db_response }), 500, { "ContentType": "application/json" }

	return	json.dumps({ "success": False }), 403, { "ContentType": "application/json" }




@app.route("/del-row-<name>", methods=[ "DELETE" ])
async def del_row(name :str) -> str :

	if	in_access_list((rsrc := request.remote_addr), loggy):

		match (db_response := await delete_table_row(name, request.get_json(), rsrc, loggy)):

			case None:	return json.dumps({ "success": True }), 200, { "ContentType": "application/json" }
			case _:		return json.dumps({ "success": False, "reason": db_response }), 500, { "ContentType": "application/json" }

	return	json.dumps({ "success": False }), 403, { "ContentType": "application/json" }




@app.route("/upd-row-<name>", methods=[ "UPDATE" ])
async def upd_row(name :str) -> str :

	if	in_access_list((rsrc := request.remote_addr), loggy):

		match (db_response := await update_table_row(name, request.get_json(), rsrc, loggy)):

			case None:	return json.dumps({ "success": True }), 200, { "ContentType": "application/json" }
			case _:		return json.dumps({ "success": False, "reason": db_response }), 500, { "ContentType": "application/json" }

	return	json.dumps({ "success": False }), 403, { "ContentType": "application/json" }








if	__name__ == "__main__" : app.run(host=getenv("LISTEN_ADDRESS"), port=getenv("LISTEN_PORT"), debug=True)







