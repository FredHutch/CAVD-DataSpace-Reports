
(() => {
    let mrFunc = this.mabReportFunc;
    let mrData = this.mabReportData;

    d3
        .select(".mabreportcont#mab_heatmap")
        .append("div")
        .attr("id", "hm_report");

    let header = d3
        .select("#hm_report")
        .append("div")
        .attr("class", "hm_header");

    let menu = d3
        .select("#hm_report")
        .append("div")
        .attr("class", "hm_menu");

    let legend = d3
        .select("#hm_report")
        .append("div")
        .attr("class", "hm_legend");
    
    let plot = d3
        .select("#hm_report")
        .append("div")
        .attr("class", "hm_plot_cell"); 

    [
        "hm_plot_mab_group",
        "hm_plot_vir_names",
        "hm_plot_mab_names",
        "hm_plot_vir_group",
        "hm_plot_area"
    ].forEach(
        c => plot
            .append("div")
            .attr("class", c)
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
    );
    
    menu
        .call(mrFunc.hmAppendMenu);

    plot
        .call(mrFunc.hmAppendPlot);

    legend
        .call(mrFunc.hmAppendLegend);

    d3
        .select("h1#mab_heatmap")
        .on("click", () =>
            {
                mrFunc.hmUpdatePlot();
            });
    
    mrFunc.hmAppendTooltip();

})();
this.mabReportData.plotStatus.push(true);
