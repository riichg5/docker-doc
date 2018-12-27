const util = require('util');
const uuid = require('uuid');
const url = require('url');
const path = require('path');

function deepFreeze (obj) {
    let self = this;
    // Retrieve the property names defined on obj
    var propNames = Object.getOwnPropertyNames(obj);
    // Freeze properties before freezing self
    propNames.forEach(function(name) {
        var prop = obj[name];
        // Freeze prop if it is an object
        if (typeof prop === 'object' && prop !== null) {
            deepFreeze(prop);
        }
    });
    // Freeze self (no-op if already frozen)
    return Object.freeze(obj);
}

function randomNum(minNum, maxNum){
    switch(arguments.length){
        case 1:
            return parseInt(Math.random()*minNum+1,10);
        case 2:
            return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10);
        default:
            return 0;
    }
}

let utils = {
    getPathName (_url) {
        let urlInfo = url.parse(_url);
        let pathInfo = path.parse(urlInfo.pathname);

        let pathname = urlInfo.pathname;
        let ext = pathInfo.ext;

        // console.info(`
        //     --> urlInfo: ${_utils.inspect({obj: urlInfo})},
        //     --> pathInfo: ${_utils.inspect({obj: pathInfo})}
        // `);

        if(pathname.startsWith('/')) {
            pathname = pathname.replace('/', '');
        }

        //如果url没有文件名信息，指定为index.html页面
        if(ext.length === 0) {
            if(pathname.length === 0) {
                pathname = `${_base}public/index.html`;
            } else {
                pathname = `${_base}public/${pathname}index.html`;
            }
        } else {
            pathname = `${_base}public/${pathname}`;
        }

        console.log(`pathname: ${pathname}`);

        return pathname;
    },
    randomIntervalWait: async (opts) => {
        let wait = opts && opts.wait;
        let waitSecond = 1;

        if(wait) {
            waitSecond = wait;
        } else {
            waitSecond = randomNum(1, 3);
        }

        await new Promise((done, reject) => {
            setTimeout(done, waitSecond * 1000);
        });

        return waitSecond;
    },
    arrayToMap (arrayObj, key) {
        let mapObj = Object.create(null);
        if(!_.isArray(arrayObj) || !arrayObj) {
            return mapObj;
        }
        for(let item of arrayObj) {
            mapObj[item[key]] = item;
        }
        return mapObj;
    },
    setContextData: (opts) => {
        let {ctx, key, data, isWritable = true, isConfigurable = false, isEnumerable = true} = opts;

        if(typeof isWritable === 'undefined') {
            isWritable = true;
        }

        //默认不能被删除，set值后，只能修改为null
        if(typeof isConfigurable === 'undefined') {
            isConfigurable = false;
        }

        if(typeof isEnumerable === 'undefined') {
            isEnumerable = true;
        }

        if(!ctx._requestData) {
            Object.defineProperty(ctx, '_requestData', {
                enumerable: true,
                configurable: false,
                writable: true,
                value: Object.create(null)
            });
        }

        if(typeof ctx._requestData[key] === 'undefined') {
            Object.defineProperty(ctx._requestData, key, {
                enumerable: isEnumerable,
                configurable: isConfigurable,
                writable: isWritable
            });
        }

        ctx._requestData[key] = data;
    },

    getContextData (opts) {
        let {ctx, key} = opts;

        if(typeof ctx._requestData === 'undefined') {
            return undefined;
        }

        return ctx._requestData[key];
    },

    deepFreeze: (obj) => {
        let self = this;
        // Retrieve the property names defined on obj
        var propNames = Object.getOwnPropertyNames(obj);
        // Freeze properties before freezing self
        propNames.forEach(function(name) {
            var prop = obj[name];
            // Freeze prop if it is an object
            if (typeof prop === 'object' && prop !== null) {
                deepFreeze(prop);
            }
        });
        // Freeze self (no-op if already frozen)
        return Object.freeze(obj);
    },

    createError: (message, statusCode, errorCode, data) => {
        var error;
        error = new Error(message);
        error.statusCode = statusCode ? statusCode : 400;
        error.errorCode = errorCode ? errorCode : '';
        error.data = data || null;
        return error;
    },

    createErrorWithData: (options) => {
        var error;
        error = new Error(options.message || options.msg);
        error.statusCode = options.statusCode ? options.statusCode : 400;
        error.errorCode = options.errorCode ? options.errorCode : '';
        error.data = options.data ? options.data : null;
        return error;
    },

    uuid: () => {
        return uuid();
    },

    coEach: async (opts) => {
        let mapArr, start, totalLength;
        let results = [];
        let MAX_CONCURRENT = 2000;
        let collection = opts.collection;
        let handler = opts.func;
        let limit = opts.limit;

        if(!Array.isArray(collection)) {
            throw new Error('argument "collection" should be Array');
        }
        if(typeof handler !== 'function') {
            throw new Error('argument "func" should be function');
        }
        //not a number or negative
        if (!Number.isSafeInteger(limit) || limit < 0) {
            limit = 0;
        }
        //set max concurrent
        if(limit > MAX_CONCURRENT) {
            limit = MAX_CONCURRENT;
        }
        //set max concurrent if collection's length is very large and limit is not set
        totalLength = collection.length;
        if(totalLength && limit === 0) {
            limit = MAX_CONCURRENT;
        }


        let res;
        for(start=0; start<totalLength; ) {
            mapArr = collection.slice(start, start+limit);
            start += limit;

            res = await Promise.all(mapArr.map((elem, index) => {
                return handler(elem, index);
            }));
            results = results.concat(res);
        }

        return results;
    },

    inspect: (opts) => {
        let obj = opts.obj;
        let depth = opts.depth || 3;

        return util.inspect(obj, {depth: depth});
    }
};

module.exports = utils;
