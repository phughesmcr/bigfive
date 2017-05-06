/**
 * bigfive
 * v0.1.3
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
 * let personality = b5(text, encoding);
 * console.log(personality)
 *
 * @param {string} str  input string
 * @param {string} enc  encoding - 'binary' or 'frequency'
 * @return {Object} object with O,C,E,A,N keys
 */

'use strict'
;(function () {
  const root = this
  const previous = root.bigfive

  const hasRequire = typeof require !== 'undefined'

  let tokenizer = root.tokenizer
  let lexicon = root.lexicon

  if (typeof _ === 'undefined') {
    if (hasRequire) {
      tokenizer = require('happynodetokenizer')
      lexicon = require('./data/lexicon.json')
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
  * @function getMatches
  * @param  {Array} arr token array
  * @param  {Object} lexicon  lexicon object
  * @return {Object}  object of matches
  */
  const getMatches = (arr, lexicon) => {
    const matches = {}
    // loop through the lexicon categories
    let cat
    for (cat in lexicon) {
      if (!lexicon.hasOwnProperty(cat)) continue
      let match = []
      // loop through words in category
      let key
      let data = lexicon[cat]
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
      matches[cat] = match
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
    lex += Number(int)
    // return final lexical value + intercept
    return Number(lex)
  }

  /**
  * @function bigfive
  * @param  {string} str input string
  * @param  {string} enc encoding string: 'binary' or 'frequency'
  * @return {Object}  object of lexical values
  */
  const bigfive = (str, enc) => {
    // return null if no string
    if (str == null) return { O: 0, C: 0, E: 0, A: 0, N: 0 }
    // make sure str is a string
    if (typeof str !== 'string') str = str.toString()
    // trim whitespace and convert to lowercase
    str = str.toLowerCase().trim()
    // option defaults
    if (enc == null) enc = 'binary'
    // convert our string to tokens
    const tokens = tokenizer(str)
    // return null on no tokens
    if (tokens == null) return { O: 0, C: 0, E: 0, A: 0, N: 0 }
    // get matches from array
    const matches = getMatches(tokens, lexicon)
    // get wordcount
    const wordcount = tokens.length
    // calculate lexical useage
    let ocean = {}
    ocean.O = calcLex(matches.O, wordcount, enc, 0)
    ocean.C = calcLex(matches.C, wordcount, enc, 0)
    ocean.E = calcLex(matches.E, wordcount, enc, 0)
    ocean.A = calcLex(matches.A, wordcount, enc, 0)
    ocean.N = calcLex(matches.N, wordcount, enc, 0)
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
