import json
import csv
import os
from datetime import datetime
from collections import defaultdict

def load_json(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def main():
    base_dir = r"C:\Docs\mintlify-docs\ig-brand"
    profiles_file = os.path.join(base_dir, "ProfileHashes.json")
    posts_file = os.path.join(base_dir, "posts.json")
    reels_file = os.path.join(base_dir, "reels.json")
    output_file = os.path.join(base_dir, "competitor_data.csv")

    profiles = load_json(profiles_file)
    posts = load_json(posts_file)
    reels = load_json(reels_file)

    # Group all posts by username
    user_posts = defaultdict(list)
    
    # Extract posts from ProfileHashes.json
    for profile in profiles:
        username = profile.get("username")
        if profile.get("latestPosts"):
            for post in profile["latestPosts"]:
                post["ownerUsername"] = username
                user_posts[username].append(post)

    # Extract posts from posts.json
    for post in posts:
        username = post.get("ownerUsername")
        if username:
            user_posts[username].append(post)

    # Extract posts from reels.json
    for reel in reels:
        username = reel.get("ownerUsername")
        if username:
            user_posts[username].append(reel)

    # Make profiles dictionary
    profile_dict = {p.get("username"): p for p in profiles}

    # Prepare rows for CSV
    headers = [
        "#", "User", "Name of the account", "Word used to find it", 
        "Bio (If green, has call to action for a product; If it only has a link blue)",
        "# of followers", "# of posts", "Date Accessed", "Best Engagement",
        "Likes: Best/Avg", "Comments: Best/Avg", "Views: Best/Avg",
        "1", "2", "3"
    ]
    
    rows = []
    today = datetime.now().strftime("%Y-%m-%d")

    all_usernames = set(profile_dict.keys()).union(user_posts.keys())

    for idx, username in enumerate(sorted(all_usernames), start=1):
        prof = profile_dict.get(username, {})
        posts_list = user_posts.get(username, [])
        
        # Deduplicate posts by id
        unique_posts = {}
        for p in posts_list:
            if "id" in p:
                unique_posts[p["id"]] = p
        posts_list = list(unique_posts.values())

        name = prof.get("fullName", "")
        bio = prof.get("biography", "").replace("\n", " ")
        followers = prof.get("followersCount", "")
        total_posts_count = prof.get("postsCount", "")

        # Luke's Rule: Only analyze content from the last 14-30 days
        # Let's filter posts to only include those from the last 30 days for a good sample size
        recent_posts = []
        thirty_days_ago = datetime.now().timestamp() - (30 * 24 * 60 * 60)
        
        for p in posts_list:
            timestamp_str = p.get("timestamp")
            if timestamp_str:
                try:
                    # Parse ISO format: 2026-04-01T10:17:45.000Z
                    # Replace Z with +00:00 for fromisoformat or just slice it
                    dt = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
                    if dt.timestamp() >= thirty_days_ago:
                        recent_posts.append(p)
                except ValueError:
                    # If parsing fails, skip or include depending on preference
                    pass
        
        posts_list = recent_posts

        likes = [p.get("likesCount", 0) or 0 for p in posts_list]
        comments = [p.get("commentsCount", 0) or 0 for p in posts_list]
        views = [p.get("videoViewCount") or p.get("videoPlayCount") or 0 for p in posts_list]
        
        # Calculate engagement per post (likes + comments)
        for p in posts_list:
            l = p.get("likesCount") or 0
            c = p.get("commentsCount") or 0
            p["_engagement"] = l + c

        # Sort posts by engagement descending
        posts_list.sort(key=lambda x: x.get("_engagement", 0), reverse=True)

        best_engagement = posts_list[0].get("_engagement", 0) if posts_list else 0
        
        best_likes = max(likes) if likes else 0
        avg_likes = sum(likes) // len(likes) if likes else 0
        
        best_comments = max(comments) if comments else 0
        avg_comments = sum(comments) // len(comments) if comments else 0
        
        best_views = max(views) if views else 0
        avg_views = sum(views) // len(views) if views else 0

        top1 = posts_list[0].get("url", "") if len(posts_list) > 0 else ""
        top2 = posts_list[1].get("url", "") if len(posts_list) > 1 else ""
        top3 = posts_list[2].get("url", "") if len(posts_list) > 2 else ""

        rows.append([
            idx,
            username,
            name,
            "",  # Word used to find it
            bio,
            followers,
            total_posts_count,
            today,
            best_engagement,
            f"{best_likes}/{avg_likes}",
            f"{best_comments}/{avg_comments}",
            f"{best_views}/{avg_views}",
            top1,
            top2,
            top3
        ])

    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(rows)

    print(f"Data successfully extracted to {output_file}")

if __name__ == "__main__":
    main()
