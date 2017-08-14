/**
 * bigfive
 * v0.4.0
 *
 * Analyse Big Five personality traits from strings.
 *
 * Help me make this better:
 * https://github.com/phugh/bigfive
 *
 * Using the Big Five lexica data from http://www.wwbp.org/data.html
 * Used under the Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported licence
 *
 * (C) 2017 P. Hughes
 * Licence : Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 * http://creativecommons.org/licenses/by-nc-sa/3.0/
 *
 * Usage example:
 * const b5 = require('bigfive');
 * const str = "A big long string of text...";
 * const personality = b5(str);
 * console.log(personality)
 *
 * @param {string} str input string
 * @return {Object} object with O,C,E,A,N keys
 */

'use strict'
;(function () {
  const root = this
  const previous = root.bigfive

  let lexicon = root.lexicon
  let simplengrams = root.simplengrams
  let tokenizer = root.tokenizer

  if (typeof lexicon === 'undefined') {
    if (typeof require !== 'undefined') {
      lexicon = require('./data/lexicon.json')
      simplengrams = require('simplengrams')
      tokenizer = require('happynodetokenizer')
    } else throw new Error('bigfive requires happynodetokenizer and simplengrams, and ./data/lexicon.json')
  }

  /**
   * Get the indexes of duplicate elements in an array
   * @function indexesOf
   * @param  {Array} arr input array
   * @param  {string} el element to test against
   * @return {Array} array of indexes
   */
  const indexesOf = (arr, el) => {
    const idxs = []
    let i = arr.length
    while (i--) {
      if (arr[i] === el) {
        idxs.unshift(i)
      }
    }
    return idxs
  }

  /**
   * Combines multidimensional array elements into strings
   * @function arr2string
   * @param  {Array} arr input array
   * @return {Array} output array
   */
  const arr2string = arr => {
    let i = 0
    const len = arr.length
    const result = []
    for (i; i < len; i++) {
      result.push(arr[i].join(' '))
    }
    return result
  }

  /**
  * Loop through lexicon and match against array
  * @function getMatches
  * @param  {Array} arr token array
  * @return {Object} object of matches
  */
  const getMatches = arr => {
    // error prevention
    if (arr == null) return null
    // loop through categories in lexicon
    const matches = {}
    let category
    for (category in lexicon) {
      if (!lexicon.hasOwnProperty(category)) continue
      let match = []
      let word
      let data = lexicon[category]
      // loop through words in category
      for (word in data) {
        if (!data.hasOwnProperty(word)) continue
        let weight = data[word]
        // if word from input matches word from lexicon ...
        if (arr.indexOf(word) > -1) {
          let count = indexesOf(arr, word).length // number of times the word appears in the input text
          match.push([word, count, weight])
        }
      }
      matches[category] = match
    }
    return matches
  }

  /**
  * Calculate the total lexical value of matches
  * @function calcLex
  * @param {Object} obj matches object
  * @return {number} lexical value
  */
  const calcLex = obj => {
    if (obj == null) return null
    let lex = 0
    let word
    for (word in obj) {
      if (!obj.hasOwnProperty(word)) continue
      // weight + weight + weight etc
      lex += Number(obj[word][2])
    }
    return lex
  }

  /**
  * @function bigfive
  * @param {string} str input string
  * @return {Object} object of lexical values
  */
  const bigfive = str => {
    // error prevention
    if (str == null) return null
    if (typeof str !== 'string') str = str.toString()
    // trim whitespace and convert to lowercase
    str = str.toLowerCase().trim()
    // convert our string to tokens
    let tokens = tokenizer(str)
    // return null on no tokens
    if (tokens == null) return null
    // get n-grams
    const ngrams = []
    ngrams.push(arr2string(simplengrams(str, 2)))
    ngrams.push(arr2string(simplengrams(str, 3)))
    const nLen = ngrams.length
    let i = 0
    for (i; i < nLen; i++) {
      tokens = tokens.concat(ngrams[i])
    }
    // get matches from array
    const matches = getMatches(tokens, lexicon)
    // calculate lexical useage
    let ocean = {}
    ocean.O = calcLex(matches.O)
    ocean.C = calcLex(matches.C)
    ocean.E = calcLex(matches.E)
    ocean.A = calcLex(matches.A)
    ocean.N = calcLex(matches.N)
    // return wellbeing object
    return ocean
  }

  bigfive.noConflict = function () {
    root.bigfive = previous
    return bigfive
  }

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = bigfive
    }
    exports.bigfive = bigfive
  } else {
    root.bigfive = bigfive
  }
}).call(this)
