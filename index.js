/**
 * bigfive
 * v0.3.0
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
  let natural = root.natural
  let tokenizer = root.tokenizer

  if (typeof lexicon === 'undefined') {
    if (typeof require !== 'undefined') {
      lexicon = require('./data/lexicon.json')
      natural = require('natural')
      tokenizer = require('happynodetokenizer')
    } else throw new Error('bigfive requires node modules happynodetokenizer and natural, and ./data/lexicon.json')
  }

  // Find how many times an element appears in an array
  Array.prototype.indexesOf = function (el) {
    const idxs = []
    let i = this.length - 1
    for (i; i >= 0; i--) {
      if (this[i] === el) {
        idxs.unshift(i)
      }
    }
    return idxs
  }

  /**
  * Get all the n-grams of a string and return as an array
  * @function getNGrams
  * @param {string} str input string
  * @param {number} n abitrary n-gram number, e.g. 2 = bigrams
  * @return {Array} array of ngram strings
  */
  const getNGrams = (str, n) => {
    // default to bi-grams on null n
    if (n == null) n = 2
    if (typeof n !== 'number') n = Number(n)
    const ngrams = natural.NGrams.ngrams(str, n)
    const len = ngrams.length
    const result = []
    let i = 0
    for (i; i < len; i++) {
      result.push(ngrams[i].join(' '))
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
          let count = arr.indexesOf(word).length // number of times the word appears in the input text
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
    const bigrams = getNGrams(str, 2)
    const trigrams = getNGrams(str, 3)
    tokens = tokens.concat(bigrams, trigrams)
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
