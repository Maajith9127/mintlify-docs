import json
from datetime import datetime, timezone
from collections import defaultdict

def load_json(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def parse_ts(ts_str):
    if not ts_str:
        return None
    try:
        return datetime.fromisoformat(ts_str.replace('Z', '+00:00'))
    except:
        return None

base_dir = r"C:\Docs\mintlify-docs\ig-brand"
profiles = load_json(f"{base_dir}\\ProfileHashes.json")
posts_data = load_json(f"{base_dir}\\posts.json")
reels_data = load_json(f"{base_dir}\\reels.json")

# Build profile lookup
profile_dict = {p.get("username"): p for p in profiles}

# Group ALL posts by username
user_posts = defaultdict(list)
for profile in profiles:
    username = profile.get("username")
    if profile.get("latestPosts"):
        for post in profile["latestPosts"]:
            post["ownerUsername"] = username
            user_posts[username].append(post)
for post in posts_data:
    username = post.get("ownerUsername")
    if username:
        user_posts[username].append(post)
for reel in reels_data:
    username = reel.get("ownerUsername")
    if username:
        user_posts[username].append(reel)

# Deduplicate
for username in user_posts:
    unique = {}
    for p in user_posts[username]:
        pid = p.get("id")
        if pid:
            unique[pid] = p
    user_posts[username] = list(unique.values())

now = datetime.now(timezone.utc)

# Key accounts to audit
key_accounts = [
    "stoicfromheart", "stoicreflections", "thestoicroad", 
    "breakfree.app", "opalapp", "getbrick",
    "stoicsanity", "pathsofstoicism", "dailystoic",
    "stoicsmindset", "astoicsdaily", "stoicismideas",
    "one_sec_app", "monkeyless.app", "minimalistphone",
    "thedigiminimalist", "beminimalist__", "stoicmonktemple",
    "philosophyflirt"
]

print("=" * 120)
print(f"{'ACCOUNT':<22} {'FOLLOWERS':>10} {'TOTAL':>6} {'LAST 30d':>8} {'LAST 14d':>8} {'LAST 7d':>7} {'AVG LIKES (30d)':>15} {'AVG VIEWS (30d)':>15} {'BEST ENG (30d)':>15} {'STATUS'}")
print("=" * 120)

for username in key_accounts:
    all_posts = user_posts.get(username, [])
    prof = profile_dict.get(username, {})
    followers = prof.get("followersCount", "?")
    
    # Sort by timestamp
    dated_posts = []
    for p in all_posts:
        dt = parse_ts(p.get("timestamp"))
        if dt:
            dated_posts.append((dt, p))
    dated_posts.sort(key=lambda x: x[0], reverse=True)
    
    last_30d = [(dt, p) for dt, p in dated_posts if (now - dt).days <= 30]
    last_14d = [(dt, p) for dt, p in dated_posts if (now - dt).days <= 14]
    last_7d  = [(dt, p) for dt, p in dated_posts if (now - dt).days <= 7]
    
    if last_30d:
        likes_30 = [p.get("likesCount", 0) or 0 for _, p in last_30d]
        views_30 = [(p.get("videoViewCount") or p.get("videoPlayCount") or 0) for _, p in last_30d]
        avg_likes = sum(likes_30) // len(likes_30) if likes_30 else 0
        avg_views = sum(views_30) // len(views_30) if views_30 else 0
        
        best_eng = 0
        for _, p in last_30d:
            eng = (p.get("likesCount") or 0) + (p.get("commentsCount") or 0)
            if eng > best_eng:
                best_eng = eng
    else:
        avg_likes = 0
        avg_views = 0
        best_eng = 0
    
    # Determine status
    if len(last_7d) >= 3:
        status = "VERY ACTIVE"
    elif len(last_14d) >= 3:
        status = "ACTIVE"
    elif len(last_30d) >= 1:
        status = "SLOW"
    else:
        status = "DEAD (No posts in 30d)"
    
    print(f"@{username:<21} {str(followers):>10} {len(dated_posts):>6} {len(last_30d):>8} {len(last_14d):>8} {len(last_7d):>7} {avg_likes:>15,} {avg_views:>15,} {best_eng:>15,} {status}")

print("=" * 120)

# Now print the ACTUAL top 3 recent posts with full engagement for key accounts
print("\n\n")
print("=" * 120)
print("TOP 3 RECENT POSTS WITH FULL DATA (Last 30 Days)")
print("=" * 120)

for username in key_accounts:
    all_posts = user_posts.get(username, [])
    dated_posts = []
    for p in all_posts:
        dt = parse_ts(p.get("timestamp"))
        if dt and (now - dt).days <= 30:
            eng = (p.get("likesCount") or 0) + (p.get("commentsCount") or 0)
            p["_eng"] = eng
            dated_posts.append((dt, p))
    
    dated_posts.sort(key=lambda x: x[1]["_eng"], reverse=True)
    
    if not dated_posts:
        continue
    
    print(f"\n@{username} (Top 3 by engagement, last 30 days):")
    print(f"  {'RANK':<5} {'DATE':<12} {'LIKES':>8} {'COMMENTS':>10} {'VIEWS':>12} {'ENGAGEMENT':>12} {'URL'}")
    for i, (dt, p) in enumerate(dated_posts[:3], 1):
        likes = p.get("likesCount") or 0
        comments = p.get("commentsCount") or 0
        views = p.get("videoViewCount") or p.get("videoPlayCount") or 0
        eng = p["_eng"]
        url = p.get("url", "N/A")
        print(f"  {i:<5} {dt.strftime('%Y-%m-%d'):<12} {likes:>8,} {comments:>10,} {views:>12,} {eng:>12,} {url}")

print("\n" + "=" * 120)
