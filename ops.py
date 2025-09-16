import	json
from	os		import getenv








def in_access_list(address :str, point :str, rule :str, loggy) -> bool :

	accessable = address in json.loads(getenv(rule,"[]"))
	loggy.debug("\"%s\" access %s for %s"%(point, "granted" if accessable else "denied", address))
	return accessable




def serialize_alias(alias :str) -> str :

	"""
		Converts table alias, which represents the viewable name and might be different languages,
		to the url-compatibale utf-8 string, by taking hex value of every symbol.
	"""

	return str("_").join(map(lambda s : format(ord(s),"x"),alias))




def deserialize_alias(serialized_alias :str) -> str :

	"""
		Converts serialized string value to viewable table alias.
	"""

	return str().join(map(lambda s : chr(int(s,16)),serialized_alias.split("_")))




def sanityze_query(raw :str) -> str :

	"""
		Removes whitespases from query string
	"""

	return " ".join(filter(bool,raw.strip().replace("\n"," ").replace("\t"," ").split(" ")))







