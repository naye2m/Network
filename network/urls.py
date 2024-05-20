
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("post/<str:post_id>", views.post, name="post"),
    # path("post", views.get_post, name="get_post"),
    path("posts", views.get_page_posts, name="get_posts"),
    # path("follow", views.follow, name="follow"),
    path("user/<str:username>", views.user, name="user"),
]
