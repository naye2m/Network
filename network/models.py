from django.contrib.auth.models import AbstractUser
from django.db import models , models
from django.db.models import Q
from django.core.paginator import Page, Paginator
from django.core.serializers import serialize


# ? set([post.comments.count() for post in set(Post.objects.filter(comments__in=Comment.objects.all()))])
# ? Post.objects.filter(Q(pk=599)|Q(pk=598))
# ! > dosent work Post.objects.filter(*[Q(pk=i) for i in range(555,565)])


class User(AbstractUser):

    def sfollow(self,username:str,isfollow=True) -> bool:
        followuser = User.objects.filter(username=username)
        if followuser is None:
            return False
        return self.follow(follow=followuser,isfollow=isfollow) 
    
    
    def follow(self, followTo,isfollow= True) -> bool:
        # try:
            print(self.username,followTo.username,isfollow)
            follow: Follow | None = Follow.objects.filter(followed=followTo, followed_by=self).first()
            if isfollow:
                if follow is not None :
                    return True
                Follow(followed=followTo, followed_by=self).save()
            else:
                # follow = Follow.objects.filter(followed=follow, followed_by=self).first()
                if follow is not None:
                    follow.delete()
            return True
        # except:
        #     return False
        
        
    def add_post(self, caption):
        try:
            print(self,caption)
            Post(user=self,caption=caption).save()
            return True
        except KeyError:
            return False

    def followingPosts(self,pageNo=1):
        return Post.get_page(
            self,
            Post.objects
            .filter(user__in= [
                follow.followed for follow in self.following.all()
                ]),
            pageNo
            )


    def serialize(self,CU=None,pageNo=1)->dict:
        return{
                "id": self.id,
                "full_name": self.get_full_name(),
                "short_name":self.get_short_name(),
                "first_name": self.first_name,
                "last_name": self.last_name,
                "email": self.email,
                "username": self.username,
                "is_active": self.is_active,
                "is_anonymous": self.is_anonymous,
                "is_authenticated": self.is_authenticated,
                "is_staff": self.is_staff,
                "is_superuser": self.is_superuser,
                "date_joined": self.date_joined.strftime("%b %d %Y, %I:%M %p"),
                "last_login": self.last_login.strftime("%b %d %Y, %I:%M %p"),                
                "noOfFollowers":self.followers.values("followed_by").distinct().count(),
                "noOfFollowing":self.following.values("followed").distinct().count(),
            }
    def serializeWithPost(self,CU=None,pageNo=1)->dict:
        # print(self,CU)
        return {
            "user":{
                    "isCU": self == CU,
                    "isCUfollows": not self.followers.filter(followed_by=(CU if CU and CU.is_authenticated else False)),
                    **self.serialize(),
                },
            "posts":Post.get_page(self,self.posts,pageNo), 
        }
    
    # u.date_joined,u.first_name,u.email,u.followers,u.following,u.groups,u.id,u.is_active,u.is_anonymous,u.is_authenticated,u.is_staff,u.is_superuser,u.last_login,u.last_name,u.liked_post,u.logentry_set,u.password,u.pk,u.refresh_from_db,u.user_permissions,u.username,u.username_validator,u.validate_unique
    # datetime.datetime(2024, 5, 14, 13, 59, 48, 828523, tzinfo=<UTC>),'','hi@a.co',<django.db.models.fields.related_descriptors.create_reverse_many_to_one_manager.<locals>.RelatedManager at 0x234973151c8>,<django.db.models.fields.related_descriptors.create_reverse_many_to_one_manager.<locals>.RelatedManager at 0x23497315f08>,<django.db.models.fields.related_descriptors.create_forward_many_to_many_manager.<locals>.ManyRelatedManager at 0x234956bd7c8>,     2,True,False,True,False,False,datetime.datetime(2024, 5, 18, 13, 55, 51, 159770, tzinfo=<UTC>),'',<django.db.models.fields.related_descriptors.create_reverse_many_to_one_manager.<locals>.RelatedManager at 0x23497315a48>,<django.db.models.fields.related_descriptors.create_reverse_many_to_one_manager.<locals>.RelatedManager at 0x234973150c8>,'pbkdf2_sha256$260000$Adc4t8TdFEIRa6TVsab2Kg$2JjiHxYGMCwUfEV8ZJdA9NpN8An6AnOEKFgrKQzxtUA=',2,<bound method Model.refresh_from_db of <User: hi@a.co>>,<django.db.models.fields.related_descriptors.create_forward_many_to_many_manager.<locals>.ManyRelatedManager at 0x23497315e08>,     'hi@a.co',<django.contrib.auth.validators.UnicodeUsernameValidator at 0x23494447948>,<bound method Model.validate_unique of <User: hi@a.co>>
    """   
  {
    'id': 2,
    'pk': 2,
    'first_name': '',
    'last_name': '',
    'email': 'hi@a.co',
    'username': 'hi@a.co',
    'password': 'pbkdf2_sha256$260000$Adc4t8TdFEIRa6TVsab2Kg$2JjiHxYGMCwUfEV8ZJdA9NpN8An6AnOEKFgrKQzxtUA=',
    'is_active': True,
    'is_anonymous': False,
    'is_authenticated': True,
    'is_staff': False,
    'is_superuser': False,
    'date_joined': datetime.datetime(2024, 5, 14, 13, 59, 48, 828523, tzinfo=<UTC>),
    'last_login': datetime.datetime(2024, 5, 18, 13, 55, 51, 159770, tzinfo=<UTC>),
    'followers': <django.db.models.fields.related_descriptors.create_reverse_many_to_one_manager.<locals>.RelatedManager at 0x23497aecf08>,
    'following': <django.db.models.fields.related_descriptors.create_reverse_many_to_one_manager.<locals>.RelatedManager at 0x23498065d08>,
    -- 'refresh_from_db': <bound method Model.refresh_from_db of <User: hi@a.co>>,
    -- 'validate_unique': <bound method Model.validate_unique of <User: hi@a.co>>
    'groups': <django.db.models.fields.related_descriptors.create_forward_many_to_many_manager.<locals>.ManyRelatedManager at 0x23497eba3c8>,
    'liked_post': <django.db.models.fields.related_descriptors.create_reverse_many_to_one_manager.<locals>.RelatedManager at 0x23498275288>,
    'logentry_set': <django.db.models.fields.related_descriptors.create_reverse_many_to_one_manager.<locals>.RelatedManager at 0x23498275bc8>,
    'user_permissions': <django.db.models.fields.related_descriptors.create_forward_many_to_many_manager.<locals>.ManyRelatedManager at 0x23498275608>,
    'username_validator': <django.contrib.auth.validators.UnicodeUsernameValidator at 0x23494447948>,
    } """

class Follow(models.Model):
    """Model definition for follower."""

    # TODO: Define fields here
    id = models.BigAutoField(primary_key=True)
    followed_by = models.ForeignKey(
        User, related_name="following", on_delete=models.CASCADE
    )
    followed = models.ForeignKey(
        User, related_name="followers", on_delete=models.CASCADE
    )

    class Meta:
        """Meta definition for follower."""

        verbose_name = "follower"
        verbose_name_plural = "followers"

    def __str__(self):
        """Unicode representation of follower."""
        return "{} followed {}".format(
            self.followed_by.username, self.followed.username
        )  # TODO


class Post(models.Model):
    """Model definition for Post."""

    # TODO: Define fields here
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User,related_name="posts", on_delete=models.CASCADE)
    caption = models.TextField(editable=True, blank=False, null=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        """Meta definition for Post."""

        ordering:list = [
            "-id",
        ]
        verbose_name = "Post"
        verbose_name_plural = "Posts"

    def __str__(self) -> str:
        """Unicode representation of Post."""
        return f"Post : #{self.id} - {self.caption}"

    def edit(self, user: User, new_caption: str) -> bool:
        """Must remember to check the user is user who commented"""
        if user != self.user:
            return False
        try:
            self.caption = new_caption
            self.save()
            return True
        except:
            return False

    # def new_post(user: User, caption: str):
    #     # try:
    #         post = Post(user=user, caption=caption)
    #         post.save()
    #         return True
    #     # except:
    #         # return False

    def add_comment(self, commented_by: User, comment):
        try:
            comment = Comment(commented_by=commented_by, post=self, comment=comment)
            comment.save()
            return True
        except:
            return False

    def add_like(self, liked_by: User, isadd=True):
        try:
            if isadd:
                like = Like.objects.filter(post=self, liked_by=liked_by).first()
                if like:
                    return True
                like_obj = Like(liked_by=liked_by, post=self)
                like_obj.save()
            else:
                like = Like.objects.filter(post=self, liked_by=liked_by).first()
                if like:
                    like.delete()
            return True
        except:
            return False

    def serialize(self, numberOfComment=5) -> dict:
        return {
            "id": self.id,
            "user": self.user.username,
            "caption": self.caption,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "likes": self.likes.values("liked_by").distinct().count(),
            "comments": [
                com.get_dict()
                for com in self.comments.all().order_by("-id")[:numberOfComment]
            ],
        }

    def get_page(user:User, posts:iter, pageNo: int = 1) -> dict:
        print(user)
        if not user.is_authenticated:
            user = None
        post_list = posts.order_by("-id")
        pages = Paginator(post_list, 10)
        # pages.ELLIPSIS = "see all"
        if type(pageNo) is not int:
            try:
                pageNo = int(pageNo)
            except:
                pageNo = 1
        if pageNo > pages.num_pages:
            pageNo = pages.num_pages

        page: Page = pages.get_page(pageNo)
        return {
            "pageNo": page.number,
            "posts": [
                {
                    **post.serialize(),
                    "postedByCU": post.user == user,  # CU for current user
                    "likesCU": post.likes.filter(liked_by=user).first()
                    is not None,  # CU for current user
                    # **serialize("python", [post])[0],
                }
                for post in page.object_list
            ],
            "last": pages.num_pages,
            "perPage": pages.per_page
            # ,"total": pages.count
            ,
            "arrayOfPages": list(pages.page_range),
            "arrayOfPagesEllided": list(pages.get_elided_page_range()),
            "nextPage": page.next_page_number() if page.has_next() else False,
            "previousPage": (
                page.previous_page_number() if page.has_previous() else False
            ),
        }


class Like(models.Model):
    """Model definition for Like."""

    # TODO: Define fields here
    id = models.BigAutoField(primary_key=True)
    post = models.ForeignKey(Post, related_name="likes", on_delete=models.CASCADE)
    liked_by = models.ForeignKey(
        User, related_name="liked_post", on_delete=models.CASCADE
    )

    class Meta:
        """Meta definition for Like."""

        verbose_name = "Like on post"
        verbose_name_plural = "Like on posts"

    def __str__(self):
        """Unicode representation of Like."""
        # return "like on '{}'".format(self.post.caption)
        return "like on '{}'" % (self.post.caption)


class Comment(models.Model):
    """Model definition for Comment."""

    # TODO: Define fields here
    id = models.BigAutoField(primary_key=True)
    post = models.ForeignKey(Post, related_name="comments", on_delete=models.CASCADE)
    comment = models.TextField(editable=True, max_length=200)
    commented_by = models.ForeignKey(
        User, related_name="commented_post", on_delete=models.CASCADE
    )

    def edit(self, user: User, new_comment: str):
        """Must remember to check the user is user who commented"""
        if user is not self.commented_by:
            return False
        try:
            self.comment = new_comment
            self.save()
            return True
        except:
            return False

    def get_dict(self):
        return {
            "id": self.id,
            "username": self.commented_by.username,
            "comment": self.comment,
        }

    class Meta:
        """Meta definition for Comment."""

        verbose_name = "Comment on post"
        verbose_name_plural = "Comment on posts"
        ordering = [
            "-id",
        ]

    def __str__(self):
        """Unicode representation of Comment."""
        # return "Comment on '{}'" % (self.post.caption)
        return f"Comment {self.comment} on '{self.post.caption}'"

    # def __repr__(self):
    #     return '<#%i - %s: %s>' % (self.id,self.post,self.comment)
