/**
 * bigFive
 * v1.0.0-rc.2
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

  let lexicon = global.lexicon;
  let simplengrams = global.simplengrams;
  let tokenizer = global.tokenizer;
  let lexHelpers = global.lexHelpers;

  if (typeof lexicon === 'undefined') {
    if (typeof require !== 'undefined') {
      lexicon = require('./data/lexicon.json');
      simplengrams = require('simplengrams');
      tokenizer = require('happynodetokenizer');
      lexHelpers = require('lex-helpers');
    } else throw new Error('bigFive required modules not found!');
  }

  const arr2string = lexHelpers.arr2string;
  const prepareMatches = lexHelpers.prepareMatches;
  const getMatches = lexHelpers.getMatches;
  const calcLex = lexHelpers.calcLex;

  /**
  * @function bigFive
  * @param {string} str input string
  * @param {Object} opts options object
  * @return {Object} object of lexical values
  */
  const bigFive = (str, opts) => {
    // no string return null
    if (!str) {
      console.error('bigFive: no string found. Aborting.');
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
    const ocean = {};
    if (output === 'full') {
      // return one object with both matches and values
      ocean.matches = {};
      ocean.values = {};
      ocean.values.O = calcLex(matches.O, 0, places, encoding, wordcount);
      ocean.values.C = calcLex(matches.C, 0, places, encoding, wordcount);
      ocean.values.E = calcLex(matches.E, 0, places, encoding, wordcount);
      ocean.values.A = calcLex(matches.A, 0, places, encoding, wordcount);
      ocean.values.N = calcLex(matches.N, 0, places, encoding, wordcount);
      ocean.matches.O = prepareMatches(matches.O, sortBy, wordcount, places,
          encoding);
      ocean.matches.C = prepareMatches(matches.C, sortBy, wordcount, places,
          encoding);
      ocean.matches.E = prepareMatches(matches.E, sortBy, wordcount, places,
          encoding);
      ocean.matches.A = prepareMatches(matches.A, sortBy, wordcount, places,
          encoding);
      ocean.matches.N = prepareMatches(matches.N, sortBy, wordcount, places,
          encoding);
    } else if (output === 'matches') {
      // return match object if requested
      ocean.O = prepareMatches(matches.O, sortBy, wordcount, places, encoding);
      ocean.C = prepareMatches(matches.C, sortBy, wordcount, places, encoding);
      ocean.E = prepareMatches(matches.E, sortBy, wordcount, places, encoding);
      ocean.A = prepareMatches(matches.A, sortBy, wordcount, places, encoding);
      ocean.N = prepareMatches(matches.N, sortBy, wordcount, places, encoding);
    } else {
      // return lexical useage
      if (output !== 'ocean') {
        console.warn('bigFive: output option ("' + output +
            '") is invalid, defaulting to "ocean".');
      }
      ocean.O = calcLex(matches.O, 0, places, encoding, wordcount);
      ocean.C = calcLex(matches.C, 0, places, encoding, wordcount);
      ocean.E = calcLex(matches.E, 0, places, encoding, wordcount);
      ocean.A = calcLex(matches.A, 0, places, encoding, wordcount);
      ocean.N = calcLex(matches.N, 0, places, encoding, wordcount);
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
