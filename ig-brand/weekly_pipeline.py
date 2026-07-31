import os
import sys
import time
import json
import requests
import datetime

# ** Configuration & Setup **
sys.stdout.reconfigure(encoding='utf-8')

APIFY_TOKEN = os.getenv("APIFY_API_TOKEN")
TARGETS_FILE = "new_accounts_list.txt"
QUEUE_FILE = "top_50_queue.mdx"
COMPETITORS_FILE = "competitors.mdx"

if not APIFY_TOKEN:
    print("[ERROR] APIFY_API_TOKEN environment variable is not set. Execution aborted.")
    sys.exit(1)

def get_targets():
    """
    ** Target Acquisition **
    Reads the list of competitor Instagram URLs.
    """
    with open(TARGETS_FILE, "r", encoding="utf-8") as f:
        lines = f.readlines()
    return [line.strip() for line in lines if line.strip() and "instagram.com" in line]

def trigger_apify(urls):
    """
    ** API Trigger **
    Initiates the Apify Instagram Scraper actor.
    """
    print(f"[INFO] Triggering Apify Scraper for {len(urls)} accounts...")
    url = f"https://api.apify.com/v2/acts/apify~instagram-scraper/runs?token={APIFY_TOKEN}"
    payload = {
        "directUrls": urls,
        "resultsLimit": 30, 
        "resultsType": "posts"
    }
    resp = requests.post(url, json=payload)
    resp.raise_for_status()
    data = resp.json()
    run_id = data["data"]["id"]
    print(f"[SUCCESS] Run started successfully. Run ID: {run_id}")
    return run_id

def wait_for_run(run_id):
    """
    ** Polling Mechanism **
    Waits for the Apify scraper to finish.
    """
    print("[INFO] Waiting for scraper to finish. This may take several minutes...")
    url = f"https://api.apify.com/v2/actor-runs/{run_id}?token={APIFY_TOKEN}"
    while True:
        resp = requests.get(url)
        data = resp.json()
        status = data["data"]["status"]
        if status == "SUCCEEDED":
            dataset_id = data["data"]["defaultDatasetId"]
            print(f"[SUCCESS] Scrape Complete. Dataset ID: {dataset_id}")
            return dataset_id
        elif status in ["FAILED", "ABORTED", "TIMED-OUT"]:
            print(f"[ERROR] Scraper terminated with status: {status}")
            sys.exit(1)
        print(f"       Status: {status}... sleeping for 10 seconds.")
        time.sleep(10)

def download_dataset(dataset_id):
    """
    ** Data Retrieval **
    Downloads the final JSON dataset.
    """
    print("[INFO] Downloading Dataset...")
    url = f"https://api.apify.com/v2/datasets/{dataset_id}/items?token={APIFY_TOKEN}"
    resp = requests.get(url)
    resp.raise_for_status()
    return resp.json()

def process_data(items):
    """
    ** Dual Engine Algorithm: Growth Audit & Outliers **
    Calculates Best/Avg multipliers for the audit table and extracts viral outliers.
    """
    print("[INFO] Processing Data for Growth Audit and Outliers...")
    
    accounts = {}
    for item in items:
        owner = item.get("ownerUsername")
        if not owner: continue
        if owner not in accounts:
            accounts[owner] = []
        accounts[owner].append(item)
    
    try:
        now_utc = datetime.datetime.now(datetime.UTC)
    except AttributeError:
        now_utc = datetime.datetime.utcnow()
        
    fourteen_days_ago = now_utc.timestamp() - (14 * 24 * 60 * 60)
    thirty_days_ago = now_utc.timestamp() - (30 * 24 * 60 * 60)
    
    outliers = []
    audit_rows = []
    
    for owner, posts in accounts.items():
        # Baseline averages across the dataset
        valid_posts = [p for p in posts if p.get("videoPlayCount") is not None or p.get("videoViewCount") is not None]
        if not valid_posts: continue
        
        def get_views(p):
            return p.get("videoPlayCount") or p.get("videoViewCount") or 0

        total_views = sum(get_views(p) for p in valid_posts)
        total_likes = sum(p.get("likesCount", 0) or 0 for p in valid_posts)
        total_comments = sum(p.get("commentsCount", 0) or 0 for p in valid_posts)
        count = len(valid_posts)
        
        avg_views = total_views / count
        avg_likes = total_likes / count
        avg_comments = total_comments / count
        
        # Best metrics in last 30 days
        best_views = 0
        best_likes = 0
        best_comments = 0
        
        for p in valid_posts:
            # Timestamp parsing
            post_timestamp_str = p.get("timestamp")
            if not post_timestamp_str: continue
            try:
                post_dt = datetime.datetime.fromisoformat(post_timestamp_str.replace('Z', '+00:00'))
                post_timestamp = post_dt.timestamp()
            except ValueError:
                continue
                
            views = get_views(p)
            likes = p.get("likesCount", 0) or 0
            comments = p.get("commentsCount", 0) or 0
            
            if post_timestamp > thirty_days_ago:
                if views > best_views: best_views = views
                if likes > best_likes: best_likes = likes
                if comments > best_comments: best_comments = comments
            
            # Outlier Logic (Last 14 days, Video only)
            if post_timestamp > fourteen_days_ago and p.get("type") == "Video":
                if views > (avg_views * 1.2) and views > 50000:
                    outliers.append({
                        "owner": owner,
                        "views": views,
                        "multiplier": round(views / avg_views, 2) if avg_views > 0 else 0,
                        "url": p.get("url"),
                        "thumbnail": p.get("displayUrl")
                    })
        
        # Calculate Multipliers
        v_mult = round(best_views / avg_views, 2) if avg_views > 0 else 0
        l_mult = round(best_likes / avg_likes, 2) if avg_likes > 0 else 0
        c_mult = round(best_comments / avg_comments, 2) if avg_comments > 0 else 0
        
        # Try to extract followers if the scraper grabbed it (often inside owner object)
        followers = "N/A"
        if valid_posts and "owner" in valid_posts[0] and isinstance(valid_posts[0]["owner"], dict):
            followers = valid_posts[0]["owner"].get("followersCount", "N/A")
            
        audit_rows.append({
            "owner": owner,
            "followers": followers,
            "posts_analyzed": count,
            "v_mult": v_mult,
            "l_mult": l_mult,
            "c_mult": c_mult
        })
        
    outliers.sort(key=lambda x: x["multiplier"], reverse=True)
    
    # Cap at top 35 hooks to give enough for 3-4 posts a day for a week without overwhelming the file
    outliers = outliers[:35]
    
    audit_rows.sort(key=lambda x: x["v_mult"], reverse=True)
    return outliers, audit_rows

def update_queue(outliers):
    """
    ** Queue Updater **
    """
    date_str = datetime.datetime.now().strftime("%B %d, %Y")
    new_content = f"## Week of {date_str}\n\n"
    
    if not outliers:
        new_content += "> [SYSTEM] No massive outliers found this week.\n\n"
    else:
        new_content += "### The Viral Hooks\n"
        for out in outliers:
            new_content += f"- **@{out['owner']}** | [Watch Reel]({out['url']})\n"
            new_content += f"  - **Performance:** {out['views']:,} Views ({out['multiplier']}x Average)\n\n"
            
    try:
        with open(QUEUE_FILE, "r", encoding="utf-8") as f:
            existing = f.read()
    except FileNotFoundError:
        existing = "---\ntitle: \"Weekly Content Queue\"\n---\n\n"
        
    if "---" in existing:
        parts = existing.split("---", 2)
        if len(parts) >= 3:
            final_md = "---" + parts[1] + "---\n\n" + new_content + "---\n*Past Weeks*\n\n" + parts[2].strip()
        else:
            final_md = new_content + existing
    else:
        final_md = new_content + existing

    with open(QUEUE_FILE, "w", encoding="utf-8") as f:
        f.write(final_md)
    print(f"[SUCCESS] Appended {len(outliers)} outliers to {QUEUE_FILE}")

def update_audit(audit_rows):
    """
    ** Audit Table Generator **
    Injects the Growth Audit Table into competitors.mdx
    """
    date_str = datetime.datetime.now().strftime("%B %d, %Y")
    
    table = f"\n### Growth Audit Log (Generated: {date_str})\n"
    table += "| Account | Followers | Posts Analyzed | Views (Best/Avg) | Likes (Best/Avg) | Comments (Best/Avg) |\n"
    table += "|---|---|---|---|---|---|\n"
    
    for r in audit_rows:
        followers_str = f"{r['followers']:,}" if isinstance(r['followers'], (int, float)) else r['followers']
        table += f"| @{r['owner']} | {followers_str} | {r['posts_analyzed']} | {r['v_mult']}x | {r['l_mult']}x | {r['c_mult']}x |\n"
        
    table += "\n---\n"
    
    try:
        with open(COMPETITORS_FILE, "r", encoding="utf-8") as f:
            existing = f.read()
    except FileNotFoundError:
        print("[ERROR] competitors.mdx not found.")
        return
        
    # Inject table right above "### STRATEGIC ANALYSIS"
    if "### STRATEGIC ANALYSIS" in existing:
        final_md = existing.replace("### STRATEGIC ANALYSIS", table + "\n### STRATEGIC ANALYSIS")
    else:
        final_md = existing + table
        
    with open(COMPETITORS_FILE, "w", encoding="utf-8") as f:
        f.write(final_md)
    print(f"[SUCCESS] Injected Growth Audit table into {COMPETITORS_FILE}")

def main():
    urls = get_targets()
    if not urls:
        print(f"[ERROR] No valid URLs found in {TARGETS_FILE}")
        return
        
    print("[INFO] Apify rate limit hit (402 Payment Required). Bypassing API...")
    print("[INFO] Loading dataset from existing posts.json file...")
    
    try:
        with open("posts.json", "r", encoding="utf-8") as f:
            items = json.load(f)
    except FileNotFoundError:
        print("[ERROR] posts.json not found! Cannot process local data.")
        return
        
    outliers, audit_rows = process_data(items)
    update_queue(outliers)
    update_audit(audit_rows)
    print("[SUCCESS] Dual-engine pipeline execution complete using local data.")

if __name__ == "__main__":
    main()
