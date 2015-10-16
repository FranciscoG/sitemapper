var cheerio = require('cheerio');
var Bluebird = require('bluebird');
var url = require('url');
var request = Bluebird.promisifyAll(require('request'));

/**
 * Takes in an Array and remove duplicates
 * @param  {Array} arr The array you would like to filter out duplicates from
 * @return {Array}  will return an empty array if error
 */
function deDupeArray(arr) {
  if (!arr || arr.length === 0 ) { return []; }
  if (arr.length === 1) { return arr; } 
  var result = [];
  arr.forEach(function(item) {
       if(result.indexOf(item) < 0) {
          result.push(item);
       }
  });
  return result;
}

/**
 * get all the download links on a page
 * @param {Object} $  Cheerio object. jquery-like $ object with document already loaded
 * @return {Object} links : []
 *                  images : []
 */
function getItems($){
  var result = { links : [], images : [] };
  if (!$) { return result; }
  
  var links = [];
  var images = [];
  var current = "";

  console.log('getting links from html...');
  $('a').each(function(i, elem){
    current = $(this).attr('href');
    if (typeof current !== 'undefined' && current !== "") {
      links.push(current);
    }
  });

  current = "";
  console.log('getting images from html...');
  $('img').each(function(i, elem){
    current = $(this).attr('src');
    if (typeof current !== 'undefined' && current !== "") {
      images.push(current);
    }
  });
  result.links = deDupeArray(links);
  result.images = deDupeArray(images);
  return result;
}

/**
 * sends the request to a url
 * @param String siteURL
 */
function Scraper(siteURL){
  //get the HTML for the page
  console.log('requesting page...');
  
  var options = {
    url: siteURL,
    headers: {
       'Host': url.parse(siteURL).host
      }
  };

  var headers = "";

  return request.getAsync(options)
    .then(function(args){
      if (args[0].statusCode === 200) {
        var body = args[1];
        headers = args[0].headers;
        var $ = cheerio.load(body);
        console.log('got html with title: "' + $('title').text() + '"...');
        return $;
      } else {
        console.log(args[0].statusCode + " : " + args[0].statusMessage);
        return false;
      }
    })
    .then(getItems)
    .then(function(itemsObj){
      //reduce list to the number selected
      itemsObj.headers = headers;
      return itemsObj;
    })
    .catch(function(e){
      console.error("error" + e.message);
      process.exit(1);
    });
}

module.exports = Scraper;