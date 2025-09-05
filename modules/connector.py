import	json
from	typing			import Dict
from	typing			import Tuple
from	operator		import itemgetter
from	os				import getenv
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








async def add_table_row(table_name :str, content :str, rsrc :str, loggy) -> None | str :

	try:

		columns = list()
		data = list()

		for k,v in content.items():
			if	v is not None:

				columns.append(k)
				data.append(f"'{v}'")


		if	not columns or not data or len(columns) != len(data):
			raise ValueError("Empty or inconsistent table data")


		columns = ",".join(columns)
		data = ",".join(data)


		dbname = getenv("DB_NAME")
		connection = mysql.connector.connect(

			user=getenv("DB_USER_NAME"),
			password=getenv("DB_USER_PASSWORD"),
			host=getenv("DB_ADDRESS"),
			database=dbname
		)
		session = connection.cursor()
		loggy.debug(f"{dbname} connection established for {rsrc} in add_table_row")


		dbquery = "INSERT IGNORE INTO %s (%s) VALUES (%s)"%(table_name, columns, data)
		loggy.debug(f"{rsrc} query: {dbquery}")


		session.execute(dbquery)
		loggy.info(f"{rsrc} inserted into {table_name} ({columns}) - ({data})")


		connection.commit()
		session.close()
		connection.close()


	except	Exception as E:

		response = f"{E.__class__.__name__}: {E}"
		loggy.error(response)
		return response








async def delete_table_row(table_name :str, content :str, rsrc :str, loggy):

	try:

		columns = list()
		data = list()

		for k,v in content.items():
			if	v is not None:

				columns.append(k)
				data.append(f"'{v}'")


		if	not columns or not data or len(columns) != len(data):
			raise ValueError("Empty or inconsistent table data")


		condition = " AND ".join( f"{c}={d}" for c,d in zip(columns, data) )


		dbname = getenv("DB_NAME")
		connection = mysql.connector.connect(

			user=getenv("DB_USER_NAME"),
			password=getenv("DB_USER_PASSWORD"),
			host=getenv("DB_ADDRESS"),
			database=dbname
		)
		session = connection.cursor()
		loggy.debug(f"{dbname} connection established for {rsrc} in delete_table_row")


		# As there might be duplicate rows in DB,
		# setting LIMIT 1 to only delete the single row
		dbquery = "DELETE FROM %s WHERE %s LIMIT 1"%(table_name, condition)
		loggy.debug(f"{rsrc} query: {dbquery}")


		session.execute(dbquery)
		loggy.info(f"{rsrc} deleted from {table_name} row where {condition}")


		connection.commit()
		session.close()
		connection.close()


	except	Exception as E:

		response = f"{E.__class__.__name__}: {E}"
		loggy.error(response)
		return response








async def update_table_row(table_name :str, content :str, rsrc :str, loggy):

	try:

		origin_columns = list()
		update_columns = list()
		origin_data = list()
		update_data = list()

		for k,v in content["origin"].items():

			origin_columns.append(k)
			origin_data.append(f"='{v}'" if v is not None else " IS NULL")

		for k,v in content["update"].items():

			update_columns.append(k)
			update_data.append(f"'{v}'" if v is not None else "NULL")


		if(
			not origin_columns or not origin_data or
			not update_columns or not update_data or
			len(origin_columns) != len(update_columns) or
			len(origin_data) != len(update_data) or
			all( data == "NULL" for data in update_data )

		):	raise ValueError("Empty or inconsistent table data")


		setter = ",".join( f"{c}={d}" for c,d in zip(update_columns, update_data) )
		condition = " AND ".join( f"{c}{d}" for c,d in zip(origin_columns, origin_data) )


		dbname = getenv("DB_NAME")
		connection = mysql.connector.connect(

			user=getenv("DB_USER_NAME"),
			password=getenv("DB_USER_PASSWORD"),
			host=getenv("DB_ADDRESS"),
			database=dbname
		)
		session = connection.cursor()
		loggy.debug(f"{dbname} connection established for {rsrc} in update_table_row")


		# As there might be duplicate rows in DB,
		# setting LIMIT 1 to only update the single row
		dbquery = "UPDATE %s SET %s WHERE %s LIMIT 1"%(table_name, setter, condition)
		loggy.debug(f"{rsrc} query: {dbquery}")


		session.execute(dbquery)
		loggy.info(f"{rsrc} updated {table_name} with {setter}")


		connection.commit()
		session.close()
		connection.close()


	except	Exception as E:

		response = f"{E.__class__.__name__}: {E}"
		loggy.error(response)
		return response








async def add_table_content():	pass








