---
type: ProjectLayout
title: Chess Database Analysis
colors: colors-a
date: '2025-07-12'
client: ''
description: >-
  This project was inspired by a friend and analyzes a database of my personal
  chess games using an interesting technique.
featuredImage:
  type: ImageBlock
  url: /images/bg1.jpg
  altText: Project thumbnail image
media:
  type: ImageBlock
  url: /images/bg1.jpg
  altText: Project image
code:
  ```
  import chess
  import chess.pgn
  import chess.engine
  import pandas as pd
  import time
  import sys
  import os
  import json
  from scipy.stats import linregress
  from tqdm import tqdm
  import subprocess
  import matplotlib.pyplot as plt
  import seaborn as sns
  from collections import defaultdict

  # ==============================================================================
  # --- Configuration ---
  # ==============================================================================

  # --- Player and Game Configuration ---
  PLAYER_NAME_IN_PGN = "Desjardins373"
  PLAYER_PGN_PATH = "goalgames.pgn" 

  # --- Optimal Method Configuration ---
  CHOSEN_METHOD = {
    "name": "Top 3 Moves, Linear Weights",
    "num_moves": 3,
    "weights": [1.0, 0.5, 0.25]
  }

  # --- Analysis Control ---
  START_MOVE = 10
  POSITIONS_PER_GAME = 5

  # --- File Paths ---
  ENGINES_CSV_PATH = "real_engines.csv"
  GRANULAR_LOG_PATH = "granular_analysis_log.csv"
  OUTPUT_GRAPH_PATH = "player_rating_estimate_final.png"
  ORACLE_CACHE_PATH = "oracle_cache.json"
  STATUS_HISTORY_LOG_PATH = "status_history.csv"

  # --- Default Engine Settings ---
  ORACLE_ENGINE_NAME = "stockfish_full_1"
  ORACLE_ANALYSIS_DEPTH = 22
  ORACLE_ANALYSIS_TIMEOUT = 600
  ENGINE_THREADS = 2
  DEFAULT_TEST_DEPTH = 9
  DEFAULT_TEST_TIMEOUT = 0.05

  # --- *** NEW: Engine-Specific Configuration Overrides *** ---
  # Use this to "handicap" engines that are too strong for the test.
  # The script will use the DEFAULT settings unless an engine's name is found here.
  # You can override 'depth', 'time', or both.
  ENGINE_CONFIG_OVERRIDES = {
    "stockfish_elo_1950": {"depth": 4, "time": 0.05},
    "stockfish_elo_2007": {"depth": 4, "time": 0.05},
    "stockfish_elo_2050": {"depth": 4, "time": 0.05},
    # Example for another engine:
    # "dragon": {"depth": 10, "time": 0.02} 
  }

  # ========================================================s======================
  # --- Core Logic ---
  # ==============================================================================

  def open_engine(path):
    """Opens a chess engine, handling potential startup issues."""
    startupinfo = None
    if os.name == 'nt':
      startupinfo = subprocess.STARTUPINFO()
      startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
    stderr_pipe = subprocess.DEVNULL if "leela" in path.lower() else None
    try:
      return chess.engine.SimpleEngine.popen_uci(path, stderr=stderr_pipe, startupinfo=startupinfo)
    except Exception as e:
      print(f"Error opening engine at {path}: {e}", file=sys.stderr)
      return None

  def get_positions_from_pgn(pgn_path, player_name, positions_per_game, start_move):
    """Extracts a list of FENs and the player's move from a PGN file."""
    if not os.path.exists(pgn_path):
      print(f"Error: PGN file not found at '{pgn_path}'.", file=sys.stderr)
      return []
      
    positions = []
    print(f"Processing PGN: {os.path.basename(pgn_path)} for player: {player_name}")
    with open(pgn_path, 'r', errors='ignore') as pgn:
      while True:
        try:
          game = chess.pgn.read_game(pgn)
          if game is None: break
          
          white_player = game.headers.get("White", "")
          black_player = game.headers.get("Black", "")
          if player_name not in white_player and player_name not in black_player:
            continue

          board = game.board()
          positions_in_this_game = 0
          is_player_white = player_name in white_player

          for move in game.mainline_moves():
            is_player_turn = (is_player_white and board.turn == chess.WHITE) or \
                     (not is_player_white and board.turn == chess.BLACK)
            
            if is_player_turn and board.fullmove_number >= start_move:
              if positions_per_game is not None and positions_in_this_game >= positions_per_game:
                break
              positions.append({"fen": board.fen(), "actual_move": move.uci()})
              positions_in_this_game += 1
            board.push(move)
        except Exception as e:
          print(f"Skipping a game due to a parsing error: {e}", file=sys.stderr)
          continue
    return positions

  def get_move_score(move_to_check, oracle_moves, weights):
    """Calculates the score for a move based on the oracle's ranking."""
    score = 0.0
    for i, oracle_move in enumerate(oracle_moves):
      if move_to_check == oracle_move:
        score = weights[i]
        break
    return score

  def log_status_history(log_path, items_completed, total_items, overall_r2, overall_rating, inst_r2, inst_rating):
    """Appends a new status line to a historical CSV log file."""
    try:
      header_needed = not os.path.exists(log_path)
      with open(log_path, 'a', newline='') as f:
        if header_needed:
          f.write("timestamp,items_completed,total_items,overall_r_squared,overall_rating,instantaneous_r_squared,instantaneous_rating\n")

        timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
        overall_rating_str = f"{overall_rating:.2f}" if overall_rating is not None else "N/A"
        overall_r2_str = f"{overall_r2:.4f}" if overall_r2 is not None else "N/A"
        inst_rating_str = f"{inst_rating:.2f}" if inst_rating is not None else "N/A"
        inst_r2_str = f"{inst_r2:.4f}" if inst_r2 is not None else "N/A"
        
        f.write(f"{timestamp},{items_completed},{total_items},{overall_r2_str},{overall_rating_str},{inst_r2_str},{inst_rating_str}\n")
    except Exception as e:
      print(f"Warning: Could not write to status history log: {e}", file=sys.stderr)


  def calculate_rating_from_scores(scores_df, player_score, benchmark_engine_info):
    """Calculates R-squared and rating from a dataframe of scores."""
    engine_scores_df = scores_df[scores_df['engine_name'] != 'player']
    if len(engine_scores_df) < 2 or engine_scores_df['score'].nunique() < 2:
      return None, None
      
    merged_df = pd.merge(benchmark_engine_info, engine_scores_df, on='engine_name')
    if len(merged_df) < 2:
      return None, None

    slope, intercept, r_value, _, _ = linregress(merged_df['score'], merged_df['rating'])
    r_squared = r_value ** 2
    estimated_rating = (slope * player_score) + intercept
    return r_squared, estimated_rating


  def main():
    """Main function to run the position-by-position analysis."""
    print("--- Starting Position-by-Position Rating Estimation Script ---")
    
    # --- 1. Load Engine and Game Data ---
    try:
      engines_df = pd.read_csv(ENGINES_CSV_PATH)
    except FileNotFoundError:
      print(f"Error: Engines CSV file not found at '{ENGINES_CSV_PATH}'. Exiting.", file=sys.stderr)
      return

    all_player_positions = get_positions_from_pgn(PLAYER_PGN_PATH, PLAYER_NAME_IN_PGN, POSITIONS_PER_GAME, START_MOVE)
    if not all_player_positions:
      print(f"No positions found for player '{PLAYER_NAME_IN_PGN}'. Exiting."); return
    print(f"Found {len(all_player_positions)} total positions for player '{PLAYER_NAME_IN_PGN}'.")

    # --- 2. Load Caches and Check Progress ---
    oracle_row = engines_df[engines_df['engine_name'] == ORACLE_ENGINE_NAME]
    if oracle_row.empty:
      print(f"Error: Oracle engine '{ORACLE_ENGINE_NAME}' not found in {ENGINES_CSV_PATH}."); return
    
    benchmark_engine_info = engines_df[engines_df['engine_name'] != ORACLE_ENGINE_NAME]
    engine_names = list(benchmark_engine_info['engine_name'])
    
    oracle_cache = {}
    if os.path.exists(ORACLE_CACHE_PATH):
      with open(ORACLE_CACHE_PATH, 'r') as f:
        try:
          oracle_cache = json.load(f)
          print(f"Loaded {len(oracle_cache)} positions from Oracle cache.")
        except json.JSONDecodeError: print("Oracle cache file is corrupted, starting fresh.")

    # --- 3. Initialize In-Memory Log and Identify Work to Do ---
    full_log_df = pd.DataFrame(columns=['fen', 'engine_name', 'score'])
    if os.path.exists(GRANULAR_LOG_PATH):
      try:
        full_log_df = pd.read_csv(GRANULAR_LOG_PATH)
        if not full_log_df.empty:
          print(f"Found {len(full_log_df)} previously completed analyses in '{GRANULAR_LOG_PATH}'.")
      except (pd.errors.EmptyDataError, KeyError):
         print(f"'{GRANULAR_LOG_PATH}' is empty or malformed. Starting fresh.")
    
    completed_items = set(zip(full_log_df['fen'], full_log_df['engine_name'])) if not full_log_df.empty else set()

    # --- 4. Phase 1: Update Oracle Cache ---
    all_fens_to_process = {p['fen'] for p in all_player_positions}
    fens_needing_oracle = list(all_fens_to_process - set(oracle_cache.keys()))
    
    if fens_needing_oracle:
      print(f"\n--- Phase 1: Caching {len(fens_needing_oracle)} new positions with Oracle Engine ---")
      oracle_engine = open_engine(oracle_row.iloc[0]['path'])
      if not oracle_engine:
        print("Could not start Oracle engine. Exiting.", file=sys.stderr); return
      oracle_engine.configure({"Threads": ENGINE_THREADS})
      
      for fen in tqdm(fens_needing_oracle, desc="Oracle Caching"):
        board = chess.Board(fen)
        limit = chess.engine.Limit(depth=ORACLE_ANALYSIS_DEPTH, time=ORACLE_ANALYSIS_TIMEOUT)
        analysis = oracle_engine.analyse(board, limit, multipv=CHOSEN_METHOD['num_moves'])
        oracle_moves = [info['pv'][0].uci() for info in analysis]
        oracle_cache[fen] = oracle_moves
        with open(ORACLE_CACHE_PATH, 'w') as f: json.dump(oracle_cache, f)
      oracle_engine.quit()
      print("Oracle caching complete.")
    else:
      print("\nOracle cache is already up-to-date.")

    # --- 5. Main Analysis Loop ---
    items_to_analyze = []
    for pos in all_player_positions:
      if (pos['fen'], 'player') not in completed_items:
        items_to_analyze.append({'type': 'player', 'fen': pos['fen'], 'actual_move': pos['actual_move']})
      for name in engine_names:
        if (pos['fen'], name) not in completed_items:
          items_to_analyze.append({'type': 'engine', 'fen': pos['fen'], 'engine_name': name})
    
    num_required_per_pos = len(engine_names) + 1
    total_analyses_in_pgn = len(all_player_positions) * num_required_per_pos

    if not items_to_analyze:
      print("All analyses are already complete. Generating final report.")
    else:
      print(f"\n--- Phase 2: Performing {len(items_to_analyze)} new analyses ---")
      benchmark_engines = {}
      for _, row in benchmark_engine_info.iterrows():
        engine = open_engine(row['path'])
        if engine:
          engine.configure({"Threads": ENGINE_THREADS})
          benchmark_engines[row['engine_name']] = engine
      
      if not benchmark_engines and any(item['type'] == 'engine' for item in items_to_analyze):
        print("Failed to initialize any benchmark engines. Exiting.", file=sys.stderr); return

      pbar = tqdm(total=len(items_to_analyze), desc="Analyzing Items", unit="item")
      granular_header_written = len(completed_items) > 0

      for item in items_to_analyze:
        fen, score = item['fen'], 0
        board = chess.Board(fen)
        oracle_moves = oracle_cache[fen]
        engine_name_for_log = ""

        if item['type'] == 'player':
          score = get_move_score(item['actual_move'], oracle_moves, CHOSEN_METHOD['weights'])
          engine_name_for_log = 'player'
        elif item['type'] == 'engine':
          engine_name_for_log = item['engine_name']
          try:
            # --- Get specific config for this engine ---
            config = ENGINE_CONFIG_OVERRIDES.get(engine_name_for_log, {})
            depth = config.get('depth', DEFAULT_TEST_DEPTH)
            timeout = config.get('time', DEFAULT_TEST_TIMEOUT)
            limit = chess.engine.Limit(depth=depth, time=timeout)
            
            result = benchmark_engines[engine_name_for_log].play(board, limit)
            score = get_move_score(result.move.uci(), oracle_moves, CHOSEN_METHOD['weights'])
          except (chess.engine.EngineError, chess.engine.EngineTerminatedError) as e:
            print(f"\nWarning: Engine '{engine_name_for_log}' failed on FEN {fen}. Error: {e}", file=sys.stderr)
            score = 0.0
        
        new_row_dict = {'fen': fen, 'engine_name': engine_name_for_log, 'score': score}
        
        # --- Append to CSV log file ---
        log_entry_df = pd.DataFrame([new_row_dict])
        log_entry_df.to_csv(GRANULAR_LOG_PATH, mode='a', header=not granular_header_written, index=False)
        granular_header_written = True
        
        # --- FIX: Append new row to in-memory DataFrame efficiently ---
        full_log_df.loc[len(full_log_df)] = new_row_dict
        
        # --- Recalculate and Log Status on Every Item ---
        inst_r2, inst_rating = None, None
        items_for_this_fen = full_log_df[full_log_df['fen'] == fen]
        if len(items_for_this_fen) == num_required_per_pos:
          inst_player_score_row = items_for_this_fen[items_for_this_fen['engine_name'] == 'player']
          if not inst_player_score_row.empty:
            inst_player_score = inst_player_score_row.iloc[0]['score']
            inst_r2, inst_rating = calculate_rating_from_scores(items_for_this_fen, inst_player_score, benchmark_engine_info)

        avg_scores_df = full_log_df.groupby('engine_name')['score'].mean().reset_index()
        overall_player_score_row = avg_scores_df[avg_scores_df['engine_name'] == 'player']
        overall_r2, overall_rating = None, None
        if not overall_player_score_row.empty:
          overall_player_score = overall_player_score_row.iloc[0]['score']
          overall_engine_scores_df = avg_scores_df[avg_scores_df['engine_name'] != 'player']
          overall_r2, overall_rating = calculate_rating_from_scores(overall_engine_scores_df, overall_player_score, benchmark_engine_info)

        log_status_history(STATUS_HISTORY_LOG_PATH, len(full_log_df), total_analyses_in_pgn, overall_r2, overall_rating, inst_r2, inst_rating)
        pbar.update(1)

      pbar.close()
      print("\nClosing benchmark engines...")
      for engine in benchmark_engines.values(): engine.quit()

    # --- 6. Final Report and Graph ---
    # (This section remains unchanged)
    print("\n--- Generating Final Report from Granular Log ---")
    if not os.path.exists(GRANULAR_LOG_PATH):
      print("Log file not found. Cannot generate report."); return
      
    final_log_df = pd.read_csv(GRANULAR_LOG_PATH)
    if final_log_df.empty:
      print("Log file is empty. Cannot generate report."); return

    avg_scores_df = final_log_df.groupby('engine_name')['score'].mean().reset_index()
    avg_scores_df.rename(columns={'score': 'average_hit_score'}, inplace=True)

    player_avg_score_row = avg_scores_df[avg_scores_df['engine_name'] == 'player']
    if player_avg_score_row.empty:
      print("No data for player found in log. Cannot estimate rating."); return
    player_avg_score = player_avg_score_row.iloc[0]['average_hit_score']
    
    engine_avg_scores = avg_scores_df[avg_scores_df['engine_name'] != 'player']
    final_df = pd.merge(benchmark_engine_info, engine_avg_scores, on='engine_name')
    
    if len(final_df) < 2:
      print("Not enough benchmark engine data to create a rating estimate."); return

    if final_df['average_hit_score'].nunique() > 1:
      slope, intercept, r_value, _, _ = linregress(final_df['average_hit_score'], final_df['rating'])
      final_r_squared = r_value ** 2
      final_player_rating = (slope * player_avg_score) + intercept
      
      print(f"\n--- Final Results ---")
      print(f"Analysis complete over {final_log_df['fen'].nunique()} positions.")
      print(f"Player's Final Average Score: {player_avg_score:.4f}")
      print(f"Final Estimated Rating for {PLAYER_NAME_IN_PGN}: {final_player_rating:.0f}")
      print(f"Final R-squared: {final_r_squared:.4f}")

      plt.figure(figsize=(12, 8))
      sns.regplot(x='rating', y='average_hit_score', data=final_df, ci=None, line_kws={'color':'red', 'linestyle':'--'}, label='Engine Trend')
      for _, row in final_df.iterrows():
        plt.scatter(row['rating'], row['average_hit_score'], s=80)
        plt.text(row['rating'] + 10, row['average_hit_score'], row['engine_name'], fontsize=9)

      plt.scatter(final_player_rating, player_avg_score, color='gold', s=200, edgecolor='black', zorder=5, label=f'You ({PLAYER_NAME_IN_PGN})')
      plt.text(final_player_rating + 10, player_avg_score, 'You', fontsize=11, weight='bold')

      plt.title(f"Final Performance Analysis vs. Engine Rating\nMethod: {CHOSEN_METHOD['name']}", fontsize=16)
      plt.xlabel("Engine Rating (Elo)", fontsize=12)
      plt.ylabel("Average Hit Score", fontsize=12)
      plt.legend()
      plt.grid(True)
      plt.text(0.05, 0.95, f'$R^2 = {final_r_squared:.4f}$\nFinal Est. Rating: {final_player_rating:.0f}', 
           transform=plt.gca().transAxes, fontsize=14, verticalalignment='top', 
           bbox=dict(boxstyle='round,pad=0.5', fc='wheat', alpha=0.7))
           
      plt.savefig(OUTPUT_GRAPH_PATH)
      print(f"\nGraph saved to: {OUTPUT_GRAPH_PATH}")
    else:
      print("\nCould not generate final report: All benchmark engines have the same average score.")

    print("--- Script Finished ---")


  if __name__ == "__main__":
    main()

  ### This is the end of the script.
  ```
  The real_engines.csv file looks like this:
  ```
  engine_name,path,rating,uci_options,executable_name
  maia_1100,"C:/Users/desja/Documents/Python_programs/chess_study/engines/leela_chess/m1100.bat",1100,"{}",m1100.bat
  maia_1200,"C:/Users/desja/Documents/Python_programs/chess_study/engines/leela_chess/m1200.bat",1200,"{}",m1200.bat
  maia_1300,"C:/Users/desja/Documents/Python_programs/chess_study/engines/leela_chess/m1300.bat",1300,"{}",m1300.bat
  maia_1400,"C:/Users/desja/Documents/Python_programs/chess_study/engines/leela_chess/m1400.bat",1400,"{}",m1400.bat
  maia_1500,"C:/Users/desja/Documents/Python_programs/chess_study/engines/leela_chess/m1500.bat",1500,"{}",m1500.bat
  maia_1600,"C:/Users/desja/Documents/Python_programs/chess_study/engines/leela_chess/m1600.bat",1600,"{}",m1600.bat
  maia_1700,"C:/Users/desja/Documents/Python_programs/chess_study/engines/leela_chess/m1700.bat",1700,"{}",m1700.bat
  maia_1800,"C:/Users/desja/Documents/Python_programs/chess_study/engines/leela_chess/m1800.bat",1800,"{}",m1800.bat
  maia_1900,"C:/Users/desja/Documents/Python_programs/chess_study/engines/leela_chess/m1900.bat",1900,"{}",m1900.bat
  dragon,C:/Users/desja/Documents/Python_programs/chess_study/engines/dragon - 3625/dragon_05e2a7/Windows/dragon-64bit.exe,3625,"{}",dragon-64bit.exe
  stockfish_full_test,C:/Users/desja/Documents/Python_programs/chess_study/engines/leela_chess/stockfish.exe,3644,"{""UCI_LimitStrength"": false}",stockfish.exe
  stockfish_full_1,C:/Users/desja/Documents/Python_programs/chess_study/engines/leela_chess/stockfish.exe,3644,"{""UCI_LimitStrength"": false}",stockfish.exe
  ```

  The .BAT files look like this (example for Maia 1100 rating):
  ```
  @echo off
  C:\Users\desja\Documents\Python_programs\chess_study\engines\leela_chess\lc0.exe --backend=onnx-cpu --weights="C:\Users\desja\Documents\Python_programs\chess_study\engines\leela_chess\maia weights\m1100.pb"
  ```
  The SQL script looked like this:

  ```
  SELECT
    CASE
      WHEN num_plies >= 0 AND num_plies < 50 THEN '0-49 plies'
      WHEN num_plies >= 50 THEN '50+ plies'
    END AS ply_range,
    COUNT(*) AS number_of_games,
    --This calculates the number of games won
    SUM(CASE WHEN termination LIKE "Desjardins373 won%" THEN 1 ELSE 0 END) AS games_won,
    -- This calculates the percentage
    ROUND((SUM(CASE WHEN termination LIKE "Desjardins373 won%" THEN 1 ELSE 0 END) * 100.0 / COUNT(*)),2) AS win_percentage
  FROM
    games
  GROUP BY
    ply_range
  ORDER BY
    num_plies;
  ```

  The python script that I used to perform the statistical significance testing looked like this:

  ```
  import pandas as pd
  import numpy as np
  from scipy.stats import chi2_contingency
  import matplotlib.pyplot as plt
  import seaborn as sns

  def run_significance_tests_from_csv(csv_file_path):
    """
    This script loads game data from a CSV file, iterates through different ply
    cutoffs, performs a Chi-Squared test for each, and visualizes the results.

    Args:
      csv_file_path (str): The path to the input CSV file.
    """
    # --- 1. Load Data from CSV ---
    try:
      print(f"Loading game data from '{csv_file_path}'...")
      df = pd.read_csv(csv_file_path)
      # Ensure 'result' and 'num_plies' columns exist
      if 'result' not in df.columns or 'num_plies' not in df.columns:
        print("Error: CSV must contain 'result' and 'num_plies' columns.")
        return
      print(f"Successfully loaded {len(df)} games.\n")
    except FileNotFoundError:
      print(f"Error: The file '{csv_file_path}' was not found.")
      print("Please run the PGN to CSV converter script first.")
      return
    except Exception as e:
      print(f"An error occurred while reading the CSV: {e}")
      return

    # --- 2. Define Cutoffs and Run Tests ---
    # Define the ply values you want to use as cutoffs
    cutoffs = range(30, 101, 10) # Test cutoffs 30, 40, 50, ..., 100
    results = []

    print("Running Chi-Squared tests for various ply cutoffs...")
    for cutoff in cutoffs:
      # Create two groups based on the cutoff
      group_below = df[df['num_plies'] < cutoff]
      group_above = df[df['num_plies'] >= cutoff]

      # Create the 2x2 contingency table
      #   Rows: Below Cutoff, Above Cutoff
      #   Columns: Wins, Losses
      # We filter out draws for this win/loss analysis
      contingency_table = np.array([
        [len(group_below[group_below['result'] == 'win']), len(group_below[group_below['result'] == 'loss'])],
        [len(group_above[group_above['result'] == 'win']), len(group_above[group_above['result'] == 'loss'])]
      ])

      # Check if any group is empty to avoid errors with the test
      if contingency_table.sum(axis=1).any() == 0:
        print(f"Skipping cutoff {cutoff}: not enough data in one of the groups.")
        continue

      # Perform the Chi-Squared test
      chi2, p_value, _, _ = chi2_contingency(contingency_table)

      # Store the results
      results.append({
        'cutoff': f'<{cutoff} vs >={cutoff}',
        'p_value': p_value,
        'chi2_stat': chi2
      })

    # Convert results to a DataFrame for easy viewing
    results_df = pd.DataFrame(results)

    # --- 3. Display Final Results ---
    print("\n--- Test Results ---")
    print(results_df.to_string(index=False))

    # --- 4. Visualize the P-Values ---
    if not results_df.empty:
      plt.style.use('seaborn-v0_8-whitegrid')
      fig, ax = plt.subplots(figsize=(12, 7))

      # Create the bar plot
      colors = ['#2E86C1' if p < 0.05 else '#AED6F1' for p in results_df['p_value']]
      bars = ax.bar(results_df['cutoff'], results_df['p_value'], color=colors)

      # Add a line for the significance threshold (p=0.05)
      ax.axhline(y=0.05, color='red', linestyle='--', linewidth=2, label='Significance Threshold (p=0.05)')

      # Add labels and titles
      ax.set_title('P-Values from Chi-Squared Tests at Different Ply Cutoffs', fontsize=16, pad=20)
      ax.set_xlabel('Ply Range Cutoff', fontsize=12)
      ax.set_ylabel('P-Value', fontsize=12)
      ax.legend()

      # Add p-value labels on top of each bar
      for bar in bars:
        yval = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2.0, yval + 0.01, f'{yval:.3f}', ha='center', va='bottom')

      # Improve layout and show plot
      plt.xticks(rotation=45, ha='right')
      plt.tight_layout()
      plt.show()
    else:
      print("\nNo results to visualize.")

  # --- Main execution block ---
  if __name__ == '__main__':
    # The script now expects the CSV file generated by the PGN parser
    games_csv_file = 'games_data.csv'
    run_significance_tests_from_csv(games_csv_file)
  ```
---
Brief Analysis of Personal Chess Database
Andrew Hayles

A similar methodology to that which is used in this report is employed in the book titled “Chess Two New Rating Systems: The 2022 Best Players in History (English Edition)” available on Amazon.com by Hindemburg Melão Jr.  He also found a strong relationship between “hit count” in the sense found in this report and chess engine ELO strength.

This is based on an analysis of 84 chess games of mine on chess.com from recent months. I analyzed all the games from move 5 onward (this produces 2,569 positions) with a very strong stockfish engine on its maximum strength setting with a large analysis depth and generous time limit to find the "perfect" move in each position of each game. Then I analyzed the hit count of each of these lesser strength engines and then applied optimized weights to the hits (1st best move gets a 1, 2nd best move gets a 1, third best move gets a 0.55). In this particular analysis I suppressed the performance of the stockfish 1950 - 2050 rated engines (three engines) by reducing the depth of their analysis of each move and I removed the highest rated stockfish engine (3644 ELO) because it wasn't performing as well as it should. This rating estimate for me based on my personal hit count (adjusted with weights) is approximately what my rating is right now on chess.com. So this suggests that my performance is reflected accurately in my rating. I am not performing at a much higher level than my rating suggests, or lower level. Extremely interesting is when I run the analysis on only moves 10-14. My rating is very low. I don't tend to make the right moves at this stage of the game. I need to work on that.

![Graph of hit count score versus rating for analysis over all moves from move 5](/images/image1.png)

Here is the optimized graph for moves 10-14 only (inclusive). As can be seen, my rating is lower than the lowest rated engine. Suggesting I am very poor at selecting the "best" move at this stage of the game.

![Graph of hit count score versus rating for analysis for moves 10-14 only](/images/image2.png)

Using SQL I applied a filter to my games to see if it made any difference in how long the game lasted on my win percentage.  It turns out it often seems to, but mostly doesn't matter.  However, since I found some interesting results in SQL I decided to do a more thorough analysis using Python and a statistical significance test called Chi-Square Test for Independence.  This is a good test for determining if there is indeed a relationship between categorical variables or not.  So I used Google Gemini to help build a script that would test different ranges of game-lengths for a statistically significant relationship.  This is what it found:

![Graph of p-values](/images/pvalues_chisquare.png)

Essentially, there is no meaningful relationship between the length of the game and my percentage of wins except when one considers games that are between 0-49 plies (about 25 moves for both players) and games greater than or equal to 50 plies in length.  When you consider the specific win percentages for this range (see below):

![Table of win percentages](/images/SQLoutput_chess_percentages.png)

...one can easily see that when the games are shorter, I lose much more often, and when the games are longer, I normally win.  This could mean many things, like for example I am very skilled in the late middle-game to end game stages.  Or perhaps I am very poor in the opening.  I think what this truly reflects is that when I lose games it is normally as a result of making some foolish error in the early stages of the game which is already decisive by the 25th move, so that I normally resign or am checkmated in these games.  The vast majority of the games (over 2/3) that I don't make foolish mistakes in the opening and early middle-game in, I win.

If you’re interested in the scripts I used, here is an available copy of them in text form:

[CODE_HERE]

Notice that the directory paths do not include spaces unless they also include quotes.  This was a point I had to learn the hard way.  I also utilized Google’s Gemini Deepmind to help me with the programming syntax (I am still a beginning Python programmer, myself) and to help get the Leela Chess Engine to host the various versions of the Maia engine weights.  I hope you enjoyed this analysis.  Please feel free to send any comments, suggestions, thoughts, criticisms or insights to andyhayles@gmail.com.