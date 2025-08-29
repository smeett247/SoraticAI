from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from rest_framework.authtoken.models import Token
import openai
import os
import json
from dotenv import load_dotenv
from .models import Subject, Conversation, Message
from .forms import NewUserForm

load_dotenv()

# Create your views here.
def landing_page(request):
    return render(request, 'tutor/landing.html')

def register_request(request):
    if request.method == "POST":
        form = NewUserForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect("dashboard")
    else:
        form = NewUserForm()
    return render(request, 'tutor/register.html', {'form': form})

def login_request(request):
    if request.method == "POST":
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('dashboard')
        else:
            # Return error message
            return render(request, 'tutor/login.html', {'error': 'Invalid credentials'})
    return render(request, 'tutor/login.html')

@login_required
def logout_request(request):
    logout(request)
    return redirect('landing')

@login_required
def dashboard(request):
    subjects = Subject.objects.all()
    conversations = Conversation.objects.filter(user=request.user).order_by('-created_at')[:10]
    return render(request, 'tutor/dashboard.html', {
        'subjects': subjects,
        'conversations': conversations
    })

@login_required
def chat(request, conversation_id):
    conversation = get_object_or_404(Conversation, id=conversation_id, user=request.user)
    messages = Message.objects.filter(conversation=conversation)
    return render(request, 'tutor/chat.html', {
        'conversation': conversation,
        'messages': messages
    })

@login_required
@require_POST
def start_conversation(request):
    subject_id = request.POST.get('subject_id')
    subject = get_object_or_404(Subject, id=subject_id)
    
    # Create new conversation
    conversation = Conversation.objects.create(
        user=request.user,
        subject=subject,
        title="New Conversation"  # This will be updated with the first message
    )
    
    return redirect(conversation.get_absolute_url())

@login_required
@csrf_exempt
@require_POST
def get_ai_response(request, conversation_id):
    conversation = get_object_or_404(Conversation, id=conversation_id, user=request.user)
    user_message = request.POST.get('message')
    
    if not user_message:
        return JsonResponse({'error': 'No message provided'}, status=400)
    
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
    recent_messages = Message.objects.filter(conversation=conversation).order_by('-timestamp')[:10]
    for msg in reversed(recent_messages):  # Get in chronological order
        messages_for_ai.append({"role": msg.role, "content": msg.content})
    
    # Call OpenAI API
    try:
        openai.api_key = os.getenv('OPENAI_API_KEY')
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",  # or "gpt-4" if you have access
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
        
        return JsonResponse({'response': ai_response})
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def api_register(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
            
            if User.objects.filter(username=username).exists():
                return JsonResponse({'error': 'Username already exists'}, status=400)
            
            user = User.objects.create_user(username=username, email=email, password=password)
            token, created = Token.objects.get_or_create(user=user)
            
            return JsonResponse({
                'token': token.key,
                'user': {'id': user.id, 'username': user.username, 'email': user.email}
            })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def api_login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            
            user = authenticate(username=username, password=password)
            if user:
                token, created = Token.objects.get_or_create(user=user)
                return JsonResponse({
                    'token': token.key,
                    'user': {'id': user.id, 'username': user.username, 'email': user.email}
                })
            
            return JsonResponse({'error': 'Invalid credentials'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)