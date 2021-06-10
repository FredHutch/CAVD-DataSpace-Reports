SCRIPTPATH=/labkey/labkey/files/CAVD/@files/CAVD-DataSpace-Reports/cronjobs/curves.R
PLOTSDIR=/labkey/labkey/files/CAVD/@files/neutralizationCurves
LOGFILE=/labkey/labkey/files/CAVD/@files/CAVD-DataSpace-Reports/cronjobs/curves_log.log
PLOTFUN=/labkey/labkey/files/CAVD/@files/CAVD-DataSpace-Reports/cronjobs/plotNeutralizationCurve.R

# Remove all existing plots
if [ -d $PLOTSDIR ]
then rm -r $PLOTSDIR
fi

mkdir $PLOTSDIR

# Create pngs for all palettes
/usr/bin/Rscript $SCRIPTPATH -d $PLOTSDIR -l $LOGFILE -u $1 -f $PLOTFUN >> $LOGFILE
