// var util = require('util');
var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');
var OSS = require('ali-oss');
var utils = require('./oss-utils');
var baseStore = require('ghost-storage-base');

class OssStore extends baseStore {
    constructor(config) {
        super(config);
        this.options = config || {};
        this.client = new OSS(this.options);
    }

    save(file, targetDir) {
        console.log(targetDir);
        var client = this.client;
        var origin = this.options.origin;
        var key = this.getFileKey(file);

        return new Promise(function (resolve, reject) {
            return client.put(
                key,
                fs.createReadStream(file.path)
            ).then(function (result) {
                // console.log(result)
                if (origin) {
                    resolve(utils.joinUrl(origin, result.name));
                } else {
                    resolve(result.url);
                }
            }).catch(function (err) {
                console.log(err);
                reject(false);
            });
        });
    }

    exists(filename) {
        // console.log('exists',filename)
        var client = this.client;

        return new Promise(function (resolve, reject) {
            return client.head(filename).then(function (result) {
                console.log(result);
                resolve(true);
            }).catch(function (err) {
                console.log(err);
                reject(false);
            });
        });
    }

    serve(options) {
        console.log(options);
        return function (req, res, next) {
            next();
        };
    }

    delete(filename) {
        var client = this.client;

        // console.log('del',filename)
        return new Promise(function (resolve, reject) {
            return client.delete(filename).then(function (result) {
                console.log(result);
                resolve(true);
            }).catch(function (err) {
                console.log(err);
                reject(false);
            });
        });
    }

    read(options) {
        options = options || {};
        var client = this.client;
        var url = options.path;
        var pathArr = url.split('/');
        var fileName = pathArr[pathArr.length - 1];
        var path = pathArr[pathArr.length - 2];
        var objName = path + '/' + fileName;
        return new Promise((resolve, reject) => {
            return client.get(objName).then(
                function (result){
                    resolve(result.content);
                }
            ).catch(function (err) {
                console.log(err);
                reject(false);
            });
        });
    }

    getFileKey(file) {
        var keyOptions = this.options.fileKey;

        if (keyOptions) {
            var getValue = function (obj) {
                return typeof obj === 'function' ? obj() : obj;
            };
            var ext = path.extname(file.name);
            var name = path.basename(file.name, ext);

            if (keyOptions.safeString) {
                name = utils.safeString(name);
            }

            if (keyOptions.prefix) {
                name = path.join(keyOptions.prefix, name);
            }

            if (keyOptions.suffix) {
                name += getValue(keyOptions.suffix);
            }

            return name + ext.toLowerCase();
        }

        return null;
    }
}

module.exports = OssStore;
