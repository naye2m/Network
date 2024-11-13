import random
from network.models import User, Post

# names = [
#     "Sampson Cunningham", "Dorsey Casey", "Janna Mcpherson", "Jolene Vargas",
#     "Tabitha Riddle", "Wong Wilkinson", "Witt Dunlap", "Romero Blair",
#     "Lilly Fernandez", "Keisha Mayer", "Marcia Davenport", "Benton Hunt",
#     "Mcknight Hobbs", "Glenda Whitfield", "Leonard Barry", "Lyons Atkins",
#     "Dorthy Wood", "Mari Donaldson", "Toni Black", "Molly Owen",
#     "Puckett Lowe", "Hammond Nash", "Latasha Kemp", "Robbins Steele",
#     "Paul Berg", "Lott Holder", "Mavis Mcknight"
# ]

# for name in names:
#     first_name, last_name = name.split()
#     username = first_name.lower() + last_name.lower()
#     User.objects.create_user(username=username, first_name=first_name, last_name=last_name, password="password123")


# Sample captions for posts
captions = [
    "Just finished reading a great book!",
    "Enjoying a sunny day at the beach.",
    "Had an amazing dinner tonight!",
    "Coding late into the night. #programming",
    "Exploring new technologies.",
    "Great workout session this morning!",
    "Feeling grateful today.",
    "Just launched a new project!",
    "The sunset was breathtaking.",
    "Learning Django is fun!"
]
def genPost():
    # Create posts for each user
    for user in User.objects.all():
        # Generate a random number of posts for each user (between 1 and 3)
        num_posts = random.randint(1, 3)
        for _ in range(num_posts):
            caption = random.choice(captions)
            Post.objects.create(user=user, caption=caption)

# Get a sample user and their posts
user = User.objects.first()
# print(user.posts.all())  # Lists all posts by the first user

# List all posts
# for post in Post.objects.all():
    # print(f"{post.user.username}: {post.caption}")
