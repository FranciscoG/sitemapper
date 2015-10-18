#!/usr/bin/env node
var Crawler = require("simplecrawler");
var deDupe = require('./lib/dedupe.js');
var argv = require('yargs').argv;

/***********************************************************
 * Set options
 * all are options are default to False
 *
 * -a --all     to include all assets (images, css, js, pdfs, everything!)
 * -i --images  to include images
 * -p --pdfs    to include pdfs
 * -h --hash    to include urls with a hash
 * -q --queries to include urls with search queries
 */

var options = {
  includeImages : ( (argv.images || argv.i) || (argv.all || argv.a) ) ? true : false,
  includePDFs : ( (argv.pdfs || argv.p) || (argv.all || argv.a) ) ? true : false,
  includeAll : (argv.all || argv.a) ? true : false,
  includeHash : (argv.hash || argv.h) ? true : false,
  includeQueries : (argv.queries || argv.q) ? true : false
};


/***********************************************************
 * Event Callbacks
 */

function onComplete(){
  console.log("finished!");
}

function onDiscovered(queueItem) {
  console.log("Completed discovering resource:", queueItem.url);
}

function onFetchComplete(queueItem) {
  console.log("Completed fetching resource:", queueItem.url);
}

function on404(queueItem) {
  console.log("404 or 410 response for: ", queueItem.url);
}

/***********************************************************
 * init Crawler
 */

var baseUrl = argv.site || argv.s;

if (baseUrl) {
  var myCrawler = new Crawler(baseUrl);
}
else {
  console.log('usage: index.js --site www.the-site.com');
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


/***********************************************************
 * begin Crawling
 */

// myCrawler.ignoreInvalidSSL = true;
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// myCrawler.on("discoverycomplete", onDiscovered)
myCrawler.on("fetchcomplete", onFetchComplete)
myCrawler.on("complete", onComplete);
myCrawler.on("fetch404", on404);

myCrawler.start();

