---
type: ProjectLayout
title: Yelp Academic Dataset
colors: colors-a
date: '2025-09-11'
client: ''
description: >-
  I created this project to analyze the Yelp academic dataset.
featuredImage:
  type: ImageBlock
  url: /images/bg3.jpg
  altText: Project thumbnail image
media:
  type: ImageBlock
  url: /images/bg3.jpg
  altText: Project image
code: |

  This is the first script I wrote in SQL for this particular project.  This script creates tables in the SQLite database for each of the indicated tables in the JSON files with a column for each indicated variable that has an object associated with it (whether it be some type of numerical value or a string or a boolean).
  
  ```
  -- Table for business data
  CREATE TABLE IF NOT EXISTS businesses (
      business_id TEXT PRIMARY KEY,
      name TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      postal_code TEXT,
      latitude REAL,
      longitude REAL,
      stars REAL,
      review_count INTEGER,
      is_open INTEGER,
      attributes TEXT, -- Storing as a JSON string
      categories TEXT,
      hours TEXT -- Storing as a JSON string
  );
  
  -- Table for user data
  CREATE TABLE IF NOT EXISTS users (
      user_id TEXT PRIMARY KEY,
      name TEXT,
      review_count INTEGER,
      yelping_since TEXT,
      useful INTEGER,
      funny INTEGER,
      cool INTEGER,
      elite TEXT,
      fans INTEGER,
      average_stars REAL,
      compliment_hot INTEGER,
      compliment_more INTEGER,
      compliment_profile INTEGER,
      compliment_cute INTEGER,
      compliment_list INTEGER,
      compliment_note INTEGER,
      compliment_plain INTEGER,
      compliment_cool INTEGER,
      compliment_funny INTEGER,
      compliment_writer INTEGER,
      compliment_photos INTEGER
  );
  
  -- Table to link friends (many-to-many relationship)
  CREATE TABLE IF NOT EXISTS friends (
      user_id TEXT,
      friend_id TEXT,
      PRIMARY KEY (user_id, friend_id),
      FOREIGN KEY (user_id) REFERENCES users(user_id),
      FOREIGN KEY (friend_id) REFERENCES users(user_id)
  );
  
  -- Table for review data
  CREATE TABLE IF NOT EXISTS reviews (
      review_id TEXT PRIMARY KEY,
      user_id TEXT,
      business_id TEXT,
      stars REAL,
      useful INTEGER,
      funny INTEGER,
      cool INTEGER,
      text TEXT,
      date TEXT,
      FOREIGN KEY (user_id) REFERENCES users(user_id),
      FOREIGN KEY (business_id) REFERENCES businesses(business_id)
  );
  
  -- Table for tip data
  CREATE TABLE IF NOT EXISTS tips (
      tip_id INTEGER PRIMARY KEY AUTOINCREMENT, -- Added a primary key
      user_id TEXT,
      business_id TEXT,
      text TEXT,
      date TEXT,
      compliment_count INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(user_id),
      FOREIGN KEY (business_id) REFERENCES businesses(business_id)
  );
  
  -- Table for check-in data
  CREATE TABLE IF NOT EXISTS checkins (
      checkin_id INTEGER PRIMARY KEY AUTOINCREMENT, -- Added a primary key
      business_id TEXT,
      date TEXT,
      FOREIGN KEY (business_id) REFERENCES businesses(business_id)
  );
  ```

  This is the Python code I used to import the data into the SQLite database tables that I created.  As is evident the SQLite3 library was imported into the script first.  The script is carefully designed to weed out any ghost entries in the tables, including reviews/tips/checkins by users that are not in the users table, reviews/tips/checkins of businesses that are not in the business table, etc.  This ensures data integrity.

  ```
  import sqlite3
  import json
  
  # --- Configuration ---
  DB_FILE = "yelp.db"
  JSON_FILES = {
      'business': 'business.json',
      'review': 'review.json',
      'user': 'user.json',
      'tip': 'tip.json',
      'checkin': 'checkin.json'
  }
  
  # --- Database Connection ---
  conn = sqlite3.connect(DB_FILE)
  cur = conn.cursor()
  cur.execute("PRAGMA foreign_keys = ON;")
  
  def process_file(table_name, file_name, valid_users=None, valid_businesses=None):
      """
      Processes a JSON file, with optional validation for user and business IDs.
      """
      print(f"⏳ Processing {file_name} for table '{table_name}'...")
      count = 0
      skipped = 0
      with open(file_name, 'r', encoding='utf-8') as f:
          for line in f:
              try:
                  data = json.loads(line)
  
                  # --- VALIDATION STEP ---
                  if valid_users and data.get('user_id') not in valid_users:
                      skipped += 1
                      continue
                  if valid_businesses and data.get('business_id') not in valid_businesses:
                      skipped += 1
                      continue
                  # --- END VALIDATION ---
  
                  # Special handling for certain tables
                  if table_name == 'businesses':
                      data['attributes'] = json.dumps(data.get('attributes', {}))
                      data['hours'] = json.dumps(data.get('hours', {}))
                  elif table_name == 'users':
                      data.pop('friends', None) # Friends are handled separately
                  elif table_name == 'checkins':
                      business_id = data.get('business_id')
                      dates = data.get('date', '').split(', ')
                      checkin_data = [(business_id, date_str) for date_str in dates if date_str]
                      cur.executemany("INSERT OR IGNORE INTO checkins (business_id, date) VALUES (?, ?)", checkin_data)
                      count += len(checkin_data)
                      continue
  
                  columns = ', '.join(data.keys())
                  placeholders = ', '.join(['?'] * len(data))
                  sql = f"INSERT OR IGNORE INTO {table_name} ({columns}) VALUES ({placeholders})"
                  cur.execute(sql, list(data.values()))
                  count += 1
                  
              except (json.JSONDecodeError, KeyError) as e:
                  print(f"⚠️ Could not process line: {line.strip()}. Error: {e}")
      conn.commit()
      if skipped > 0:
          print(f"✅ Finished {file_name}. Inserted {count} records. Skipped {skipped} records with invalid foreign keys.")
      else:
          print(f"✅ Finished {file_name}. Inserted {count} records.")
  
  def process_friends(file_name, valid_users):
      """Populate the friends table, validating that both users in a pair exist."""
      print(f"⏳ Processing {file_name} to build friend links...")
      count = 0
      with open(file_name, 'r', encoding='utf-8') as f:
          for line in f:
              try:
                  data = json.loads(line)
                  user_id = data['user_id']
                  friends_list = data.get('friends', 'None').split(', ')
                  if friends_list and friends_list[0] != 'None':
                      valid_friends = [(user_id, friend_id) for friend_id in friends_list if friend_id in valid_users]
                      if valid_friends:
                          cur.executemany("INSERT OR IGNORE INTO friends (user_id, friend_id) VALUES (?, ?)", valid_friends)
                          count += len(valid_friends)
              except (json.JSONDecodeError, KeyError) as e:
                  print(f"⚠️ Could not process line: {line.strip()}. Error: {e}")
      conn.commit()
      print(f"✅ Finished friend processing. Inserted {count} valid friend links.")
  
  # --- Main Execution ---
  if __name__ == "__main__":
      
      # Process businesses and users first, as they are primary tables
      process_file('businesses', JSON_FILES['business'])
      process_file('users', JSON_FILES['user']) # This is now the "Pass 1" for users
  
      # Load all valid IDs into memory for efficient lookups
      print("\n🧠 Loading all existing IDs into memory for fast validation...")
      cur.execute("SELECT user_id FROM users")
      valid_user_ids = {row[0] for row in cur.fetchall()}
      cur.execute("SELECT business_id FROM businesses")
      valid_business_ids = {row[0] for row in cur.fetchall()}
      print(f"👍 Found {len(valid_user_ids)} users and {len(valid_business_ids)} businesses.\n")
      
      # Now process all the linked data
      process_friends(JSON_FILES['user'], valid_user_ids) # This is "Pass 2" for friends
      process_file('reviews', JSON_FILES['review'], valid_users=valid_user_ids, valid_businesses=valid_business_ids)
      process_file('tips', JSON_FILES['tip'], valid_users=valid_user_ids, valid_businesses=valid_business_ids)
      process_file('checkins', JSON_FILES['checkin'], valid_businesses=valid_business_ids)
      
      print("\n🎉 Database import complete! Your data is in 'yelp.db'.")
      conn.close()
  ```
  This SQL script finds the top 3 businesses that have reviews for them with the highest average stars and highest number of reviews also (they won't be in the top 3 and only have one review)
  ```
  SELECT b.business_id, b.name, b.review_count, AVG(r.stars)
  FROM businesses AS b
  LEFT JOIN reviews AS r ON b.business_id = r.business_id
  GROUP BY b.business_id
  ORDER BY AVG(r.stars) DESC, b.review_count DESC
  LIMIT 3
  ```
  This SQL script finds the lowest 3 businesses ranked by average stars given in their reviews with the most number of reviews (they won't be ranked lowest and only have 1 review).
  ```
  SELECT b.business_id, b.name, b.review_count, AVG(r.stars)
  FROM businesses AS b
  LEFT JOIN reviews AS r ON b.business_id = r.business_id
  GROUP BY b.business_id
  ORDER BY AVG(r.stars) ASC, b.review_count DESC
  LIMIT 3
  ```
  
  This SQL code searches the reviews of the three worst businesses (according to Yelp ratings) for positive words
  ```
  SELECT
      date,
      review_id,
      business_id,
      text
  FROM
      reviews
  WHERE
      business_id IN ('Snjy6RdQIkwVMLyaq5Lq1A', 'qOL-4ErJkPF154WWg1y_dA', 'vfVN8Xyng39wedBUO8V9HQ')
      AND (
  		text LIKE '%amazing%'
          OR text LIKE '%kind%'
          OR text LIKE '%nice%'
          OR text LIKE '%excellent%'
  		OR text LIKE '%love%'
      );
  ```
	
  This SQL code searches the reviews of the top three most popular businesses for positive words
  ```
  SELECT
  	date,
  	review_id,
      business_id,
      text
  FROM
      reviews
  WHERE
      business_id IN ('1RqfozJoosHAsKZhc5PY7w', '-siOxQQcGKtb-04dX0Cxnw', '4-P4Bzqd01YvKX9tp7IGfQ')
      AND (
  		text LIKE '%amazing%'
          OR text LIKE '%kind%'
          OR text LIKE '%nice%'
          OR text LIKE '%excellent%'
  		OR text LIKE '%love%'
      );
  ```
  This SQL script finds the frequency of negative words for each number of stars for all reviews.
  ```
  SELECT
  	  stars,
      COUNT(review_id)
  FROM
      reviews
  WHERE
  		text LIKE '%awful%'
          OR text LIKE '%terrible%'
          OR text LIKE '%disgusting%'
          OR text LIKE '%lousy%'
  		OR text LIKE '%rude%'
  GROUP BY 
  	stars
  ```
  
  This SQL code ranks zip codes in descending order by the number of stars they average for their respective businesses. 
  ```
  SELECT
  	b.postal_code,
  	AVG(r.stars)
  FROM businesses b
  LEFT JOIN reviews r ON b.business_id = r.business_id
  GROUP BY b.postal_code
  ORDER BY AVG(r.stars) DESC
  ```
  
  I spent a lot of time with this and needed some research and help with this (it uses two CTEs and then refers to both for the final calculation), but this script creates a metric for the most improved business by comparing the average rating for the first 30 reviews to the average rating for the most recent 30 reviews.
  
  ```
  -- Step 1: Rank every test for each author in two ways (ascending and descending)
  WITH RankedStars AS (
    SELECT
      b.business_id,
  	b.name,
      r.stars,
  	r.date,
      -- Ranks reviews from oldest to newest (1, 2, 3...)
      ROW_NUMBER() OVER(PARTITION BY b.business_id ORDER BY Date ASC) as RankAsc,
      -- Ranks reviews from newest to oldest (1, 2, 3...)
      ROW_NUMBER() OVER(PARTITION BY b.business_id ORDER BY Date DESC) as RankDesc
    FROM
      businesses b
    LEFT JOIN reviews r ON b.business_id = r.business_id
  ),
  
  -- Step 2: Use the ranks to calculate the average of the first 3 and last 3 scores
  BusinessAverages AS (
    SELECT
      business_id,
  	name,
      -- Average the stars ONLY IF its ascending rank is 1, 2, or 3
      AVG(CASE WHEN RankAsc <= 30 THEN stars END) AS AvgFirst3,
      -- Average the stars ONLY IF its descending rank is 1, 2, or 3
      AVG(CASE WHEN RankDesc <= 30 THEN stars END) AS AvgLast3
    FROM
      RankedStars
    GROUP BY
      business_id
  )
  
  -- Step 3: Select the final data and calculate the improvement metric
  SELECT 
    business_id,
    name,
    ROUND(AvgFirst3,4),
    ROUND(AvgLast3,4),
    ROUND((AvgLast3 - AvgFirst3),4) AS Improvement
  FROM 
    BusinessAverages
  ORDER BY 
    Improvement DESC;
  ```
  This SQL script helps me study the characteristics of the users who reviewed the highest rated business with the most number of reviews on Yelp.
  ```
  SELECT 
  	*
  FROM 
  	users u
  LEFT JOIN 
  	reviews r
  ON 
  	u.user_id = r.user_id
  WHERE
  	business_id = "1RqfozJoosHAsKZhc5PY7w"
  ```
  This script allows me to view the reviews for the best business on Yelp
  ```
  SELECT 
    date,
    stars,
    text
  FROM 
    reviews
  WHERE
  	business_id = "RgbpKI14sbP3bQtDDY_rzA"
  ORDER BY
  	date ASC
  ```
  Those are all the scripts I used for this project.
---
This project was done as part of a class on Coursera for learning SQL.  I learned a lot about the data in this dataset using these methods and became much more comfortable using the SQL query language after having finished this project.  The SQL code for creating the original tables, the Python code for importing the data into the tables, and the SQL code for querying the database are all included on this website.

[CODE_HERE]

By inspection of the JSON files that can be downloaded here: [https://business.yelp.com/data/resources/open-dataset/](https://business.yelp.com/data/resources/open-dataset/) it can be determined what tables are needed and what columns are needed in each of those tables.  Upon further inspection it can be determined what are good choices for the primary keys and the foreign keys to ensure data integrity.  For example, since each business has one and only one identification for it, that is a good primary key for the business table (that's the definition of a primary key).  Since friends also have to be established users, a foreign key for the friends table is the friend ID that refers back to a specific user ID in the users table.  Having plenty of interconnections like this ensures that there aren't ghost entries when the data is imported and that if there are, they are identified and can be removed before data analysis begins.  Here's a snippet of a JSON file from the original dataset:

{"user_id":"2WnXYQFK0hXEoTxPtV2zvg","name":"anonymized","review_count":665,"yelping_since":"2008-07-25 10:41:00","useful":2086,"funny":1010,"cool":1003,"elite":"2009,2010,2011,2012,2013","friends":"LuO3Bn4f3rlhyHIaNfTlnA, j9B4XdHUhDfTKVecyWQgyA, pypZb3V5TXHOnlTj-qLSrw, 7cDAEEnwfSqG2Lv8Vanr3Q, irkRHMqg9oSt7lv3OSiNkA, 6jEeCpNEU9l8CT9X566Oog, W5VmqP2T4O_aAMq5YwTJzQ, wzyY07YiGwgRKCIcsrBuRQ, IL2yTm7zGmsTF4iKVSZ0ug, AB9JedB0R5wWIsAGjXoMWw, 9AB3-Tw3DBfuEIr0HIXSpg, H0gxrggG__efXkGXRQP1_A, rNNFRAaaIpzJZ1KBrRorZw, FaYXjGgLtetpCCiKmEsq9g, ePSSiFQ8kvQ9-6nAa_pMBA, Tz1FRUGfq7xBf4-ZGlvLZg, wC5FDlL4d5dstl8q91_dQw, H5EY1CeIx4m_pNChKZkq7A, BIdFgt_4owlS1VUcTuZ4fA, 84FcN7Bq9BnL3wPtnyye6w, PCm1knzIbOaziikbVDz-jw, Sa48aWAqDy1wMRgRFGiRHw, DECwE-Th7VEa5PWWoru5iw, IVM7P6IjfWj_sUhLrL9FFg, gjauhhlrvelyFY2N63T8CA, iT1li5FhUudWmviBMMdS7w, 1scP-I_N0AsKLVdzPe3YIw, zHdltdICrilxbqdHFxtVBA, lYC-DFT7VOdxSM6oY2Vm1g, W-OZPeKh4R0GlywUsl09PA, 1unQbxCkgwrZMRmox79LCg, 5NfYjjb1E4c_StGEGXXUXQ, qNrHLZPurBWJzeAMkFLvvA, hmwKaQN_f0dnymp7XH2R2w, F_5_UNX-wrAFCXuAkBZRDw, fQq-PBKARvUGfBnmch9Dqg, 9SS6aiTox2ZVYsMRocUXlw, mbSAI_HwP_6zoXKKhHPdwA, FxC6MmMx6aGxGgHn-f0VJg, JqvMnkshOzWASc6O8D_93A, m7iiJlloCRfWaCPwQwTmpg, 31kTLGYOdRJyE35IDG9h5w, Oqxg1l6lF51kutGD_wha5w, yEQ31-ob7K810vc9XpWxBw, I-02Mz45H7siHsjjgVxPgQ, hxrlveyL89yvIpwnm7MgPQ, wHb0eK5x6hXLVw7-rhU5dw, bm2DqfP4P454FjEtCbZdkQ, kRAYxjb5My1RpKHFn8XRuQ, vj_24j43AL3r-5foxukPRQ, GqzoKYXv6F1O85bhywyoSA, 9i6L_mn_4MLQGwmE-L2QYA, sxDzq79U8v14F9rWb_FsZw, _SVfoi3YUFNHswsfZUO9mg, 0S6EI51ej5J7dgYz3-O0lA, xMKpXNaicvI-BgSA69yp9A, LE8a_KkliLJrzt7SV1DWfw, G9Vb6yQ047TC3O_-GG4WZA, QVAmRIrCxhYLqh7wl4Vlog, IMXjcE230TnjG-tnj6y6VA, UFEa58IGAoBECUPIsId7rA, 2l0O1EI1m0yWjFo2zSt71w, 0lDl1Jg1Qz2KhvkfJKk6fw, V7VAbouEnCt39fsA1MM6RA, tQRw0aZcyns3i2V7PxygKw, bczrJHwNtA1Q3G2nlb5Haw, GGWjA8v479feCo6OPTLQOg, D1LeNWYRYX5Y3QU501k3tQ, 53bZ_EsXH71L7iFs5MP9_w, 4BxI8ZBIpJiSbLhQfHtkng, 40MywB-9aaAPmqRkThlaWw, EtBea-v-2JAvZdfg7XH7iA, Q-gYf7i8jZRtEl4fDedFTg, M0aIB-0yrginraKifvcCBA, AO_Tge7mRTQV4iOy3fg8fA, RV0_WrvLVazyD9OMYsXZRQ, SVtNctg9k2QOGj0znfHVwQ, 0ObIfSgndeeR_kGlo1S7Ww, qHe62_xv6DyripSqnCtHqw, Z0xqgGaxDrRd-0HsVIvdAQ, GYndf-h6dAwpGP0lDBz2Wg, wvo6CDYUY6gD6q_iLjmAOQ, 5hS9juuaN3kTV5f13nfFZQ, lNDRQXkwHD-EspEp3Qu9FQ, 64ZlhCqwiENT5W0NA6IIaQ, Vx-l5rI0xAiN4SeBonrgkw, vBAejKR6g7vZSfLh5kG_iA, rF77YRYKrxb__FGLQx707g, RQfU47edGoGg4CA5MhpabQ, GkkXSqLoNnbTduSuYlz-oA, -vTrhRbmEzB8Ax87bfL-qA, IEIId9sziM12IkejeFH_VA, fh0aHWleYNQbuRjOO-C0HA, Z51O8-MOLfclC1rKE4LB6w, 9tcmF1c4XJuS4zlXXd1zKg, zK5TDuMTVpEg7IgHtgSH9g, 1Db1gmMmDf3MXNMeUa46fw, BwFEjsr9yLqdszAmAxFYQg, 011145MPIsSoYleZh6z0ug, GaK9oql0-zyIOYP_v1NuEw, KUohiVbxXpEQlULLiGHvmw, OsfcqC_fjDnp8-aRZcEkfw, MxnNT3MSGco7hQN6-pCNow, 5MHJZRMIn_HUwJ_SY47HDA, AgTkBCxuinzStHNRKyVRiw, 6vZiVk2vyOVqkeNpcGHxfA, gvYdMI_M6clQDGkrAvbRuA, Z2PeqEKL87UUG3vfMBRd4w, ouJuVAEPnnEC_zhcrSf5GA, sPk1JlWVFj1ZUiKABZSPdQ, XpisHXRTX5bWEgUDI2b2Cw, qVBQucop3Y4NQzxeF0kaLA, WYFZSienSiFNBhYk8esU-g, YUxH_F9jMGAe7PIe8DO34Q, 5xyUUCEtv0fLEQrmJuZnRA, kOp2P-rCf9-DgphhCqgB0g, 0kSXMbNFo7mdwTPj4iQv9A, XeWIIUbGwxS6YKrbddBtFw, 9YS3MUQ8nrpc9-03ughw-A, bn9PemZypYvWcwLHeum8eA, _H1VvAk65d2z-2-XuLHkmw, _Rzlx58zV2nJo56Qzod_wg, lZbuh6DY1bcvpbBN5gIeTA, ALxxzaDVFzFB3PQjB8jWdg, b9kyfGQQxNOxQ9rZWvF2gQ, czPJqivL2To9bes_qOdkdQ, sOwomiAx2JYbYiJEIKmCsA, wZPizeBxMAyOSl0M0zuCjg, n3bnVD8lpArpW1K4n1qosQ, xbDWFe-Nvgz_LbtPrrJ_WA, xLpWuP6lwGmelpV4AuFrKA, 5H3N-n2yn2gjmBDUT0sh0Q, wGrd7vRKAwfOjKRaLVf2jg, 3-t_uaPKVQQmOUAIu7C-PA, 2gtFix-psqBr60FUvnSJuQ, VhJpXZ_RQHzfY6xwVE8YTA, 7rfBi8WiNHliL-cAqMGNew, xt26UePJKMVPcZIUuTTl8w, j8YxElKHhbg1ghQDSI1v3Q, -fH5KxV_TYGWOVCuLyYnIw, 9woUfX_PsUiZcRY0aSWfEQ, 2PYxmh4hYRo6Mfc1WniqIw, Jc-eMfA8huyqz5Z1w8qcAA, lHnMp5AxsBHyky2RG238Uw, HFK_VC0A29ukKcsK3tmMsA, gvvL29LucecJQRXdq01VFw, 6tIEwzNJAFgClCyw5LytpA, HDx0IqafD9eQULAZCgLWpQ, Zrz0DKRSACSVxiGPJruDcA, 6b-xMDKuXglIDVRf08eKJg, nuG5UpCvswNdDXJP_Efl8Q, dfYNTBw--CYlZbFz581kYQ, Bi1kvjelB72fAI9WhaARBw, -YUFeE4jC0JtfTe3QEMsGA, rB6RXS0dwwcXtfKttyMM9g, V6APOG0S2_edEoT6LHWYww, ccjoL-gEBKBXiOApHn2Bhw, wtbLadxNNSAyc6wmhWMGXA, QFjqxXn3acDC7hckFGUKMg, 2v-QMFXBVcFjKi0knb0cmQ, 9cjIQqdgTBZ6q-MW2hzyAg, djxnI8Ux8ZYQJhiOQkrRhA, yFLNHDlCriteboCVKjtpbA, LF_0Z_ulZ7ssicTYk3lEGw, h-6iSjGMTMCmCwJbu34l4g, wy4NZPGAonzuz9RzSDtDNA, HudBrYGK8EXeLWpQhEFm8A, QnZs7dt3fEBbUyb6tRXqqQ, K7UyFiWPVC_O_ZzZEn4OsA, sBswn4u5KkmMyWVCV8mTrA, Q4ziRHRf7gzEwTf2d0Zecg, 5ZVgALU4fA5VjBvbIolhHQ, MppPWYfLv7n5OoWDy22K4g, A5LiLVxDDEoTDCqGjRTbfw, ngsiA5XnbIiBb-mXdNvMSA, v7LpBlX8tN6s6oMk01AHow, 8Lc3-TTHjExd79GSQIHnAw, 2fiO9EVfhc96-G_lMo0Ntw, JArlA8GMRnk7TaDnFVRSsw, AEIIG42xzArGlnSYvKD1cA, EiwxlbR8fb68lMgEXhcWKA, yfIp-V7gWAh9xdpL85kUUQ, DTEa4cIRdr6T4jaIw1xubg, -ulvjJmtH7qHV3IBBkExLg, WWP06D5BncW30kSOkOC6WA, awfsXBbYhF20guziE-n5Uw, i1_zHvBxOPrGG90BEwlRbA, HXyN-DMrwbhckKW_-Iku2A, qGLkFXVmnovZB_tMIi_ICQ, a68fTwBqLwYDp80ZPQo4NQ, TE9o4cWvNXg5IYcjAwI5hg, RysxQN49TCn9e00w9zlEVA, pPpKjxY6cAU6KnS-rKtl1A, HSjCQggmCepXir2R3OYW-w, tsXYlZLFIihPW-kOU-vJ9A, DWDiUpAjrRcdU3bIOfc9gg, -uBmDm-WLzhue5KQUiol9g, -TIvi4-ch_SHe-5NhEesRg, lLr1ZXNBk6In8dQgUB4AvQ, acRIQd_VuyOsUZ8sWiarzw, pMM1oKAIWGPRo-1IawgrDQ, wq-jm7sjJT1HFAJZRBW1gw, U105BxvfSFDkxC2zIOYmDA, orYuFrC0lqw6-IoO2R4-Fw, D4d1P-h_k792Az6kl1u5ig, gjhzKWsqCIrpEd9pevbKZw, VBmxc-Xe4b_sQyQA-S566w, _1htne96OKfOfs84iX5tTA, QJI9OSEn6ujRCtrX06vs1w, No-z4NfZSN7kOdSucW6eaQ, he5QBJkHmjc1Q_G3jgeigQ, _aSs5dSAabuwnXUGBPzASw, QzAmLGM7sD7rHBJg8ALkmg, YZUNuWWIjt1yxN3FnjkH6g, a21yEFhTXEJImb9hGl0JyQ, CYQNdjHCL9nedkLMfKLHmg, fRfkYoWS5NGh803Daj-Dww, 8dWVRK9v6TrhD-63TTEoIw, ZpN3vwmMttBZ4i6F6V1twQ, PT7El6PhrLu3hZZN7uxqqw, Jauy1DNjM7B_SXFoiq42Xw, O_d0kwOIwhS7O9b-9ukv5w, DBvQvSt0cCxst4NkzEUtyA, UJcXryv3GnXik-dauejBdQ, CGVQmem0Yf-mIXIWlLUInw, VrKFAUmz8jGcBK8EzEsr1Q, IzJ36jX6V6ky5BtoN-Agng, uAa2Hu6XtuUPxX_B3uS8Aw, 9YRFLVFVbHGAJ1weFx5zqw, XyTQyDgopK1NINHB0yUtQw, G7hvNCuawT12NLd9YxeU5w, 1MOJ_KIVRPyhTTaKIG4ybw, jrMxBHW3SlUGVGYWvPsHWA, cO29gBJx1ZBWWhw_5CincQ, gmaWUt02_ixItBN2gQsMGQ, RrKRWiee9f3HqsLG_7o6_Q, amKULZardzCIiU1Gfc0aJg, 4rrd9a5IbmR5pt9Qzm3k1w, lPNsKsD-HvdgkzfGq-Gjig, a_amzPmwoXWtL4eKhGa7-g, _rdBCIHPfTPoew7EcrCt3w, o3Zv4AolGeRr-xX7QhESUg, F7vgCzNV-cSGvTn4szQDuQ, HFysxgsNHZ-Tu0RlDoxHUg, 95McYrxCoSbksnsT_lDjhQ, G5ATcER3ZQ4SPUgZ_KgasQ, Hze9r06sEb-EXEFPwwBTIA, K0HS7eDWCAxJ8x1yL9flMg, eSlOI3GhroEtcbaD_nFXJQ, WItmi0by6gmtA7mJHbCBPQ, HCP1pR_44Pw5_BiWAp47-Q, MsV3_SMzqtceVTz4ESva0w, XEwkGRM3z6UWISIgmqx2hA, 6p1NDChnIpGl29Ce3cMKWg, SqNxf5YVm0HP9h5ueDmNkg, ottOuy7FZtUV2HnBfhVk0w, mH_vxQd4iLSX-ru29bbLaw, 0WcUP0kdhdx4A-L9d7mHgw, F4HpMcQ8pvJQOXEEqIcBQg, DJaQV3r153ZsBQArxAPl8g, sCxXYROTaP3NnCcxiD-rnw, 0XaQ6vvgy5pi5XAaz12mOg, ptRmUSG4dr3HGOVTl0IyTg, LzIy9-GxA1ptKnBe411fiQ, LgaOupJKBudIO5CglhB68A, 7seAKcEuDpZlP01BBn_3AQ, HSZQmJLUK0vhJMVQd00rrA, IG99ev0nntm7wtQbs3-gJg, rbI0-TMYBFLnUsymbWyO9g, Ku7l1UkMmXaRj-vdb7GadA, ndyuks7hXNIIY8nciaoPgg, TH6EYFn2X14wj1EZsxN8IA, s-zGDwiw_ZrsRkMejIiMyg, 796_TY6u-ShEox5DEgckmg, 5EtP4mj-_p6Z9qMV-wpW8A, BPapTstvHstufikOg2Np6g, YhjzX1HvCaP5bRK4koem2w, VyxnyQcP8Ywv-MjLYiM6Sg, VsrrK19gm-XqZsNuYygFXA, hOwNzTU0g0UzNLNQhhuHEQ, hS-gMamr37sQG30dr7luXA, kOUzW4porPxN0n54Z0eHMQ, BfBXCzskhU05fVyeC5H30w, 9x1eDg8Wuc6rJw1HtIVTmA, UwZXeXC7z1inksQo0RFbTw, 0Ja53of_Mhg2LfG2gaOvYQ, gQVH0CSYRWjuwr8UTKMuog, _OHaoJFgB9-Nf05Y_IeabQ, yUXLAU91w_SYIPBfIwQL1w, CMo6ohUYJyj8rb__U4XjbA, WEEM93gTzWd1Gm3yKjvmBQ, w2ptlD8gg7ZhzSNZIe_ceQ, 09FIEAXAr6JMfNm13O36-Q, qHbzv9WmGl3ITsxuqL-C4g, JIg7AE1bstZ4TasMfy-I_g, ENC3P_VLhTb20mWQ7XUB7w, tS5qu1uKPSNZbXiZ389rVg, b0cWkZxzX-iFeZCFgLedug, 7IJ1bG1pNgYUlWq3veeplQ, 2VGW1A4Fh0KFjpri2aae8g, caqyhZNed0coSCclnzD5lA, df2pDSN-NMdAA_3J7H3GSw, RMRVRXD-18xUEDVt_hp1HQ, 67ZqpAzDT3zjjnsl5Oo4xg, I9rRZrxnKjlQvuzzoNUh-g, P36J7o10_YSIywaWX9YjCA, eYSWRbs5EhxUVgLL2BcFqA, nKwEANYoKJvcEzDzP4TI_w, S4bY9skLK9-fqoZhjSc9Qw, 0z_va0YJSHa5U0xD2mKEeQ, oggnXzn8KHUdSmCQLL4MtQ, o7-03yvENTyd8CnynKxkBg, 21RaUT9pd2GaoVxwBcKTnQ, 5z5_yKnseEAVI5j6uqkPbA, 83JD89DyKqEl4tjjK5Ad3A, d2PHWR5WW6Yj4LXG5ljmgg, cuvdqdPS5Nh8tpDrO3tMsA, ASCGYpPvcJvo-c8rn8BHoQ, h2o_QnX0PJpbtXRcOzs7NA, xo0VYNkeBAycezI0u26r3w, mbp_UmBlhCeJXAqxoK6foA, 1iCi6ah5a4zxQqssjPg_kg, 0pG9dQe4rjQ-tpjXZPf-6w, ZCfZ-UL24SHOb4ELvBvOLg, ZEMuTlDmukE_vKj6pcjkSg, OgHsx8oKTrxFLcLEDvb8lQ, TVh4dL0lArYXkSJ6WWh_Vg, cMlb-kMPRapJP8LBeK6vdQ, TktITr9cOZM-GMNne4abuQ, DMCZuncYPMN7T1SMdN-Y5Q, OqH85SAF0oLijVY_SeAk8A, BI_PXSF5M61S8O9bqR7VVA, piEVx0FaVhYm6SbQYX8erw, 30Pch18LE63MyRYOC34-8g, UnG4LPz49UWbGvBzVxQaMQ, uGSIOloqL56QKsLTvR_D7g, adxyOPvCYbr7LFhqMQp1SQ, 2lmBAfQWAI06ziEfN5NkCQ, T7xoyml0r3QTW5_16zKzAw, rCx7tb3toOJUsvdOeqYY0g, 4YIgqJiqqZKPIdoPz2Zv6w, w8yoASmlp6RSaZkFD38M1Q, RkaRfAUwjKebGe2tg7uuXQ, R_E1c9mHOIvZT0DFnOSoxg, MKgpIiuzs752BJjPeCW0cw, II_l7zYdMevzk0PFXN3T4g, 1iGkJM2v790RJGo3lJSUAg, gEso8fW-bktDlGeNxbGJ-Q, hxDeqPbPwkKEFXOfK7av9A, SXYOQBtf8VaOu6JuJGNulg, IIbvCWGtIrIS5nvX4xXwOQ, CZQUtmO5NIY-bZWkCqHeJg, -9rBe1pnWodYlfr7qXpBAA, 88jrTyFviMKJWn44JZFeQg, 3-a6VJVZ7Ga_xoKhnhe0qQ, SOCNCNisrOk-queHDhtpLA, 3yBusRwPYtMCpaBkEyhyJw, zy7MzuEjrSzYmXiLy5PV1A, uYDeoofS3HsD4quTa57ucg, p8kHm5pzSevEG7sJdGkIYA, uSyPtqgXYsAwdiPvostnLg, TGdnpYdQgPnKAd7JoC37pQ, W9InhAGYesLGqrGFWh_vbg, aGgNm24n_jpgD52nhbJiHw, WbEcyPmZT7j15CzncVBu7g, ZFxU8-XX9R2Oe1UgtV4Fdw, 3TJcP0stfxjWGsLuGQgQdg, rCfgLHJPaIi-6G8fGZ7B1A, FbN6Uqlqsoxjv2l5dnsQhA, 9w32ooe10bil7oIr5ycQAw, nfIXitXhfIuATNdeH3BYpA, NPG4PWirYbZ6P49c2J9ikA, HvxTJwdgJeaUmMWUDndN5g, JbMHLU7HOiNjACKDiZvGfw, vkBqXCyfOe5IkyD6zoXLRA, sm6AzP6HSQhI9j9V_oiPWA, PoKRQcy2qWPYhVZSEUZG6g, mrO2R1Uc_DmKKEtH2VTNDg, 5Ujdrr6RwPMjoZskZGj2cw, m6OZG66JPXVIZRkqm6reDg, n8UuPQ-nodu1xMHQheGsfg","fans":52,"average_stars":3.32,"compliment_hot":89,"compliment_more":13,"compliment_profile":10,"compliment_cute":17,"compliment_list":3,"compliment_note":66,"compliment_plain":96,"compliment_cool":119,"compliment_funny":119,"compliment_writer":35,"compliment_photos":18}

As can be seen, this JSON file "users.JSON" is a good candidate for a table, and each one of these variables in quotes followed by a colon is a good candidate for a column.  So there is an intuitive data structure built into this particular dataset that allows for smooth transitioning into a SQLite database.  This is not guaranteed by any means in a given dataset.  This is a very "nice" dataset for SQL analysis.

After careful inspection of the files, careful coding for the SQL tables, I had a good sense of the data and the connections between the tables, and so I was in a good position to create an ERD (Entity-Relationship Diagram) using Microsoft Paint.   It looks like this:

![ERD for Yelp academic dataset](/images/ERD-project.png)

The primary purpose of the project was to get a sense of what it meant to be a 5 star business and what it meant to be a 1 star business.  To boil down the findings into their essence, I will simply say the best businesses had the highest frequency of positive words in the reviews and the worst businesses had the highest frequency of negative words in their reviews.  These words that were analyzed are linked to instrinsic properties of the object to which they are applied.  Words like excellence, and quality, and good, and kind, and words like lousy, poor, nasty, and rude are simple but they are strong differentiators between good businesses and bad businesses.

Statistical significance testing was done to confirm that there was indeed a significant difference in the number of occurrences of these words in the reviews of the best businesses versus the worst businesses based on the total number of reviews (Chi-squared testing).  When the negative words appeared in the best business reviews it was virtually always a "false positive" or perhaps better stated to be a false occurrence of a negative word (in other words, they weren't being accused of being the negative word, the negative word was being used in a different context to distinguish the good business from a bad business, so it was not being used in the normal context that it would be applied to an actually bad business).  When the positive words were found in the worst business reviews they were also almost always "false positives" or in other words the word "kind" showed up but it was in the context of, for example, "The customer service team was not kind to me."  So there was some noise in the data but even with the noise there was a very strongly significant difference in the frequency of the positive words when the best businesses were compared with the worst businesses as determined by their average rating on Yelp.

When the users were analyzed that essentially made the best business on Yelp the best business by writing all the reviews for it, as predicted there was no particular characteristic that was common to all the users.  They were all different when the various parameters describing the users were compared, there was no common feature that stood out amongst the different users.  This was predictable because a good business is a good business to a person who yelps a lot, and they are a good business to a person who yelps only a little.  A good business is a good business to a very popular user, and it is a good business to a user with few friends.  A good business is a good business to long-standing Yelp users, and a good business is a good business to very new Yelp users.  This study lends credence to the Yelp construct as it confirms that there are instrinsic properties to the highest rated businesses that transcend any distorting features of the user groups who are leaving the reviews.  For example it is possible that the best business is only the best business because the people who frequent that business are users on Yelp whose average stars per review is always 5.  In other words, they never leave bad reviews.  That was not the case though.  So there is some definite legitimacy to the best and worst businesses on Yelp.  There are some predictable trends and characteristics of these businesses.  A visual example of this is the number of occurrences of negative words like lousy, nasty, rude etc. versus the number of stars on Yelp, seen below:

![Graph of negative words in reviews of various ratings](/images/negative_word_frequency.png)

It's amazing how sharp the drop is in negative word occurrences (y-axis) as the rating on Yelp (x-axis) increases.  It requires an exponent in the regression model to capture the behavior of this relationship.

One of the most interesting findings during my analysis was that there was a very wide distribution of average rating per business based on zip code (it could be the case that all zip codes had an average rating that was about the same, but this was far from the reality in the data).  This confirms a suspicion that the location of a business can be somehow related to the number of stars that business receives for its ratings.  The extent to which this is true is astounding.  Although deep investigation into this phenomenon was not made, it is something worth further study (for example, determining whether there was a statistically adequate number of businesses per zip code to be making distinctions in the average rating for those zip codes is a question that remains unanswered at this time).  Perhaps this finding ties back to the old saying "Location! Location! Location!" in business circles.

Thank you for considering this data analysis on the Yelp academic data set.  I hope it was informative and educating to you.  If you have any feedback or comments please send me an email at [andyhayles@gmail.com](mailto:andyhayles@gmail.com).