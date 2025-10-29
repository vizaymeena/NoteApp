from rest_framework.routers import  DefaultRouter
from .views import UserView,NotesView
router = DefaultRouter()

router.register(r'api/users',UserView)
router.register(r'notes',NotesView)



urlpatterns = router.urls

