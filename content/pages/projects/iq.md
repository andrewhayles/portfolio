---
type: ProjectLayout
title: I.Q. Test Data Analysis
colors: colors-a
date: '2025-07-12'
client: ''
description: >-
  I created this project to analyze all of my test data that has been collected
  over many years.
featuredImage:
  type: ImageBlock
  url: /images/bg3.webp
  altText: Project thumbnail image
media:
  type: ImageBlock
  url: /images/bg3.webp
  altText: Project image
code: |
  ```
  # Import the libraries that we will be using
  import statsmodels.api as sm
  import statsmodels.stats.weightstats as smstats
  import statsmodels
  import numpy as np
  import pandas as pd
  import seaborn as sns
  import matplotlib.pyplot as plt
  import pylab as py
  import scipy.stats as stats
  
  da = pd.read_csv("scores.csv")
  
  
  
  vars = ["Date", "Score", "Timed", "M", "V", "N", "S", "L", "Cold", "Recent"
          ,"Cooijmans","Ivec","Betts", "IQexams", "Backlund", "Joshi", "Dorsey","Predavec"
          , "Jouve","Kutle","Prousalis","Scillitani","Udriste", "OtherAuthor", "Author",
          "TestType","TimedUntimed","ColdHot", "counter", "AuthorCode"
          , "TestTypeCode"]
  
  da = da[vars].dropna()
  
  recent_avg = da.query("counter > 197")
  early_avg = da.query("counter <= 197")
  
  timed = da["Timed"]
  timedyes = da[timed == 1]
  timedno = da[timed == 0]
  M = da[da["M"] == 1]
  V = da[da["V"] == 1]
  N = da[da["N"] == 1]
  S = da[da["S"] == 1]
  L = da[da["L"] == 1]
  Cold = da[da["Cold"] == 1]
  Hot = da[da["Cold"] == 0]
  After1023 = da[da["Recent"] == 1]
  Cooijmans = da[da["Cooijmans"] == 1]
  Ivec = da[da["Ivec"] == 1]
  Betts = da[da["Betts"] == 1]
  IQexams = da[da["IQexams"] == 1]
  Backlund = da[da["Backlund"] == 1]
  Joshi = da[da["Joshi"] == 1]
  Dorsey = da[da["Dorsey"] == 1]
  Predavec = da[da["Predavec"] == 1]
  Jouve = da[da["Jouve"] == 1]
  Kutle = da[da["Kutle"] == 1]
  Prousalis = da[da["Prousalis"] == 1]
  Scillitani = da[da["Scillitani"] == 1]
  Udriste = da[da["Udriste"] == 1]
  OtherAuthor = da[da["OtherAuthor"] == 1]
  
  
  myvars = [M["Score"], V["Score"], N["Score"] ,S["Score"],L["Score"], Cold["Score"], Hot["Score"],
            After1023["Score"], Cooijmans["Score"],Ivec["Score"],Betts["Score"], IQexams["Score"], Backlund["Score"],
            Joshi["Score"],Dorsey["Score"], Predavec["Score"],Jouve["Score"],
            Kutle["Score"], Prousalis["Score"], Scillitani["Score"], Udriste["Score"], OtherAuthor["Score"], da["Score"]]
  
  mynames = ["M", "V", "N", "S", "L", "Cold","Hot", "Recent", "Cooijmans", "Ivec", "Betts", "IQexams", "Backlund"
             , "Joshi", "Dorsey", "Predavec", "Jouve", "Kutle", "Prousalis", "Scillitani", "Udriste", "Other", "Total"]
  
  
  
  
  
  timed_tests_count = timedyes.size
  untimed_tests_count = timedno.size
  
  #print("Timed:", statsmodels.stats.descriptivestats.describe(timedyes["Score"]))
  #print("Untimed:",statsmodels.stats.descriptivestats.describe(timedno["Score"]))
  #print("M:",statsmodels.stats.descriptivestats.describe(M["Score"]))
  #print("V:",statsmodels.stats.descriptivestats.describe(V["Score"]))
  #print("N:",statsmodels.stats.descriptivestats.describe(N["Score"]))
  #print("S:",statsmodels.stats.descriptivestats.describe(S["Score"]))
  #print("L:",statsmodels.stats.descriptivestats.describe(L["Score"]))
  #print("Cold:",statsmodels.stats.descriptivestats.describe(Cold["Score"]))
  #print("After1023:",statsmodels.stats.descriptivestats.describe(After1023["Score"]))
  #print("Cooijmans:",statsmodels.stats.descriptivestats.describe(Cooijmans["Score"]))
  #print("Ivec:",statsmodels.stats.descriptivestats.describe(Ivec["Score"]))
  #print("Betts:",statsmodels.stats.descriptivestats.describe(Betts["Score"]))
  #print("IQexams:",statsmodels.stats.descriptivestats.describe(IQexams["Score"]))
  #print("Backlund:",statsmodels.stats.descriptivestats.describe(Backlund["Score"]))
  #print("Joshi:",statsmodels.stats.descriptivestats.describe(Joshi["Score"]))
  #print("Dorsey:",statsmodels.stats.descriptivestats.describe(Dorsey["Score"]))
  #print("Predavec:",statsmodels.stats.descriptivestats.describe(Predavec["Score"]))
  #print("Jouve:",statsmodels.stats.descriptivestats.describe(Jouve["Score"]))
  #print("Kutle:",statsmodels.stats.descriptivestats.describe(Kutle["Score"]))
  #print("Prousalis:",statsmodels.stats.descriptivestats.describe(Prousalis["Score"]))
  #print("Scillitani:",statsmodels.stats.descriptivestats.describe(Scillitani["Score"]))
  #print("Udriste:",Udriste["Score"].describe)
  #print("OtherAuthor:",statsmodels.stats.descriptivestats.describe(OtherAuthor["Score"]))
  
  timedscores = pd.Series(timedyes["Score"])
  untimedscores = pd.Series(timedno["Score"])
  
  coldscores = Cold["Score"]
  hotdata = da.query('Cold == 0')
  hotscores = hotdata['Score']
  
  
  timedmean = timedscores.mean()
  untimedmean = untimedscores.mean()
  
  timedmedian = timedscores.median()
  untimedmedian = untimedscores.median()
  
  timedsd = timedscores.std()
  untimedsd = untimedscores.std()
  
  timedmode = timedscores.mode()
  untimedmode = untimedscores.mode()
  
  print("Timed mean, median, sd, mode:", timedmean, timedmedian, timedsd, timedmode)
  
  print("Untimed mean, sd, mode:", untimedmean, untimedmedian, untimedsd, untimedmode)
  
  print("Is the first larger of [1]/[2]?:")
  print("Recent/Early t-test:", smstats.ttest_ind(recent_avg["Score"], early_avg["Score"], alternative="larger", usevar="unequal"))
  
  print("Untimed/timed t-test:", smstats.ttest_ind(untimedscores, timedscores, alternative="larger", usevar="unequal"))
  
  print("Cold/Hot t-test:", smstats.ttest_ind(coldscores, hotscores, alternative="larger", usevar="unequal"))
  
  print("Logical/Numerical t-test:", smstats.ttest_ind(L["Score"], N["Score"], alternative="larger", usevar="unequal"))
  
  
  #model = sm.OLS.from_formula("Score ~ Date", data=da)
  #result = model.fit()
  #print(result.summary())
  
  #Marginal modelling (intra-cluster correlation calculations)
  
  #model = sm.GEE.from_formula("Score ~ Date", groups=da["Author"],
  #           cov_struct=sm.cov_struct.Exchangeable(), data=da)
  #result = model.fit()
  #print(result.cov_struct.summary())
  
  #for v in ["Date", "Score", "Timed", "M", "V", "N", "S", "L", "Cold", "Recent"]:
  #    model = sm.GEE.from_formula(v + " ~ 1", groups="Author",
  #           cov_struct=sm.cov_struct.Exchangeable(), data=da)
  #    result = model.fit()
  #    print(v, result.cov_struct.summary())
  
  
  #model = sm.GEE.from_formula("Score ~ Date + TestType + ColdHot + C(Recent) + TimedUntimed", groups="Author",
  #           cov_struct=sm.cov_struct.Exchangeable(), data=da)
  #result = model.fit()
  #print(result.cov_struct.summary())
  
  
  # Fit a linear model with OLS
  model1 = sm.OLS.from_formula("Score ~ Date + TestType + ColdHot + C(Recent) + TimedUntimed",
             data=da)
  result1 = model1.fit()
  
  # Fit a marginal linear model using GEE to handle dependent data
  model2 = sm.GEE.from_formula("Score ~ Date + TestType + ColdHot + C(Recent) + TimedUntimed",
             groups="Author",
             cov_struct=sm.cov_struct.Exchangeable(), data=da)
  result2 = model2.fit()
  
  x = pd.DataFrame({"OLS_params": result1.params, "OLS_SE": result1.bse,
                    "GEE_params": result2.params, "GEE_SE": result2.bse})
  x = x[["OLS_params", "OLS_SE", "GEE_params", "GEE_SE"]]
  print(x)    
  
  # Fit a multilevel (mixed effects) model to handle dependent data
  #model = sm.MixedLM.from_formula("Score ~ Date + ColdHot + C(Recent) + Author",
  #           groups="Author", data=da)
  #result = model.fit()
  #print(result.summary())
  
  #Generalized Estimating Equations
  m0 = sm.GEE.from_formula("Score ~ Date + TestType", "Author", cov_struct=sm.cov_struct.Exchangeable(), data=da)
  r0 = m0.fit()
  print(r0.summary())
  print(r0.cov_struct.summary())
  
  #for ky,dz in da.groupby("Timed"):
  #    m2 = sm.GEE.from_formula("Score ~ TestType", "Author", cov_struct=sm.cov_struct.Exchangeable(), data=dz)
  #    r2 = m2.fit()
  #    print("Timed?=%s" % {1: "Yes", 0: "No"}[ky])
  #    print(r2.summary())
  
  
  #Multilevel (mixed) model analysis
  #m4 = sm.MixedLM.from_formula("Score ~ TestType + Date", groups="Author", data=da)
  #r4 = m4.fit()
  #print(r4.summary())
  
  #print(47.074/da["Score"].var())
  #The findings are not significant for this analysis
  
  sns.histplot(x=timedyes["Score"], binwidth=1, kde=False)
  sns.histplot(x=timedno["Score"], binwidth=1, kde=False).set_title("Histograms of Test Scores (Orange=Untimed, Blue=Timed)");
  plt.show()
  sm.qqplot(timedscores)
  py.show()
  sm.qqplot(untimedscores)
  py.show()
  
  stats.probplot(timedscores, dist="norm", plot=plt)
  plt.show()
  
  stats.probplot(untimedscores, dist="norm", plot=plt)
  plt.show()
  sns.boxplot(data=da, x=da["Score"], y=da["Author"], color=".8", linecolor="#137", linewidth=.75)
  plt.show()
  sns.boxplot(data=da, x=da["Score"], y=da["ColdHot"], color=".8", linecolor="#137", linewidth=.75)
  plt.show()
  sns.boxplot(data=da, x=da["Score"], y=da["TimedUntimed"], color=".8", linecolor="#137", linewidth=.75)
  plt.show()
  sns.boxplot(data=da, x=da["Score"], y=da["TestType"], color=".8", linecolor="#137", linewidth=.75)
  plt.show()   
  
  
  plt.figure(figsize=(12,4))
  sns.violinplot(x=da["TestType"], y=da.Score, hue=da["TestType"], legend=False)
  plt.show()
  
  #Adjust bandwidth (bw_adjust) between 1 and 3.
  sns.kdeplot(da["Score"], bw_adjust=2)
  
  # Find the mean, median, mode
  mean_score = da["Score"].mean()
  median_score = da["Score"].median()
  mode_score = da["Score"].mode().squeeze()
  
  # Add vertical lines at the position of mean, median, mode
  plt.axvline(mean_score, label="Mean")
  plt.axvline(median_score, color="black", label="Median")
  plt.axvline(mode_score, color="green", label="Mode")
  
  plt.legend();
  
  plt.show()
  
  #make a pie chart
  
  #TestType pie chart
  
  mypiearray = np.array([M["Score"].size/da["Score"].size * 100, V["Score"].size/da["Score"].size * 100,
                N["Score"].size/da["Score"].size * 100, S["Score"].size/da["Score"].size * 100,
                L["Score"].size/da["Score"].size * 100])
  
  mylabel = np.array(["Mixed", "Verbal", "Numerical", "Spatial", "Logical"])
  
  plt.pie(mypiearray,labels = mylabel,autopct='%.0f%%')
  plt.show()
  
  #Author pie chart
  
  mypiearray = np.array([Cooijmans["Score"].size/da["Score"].size * 100, Ivec["Score"].size/da["Score"].size * 100,
                Betts["Score"].size/da["Score"].size * 100, IQexams["Score"].size/da["Score"].size * 100,
                Backlund["Score"].size/da["Score"].size * 100, Joshi["Score"].size/da["Score"].size * 100,
                Dorsey["Score"].size/da["Score"].size * 100, Predavec["Score"].size/da["Score"].size * 100,
                Jouve["Score"].size/da["Score"].size * 100, Kutle["Score"].size/da["Score"].size * 100,
                Prousalis["Score"].size/da["Score"].size * 100, Scillitani["Score"].size/da["Score"].size * 100,
                Udriste["Score"].size/da["Score"].size * 100, OtherAuthor["Score"].size/da["Score"].size * 100])
  
  mylabel = np.array(["Cooijmans", "Ivec", "Betts", "IQExams", "Backlund",
                      "Joshi", "Dorsey", "Predavec", "Jouve", "Kutle",
                      "Prousalis", "Scillitani", "Udriste", "Other"])
  
  plt.pie(mypiearray,labels = mylabel,autopct='%.0f%%', explode = (0.1, 0.1, 0.1, 0.1, 0.1, 0.6, 0.6, 0.6, 0.6, 0.6,
                                                                   0.6, 0.6, 0.6, 0.1), startangle = 90)
  
  plt.show()
  ```
---
This project is based on an initial curiosity that turned into a major hobby especially during years of my life when I was having many trials and difficult times.  That hobby I'm referring to is participating in experimental high-range intelligence testing.  I wrote the script that is available for viewing below to process all the data I dilligently kept over the years:

[CODE_HERE]

This script does a lot of things and I'm not going to talk about all of them right now but above all it produces some interesting visualizations which I think tell a lot of the story.  I will say that this interactive Power BI Dashboard also helps in [understanding the data]( https://app.powerbi.com/view?r=eyJrIjoiYzBjNWNjMzMtNjQ2ZS00ZTg1LWI5YWUtM2M5NzMwMTNjZjFlIiwidCI6IjE5NWQ0ZTBiLTAzM2UtNDAzNi05ZDAwLTJiOGY0MDA1OWE3YyIsImMiOjZ9)

Here are some of my observations from it, for example.  By clicking on the chart (like a section of the pie chart for example) and then holding the Ctrl button and clicking another element on another chart you can get different pictures of the subsets of the data (effectively filtering the data interactively).

This is what all of the tests except IQexams look like:

![All except IQexams](/images/allexceptIQexams.webp)

This is what mixed tests by Cooijmans looks like:

![Mixed + Cooijmans](/images/mixedCooijmans.webp)

This is the combination of mixed and untimed tests (all authors):

![Mixed + Untimed](/images/mixed-untimed-tests.webp)

From what I can tell (including some of my own deeper-dive analysis into date ranges, specifically, excluding the first eight date codes associated with test administrations) it seems that in the first 8 days or so I didn't really understand well the instructions and I was kind of "learning" how to take the tests during this phase.  Strictly speaking I don't think this qualifies as a learning effect entirely, more of a gradual learning of the instructions and approaching a level playing field with the other test-takers on this now extinct platform IQexams.

Even when the data is filtered in such a way that the slope is significant, it is normally just a bit higher than 0.001 in magnitude and the coefficient of determination is very low also (the linear model is not predictive of anything really, other than some nonzero improvement from the beginning of my test taking).

Histogram of timed/untimed scores superimposed on each other.  You can see there is a slight offset in the positive direction with the untimed tests.  I perform a bit better when I am not under time pressure, but still do exceptionally well with a time limit.

![Histogram of timed/untimed scores superimposed on each other](/images/histogram_timed_untimed1.webp)

Probability plot of timed scores (very normal behavior)

![Probability plot of timed scores](/images/probability_plot_timed4.webp)

Probability plot of untimed scores (very normal behavior)

![Probabliity plot of untimed scores](/images/probability_plot_untimed5.webp)

Boxplot of authors (visible are the ranges of scores for each author)

![Boxplot of authors (visible are the ranges of scores for each author)](/images/box_plot_author6.webp)

Boxplot of tests taken in hot months versus cold months (not much difference, but it seems a slightly wider range of performances in the hot months, perhaps from sometimes less motivation to perform well when there are people to see and places to go).

![Boxplot of tests taken in hot months versus cold months](/images/box_plot_hotcold7.webp)

Boxplot of timed versus untimed tests (wider range - more randomness - and lower median with timed tests)

![Boxplot of timed versus untimed tests](/images/box_plot_timeduntimed8.webp)

Boxplot of test types

![Boxplot of test types](/images/box_plot_testtype9.webp)

Violin plot of test types (you can see one of my very first tests there was a verbal test that I performed very low on compared to my normal scores).  For some reason on logical tests I do a bit better than on other types of tests.

![Violin plot of test types](/images/violin_plot10.webp)

Bell curve of scores.  The median and mean are almost the same, suggesting a symmetric distribution.  The mode is shifted a bit over to the right.

![Bell curve of scores](/images/bell_curve_of_scores11.webp)

Pie chart of test types

![Pie chart of test types](/images/piechart_testtype_12.webp)

Pie chart of authors.  Thank God for all of the wonderful authors of these tests.  All of them with a different personality, all of them basically measuring the same thing with all of their varied problems and problem types.

![Pie chart of authors](/images/piechart_author13.webp)