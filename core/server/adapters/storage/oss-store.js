// var util = require('util');
var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');
var OSS = require('ali-oss');
var utils = require('./oss-utils');
var baseStore = require('ghost-storage-base');
var crypto = require('crypto');

class OssStore extends baseStore {
    constructor(config) {
        super(config);
        this.options = config || {};
        this.client = new OSS(this.options);
    }

    save(file) {
        // console.log(targetDir);
        // console.log(file);
        // console.log(file.path);
        var client = this.client;
        var origin = this.options.origin;
        
        // console.log(key);

        return new Promise(function (resolve, reject) {
            var fsHash = crypto.createHash('md5');
            var ext = path.extname(file.name).toLowerCase();
            
            var buffer = fs.readFileSync(file.path);
            fsHash.update(buffer);
            var md5 = fsHash.digest('hex');
            console.log(md5)
            var stream = fs.createReadStream(file.path);
            return client.put(
                md5 + ext,
                stream
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
}

module.exports = OssStore;
