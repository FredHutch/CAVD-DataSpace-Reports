(() => {
    
    let group = d3
        .select("#mab_mbcurve.mabreportcont")
        .append("div")
        .attr("id", "mb_plot");

    let mbg = group
        .append("div")
        .attr("class", "mb_container")
        .append("div")
        .attr("id", "mb_plot_grid");

    let mbHead = mbg
        .append("div")
        .attr("class", "mb_head");

    mbHead
        .append("div")
        .attr("class", "mr_select_head")
        .text("Select a mAb group");
    
    let mbSel = mbHead
        .append("div")
        .attr("class", "mr_select_container")
        .on("click", function(){
            if(document.querySelector("#mb_plot .mr_dropdown_content").style.display == "block"){

                d3
                    .select("#mb_plot .mr_dropdown_content")
                    .style("display", "none");
                
            } else {

                d3
                    .select("#mb_plot .mr_dropdown_content")
                    .style("display", "block");
            };
        });

    mbSel
        .append("div")
        .attr("class", "mr_select_label");

    mbSel
        .append("div")
        .attr("class", "mr_select_icon");

    mbSel
        .append("div")
        .style("clear", "both");

    mbHead
        .append("div")
        .attr("class", "mr_dropdown field-display")
        .append("div")
        .attr("class", "mr_dropdown_content mb_dropdown")
        .call(this.mabReportFunc.mbAppendDropDown);
    
    d3.select("#mb_plot_grid")
        .append("div")
        .attr("class", "mb_legend_mab_grp")
        .append("svg");

    d3.select("#mb_plot_grid")
        .append("div")
        .attr("class", "mb_legend_vir_head")
        .text("Viruses");

    mbg
        .call(this.mabReportFunc.mbAppendPlot)
        .call(this.mabReportFunc.mbAppendLegend);

    let selBB = d3.select(".mb_dropdown_mabs>svg").node().getBBox();
    d3.select(".mb_head .mr_select_container").style("width",  (selBB.width + selBB.x + 40));

    d3.select("#mb_mab_dropdown_group_1 > g:nth-child(1)").node().dispatchEvent(new Event('click'));
    
    window.addEventListener('resize', function() {
        if(Array.from(document.querySelector("#mab_mbcurve").classList).includes("active")){
            clearTimeout(this.mabReportData.mb.resizeId);
            this.mabReportData.mb.resizeId = setTimeout(function() {
                this.mabReportFunc.mbInverseTxtScaling();
                this.mabReportFunc.mbInverseDotScaling();
            }, 500);
        };
    });
    
    d3
        .select("h1#mab_mbcurve")
        .on("click", () =>
            {
                this.mabReportFunc.mbInverseTxtScaling();
            });
    
})();
this.mabReportData.plotStatus.push(true);
