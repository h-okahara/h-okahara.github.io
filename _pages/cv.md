---
layout: archive
title: "CV"
permalink: /cv/
author_profile: true
cv_page: true
---

<div class="cv-print-header">
  <h1 class="cv-print-name" data-i18n="cv.name">Hisaya Okahara</h1>
  <p class="cv-print-affiliation" data-i18n="cv.affiliation">Ph.D. Student, Tahata Lab, Graduate School of Science and Technology, Tokyo University of Science</p>
  <p class="cv-print-contact">
    <a href="mailto:{{ site.author.email }}">{{ site.author.email }}</a> &nbsp;&#183;&nbsp;
    <a href="{{ site.url }}">{{ site.url | remove: "https://" }}</a> &nbsp;&#183;&nbsp;
    <a href="https://github.com/{{ site.author.github }}">github.com/{{ site.author.github }}</a> &nbsp;&#183;&nbsp;
    <a href="{{ site.author.orcid }}">ORCID {{ site.author.orcid | remove: "https://orcid.org/" }}</a>
  </p>
</div>

<div class="cv-actions">
  <a class="btn btn--inverse" href="{{ '/files/cv_en.pdf' | relative_url }}" download>
    <i class="fas fa-file-pdf" aria-hidden="true"></i>&nbsp;PDF (English)</a>
  <a class="btn btn--inverse" href="{{ '/files/cv_ja.pdf' | relative_url }}" download>
    <i class="fas fa-file-pdf" aria-hidden="true"></i>&nbsp;PDF (日本語)</a>
  <button type="button" class="btn btn--inverse" onclick="window.print();">
    <i class="fas fa-print" aria-hidden="true"></i>&nbsp;<span data-i18n="cv.print">Print</span></button>
</div>

<p class="cv-updated"><span data-i18n="cv.updated">Last updated</span>: {{ site.time | date: "%Y-%m-%d" }}</p>

{% include sections/career-academic.md %}


{% include sections/career-industry.md %}


{% include sections/grant.md %}


{% include sections/publication-preprint.md %}


{% include sections/publication-published.md %}


{% include sections/presentation-international.md %}


{% include sections/presentation-domestic.md %}


{% include sections/presentation-symposium.md %}


{% include sections/software.md %}


{% include sections/career-teaching.md %}


{% include sections/career-other.md %}


{% include sections/membership.md %}
