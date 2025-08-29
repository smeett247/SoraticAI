from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from .models import Subject, Conversation, Message
from .serializers import SubjectSerializer, ConversationSerializer, MessageSerializer
import json

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    data = json.loads(request.body)
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=400)
    
    user = User.objects.create_user(username=username, email=email, password=password)
    token, created = Token.objects.get_or_create(user=user)
    
    return Response({
        'token': token.key,
        'user': {'id': user.id, 'username': user.username, 'email': user.email}
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    data = json.loads(request.body)
    username = data.get('username')
    password = data.get('password')
    
    user = authenticate(username=username, password=password)
    if user:
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': {'id': user.id, 'username': user.username, 'email': user.email}
        })
    
    return Response({'error': 'Invalid credentials'}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def subjects(request):
    subjects = Subject.objects.all()
    serializer = SubjectSerializer(subjects, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def socratic_response(request):
    data = json.loads(request.body)
    message = data.get('message')
    subject = data.get('subject')
    
    # Mock Socratic response based on subject
    responses = {
        'python': "What do you think this Python function should return? Walk me through your reasoning.",
        'physics': "What forces do you think are acting in this situation?",
        'mathematics': "What patterns do you notice in this equation?",
        'chemistry': "What do you think is happening at the molecular level?"
    }
    
    response_text = responses.get(subject, "That's an interesting observation! What makes you think that's the case?")
    
    return Response({
        'response': response_text,
        'confidence': 0.95,
        'metadata': {
            'subject': subject,
            'questionType': 'guided_inquiry'
        }
    })