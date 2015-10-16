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

/*
  
  some notes:
  
  Filter through links to make sure they are worth traversing:
  ------------------------------------------------------------
  
  strip hash and queries
    #
    ?
  
  check if http and is local
    if url.protocol.indeOf('http') > -1
    if url.host.indexOf(SITEURL) > 0


  this is how to form the JSON to be easily converted to XML later:
  ----------------------------------------------------------------
  // <?xml version="1.0" encoding="UTF-8"?>
  attr = {
    "xmlns" : "http://www.sitemaps.org/schemas/sitemap/0.9",
    "xmlns:xsi" : "http://www.w3.org/2001/XMLSchema-instance",
    "xmlns:image" : "http://www.google.com/schemas/sitemap-image/1.1",
    "xsi:schemaLocation" : "http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
  }
  sitemap = {
  
    "urlset" : {
      "url" : {
        "loc" : "",
        "lastmod": "", // for PDFs
        
        "image:image" : {
          "image:loc" : "",
          "image:title" : "",
        }        
      }
    }
  }

 */