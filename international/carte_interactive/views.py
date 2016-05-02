from django.views.generic import TemplateView


class IndexView(TemplateView):
	template_name = "carte_interactive/index.html"
