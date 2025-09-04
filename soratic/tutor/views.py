from django.shortcuts import render
from django.http import HttpResponse
from django.views.generic import TemplateView
import os

class ReactAppView(TemplateView):
    template_name = 'index.html'

def serve_react(request):
    try:
        with open(os.path.join(os.path.dirname(__file__), '..', 'client', 'dist', 'index.html')) as f:
            return HttpResponse(f.read())
    except FileNotFoundError:
        return HttpResponse("React app not built. Run 'npm run build' in client directory.")