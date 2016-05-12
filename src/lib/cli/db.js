/**
 * Created by zaenal on 22/09/15.
 */
var mongoose = require('mongoose');
var utils = require('../utils'), config = utils.config();
var _ = require('underscore');

function db() {

    this.mongo = mongoose;

    this.dbUri = config.get('db.mongo');

    if(_.isObject(this.dbUri) && config.has('db.mongo.host') && config.has('db.mongo.name')){
        this.dbUri = 'mongodb://' + config.get('db.mongo.host') + '/' + config.get('db.mongo.name');
    }

    this.mongoOptions = config.has('db.mongo_options') ? config.get('db.mongo_options') : {};

    this.env = config.util.getEnv('NODE_ENV');

    this.connect();

}

db.prototype.connect = function(){

    var me = this;

    this.mongo.connect(me.dbUri, me.mongoOptions);

    this.mongo.connection.once('open', function (callback) {

        console.log("[%s] DB MongoDB", me.env);

    });
};

new db();