from django.contrib import admin
from .models import Subject, Conversation, Message

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    list_filter = ('name',)

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'subject', 'created_at')
    list_filter = ('subject', 'created_at')
    search_fields = ('title', 'user__username')

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('get_conversation', 'role', 'content_preview', 'timestamp')
    list_filter = ('role', 'timestamp')
    
    def get_conversation(self, obj):
        return obj.conversation.title
    get_conversation.short_description = 'Conversation'
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'