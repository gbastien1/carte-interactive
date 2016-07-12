import os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'gbastien1',
        'USER': 'gbastien1',
        'PASSWORD': 'Basg20549403$',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

DEBUG = True