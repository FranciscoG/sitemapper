#!/usr/bin/env node
var scraper = require('./scraper.js');
var argv = require('yargs').argv;

if (typeof argv.site !== 'undefined' ) {
    scraper.getLinks(argv.site)
      .then(function(links){
        console.log(links);
      });
}
else {
  console.log('usage: index.js --site http://blablabla.bla');
}