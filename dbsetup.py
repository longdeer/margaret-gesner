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
		session.execute(
			"""
				CREATE TABLE testing_1 (
					id INT NOT NULL AUTO_INCREMENT,
					event_signal VARCHAR(255),
					event_source VARCHAR(255),
					event_target VARCHAR(255),
					event_state VARCHAR(255),
					PRIMARY KEY(id)
				)
			"""
		)
		session.execute(
			"""
				INSERT INTO testing_1 (event_signal, event_source, event_target, event_state) VALUES
				("hello", "server", "client", "success"),
				("check", "client", "server", "success"),
				("fee", "server", "client", "fail")
			"""
		)
		session.execute(
			"""
				CREATE TABLE testing_2 (
					id INT NOT NULL AUTO_INCREMENT,
					name VARCHAR(255),
					account VARCHAR(255),
					welth VARCHAR(255),
					PRIMARY KEY(id)
				)
			"""
		)
		session.execute(
			"""
				INSERT INTO testing_2 (name, account, welth) VALUES
				("carl", "545592393", "rich"),
				("michel", "494585823", "poor"),
				("dora", "884623722", "middle")
			"""
		)


		connection.commit()
		session.close()


	except	mysql.connector.Error as E : print(f"{E.__class__.__name__}: {E}")
	else:	connection.close()








if	__name__ == "__main__":

	load_dotenv()
	dbsetup("structure", "testings")







