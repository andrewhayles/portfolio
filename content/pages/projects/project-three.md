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
  url: /images/bg3.jpg
  altText: Project thumbnail image
media:
  type: ImageBlock
  url: /images/bg3.jpg
  altText: Project image
---
This project is based on an initial curiosity that turned into a major hobby especially during years of my life when I was having many trials and difficult times.  That hobby I'm referring to is participating in experimental high-range intelligence testing.  I wrote the following script to process all the data I dilligently kept over the years:
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

This script does a lot of things and I'm not going to talk about all of them right now but above all it produces some interesting visualizations which I think tell most of the story.  As they say, a picture speaks 1,000 words, and I believe this is true.  These pictures summarize the data well.  I will later add more analysis here and verbal discussion of the results.  For now, these are the visualizations:

Histogram of timed/untimed scores superimposed on each other

![Histogram of timed/untimed scores superimposed on each other](/images/histogram_timed_untimed1.png)

Probability plot of timed scores

![Probability plot of timed scores](/images/probability_plot_timed4.png)

Probability plot of untimed scores

![Probabliity plot of untimed scores](/images/probability_plot_untimed5.png)

Boxplot of authors (visible are the ranges of scores for each author)

![Boxplot of authors (visible are the ranges of scores for each author)](/images/box_plot_author6.png)

Boxplot of tests taken in hot months versus cold months

![Boxplot of tests taken in hot months versus cold months](/images/box_plot_hotcold7.png)

Boxplot of timed versus untimed tests

![Boxplot of timed versus untimed tests](/images/box_plot_timeduntimed8.png)

Boxplot of test types

![Boxplot of test types](/images/box_plot_testtype9.png)

Violin plot of test types

![Violin plot of test types](/images/violin_plot10.png)

Bell curve of scores

![Bell curve of scores](/images/bell_curve_of_scores11.png)

Pie chart of test types

![Pie chart of test types](/images/piechart_testtype_12.png)

Pie chart of authors

![Pie chart of authors](/images/piechart_author13.png)