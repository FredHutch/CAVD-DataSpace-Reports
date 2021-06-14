(() => {
    let mrFunc = this.mabReportFunc;
    let mrData = this.mabReportData;

    let mItems = ["vals", "cols", "mabs", "virs", "labs"];

    mrFunc.hmUpdateMenu = () => {        
        mItems.forEach(k => {
            mrData.hm.menu[k].group
                .selectAll("input")
                .data(mrData.hm.menu[k].elems)
                .property("checked", d => d.status);
        });
    };
    
    let toggleRadio = (elems, pos) => {
        if(elems[pos].status == 0){
            elems.forEach(e => {
                if(e.type != "checkbox"){
                    e.status = 0;
                };
            });
            elems[pos].status = 1;
            mrFunc.hmUpdateMenu();
        }
    };

    mrFunc.hmUpdatePlot = function(){
        mrFunc.hmUpdateScales();      // to load any new group scales
        
        mrFunc.hmUpdatePlotMargins(); // running first to get text width of margins, checks menu, draws text in margins based on scales
        mrFunc.hmUpdateScales();      // determines alignment of text on x for mab and y for virus groups and names, returns only one scale for each margin based on menu selection

        mrFunc.hmUpdatePlotMargins(); // draws text in margins based on scales, checks menu
        mrFunc.hmUpdateScales();      // update scales for plot area

        mrFunc.hmUpdatePlotArea();    // draws plot area based on size of plot area grid cell
    };
    
    ////////////////////////////////
    
    let vals1Fun = function(){
        toggleRadio(mrData.hm.menu.vals.elems, 0);
        mrFunc.hmUpdateColor();
        mrFunc.hmUpdateLegend();
    };
    let vals2Fun = function(){
        toggleRadio(mrData.hm.menu.vals.elems, 1);
        mrFunc.hmUpdateColor();
        mrFunc.hmUpdateLegend();
    };

    ////////////////////////////////
    
    let cols1Fun = function(){
        toggleRadio(mrData.hm.menu.cols.elems, 0);
        mrFunc.hmUpdateColor();
        mrFunc.hmUpdateLegend();
    };
    let cols2Fun = function(){
        toggleRadio(mrData.hm.menu.cols.elems, 1);
        mrFunc.hmUpdateColor();
        mrFunc.hmUpdateLegend();
    };
    let cols3Fun = function(){
        mrData.hm.menu.cols.elems[2].status = !mrData.hm.menu.cols.elems[2].status ? 1 : 0;
        mrFunc.hmUpdateColor();
        mrFunc.hmUpdateLegend();
    };

    ////////////////////////////////
    
    let mabs1Fun = function(){
        toggleRadio(mrData.hm.menu.mabs.elems, 0);
        mrFunc.hmUpdatePlot();
    };
    let mabs2Fun = function(){
        toggleRadio(mrData.hm.menu.mabs.elems, 1);
        mrData.hm.menu.labs.elems[0].status == 0 && mrData.hm.menu.mabs.elems[1].status == 1 && (mrData.hm.menu.labs.elems[0].status = 1);
        mrFunc.hmUpdateMenu();
        mrFunc.hmUpdatePlot();
    };
    let mabs3Fun = function(){
        toggleRadio(mrData.hm.menu.mabs.elems, 2);
        mrData.hm.menu.labs.elems[0].status == 0 && mrData.hm.menu.mabs.elems[2].status == 1 && (mrData.hm.menu.labs.elems[0].status = 1);
        mrFunc.hmUpdateMenu();
        mrFunc.hmUpdatePlot();
    };

    ////////////////////////////////
    
    let virs1Fun = function(){
        toggleRadio(mrData.hm.menu.virs.elems, 0);
        mrFunc.hmUpdatePlot();
    };
    let virs2Fun = function(){
        toggleRadio(mrData.hm.menu.virs.elems, 1);
        mrData.hm.menu.labs.elems[1].status == 0 && mrData.hm.menu.virs.elems[1].status == 1 && (mrData.hm.menu.labs.elems[1].status = 1);
        mrFunc.hmUpdateMenu();
        mrFunc.hmUpdatePlot();
    };

    ////////////////////////////////
    
    let labs1Fun = function(){
        mrData.hm.menu.labs.elems[0].status = !mrData.hm.menu.labs.elems[0].status ? 1 : 0;
        if(mrData.hm.menu.labs.elems[0].status == 0 && (mrData.hm.menu.mabs.elems[1].status == 1 || mrData.hm.menu.mabs.elems[2].status == 1)){
            mrData.hm.menu.mabs.elems[0].status = 1;
            mrData.hm.menu.mabs.elems[1].status = 0;
            mrData.hm.menu.mabs.elems[2].status = 0;
            mrFunc.hmUpdateMenu();
        };
        mrFunc.hmUpdatePlot();
    };
    let labs2Fun = function(){
        mrData.hm.menu.labs.elems[1].status = !mrData.hm.menu.labs.elems[1].status ? 1 : 0;
        if(mrData.hm.menu.labs.elems[1].status == 0 && mrData.hm.menu.virs.elems[1].status == 1){
            mrData.hm.menu.virs.elems[0].status = 1;
            mrData.hm.menu.virs.elems[1].status = 0;
            mrFunc.hmUpdateMenu();
        };
        mrFunc.hmUpdatePlot();
    };

    ////////////////////////////////
    
    mrFunc.hmMenuInit = function() {
        mrData.hm.menu = {
            vals:{
                name: "Values",
                elems: [
                    {
                        type:"radio",
                        id:"vals1",
                        label:"Titer IC50",
                        status: 1,
                        fun: vals1Fun
                    },{
                        type:"radio",
                        id:"vals2",
                        label:"Titer IC80",
                        status: 0,
                        fun: vals2Fun
                    }
                ]
            },
            cols: {
                name: "Colors",
                elems: [
                    {
                        type:"radio",
                        id:"cols1",
                        label:"Kestrel",
                        status: 1,
                        fun: cols1Fun
                    },{
                        type:"radio",
                        id:"cols2",
                        label:"Oriole",
                        status: 0,
                        fun: cols2Fun
                    },{
                        type:"checkbox",
                        id:"cols3",
                        label:"Show as ranges",
                        status: 0,
                        fun: cols3Fun
                    }
                ]
            },
            mabs: {
                name: "MAb Grouping",
                elems: [
                    {
                        type:"radio",
                        id:"mabs1",
                        label:"None",
                        status: 1,
                        fun: mabs1Fun
                    },{
                        type:"radio",
                        id:"mabs2",
                        label:"Antibody binding type",
                        status: 0,
                        fun: mabs2Fun
                    },{
                        type:"radio",
                        id:"mabs3",
                        label:"Antibody isotype",
                        status: 0,
                        fun: mabs3Fun
                    }
                ]
            },
            virs: {
                name: "Virus Grouping",
                elems: [
                    {
                        type:"radio",
                        id:"virs1",
                        label:"None",
                        status: 1,
                        fun: virs1Fun
                    },{
                        type:"radio",
                        id:"virs2",
                        label:"Clades",
                        status: 0,
                        fun: virs2Fun
                    }
                ]
            },
            labs: {
                name: "Labeling",
                elems: [
                    {
                        type:"checkbox",
                        id:"labs3",
                        label:"MAb labels",
                        status: 1,
                        fun: labs1Fun
                    },
                    {
                        type:"checkbox",
                        id:"labs3",
                        label:"Virus labels",
                        status: 0,
                        fun: labs2Fun
                    }
                ]
            }
        };
    };
        
    mrFunc.hmAppendMenu = function(group) {
        mrFunc.hmMenuInit();
        group.append("h3").attr("id", "hm_menu_title").text("Heatmap parameters");
        group.append("br");
        let enterMenu = (inObj) => {
            inObj.group.append("div").attr("class", "hm_menu_heading").text(inObj.name);

            inObj.elems.forEach(d => {
                    inObj.group
                        .append("input")
                        .attr("type", d.type)
                        .attr("class", (
                            "hm_item_btn" +
                                (d.type == "radio" ? " hm_item_btn_radio" : " hm_item_btn_checkbox")
                        ))
                        .attr("id", d.id)
                        .property("checked", d.status)
                        .on("click", d.fun);

                    inObj.group
                        .append("label", "input")
                        .attr("for", d.id)
                        .attr("class", "hm_item_lab")
                        .text(d.label);

                    inObj.group
                        .append("br", "label");
            });
            
            inObj.group
                .append("br");
        };
        mItems.forEach(k => {
            mrData.hm.menu[k].group = group.append("div").attr("class", "hm_menu_item");
            enterMenu(mrData.hm.menu[k]);
        });
    };

    mrFunc.colorRampPalette = function(cols) {
        // (cur - bot) / (top - bot)
        let interps = [...Array(cols.length - 1)].map( (_, i) => d3.interpolateRgb(cols[i], cols[i+1]) );
        return(
            function(k) {
                let bot = k == 1 ? interps.length - 1 : Math.floor(k * ( interps.length ));
                let rem = k * ( interps.length ) - bot;
                let rgb = interps[bot];
                return( rgb(rem) );
            }
        );
    };
    
    mrFunc.hmKestrelCols = function(titerVal) {
        let kcol = [ d3.rgb('#bd0026'), d3.rgb('#f03b20'), d3.rgb('#fec24c'), d3.rgb('#ffffb2'), d3.rgb('#6699ff') ];
        let tmin = Math.min(...mrData.hm.dataLong.map(d => d[titerVal]));
        let tmax = Math.max(...mrData.hm.dataLong.map(d => d[titerVal]));
        let tscl = mrFunc.hmLogScale(tmin, tmax);
        let cpal = mrFunc.colorRampPalette(kcol);
        let kcol_log = [...Array(tscl.values.length    )].map((_, i) => cpal((i) / (tscl.values.length - 1)));
        let kcol_bin = [...Array(tscl.values.length - 1)].map((_, i) => cpal((i) / (tscl.values.length - 2)));        
        tscl.colScale = {};
        tscl.colScale.log = d3.scale.log().domain(tscl.values).range( kcol_log );
        tscl.colScale.bin = d3.scale.threshold()
            .domain( tscl.values.slice(1, -1) )
            .range( kcol_bin );
        return(tscl);
    };

    mrFunc.hmOrioleCols = function(titerVal) {
        let ocol = [ d3.rgb('#ff7700'), d3.rgb('#ffbb33'), d3.rgb('#a7a6a6'), d3.rgb('#231f20') ];
        let tmin = Math.min(...mrData.hm.dataLong.map(d => d[titerVal]));
        let tmax = Math.max(...mrData.hm.dataLong.map(d => d[titerVal]));
        let tscl = mrFunc.hmLogScale(tmin, tmax);
        let cpal = mrFunc.colorRampPalette(ocol);
        let ocol_log = [...Array(tscl.values.length    )].map((_, i) => cpal((i) / (tscl.values.length - 1)));
        let ocol_bin = [...Array(tscl.values.length - 1)].map((_, i) => cpal((i) / (tscl.values.length - 2)));
        tscl.colScale = {};
        tscl.colScale.log = d3.scale.log().domain(tscl.values).range( ocol_log );
        tscl.colScale.bin = d3.scale.threshold()
            .domain( tscl.values.slice(1, -1) )
            .range( ocol_bin );
        return(tscl);
    };

    mrFunc.logAdjust = function(val, adj){
        if(val == 0) return 0;
        let exp = (-1 * Math.floor(Math.log10(val)) + 1);
        let enm = Math.pow(10, exp);
        let nvl = adj(val * enm);
        let out = d3.format("~f")(Number((nvl * Math.pow(10, (-1 * exp)))).toFixed(Math.abs(exp)));
        return out;
    };
    
    mrFunc.hmLogScale = function(tmin, tmax) {
        let logScale = {
            min: tmin,
            max: tmax
        };
        logScale.minlog = Math.floor(Math.log10(logScale.min));
        logScale.maxlog = Math.ceil(Math.log10(logScale.max));
        logScale.values = [...Array((logScale.maxlog + 1) - logScale.minlog)].map((_, i) => Math.pow(10, logScale.minlog + i));
        logScale.values = [
            mrFunc.logAdjust(tmin, Math.floor),
            ...logScale.values.slice(1, -1),
            mrFunc.logAdjust(tmax, Math.ceil)
        ];
        logScale.values = logScale.values.map(d => String(d));
        return logScale;
    };

    mrFunc.hmUpdateColor = function() {
        let rect = d3.selectAll(".hm_plot_area>svg>rect");
        
        let valTypStat = mrData.hm.menu.vals.elems.findIndex(e => e.status == 1);
        let colTypStat = mrData.hm.menu.cols.elems.findIndex(e => e.status == 1);
        let colBinStat = mrData.hm.menu.cols.elems[2].status;

        let vals = valTypStat ? "titer_curve_ic80" : "titer_curve_ic50";
        
        mrData.hm.colors.kestrel = mrFunc.hmKestrelCols( vals );
        mrData.hm.colors.oriole  = mrFunc.hmOrioleCols( vals );

        switch(colTypStat){
        case 0:
            if(colBinStat){
                rect.attr("fill", d => mrData.hm.colors.kestrel.colScale.bin(d[vals]));
            } else {
                rect.attr("fill", d => mrData.hm.colors.kestrel.colScale.log(d[vals]));
            };
            break;
        case 1:
            if(colBinStat){
                rect.attr("fill", d => mrData.hm.colors.oriole.colScale.bin(d[vals]));
            } else {
                rect.attr("fill", d => mrData.hm.colors.oriole.colScale.log(d[vals]));
            };
            break;            
        }
    };
    
    mrFunc.hmCreateScale = function(domain, range){
        return(
            d3 
                .scale.ordinal()
                .domain(domain)
                .range(range)
        );
    };
        
    mrFunc.hmBuildGroupMarginScales = function(nestObj, srtName, mabSize){
        let names = nestObj.nest.map(n => n.label);
        let lens  = nestObj.nest.map(n => n[srtName].length);
        let gObj  = {};
        if(lens.length == 1) {
            gObj.divScl = mrFunc.hmCreateScale(names, [0]);
            gObj.namScl = mrFunc.hmCreateScale(names, [(mabSize * lens) / 2]);
        } else {
            let ends = lens.map((s => v => s += ( v * mabSize ))(0));
            ends.pop();
            ends = [0, ...ends];
            let mids = lens.map((s => v => s += ( v * mabSize ))(0));
            mids = mids.map((_, i) => mids[i] - ( ( lens[i] * mabSize ) / 2 ));
            gObj.divScl = mrFunc.hmCreateScale(names, ends);
            gObj.namScl = mrFunc.hmCreateScale(names, mids);
        };
        return(gObj);
    };
   
    mrFunc.hmUpdateScales = function(){

        // uses current size of plot area to determine scaling ranges

        let plotArea = d3
            .select(".hm_plot_area")
            .node()
            .getBoundingClientRect();

        // convenience variables
        
        let minSize = mrData.hm.labelSize;
        let sorts = mrData.hm.sorts;
        let scale = mrFunc.hmCreateScale;

        // get status of menu
        
        let mabLabStat = mrData.hm.menu.labs.elems[0].status; // when labels are present we want the plot to overflo, else, scale to cell.
        let virLabStat = mrData.hm.menu.labs.elems[1].status;

        let mabGrpStat = mrData.hm.menu.mabs.elems.findIndex(e => e.status == 1);
        let virGrpStat = mrData.hm.menu.virs.elems.findIndex(e => e.status == 1);

        // if labels are on, then label size, else percent size
        
        let mabPctSize = plotArea.width  / mrData.hm.sorts.all.mabsrt.length; 
        let virPctSize = plotArea.height / mrData.hm.sorts.all.virsrt.length;

        let mabLabSize = Math.max( minSize, mabPctSize );
        let virLabSize = Math.max( minSize, virPctSize );

        let mabSize = mabLabStat ? mabLabSize : mabPctSize;
        let virSize = virLabStat ? virLabSize : virPctSize;

        // generate scales

        // mab and vir get positioning: label name, group name, group divider, cell
        // if group is all, group name is blank
        
        let mabAbGrpScl = mrFunc.hmBuildGroupMarginScales(mrData.hm.sorts.group.mab_ab_binding_type_label, "mabsrt", mabSize);
        let mabIsGrpScl = mrFunc.hmBuildGroupMarginScales(mrData.hm.sorts.group.mab_isotype_label,         "mabsrt", mabSize);
        let virusGrpScl = mrFunc.hmBuildGroupMarginScales(mrData.hm.sorts.group.virus_clade_label,         "virsrt", virSize);

        let scales = mrData.hm.scales;

        if(mabLabStat){            
            switch(mabGrpStat){
            case 0: 
                scales.mab.nameLab  = scale(sorts.all.mabsrt, sorts.all.mabsrt.map((_, i) => (i * mabLabSize) + (mabLabSize / 2)));
                scales.mab.groupLab = scale("", [sorts.all.mabsrt.length * mabLabSize / 2]);
                scales.mab.groupDiv = scale("", 0);
                scales.mab.cell     = scale(sorts.all.mabsrt, sorts.all.mabsrt.map((_, i) => i * mabLabSize));
                break;
            case 1:
                let abNames = sorts.group.mab_ab_binding_type_label.name;
                scales.mab.nameLab  = scale(abNames, abNames.map((_, i) => (i * mabLabSize) + (mabLabSize / 2)));
                scales.mab.groupLab = mabAbGrpScl.namScl;
                scales.mab.groupDiv = mabAbGrpScl.divScl;
                scales.mab.cell     = scale(abNames, abNames.map((_, i) => i * mabLabSize));
                break;
            case 2:
                let isNames = sorts.group.mab_isotype_label.name;
                scales.mab.nameLab  = scale(isNames, isNames.map((_, i) => (i * mabLabSize) + (mabLabSize / 2)));
                scales.mab.groupLab = mabIsGrpScl.namScl;
                scales.mab.groupDiv = mabIsGrpScl.divScl;
                scales.mab.cell     = scale(isNames, isNames.map((_, i) => i * mabLabSize));
                break;
            };
        } else { // for when mab labels are turned off
            // scales.mab.nameLab  = null;
            scales.mab.groupLab = scale("", [sorts.all.mabsrt.length * mabLabSize / 2]);
            scales.mab.groupDiv = scale("", 0);
            scales.mab.cell     = scale(sorts.all.mabsrt, sorts.all.mabsrt.map((_, i) => i * mabPctSize));
        };

        if(virLabStat){
                scales.vir.nameLab  = scale(sorts.all.virsrt, sorts.all.virsrt.map((_, i) => (i * virLabSize) + (virLabSize / 2)));
                scales.vir.groupLab = scale("", [sorts.all.virsrt.length * virLabSize / 2]);
                scales.vir.groupDiv = scale("", [sorts.all.virsrt.length * virLabSize]);
                scales.vir.cell     = scale(sorts.all.virsrt, sorts.all.virsrt.map((_, i) => i * virLabSize));
            switch(virGrpStat){
            case 0:
                scales.vir.nameLab  = scale(sorts.all.virsrt, sorts.all.virsrt.map((_, i) => (i * virLabSize) + (virLabSize / 2)));
                scales.vir.groupLab = scale("", [sorts.all.virsrt.length * virLabSize / 2]);
                scales.vir.groupDiv = scale("", [sorts.all.virsrt.length * virLabSize]);
                scales.vir.cell     = scale(sorts.all.virsrt, sorts.all.virsrt.map((_, i) => i * virLabSize));
                break;
            case 1:
                let clNames = sorts.group.virus_clade_label.name;
                scales.vir.nameLab  = scale(clNames, clNames.map((_, i) => (i * virLabSize) + (virLabSize / 2)));
                scales.vir.groupLab = virusGrpScl.namScl;
                scales.vir.groupDiv = virusGrpScl.divScl;
                scales.vir.cell     = scale(clNames, clNames.map((_, i) => i * virLabSize));
                break;
            };
        } else { // for when vir labels are turned off
            // scales.vir.nameLab  = scale(sorts.all.virsrt, sorts.all.virsrt.map((_, i) => (i * virPctSize) + (virPctSize / 2)));
            scales.vir.groupLab = scale("", [sorts.all.virsrt.length * virPctSize / 2]);
            scales.vir.groupDiv = scale("", [sorts.all.virsrt.length * virPctSize]);
            scales.vir.cell     = scale(sorts.all.virsrt, sorts.all.virsrt.map((_, i) => i * virPctSize));
        };
    };
    
    mrFunc.hmUpdatePlotMargins = function() {
        // triggered when grouping is changed
        //  + reorder vir and mab names        
        //  + replot group names and dividers

        let mabGrpStat = mrData.hm.menu.mabs.elems.findIndex(e => e.status == 1);
        let virGrpStat = mrData.hm.menu.mabs.elems.findIndex(e => e.status == 1);

        let mabLabStat = mrData.hm.menu.labs.elems[0].status; // when labels are present we want the plot to overflow, else, scale to cell.
        let virLabStat = mrData.hm.menu.labs.elems[1].status;

        let mabNamesSvg = d3.select(".hm_plot_mab_names>svg");
        let virNamesSvg = d3.select(".hm_plot_vir_names>svg");

        let mabGroupSvg = d3.select(".hm_plot_mab_group>svg");
        let virGroupSvg = d3.select(".hm_plot_vir_group>svg");

        // update name labels and svg sizes

        mabNamesSvg.selectAll("g").remove();
        virNamesSvg.selectAll("g").remove();
        
        mabLabStat && ( mrFunc.hmPlotMabNames() );
        virLabStat && ( mrFunc.hmPlotVirNames() );
        
        let mbb = mabNamesSvg
            .node()
            .getBBox();

        let vbb = virNamesSvg
            .node()
            .getBBox();

        mabNamesSvg
            .attr("width",  mbb.width + mbb.x)
            .attr("height", mabLabStat ? mbb.height + mbb.y : 0);

        virNamesSvg
            .attr("width",  virLabStat ? vbb.width + vbb.x : 0)
            .attr("height", vbb.height + vbb.y);

        // remove and add dividers and divider labels

        // for mab groups

        d3
            .select(".hm_plot_mab_group>svg")
            .selectAll("g")
            .remove();
        
        d3
            .select(".hm_plot_mab_group>svg")
            .selectAll(".nameg")
            .data(mrData.hm.scales.mab.groupLab.domain())
            .enter()
            .append("g")
            .attr("class", "nameg")
            .attr("transform", d => "rotate(-90," + mrData.hm.scales.mab.groupLab(d) + ", 0)")
            .append("text")
            .attr("x", d => mrData.hm.scales.mab.groupLab(d) )
            .attr("y", () => 0)
            .attr("dominant-baseline", "middle")
            .attr("text-anchor", "start")
            .attr("fill", "black")
            .attr("font-size", mrData.hm.labelSize)
            .text(d => d);

        let endBuff = 5;
        let margin  = 15;        
        
        let mgb = mabGroupSvg
            .node()
            .getBBox();
        
        d3
            .selectAll(".hm_plot_mab_group>svg>g")
            .attr("transform", d => "rotate(-90," + mrData.hm.scales.mab.groupLab(d) + ", " + mgb.height + ")")
            .selectAll("text")
            .attr("x", d => mrData.hm.scales.mab.groupLab(d))
            .attr("y", () => mgb.height);
        
        d3
            .select(".hm_plot_mab_group>svg")
            .selectAll(".divg")
            .data(mrData.hm.scales.mab.groupDiv.domain())
            .enter()
            .append("g")
            .attr("class", "divg")
            .append("rect")
            .attr("x", d => ( mrData.hm.scales.mab.groupDiv(d) + endBuff ) )
            .attr("y", () => mgb.height + margin / 2)
            .attr("width", d => Math.max(0, ((mrData.hm.scales.mab.groupLab(d) - mrData.hm.scales.mab.groupDiv(d)) * 2) - endBuff * 2))
            .attr("height", 2)
            .attr("fill", "black");
        
        // for virus groups

        d3
            .select(".hm_plot_vir_group>svg")
            .selectAll("g")
            .remove();
        
        d3
            .select(".hm_plot_vir_group>svg")
            .selectAll(".nameg")
            .data(mrData.hm.scales.vir.groupLab.domain())
            .enter()
            .append("g")
            .attr("class", "nameg")
            .append("text")
            .attr("x", () => 0)
            .attr("y", d => mrData.hm.scales.vir.groupLab(d) )
            .attr("dominant-baseline", "middle")
            .attr("text-anchor", "end")
            .attr("fill", "black")
            .attr("font-size", mrData.hm.labelSize)
            .text(d => d);

        let vgb = virGroupSvg
            .node()
            .getBBox();

        d3
            .selectAll(".hm_plot_vir_group>svg>g")
            .selectAll("text")
            .attr("x", () => vgb.width)
            .attr("y", d => mrData.hm.scales.vir.groupLab(d));
                
        virGroupSvg
            .selectAll(".divg")
            .data(mrData.hm.scales.vir.groupDiv.domain())
            .enter()
            .append("g")
            .attr("class", "divg")
            .append("rect")
            .attr("x", () => vgb.width + margin / 2)
            .attr("y", d => (mrData.hm.scales.vir.groupDiv(d) + endBuff) )
            .attr("width", 2)
            .attr("height", d => Math.max(0, ((mrData.hm.scales.vir.groupLab(d) - mrData.hm.scales.vir.groupDiv(d)) * 2) - endBuff * 2))
            .attr("fill", "black");

        mgb = mabGroupSvg
            .node()
            .getBBox();

        
        vgb = virGroupSvg
            .node()
            .getBBox();
        
        mabGroupSvg
            .attr("width", mgb.width + mgb.x + 5)
            .attr("height", mgb.height + 10);


        virGroupSvg
            .attr("width", vgb.width + 10)
            .attr("height", vgb.height + vgb.y + 5);
        
    };
    
    mrFunc.hmUpdatePlotArea = function() {
        let areaDim = d3
            .select(".hm_plot_area")
            .node()
            .getBoundingClientRect();

        let mabRng = mrData.hm.scales.mab.cell.range();
        let virRng = mrData.hm.scales.vir.cell.range();

        let cw = mabRng.length == 1 ? areaDim.width  : mabRng[1] - mabRng[0];
        let ch = virRng.length == 1 ? areaDim.height : virRng[1] - virRng[0];
        
        // if mab labels on
        // - use mab label width
        // else
        // - use pecent cell width
        
        d3
            .select(".hm_plot_area>svg")
            .selectAll("rect")
            .attr("x", d => mrData.hm.scales.mab.cell(d.mab_mix_label))
            .attr("y", d => mrData.hm.scales.vir.cell(d.virus_name))
            .attr("width", d => cw)
            .attr("height", d => ch);

        let pltAreaSvg = d3.select(".hm_plot_area>svg");
        
        let pbb = pltAreaSvg
            .node()
            .getBBox();

        pltAreaSvg
            .attr("width",  pbb.width)
            .attr("height", pbb.height);

    };

    mrFunc.hmPlotMabNames = function() {

        let svg = d3
            .select(".hm_plot_mab_names>svg");

        svg
            .selectAll(".mabName")
            .data(mrData.hm.scales.mab.nameLab.domain())
            .enter()
            .append("g")
            .attr("transform", d => "rotate(-90," + mrData.hm.scales.mab.nameLab(d) + ", 5)")
            .append("text")
            .attr("x", d => mrData.hm.scales.mab.nameLab(d) )
            .attr("y", d => 5)
            .attr("dominant-baseline", "middle")
            .attr("text-anchor", "end")
            .attr("fill", "black")
            .attr("font-size", mrData.hm.labelSize)
            .text(d => d);

        let svgDim = svg.node().getBBox();
        
        svg
            .attr("width", svgDim.width + svgDim.x);

    };

    mrFunc.hmPlotVirNames = function() {

        let svg = d3
            .select(".hm_plot_vir_names>svg");

        svg
            .selectAll(".virName")
            .data(mrData.hm.scales.vir.nameLab.domain())
            .enter()
            .append("g")
            .append("text")
            .attr("x", d => 5)
            .attr("y", d => mrData.hm.scales.vir.nameLab(d) )
            .attr("dominant-baseline", "middle")
            .attr("text-anchor", "start")
            .attr("fill", "black")
            .attr("font-size", mrData.hm.labelSize)
            .text(d => d);

        let svgDim = svg.node().getBBox();

        svg
            .attr("height", svgDim.height + svgDim.y);
        
    };
    
    mrFunc.hmAppendPlot = function(group) {
        // append state should be following setup
        // * ic50
        // * kestrel colors
        // * no mab grouping
        // * no virus grouping
        // * only mab labels

        let areaDim = group
            .node()
            .getBoundingClientRect();

        let minSize = mrData.hm.labelSize;
        let pctSize = areaDim.width/mrData.hm.sorts.all.mabsrt.length;
        let size = Math.max(minSize, pctSize);
        let margin = 15;

        mrData.hm.colors = {};
        mrData.hm.colors.kestrel = mrFunc.hmKestrelCols("titer_curve_ic50");
        mrData.hm.colors.oriole = mrFunc.hmOrioleCols("titer_curve_ic50");
        
        d3
            .select(".hm_plot_area>svg")
            .attr("width", "100%")
            .attr("height", "100%");

        mrData.hm.scales = {
            mab: {},
            vir: {}
        };
        
        mrFunc.hmUpdateScales();
        
        // plot initial margins

        // resize grid, update scales
        mrFunc.hmUpdateScales();

        // plot cells in new plot area
        
        let mabRng = mrData.hm.scales.mab.cell.range();
        let virRng = mrData.hm.scales.vir.cell.range();
        
        let cw = mabRng.length == 1 ? areaDim.width  : mabRng[1] - mabRng[0];
        let ch = virRng.length == 1 ? areaDim.height : virRng[1] - virRng[0];

        d3
            .select(".hm_plot_area>svg")
            .selectAll(".hmrect")
            .data(mrData.hm.dataLong)
            .enter()
            .append("rect")
            .attr("x", d => mrData.hm.scales.mab.cell(d.mab_mix_label))
            .attr("y", d => mrData.hm.scales.vir.cell(d.virus_name))
            .attr("width",  d => cw)
            .attr("height", d => ch)
            .attr("stroke-width", "0px")
            .attr("fill",   d => mrData.hm.colors.kestrel.colScale.log(d.titer_curve_ic50));

        // add scroll event to label div that scrolls other divs

        d3
            .select(".hm_plot_mab_names")
            .on("scroll", function(e){
                let sl = d3.event.target.scrollLeft;
                d3.select(".hm_plot_area").node().scrollLeft = sl;
                d3.select(".hm_plot_mab_group").node().scrollLeft = sl;
            });
        
        d3
            .select(".hm_plot_vir_names")
            .on("scroll", function(){
                let st = d3.event.target.scrollTop;
                d3.select(".hm_plot_area").node().scrollTop = st;
                d3.select(".hm_plot_vir_group").node().scrollTop = st;
            });

        // add resize event
        
        window.addEventListener('resize', function() {
            if(Array.from(document.querySelector("#mab_heatmap").classList).includes("active")){
                clearTimeout(mrData.hm.resizeId);
                mrData.hm.resizeId = setTimeout(function() {
                    mrFunc.hmUpdatePlot();
                }, 500);
            };
        });

        // resize svg elements to show content and overflow
                
        // let mabNamesDim = d3
        //     .select(".hm_plot_mab_names>svg")
        //     .node()
        //     .getBBox();

        // let virNamesDim = d3
        //     .select(".hm_plot_vir_names>svg")
        //     .node()
        //     .getBBox();
        
        // let plotDim = d3
        //     .select(".hm_plot_area>svg")
        //     .node()
        //     .getBBox();
        
        // d3
        //     .select(".hm_plot_mab_names>svg")
        //     .attr("height", mabNamesDim.height + mabNamesDim.y)
        //     .attr("width", plotDim.width);

        // d3
        //     .select(".hm_plot_vir_names>svg")
        //     .attr("height", plotDim.height)
        //     .attr("width", virNamesDim.width + virNamesDim.x);
        
        // d3
        //     .select(".hm_plot_area>svg")
        //     .attr("height", plotDim.height)
        //     .attr("width", plotDim.width);
        
    };

    mrFunc.hmBinLegend = function() {
        let colTypStat = mrData.hm.menu.cols.elems.findIndex(e => e.status == 1);
        let cols = colTypStat ? mrData.hm.colors.oriole.colScale : mrData.hm.colors.kestrel.colScale;
        cols = cols.bin;

        let dom = Array.from(cols.domain());
        let rng = Array.from(cols.range());

        let int1 = dom.slice(0, -1);
        let int2 = dom.slice(1);

        let intv = int1.map( (e, i) => "[ " + e + ", " + int2[i] + " )" );
        intv = [("< " + dom[0]), ...intv, ("≥ " + dom[dom.length - 1])];

        let bsrt = 55;
        let bend = 130;
        let csiz = (bend - bsrt) / intv.length;
        let buff = 2;
        let lcen = 80; // legend center, not true center just split between text and gradient bar
        
        let cscl = d3
            .scale.ordinal()
            .domain(intv)
            .range(rng);

        let yscl = d3
            .scale.ordinal()
            .domain(intv)
            .range([...Array(intv.length)].map((_, i) => ( i * bend / intv.length) + bsrt));

        let legd = d3
            .select(".hm_legend>svg")
            .append("g")
            .attr("id", "hmLegend");

        legd
            .selectAll(".cells")
            .data(intv)
            .enter()
            .append("rect")
            .attr("x", lcen)
            .attr("y", d => yscl(d))
            .attr("width", 30)
            .attr("height", csiz - buff)
            .attr("fill", d => cscl(d));

        legd
            .selectAll(".text")
            .data(intv)
            .enter()
            .append("text")
            .attr("x", lcen - 5)
            .attr("y", d => yscl(d) + ((csiz - buff) / 2))
            .attr("dominant-baseline", "middle")
            .attr("text-anchor", "end")
            .text(d => d);

        let lsvg = d3.select(".hm_legend>svg");
        let lbbx = lsvg.node().getBBox();

        lsvg
            .attr("height", lbbx.height + lbbx.y)
            .attr("width",  lbbx.width  + lbbx.x);
        
    };

    mrFunc.hmLogLegend = function() {
        let colTypStat = mrData.hm.menu.cols.elems.findIndex(e => e.status == 1);
        let cols = colTypStat ? mrData.hm.colors.oriole.colScale : mrData.hm.colors.kestrel.colScale;

        let group = d3
            .select(".hm_legend>svg")
            .append("g")
            .attr("id", "hmLegend");

        let defs = group
            .append("defs");
        
        let ligr = defs
            .append("linearGradient")
            .attr("id", "hm_legend_bar")
            .attr("x1", 0.5)
            .attr("y1", 0)
            .attr("x2", 0.5)
            .attr("y2", 1);

        let dom = cols.log.domain();
        let rng = cols.log.range();
        let pct = rng.map((_, i) => i / (rng.length - 1));
        let colOff = pct.map((p, i) => [ (p * 100) + "%", rng[i] ]);

        let bstr = 60;
        let bhit = 120;
        let tpos = pct.map(p => (p * bhit) + bstr);
        let buff = 2;
        let lcen = 80; // legend center, not true center just split between text and gradient bar

        let tscl = d3
            .scale.ordinal()
            .domain(dom)
            .range(tpos);
        
        colOff.map(x => {
            ligr
                .append("stop")
                .attr("offset", x[0])
                .attr("stop-color", x[1])
                .attr("stop-opacity", 1);
        });

        group
            .append("rect")
            .attr("x",      lcen)
            .attr("y",      bstr)
            .attr("fill",   "url(#hm_legend_bar)")
            .attr("width",  30) 
           .attr("height", bhit);

        group
            .append("g")
            .selectAll(".legend_ticks")
            .data(dom)
            .enter()
            .append("g")
            .attr("class", ".legend_ticks")
            .append("text")
            .attr("x", lcen - 7)
            .attr("y", d => tscl(d))
            .attr("dominant-baseline", "middle")
            .attr("text-anchor", "end")
            .text(d => d);

        d3
            .selectAll(".legend_ticks")
            .append('line')
            .attr("x1", lcen - 5)
            .attr("y1", d => tscl(d))
            .attr("x2", lcen + 5)
            .attr("y2", d => tscl(d))
            .attr("stroke", '#000')
            .attr("stroke-width", "2px");
        
        let lsvg = d3.select(".hm_legend>svg");
        let lbbx = lsvg.node().getBBox();

        lsvg
            .attr("height", lbbx.height + lbbx.y)
            .attr("width",  lbbx.width  + lbbx.x);

    };
    
    mrFunc.hmUpdateLegend = function() {
        let valTypStat = mrData.hm.menu.vals.elems.findIndex(e => e.status == 1);
        let colTypStat = mrData.hm.menu.cols.elems.findIndex(e => e.status == 1);
        let colBinStat = mrData.hm.menu.cols.elems[2].status;

        let headingTxt = valTypStat ? "Titer IC80" : "Titer IC50";
        
        d3
            .select(".hm_legend>svg>#hmLegend")
            .remove();

        d3
            .select(".hm_legend_heading")
            .text(headingTxt + " (μg/ml)");

        colBinStat ? mrFunc.hmBinLegend() : mrFunc.hmLogLegend();
        
    };
    
    mrFunc.hmAppendLegend = function(group) {
        let svg = group.append("svg");
        
        svg
            .append("text")
            .attr("class", "hm_legend_heading")
            .text("Titer IC50 (μg/ml)")
            .attr("x", "20")
            .attr("y", "30")
            .attr("dominant-baseline", "hanging")
            .attr("text-anchor", "start");
        
        mrFunc.hmLogLegend();
    };

    mrFunc.hmAppendTooltip = function() {

        d3
            .select(".mabreportconts>#mab_heatmap>#hm_report")
            .append("div")
            .attr("id", "hm_tooltip")
            .style("visibility", "hidden")
            .style("left", "0px")
            .style("top", "0px")
            .style("position", "fixed")
            .append("table")
            .attr("id", "tooltiptable")
            .append("img")
            .attr("id", "tooltipimg");

        d3
            .selectAll(".hm_plot_area>svg>rect")
            .on("mouseenter", function() {
                mrFunc.hmTooltipMouseEvent(d3.select(this), event);
            })
            .on("mouseleave", function() {
                d3
                    .select("#hm_report>#hm_tooltip")
                    .style("left", "0px")
                    .style("top", "0px")
                    .style("visibility", "hidden");
            })
            .on("mousemove", function() {
                let mx = d3.event.x;
                let my = d3.event.y;                
                d3
                    .select("#hm_report>#hm_tooltip")
                    .style("left", mx + 15 + "px")
                    .style("top",  my + 15 + "px");
            });

        
    };

    mrFunc.hmTooltipMouseEvent = function(e) {

        let valTypStat = mrData.hm.menu.vals.elems.findIndex(e => e.status == 1);
        let tvalue     = valTypStat ? "Titer IC80" : "Titer IC50";
        let ttid       = "#hm_report>#hm_tooltip";

        mrData.hm.tooltip = {};
        let mtt = mrData.hm.tooltip;
        mtt = {
            mx: d3.event.x,
            my: d3.event.y,
            lx: d3.event.clientX,
            ly: d3.event.clientY
        };

        let elm = e.node();
        let dat = elm.__data__;
        
        mtt.data = Object.keys(dat).map((k, i) => {
            return(
                [
                    k
                        .replace(/_/g, " ")
                        .replace(" mix label", "")
                        .replace(" curve", "")
                        .replace("mab", "MAb")
                        .replace("vir", "Vir")
                        .replace("titer", "Titer")
                        .replace("ic50", "IC50")
                        .replace("ic80", "IC80"),
                    k.includes("titer") ? String(mrFunc.logAdjust(Object.values(dat)[i], Math.round)) : Object.values(dat)[i], 
                ]
            );
        });

        //  reducing to column names
        mtt.data = mtt.data.filter(d => ["Virus name", "MAb", tvalue].map(c => d[0] == c).reduce((a, c) => a || c));

        dat.length == 0 ? (d3.select(ttid).style("visibility", "hidden")) : (d3.select(ttid).style("visibility", "visible"));

        var table = d3
            .select(ttid)
            .style("left", mtt.mx + 15 + "px")
            .style("top", mtt.my + 15 + "px");

        var rows = table
            .selectAll("tr")
            .data(mtt.data);

        rows
            .enter()
            .append("tr")
            .selectAll("td")
            .data(d => d)
            .enter()
            .append("td")
            .text(d => d);

        rows
            .selectAll("td")
            .data(d => d)
            .text(d => d);

        rows
            .exit()
            .remove();

        const mksrc = (data) => {
            let paletteName = "gray";
            let virus = "";
            let mab = "";
            data.forEach(d => {
                if (d[0] == "Virus name") virus = mrData.rawMabData.idMaps.virus[d[1]];
                if (d[0] == "MAb") mab = mrData.rawMabData.idMaps.mab[d[1]];
            });
            return(
                mrData.webdav + 
                    "/CAVD/%40files//report_files/mab_visualizations/neutralizationCurves/" +
                    paletteName + "/" + mab + "/" + virus + ".png"
            );
        };

        d3
            .select("#tooltipimg")
            .attr("src", mksrc(mtt.data));
    };
    
})();

this.mabReportData.funcStatus.push(true);
