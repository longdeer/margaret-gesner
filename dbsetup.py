from	os				import getenv
from	dotenv			import load_dotenv
import	mysql.connector








def dbsetup(dbname, tname):

	"""
		Function to create a db for testing or as a foundation.

		!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		! CAUTION: will drop already existing database!!! !
		!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

		dbname	- database name to be dropped and created.
		tname	- testing table name to be created.
	"""

	try:

		connection = mysql.connector.connect(

			user=getenv("DB_USER_NAME"),
			password=getenv("DB_USER_PASSWORD"),
			host=getenv("DB_ADDRESS"),
		)
		session = connection.cursor()


		session.execute("DROP DATABASE IF EXISTS %s"%dbname)
		session.execute("CREATE DATABASE %s"%dbname)
		session.execute("USE %s"%dbname)
		session.execute(
			"""
				CREATE TABLE %s (
					name VARCHAR(255) UNIQUE NOT NULL,
					alias VARCHAR(255) UNIQUE NOT NULL,
					PRIMARY KEY(name)
				)
			"""%tname
		)
		session.execute(
			"""
				INSERT INTO %s (name,alias) VALUES
				("testing_1","Тестовая таблица 1"),
				("testing_2","Тестовая таблица 2")
			"""%tname
		)


		connection.commit()
		session.close()


	except	mysql.connector.Error as E : print(f"{E.__class__.__name__}: {E}")
	else:	connection.close()








if	__name__ == "__main__":

	load_dotenv()
	dbsetup("structure", "testings")







