from os import getenv








def in_access_list(address :str, loggy) -> bool :

	accessable = address in getenv("DB_ACCESS_LIST")
	loggy.info("access %s for %s"%("granted" if accessable else "denied", address))
	return accessable







