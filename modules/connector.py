import	json
from	typing			import Dict
from	typing			import List
from	operator		import itemgetter
from	datetime		import datetime
from	os				import getenv
from	ops				import sanityze_query
import	mysql.connector








# The following data types and corresponding type codes are implemented:
# 253	- VARCHAR(255);
# 10	- DATE;
# 8		- BIGINT.
COLUMN_TYPE = [ "VARCHAR(255)", "DATE", "BIGINT" ]








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


		dbquery = "SELECT * FROM %s"%getenv("DB_STRUCTURE_TABLE")
		loggy.debug(f"{rsrc} query: {dbquery}")


		session.execute(dbquery)
		loggy.info(f"{rsrc} successfully quried structure table")


		response = dict(session)
		session.close()
		connection.close()


	except	Exception as E : loggy.error(f"get_structure {E.__class__.__name__}: {E}")
	return	response








async def get_table_structure(table_name :str, rsrc :str, loggy) -> List[[str,int],] :

	"""
		table_name	- requested table name string;
		rsrc		- request's ip address as string;
		loggy		- Logger object (logging wrapper).
	"""

	response = list()

	try:

		dbname = getenv("DB_NAME")
		connection = mysql.connector.connect(

			user=getenv("DB_USER_NAME"),
			password=getenv("DB_USER_PASSWORD"),
			host=getenv("DB_ADDRESS"),
			database=dbname
		)
		session = connection.cursor()
		loggy.debug(f"{dbname} connection established for {rsrc} in get_table_structure")


		dbquery = sanityze_query(
			"""

				SELECT COLUMN_NAME,DATA_TYPE FROM INFORMATION_SCHEMA.columns
				WHERE TABLE_SCHEMA = '%s' AND TABLE_NAME = '%s'

			"""%(dbname, table_name)
		)
		loggy.debug(f"{rsrc} query: {dbquery}")


		session.execute(dbquery)
		response = [[ k,[ T.startswith(v.upper()) for T in COLUMN_TYPE ].index(True) ] for k,v in session ]
		loggy.info(f"{rsrc} query result {response}")


		session.close()
		connection.close()


	except	Exception as E : loggy.error(f"get_table_structure {E.__class__.__name__}: {E}")
	return	response








async def get_table_content(table_name :str, table_alias: str, rsrc :str, loggy) -> List[List[str|int],] :

	"""
		table_name	- requested table name string;
		table_alias	- requested table alias string;
		rsrc		- request's ip address as string;
		loggy		- Logger object (logging wrapper).
	"""

	response = list()

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


		dbquery = "SELECT * FROM %s"%table_name
		loggy.debug(f"{rsrc} query: {dbquery}")
		session.execute(dbquery)


		rows = list(map(list, session))
		type_codes = list()
		columns = list()


		for name,T,*_ in session.description:

			columns.append(name)
			type_codes.append(T)


		loggy.info(f"{rsrc} query result {len(rows)} rows for {len(columns)} columns")
		response = columns, type_codes, rows


		session.close()
		connection.close()


	except	Exception as E : loggy.error(f"get_table_content {E.__class__.__name__}: {E}")
	return	response








async def create_table(content :Dict[str,str | Dict[str,str]], rsrc :str, loggy) -> None | str :

	"""
		content	- parsed json data for making a db request;
		rsrc	- request's ip address as string;
		loggy	- Logger object (logging wrapper).
	"""

	try:

		column_names = list()
		column_types = list()
		table_alias = f"""'{content["table"]}'"""


		for k,v in content["columns"].items():

			# TODO: consider better column names sanitize
			column_names.append(k.replace("-","_").replace(" ","_"))
			column_types.append(COLUMN_TYPE[int(v)])


		if	not column_names or not column_types or len(column_names) != len(column_types):
			raise ValueError(getenv("ERROR_TABLE_DATA","Empty or inconsistent table data"))


		table_name = f"TABLE{datetime.now().timestamp()}".replace(".","D")
		columns = ",".join( f"{name} {T}" for name,T in zip(column_names, column_types))


		dbname = getenv("DB_NAME")
		dbstructure = getenv("DB_STRUCTURE_TABLE")
		connection = mysql.connector.connect(

			user=getenv("DB_USER_NAME"),
			password=getenv("DB_USER_PASSWORD"),
			host=getenv("DB_ADDRESS"),
			database=dbname
		)
		session = connection.cursor()
		loggy.debug(f"{dbname} connection established for {rsrc} in create_table")


		dbquery1 = "CREATE TABLE %s (%s)"%(table_name, columns)
		dbquery2 = "INSERT INTO %s (name,alias) VALUES ('%s',%s)"%(dbstructure, table_name, table_alias)


		loggy.debug(f"{rsrc} query1: {dbquery1}")
		session.execute(dbquery1)
		loggy.info(f"{rsrc} created {table_name} ({columns})")


		loggy.debug(f"{rsrc} query2: {dbquery2}")
		session.execute(dbquery2)
		loggy.info(f"{rsrc} updated {dbstructure} with ('{table_name}',{table_alias})")


		connection.commit()
		session.close()
		connection.close()


	except	Exception as E:

		response = f"{E.__class__.__name__}: {E}"
		loggy.error(f"create_table {response}")
		return response








async def delete_table(content :str, rsrc :str, loggy) -> None | str :

	"""
		content	- parsed json data for making a db request;
		rsrc	- request's ip address as string;
		loggy	- Logger object (logging wrapper).
	"""

	try:

		table_name = content.get("tableName")
		table_alias = content.get("tableAlias")


		dbname = getenv("DB_NAME")
		dbstructure = getenv("DB_STRUCTURE_TABLE")
		connection = mysql.connector.connect(

			user=getenv("DB_USER_NAME"),
			password=getenv("DB_USER_PASSWORD"),
			host=getenv("DB_ADDRESS"),
			database=dbname
		)
		session = connection.cursor()
		loggy.debug(f"{dbname} connection established for {rsrc} in delete_table")


		dbquery1 = "DROP TABLE %s"%table_name
		dbquery2 = "DELETE FROM %s WHERE name='%s' AND alias='%s' LIMIT 1"%(dbstructure, table_name, table_alias)


		loggy.debug(f"{rsrc} query1: {dbquery1}")
		session.execute(dbquery1)
		loggy.info(f"{rsrc} dropped {table_name}")


		loggy.debug(f"{rsrc} query2: {dbquery2}")
		session.execute(dbquery2)
		loggy.info(f"{rsrc} updated {dbstructure} removed ('{table_name}',{table_alias})")


		connection.commit()
		session.close()
		connection.close()


	except	Exception as E:

		response = f"{E.__class__.__name__}: {E}"
		loggy.error(f"delete_table {response}")
		return response








async def update_table(content :str, rsrc :str, loggy) -> None | List[str] | str :

	"""
		content	- parsed json data for making a db request;
		rsrc	- request's ip address as string;
		loggy	- Logger object (logging wrapper).
	"""

	try:

		response = list()
		table_name = content.get("name")
		current_alias = content.get("origin")
		new_alias = content.get("alias")
		new_columns = content.get("newColumns")
		del_columns = content.get("delColumns")
		mv_columns = content.get("renamedColumns")


		if	current_alias == new_alias and not new_columns and not del_columns and not mv_columns:
			raise ValueError(getenv("ERROR_TABLE_DATA","Empty or inconsistent table data"))


		dbname = getenv("DB_NAME")
		connection = mysql.connector.connect(

			user=getenv("DB_USER_NAME"),
			password=getenv("DB_USER_PASSWORD"),
			host=getenv("DB_ADDRESS"),
			database=dbname
		)
		session = connection.cursor()
		loggy.debug(f"{dbname} connection established for {rsrc} in update_table")


		if	del_columns:

			try:

				dbquery = "ALTER TABLE %s %s"%(table_name, ", ".join( f"DROP COLUMN {col}" for col in del_columns ))
				loggy.debug(f"{rsrc} query: {dbquery}")

				session.execute(dbquery)
				loggy.info(f"{rsrc} dropped {table_name} columns {del_columns}")

			except	Exception as E:

				message = f"Columns drop failed due to {E.__class__.__name__}: {E}"
				response.append(message)
				loggy.error(message)


		if	mv_columns:

			origin_names = list()
			new_names = list()


			for k,v in mv_columns.items():

				origin_names.append(k)
				new_names.append(v.replace("-","_").replace(" ","_"))


			if	not origin_names or not new_names or len(origin_names) != len(new_names):
				raise ValueError(getenv("ERROR_TABLE_DATA","Empty or inconsistent table data"))

			try:

				dbquery = "ALTER TABLE %s %s"%(table_name, ", ".join( f"RENAME COLUMN {origin} TO {new}" for origin,new in zip(origin_names,new_names) ))
				loggy.debug(f"{rsrc} query: {dbquery}")

				session.execute(dbquery)
				loggy.info(f"{rsrc} renamed {table_name} columns {mv_columns.values()}")

			except	Exception as E:

				message = f"Columns rename failed due to {E.__class__.__name__}: {E}"
				response.append(message)
				loggy.error(message)


		if	new_columns:

			column_names = list()
			column_types = list()


			for k,v in new_columns.items():

				column_names.append(k.replace("-","_").replace(" ","_"))
				column_types.append(COLUMN_TYPE[int(v)])


			if	not column_names or not column_types or len(column_names) != len(column_types):
				raise ValueError(getenv("ERROR_TABLE_DATA","Empty or inconsistent table data"))

			try:

				dbquery = "ALTER TABLE %s %s"%(table_name, ", ".join( f"ADD COLUMN {name} {T}" for name,T in zip(column_names,column_types) ))
				loggy.debug(f"{rsrc} query: {dbquery}")

				session.execute(dbquery)
				loggy.info(f"{rsrc} new {table_name} columns {column_names}")

			except	Exception as E:

				message = f"Columns addition failed due to {E.__class__.__name__}: {E}"
				response.append(message)
				loggy.error(message)


		if	new_alias != current_alias:

			try:

				dbquery = "UPDATE %s SET %s = '%s' WHERE name = '%s'"%(getenv("DB_STRUCTURE_TABLE"), "alias", new_alias, table_name)
				loggy.debug(f"{rsrc} query: {dbquery}")

				session.execute(dbquery)
				loggy.info(f"{rsrc} changed {table_name} alias to {new_alias}")

			except	Exception as E:

				message = f"Alias rename failed due to {E.__class__.__name__}: {E}"
				response.append(message)
				loggy.error(message)


		connection.commit()
		session.close()
		connection.close()


		if	response : return response
	except	Exception as E:

		response = f"{E.__class__.__name__}: {E}"
		loggy.error(f"update_table {response}")
		return response








async def add_table_row(table_name :str, content :str, rsrc :str, loggy) -> None | str :

	"""
		table_name	- requested table name string;
		content		- parsed json data for making a db request;
		rsrc		- request's ip address as string;
		loggy		- Logger object (logging wrapper).
	"""

	try:

		columns = list()
		data = list()


		for k,v in content.items():
			if	v is not None:

				columns.append(k)
				data.append(f"'{v}'")


		if	not columns or not data or len(columns) != len(data):
			raise ValueError(getenv("ERROR_TABLE_DATA","Empty or inconsistent table data"))


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


		dbquery = "INSERT INTO %s (%s) VALUES (%s)"%(table_name, columns, data)
		loggy.debug(f"{rsrc} query: {dbquery}")


		session.execute(dbquery)
		loggy.info(f"{rsrc} inserted into {table_name} ({columns}) - ({data})")


		connection.commit()
		session.close()
		connection.close()


	except	Exception as E:

		response = f"{E.__class__.__name__}: {E}"
		loggy.error(f"add_table_row {response}")
		return response








async def delete_table_row(table_name :str, content :str, rsrc :str, loggy) -> None | str :

	"""
		table_name	- requested table name string;
		content		- parsed json data for making a db request;
		rsrc		- request's ip address as string;
		loggy		- Logger object (logging wrapper).
	"""

	try:

		columns = list()
		data = list()


		for k,v in content.items():

			columns.append(k)
			data.append(f"='{v}'" if v is not None else "IS NULL")


		if	not columns or not data or len(columns) != len(data):
			raise ValueError(getenv("ERROR_TABLE_DATA","Empty or inconsistent table data"))


		condition = " AND ".join( f"{c}{d}" for c,d in zip(columns, data) )


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
		loggy.error(f"delete_table_row {response}")
		return response








async def update_table_row(table_name :str, content :str, rsrc :str, loggy) -> None | str :

	"""
		table_name	- requested table name string;
		content		- parsed json data for making a db request;
		rsrc		- request's ip address as string;
		loggy		- Logger object (logging wrapper).
	"""

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

		):	raise ValueError(getenv("ERROR_TABLE_DATA","Empty or inconsistent table data"))


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
		loggy.error(f"update_table_row {response}")
		return response







