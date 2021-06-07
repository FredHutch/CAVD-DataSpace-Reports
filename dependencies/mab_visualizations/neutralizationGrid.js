(() => {
    let limit = 2000;    
    if(this.mabReportData.hm.dataLong.length > limit){

        let ncg = document.querySelector(".mabreportconts #mab_neutgrd");
        let cap = document.createElement("div");
        cap.classList.add("mab-neut-grid-cap-screen");
        cap.innerHTML = `Neutralization grid is not shown for selections with more than ${limit.toLocaleString()} mAb-virus combinations`;
        ncg.appendChild(cap);

    } else {

        let ncg = document.querySelector(".mabreportconts #mab_neutgrd");
        ncg.innerHTML = `
<div id="mab-neut-grid">
  <table>
  <tbody id="mab-neut-grid-table">
  <tr id="mab-neut-grid-header1">
  <th rowspan="2" colspan="2" id="legend-cell" style="width: 260px;">
  <img src="${this.mabReportData.reportFiles}/dependencies/mab_visualizations/images/ncg_scale.png"  style="right: 5px">
  <img src="${this.mabReportData.reportFiles}/dependencies/mab_visualizations/images/ncg_legend.png" style="right: 140px;">
  </th>
  </tr>
  <tr id="mab-neut-grid-header2"></tr>
  </tbody>
  </table>
</div>
`;
        
        const mabs = this.mabReportData.rawMabData.rawSorts.all[0].mabsrt;
        const viruses = this.mabReportData.rawMabData.rawSorts.all[0].virsrt;
        const virMap = this.mabReportData.rawMabData.idMaps.virus;
        const mabMap = this.mabReportData.rawMabData.idMaps.mab;
        const table = document.getElementById("mab-neut-grid-table");
        const thead1 = document.getElementById("mab-neut-grid-header1");
        const thead2 = document.getElementById("mab-neut-grid-header2");
        const webdav = this.mabReportData.webdav;
        
        const createImgTag = (virus, mab) => {
            //let path = "neutralizationCurves/"
            let path = "../../_webdav/CAVD/@files/neutralizationCurves/rainbow";
            if (virus === undefined) path = path + "/" + mabMap[mab] + "/all_viruses.png";
            if (mab === undefined) path = path + "/viruses/" + virMap[virus] + ".png";
            if (!(mab === undefined || virus === undefined)) path = path + "/" + mabMap[mab] + "/" + virMap[virus] + ".png";
            const img = document.createElement("img");
            img.src = path;
            img.loading = "lazy";
            return(img);
        };
        
        const createImgCell = (virus, mab) => {
            const img = createImgTag(virus, mab);
            const td = document.createElement("td");
            td.appendChild(img);
            return(td);
        };
        
        const mabIndex = {};

        mabs.forEach((mab, i) => {
            mabIndex[mab] = i;

            // name of mab
            const titleCell = document.createElement("td");
            titleCell.style.zIndex = 100000 - i;
            const titleDiv = document.createElement("div");
            titleDiv.innerHTML = mab;
            titleCell.appendChild(titleDiv);
            thead1.appendChild(titleCell);

            // mab vs all viruses
            thead2.appendChild(createImgCell(undefined,mab));

        });
        
        const virusIndex = {};
        
        viruses.forEach((virus, i) => {
            virusIndex[virus] = i;

            const row = document.createElement("tr");
            row.classList.add("mab-neut-grid-row");

            // name of virus
            const titleCell = document.createElement("td");
            titleCell.className = "mab-neut-grid-virus-header1";
            titleCell.innerHTML = virus;
            row.appendChild(titleCell);
            table.appendChild(row);

            // virus vs all mabs
            const headerPlotCell = createImgCell(virus, undefined);
            headerPlotCell.className = "mab-neut-grid-virus-header2";
            row.appendChild(headerPlotCell);

            // virus vs each mab
            // just append cells for now... add tags later
            mabs.forEach(mab => {
                const td = document.createElement("td");
                td.classList.add("table-img");
                const div = document.createElement("div");
                div.classList.add("table-img-empty");
                td.appendChild(div);
                row.appendChild(td);
            });
        });

        this.mabReportData.hm.dataLong.forEach(x => {
            const td = document.querySelector(
                `#mab-neut-grid-table>tr:nth-child(${virusIndex[x.virus_name]+3})>:nth-child(${mabIndex[x.mab_mix_label]+3})`
            );
            td.removeChild(td.childNodes[0]);
            td.appendChild(createImgTag(x.virus_name, x.mab_mix_label));
        });
        
        // // Set position of header2 cells
        // let vh1_width = document.querySelector(".mab-neut-grid-virus-header1").clientWidth;
        // document.querySelectorAll(".mab-neut-grid-virus-header2").forEach(x => x.style.left=Math.max(vh1_width, 175) + "px");
        // console.log("in setInterval" + vh1_width);
        
    };    
})();
