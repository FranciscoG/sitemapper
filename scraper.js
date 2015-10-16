var cheerio = require('cheerio');
var Bluebird = require('bluebird');
var url = require('url');
var request = Bluebird.promisifyAll(require('request'));

var BaseUrl = "";

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

function isDef(x) {
  return typeof x !== 'undefined' && x !== null && x !== "";
}

/**
 * get all the download links, images, and pdfs on a page
 * @param {Object} $  Cheerio object. jquery-like $ object with document already loaded
 * @return {Object}
 * @return {Array} Object.links  Array of links
 * @return {Array} Object.images Array of images
 * @return {Array} Object.pdfs   Array of PDFs
 */
function getItems($){
  var result = { links : [], images : [], pdfs : [] };
  if (!$) { return result; }
  
  var links = [];
  var images = [];
  var pdfs = [];
  var current = "";

  $('a').each(function(i, elem){
    current = $(this).attr('href');
    if (isDef(current)) {
      if (current.indexOf('.pdf') > 0) {
        pdfs.push(current);
      } else {
        links.push(url.resolve(BaseUrl, current));
      }
    }
  });

  current = "";
  $('img').each(function(i, elem){
    current = $(this).attr('src');
    if (isDef(current)) {
      images.push(current);
    }
  });

  result.links = deDupeArray(links);
  result.images = deDupeArray(images);
  result.pdfs = deDupeArray(pdfs);
  return result;
}

/**
 * sends the request to a url
 * @param String siteURL
 */
function Scraper(siteURL){
  //get the HTML for the page

  var _url = url.parse(siteURL);
  BaseUrl =  _url.protocol + '//' + _url.host;

  var options = {
    url: siteURL,
    headers: {
       'Host': _url.host
      }
  };

  var headers = "";

  return request.getAsync(options)
    .then(function(args){
      if (args[0].statusCode === 200) {
        var body = args[1];
        headers = args[0].headers;
        var $ = cheerio.load(body);
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