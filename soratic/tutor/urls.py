from django.urls import path
from . import api

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', api.register_user, name='api_auth_register'),
    path('auth/login/', api.login_user, name='api_auth_login'),
    
    # Protected API endpoints
    path('subjects/', api.get_subjects, name='api_subjects'),
    path('conversations/', api.get_conversations, name='api_conversations'),
    path('conversations/create/', api.create_conversation, name='api_create_conversation'),
    path('conversations/<int:conversation_id>/', api.get_conversation, name='api_get_conversation'),
    path('conversations/<int:conversation_id>/chat/', api.get_ai_response, name='api_chat'),
    path('socratic-response/', api.socratic_response, name='api_socratic_response'),
    path('profile/', api.get_profile, name='api_get_profile'),
    path('profile/upload/', api.upload_profile_picture, name='api_upload_profile_picture'),
    path('auth/oauth/', api.oauth_login, name='api_oauth_login'),
]