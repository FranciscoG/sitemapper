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

module.exports = deDupeArray;