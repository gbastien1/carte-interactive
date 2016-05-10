from django.conf.urls import url
from . import views

urlpatterns = [
	url(r'^$', views.CardView.as_view(), name='carte'),
	#url(r'^$', views.IndexView.as_view(), name='index'),
]
