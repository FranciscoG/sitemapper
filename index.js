#!/usr/bin/env node
var Scraper = require('./scraper.js');
var argv = require('yargs').argv;

var baseUrl = argv.site;

if (typeof baseUrl !== 'undefined' ) {
    var scrape = new Scraper(baseUrl);
    scrape.then(function(obj){
        console.log(obj);
      });
}
else {
  console.log('usage: index.js --site http://blablabla.bla');
}