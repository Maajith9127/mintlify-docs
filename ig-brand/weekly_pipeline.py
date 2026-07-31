import os
import sys
import time
import requests
import json
import csv
from datetime import datetime

# Ensure utf-8 output to prevent Windows charmap encoding errors
if sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

APIFY_TOKEN = os.environ.get("APIFY_TOKEN")
BASE_DIR = r"C:\Docs\mintlify-docs\ig-brand"

def check_token():
    if not APIFY_TOKEN:
        print("🚨 ERROR: APIFY_TOKEN environment variable is not set.")
        sys.exit(1)
    
    url = f"https://api.apify.com/v2/users/me?token={APIFY_TOKEN}"
    try:
        response = requests.get(url)
        if response.status_code != 200:
            print(f"❌ Failed to connect. Status Code: {response.status_code}")
            sys.exit(1)
    except Exception as e:
        print(f"❌ Connection Error: {e}")
        sys.exit(1)

def run_apify_actor(payload, name="Scraper"):
    print(f"\n🚀 Triggering Apify {name}...")
    url = f"https://api.apify.com/v2/actors/apify~instagram-scraper/runs?token={APIFY_TOKEN}"
    
    response = requests.post(url, json=payload)
    if response.status_code != 201:
        print(f"❌ Failed to start run: {response.text}")
        sys.exit(1)
        
    run_data = response.json()["data"]
    run_id = run_data["id"]
    dataset_id = run_data["defaultDatasetId"]
    
    print(f"✅ Run started! Run ID: {run_id}")
    print("⏳ Waiting for scraper to finish (this may take a few minutes)...")
    
    # Poll for completion
    status_url = f"https://api.apify.com/v2/actor-runs/{run_id}?token={APIFY_TOKEN}"
    while True:
        status_resp = requests.get(status_url).json()["data"]
        status = status_resp["status"]
        
        if status == "SUCCEEDED":
            print("✅ Scrape Complete!")
            break
        elif status in ["FAILED", "ABORTED", "TIMED-OUT"]:
            print(f"❌ Scrape failed with status: {status}")
            sys.exit(1)
            
        print(f"   Status: {status}... sleeping for 10 seconds.")
        time.sleep(10)
        
    # Get Dataset
    print("📥 Downloading Dataset...")
    dataset_url = f"https://api.apify.com/v2/datasets/{dataset_id}/items?token={APIFY_TOKEN}"
    items_resp = requests.get(dataset_url)
    return items_resp.json()

def phase_1_viral_discovery():
    print("\n" + "="*50)
    print("🔍 PHASE 1: AUTOMATED VIRAL DISCOVERY")
    print("="*50)
    
    # We will search these broad tags for viral hits
    seed_hashtags = [
        "https://www.instagram.com/explore/tags/dopaminedetox/",
        "https://www.instagram.com/explore/tags/digitaldetox/",
        "https://www.instagram.com/explore/tags/stoicmindset/",
        "https://www.instagram.com/explore/tags/screentime/",
        "https://www.instagram.com/explore/tags/monkmode/",
        "https://www.instagram.com/explore/tags/deepwork/",
        "https://www.instagram.com/explore/tags/disciplineequalsfreedom/"
    ]
    
    payload = {
        "directUrls": seed_hashtags,
        "resultsType": "posts",
        "resultsLimit": 50,  # Increased from 5 to 50 so it actually digs deep into the Top posts
        "searchType": "hashtag",
        "searchLimit": 1,
    }
    
    print(f"Prepared payload to scan {len(seed_hashtags)} massive hashtags.")
    
    # Actually trigger the scrape
    dataset = run_apify_actor(payload, name="Hashtag Discovery Scraper")
    
    print("\n" + "-"*30)
    discovered = {}
    
    # Calculate exactly 14 days ago (timezone-aware to fix deprecation warning)
    from datetime import timezone
    two_weeks_ago = datetime.now(timezone.utc).timestamp() - (14 * 24 * 60 * 60)
    
    for item in dataset:
        username = item.get("ownerUsername")
        # Ensure it has a timestamp, otherwise skip
        post_timestamp = item.get("timestamp")
        if not post_timestamp:
            try:
                # Sometimes apify uses takenAt
                post_timestamp = item.get("takenAt", 0)
            except:
                post_timestamp = 0
                
        # Parse timestamp safely
        if isinstance(post_timestamp, str):
            try:
                # convert "2026-07-20T10:00:00.000Z" to timestamp
                dt = datetime.strptime(post_timestamp.split('.')[0].replace('Z', ''), "%Y-%m-%dT%H:%M:%S")
                post_timestamp = dt.timestamp()
            except:
                pass
                
        if username and username not in discovered:
            discovered[username] = {
                "post_url": item.get("url", ""),
                "likes": item.get("likesCount", 0) or 0,
                "views": item.get("videoViewCount") or item.get("videoPlayCount") or 0,
                "timestamp": post_timestamp
            }
            
    print(f"Scraped {len(discovered)} unique accounts. Applying Viral Filters...\n")
    
    # Sort them by highest views
    sorted_accounts = sorted(discovered.items(), key=lambda x: x[1]["views"], reverse=True)
    
    # SUPER STRICT FILTER:
    # 1. Must be from the last 14 days
    # 2. Must have > 100,000 views OR > 10,000 likes
    viral_accounts = []
    for u, d in sorted_accounts:
        if d["timestamp"] >= two_weeks_ago:
            if d["views"] >= 100000 or d["likes"] >= 10000:
                viral_accounts.append((u, d))
    
    if not viral_accounts:
        print("⚠️ No massive viral hits (>100k views in the last 14 days) found in this sample.")
        print("This means nobody posted a banger in the last 50 hashtag posts. Try increasing resultsLimit to 500.")
    else:
        print(f"🎯 FOUND {len(viral_accounts)} MASSIVE OUTLIERS (Last 14 Days):\n")
        for username, data in viral_accounts[:15]:
            print(f"🔥 @{username}")
            print(f"   Profile: https://www.instagram.com/{username}")
            print(f"   Viral Post: {data['post_url']}")
            print(f"   Engagement: {data['likes']:,} Likes | {data['views']:,} Views\n")
        
    print("(Note: The weak 0-like accounts were mathematically filtered out!)")

def phase_2_profile_scrape():
    print("\n" + "="*50)
    print("🔥 PHASE 2: COMPETITOR PROFILE SCRAPING")
    print("="*50)
    
    target_urls = [
        "https://www.instagram.com/dailystoic/?hl=en",
        "https://www.instagram.com/theeverydaystoic/?hl=en",
        "https://www.instagram.com/pathsofstoicism/?hl=en",
        "https://www.instagram.com/stoicismdaily/?hl=en",
        "https://www.instagram.com/mindsetofstoics/?hl=en",
        "https://www.instagram.com/motivation2study/reels/?hl=en",
        "https://www.instagram.com/mystudymotivations/?hl=en",
        "https://www.instagram.com/tiiiziana.nicola/",
        "https://www.instagram.com/p/DOEVC47iF3k/"
    ]
    
    payload = {
        "directUrls": target_urls,
        "resultsType": "posts",
        "resultsLimit": 50,  # Limits to 50 posts per profile to keep the scrape fast but comprehensive
        "searchType": "hashtag",
        "searchLimit": 1,
    }
    
    print(f"Prepared payload to scrape {len(target_urls)} direct profiles/posts.")
    
    dataset = run_apify_actor(payload, name="Profile Scraper")
    
    # Save the raw dataset to reels.json and posts.json as requested
    reels_path = os.path.join(BASE_DIR, "reels.json")
    posts_path = os.path.join(BASE_DIR, "posts.json")
    
    with open(reels_path, "w", encoding="utf-8") as f:
        json.dump(dataset, f, indent=2)
        
    with open(posts_path, "w", encoding="utf-8") as f:
        json.dump(dataset, f, indent=2)
        
    print(f"\n✅ SUCCESS! Saved {len(dataset)} items directly to:")
    print(f"   - {reels_path}")
    print(f"   - {posts_path}")

def phase_3_process_and_queue():
    print("\n" + "="*50)
    print("📈 PHASE 3: DATA PROCESSING & GENERATING QUEUE")
    print("="*50)
    
    reels_path = os.path.join(BASE_DIR, "reels.json")
    if not os.path.exists(reels_path):
        print("❌ Error: reels.json not found. Run Phase 2 first.")
        sys.exit(1)
        
    with open(reels_path, "r", encoding="utf-8") as f:
        dataset = json.load(f)
        
    from datetime import timezone
    two_weeks_ago = datetime.now(timezone.utc).timestamp() - (14 * 24 * 60 * 60)
    
    valid_posts = []
    
    for item in dataset:
        # Check Timestamp
        post_timestamp = item.get("timestamp") or item.get("takenAt")
        if not post_timestamp: continue
        
        if isinstance(post_timestamp, str):
            try:
                dt = datetime.strptime(post_timestamp.split('.')[0].replace('Z', ''), "%Y-%m-%dT%H:%M:%S")
                post_timestamp = dt.timestamp()
            except:
                continue
                
        # Must be from last 14 days
        if post_timestamp < two_weeks_ago:
            continue
            
        views = item.get("videoViewCount") or item.get("videoPlayCount") or 0
        likes = item.get("likesCount", 0) or 0
        
        # Calculate a basic score to sort by (Views + Likes*10)
        score = views + (likes * 10)
        
        valid_posts.append({
            "username": item.get("ownerUsername", "unknown"),
            "url": item.get("url", ""),
            "views": views,
            "likes": likes,
            "caption": str(item.get("caption", ""))[:150].replace('\n', ' ') + "...",
            "score": score
        })
        
    # Sort by score descending
    valid_posts = sorted(valid_posts, key=lambda x: x["score"], reverse=True)
    
    # Grab the top 50
    top_50 = valid_posts[:50]
    
    print(f"✅ Extracted {len(valid_posts)} posts from the last 14 days.")
    print(f"📝 Generating top_50_queue.mdx...")
    
    mdx_path = os.path.join(BASE_DIR, "top_50_queue.mdx")
    with open(mdx_path, "w", encoding="utf-8") as f:
        f.write("---\n")
        f.write('title: "Weekly Content Queue"\n')
        f.write('description: "The Top 50 Viral Outliers to Remix this Week"\n')
        f.write("---\n\n")
        
        f.write("> **System Data:** Mathematically filtered from proven competitor accounts. Only showing posts from the **last 14 days** ranked by highest engagement.\n\n")
        
        for i, post in enumerate(top_50, 1):
            f.write(f"### {i}. @{post['username']}\n")
            f.write(f"- **URL:** [{post['url']}]({post['url']})\n")
            f.write(f"- **Stats:** {post['likes']:,} Likes | {post['views']:,} Views\n")
            f.write(f"- **Caption Snippet:** `{post['caption']}`\n")
            f.write(f"- [ ] Remixed & Posted\n\n")
            f.write("---\n\n")
            
    print(f"🎉 SUCCESS! Your viral queue is ready at: {mdx_path}")

if __name__ == "__main__":
    check_token()
    # phase_1_viral_discovery()
    # phase_2_profile_scrape()
    phase_3_process_and_queue()
    print("\nPipeline execution complete!")
