from os import getenv








def in_access_list(address :str) -> bool : return address in getenv("DB_ACCESS_LIST")







