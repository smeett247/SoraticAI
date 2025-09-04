from django.urls import path
from . import api, enhanced_api, admin_api

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
    
    # Enhanced Learning Features
    path('subjects/<int:subject_id>/pathways/', enhanced_api.get_learning_pathways, name='api_learning_pathways'),
    path('pathways/<int:pathway_id>/exercises/', enhanced_api.get_exercises, name='api_exercises'),
    path('exercises/<int:exercise_id>/attempt/', enhanced_api.submit_exercise_attempt, name='api_exercise_attempt'),
    path('progress/dashboard/', enhanced_api.get_progress_dashboard, name='api_progress_dashboard'),
    path('progress/<int:subject_id>/', enhanced_api.get_user_progress, name='api_user_progress'),
    path('conversations/<int:conversation_id>/summary/', enhanced_api.generate_session_summary, name='api_session_summary'),
    
    # Advanced AI Features
    path('ai/analyze-image/', enhanced_api.analyze_image, name='api_analyze_image'),
    path('ai/adaptive-difficulty/', enhanced_api.adaptive_difficulty, name='api_adaptive_difficulty'),
    
    # Admin Features
    path('admin/students/', enhanced_api.admin_students, name='api_admin_students'),
    path('admin/students/create/', admin_api.admin_create_student, name='api_admin_create_student'),
    path('admin/students/<int:student_id>/delete/', admin_api.admin_delete_student, name='api_admin_delete_student'),
    path('admin/students/<int:student_id>/update/', admin_api.admin_update_student, name='api_admin_update_student'),
]