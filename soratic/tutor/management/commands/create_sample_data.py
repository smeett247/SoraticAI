from django.core.management.base import BaseCommand
from tutor.models import Subject, LearningPathway, Exercise

class Command(BaseCommand):
    help = 'Create sample learning pathways and exercises'

    def handle(self, *args, **options):
        # Create subjects
        subjects_data = [
            {'name': 'Python Programming', 'description': 'Learn Python programming fundamentals'},
            {'name': 'Physics', 'description': 'Explore physics concepts through inquiry'},
            {'name': 'Mathematics', 'description': 'Master mathematical concepts'},
            {'name': 'Chemistry', 'description': 'Understand chemical principles'},
        ]

        for subject_data in subjects_data:
            subject, created = Subject.objects.get_or_create(
                name=subject_data['name'],
                defaults=subject_data
            )
            if created:
                self.stdout.write(f'Created subject: {subject.name}')

        # Create Python pathways and exercises
        python_subject = Subject.objects.get(name='Python Programming')
        
        pathways_data = [
            {
                'title': 'Python Basics',
                'description': 'Learn fundamental Python concepts',
                'order': 1,
                'exercises': [
                    {
                        'title': 'Variables and Data Types',
                        'problem_statement': 'Create variables of different data types and explain their differences.',
                        'solution': 'Variables store data. Python has int, float, str, bool types.',
                        'hints': ['Think about numbers, text, and true/false values', 'Use type() function to check types'],
                        'difficulty': 'easy'
                    },
                    {
                        'title': 'Control Structures',
                        'problem_statement': 'Write a program using if-else statements and loops.',
                        'solution': 'Use if/elif/else for conditions, for/while for loops.',
                        'hints': ['Consider different conditions', 'Think about repetitive tasks'],
                        'difficulty': 'medium'
                    }
                ]
            },
            {
                'title': 'Data Structures',
                'description': 'Master Python data structures',
                'order': 2,
                'exercises': [
                    {
                        'title': 'Lists and Dictionaries',
                        'problem_statement': 'Create and manipulate lists and dictionaries.',
                        'solution': 'Lists are ordered collections, dictionaries are key-value pairs.',
                        'hints': ['Lists use [], dictionaries use {}', 'Think about indexing vs keys'],
                        'difficulty': 'medium'
                    }
                ]
            }
        ]

        for pathway_data in pathways_data:
            exercises_data = pathway_data.pop('exercises')
            pathway, created = LearningPathway.objects.get_or_create(
                subject=python_subject,
                title=pathway_data['title'],
                defaults=pathway_data
            )
            
            if created:
                self.stdout.write(f'Created pathway: {pathway.title}')
                
                for exercise_data in exercises_data:
                    exercise, created = Exercise.objects.get_or_create(
                        pathway=pathway,
                        title=exercise_data['title'],
                        defaults=exercise_data
                    )
                    if created:
                        self.stdout.write(f'  Created exercise: {exercise.title}')

        self.stdout.write(self.style.SUCCESS('Sample data created successfully!'))