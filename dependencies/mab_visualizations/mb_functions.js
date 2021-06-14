(() => {
    let mrFunc = this.mabReportFunc;
    let mrData = this.mabReportData;

    mrFunc.mbColRamp = function() {
        return(
            d3
                .scale.ordinal()
                .domain(mrData.mb.data.map(d => d.key))
                .range(mrFunc.palDes(mrData.mb.data.length))
        );
    };

    mrFunc.mbMabData = function() {
        let data = d3
            .nest()
            .key(d => d.mab_mix_label)
            .entries(mrData.aggData);

        // sort value array for each mab by order of virus member
        data.forEach(d => d.values.sort((a, b) => a.virus_name < b.virus_name ? -1 : 1));

        // sort dat by number of virus members
        data.sort((a, b) => a.values.length > b.values.length ? -1 : 1);
        
        // check every mab for length of unique set of viruses then check list members one by one
        data
            .forEach(a =>
                     a.set = data.map(b => {
                         if( a.values.length != b.values.length ) {
                             return(false);
                         } else {
                             return(a.values.every((_, i) => a.values[i].virus_name == b.values[i].virus_name));
                         }
                     })
                     .map(s => Number(s))
                     .reduce((a, c) => String(a) + String(c))
                    );

        
        // find discreet virus complete case groups
        let grps = Array.from(new Set(data.map(d => d.set)));

        // get group id for each record in data
        data.forEach((d, i) => d.groupId = grps.indexOf(d.set) + 1);
        
        return(data);

    };
    
    mrFunc.mbComData = function() {
        var dat = d3
            .nest()
            .key(d => d.mab_mix_label)
            .entries(mrData.aggData);

        var mab = [...new Set(mrData.aggData.map(d => d.mab_mix_label))].sort();
        var vir = [...new Set(mrData.aggData.map(d => d.virus_name   ))].sort();
        
        var vck = dat.map(d => 
                          vir.map(v => 
                                  d.values.map(r =>
                                               r.virus_name == v
                                              ).reduce((a, c) => a || c)
                                 ).reduce((a, c) => a && c)
                         );
        var out = [];
        vck.forEach((b,i) => { if(b){ out.push(dat[i]); } });
        return(out);
    };

    mrFunc.mbSetPercent = function(dnst) {
        dnst.forEach(d => {
            var sort =
                [...Array(d.values.length).keys()].sort((f, s) => {
                    if ( d.values[f].titer_curve_ic50 < d.values[s].titer_curve_ic50 ) {
                        return -1;
                    } else {
                        return 1;
                    }
                });
            d.values.map((d, i) => d.sort = sort[i]);
        });

        dnst.forEach(n => {
            var val = [];
            val.length = n.values.length;
            n.values.forEach((d, i) => val[i] = n.values[d.sort]);
            n.values = val;
        });

        dnst.forEach(n => {
            [...Array(n.values.length).keys()].forEach((d, i) => n.values[i].order = d);
        });
 
        dnst.forEach(d => {
            var mxor = Math.max(...d.values.map(d => d.order));
            d.values.map((d, i) => mxor == 0 ? d.percentage = -1 : d.percentage = d.order / mxor * 100);
        });
    };

    mrFunc.mbSortLines = function(dnst) {
        dnst.forEach(d => {
            d.geoMeanTiter50 = Math.pow(10, d3.mean(d.values.map(v => Math.log10(v.titer_curve_ic50))));                            
        });
        dnst.sort((f, s) => f.geoMeanTiter50 < s.geoMeanTiter50 ? -1 : 1 );    
    };

    mrFunc.mbInverseTxtScaling = function() {
        
        // inverse scaling for text
        let svgSize = d3
            .select("#mb_plot_area>svg")
            .node().getBoundingClientRect();
        
        let xst = mrData.mb.viewDim.width / svgSize.width;
        let yst = mrData.mb.viewDim.height / svgSize.height;

        d3
            .selectAll("#mb_plot_area>svg text")
            .attr("transform", "scale(" + xst + " " + yst + ")");

        d3
            .select("#mb_yxs_title>text")
            .attr("transform", "scale(" + yst + " " + xst + ")");

    };

    mrFunc.mbInverseDotScaling = function() {
        
        // inverse scaling for text
        let svgSize = d3
            .select("#mb_plot_area>svg")
            .node().getBoundingClientRect();
        
        let xst = mrData.mb.viewDim.width / svgSize.width;
        let yst = mrData.mb.viewDim.height / svgSize.height;

        d3
            .selectAll("#mb_plot_area>svg ellipse")
            .attr("rx", 5 * xst)
            .attr("ry", 5 * yst);

    };
    
    mrFunc.mbAppendPlot = function(group) {
        // let dim = d3.select("#mb_plot_area").node().getBoundingClientRect();
        mrData.mb.viewDim = {
            width: 600,
            height: 700,
            margins: [30, 70]
        };

        let dim = mrData.mb.viewDim;
        
        let w = dim.width;
        let h = dim.height;
        let m = dim.margins;
        
        let dat = mrData.mb.data;

        mrData.mb.scales = {}; 

        var plt = group
            .append("div")
            .attr("id", "mb_plot_area")
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", "0 0 " + dim.width + " " + dim.height)
            .attr("preserveAspectRatio", "none");

        var phd = plt
            .append("g")
            .attr("id", "mb_plot_head");

        var trng = {
            minmax: [
                Number(mrFunc.logAdjust(Math.min(...dat.map(d => Math.min(...d.values.map( d=> d.titer_curve_ic50)))), Math.floor)),
                Math.max(...dat.map(d => Math.max(...d.values.map( d=> d.titer_curve_ic50))))
            ]
        };

        trng.logrng = [
            Math.floor(Math.log10(trng.minmax[0])) + 1,
            Math.ceil(Math.log10(trng.minmax[1]))
        ];

        trng.logrng[0] < 0 && ( trng.minmax[0] = trng.minmax[0].toFixed(Math.abs(trng.logrng[0]) + 1) );
        
        trng.logval = [...Array(Math.abs(trng.logrng[0] - trng.logrng[1]))].map((_, i) => Math.pow(10, i + trng.logrng[0]));
        
        mrData.mb.scales.xsc = d3
            .scale.log()
            .domain(trng.minmax)
            .range([m[1], w-m[0]]);

        mrData.mb.scales.ysc = d3
            .scale.linear()
            .domain([0, 100])
            .range([h - m[1], m[0]]);
                
        mrData.mb.scales.col = mrFunc.mbColRamp();

        var col = mrData.mb.scales.col;
        var xsc = mrData.mb.scales.xsc;
        var ysc = mrData.mb.scales.ysc;

        var tvl = [trng.minmax[0], ...trng.logval, trng.minmax[1]];
        
        var xxs = d3
            .svg
            .axis()
            .scale(xsc)
            .orient("bottom")
            .ticks((trng.logval.length) * 5 + 2)
            .tickFormat(d3.format("~f"))
            .tickValues(tvl);

        var yxs = d3
            .svg
            .axis()
            .scale(ysc)
            .orient("left");
        
        var bod = plt
            .append("g")
            .attr("id", "mb_plot_body");
        
        var mbl = bod
            .append("g")
            .attr("id", "mb_lines");

        // grid lines
        var xgd = [trng.minmax[0], ...trng.logval, trng.minmax[1]];
        var ygd = [...Array(10)].map((_, i) => (i + 1) * 10);

        mbl
            .selectAll(".line")
            .data(xgd)
            .enter()
            .append("path")
            .attr("stroke", "#DDD")
            .attr("stroke-width", 1)
            .attr("d", d => {
                return d3
                    .svg
                    .line()
                    .x(d => d.x)
                    .y(d => d.y)
                ([
                    {x: xsc(d), y: h - m[1]},
                    {x: xsc(d), y: m[0]}
                ]);
            });

        mbl
            .selectAll(".line")
            .data(ygd)
            .enter()
            .append("path")
            .attr("stroke", "#DDD")
            .attr("stroke-width", 1)
            .attr("d", d => {
                return d3
                    .svg
                    .line()
                    .x(d => d.x)
                    .y(d => d.y)
                ([
                    {x: m[1]    , y: ysc(d)},
                    {x: w - m[0], y: ysc(d)}
                ]);
            });

        // axes
        bod
            .append("g")
            .attr("id","mbxxs")
            .attr("transform", "translate(" + 0 + ", " + (h - (m[1] - 10)) + ")")
            .call(xxs)
            .append("g")
            .attr("id", "mb_xxs_title")
            .append("text")
            .text("Magnitude (titer IC50 - μg/ml)")
            .attr("fill", "black")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "hanging");

        bod
            .append("g")
            .attr("id","mbyxs")
            .attr("transform", "translate(" + (m[1] -10 ) + ", " + 0 + ")")
            .call(yxs)
            .append("g")
            .attr("id", "mb_yxs_title")
            .append("text")
            .text("Breadth (% cummulative coverage)")
            .attr("fill", "black")
            .attr("text-anchor", "middle");

        // change v3 axes style
        ["#mbyxs>path", "#mbxxs>path"].forEach(c => d3.selectAll(c).style({'stroke': 'black', 'fill': 'none', 'stroke-width': '1px'}));
        d3.selectAll(".tick>line").style({'stroke':  'black', 'stroke-width': '1px'});

        // add initial instuction transparency
        bod
            .append("rect")
            .attr("class", "mb_instructions")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("fill", "white")
            .attr("x", "0%")
            .attr("y", "0%")
            .style("opacity", "60%");

        bod
            .append("text")
            .attr("class", "mb_instructions")
            .attr("x", mrData.mb.viewDim.margins[1] * 2)
            .attr("y", mrData.mb.viewDim.margins[0] * 2)
            .style("dominant-baseline", "middle")
            .style("text-anchor", "start")
            .text("Click virus group in legend to see plot")
            .attr("font-size", 16)
            .attr("font-family", "Georgia,serif");
            
        // translations using object sizes
        var xltrans = d3
            .select("#mbxxs")
            .node().getBBox();

        var yltrans = d3
            .select("#mbyxs")
            .node().getBBox();

        var plotHed = d3
            .select("#mb_plot_head")
            .node().getBBox();

        d3
            .select("#mb_xxs_title")
            .attr("transform", "translate(" + xltrans.width / 2 + ", " + (m[0]) + ")");
        
        d3
            .select("#mb_yxs_title")
            .attr("transform", "translate(" + (-m[0] - 10) + ", " + yltrans.height / 2 + ") rotate(-90)");

        d3
            .select("#mb_plot_head")
            .attr("transform", "translate(0 " + plotHed.height + ")");
        
        d3
            .select("#mb_plot_body")
            .attr("transform", "translate(0 " + plotHed.height + ")");

        d3
            .select("#mb_lines")
            .style("height", (h + plotHed.height) + "px")
            .select("svg")
            .attr("height", (h + plotHed.height) + "px");

        d3
            .selectAll("path")
            .attr("vector-effect", "non-scaling-stroke");

        d3
            .selectAll("line")
            .attr("vector-effect", "non-scaling-stroke");
        
    };

    mrFunc.mbAppendDropDown = function(group) {
        var dat = mrData.mb.data;
        var col = mrFunc.mbColRamp();
        
        var mab = group
            .append("div")
            .attr("class", "mb_dropdown_mabs")
            .append("svg");

        var mbd = mab
            .append("g")
            .attr("id", "mb_mab_dropdown_body")
            .attr("transform", "translate(0, 20)");

        var gid = Array.from(new Set(dat.map(d => Number(d.groupId)))).sort((a, b) => a - b);

        gid.forEach(g => {
            let gdat = dat.filter(f => f.groupId == g);

            let offset = mab.node().getBBox().height;
            let indent = 10;

            let legGroup = mbd.append("g").attr("id", "mb_mab_dropdown_group_" + g);
            
            legGroup
                .append("g")
                .attr("class", "mb_dropdown_group_heading")
                .on("click", () => mrFunc.mbGroupSelect(g))
                .append("text")
                .attr("x", 0)
                .attr("y", offset)
                .text("Group " + g);

            offset = mab.node().getBBox().height;
            
            legGroup
                .append("g")
                .attr("class", "mb_dropdown_patches")
                .selectAll(".element")
                .data(gdat)
                .enter()
                .append("g")
                .each(function(d, i) {

                    let g = d3.select(this);

                    g
                        .append("path")
                        .attr("stroke", d => col(d.key))
                        .attr("fill-opacity", 0)
                        .attr("stroke-width", 2)
                        .attr("d", () => {
                            return d3
                                .svg
                                .line()
                                .x(d => d.x)
                                .y(d => d.y)
                            ([
                                {x: 10 + indent, y: (15 * i) + offset},
                                {x: 20 + indent, y: (15 * i) + offset}
                            ]);
                        });

                    g
                        .append("text")
                        .attr("dominant-baseline", "middle")
                        .attr("id", d => "g" + d.groupId)
                        .attr("x", d => 20 + indent)
                        .attr("y", () => (15 * i) + offset)
                        .text(d => d.key);
                    
                    g
                        .on("click", function(e) { mrFunc.mbGroupSelect(e); });

                });
            
        });

        var mbs = d3
            .select(".mb_dropdown_mabs>svg")
            .node()
            .getBBox();
        
        mab
            .attr("height", mbs.height + 10)
            .attr("width", mbs.width);
        
    };

    mrFunc.mbAppendLegend = function(group) {
        var dat = mrData.mb.data;
        var datheight = dat.length * 15 + 10;
        
        var vir = group
            .append("div")
            .attr("class", "mb_legend mb_legend_virs")
            .append("svg");                

        var vbd = vir
            .append("g")
            .attr("id", "mb_vir_legend_body");

        var vrs = d3
            .select(".mb_legend.mb_legend_virs>svg")
            .node()
            .getBBox();

        vir
            .attr("height", vrs.height + 10)
            .attr("width", vrs.width);

        mrFunc.mbInverseTxtScaling();

    };

    mrFunc.mbGroupSelect = function(e){

        let inst = document.querySelectorAll(".mb_instructions");
        if(inst.length != 0){
            Array.from(inst).forEach(e => e.outerHTML = "");
        }

        let gid;
        typeof(e) == "number" ? (gid = e) : (gid = e.groupId);
        let dat = mrData.mb.data.filter(d => d.groupId == gid);

        mrData.mb.currentGroup = gid;

        let mbl = d3
            .select("#mb_lines");

        mbl
            .selectAll(".mbline")
            .remove();

        d3.selectAll(".mb_legend_mab_grp>svg>*").remove();

        let selBB = d3.select(".mb_dropdown_mabs>svg").node().getBBox();
        document.querySelector(".mb_head .mr_dropdown_content").style.display = "none";
        d3.select("#mb_plot .mr_select_label").text("Group " + gid);

        let virset = Array.from(new Set(dat[0].values.map(v => v.virus_name))).sort();
        
        if( dat[0].values.length <= 2 ){

            let bod = d3
                .select("#mb_plot_body")
                .append("g")
                .attr("id", "#mb_plot_content");
            
            bod
                .append("rect")
                .attr("class", "mb_instructions")
                .attr("width", "100%")
                .attr("height", "100%")
                .attr("fill", "white")
                .attr("x", "0%")
                .attr("y", "0%")
                .style("opacity", "60%");

            bod
                .append("g")
                .attr("class", "mb_inst_group")
                .attr("transform", "translate(80 50)")
                .append("text")
                .attr("class", "mb_instructions")
                .style("dominant-baseline", "middle")
                .style("text-anchor", "start")
                .text("MAbs not shown for groups with 2 viruses or less.")
                .attr("font-size", 16)
                .attr("font-family", "Georgia,serif");

            d3
                .select("#mb_vir_legend_head>text")
                .text("Viruses (n = " + virset.length + ")");

            d3
                .selectAll(".mbLegVirs")
                .remove();

            d3
                .select("#mb_vir_legend_body")
                .selectAll(".mbLegVirs")
                .data(virset)
                .enter()
                .append("text")
                .attr("class", "mbLegVirs")
                .attr("y", (_, i) => (i * 15) + "px")
                .text(d => d);
            
        } else {
                        
            mbl
                .selectAll(".mbline")
                .data(dat)
                .enter()
                .append("path")
                .attr("stroke", d => mrData.mb.scales.col(d.key))
                .attr("id", d => mrFunc.getNodeIdFormat(d.key))
                .attr("class", d => "mbline")
                .attr("fill-opacity", 0)
                .attr("stroke-width", 1.5)
                .attr("d", d => {
                    let vals = d.values;
                    let vlen = vals.length;
                    
                    vals = vals.map((_, i) => {
                        if(i < (vlen - 1)){
                            return(
                                [{x: vals[i].titer_curve_ic50, y: vals[i].percentage}, {x: vals[i].titer_curve_ic50, y: vals[i+1].percentage}]
                            );
                        } else {
                            return(
                                [{x: vals[i].titer_curve_ic50, y: vals[i].percentage}]
                            );
                        }
                    }).reduce((a, c) => [...a, ...c]);
                    
                    return d3
                        .svg
                        .line()
                        .x(d => mrData.mb.scales.xsc(d.x))
                        .y(d => mrData.mb.scales.ysc(d.y))
                    (vals);
                });

            d3
                .select("#mb_vir_legend_head>text")
                .text("Viruses (n = " + virset.length + ")");

            d3
                .selectAll(".mbLegVirs")
                .remove();

            d3
                .select("#mb_vir_legend_body")
                .selectAll(".mbLegVirs")
                .data(virset)
                .enter()
                .append("text")
                .attr("class", "mbLegVirs")
                .attr("y", (_, i) => (i * 15) + "px")
                .text(d => d)
                .on("mouseenter", function(e) { mrFunc.virNameMouseEnter(e); } )
                .on("mouseleave", function(e) { mrFunc.virNameMouseLeave(e); } );
            
        };

        let vir = d3.select(".mb_legend.mb_legend_virs>svg");
        let vbb = vir.node().getBBox();
        vir.attr("height", vbb.height + 10);
        vir.attr("width", vbb.width);
        
        let mabGroup = d3.select("#mb_mab_dropdown_group_" + gid + ">.mb_dropdown_patches").node().cloneNode(true);
        mabGroup = document.querySelector(".mb_legend_mab_grp>svg").appendChild(mabGroup);
  
        let yTrans = mabGroup.querySelector("text").getAttribute("y");
        d3.select(".mb_legend_mab_grp>svg>g").attr("transform", "translate(-10, -" + (yTrans - 10) + ")");

        let mgl = d3.select(".mb_legend_mab_grp>svg");
        let mglbb = mgl.node().getBBox();
        mgl.attr("height", mglbb.height + mglbb.y);
        mgl.attr("width",  mglbb.width  + mglbb.x);

        d3
            .selectAll(".mb_legend_mab_grp .mb_dropdown_patches>g")
            .on("mouseenter", function(_, i) { mrFunc.mabNameMouseEnter(_, i); })
            .on("mouseleave", function(_, i) { mrFunc.mabNameMouseLeave(_, i); });

        let virBB = d3.select(".mb_legend.mb_legend_virs>svg").node().getBBox();

        d3.select(".mb_head .mr_select_container").style("width",  Math.max(virBB.width + virBB.x + 10, selBB.width + selBB.x + 40) + "px");
        d3.select(".mb_head .mr_dropdown").style("width",  Math.max(virBB.width + virBB.x + 10, selBB.width + selBB.x + 40) + "px");
        
        d3
            .selectAll("path")
            .attr("vector-effect", "non-scaling-stroke");

        d3
            .selectAll("line")
            .attr("vector-effect", "non-scaling-stroke");

        mrFunc.mbInverseTxtScaling();

    };

    mrFunc.mabNameMouseEnter = function(_, i){
        let key = d3.select(".mb_legend_mab_grp .mb_dropdown_patches>g:nth-child(" + (i + 1) + ")>text").node().innerHTML;
        let popNode = d3.selectAll(".mbline")[0].filter(m => m.__data__.key == key);
        let gryNode = d3.selectAll(".mbline")[0].filter(m => m.__data__.key != key);
        
        gryNode.forEach(g => g.setAttribute("stroke", "#AAAAAA"));
        popNode.forEach(p => p.setAttribute("stroke-width", "3"));

        d3
            .selectAll(".mbline")
            .sort(d => d.key == key ? 1 : -1);

    };

    mrFunc.mabNameMouseLeave = function(_, i){
        d3
            .selectAll(".mbline")
            .attr("stroke", d => mrData.mb.scales.col(d.key))
            .attr("stroke-width", 1.5);
        
    };

    mrFunc.virNameMouseEnter = function(e){
        let virDat = mrData.mb.data.filter(f => f.groupId == mrData.mb.currentGroup);
        virDat = virDat.map(d => d.values.filter(f => f.virus_name == e)).reduce((a, c) => [...a, ...c]);

        let xsc = mrData.mb.scales.xsc; 
        let ysc = mrData.mb.scales.ysc; 
        let col = mrData.mb.scales.col; 
                
        d3
            .select("#mb_lines")
            .selectAll("#mb_virus_points")
            .data(virDat)
            .enter()
            .append("ellipse")
            .attr("id", "mb_virus_points")
            .attr("cx",   d => xsc(d.titer_curve_ic50))
            .attr("cy",   d => ysc(d.percentage))
            .attr("rx", "5px")
            .attr("ry", "5px")
            .attr("fill", d => {
                let colDark = d3.rgb(col(d.mab_mix_label));
                Object.keys(colDark).forEach(k => colDark[k] = Math.round(colDark[k] * 0.8));
                return(colDark.toString());
            });

        mrFunc.mbInverseDotScaling();
        
    };

    mrFunc.virNameMouseLeave = function(e){
        d3
            .selectAll("#mb_virus_points")
            .remove();
    };
    
})();
this.mabReportData.funcStatus.push(true);
