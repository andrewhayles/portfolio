---
type: ProjectLayout
title: Personal Health Data Analysis
colors: colors-a
date: '2025-07-12'
client: ''
description: I created this project to stay up-to-date with my basic health markers.
featuredImage:
  type: ImageBlock
  url: /images/bg2.jpg
  altText: Project thumbnail image
media:
  type: ImageBlock
  url: /images/bg2.jpg
  altText: Project image
---

I created this code to analyze my personal health data from my MorePro AIR2 Fitness Tracker watch and my body composition scale and my regular scale.  It is written in Python and it simply reads a CSV and performs some calculations and creates some visualizations.

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

These are the visualizations it creates:

![These are the overall distributions of the variables measured by me and by the watch](/images/overall_distributions.png)

After this visual is closed, the next visual will be generated (the next line of code is executed in the Python script):

![The colors are normalized by row based on the value inside the box (the highest numbers are yellow, the lowest numbers are dark blue)](/images/heatmap_normalized.png)

Then the following is produced:

![These are the correlations of the variables with each other, the more red the higher positive, the more blue the lower negative](/images/heatmap_correlations.png)

Lastly, a table is produced with ranges of the variables and some other useful information:

![These are the ranges of each variable.](/images/range_calculations.png)

As can be seen, a simple CSV file can be read by the pandas library in Python and some statistical calculations can be made with the numpy library followed by visualizations prepared by the seaborn and matplotlib libraries.  