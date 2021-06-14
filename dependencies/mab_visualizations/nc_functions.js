(() => {
    let mrFunc = this.mabReportFunc;
    let mrData = this.mabReportData;
    let lwd = 1.5;
    let swd = 6;

    mrFunc.ncDataSort = function(dat){
        dat.sort((a, b) => {
            return(
                a.titer_curve_ic50 < b.titer_curve_ic50 ? -1 :
                    a.titer_curve_ic50 == -Infinity && b.titer_curve_ic50 == -Infinity && a.mean_curve > b.mean_curve ? -1 :
                    a.titer_curve_ic50 ==  Infinity && b.titer_curve_ic50 ==  Infinity && a.mean_curve > b.mean_curve ? -1 :
                    1
            );
        });
    };
    
    mrFunc.ncColRamp = function(dat) {
        let univir = Array.from(new Set(dat.map(d => d.virus_name)));
        return(
            d3
                .scale.ordinal()
                .domain(univir)
                .range(mrFunc.palDes(univir.length))
        );
    };

    mrFunc.ncLineType = function(dat){
        let unitype = Array.from(new Set(dat.map(d => d.target_cell))).sort((a, b) => a == "TZM-bl" ? -1 : 1);
        return(
            d3
                .scale.ordinal()
                .domain(unitype)
                .range([...Array(unitype.length)].map((_, i) => (2 + i) + " " + i))
        );
    };
    
    mrFunc.getNodeIdFormat = function(mab){
        return(
            "M" + mab.replace("+", "_").replace(/\W/g, "")
        );
    };

    mrFunc.ncInverseTxtScaling = function() {
        
        // inverse scaling for text
        let svgSize = document.querySelector(".nc_container>.nc_plot").getBoundingClientRect();
        let xst = mrData.nc.viewDim.width / svgSize.width;
        let yst = mrData.nc.viewDim.height / svgSize.height;

        d3
            .selectAll(".nc_plot text")
            .attr("transform", "scale(" + xst + " " + yst + ")");

        d3
            .selectAll(".nc_yxs_title>text")
            .attr("transform", "scale(" + yst + " " + xst + ")");

    };

    mrFunc.ncInverseDotScaling = function() {
        
        // inverse scaling for text
        let svgSize = document.querySelector(".nc_container>.nc_plot>svg").getBoundingClientRect();
        let xst = mrData.nc.viewDim.width / svgSize.width;
        let yst = mrData.nc.viewDim.height / svgSize.height;

        d3
            .selectAll(".nc_plot ellipse")
            .attr("rx", 5 * xst)
            .attr("ry", 5 * yst);

    };
    
    mrFunc.ncAppendPlot = function(group, mab) {

        mrData.nc.viewDim = {
            height: 350,
            width: 600,
            margins: [30, 60]
        };

        let dim = mrData.nc.viewDim;
        
        var h = dim.height,
            w = dim.width,
            m = dim.margins;
        
        var dat = mrData.nc.data.filter(d => d.mab_mix_label == mab);
        var mabid = mrFunc.getNodeIdFormat(mab);

        mrFunc.ncDataSort(dat);

        var trng = {
            mm: [
                Math.min(...mrData.curveSrc.map(d => d.min_concentration)),
                Math.max(...mrData.curveSrc.map(d => d.max_concentration))
            ]};

        
        trng.lr = [
            Math.floor(Math.log10(trng.mm[0])) + 1,
            Math.ceil(Math.log10(trng.mm[1]))
        ];

        trng.lv = [...Array(Math.abs(trng.lr[0] - trng.lr[1]))].map((_, i) => {
            if(trng.lr[0] < 0){
                return(Math.pow(10, i + trng.lr[0]).toFixed(Math.abs(i + trng.lr[0])));
            } else {
                return(Math.pow(10, i + trng.lr[0]));
            };
        });
        
        mrFunc.ncXsc = d3
            .scale.log()
            .domain(trng.mm)
            .range([m[1], w-m[0]]);

        mrFunc.ncYsc = d3
            .scale.linear()
            .domain([
                Math.min(0,   Math.min(...mrData.nc.data.map(d => Math.min(...d.curve.map(c => c.y))))),
                Math.max(100, Math.max(...mrData.nc.data.map(d => Math.max(...d.curve.map(c => c.y)))))
            ])
            .range([h - m[1], m[0]]);
        
        var plt = group
            .append("div")
            .attr("class", "nc_plot " + mabid)
            .append("svg")
            .attr("viewBox", "0 0 " + dim.width + " " + dim.height)
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("preserveAspectRatio", "none");

        plt
            .append("rect")
            .attr("fill", "white")
            .attr("width", "100%")
            .attr("height", "100%");
        
        // plt
        //     .append("g")
        //     .attr("class", "nc_plot_head " + mabid)
        //     .append("text")
        //     .text(mab)
        //     .attr("font-size", 22)
        //     .attr("font-family", "Georgia,serif");
        
        var col = mrFunc.ncColRamp(dat);
        var typ = mrFunc.ncLineType(dat);
                
        var xxs = d3
            .svg
            .axis()
            .scale(mrFunc.ncXsc)
            .orient("bottom")
            .ticks((trng.lv.length) * 5 + 2)
            .tickFormat(d3.format("~f"))
            .tickValues([trng.mm[0], ...trng.lv, trng.mm[1]]);

        var yxs = d3
            .svg
            .axis()
            .scale(mrFunc.ncYsc)
            .orient("left");
        
        var bod = plt
            .append("g")
            .attr("class", "nc_plot_body " + mabid);
        
        var nca = bod
            .append("g")
            .attr("class", "nc_plot_area " + mabid);

        // grid lines
        var xgd = [...new Set(mrData.aggData.map(d => Math.pow(10, Math.round(Math.log10(d.titer_curve_ic50)))))].sort();
        var ygd = [...Array(Math.abs((Math.ceil(mrFunc.ncYsc.domain()[0] / 10)) - (Math.ceil(mrFunc.ncYsc.domain()[1] / 10))))].map((_, i) => {
                return( (Math.ceil(mrFunc.ncYsc.domain()[0] / 10) + i) * 10 );
        });

        nca
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
                    {x: mrFunc.ncXsc(d), y: h - m[1]},
                    {x: mrFunc.ncXsc(d), y: m[0]}
                ]);
            });

        nca
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
                    {x: m[1]    , y: mrFunc.ncYsc(d)},
                    {x: w - m[0], y: mrFunc.ncYsc(d)}
                ]);
            });

        // nc curves
        nca
            .selectAll(".nc_line")
            .data(dat)
            .enter()
            .append("path")
            .attr("stroke", d => col(d.virus_name))
            .attr("id", d => d.key)
            .attr("class", d => "nc_line " + mabid)
            .attr("fill-opacity", 0)
            .attr("stroke-width", lwd)
            .attr("stroke-dasharray", d => typ(d.target_cell))
            .attr("d", d => {
                return d3
                    .svg
                    .line()
                    .x(d => mrFunc.ncXsc(d.x))
                    .y(d => mrFunc.ncYsc(d.y))
                (d.curve);
            })
            .attr("pointer-events", "visibleStroke")
            .on("mouseenter", function(e) { mrFunc.ncLineFadeOut(e, col); })
            .on("mouseleave", function(e) { mrFunc.ncLineFadeIn(e, col);  });

        // axes
        bod
            .append("g")
            .attr("class","ncxxs " + mabid)
            .attr("transform", "translate(" + 0 + ", " + (h - (m[1] - 10)) + ")")
            .call(xxs)
            .append("g")
            .attr("class", "nc_xxs_title " + mabid)
            .append("text")
            .text("Concentration (μg/ml)")
            .attr("fill", "black")
            .attr("text-anchor", "middle");

        bod
            .append("g")
            .attr("class","ncyxs " + mabid)
            .attr("transform", "translate(" + ( m[1] -10 ) + ", " + 0 + ")")
            .call(yxs)
            .append("g")
            .attr("class", "nc_yxs_title " + mabid)
            .append("text")
            .text("Percent Neutralization")
            .attr("fill", "black")
            .attr("text-anchor", "middle");

        [".ncyxs>path", ".ncxxs>path"].forEach(c => d3.selectAll(c).style({'stroke': 'black', 'fill': 'none', 'stroke-width': '1px'}));
        d3.selectAll(".tick>line").style({'stroke':  'black', 'stroke-width': '1px'});
        
        // translations using object sizes
        let xltrans = d3
            .select(".ncxxs." + mabid)
            .node().getBBox();

        let yltrans = d3
            .select(".ncyxs." + mabid)
            .node().getBBox();

        // let ph = d3
        //     .select(".nc_plot_head." + mabid)
        //     .node().getBBox();
        
        d3
            .select(".nc_xxs_title." + mabid)
            .attr("transform", "translate(" + xltrans.width / 2 + ", " + 30 + ")");
        
        d3
            .select(".nc_yxs_title." + mabid)
            .attr("transform", "translate(" + -30 + ", " + yltrans.height / 2 + ") rotate(-90)");

        d3
            .selectAll("path")
            .attr("vector-effect", "non-scaling-stroke");

        d3
            .selectAll("line")
            .attr("vector-effect", "non-scaling-stroke");

        // d3
        //     .select(".nc_plot_head." + mabid)
        //     .attr("transform", "translate(0 " + ph.height + ")");
        
        // d3
        //     .select(".nc_plot_body." + mabid)
        //     .attr("transform", "translate(0 " + ph.height + ")");
        
    };

    mrFunc.ncAppendLegend = function(group, mab) {
        var dat = mrData.nc.data.filter(d => d.mab_mix_label == mab);
        mrFunc.ncDataSort(dat);

        var col = mrFunc.ncColRamp(dat);
        var typ = mrFunc.ncLineType(dat);
        
        var tdat = Array.from(new Set(dat.map(d => d.target_cell))).sort((a, b) => a == "TZM-bl" ? -1 : 1);        
        var vdat = dat.map(d => d.mab_mix_label + "$$$" + d.virus_name);
        vdat = Array.from(new Set(vdat)).map(a => {
            a = a.split("$$$");
            return(
                Object.assign({mab_mix_label: a[0], virus_name: a[1]})
            );
        });;  

        var dataheight = dat.length * 15 + 10;
        var mabid = mrFunc.getNodeIdFormat(mab);
                
        var leg = group
            .append("div")
            .attr("class", "nc_legend " + mabid)
            .append("svg")
            .attr("width", 200)
            .attr("height", dataheight);

        var vbod = leg
            .append("g")
            .attr("class", "nc_legend_item virus_body " + mabid);

        var vpat = vbod
            .append("g")
            .attr("class", "nc_legend_item virus_patches_g " + mabid)
            .selectAll(".nc_legend_item virus_patch")
            .data(vdat)
            .enter()
            .append("path")
            .attr("class", "nc_legend_item virus_patch " + mabid)
            .attr("stroke", d => col(d.virus_name))
            .attr("fill-opacity", 0)
            .attr("stroke-width", 2)
            .attr("d", (_, i) => {
                return d3
                    .svg
                    .line()
                    .x(d => d.x)
                    .y(d => d.y)
                ([
                    {x: 10, y: (15 * i) + 9},
                    {x: 20, y: (15 * i) + 9}
                ]);
            })
            .on("mouseenter", function(e) { mrFunc.ncLineFadeOut(e, col); })
            .on("mouseleave", function(e) { mrFunc.ncLineFadeIn(e, col);  });

        var vtxt = vbod
            .append("g")
            .attr("class", "nc_legend_item virus_patch_text_g " + mabid)
            .selectAll(".nc_legend_item virus_text")
            .data(vdat)
            .enter()
            .append("text")
            .attr("class", "nc_legend_item virus_text " + mabid)
            .attr("x", d => 20)
            .attr("y", (_, i) => (15 * i) + 15)
            .text(d => d.virus_name)
            .on("mouseenter", function(e) { mrFunc.ncLineFadeOut(e, col); })
            .on("mouseleave", function(e) { mrFunc.ncLineFadeIn(e, col);  });
        
        let lw =
            d3.select(".nc_legend_item.virus_patch_text_g." + mabid).node().getBBox().width
            +
            d3.select(".nc_legend_item.virus_patches_g." + mabid).node().getBBox().width + 10;

        let pw = d3
            .select(".nc_plot." + mabid + ">svg")
            .node().getBBox().width;
        
        let vb = d3
            .select(".nc_legend_item.virus_body." + mabid)
            .node().getBBox().height;
        
        d3
            .select(".nc_legend." + mabid + ">svg")
            .attr("width", lw + "px")
            .attr("height", (vb + 20) + "px");

        mrFunc.ncInverseTxtScaling();
    };

    mrFunc.ncAppendTable = function(group, mab){
        var dat = mrData.nc.data.filter(d => d.mab_mix_label == mab);
        var mabid = mrFunc.getNodeIdFormat(mab);

        mrFunc.ncDataSort(dat);
        
        dat.forEach(d => {

            [
                "titer_curve_ic50",
                "titer_curve_ic80",
                "titer_point_ic50",
                "titer_point_ic80",
                "fit_slope"
            ].forEach(
                t =>
                    d[t] = d[t] == Infinity || d[t] == -Infinity ?
                    String(d[t]) :
                    String(mrFunc.logAdjust(d[t], Math.round))
            );

            d.prot_url = '<a href="app.view?#learn/learn/Study/' + d.prot + '">' + d.prot.replace(/cvd/, "CAVD ").replace("/vtn/", "HVTN ") + '</a>';
            d.mab_mix_table = d.mab_mix_label.split("||").map(m => '<a href="app.view?#learn/learn/MAb/' + encodeURI(m) + '">' + m + '</a>').reduce((a, c) => a + "<br>" + c);

        });
        
        let cols = [
            ["prot_url",          "Study"       ],
            ["mab_mix_table",     "MAb name"    ],
            ["virus_name",        "Virus"       ],
            ["titer_curve_ic50",  "IC50 (curve)"],
            ["titer_curve_ic80",  "IC80 (curve)"],
            ["titer_point_ic50",  "IC50 (point)"],
            ["titer_point_ic80",  "IC80 (point)"],
            ["min_concentration", "Min conc."   ],
            ["max_concentration", "Max conc."   ],
            ["fit_error",         "Fit error"   ],
            ["fit_slope",         "Fit slope"   ]
        ];
        
        dat = dat.map(d => cols.map(k => d[k[0]]));
                
        let tab = group
            .append("div")
            .attr("class", "nc_table " + mabid)
            .append("table");

        tab
            .append("thead")
            .append("tr")
            .selectAll("th")
            .data(cols)
            .enter()
            .append("th")
            .text(d => d[1]);

        tab
            .append("tbody")
            .selectAll("tr")
            .data(dat)
            .enter()
            .append("tr")
            .selectAll("td")
            .data(d => d)
            .enter()
            .append("td")
            .html(d => d);
    };

    mrFunc.ncLineFadeOut = function(e, col){
        let mi = mrFunc.getNodeIdFormat(e.mab_mix_label);

        d3
            .selectAll(".nc_line." + mi)
            .attr("stroke", "#DDD")
            .filter(d => d.virus_name == e.virus_name)
            .attr("stroke", d => col(d.virus_name))
            .attr("stroke-width", swd);

        d3
            .selectAll(".nc_legend_item.virus_text." + mi)
            .attr("fill", "#999")
            .filter(d => d.virus_name == e.virus_name)
            .attr("fill", "black");

        d3
            .selectAll(".nc_legend_item.virus_patches." + mi)
            .attr("stroke", "#999")
            .filter(d => d.virus_name == e.virus_name)
            .attr("stroke", d => col(d.virus_name));
        
        d3
            .selectAll(".nc_point")
            .remove();

        d3
            .selectAll(".nc_line." + mi)
            .sort(d => d.virus_name == e.virus_name ? 1 : -1);

        let cnc = mrData.nc.data.filter(d => d.mab_mix_label == e.mab_mix_label && d.virus_name == e.virus_name).map(d => d.conc_values).reduce((a, c) => [...a, ...c]);
        
        let colDark = d3.rgb(col(e.virus_name));
        Object.keys(colDark).forEach(k => colDark[k] = Math.round(colDark[k] * 0.8));

        d3
            .select(".nc_plot_area." + mi)
            .selectAll(".nc_point")
            .data(cnc)
            .enter()
            .append("ellipse")
            .attr("class", "nc_point")
            .attr("cx", d => mrFunc.ncXsc(d.mab_concentration))
            .attr("cy", d => mrFunc.ncYsc(d.percent_neutralization))
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("fill", colDark.toString());

        Object.keys(colDark).forEach(k => colDark[k] = Math.round(colDark[k] * 0.8));
        
        d3
            .select(".nc_plot_area." + mi)
            .selectAll(".nc_error")
            .data(cnc)
            .enter()
            .append("line")
            .attr("class", "nc_error")
            .attr("x1", d => mrFunc.ncXsc(d.mab_concentration))
            .attr("x2", d => mrFunc.ncXsc(d.mab_concentration))
            .attr("y1", d => mrFunc.ncYsc(d.percent_neutralization - (d.neutralization_plus_minus * 100)))
            .attr("y2", d => mrFunc.ncYsc(d.percent_neutralization + (d.neutralization_plus_minus * 100)))
            .attr("stroke-width", "2px")
            .attr("stroke", colDark.toString());

        mrFunc.ncInverseDotScaling();

    }; 
    
    mrFunc.ncLineFadeIn  = function(e, col){
        let mi = mrFunc.getNodeIdFormat(e.mab_mix_label);
        
        d3
            .selectAll(".nc_point")
            .remove();

        d3
            .selectAll(".nc_error")
            .remove();
        
        d3
            .selectAll(".nc_line." + mi)
            .attr("stroke", d => col(d.virus_name))
            .attr("stroke-width", lwd);
        
        d3
            .selectAll(".nc_legend_item.virus_text." + mi)
            .attr("fill", "black");

        d3
            .selectAll(".nc_legend_item.virus_patches." + mi)
            .attr("stroke", d => col(d.virus_name));
    };

    mrFunc.ncAppendAll = function (group, m){        
        group
            .call(mrFunc.ncAppendPlot, m)
            .call(mrFunc.ncAppendLegend, m)
            .call(mrFunc.ncAppendTable, m);
    };
    
})();

this.mabReportData.funcStatus.push(true);

