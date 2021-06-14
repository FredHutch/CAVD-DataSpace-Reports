library(Rlabkey)
library(data.table)
# library(ggplot2)
# labkey.url.base <- "https://dataspace.cavd.org/"
# labkey.url.path <- "/CAVD/"
#
# nabmab <- data.table(labkey.selectRows(labkey.url.base,
#                                        labkey.url.path,
#                                        "Study",
#                                        "NABMAb",
#                                        colNameOpt = "fieldname"))
# mabMixMeta <- data.table(labkey.selectRows(labkey.url.base,
#                                            labkey.url.path,
#                                            "CDS",
#                                            "MAbMixMetadata",
#                                            colNameOpt = "fieldname"))
#
# nabmab <- merge(nabmab, mabMixMeta)

### helpers and constants ###
LINETYPES <- rep(c('solid', 'dashed', 'dotdash', 'longdash','twodash'), 1000)
MELLOWPAL <- colorRampPalette(c("firebrick", "gold", "darkolivegreen4", "cadetblue3", "darkorchid4"))
KESTREL <- colorRampPalette(c("#bd0026", "#f03b20","#fec24c", "#feda75", "#6699ff"))
ORIOLE  <- colorRampPalette(c("#ff7700",  "#ffbb33",  "#a7a6a6",  "#231f20"))
GRAY <- colorRampPalette("gray30")

numFor <- function(x){
  signif(x, digits=1)
}


addAes <- function(nabmab, colorBy, shapeBy, lineBy, palette) {

  # Options for colorBy: prot, titer, mab, virus
  if (colorBy == "none") {
    nabmab[, color := "firebrick"]
  } else if (colorBy == "prot") {
    prots <- unique(nabmab$prot)
    cols <- MELLOWPAL(length(prots))
    names(cols) <- prots
    nabmab[, color := cols[prot]]
  } else if (colorBy == "titer") {
    dat <- unique(nabmab[, .(curve_id, titer_curve_ic50)])
    colBins <- .bincode(dat$titer_curve_ic50,
                        # c(-Inf, 10^seq(-3, 1.5, length.out = 99), Inf),
                        c(-Inf, .001, .01, .1, 1, 10, Inf),
                        right = FALSE,
                        include.lowest = TRUE)
    # cols <- palette(100)[colBins]
    cols <- palette(6)[colBins]
    names(cols) <- dat$curve_id
    nabmab[, color := cols[as.character(curve_id)]]
  } else {
    nabmab[, color := "firebrick"]
  }
  # Options for shapeBy: prot, mab, virus
  if (shapeBy == "none") {
    nabmab[, shape := 1]
  } else {
    nabmab[, shape := as.numeric(factor(prot))]
  }
  # Options for lineBy:  target_cell
  if (lineBy == "none") {
    nabmab[, lineType := 1]
  } else {
    nabmab[, lineType := as.numeric(factor(target_cell))]
  }
  return(nabmab)

}


makeCurves <- function(nabmab){
  curveData <- unique(nabmab[, c("prot",
                                 "mab_mix_id",
                                 "cds_virus_id",
                                 "target_cell",
                                 "curve_id",
                                 "min_concentration",
                                 "max_concentration",
                                 "color",
                                 "shape",
                                 "lineType",
                                 grep("fit", names(nabmab), value = T)),
                             with = F])


  # Add xvals and yvals as nested vectors
  curveData <- curveData[, xvals:=.(mapply(function(minDil, maxDil){
    x <- 10^seq(floor(log10(minDil)), ceiling(log10(maxDil)), by = 0.1)
    x <- c(minDil, sort(x[x > minDil & x < maxDil]), maxDil)
    return(x)
  },
  min_concentration,
  max_concentration,
  SIMPLIFY = F))]

  curveData <- curveData[, yvals:=.(mapply(function(x, a, b, c, d, e){
    if(a == 100 & d == 100) return(NA)
    return(a + ((d - a)/(1 + 10^(b * (log10(c) - log10(x))))^e))
  },
  x = xvals,
  a = fit_min,
  b = fit_slope,
  c = fit_inflection,
  d = fit_max,
  e = fit_asymmetry,
  SIMPLIFY = F))]

  curveData[is.na(yvals)] <- NULL

  # Unnest x and y
  curveData <- curveData[,
                         .(x = unlist(xvals), y = unlist(yvals)),
                         .(prot, mab_mix_id, cds_virus_id, target_cell, curve_id, color, shape, lineType)]

  return(curveData)
}

### Plotting functions ###
plotNeutralizationThumbnail <- function(nabmab,
                                        virus_id = NULL,
                                        mab_id = NULL,
                                        colorBy = "titer",
                                        shapeBy = "prot",
                                        lineBy = "target_cell",
                                        lineSize = 1,
                                        pointSize = 1,
                                        colorPalette = MELLOWPAL) {

  nabmab <- addAes(nabmab, colorBy, shapeBy, lineBy, palette = colorPalette)

  if (is.null(virus_id)) virus_id <- unique(nabmab$cds_virus_id)
  if (is.null(mab_id)) mab_id <- unique(nabmab$mab_mix_id)
  dat <- nabmab[cds_virus_id %in% virus_id & mab_mix_id %in% mab_id]
  curveData <- makeCurves(dat)
  curveData[, group := as.numeric(as.factor(curve_id))]

  # return(
  #
  #   ggplot(dat) +
  #     geom_point(aes(x = mab_concentration,
  #                    y = percent_neutralization),
  #                color = dat$color,
  #                shape = dat$shape) +
  #     geom_line(data = curveData,
  #               aes(x = x,
  #                   y = y,
  #                   group = curve_id),
  #               color = curveData$color,
  #               linetype = curveData$lineType) +
  #     scale_x_log10(limits = c(.001, 10)) +
  #     scale_y_continuous(limits = c(0, 100)) +
  #     theme(legend.position = "none",
  #           axis.title = element_blank(),
  #           axis.text = element_blank(),
  #           axis.ticks = element_blank(),
  #           panel.grid = element_blank(),
  #           plot.background = element_blank(),
  #           panel.border = element_rect(fill = NA),
  #           plot.margin = margin(t = 1, r = 1, b = 0, l = 0, unit = "mm"))
  #
  # )
  par(mar = rep(1,4) * 0,
      tck = 0)
  plot(0,0, xlim = (log10(c(0.001, 10))), ylim = c(0, 100))
  rect(par("usr")[1],par("usr")[3],par("usr")[2],par("usr")[4],col = "white")
  points(log10(dat$mab_concentration), dat$percent_neutralization, col = dat$color, pch = 16, cex = pointSize)
  lapply(unique(curveData$curve_id), function(cd) lines(log10(curveData[curve_id == cd]$x),
                                                        curveData[curve_id == cd]$y,
                                                        col = unique(curveData[curve_id == cd]$color),
                                                        lwd = lineSize))
}

createNeutralizationThumbnail <- function(nabmab,
                                          virus_id = NULL,
                                          mab_id = NULL,
                                          path,
                                          size,
                                          lineSize = 1,
                                          pointSize = 0.5,
                                          colorPalette = KESTREL) {
  png(path, width = size, height = size, units = "px")
  plotNeutralizationThumbnail(nabmab, virus_id, mab_id, lineSize = lineSize, pointSize = pointSize, colorPalette = colorPalette)
  dev.off()
}

createLegend <- function(palette, path, width = 100, height = 150) {
  png(path, width = width, height = height)
  cols <- palette(6)
  labels <- c("<.001", ".001-.01", ".01-.1", ".1-1", "1-10", ">10")

  par(bg = "transparent", usr = c(0, 1, 0, 6), mar = c(1,5,1.5,0), xpd = NA)
  plot.new()
  par(usr = c(0, 1, 0, 6), mar = c(1,5,1.5,0))
  rect(0, 0, 1, 6, border = "white")
  lapply(1:6, function(i){
    rect(xleft = 0, ybottom = 6-i, xright = 1, ytop = 7-i, col=cols[i], border = "white", lwd = 4)
    text(0, 6.5 - i, labels[i], adj = 1, )
    # mtext(labels[x], 2, at = x, adj = 2)
  })
  mtext("Titer IC50 (μg/l)", side = 3, line = 0.5, adj = 1, outer = FALSE)
  dev.off()
}
createAxisLegend <- function(path, width = 150, height = 150) {
  png(path, width = width, height = height)
  par(bg = "transparent")
  plot.new()
  par( cex = 0.9, mar = c(3,3,0.8,0.8), xaxs = "i", yaxs = "i")
  plot(NULL, xlim = c(0,100), ylim=c(0,100), xaxs = "i", yaxs = "i", axes = FALSE, xlab = "", ylab = "")
  axis(1,  labels = c("0.001", "10"), at = c(0, 100), padj = -.5, xlim = c(0, 100))
  axis(2, padj = .5, labels = c("0", "100"), at = c(0, 100), ylim = c(0, 100))
  mtext("Concentration (μg/ml)", 1, 2)
  mtext("% Neutralization", 2, 2)
  dev.off()
}
