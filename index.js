/**
 * bigfive
 * v0.0.1
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
 * const encoding = 'binary' // 'binary' or 'frequency'
 * let personality = b5(text, encoding);
 * console.log(personality)
 *
 * @param {string} str  {input string}
 * @param {string} enc {encoding - 'binary' or 'frequency'}
 * @return {object} {object of Big 5 values}
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
    var idxs = []
    for (var i = this.length - 1; i >= 0; i--) {
      if (this[i] === el) {
        idxs.unshift(i)
      }
    }
    return idxs
  }

  /**
  * @function getMatches
  * @param  {arr} arr       {token array}
  * @param  {obj} lexicon   {lexicon object}
  * @return {object} {object of matches}
  */
  const getMatches = (arr, lexicon) => {
    let matches = {}

    // loop through the lexicon categories
    for (let cat in lexicon) {
      if (!lexicon.hasOwnProperty(cat)) continue
      let match = []
      // loop through words in category
      for (let key in lexicon[cat]) {
        if (!lexicon[cat].hasOwnProperty(key)) continue
        let weight = lexicon[cat][key]
        // if word from input matches word from lexicon ...
        if (arr.indexOf(key) > -1) {
          let item
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
  * @param  {object} obj      {matches object}
  * @param  {number} wc       {wordcount}
  * @param  {string} encoding {word encoding: 'binary' or 'frequency'}
  * @param  {number} int      {intercept value}
  * @return {number} {lexical value}
  */
  const calcLex = (obj, wc, enc, int) => {
    let counts = []   // number of matched objects
    let weights = []  // weights of matched objects

    // loop through the matches and get the word frequency (counts) and weights
    for (let key in obj) {
      if (!obj.hasOwnProperty(key)) continue
      if (Array.isArray(obj[key][0])) { // if the first item in the match is an array, the item is a duplicate
        counts.push(obj[key][0].length) // for duplicate matches
      } else {
        counts.push(1)                  // for non-duplicates
      }
      weights.push(obj[key][1])         // corresponding weight
    }

    // calculate lexical usage value
    let sums = []
    counts.forEach(function (a, b) {
      let sum
      if (enc === 'frequency') {
        // (word frequency / total word count) * weight
        sum = (a / wc) * weights[b]
      } else {
        // weight + weight + weight etc
        sum = weights[b]
      }
      sums.push(sum)
    })

    // get sum of values
    let lex
    lex = sums.reduce(function (a, b) { return a + b }, 0)

    // add the intercept value
    lex = Number(lex) + Number(int)

    // return final lexical value
    return lex
  }

  const bigfive = (str, enc) => {
    // return null if no string
    if (str == null) return null

    str = str.toLowerCase().trim()

    // option defaults
    if (enc == null) enc = 'binary'
    enc = enc || 'binary'

    // convert our string to tokens
    const tokens = tokenizer(str)

    // return null on no tokens
    if (tokens == null) return null

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
