/**
 * Created by zaenal on 03/06/15.
 */
'use strict';
var config = require('config');
var request = require('request');
var qs = require('querystring');
var moment = require('moment');
var uuid = require('node-uuid');

var CryptoJS = require("crypto-js");

function Request(env) {
    if(!config.has('hz')){
        throw new Error("config HZ not found!");
    }
    var hz = config.get('hz');
    this.env = env || 'dev';
    this.config = hz;
    this.headers = {};
    this.headers.serviceType = hz.serviceType;
    this.headers.requestType = hz.requestType;
    this.headers.timestamp = null;
    this.headers.messageId = null;
    this.headers.externalServiceId = hz.externalServiceId;
    this.headers.Accept = 'application/xml';
    this.headers.personnelId = hz.personnelId;
    this.headers.districtStudentId = null;
    this.headers.authorizedEntityId = hz.authorizedEntityId;
    this.headers.externalServiceId = hz.externalServiceId;
    this.headers.requestAction = hz.requestAction;
    this.headers.messageType = hz.messageType;
    this.headers["Content-Type"] = "application/xml";
    this.headers.Authorization = null;
    this.headers.objectType = hz.objectType;
    this.queryParameter = { contextId: hz.contextId };
    this.url = hz.hzUri;
}

Request.prototype = {
    constructor: Request,
    /**
     *
     * @param params
     */
    setQueryParameter: function (params) {
        this.queryParameter = params;
    },
    /**
     *
     * @param param
     * @param val
     */
    addQueryParameter: function (param, val) {
        this.queryParameter[param] = val;
    },
    /**
     *
     * @returns {{contextId: string}|*}
     */
    getQueryParameter: function () {
        return this.queryParameter;
    },
    /**
     *
     * @param headers
     */
    setHeaders: function (headers) {
        this.headers = headers;
    },
    /**
     *
     * @param key
     * @param val
     */
    addHeader: function (key, val) {
        this.headers[key] = val;
    },
    /**
     *
     * @returns {{}|*}
     */
    getHeaders: function () {
        return this.headers;
    },
    /**
     *
     * @param url
     * @param method
     * @param callback
     * @returns request
     */
    create: function (url, method, callback) {

        this.headers.messageId = this.generateUUID();
        var timestamp = this.headers.timestamp = this.getTimezone();
        this.headers.Authorization = 'SIF_HMACSHA256 ' + this.generateHZAuthToken(timestamp);
        var options = {
            url: this.url + url,
            method: method || 'GET',
            headers: this.getHeaders(),
            qsParseOptions: { sep: ';'},
            strictSSL: false
        };
        console.log("SEND DATA TO HZ");
        console.dir(options);
        return request.get(options, callback || function (error, response, body) {
            if(error){
                console.log('error: ', error);
            } else {
                if (response && response.statusCode == 201) {
                    console.log(body)
                } else {
                    console.log('RESPONSE: ', response);
                    console.log(body)
                }
            }
        });
    },
    /**
     *
     * @param districtStudentId
     * @param zoneId
     * @param callback
     * @returns {*|request}
     */
    createRequestProvider: function(districtStudentId, zoneId, callback){
        var url = '/requestProvider/' + this.config.service +'/'+districtStudentId+';zoneId='+zoneId+';contextId='+this.config.contextId;
        this.addHeader( 'districtStudentId', districtStudentId );
        return this.create(url, 'GET', callback);
    },
    /**
     *
     * @returns {ServerResponse|Object|*}
     */
    getTimezone: function(){
        return moment().utc().format("YYYY-MM-DDThh:mm:ss.SSSZZ");
    },
    /**
     *
     * @returns {*}
     */
    generateUUID: function(){
        return uuid.v1();
    },
    /**
     *
     * @param timestamp
     * @returns {*|string}
     */
    generateHZAuthToken: function(timestamp){
        var sessionToken = this.config.hzSessionToken;
        var valToHash = sessionToken + ":" + timestamp;
        var secret = this.config.hzSharedSecret;
        var hash = CryptoJS.HmacSHA256(valToHash, secret).toString(CryptoJS.enc.Base64);
        return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(sessionToken + ":" + hash));
    }
};


module.exports = Request;