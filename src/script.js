/**
 * Created by zaenal on 31/05/16.
 */
'use strict';
/**
 *
 */
if(process.env.CIRCLE_BRANCH === 'develop'){
    var SSH_USERNAME = process.env.SSH_USERNAME;
    var SSH_PASSWORD = process.env.SSH_PASSWORD;
    var SSH_HOST = process.env.SSH_HOST;
    var SSH = require('simple-ssh');
    var ssh = new SSH({
        host: SSH_HOST,
        user: SSH_USERNAME,
        pass: SSH_PASSWORD
    });
    ssh
        .exec('echo "Node.js"', {
            out: console.log.bind(console)
        })
        .exec('echo "is"', {
            out: console.log.bind(console)
        })
        .exec('echo "awesome!"', {
            out: console.log.bind(console)
        })
        .exec('exit 0', {
            exit: function(code) {
                process.exit(code);
            }
        })
        .start();

} else {
    throw 'Not valid environment';
}