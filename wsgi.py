from os				import getenv
from ops			import in_access_list
from modules.logger	import Logger
from flask			import Flask
from flask			import request
from flask			import render_template
from dotenv			import load_dotenv








load_dotenv()
app = Flask(getenv("APP_NAME"))
loggy = Logger(getenv("LOGGY_FILE"), getenv("APP_NAME"), getenv("LOGGY_LEVEL"))








@app.route("/")
def index():

	if	in_access_list(request.remote_addr, loggy):
		return render_template("index.html")
	return render_template("restricted.html")








if	__name__ == "__main__" : app.run(host=getenv("LISTEN_ADDRESS"), port=getenv("LISTEN_PORT"))







