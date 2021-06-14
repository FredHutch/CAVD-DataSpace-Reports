library(data.table)
library(Rlabkey)

clustMabs <- function(dats, datp){
    dats <- log10(dats)
    eucDats <- dats
    binDats <- dats

    for(i in 1:ncol(dats)){
        eucDats[is.na(dats[,i]), i] <- mean(dats[,i], na.rm = TRUE)
    }
    binDats[is.na(dats)] <- 0

    if(ncol(dats) != 1){
        dce <- dist(t(eucDats), method = "euclidean")
        dcb <- dist(t(binDats), method = "binary")
        if(max(dce != 0)){
            dce <- dce/max(dce)
        }
        dc <- dce + dcb
        mo <- hclust(dc)$order
    } else {
        mo <- 1
    }

    mo <- rev(mo)

    if(nrow(dats) != 1){
        dre <- dist(eucDats, method = "euclidean")
        drb <- dist(binDats, method = "binary")
        if(max(dre != 0)){
            dre <- dre/max(dre)
        }
        dr <- dre + drb
        vo <- hclust(dr)$order
    } else {
        vo <- 1
    }

    vn <- datp$virus_name[vo]
    mn <- names(datp)[-1][mo]

    return(
        list(
            virus_sort = vn,
            mab_sort = mn,
            virus_order = vo,
            mab_order = mo
        )
    )
}

## converts a data.table to a format that can be read as a set of JS arrays
dt2Arr <- function(dt){
    colArr <- unlist(lapply(dt, function(x){
        if(is.character(x)){
            return(paste0("[\"", paste0(x, collapse = "\",\""), "\"]"))
        }
        if(is.factor(x)){w
            return(paste0("[\"", paste0(as.character(x), collapse = "\",\""), "\"]"))
        }
        return(gsub("Inf", "Infinity", paste0("[", paste0(x, collapse = ","), "]")))
    }))
    paste0("[", paste0(colArr, collapse = ","), "]");
}

## converts a vector to a format that can be read as a JS array
vc2Arr <- function(vc){
    if(is.character(vc)){
        return(paste0("[\"", paste0(vc, collapse = "\",\""), "\"]"))
    }
    if(is.factor(vc)){
        return(paste0("[\"", paste0(as.character(vc), collapse = "\",\""), "\"]"))
    }
    return(paste0("[", paste0(vc, collapse = ","), "]"))
}

getSorts <- function(dat_part){
    datp <- dcast(dat_part, virus_name~mab_mix_label, value.var = "titer_curve_ic50")
    dats <- clustMabs(as.matrix(datp[, -1, with = FALSE]), datp)
    sorts <- lapply(dats[c("mab_sort", "virus_sort")], vc2Arr)
    return(sorts)
}

appendDataObjects <- function(mabDat) {
    dato <- copy(mabDat)
    datp <- copy(mabDat)
    datp[, `:=`(
        titer_curve_ic50 =
            ifelse(titer_curve_ic50 == Inf, max_concentration,
            ifelse(titer_curve_ic50 == -Inf, min_concentration,
                   titer_curve_ic50)),
        titer_curve_ic80 =
            ifelse(titer_curve_ic80 == Inf, max_concentration,
            ifelse(titer_curve_ic80 == -Inf, min_concentration,
                   titer_curve_ic80)),
        mab_isotype_label = mab_isotype,
        virus_clade_label = virus_clade
    )]

    byNames <- c(
        "mab_mix_label",
        "virus_name",
        "mab_ab_binding_type",
        "mab_ab_binding_type_label",
        "mab_isotype",
        "mab_isotype_label",
        "virus_clade",
        "virus_clade_label"
    )

    aggDat <- datp[,.(
        titer_curve_ic50 = exp(mean(log(titer_curve_ic50))),
        titer_curve_ic80 = exp(mean(log(titer_curve_ic80)))
    ), byNames]

    srtDat <- aggDat[, names(aggDat) != "titer_curve_ic80", with = F]

    all.srt <- getSorts(srtDat)
    all.srt <- data.table(type = "all", name = "all", label = "all", mab_sort = all.srt[1], virus_sort = all.srt[2])
    mab.iso <- srtDat[, getSorts(.SD) ,.(mab_isotype, mab_isotype_label)]
    mab.ant <- srtDat[, getSorts(.SD) ,.(mab_ab_binding_type, mab_ab_binding_type_label)]
    vir.cld <- srtDat[, getSorts(.SD) ,.(virus_clade, virus_clade_label)]

    setnames(mab.iso, c("mab_isotype", "mab_isotype_label"),                 c("name","label"))
    setnames(mab.ant, c("mab_ab_binding_type", "mab_ab_binding_type_label"), c("name","label"))
    setnames(vir.cld, c("virus_clade", "virus_clade_label"),                 c("name","label"))

    mab.iso[,type:="mab_isotype_label"]
    mab.ant[,type:="mab_ab_binding_type_label"]
    vir.cld[,type:="virus_clade_label"]

    sorts <- rbindlist(list(all.srt, mab.iso, mab.ant, vir.cld), use.names = T)

    dato[,curve_id:=as.numeric(as.factor(curve_id))]

    stuFits <- unique(
        dato[,.(
            curve_id,
            prot,
            target_cell,
            virus_name,
            mab_mix_label,
            mab_name_std,
            min_concentration,
            max_concentration,
            fit_min,
            fit_max,
            fit_asymmetry,
            fit_slope,
            fit_inflection,
            fit_error,
            titer_curve_ic50,
            titer_curve_ic80,
            titer_point_ic50,
            titer_point_ic80
        )]
    )

    dilNeut <- unique(
        dato[,.(
            curve_id,
            mab_concentration,
            percent_neutralization,
            neutralization_plus_minus
        )]
    )

    aggcols <- vc2Arr(names(aggDat))
    aggdata <- dt2Arr(aggDat)

    srccols <- vc2Arr(names(stuFits))
    srcdata <- dt2Arr(stuFits)

    cnccols <- vc2Arr(names(dilNeut))
    cncdata <- dt2Arr(dilNeut)

    sortTxt <- ""
    for(i in sort(unique(sorts$type))){
        sortTxt <- paste0(sortTxt, i, ":[")
        for(j in sort(unique(sorts[type == i,]$label))){
            sortTxt <-
                paste0(
                    sortTxt,
                    "{",
                    "label:\"", j, "\",",
                    "name:\"", sorts[type == i & label == j]$name, "\",",
                    "mabsrt:", sorts[type == i & label == j]$mab_sort, ",",
                    "virsrt:", sorts[type == i & label == j]$virus_sort,
                    "},"
                )
        }
        sortTxt <- paste0(substr(sortTxt, 1, nchar(sortTxt) - 1), "],")
    }
    sortTxt <- substr(sortTxt, 1, nchar(sortTxt) - 1)

    # ------ Get maps for virus and mab names to ids ----- #
    mabIds <- unique(mabDat[, .(mab_mix_label, mab_mix_id)])
    virIds <- unique(mabDat[, .(virus_name, cds_virus_id)])
    # Convert ids to json-like map
    mabIdMap <- lapply(mabIds$mab_mix_id, function(x) x)
    names(mabIdMap) <- mabIds$mab_mix_label
    mabIdMap <- jsonlite::toJSON(mabIdMap, auto_unbox = TRUE)
    virIdMap <- lapply(virIds$cds_virus_id, function(x) x)
    names(virIdMap) <- virIds$virus_name
    virIdMap <- jsonlite::toJSON(virIdMap, auto_unbox = TRUE)

    return(
        paste0(
            "var mabReportData = {",
            "rawMabData: {",
            paste0(
                "idMaps:{",
                "virus:", virIdMap, ",",
                "mab:", mabIdMap,
                "},"
            ),
            paste0(
                "rawAggVirMab:{",
                "cols:", aggcols, ",",
                "data:", aggdata,
                "},"
            ),
            paste0(
                "rawSorts:{",
                sortTxt,
                "},"
            ),
            paste0(
                "rawConcFits:{",
                "src:{",
                "cols:", srccols, ",",
                "data:", srcdata, "}", ",",
                "cnc:{",
                "cols:", cnccols, ",",
                "data:", cncdata, "}",
                "}"
            ),
            "},",
            "dataStatus: 'pending',",
            "plotStatus: [],",
            "funcStatus: []",
            "};",
            "var mabReportFunc = {};"
        )
    )
}

mapNames <- function(tab){
    setnames(tab, names(tab), gsub(" ", "_", tolower(names(tab))))
    if("study" %in% names(tab)) setnames(tab, "study", "prot")
}

# sql <- "SELECT * \nFROM study.NABMAb as STUDY_NABMAb\n\t\nWHERE STUDY_NABMAb.mab_mix_id IN (SELECT CDS_mAbMetaGridBase.mab_mix_id\n\t\n\tFROM cds.mAbMetaGridBase as CDS_mAbMetaGridBase\n\t\n\t\nWHERE CDS_mAbMetaGridBase.mab_mix_name_std IN ('10E8 V4.0/iMab','10E8 V5.0/iMab','10E8 V5.0','17b'))"
# mabDat  <- data.table(labkey.executeSql(labkey.url.base, labkey.url.path, "CDS", sql))
mabDat <- data.table(labkey.selectRows(labkey.url.base, labkey.url.path, "CDS", labkey.url.params$filteredDatasetQuery))
mabMix <- data.table(labkey.selectRows(labkey.url.base, labkey.url.path, "CDS", "MAbMixMabMeta"))
virMap <- data.table(labkey.selectRows(labkey.url.base,
                                       labkey.url.path,
                                       "CDS",
                                       "nabantigen",
                                       colSelect = c("virus", "virus_full_name", "cds_virus_id"),
                                       colFilter = makeFilter(c("assay_identifier", "EQUAL", "NAB MAB"))
                                       ))
mabLab <- fread("./ab_bind_type_label.csv")

mapNames(mabDat)
mapNames(mabMix)
mapNames(virMap)

mabMix <- unique(
    mabMix[,
           .(
               mab_ab_binding_type = ifelse(length(mab_ab_binding_type) > 1, "Combination", mab_ab_binding_type),
               mab_isotype         = ifelse(length(mab_isotype) > 1, "Combination", mab_isotype),
               mab_name_std        = paste(mab_name_std, collapse = "||")
           ),
           .(mab_mix_id, mab_mix_label)
           ]
)

mabDat <- merge(
    mabDat,
    mabMix,
    by = "mab_mix_id"
)

mabDat <- merge(
    mabDat,
    mabLab,
    by = "mab_ab_binding_type",
    all.x = T,
)

mabDat <- merge(
    mabDat,
    virMap,
    by.x = "virus_full_name",
    by.y = "virus_full_name",
    all.x = TRUE
)

mabDat[is.na(virus_clade),               virus_clade               := ""]
mabDat[is.na(mab_isotype),               mab_isotype               := ""]
mabDat[is.na(mab_ab_binding_type),       mab_ab_binding_type       := ""]
mabDat[is.na(mab_ab_binding_type_label), mab_ab_binding_type_label := ""]

