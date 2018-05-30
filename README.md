# CAVD DataSpace Reports

| Report | Rmd | Author |
| --- | --- | --- |
| [Vaccine Strategies Used in CAVD Studies over Time](https://dataspace.cavd.org/cds/CAVD/app.view#learn/learn/Report/db%3A16) | [vaccine_strategies.Rmd](vaccine_strategies.Rmd) | [Joe Hicks](https://github.com/joewhicks) |
| [CAVD Study Types over Time](https://dataspace.cavd.org/cds/CAVD/app.view#learn/learn/Report/db%3A17) | [study_types.Rmd](study_types.Rmd) | [Joe Hicks](https://github.com/joewhicks) |
| [CAVD434 - A Case Study Using DataSpaceR](https://dataspace.cavd.org/cds/CAVD/app.view#learn/learn/Report/db%3A18) | [CAVD434.Rmd](CAVD434.Rmd) | [Bryan T. Mayer](https://github.com/bryanmayer) |
| [Durability analysis for NYVAC challenge study timing](https://dataspace.cavd.org/cds/CAVD/app.view#learn/learn/Report/db%3A19) | [durability_analysis.Rmd](durability_analysis.Rmd) | [Bryan T. Mayer](https://github.com/bryanmayer) |


## How to create new reports

### Current workflow

1. Navigate to [the CAVD project folder](https://dataspace.cavd.org/project/CAVD/begin.view?) and create a new report using LabKey's `R Report Builder` by clicking down arrow in "Data Views" panel and "Add Report" and then "R Report". Or just navigate to this [link](https://dataspace.cavd.org/reports/CAVD/createScriptReport.view?scriptExtension=&tabId=Source&reportType=ReportService.rReport&redirectUrl=%2Fproject%2FCAVD%2Fbegin.view%3F).
2. Add yaml header, knitr options, and css path to "Script Source" section

* yaml header
```yaml
---
output: html_document_base
---
```

* knitr options
````r
```{r set-options, include=FALSE}
knitr::opts_chunk$set(
  cache = TRUE, # optional
  cache.path = paste0(labkey.file.root, 
                      "/cache/REPORTNAME/",
                      labkey.user.email,
                      "/"), # optional
  warning = FALSE,
  message = FALSE,
  highlight = TRUE,
  tidy = TRUE,
  fig.align = "center")
```
````

* css path:
```html
<link rel="stylesheet" type="text/css" href="../../_webdav/home/files/%40files/blog/theme/cds-theme/css/RReport.css">
```

3. Write analysis after css path.
4. Configure report options. Make sure that "Markdown" and "Use default output_format options" options are **checked** in "Knitr Options" section of the report builder.
5. Save and edit properties and thumbnail image (name, author, status, description, etc). Click the `pencil` icon next to the title section of "Data Views" and then the "pencil" icon next to the report you just worked on. Make sure you add in the details correctly and "Share this report with all users?" is check if you'd like the report to be public. Also, upload a pre-rendered thumbnail image of the report.
6. Render the report in the app and make changes if needed.
7. Once you finalized the report in the report builder, create a Rmd file in this repo and copy-and-paste the report.


### Potential workflow (need to propose this to LabKey)

1. Create a new Rmd file in this repository.
2. Add yaml header, knitr options, and css path to the Rmd file.
3. Write analysis on the Rmd file.
4. Create a new report using LabKey's R Report Builder.
5. Configure report options (knitr options and **script source file**). **Script source file** will be the raw link to the Rmd file (i.e., https://raw.githubusercontent.com/CAVDDataSpace/reports/master/vaccine_strategies.Rmd) and the report builder will render the report from this file instead of code from the editor in R Report Builder.
6. Save and edit properties (name, author, status, description, etc).
7. Render the report in the app and make changes if needed.


## Notes
* You need to be a **site admin** in order to create R reports.
* You don't need to worry about `netrc` file in LabKey R reports
* If you decide to use `cache` in knitr options, you must manually create the report cache directory in the labkey server (`/labkey/labkey/files/CAVD/@files/cache`).
