from	os				import getenv
from	typing			import Dict
from	typing			import Tuple
from	operator		import itemgetter
import	mysql.connector








async def get_structure(rsrc :str, loggy) -> Dict[str,str] :

	"""
		rsrc	- request's ip address as string;
		loggy	- Logger object (logging wrapper).
	"""

	response = dict()

	try:

		dbname = getenv("DB_NAME")
		connection = mysql.connector.connect(

			user=getenv("DB_USER_NAME"),
			password=getenv("DB_USER_PASSWORD"),
			host=getenv("DB_ADDRESS"),
			database=dbname
		)
		session = connection.cursor()
		loggy.debug(f"{dbname} connection established for {rsrc} in get_structure")


		session.execute("SELECT * FROM %s"%getenv("DB_STRUCTURE_TABLE"))
		response = dict(session)


		session.close()
		connection.close()


	except	mysql.connector.Error as E : loggy.error(f"{E.__class__.__name__}: {E}")
	return	response








async def get_table_content(table_name :str, rsrc :str, loggy) -> Tuple[Tuple[str,],Tuple[Tuple[str,],]] :

	"""
		table_name	- requested table name string;
		rsrc		- request's ip address as string;
		loggy		- Logger object (logging wrapper).
	"""

	response = tuple()

	try:

		dbname = getenv("DB_NAME")
		connection = mysql.connector.connect(

			user=getenv("DB_USER_NAME"),
			password=getenv("DB_USER_PASSWORD"),
			host=getenv("DB_ADDRESS"),
			database=dbname
		)
		session = connection.cursor()
		loggy.debug(f"{dbname} connection established for {rsrc} in get_table_content")


		session.execute("SELECT * FROM %s"%table_name)
		columns = list(map(itemgetter(0), session.description))
		rows = list(map(list, session))
		loggy.debug(f"queried {len(rows)} rows for {len(columns)} columns")
		response = columns, rows


		session.close()
		connection.close()


	except	mysql.connector.Error as E : loggy.error(f"{E.__class__.__name__}: {E}")
	return	response








async def create_table():		pass
async def update_table():		pass
async def add_table_row():		pass
async def update_table_row():	pass
async def delete_table_row():	pass
async def add_table_content():	pass








