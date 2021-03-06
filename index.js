#!/usr/bin/env node
var Crawler = require("simplecrawler");
var argv = require('yargs').argv;
var colors = require('colors');

/***********************************************************
 * Set options
 * all are options are default to False
 *
 * -a --all     to include all assets (images, css, js, pdfs, everything!)
 * -i --images  to include images
 * --pdf    to include pdfs
 * -h --hash    to include urls with a hash
 * -q --queries to include urls with search queries
 * -u --user    to include Basic HTTP Auth Username
 * -p --pass    to include Basic HTTP Auth Password
 * --port       use a non-standard http port
 * --initPath   initial path to start from
 */

var options = {
  includeImages : ( (argv.images || argv.i) || (argv.all || argv.a) ) ? true : false,
  includePDFs : ( argv.pdf || (argv.all || argv.a) ) ? true : false,
  includeAll : (argv.all || argv.a) ? true : false,
  includeHash : (argv.hash || argv.h) ? true : false,
  includeQueries : (argv.queries || argv.q) ? true : false,
  authUser : (argv.user || argv.u) ? (argv.user || argv.u) : false,
  authPW : (argv.pass || argv.p) ? (argv.pass || argv.p) : false,
  port: argv.port || false,
  initPath: argv.initPath || false
};

/***********************************************************
 * init Crawler
 */

var baseUrl = argv.site || argv.s;

if (baseUrl) {
  var myCrawler = new Crawler(baseUrl);
}
else {
  console.log('basic usage: ./index.js --site www.the-site.com\n');

  var options = [
    "-s or --site \t\t Required, the url of the site.\n",
    "--port \t\t\t use a non-standard http port\n\n",
    "-a or --all \t\t include all assets (images, css, js, pdfs, everything!)\n",
    "-i or --images \t\t include images\n",
    "-h or --hash \t\t include urls with a hash\n",
    "-q or --queries \t include urls with search queries\n",
    "-u or --user \t\t include Basic HTTP Auth Username\n",
    "-p or --pass \t\t include Basic HTTP Auth Password\n",
    "--pdf \t\t\t include pdfs\n",
    "--initPath \t\t initial path to start from\n"
  ].join('');
  console.log(options);
  process.exit(1);
}

if (argv.path) {
  myCrawler.initialPath = argv.path;
}

/***********************************************************
 * excludes
 */

if (!options.includeAll) {
  var conditionID = myCrawler.addFetchCondition(function(parsedURL) {
      return !parsedURL.uriPath.match(/\.(css|js|eot|ttf|svg|ico)$/i);
  });
}

if (!options.includeImages && !options.includeAll) {
  var excludeImages = myCrawler.addFetchCondition(function(parsedURL) {
      return !parsedURL.uriPath.match(/\.(png|jpe?g|gif)$/i);
  });
}

if (!options.includePDFs && !options.includeAll) {
  var excludePDFs = myCrawler.addFetchCondition(function(parsedURL) {
      return !parsedURL.uriPath.match(/\.(pdf)$/i);
  });
}

if (!options.includeHash) {
  var ignoreHash = myCrawler.addFetchCondition(function(parsedURL) {
      return !parsedURL.uriPath.match(/#/);
  });
}

if (!options.includeQueries) {
  myCrawler.stripQuerystring = true;
}

if (options.authUser) {
  myCrawler.needsAuth = true;
  myCrawler.authUser = options.authUser;
}

if (options.authPW) {
  myCrawler.needsAuth = true;
  myCrawler.authPass = options.authPW;
}

if (options.port) {
  console.log("using port: " + options.port);
  myCrawler.initialPort = options.port;
}

myCrawler.allowInitialDomainChange=true;

/***********************************************************
 * Event Callbacks
 */

var urlset = [];
var errors = [];

function onComplete(){
  console.log("finished!");
  console.log("\n\nThe following errors were found:");
  console.log(errors.join('\n').red);
}

function onDiscovered(queueItem) {
  console.log("Completed discovering resource:", queueItem.url);
}

function onFetchComplete(queueItem) {
  console.log("Completed fetching resource:", queueItem.url);
  urlset.push( { "loc" : queueItem.url } );
}

function on404(queueItem) {
  console.log("404 or 410 response for: ".red, queueItem.url.red);
  errors.push(queueItem.status + " - " + queueItem.url);
  // console.log(JSON.stringify(queueItem));
}

function onOtherError(queueItem) {
  console.log(JSON.stringify(queueItem));
  errors.push(queueItem.status + " - " + queueItem.url);
}

/***********************************************************
 * begin Crawling
 */

// myCrawler.ignoreInvalidSSL = true;
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// myCrawler.on("discoverycomplete", onDiscovered)
myCrawler.on("fetchcomplete", onFetchComplete);
myCrawler.on("complete", onComplete);
myCrawler.on("fetch404", on404);
myCrawler.on("fetcherror", onOtherError);

myCrawler.start();

