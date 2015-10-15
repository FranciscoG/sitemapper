var cheerio = require('cheerio');
var Bluebird = require('bluebird');
var url = require('url');
var request = Bluebird.promisifyAll(require('request'));


/**
 * get all the download links on a page
 * @param Cheerio object. jquery-like $ object with document already loaded
 * @return Array of href addresses
 */
function getAllLinks($){
  if (!$) { return false; }
  console.log('getting links from html...');
  var links = [];
  $('a').each(function(i, elem){
    links.push($(this).attr('href'));
  });
  return links;
}

/**
 * sends the request to a url
 * @param String siteURL
 */
function getLinks(siteURL){
  //get the HTML for the page
  console.log('requesting page...');
  
  var options = {
    url: siteURL,
    headers: {
       'Host': url.parse(siteURL).host
      }
  };

  return request.getAsync(options)
    .then(function(args){
      console.log(args[0]);
      if (args[0].statusCode === 200) {
        var body = args[1];
        var $ = cheerio.load(body);
        console.log('got html with title: "' + $('title').text() + '"...');
        return $;
      } else {
        console.log(args[0].statusCode + " : " + args[0].statusMessage);
        return false;
      }

    })
    .then(getAllLinks)
    .then(function(links){
      if (!links) { return "error reaching url"; }
      //reduce list to the number selected
      return links;
    })
    .catch(function(e){
      console.error("error" + e.message);
      process.exit(1);
    });
}



module.exports = {
  getLinks : getLinks
};