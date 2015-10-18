var url = require('url');
var deDupe = require('./dedupe.js');

/**
 * Remove all Search/Query and Hash parts of a url string
 * @param  {String} href
 * @return {String}
 */
function stripQueryHash(href) {
  var result = href;
  
  var locQ = href.indexOf('?');
  if (locQ >= 0) {
    result = href.slice(0, locQ);
  }

  var locH = href.indexOf('#');
  if (locH >= 0) {
    result = href.slice(0, locH);
  }
  
  return result;
}

/**
 * Checks if a url string uses HTTP protocol
 * @param  {String} href
 * @return {Boolean}
 */
function isHTTP(href){
  return href.indexOf('http') === 0;
}

/**
 * Just does simple string === comparison for now.  Separated into its own
 * function for code clarity and also possible future ease of change
 * @param  {String}
 * @param  {String}
 * @return {Boolean}
 */
function isSameDomain(originHost, href) {
  return originHost === href;
}

/**
 * Removes a trailing slash from a string.  Pretty self-explanatory
 * @param  {String} str
 * @return {String}
 */
function removeTrailingSlash(str){
  var lastChar = str.substr(str.length - 1);
  if (lastChar === '/') {
    return str.slice(0, -1);
  }
  return str;
}

/**
 * Takes array of links and remove extra unecessary parts and removed duplicates
 * @param  {String} domain
 * @param  {Array} link_array
 * @return {Array}
 */
function validateLinks(domain, link_array){
  var validatedArray = [];
  var baseURL = url.parse(domain);
  var currentURL,
      currentItem;

  link_array.forEach(function(el,i,aar){
    var currentURL = url.parse(el);
    currentItem = stripQueryHash(el);
    if (isHTTP(currentItem) && isSameDomain(baseURL.host, currentURL.host)) {
      currentItem = removeTrailingSlash(currentItem);
      validatedArray.push(currentItem);
    }
  });

  return deDupe(validatedArray);
}

module.exports = validateLinks;