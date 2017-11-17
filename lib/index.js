
const istanbul = require('istanbul-api');
const defaultOptions = {
    reports: {}
}

function KarmaIstanbulReportReporter(baseReporterDecorator, config, logger) {
    baseReporterDecorator(this);
    
    config = Object.assign({}, defaultOptions, config);

    const baseOnRunStart = this.onRunStart;
    this.onRunStart = () => {
        var plugin = this;

        var origCreateReporter = istanbul.createReporter;
        istanbul.createReporter = function (cfg, opts) {
            var that = this;

            // create the instance of reporter and then patch its' methods
            var reporter = origCreateReporter.call(that, ...arguments);
            
            return patch(reporter);
        }

        // remember to call the original onRunStart
        baseOnRunStart.apply(this, arguments);
    }

    function patch(reporter){
        if (!reporter)
            return;

        const reports = Object.assign({}, config.reports) ;
    
        // patch addAll by adding first the custom reports from the plugin's config
        var originalAddAll = reporter.addAll;
        reporter.addAll = function (fmts) {
            var that = this;
            Object.keys(reports).forEach((reportType)=> {
                if (that.reports[reportType])
                    continue; // report was already added to istanbul reporter
                const report = reports[reportType];
                if (typeof(report) === 'object')
                    that.reports[reportType] = report;
            })
            
            originalAddAll.call(that, ...arguments);
        }
    
        return reporter;
    }
}



KarmaIstanbulReporterPatch.$inject = ['baseReporterDecorator', 'config.istanbulReport', 'logger'];
module.exports = {
    'reporter:IstanbulReport': ['type', KarmaIstanbulReportReporter]
}