var http = require('http'),
    fs = require('fs'),
    url = require('url'),
    querystring = require('querystring'),
    path = require('path');

function AppList(apps) {
    if(!(apps instanceof Array)) { throw new Error('apps must be an array'); }
    this.apps = apps;
};

AppList.prototype = {
    //fix constructor property
    constructor: AppList,
    getAppByURL: function(url) {
        var app;

        for(var i = 0; i < this.apps.length; i++) {
            app = this.apps[i];

            if(url.substr(0, app.url.length + 1) === '/' + app.url) {
                return app;
            }
        }

        return null;
    }
};


function App(path2app) {
    this.path2app = path2app;
    this.path2config = path.join(path2app, 'config.json');

    this.actions = [];

    this._init();
}

App.prototype = {
    //fix constructor property
    constructor: App,
    _readConfig: function() {
        configJSON = fs.readFileSync(this.path2config).toString('utf8');
    
        try{
            config = JSON.parse(configJSON);
        } catch(e) {
            console.error('Cannot parse JSON file [' + this.path2config + ']');
            throw e;
        }
    
        if(typeof config.url !== 'string') {
            throw new Error('url property must be a string [' +
                    this.path2config + ']');
        }
    
        this.url = config.url;
    
        if(!(config.actions instanceof Array)) {
            throw new Error('actions property must be an array [' +
                    this.path2config + ']');
        }

        this.actions.length = 0;

        var actionConfig;

        for(var i = 0; i < config.actions.length; i++) {
            actionConfig = config.actions[i];

            this.actions.push(new Action(
                actionConfig.url,
                actionConfig.method,
                actionConfig.parameters,
                actionConfig.responseFile,
                actionConfig.contentType,
                actionConfig.statusCode || 200,
                actionConfig.delay || {}
            ));
        }
    },
    _init: function() {
        var that = this;

        fs.watchFile(this.path2config, function(curr, prev) {
            if(curr.mtime.getTime() > prev.mtime.getTime()) {
                that._readConfig();
                console.info('[' + that.path2config + '] reloaded');
            }
        });

        this._readConfig();
    },
    getAction: function(req) {
        var action,
            urlObj = url.parse(req.url),
            actionURL = urlObj.pathname.substr(this.url.length + 2),
            actionParameters = querystring.parse(urlObj.query);

        for(var i = 0; i < this.actions.length; i++) {
            action = this.actions[i];

            if(action.match(actionURL, req.method, actionParameters)) {
                return action;
            }
        }

        return null;
    }
};

function Action(url, method, parameters, responseFile, contentType, statusCode,
        delay) {

    if(typeof url !== 'string') { throw new Error('url must be a string'); }
    this.url = url;

    if(typeof method !== 'string') {
        throw new Error('method must be a string');
    }
    this.method = method;

    if(!(parameters instanceof Object)) {
        throw new Error('parameters must be an array');
    }
    this.parameters = parameters;

    if(typeof responseFile !== 'string') {
        throw new Error('responseFile must be a string');
    }
    this.responseFile = responseFile;

    if(typeof contentType !== 'string') {
        throw new Error('contentType must be a string');
    }
    this.contentType = contentType;

    if(typeof statusCode !== 'number') {
        throw new Error('statusCode must be a number');
    }
    this.statusCode = statusCode;

    if(!(delay instanceof Object)) {
        throw new Error('delay must be an object');
    }
    this.delay = delay;
}

Action.prototype = {
    constructor: Action,
    /**
     * Returns delay of the action in milliseconds.
     * @method getDelayInMilliseconds
     * @return {Number}
     */
    getDelayInMilliseconds: function() {
        var delay = 0;

        delay += (this.delay.seconds * 1000) || 0;

        return delay;
    },
    match: function(url, method, parameters) {
        if(this.url !== url || this.method !== method) {
            return false;
        }

        for(var key in parameters) {
            if(this.parameters[key] !== parameters[key]) {
                return false;
            }
        }

        for(key in this.parameters) {
            if(this.parameters[key] !== parameters[key]) {
                return false;
            }
        }

        return true;
    }
};

var apps = new AppList([
    new App(path.join(__dirname, 'twitter'))
]);

http.createServer(function(req, res) {
    var app = apps.getAppByURL(req.url);
    
    if(!app) {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('Cannot find app');
        return;
    }   
    
    var action = app.getAction(req);
    
    if(!action) {
        res.writeHead(400, {'Content-Type': 'text/plain'});
        res.end('Cannot find action');
        return;
    }   

    var delay = action.getDelayInMilliseconds();

    if(delay) {
        setTimeout(function() {
            res.writeHead(action.statusCode, {
                'Content-Type': action.contentType });

            res.end(fs.readFileSync(app.path2app + '/' + action.responseFile));
        }, delay);
    }
    else {
        res.writeHead(action.statusCode, {
            'Content-Type': action.contentType });

        res.end(fs.readFileSync(app.path2app + '/' + action.responseFile));
    }
}).listen(8765, '127.0.0.1');
