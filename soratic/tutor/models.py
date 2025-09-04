from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse

# Create your models here.
class Subject(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    # The system prompt for the AI agent for this subject
    system_prompt = models.TextField(help_text="The specialized system prompt for this subject's AI tutor.")

    def __str__(self):
        return self.name

class Conversation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)

    def get_absolute_url(self):
        return reverse('chat', kwargs={'conversation_id': self.id})

    def __str__(self):
        return f"{self.title} ({self.user.username})"

class Message(models.Model):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'AI Assistant'),
    ]
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.role}: {self.content[:50]}..."

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"

class LearningPathway(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField()
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.subject.name}: {self.title}"

class Exercise(models.Model):
    pathway = models.ForeignKey(LearningPathway, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    problem_statement = models.TextField()
    hints = models.JSONField(default=list)
    solution = models.TextField()
    difficulty = models.CharField(max_length=20, choices=[('easy', 'Easy'), ('medium', 'Medium'), ('hard', 'Hard')])
    
    def __str__(self):
        return self.title

class UserProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    pathway = models.ForeignKey(LearningPathway, on_delete=models.CASCADE, null=True, blank=True)
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE, null=True, blank=True)
    completed = models.BooleanField(default=False)
    attempts = models.IntegerField(default=0)
    time_spent = models.DurationField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'exercise']

class SessionSummary(models.Model):
    conversation = models.OneToOneField(Conversation, on_delete=models.CASCADE)
    topics_covered = models.JSONField(default=list)
    key_concepts = models.JSONField(default=list)
    questions_asked = models.IntegerField(default=0)
    time_spent = models.DurationField(null=True, blank=True)
    ai_summary = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Summary: {self.conversation.title}"