from logging import getLogger
from logging import Formatter
from logging import FileHandler








class Logger:
	def __init__(self, handler :str, init_name :str, init_level :int =20):

		self.handler = FileHandler(handler)
		self.handler.setFormatter(Formatter(**{

			"fmt": "%(asctime)s @%(name)s %(levelname)s : %(message)s",
			"datefmt": "%d/%m/%Y %H%M",
		}))
		self.contributor = getLogger(init_name)
		self.contributor.addHandler(self.handler)
		self.contributor.setLevel(int(init_level))

	def close(self): self.handler.close()
	def debug(self, *args, **kwargs): return self.contributor.debug(*args, **kwargs)
	def info(self, *args, **kwargs): return self.contributor.info(*args, **kwargs)
	def warning(self, *args, **kwargs): return self.contributor.warning(*args, **kwargs)
	def error(self, *args, **kwargs): return self.contributor.error(*args, **kwargs)
	def critical(self, *args, **kwargs): return self.contributor.critical(*args, **kwargs)







