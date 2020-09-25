#!/usr/bin/env node

var program = require('commander');
var fs = require('fs');
var sjcl = require('sjcl');
var utils = require('./cli-utils');
var _ = require('lodash');
var Client = require('bitcore-wallet-client/index').default;
var FileStorage = require('./filestorage');
var async = require('async');
var moment = require('moment');

var BWS_INSTANCE_URL = 'https://bws.bitpay.com/bws/api'

program = utils.configureCommander(program);

program
    .option('-c, --coin <coin>', 'coin (btc/bch)')
    .option('-t, --testnet', 'testnet network')
    .option('-i, --input', 'import from file')
    .option('-q, --qr', 'import from a QR code')
    .option('-l, --limit <n>', 'limit history to n transactions')
    .option('-m, --format <json>', 'format csv / json')
    .option('-i, --info', 'get extra history info')
    .option('-o, --output <file>', 'get JSON output in file')
    .option('-e, --exportpassword <password>', 'a password to decrypt the data being imported')
    .option('-k, --keypassword <password>', 'password to decrypt private key from imported file')
    .option('-p, --password', 'Encrypt wallet. Will ask password interactively')
    .usage('[options]  [<"backup-words"> <passphrase> | <filename> ] ')
    .parse(process.argv);

var args = program.args;

if (!args[0])
    program.help();


var skip = 0, total = 0,
    limit = program.limit, got, page = 1000;
console.warn("* TX History:")

let converter = JSON.stringify.bind();


function formatDate(date) {
    var dateObj = new Date(date);
    if (!dateObj) {
        this.logger.warn('Error formating a date');
        return 'DateError';
    }
    if (!dateObj.toJSON()) {
        return '';
    }
    return dateObj.toJSON();
}

async function printHistory(client, program) {

    if (program.format == 'csv') {
        converter = function (txs) {

            var ret = '';
            var _amount, _note, _copayers, _creator, _comment;
            var csvContent = [];

            // from Copay
            txs.forEach(it => {
                var amount = it.amount;
                if (it.action == 'moved') amount = 0;

                _copayers = '';
                _creator = '';

                if (it.actions && it.actions.length > 1) {
                    for (var i = 0; i < it.actions.length; i++) {
                        _copayers +=
                            it.actions[i].copayerName + ':' + it.actions[i].type + ' - ';
                    }
                    _creator =
                        it.creatorName && it.creatorName != 'undefined'
                            ? it.creatorName
                            : '';
                }
                _amount = (it.action == 'sent' ? '-' : '') + (amount / 1e8).toFixed(8);
                _note = it.message || '';
                _comment = it.note ? it.note.body : '';

                if (it.action == 'moved')
                    _note += ' Moved:' + (it.amount / 1e8).toFixed(8);

                csvContent.push({
                    Date: formatDate(it.time * 1000),
                    Destination: it.addressTo || '',
                    Description: _note,
                    Amount: _amount,
                    Currency: this.currency,
                    Txid: it.txid,
                    Creator: _creator,
                    Copayers: _copayers,
                    Comment: _comment
                });

                if (it.fees && (it.action == 'moved' || it.action == 'sent')) {
                    var _fee = (it.fees / 1e8).toFixed(8);
                    csvContent.push({
                        Date: formatDate(it.time * 1000),
                        Destination: 'Bitcoin Network Fees',
                        Description: '',
                        Amount: '-' + _fee,
                        Currency: this.currency,
                        Txid: '',
                        Creator: '',
                        Copayers: ''
                    });
                }

            });

            csvContent.forEach(it => {
                ret = ret + `${it.Date},${it.Txid},${it.Destination},${it.Amount}` + "\n";
            });
            return ret;
        };
    } else if (program.format == 'json') {
    } else if (program.format) {
        utils.die('Unknown format ' + program.format);
    }


    var allTxs = [];

    // utils.getClient(program, { mustExist: true }, function (client) {
    async.doWhilst(
        function (cb) {
            client.getTxHistory({
                skip: skip,
                limit: page + 1,
                includeExtendedInfo: program.info,
            }, function (err, txs) {
                if (err) return cb(err);

                if (_.isEmpty(txs))
                    return;

                got = txs.length;
                if (got > page) {
                    txs.pop();
                }

                if (program.output) {
                    allTxs = allTxs.concat(txs);
                    fs.writeFile(program.output, converter(allTxs), {
                        encoding: 'utf8'
                    }, function (err) {
                        if (err) console.error(err);
                        console.warn('Output file updated')
                    });
                } else {
                    _.each(txs, function (tx) {
                        // console.log(JSON.stringify(tx, null, '  '));
                        var time = moment(tx.time * 1000).fromNow();
                        var amount = utils.renderAmount(tx.amount);
                        var confirmations = tx.confirmations || 0;
                        var proposal = tx.proposalId ? '["' + tx.message + '" by ' + tx.creatorName + '] ' : '';
                        var direction;
                        switch (tx.action) {
                            case 'received':
                                direction = '<=';
                                break;
                            case 'moved':
                                direction = '==';
                                break;
                            case 'sent':
                                direction = '=>';
                                break;
                            default:
                                direction = tx.action;
                                break;
                        }
                        console.log("\t%s: %s %s %s %s(%s confirmations)", time, direction, tx.action, amount, proposal, confirmations);
                    });
                }
                return cb();
            });
        },
        function () {
            total = total + got;
            var cont = got > page && (!limit || total < limit);
            if (cont) {
                skip += page;
                console.warn('* Skip:', skip);
            }
            return cont;
        },
        function (err) {
            if (err) console.log(err);
        }
    );
    // });
}

utils.getClient(program, {
    mustBeNew: true
}, function (client) {

    var client = new Client({
        baseUrl: BWS_INSTANCE_URL,
        verbose: false
    });

    if (program.input) {
        var file = args[0];
        console.log("Importing from file:" + file);
        var str;

        try {
            str = fs.readFileSync(file, {
                encoding: 'utf8'
            });
        } catch (e) {
            utils.die('Could not import: ' + e);
        };
        if (str.substr(0, 6) == '{"iv":') {
            console.log('Backup is encrypted');
            if (!program.exportpassword)
                utils.die('Provide export\'s password with -e ');
            try {

                str = sjcl.decrypt(program.exportpassword, str);
                walletData = JSON.parse(str);
                client.fromString(JSON.stringify(walletData.credentials));

                client.getStatus({}, function (err, res) {
                    utils.die(err);

                    var x = res.wallet;
                    console.log('* Wallet %s [%s]: %d-of-%d %s Coin:%s ', x.name, x.network, x.m, x.n, x.status, x.coin);

                    if (x.status != 'complete') {
                        console.log('  Missing copayers:', x.n - x.copayers.length);
                        console.log('  Wallet secret:', x.secret);
                    }
                    console.log('* Copayers:', _.map(x.copayers, 'name').join(', '));


                    if (program.verbose) {
                        console.log('* Wallet Raw Data:', x);
                    }

                    var x = res.balance;
                    console.log('* Balance %s (Locked: %s)', utils.renderAmount(x.totalAmount, client.credentials.coin), utils.renderAmount(x.lockedAmount, client.credentials.coin));

                    utils.renderTxProposals(res.pendingTxps);

                    printHistory(client, program)
                });
            } catch (e) {
                utils.die('Could not work: ' + e);
            };
        };
    }
});
