/**
 * bigfive
 * v0.2.0
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
 * const text = "A big long string of text...";
 * const encoding = 'binary'  // 'binary' or 'frequency'
 * const opts = {
 *  "encoding": 'binary', // 'binary' (default) or 'frequency'
 *  "bigrams": true,      // match against bigrams in lexicon (not recommended for large strings)
 *  "trigrams": true      // match against trigrams in lexicon (not recommended for large strings)
 * }
 * const personality = b5(text, opts);
 * console.log(personality)
 *
 * @param {string} str  input string
 * @param {Object} opts options object
 * @return {Object} object with O,C,E,A,N keys
 */

'use strict'
;(function () {
  const root = this
  const previous = root.bigfive

  let tokenizer = root.tokenizer
  let lexicon = root.lexicon
  let natural = root.natural

  if (typeof tokenizer === 'undefined') {
    const hasRequire = typeof require !== 'undefined'
    if (hasRequire) {
      tokenizer = require('happynodetokenizer')
      lexicon = require('./data/lexicon.json')
      natural = require('natural')
    } else throw new Error('bigfive required happynodetokenizer and lexica.')
  }

  // get number of times el appears in an array
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
  * @function getBigrams
  * @param  {string} str input string
  * @return {Array} array of bigram strings
  */
  const getBigrams = str => {
    const NGrams = natural.NGrams
    const bigrams = NGrams.bigrams(str)
    const result = []
    const len = bigrams.length
    let i = 0
    for (i; i < len; i++) {
      result.push(bigrams[i].join(' '))
    }
    return result
  }

  /**
  * @function getTrigrams
  * @param  {string} str input string
  * @return {Array} array of trigram strings
  */
  const getTrigrams = str => {
    const NGrams = natural.NGrams
    const trigrams = NGrams.trigrams(str)
    const result = []
    const len = trigrams.length
    let i = 0
    for (i; i < len; i++) {
      result.push(trigrams[i].join(' '))
    }
    return result
  }

  /**
  * @function getMatches
  * @param  {Array} arr token array
  * @param  {Object} lexicon  lexicon object
  * @return {Object}  object of matches
  */
  const getMatches = (arr, lexicon) => {
    const matches = {}
    // loop through the lexicon categories
    let category
    for (category in lexicon) {
      if (!lexicon.hasOwnProperty(category)) continue
      let match = []
      // loop through words in category
      let data = lexicon[category]
      let key
      for (key in data) {
        if (!data.hasOwnProperty(key)) continue
        // if word from input matches word from lexicon ...
        if (arr.indexOf(key) > -1) {
          let item
          let weight = data[key]
          let reps = arr.indexesOf(key).length // numbder of times the word appears in the input text
          if (reps > 1) { // if the word appears more than once, group all appearances in one array
            let words = []
            for (let i = 0; i < reps; i++) {
              words.push(key)
            }
            item = [words, weight]
          } else {
            item = [key, weight]
          }
          match.push(item)
        }
      }
      matches[category] = match
    }
    // return matches object
    return matches
  }

  /**
  * @function calcLex
  * @param  {Object} obj      matches object
  * @param  {number} wc       wordcount
  * @param  {string} encoding word encoding: 'binary' or 'frequency'
  * @param  {number} int      intercept value
  * @return {number} lexical value
  */
  const calcLex = (obj, wc, enc, int) => {
    const counts = []   // number of matched objects
    const weights = []  // weights of matched objects
    // loop through the matches and get the word frequency (counts) and weights
    let key
    for (key in obj) {
      if (!obj.hasOwnProperty(key)) continue
      if (Array.isArray(obj[key][0])) { // if the first item in the match is an array, the item is a duplicate
        counts.push(obj[key][0].length) // for duplicate matches
      } else {
        counts.push(1)                  // for non-duplicates
      }
      weights.push(obj[key][1])         // corresponding weight
    }
    // calculate lexical usage value
    let lex = 0
    let i
    const len = counts.length
    const words = Number(wc)
    for (i = 0; i < len; i++) {
      let weight = Number(weights[i])
      if (enc === 'frequency') {
        let count = Number(counts[i])
        // (word frequency / total word count) * weight
        lex += (count / words) * weight
      } else {
        // weight + weight + weight etc
        lex += weight
      }
    }
    // add intercept value
    lex += int
    // return final lexical value
    return lex
  }

  /**
  * @function bigfive
  * @param  {string} str input string
  * @param  {Object} opts options object
  * @return {Object}  object of lexical values
  */
  const bigfive = (str, opts) => {
    // return null if no string
    if (str == null) return null
    // make sure str is a string
    if (typeof str !== 'string') str = str.toString()
    // trim whitespace and convert to lowercase
    str = str.toLowerCase().trim()
    // option defaults
    if (opts == null) {
      opts = {
        'encoding': 'binary',    // lexicon to analyse against
        'bigrams': true,      // match bigrams?
        'trigrams': true      // match trigrams?
      }
    }
    opts.lang = opts.encoding || 'binary'
    // convert our string to tokens
    let tokens = tokenizer(str)
    // return null on no tokens
    if (tokens == null || tokens.length === 0) return { O: 0, C: 0, E: 0, A: 0, N: 0 }
    // get wordcount before we add bigrams and trigrams
    const wordcount = tokens.length
    // handle bigrams if wanted
    if (opts.bigrams) {
      const bigrams = getBigrams(str)
      tokens = tokens.concat(bigrams)
    }
    // handle trigrams if wanted
    if (opts.trigrams) {
      const trigrams = getTrigrams(str)
      tokens = tokens.concat(trigrams)
    }
    // get matches from array
    const matches = getMatches(tokens, lexicon)
    // calculate lexical useage
    let ocean = {}
    ocean.O = calcLex(matches.O, wordcount, opts.encoding, 0)
    ocean.C = calcLex(matches.C, wordcount, opts.encoding, 0)
    ocean.E = calcLex(matches.E, wordcount, opts.encoding, 0)
    ocean.A = calcLex(matches.A, wordcount, opts.encoding, 0)
    ocean.N = calcLex(matches.N, wordcount, opts.encoding, 0)
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
