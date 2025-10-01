---
type: PageLayout
title: Home
urlPath: / 
colors: colors-a
backgroundImage:
  type: BackgroundImage
  url: /images/bg1.webp
  backgroundSize: cover
  backgroundPosition: center
  backgroundRepeat: no-repeat
  opacity: 75
sections:
  - elementId: ''
    colors: colors-f
    backgroundSize: full
    title: Andrew Hayles
    subtitle: >-
      I'm an aspiring data analyst with strong technical acumen in multiple domains including programming and mathematics.  I love extracting meaningful observations from data and unravelling the mysteries contained in a plethora of rows and columns or in any unstructured data set.  Please consider some of my recent projects below.
    styles:
      self:
        height: auto
        width: wide
        margin:
          - mt-0
          - mb-0
          - ml-0
          - mr-0
        padding:
          - pt-36
          - pb-48
          - pl-4
          - pr-4
        flexDirection: row-reverse
        textAlign: left
    type: HeroSection
    actions: []
  - colors: colors-f
    type: FeaturedProjectsSection
    elementId: ''
    actions:
    showDate: false
    showDescription: true
    showFeaturedImage: true
    showReadMoreLink: true
    variant: variant-b
    projects:
      - content/pages/projects/health.md
      - content/pages/projects/iq.md
      - content/pages/projects/chess.md
      - content/pages/projects/yelp.md
    styles:
      self:
        height: auto
        width: wide
        padding:
          - pt-24
          - pb-24
          - pl-4
          - pr-4
        textAlign: left
---
