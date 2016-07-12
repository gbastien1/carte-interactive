from django.core.files.storage import FileSystemStorage
from django.conf import settings
import os


class OverwriteStorage(FileSystemStorage):
	def get_available_name(self, name, max_length):
		# name = name.split('\\')[1]
		# If the filename already exists, remove it as if it was a true file system
		if self.exists(name):
			path = os.path.normpath(os.path.join(settings.MEDIA_ROOT, name))  # .replace('\\', '/')
			try:
				os.remove(path)
			except OSError as e:
				print(str(e))

		return name
