from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import User,Notes
from django.utils import timezone
from .serializers import UserSerializer,NotesSerializer
from rest_framework.pagination import PageNumberPagination
from rest_framework.viewsets import ModelViewSet

from rest_framework.decorators import action

from rest_framework.response import Response
from rest_framework import status, viewsets
# Create your views here.


class UserView(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    @action(detail=False, methods=['get'], url_path='queryuser/(?P<email>[^/.]+)')
    def query_user(self, request, email=None):
        try:
            user = User.objects.get(email=email)
            # pass context={'request': request}
            serializer = self.get_serializer(user, context={'request': request})
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

class NotesPagination(PageNumberPagination):
    page_size=5
    page_size_query_param = "page_size"
    max_page_size = 5

class NotesView(viewsets.ModelViewSet):
    queryset = Notes.objects.all()
    serializer_class = NotesSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = NotesPagination

    def get_queryset(self):
        user = self.request.user
        queryset = Notes.objects.filter(user=user)

        filter_param = self.request.query_params.get('filter')

        if filter_param=="today":
            queryset = Notes.objects.filter(created_at=timezone.now().date())
            return queryset
        elif filter_param=="asc":
            queryset = Notes.objects.order_by("title")
            return queryset
        elif filter_param =="desc":
            queryset = Notes.objects.order_by("-title")
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)



from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer