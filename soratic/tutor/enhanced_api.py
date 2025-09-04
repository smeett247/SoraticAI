from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Count, Sum, Avg
from datetime import timedelta
from django.utils import timezone
from .models import Subject, LearningPathway, Exercise, UserProgress, SessionSummary, Conversation
from .serializers import (LearningPathwaySerializer, ExerciseSerializer, ExerciseWithSolutionSerializer,
                         UserProgressSerializer, SessionSummarySerializer)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_learning_pathways(request, subject_id):
    try:
        pathways = LearningPathway.objects.filter(subject_id=subject_id)
        
        # Fallback sample data if no pathways exist
        if not pathways.exists():
            sample_pathways = [
                {
                    'id': 1,
                    'title': 'Python Basics',
                    'description': 'Learn fundamental Python concepts',
                    'order': 1
                },
                {
                    'id': 2,
                    'title': 'Data Structures',
                    'description': 'Master Python data structures',
                    'order': 2
                }
            ]
            return Response(sample_pathways)
        
        serializer = LearningPathwaySerializer(pathways, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_exercises(request, pathway_id):
    try:
        exercises = Exercise.objects.filter(pathway_id=pathway_id)
        
        # Fallback sample data if no exercises exist
        if not exercises.exists():
            sample_exercises = [
                {
                    'id': 1,
                    'title': 'Variables and Data Types',
                    'problem_statement': 'Create variables of different data types (int, float, str, bool) and print their types using the type() function.',
                    'hints': ['Use type() function to check variable types', 'Try creating: age = 25, price = 19.99, name = "John", is_student = True'],
                    'difficulty': 'easy',
                    'solution': 'age = 25\nprice = 19.99\nname = "John"\nis_student = True\nprint(type(age), type(price), type(name), type(is_student))'
                },
                {
                    'id': 2,
                    'title': 'Control Structures',
                    'problem_statement': 'Write a program that checks if a number is positive, negative, or zero using if-else statements.',
                    'hints': ['Use if, elif, else statements', 'Compare the number with 0'],
                    'difficulty': 'medium',
                    'solution': 'num = int(input("Enter a number: "))\nif num > 0:\n    print("Positive")\nelif num < 0:\n    print("Negative")\nelse:\n    print("Zero")'
                }
            ]
            return Response(sample_exercises)
        
        serializer = ExerciseSerializer(exercises, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def submit_exercise_attempt(request, exercise_id):
    try:
        user_answer = request.data.get('answer', '').strip()
        
        # Handle sample data exercises
        sample_solutions = {
            1: 'age = 25\nprice = 19.99\nname = "John"\nis_student = True\nprint(type(age), type(price), type(name), type(is_student))',
            2: 'num = int(input("Enter a number: "))\nif num > 0:\n    print("Positive")\nelif num < 0:\n    print("Negative")\nelse:\n    print("Zero")'
        }
        
        # Get or create progress tracking in session
        session_key = f'exercise_{exercise_id}_attempts'
        attempts = request.session.get(session_key, 0)
        
        # Simple answer checking
        solution = sample_solutions.get(int(exercise_id), '')
        is_correct = False
        
        if solution:
            # Check for key concepts in the answer
            if exercise_id == '1':
                is_correct = 'type(' in user_answer and any(t in user_answer for t in ['int', 'float', 'str', 'bool'])
            elif exercise_id == '2':
                is_correct = 'if' in user_answer and ('elif' in user_answer or 'else' in user_answer)
        
        if is_correct:
            request.session[session_key] = 0  # Reset attempts
            return Response({
                'attempts': attempts + 1,
                'completed': True,
                'show_solution': False,
                'message': 'Correct! Well done!'
            })
        else:
            attempts += 1
            request.session[session_key] = attempts
            
            # Show solution after 3 failed attempts
            show_solution = attempts >= 3
            
            response_data = {
                'attempts': attempts,
                'completed': False,
                'show_solution': show_solution,
                'message': f'Incorrect. You have {3 - attempts} attempts remaining.' if not show_solution else 'Solution revealed after 3 attempts.'
            }
            
            if show_solution:
                response_data['solution'] = solution
                response_data['explanation'] = f"The correct solution is:\n{solution}"
            
            return Response(response_data)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_progress_dashboard(request):
    try:
        # Sample progress data
        progress_data = {
            'Python Programming': {
                'subject_id': 1,
                'total_exercises': 10,
                'completed_exercises': 3,
                'completion_percentage': 30,
                'conversations_count': 5,
                'time_spent_minutes': 45
            },
            'Physics': {
                'subject_id': 2,
                'total_exercises': 8,
                'completed_exercises': 2,
                'completion_percentage': 25,
                'conversations_count': 3,
                'time_spent_minutes': 30
            },
            'Mathematics': {
                'subject_id': 3,
                'total_exercises': 12,
                'completed_exercises': 5,
                'completion_percentage': 42,
                'conversations_count': 7,
                'time_spent_minutes': 60
            },
            'Chemistry': {
                'subject_id': 4,
                'total_exercises': 6,
                'completed_exercises': 1,
                'completion_percentage': 17,
                'conversations_count': 2,
                'time_spent_minutes': 20
            }
        }
        
        return Response(progress_data)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def analyze_image(request):
    try:
        # Simulate AI image analysis
        image_data = request.data.get('image')
        subject = request.data.get('subject', 'general')
        
        # Sample AI analysis responses based on subject
        analyses = {
            'physics': [
                "I can see force vectors in this diagram. What do you think each arrow represents?",
                "This appears to be a circuit diagram. Can you identify the components?",
                "I notice this is a wave diagram. What patterns do you observe?"
            ],
            'mathematics': [
                "This looks like a graph. What can you tell me about the slope?",
                "I see geometric shapes. How might we calculate the area?",
                "This appears to be an equation. What's the first step to solve it?"
            ],
            'chemistry': [
                "I can see molecular structures. What do the bonds tell us?",
                "This looks like a reaction diagram. What's happening to the atoms?",
                "I notice this is a periodic table section. What patterns do you see?"
            ],
            'python': [
                "I can see code in this image. What do you think this function does?",
                "This looks like a data structure. How would you access the elements?",
                "I see an algorithm. Can you trace through the logic?"
            ]
        }
        
        subject_analyses = analyses.get(subject, analyses['physics'])
        analysis = subject_analyses[hash(str(image_data)) % len(subject_analyses)]
        
        return Response({
            'analysis': analysis,
            'confidence': 0.85,
            'suggestions': [
                'Ask follow-up questions',
                'Request step-by-step explanation',
                'Try a similar problem'
            ]
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def adaptive_difficulty(request):
    try:
        current_level = request.data.get('current_level', 'medium')
        struggle_indicators = request.data.get('struggle_count', 0)
        subject = request.data.get('subject')
        
        # Adaptive logic
        if struggle_indicators >= 3:
            if current_level == 'hard':
                new_level = 'medium'
            elif current_level == 'medium':
                new_level = 'easy'
            else:
                new_level = 'easy'
        elif struggle_indicators == 0:
            if current_level == 'easy':
                new_level = 'medium'
            elif current_level == 'medium':
                new_level = 'hard'
            else:
                new_level = 'hard'
        else:
            new_level = current_level
        
        suggestions = []
        if struggle_indicators >= 2:
            suggestions = [
                'Let\'s break this down into smaller steps',
                'Would you like to review the basics first?',
                'Try approaching this from a different angle',
                'Let me provide a hint to get you started'
            ]
        
        return Response({
            'new_level': new_level,
            'suggestions': suggestions,
            'message': f'Adjusting difficulty to {new_level} level based on your progress.'
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def generate_session_summary(request, conversation_id):
    try:
        # Sample session summary data
        sample_summary = {
            'id': conversation_id,
            'topics_covered': ['Variables and Data Types', 'Control Structures', 'Functions'],
            'key_concepts': [
                'Python variables can store different data types',
                'Use if-else statements for conditional logic',
                'Functions help organize and reuse code'
            ],
            'questions_asked': 8,
            'time_spent': '1800',  # 30 minutes in seconds
            'ai_summary': 'This session focused on Python fundamentals including variable types, conditional statements, and basic function concepts. The student demonstrated good understanding of data types and showed progress in logical thinking through guided questioning.',
            'created_at': timezone.now().isoformat()
        }
        
        return Response(sample_summary)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_user_progress(request, subject_id=None):
    try:
        filters = {'user': request.user}
        if subject_id:
            filters['subject_id'] = subject_id
            
        progress = UserProgress.objects.filter(**filters).select_related('exercise', 'pathway')
        serializer = UserProgressSerializer(progress, many=True)
        return Response(serializer.data)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def admin_students(request):
    try:
        from django.contrib.auth.models import User
        from .models import Subject, Conversation, Message
        
        students = []
        users = User.objects.all().order_by('-date_joined')
        
        for user in users:
            conversations = Conversation.objects.filter(user=user)
            progress_data = UserProgress.objects.filter(user=user)
            
            subjects_studied = list(conversations.values_list('subject__name', flat=True).distinct())
            
            progress_by_subject = {}
            for subject in Subject.objects.all():
                subject_progress = progress_data.filter(subject=subject)
                if subject_progress.exists():
                    completed = subject_progress.filter(completed=True).count()
                    total = subject_progress.count()
                    progress_by_subject[subject.name.lower()] = int((completed / total) * 100) if total > 0 else 0
            
            total_sessions = conversations.count()
            total_questions = Message.objects.filter(conversation__user=user, role='user').count()
            
            last_message = Message.objects.filter(conversation__user=user).order_by('-timestamp').first()
            last_active = last_message.timestamp if last_message else user.date_joined
            
            students.append({
                'id': str(user.id),
                'name': f"{user.first_name} {user.last_name}".strip() or user.username,
                'email': user.email,
                'registeredAt': user.date_joined.isoformat(),
                'lastActive': last_active.isoformat(),
                'totalSessions': total_sessions,
                'totalQuestions': total_questions,
                'subjectsStudied': subjects_studied,
                'averageSessionTime': 25,
                'progressBySubject': progress_by_subject,
                'achievements': [],
                'apiUsage': {
                    'totalTokens': total_questions * 50,
                    'totalCost': total_questions * 0.001,
                    'favoriteModel': 'deepseek-ai/deepseek-v3.1'
                }
            })
        
        return Response({'students': students})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)