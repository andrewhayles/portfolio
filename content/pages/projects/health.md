---
type: ProjectLayout
title: Personal Health Data Analysis
colors: colors-a
date: '2025-07-12'
client: ''
description: I created this project to stay up-to-date with my basic health markers.
featuredImage:
  type: ImageBlock
  url: /images/bg2.webp
  altText: Project thumbnail image
media:
  type: ImageBlock
  url: /images/bg2.webp
  altText: Project image
code: |
  ```
  import pandas as pd
  import matplotlib.pyplot as plt
  import seaborn as sns
  import numpy as np
  
  df = pd.read_csv("health.csv", usecols=['WEIGHT', 'BPAVGSYS',	'BPAVGDIA',	'BPMAXSYS',	'BPMAXDIA',	'BPMINSYS',	
                                          'BPMINDIA',	'SLEEPTOTAL','DEEPSLEEP','LIGHTSLEEP','HRAVG','HRMAX','HRMIN',
                                          'STRESSAVG','STRESSMAX','STRESSMIN'])
                                          
  # Basic statistics
  summary = df.describe(percentiles=[.25, .5, .75]).T
  summary['IQR'] = summary['75%'] - summary['25%']
  
  # Add skewness and kurtosis
  summary['skewness'] = df.skew()
  summary['kurtosis'] = df.kurtosis()
  
  # Display key statistics
  print(summary[['mean', 'std', 'min', '50%', 'max', 'IQR', 'skewness', 'kurtosis']])
                 
  plt.figure(figsize=(16, 20))
  for i, col in enumerate(df.columns, 1):
      plt.subplot(4, 4, i)
      sns.histplot(df[col], kde=True, color='skyblue')
      plt.title(f'Distribution: {col}')
      plt.xlabel('')
  plt.tight_layout()
  plt.suptitle('Health Marker Distributions', y=1.02, fontsize=20)
  plt.show()
  
  plt.figure(figsize=(16, 10))
  sns.boxplot(data=df.melt(var_name='Marker'), 
              x='Marker', 
              y='value')
  plt.xticks(rotation=45)
  plt.title('Comparison of Health Markers')
  plt.ylabel('Value')
  plt.tight_layout()
  plt.show()
  
  # Normalize key statistics for visualization
  stats_to_show = summary[['mean', 'std', '50%', 'IQR']]
  normalized_stats = (stats_to_show - stats_to_show.min()) / (stats_to_show.max() - stats_to_show.min())
  
  plt.figure(figsize=(12, 8))
  sns.heatmap(normalized_stats.T, 
              annot=stats_to_show.T,
              fmt=".2f",
              cmap='viridis',
              cbar_kws={'label': 'Normalized Value'})
  plt.title('Normalized Summary Statistics Comparison')
  plt.xlabel('Health Markers')
  plt.tight_layout()
  plt.show()
  
  plt.figure(figsize=(16, 14))
  corr_matrix = df.corr()
  mask = np.triu(np.ones_like(corr_matrix, dtype=bool))
  
  sns.heatmap(corr_matrix, 
              mask=mask,
              annot=True, 
              fmt=".2f", 
              cmap='coolwarm',
              center=0,
              vmin=-1, vmax=1)
  plt.title('Health Marker Correlations')
  plt.xticks(rotation=45)
  plt.tight_layout()
  plt.show()
  
  from tabulate import tabulate
  
  # Generate table data
  table_data = []
  for col in df.columns:
      table_data.append([
          col,
          f"{summary.loc[col, 'mean']:.2f} ± {summary.loc[col, 'std']:.2f}",
          f"{summary.loc[col, 'min']:.1f} - {summary.loc[col, 'max']:.1f}",
          summary.loc[col, '50%'],
          summary.loc[col, 'IQR'],
          f"{summary.loc[col, 'skewness']:.2f}"
      ])
  
  # Display as formatted table
  print(tabulate(table_data,
                 headers=['Marker', 'Mean ± SD', 'Range', 'Median', 'IQR', 'Skewness'],
                 tablefmt='github',
                 floatfmt=".2f"))
                 
  import plotly.express as px
  from plotly.subplots import make_subplots
  
  # Create interactive distributions
  fig = make_subplots(rows=4, cols=4, subplot_titles=df.columns)
  for i, col in enumerate(df.columns, 1):
      row = (i-1)//4 + 1
      col_pos = (i-1)%4 + 1
      fig.add_trace(px.histogram(df, x=col, nbins=50).data[0], row=row, col=col_pos)
  fig.update_layout(height=900, width=1200, title_text="Health Marker Distributions")
  fig.show()
  
  # Interactive correlation matrix
  fig = px.imshow(corr_matrix, text_auto=".2f", color_continuous_scale='RdBu_r', zmin=-1, zmax=1)
  fig.update_layout(title="Health Marker Correlations", height=800, width=800)
  fig.show()
  ```
---

This started with the question, "Am I in good health, and how do my personal health markers vary throughout the day, week, and month?"  To start answering this (in addition to seeking medical advice from a trained and licensed doctor), I purchased an affordable smart watch and I created this code to analyze my personal health data from my MorePro AIR2 Fitness Tracker watch and my body composition scale and my regular scale.  It is written in Python and it uses the read_csv method to load the data into a memory location called a DataFrame in pandas and then creates several visualizations based on some statistical calculations using numpy for some of the more advanced calculations and seaborn for the visualizations.

This is a plot of most of the variables I am tracking with histograms.  Most of the variables are in healthy ranges, although weight is an area of potential improvement:

![These are the overall distributions of the variables measured by me and by the watch](/images/overall_distributions.webp)

After this visual is closed, the next visual will be generated (the next line of code is executed in the Python script).  The next step in solving my original problem is the following visualization.  This visual is colored based on row, so each row has a highest value and a lowest value, with a color scale defined on the right which shows the highest and lowest values (yellow corresponding to high values, dark blue corresponding to low values).  As can be seen, maximum heart rate (standard deviation and interquartile range) and maximum systolic blood pressure (mean and 50%) are the highest values.  This makes it easy to see which variables vary the most and the least:

![The colors are normalized by row based on the value inside the box (the highest numbers are yellow, the lowest numbers are dark blue)](/images/heatmap_normalized.webp)

Then the following is produced.  This is a correlation table.  The darker the red color, the higher the positive correlation.  The darker the blue color, the lower the negative correlation.  As can be seen, there is a very strong positive correlation between heart rate, stress, and blood pressure.  These are apparently very tightly linked physiological indicators.  The colors are shown for all possible correlations in the table but the numbers are only included if they are statistically significant:

![These are the correlations of the variables with each other, the more red the higher positive, the more blue the lower negative](/images/heatmap_correlations.webp)

When the previous night's sleep data is checked for relationship to health markers, something significant happens.  The effect of sleep becomes more manifest.  There is a modest negative correlation between previous night's sleep and many of the health markers, including stress levels and blood pressure.  This is not manifest in the previous correlation table because this table is based on *that night's* sleep, in other words, it checks to see how does the day's stress and blood pressure affect sleep that night.  The following graph checks to see how does the previous night affect the following day's blood pressure and stress level, and in this there is a modest but significant correlation.

![Correlations for previous night's sleep](/images/correlation_matrix_previous_night.webp)

Lastly, a table is produced with ranges of the variables (this tells me how my health markers vary somewhat) and some other useful information.  To get the variance throughout the day, actually looking at the data in the software application on my smart phone is necessary and predictable trends are manifest, stress rises when I wake up, reaches a peak, and decreases towards bed time.  Blood pressure and heart rate share a similar pattern.  If I get sick or have a night of poor sleep, stress, blood pressure, and heart rate tend to be higher:

![These are the ranges of each variable.](/images/range_calculations.png)

Here is a link to a Power BI feature: [Please click here to view](https://app.powerbi.com/view?r=eyJrIjoiMzdlMGQ4N2MtOTQyNS00YjhjLWE3NTctYzc3ODk3NTVmZjllIiwidCI6IjE5NWQ0ZTBiLTAzM2UtNDAzNi05ZDAwLTJiOGY0MDA1OWE3YyIsImMiOjZ9).  This a nicely interactive feature.  Click on the dependent (Y-Axis) variable on the left and see statistical summary data and scatter chart.

As can be seen, a simple CSV file can be read by the pandas library in Python and some statistical calculations can be made with the numpy library followed by visualizations prepared by the seaborn and matplotlib libraries.  In the future I'd like to analyze the data from my body composition scale as I collect enough data (I only use it twice per month because the measurement doesn't change much day-to-day and the battery dies rapidly if regularly used).  This project demonstrates the power of Python's data analysis libraries in transforming raw sensor data into actionable insights.

The code used for this analysis is available below if you're interested in viewing it:

[CODE_HERE]