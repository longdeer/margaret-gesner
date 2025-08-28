from os					import getenv
from ops				import in_access_list
from modules.logger		import Logger
from modules.connector	import get_structure
from modules.connector	import get_table_content
from flask				import Flask
from flask				import request
from flask				import render_template
from dotenv				import load_dotenv








load_dotenv()
app = Flask(getenv("APP_NAME"))
loggy = Logger(getenv("LOGGY_FILE"), getenv("APP_NAME"), getenv("LOGGY_LEVEL"))








@app.route("/")
async def index():

	if	in_access_list((rsrc := request.remote_addr), loggy):

		tables = await get_structure(rsrc, loggy)
		names = sorted(tables)
		aliases = [ tables[name] for name in names ]

		return render_template("index.html", names=names, aliases=aliases, rsrc=rsrc)
	return render_template("restricted.html")




@app.route("/table-<name>")
async def table(name :str) -> str :

	if	in_access_list((rsrc := request.remote_addr), loggy):

		# content will have structure:
		# ( column names ),(( row1_col1, row1_col2, ... ),( row2_col1, row2_col2, ... ), ... )
		content = await get_table_content(name, rsrc, loggy)

		return render_template("table.html", name=name, content=content)
	return render_template("restricted.html")








if	__name__ == "__main__" : app.run(host=getenv("LISTEN_ADDRESS"), port=getenv("LISTEN_PORT"), debug=True)







