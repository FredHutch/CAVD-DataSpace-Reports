(() => {

    let mrFunc = this.mabReportFunc;
    let mrData = this.mabReportData;
    
    let group = d3
        .select("#mab_neutcrv.mabreportcont")
        .append("div")
        .attr("id", "nc_plots")
        .attr("class", "nc_plots")
        .append("div")
        .attr("class", "nc_container");

    let ncHead = group
        .append("div")
        .attr("class","nc_head");

    ncHead
        .append("div")
        .attr("class", "mr_select_head")
        .text("Select a mAb");
    
    let ncSel = ncHead
        .append("div")
        .attr("class", "mr_select_container")
        .on("click", function(){
            let dd = d3.select("#nc_plots .mr_dropdown_content");
            dd.node().style.display == "block" ? dd.style("display", "none") : dd.style("display", "block");
        });

    ncSel
        .append("div")
        .attr("class", "mr_select_label")
        .text(this.mabReportData.nc.mabs[0]);

    ncSel
        .append("div")
        .attr("class", "mr_select_icon");

    ncSel
        .append("div")
        .style("clear", "both");
    
    ncHead
        .append("div")
        .attr("class", "mr_dropdown field-display")
        .append("div")
        .attr("class", "mr_dropdown_content nc_dropdown")
        .selectAll(".mr_dropdown_content_text")
        .data(this.mabReportData.nc.mabs)
        .enter()
        .append("div")
        .attr("class", "mr_dropdown_content_text")
        .text(d => d)
        .on("click", function(d){

            d3
                .select("#nc_plots .mr_select_label")
                .text(d);
            
            d3
                .select("#nc_plots .mr_dropdown_content")
                .style("display", "none");

            group.select(".nc_plot").remove();
            group.select(".nc_legend").remove();
            group.select(".nc_table").remove();
            
            mrFunc.ncAppendAll(group, d);
            
        });

    group
        .append("div")
        .attr("class", "nc_legend_head")
        .append("p")
        .text("Viruses")
        .attr("font-size", 12)
        .attr("font-family", "Georgia,serif")
        .attr("font-weight", "bold");

    
    let dds = d3.select(".nc_head .mr_select_container");

    let maxVirNameSize = Math.max(...Array.from(new Set(this.mabReportData.nc.data.map(m => m.virus_name))).map(v => v.length * 8 + 30));
    let maxMabNameSize = Math.max(...this.mabReportData.nc.mabs.map(s => s.length * 8 + 30));
    
    dds.style("width", Math.max(maxVirNameSize, maxMabNameSize) +  "px");
    // ddc.style("display", "none"); 
    
    document.querySelector(".mr_dropdown_content .mr_dropdown_content_text").click();

    window.addEventListener('resize', function() {
        if(Array.from(document.querySelector("#mab_neutcrv").classList).includes("active")){  
            clearTimeout(mrData.nc.resizeId);
            mrData.nc.resizeId = setTimeout(function() {
                mrFunc.ncInverseTxtScaling();
                mrFunc.ncInverseDotScaling();
            }, 500);
        };
    });

    d3
        .select("h1#mab_neutcrv")
        .on("click", () =>
            {
                mrFunc.ncInverseTxtScaling();
            });
    
})();
this.mabReportData.plotStatus.push(true);
