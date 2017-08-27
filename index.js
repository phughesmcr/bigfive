/**
 * bigFive
 * v1.0.0-rc.3
 *
 * Analyse the Five Factor Model ("Big Five") personality traits from strings.
 *
 * Help me make this better:
 * https://github.com/phugh/bigFive
 *
 * Using the Big Five lexica data from http://www.wwbp.org/ under the
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported licence
 *
 * (C) 2017 P. Hughes
 * Licence : Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 * http://creativecommons.org/licenses/by-nc-sa/3.0/
 *
 * Usage example:
 * const bf = require('bigFive');
 * const options = { // These are the default options
 *  'encoding': 'binary',
 *  'max': Number.POSITIVE_INFINITY,
 *  'min': Number.NEGATIVE_INFINITY,
 *  'nGrams': true,
 *  'output': 'ocean',
 *  'places': 9,
 *  'sortBy': 'freq',
 *  'wcGrams': false,
 * };
 * const string = 'A big long string of text...';
 * const personality = bf(string, options);
 * console.log(personality);
 *
 * See README.md for help and valid options.
 *
 * @param {string} str input string
 * @param {Object} opts options object
 * @return {Object} object with O, C, E, A, N keys
 */

'use strict'
;(function() {
  const global = this;
  const previous = global.bigFive;

  let lexHelpers = global.lexHelpers;
  let lexicon = global.lexicon;
  let simplengrams = global.simplengrams;
  let tokenizer = global.tokenizer;

  if (typeof lexicon === 'undefined') {
    if (typeof require !== 'undefined') {
      lexHelpers = require('lex-helpers');
      lexicon = require('./data/lexicon.json');
      simplengrams = require('simplengrams');
      tokenizer = require('happynodetokenizer');
    } else throw new Error('bigFive required modules not found!');
  }

  const arr2string = lexHelpers.arr2string;
  const calcLex = lexHelpers.calcLex;
  const getMatches = lexHelpers.getMatches;
  const prepareMatches = lexHelpers.prepareMatches;

  /**
   * @function doMatches
   * @param  {Object} matches   lexical matches object
   * @param  {string} sortBy    how to sort arrays
   * @param  {number} wordcount total word count
   * @param  {number} places    decimal places limit
   * @param  {string} encoding  type of lexical encoding
   * @return {Object} sorted matches object
   */
  const doMatches = (matches, sortBy, wordcount, places, encoding) => {
    const match = {};
    match.O = prepareMatches(matches.O, sortBy, wordcount, places, encoding);
    match.C = prepareMatches(matches.C, sortBy, wordcount, places, encoding);
    match.E = prepareMatches(matches.E, sortBy, wordcount, places, encoding);
    match.A = prepareMatches(matches.A, sortBy, wordcount, places, encoding);
    match.N = prepareMatches(matches.N, sortBy, wordcount, places, encoding);
    return match;
  };

  /**
   * @function doLex
   * @param  {Object} matches   lexical matches object
   * @param  {number} int       intercept value
   * @param  {number} places    decimal places limit
   * @param  {string} encoding  type of lexical encoding
   * @param  {number} wordcount total word count
   * @return {Object} lexical values object
   */
  const doLex = (matches, int, places, encoding, wordcount) => {
    const values = {};
    values.O = calcLex(matches.O, int, places, encoding, wordcount);
    values.C = calcLex(matches.C, int, places, encoding, wordcount);
    values.E = calcLex(matches.E, int, places, encoding, wordcount);
    values.A = calcLex(matches.A, int, places, encoding, wordcount);
    values.N = calcLex(matches.N, int, places, encoding, wordcount);
    return values;
  };

  /**
  * @function bigFive
  * @param  {string} str    input string
  * @param  {Object} opts   options object
  * @return {Object} object of lexical values
  */
  const bigFive = (str, opts) => {
    // no string return null
    if (!str) {
      console.error('bigFive: no input found! Returning null.');
      return null;
    }
    // if str isn't a string, make it into one
    if (typeof str !== 'string') str = str.toString();
    // trim whitespace and convert to lowercase
    str = str.toLowerCase().trim();
    // options defaults
    if (!opts || typeof opts !== 'object') {
      opts = {
        'encoding': 'binary',
        'max': Number.POSITIVE_INFINITY,
        'min': Number.NEGATIVE_INFINITY,
        'nGrams': true,
        'output': 'ocean',
        'places': 9,
        'sortBy': 'freq',
        'wcGrams': false,
      };
    }
    opts.encoding = opts.encoding || 'binary';
    opts.max = opts.max || Number.POSITIVE_INFINITY;
    opts.min = opts.min || Number.NEGATIVE_INFINITY;
    opts.nGrams = opts.nGrams || true;
    opts.output = opts.output || 'ocean';
    opts.places = opts.places || 9;
    opts.sortBy = opts.sortBy || 'freq';
    opts.wcGrams = opts.wcGrams || false;
    const encoding = opts.encoding;
    const output = opts.output;
    const places = opts.places;
    const sortBy = opts.sortBy;
    // convert our string to tokens
    let tokens = tokenizer(str);
    // if there are no tokens return null
    if (!tokens) {
      console.warn('bigFive: no tokens found. Returned null.');
      return null;
    }
    // get wordcount before we add ngrams
    let wordcount = tokens.length;
    // get n-grams
    if (opts.nGrams) {
      const bigrams = arr2string(simplengrams(str, 2));
      const trigrams = arr2string(simplengrams(str, 3));
      tokens = tokens.concat(bigrams, trigrams);
    }
    // recalculate wordcount if wcGrams is true
    if (opts.wcGrams) wordcount = tokens.length;
    // get matches from array
    const matches = getMatches(tokens, lexicon, opts.min, opts.max);
    let ocean = {};
    if (output === 'full') {
      // return one object with both matches and values
      ocean.matches = doMatches(matches, sortBy, wordcount, places, encoding);
      ocean.values = doLex(matches, 0, places, encoding, wordcount);
    } else if (output === 'matches') {
      // return match object if requested
      ocean = doMatches(matches, sortBy, wordcount, places, encoding);
    } else {
      // return lexical useage
      if (output !== 'ocean') {
        console.warn('bigFive: output option ("' + output +
            '") is invalid, defaulting to "ocean".');
      }
      ocean = doLex(matches, 0, places, encoding, wordcount);
    }
    // return ocean object
    return ocean;
  };

  bigFive.noConflict = function() {
    global.bigFive = previous;
    return bigFive;
  };

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = bigFive;
    }
    exports.bigFive = bigFive;
  } else {
    global.bigFive = bigFive;
  }
}).call(this);
