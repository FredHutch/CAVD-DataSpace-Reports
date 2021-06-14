(() => {
    let mrd = this.mabReportData;
    let mrf = this.mabReportFunc;

    // data processing functions
    mrf.mergeTable =  function(data1, data2, field) {
        return(data1.map(x => Object.assign(x, data2.find(y => y[field] === x[field]))));
    };

    mrf.buildObjs = function(data, cols){
        return (
            data[0].map((_, i) => {
                let d = cols.map((_, j) => {
                    return data[j][i];
                });
                let obj = cols.reduce((obj, k, i) => ({...obj, [k]: d[i]}), {});
                return obj;
            })
        );
    };

    mrf.pl5 = (x, a, b, c, d, e) => {
        if(a == 100 & d == 100){ return(undefined); }
        return(a + ((d - a)/Math.pow(1 + Math.pow(10, (b * (Math.log10(c) - Math.log10(x)))), e)));
    };
    
    mrf.buildLogScale = (minDil, maxDil) => {
        let rng = (Math.ceil(Math.log10(maxDil)) - Math.floor(Math.log10(minDil))) / 0.1;
        let pow = [...Array(rng)].map((_, i) => Math.floor(Math.log10(minDil)) + (0.1 * i));
        let val = [minDil, ...pow.map(p => Math.pow(10, p)).filter(v => v > minDil && v < maxDil), maxDil];
        return(val);
    };

    // add to data object
    mrd.aggData = mrf.buildObjs(mrd.rawMabData.rawAggVirMab.data, mrd.rawMabData.rawAggVirMab.cols);

    let src = mrf.buildObjs(mrd.rawMabData.rawConcFits.src.data, mrd.rawMabData.rawConcFits.src.cols);
    let cnc = mrf.buildObjs(mrd.rawMabData.rawConcFits.cnc.data, mrd.rawMabData.rawConcFits.cnc.cols);
    cnc = d3.nest().key(d => d.curve_id).entries(cnc).map(d => Object.assign({curve_id: parseInt(d.key), conc_values: d.values}));
    mrd.concFits = mrf.mergeTable(src, cnc, "curve_id");
    mrd.curveSrc = src;

    mrd.hm = {};
    mrd.hm.scales = {};
    mrd.hm.sorts = {};

    mrd.hm.sorts.all = mrd.rawMabData.rawSorts.all[0];
    mrd.hm.sorts.group = {};
    mrd.hm.dataMabNest = d3.nest().key(d => d.mab_mix_label).entries(mrd.aggData);
    mrd.hm.dataVirNest = d3.nest().key(d => d.virus_name).entries(mrd.aggData);
    mrd.hm.dataLong = mrd.aggData;
    mrd.hm.labelSize = 12;
    
    Object.keys(mrd.rawMabData.rawSorts).filter(f => f != "all").forEach(k => {
        if(/virus/g.test(k)) {
            mrd.hm.sorts.group[k] = Object.assign({
                size: mrd.rawMabData.rawSorts[k].map(d => d.virsrt.length).reduce((a, c) => a + c),
                name: mrd.rawMabData.rawSorts[k].map(d => d.virsrt).reduce((a, c) => [...a, ...c]),
                nest: mrd.rawMabData.rawSorts[k]
            });
        } else {
            mrd.hm.sorts.group[k] = Object.assign({
                size: mrd.rawMabData.rawSorts[k].map(d => d.mabsrt.length).reduce((a, c) => a + c),
                name: mrd.rawMabData.rawSorts[k].map(d => d.mabsrt).reduce((a, c) => [...a, ...c]),
                nest: mrd.rawMabData.rawSorts[k]
            });

        };
        mrd.hm.sorts.group[k].nest.forEach(n => n.label = n.label.replace(/^$/g, "Undefined"));
        mrd.hm.sorts.group[k].nest.forEach(n => n.name = n.name.replace(/^$/g, "Undefined"));
    });
    
    let dilCurv = mrd.curveSrc.map(d => {
        let x = mrf.buildLogScale(d.min_concentration, d.max_concentration);
        let y = x.map(x => {
            return(
                mrf.pl5(
                    x,
                    d.fit_min,
                    d.fit_slope,
                    d.fit_inflection,
                    d.fit_max,
                    d.fit_asymmetry
                )
            ); 
        });
        return( {
            curve_id: d.curve_id, curve: x.map((_, i) => {
                return( { x: x[i], y: y[i] } ); })
        });
    });
    
    mrd.nc = {};
    mrd.nc.data = mrf.mergeTable(mrd.concFits, dilCurv, "curve_id");
    mrd.nc.data.forEach(d => d.mean_curve = d.curve.map(c => c.y).reduce((a, c) => a + c)/d.curve.length);
    mrd.nc.mabs = Array.from(new Set(mrd.nc.data.map(d => d.mab_mix_label))).sort();
    
    mrd.mb = {
        data: mrf.mbMabData()
    };

    mrf.mbSortLines(mrd.mb.data);
    mrf.mbSetPercent(mrd.mb.data);

    mrf.palDes = function(n) {           
        var pal = ["#b22222", "#ffd700", "#6e8b3d", "#7ac5cd", "#68228b"]; // color pallete in orginal neutralization curve.
        var csc = d3
            .scale.linear()
            .domain([...Array(pal.length).keys()].map(k => k / (pal.length - 1)))
            .range(pal);
        return (
            [...Array(n).keys()]
                .map(k => k / ( n == 1 ? 1 : n-1 ))
                .map(c => csc(c))
        );
    };

    this.mabReportData.webdav = "../../_webdav";
    
    mrd.webdav = "../../_webdav/"; // should be location of _webdav relational to page on server
    mrd.reportfiles = mrd.webdav + "CAVD/@files/CAVD-DataSpace-Reports"; // should be repo location on server
    mrd.dataStatus = ["complete"];

})();

