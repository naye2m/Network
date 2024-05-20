import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.base_user import AbstractBaseUser
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

from .models import User, Post


def jsonMsg(message: str = "Not Found", status: int = 403) -> JsonResponse:
    return JsonResponse({"message": message}, status=status)


@csrf_exempt
def user(req,username):
    user: User | None = User.objects.filter(username=username).first()
    if not user:
        return jsonMsg("Not a Valid User")
    if req.method == "GET":
        try:
            pageNo = req.GET.get("page", 1)
            response =  user.serializeWithPost(CU=req.user,pageNo=pageNo)
            return JsonResponse(response,status=200)
        except:
           return jsonMsg("something is wrong.")
    if req.method == "PUT":
        if not req.user or not req.user.is_authenticated:
            return jsonMsg("Req user not permitted")
        dat = json.loads(req.body)
        if not dat:
            return jsonMsg("Missing Body")
        isFollow = dat.get("isFollow",True)
        if not req.user.follow(user,isFollow):
            return jsonMsg("Not Completed,")
        return jsonMsg("completed",200)
    
    return jsonMsg("only get and put method accepted")

# @csrf_exempt
# def follow(req,username):
#     user: User | None = User.objects.filter(username=username).first()
#     if not user:
#         return jsonMsg("Not a Valid User")
#     if req.method == "GET":
#         pageNo = req.GET.get("page", 1)
#         response =  user.serializeWithPost(CU=req.user,pageNo=pageNo)
#         return JsonResponse(response,status=200)
#     return jsonMsg("only get req accepted")


@csrf_exempt
# @login_required
def get_page_posts(req) -> JsonResponse:
    pageNo:int|str = req.GET.get("page",None)
    if not pageNo:
        pageNo = 1
    f = req.GET.get("followers",None)
    print([f])
    if f is not None:
        print([f])
        responds = req.user.followingPosts(pageNo)
        return JsonResponse(responds, status=200)
    responds = Post.get_page(req.user,Post.objects.all(),pageNo)
    return JsonResponse(responds, status=200)




@csrf_exempt
@login_required
def post(req, post_id):
    post: Post|None = None
    try:
        post_id = int(post_id)
        post: Post = Post.objects.filter(pk=post_id).first()
    except:
        pass
    # if not post_id:
    #     return jsonMsg("Bad Req", 400)
    # if not post:
        # return jsonMsg("Post Not Found", 404)

    # if data.get("read") is not None:
    #     email.read = data["read"]
    # if data.get("archived") is not None:
    #     email.archived = data["archived"]
    # email.save()
    # return HttpResponse(status=204)#204 for no content
    # ? FOR EDITING A EXISTING POST
    if req.method == "POST":
        # req.user:User
        caption:str = req.POST.get("caption",None)
        # caption:str = json.loads(req.body).get("caption",None)
        print(req.body)
        print(req.POST)
        if caption is None:
                return jsonMsg("caption must needed.",403)
            
        if post is None:
            if not req.user.add_post(caption=caption):
                return jsonMsg("Might be not permited",403)
            else:
                return jsonMsg("created",200)            
                
        elif not post.edit(req.user,caption):
            return jsonMsg("Might be not permited",400)
        return jsonMsg("edited",200)            
        
    data = json.loads(req.body or "{}") #? "{}" for nobody 
    print(post_id,post,data)
    
    # ? FOR GETING A POST
    if req.method == "GET":
        # postID = req.GET.get("id", None)
        # if postID is None:
        #     return jsonMsg("Wrong post id.", 400)
        return JsonResponse(post.serialize(numberOfComment=None),status=200)
    # ? FOR PUTTING LIKE or COMMENTS
    if req.method == "PUT":
        like = data.get("like", None)
        if like is not None:
            if not post.add_like(req.user, like):
                return jsonMsg("Something was wrong. [likely] Permissin ERR.",403)
        comment = data.get("comment", None)
        if not comment and comment is not None:
            return jsonMsg("Comment is present But not a string, type is %s" % str(type(comment)),403)
        if comment:
            if not post.add_comment(req.user, comment):
                return jsonMsg("Something was wrong. [likely] Permissin ERR.",403)
        return (
            jsonMsg("Completed.", 200)
            if like is not None or comment 
            else jsonMsg("Nothing to do.", 400)
        )
    return JsonResponse({"hi": "hello", "method": req.method}, status=219)


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user: AbstractBaseUser | None = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(
                request,
                "network/login.html",
                {"message": "Invalid username and/or password."},
            )
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(
                request, "network/register.html", {"message": "Passwords must match."}
            )

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(
                request, "network/register.html", {"message": "Username already taken."}
            )
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
