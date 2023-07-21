const { stringSimilarity } = require('string-similarity-js');

/**
 * @param {*} searchInArray pass the array which you want to search into
 * @param {*} searchForString pass the string which you wanna find its similarities
 * @returns {*} an array of objects
 * @On_Succeed 
 *  returns an array of objects with the similar objects _as a plain objects_
 *  _under the 'data' key_ and the score of how similar they are in the range of [0.4, 1] 
 *  _under the 'score' key_.
 * @On_Failure
 *  otherwise, if Failed to find any similar data then return an array containing only one object
 *  with the failure message _under the 'message' key_, and a code of 0 _under the 'code' key_.
 * @Note on Succes the returned array is ordered from the most similar _or exact_ to the less similar
 */

module.exports = (searchInArray, searchForString) => {
    // initialize the array which we are going to store the similar objects in
    let similarArray = [];
    // determin that the search string is at least three charechters
    if(searchForString.length < 3)
        throw new Error('The search string should be three charechters at lest')
    // iterate on all our stored data bassed on the name and check for the similarity with the search string
    searchInArray.forEach(element => {
        // store the score of the similarity
        const score = stringSimilarity(element.name, searchForString);
        // save only the objects with similarity score above 0.4
        if(score > 0.4)
            similarArray.push({data: element, score: score});
    });
    // if there were similar objects store them in DESCENDING order, so the most similar will be the first and so on
    if(similarArray.length > 0)
        similarArray = similarArray.sort((first, second) => second.score - first.score);
    // if there were no similar object then return a failer message with a score of 0
    if(similarArray.length === 0)
        similarArray.push({message: 'Search failed finding any similar data, try with a better guess', score: 0});
    // Finally, return the similarity array
    return similarArray;
}