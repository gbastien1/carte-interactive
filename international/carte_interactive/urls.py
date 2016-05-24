from django.conf.urls import url
from . import views

app_name = 'carte_interactive'

urlpatterns = [
	url(r'^$', views.LoginView.as_view(), name='login'),
	url(r'^carte/logout/$', views.LogoutView.as_view(), name='logout'),
	url(r'^carte/$', views.CardView.as_view(), name='carte'),
	url(r'^carte/ajout/$', views.AjouterEcole, name='create_ecole'),
	url(r'^carte/edit/$', views.EditerEcole, name='edit_ecole'),
]
