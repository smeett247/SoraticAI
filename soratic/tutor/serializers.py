from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Subject, Conversation, Message, LearningPathway, Exercise, UserProgress, SessionSummary

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name', 'description']

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'role', 'content', 'timestamp']

class ConversationSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    subject = SubjectSerializer(read_only=True)
    
    class Meta:
        model = Conversation
        fields = ['id', 'title', 'subject', 'created_at', 'messages']

class LearningPathwaySerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningPathway
        fields = ['id', 'title', 'description', 'order']

class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = ['id', 'title', 'problem_statement', 'hints', 'difficulty']
        
class ExerciseWithSolutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = ['id', 'title', 'problem_statement', 'hints', 'solution', 'difficulty']

class UserProgressSerializer(serializers.ModelSerializer):
    exercise = ExerciseSerializer(read_only=True)
    pathway = LearningPathwaySerializer(read_only=True)
    
    class Meta:
        model = UserProgress
        fields = ['id', 'exercise', 'pathway', 'completed', 'attempts', 'time_spent', 'created_at']

class SessionSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = SessionSummary
        fields = ['id', 'topics_covered', 'key_concepts', 'questions_asked', 'time_spent', 'ai_summary', 'created_at']