from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from openai import OpenAI
import os
from dotenv import load_dotenv
from .models import Subject, Conversation, Message, UserProfile
from .serializers import UserSerializer, SubjectSerializer, ConversationSerializer, MessageSerializer

load_dotenv()

# Authentication endpoints (don't require token auth)
@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def register_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
    
    user = User.objects.create_user(username=username, password=password, email=email)
    token, created = Token.objects.get_or_create(user=user)
    
    return Response({
        'token': token.key,
        'user': UserSerializer(user).data
    })

@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    if user is not None:
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        })
    else:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

# Protected API endpoints (require token authentication)
@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_subjects(request):
    subjects = Subject.objects.all()
    serializer = SubjectSerializer(subjects, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_conversations(request):
    conversations = Conversation.objects.filter(user=request.user).order_by('-created_at')
    serializer = ConversationSerializer(conversations, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def create_conversation(request):
    subject_id = request.data.get('subject_id')
    try:
        subject = Subject.objects.get(id=subject_id)
        conversation = Conversation.objects.create(
            user=request.user,
            subject=subject,
            title="New Conversation"
        )
        serializer = ConversationSerializer(conversation)
        return Response(serializer.data)
    except Subject.DoesNotExist:
        return Response({'error': 'Subject not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_conversation(request, conversation_id):
    try:
        conversation = Conversation.objects.get(id=conversation_id, user=request.user)
        serializer = ConversationSerializer(conversation)
        return Response(serializer.data)
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_ai_response(request, conversation_id):
    try:
        conversation = Conversation.objects.get(id=conversation_id, user=request.user)
        user_message = request.data.get('message')
        
        if not user_message:
            return Response({'error': 'No message provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Save user message
        Message.objects.create(
            conversation=conversation,
            role='user',
            content=user_message
        )
        
        # Update conversation title if it's the first message
        if conversation.title == "New Conversation":
            conversation.title = user_message[:50] + "..." if len(user_message) > 50 else user_message
            conversation.save()
        
        # Prepare messages for OpenAI
        messages_for_ai = [{"role": "system", "content": conversation.subject.system_prompt}]
        
        # Get recent conversation history (last 10 messages)
        recent_messages = Message.objects.filter(conversation=conversation).order_by('timestamp')
        for msg in recent_messages:
            messages_for_ai.append({"role": msg.role, "content": msg.content})
        
        # Call OpenAI API
        openai.api_key = os.getenv('OPENAI_API_KEY')
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages_for_ai,
            temperature=0.7
        )
        
        ai_response = response.choices[0].message.content
        
        # Save AI response
        Message.objects.create(
            conversation=conversation,
            role='assistant',
            content=ai_response
        )
        
        # Return the updated conversation
        serializer = ConversationSerializer(conversation)
        return Response(serializer.data)
    
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def socratic_response(request):
    message = request.data.get('message')
    subject = request.data.get('subject')
    conversation_history = request.data.get('conversation_history', [])
    
    try:
        # Get subject-specific system prompt with fallback
        try:
            subject_obj = Subject.objects.get(name__icontains=subject)
            system_prompt = subject_obj.system_prompt
        except Subject.DoesNotExist:
            system_prompt = "You are a Socratic tutor. Guide students through questions, never give direct answers."
        
        # Initialize NVIDIA API client
        client = OpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key=os.getenv('NVIDIA_API_KEY')
        )
        
        # Prepare messages
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add conversation history
        for msg in conversation_history[-5:]:  # Last 5 messages for context
            if msg.get('role') and msg.get('content'):
                messages.append({"role": msg.get('role'), "content": msg.get('content')})
        
        # Add current message
        messages.append({"role": "user", "content": message})
        
        # Call NVIDIA API
        completion = client.chat.completions.create(
            model="meta/llama-3.1-405b-instruct",
            messages=messages,
            temperature=0.2,
            top_p=0.7,
            max_tokens=1024,
            stream=False
        )
        
        response_text = completion.choices[0].message.content
        
        return Response({
            'response': response_text,
            'confidence': 0.95,
            'metadata': {
                'subject': subject,
                'questionType': 'guided_inquiry',
                'model': 'meta/llama-3.1-405b-instruct'
            }
        })
        
    except Exception as e:
        print(f"NVIDIA API Error: {str(e)}")
        # Return fallback Socratic response
        fallback_responses = {
            'python': "What do you think this Python function should return? Walk me through your reasoning.",
            'physics': "What forces do you think are acting in this situation?",
            'mathematics': "What patterns do you notice in this equation?",
            'chemistry': "What do you think is happening at the molecular level?"
        }
        
        fallback_text = fallback_responses.get(subject, "That's an interesting observation! What makes you think that's the case?")
        
        return Response({
            'response': fallback_text,
            'confidence': 0.5,
            'metadata': {
                'subject': subject,
                'questionType': 'guided_inquiry',
                'fallback': True,
                'error': 'API unavailable'
            }
        })

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def upload_profile_picture(request):
    try:
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        
        if 'profile_picture' in request.FILES:
            profile.profile_picture = request.FILES['profile_picture']
            profile.save()
            
            return Response({
                'message': 'Profile picture uploaded successfully',
                'profile_picture_url': profile.profile_picture.url if profile.profile_picture else None
            })
        
        return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_profile(request):
    try:
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        return Response({
            'user': UserSerializer(request.user).data,
            'profile_picture_url': profile.profile_picture.url if profile.profile_picture else None
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def oauth_login(request):
    provider = request.data.get('provider')
    oauth_id = request.data.get('oauth_id')
    email = request.data.get('email')
    name = request.data.get('name')
    
    # Create username from email or name
    username = email.split('@')[0] if email else name.replace(' ', '').lower()
    
    # Check if user exists by email
    user = None
    if email:
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            pass
    
    # Create new user if doesn't exist
    if not user:
        # Ensure unique username
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1
        
        user = User.objects.create_user(
            username=username,
            email=email,
            first_name=name.split(' ')[0] if name else '',
            last_name=' '.join(name.split(' ')[1:]) if name and ' ' in name else ''
        )
    
    token, created = Token.objects.get_or_create(user=user)
    
    return Response({
        'token': token.key,
        'user': UserSerializer(user).data
    })