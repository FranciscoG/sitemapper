/*
  
  some notes:
  
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