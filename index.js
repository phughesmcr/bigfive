/**
 * bigFive
 * v2.0.1
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
 *  'nGrams': [2, 3],
 *  'output': 'lex',
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

(function() {
  'use strict';
  const global = this;
  const previous = global.bigFive;

  let async = global.async;
  let lexHelpers = global.lexHelpers;
  let lexicon = global.lexicon;
  let simplengrams = global.simplengrams;
  let tokenizer = global.tokenizer;

  if (typeof lexicon === 'undefined') {
    if (typeof require !== 'undefined') {
      async = require('async');
      lexHelpers = require('lex-helpers');
      lexicon = require('./data/lexicon.json');
      simplengrams = require('simplengrams');
      tokenizer = require('happynodetokenizer');
    } else throw new Error('bigFive: required modules not found!');
  }

  const arr2string = lexHelpers.arr2string;
  const doLex = lexHelpers.doLex;
  const doMatches = lexHelpers.doMatches;
  const getMatches = lexHelpers.getMatches;
  const itemCount = lexHelpers.itemCount;

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
      console.warn('bigFive: using default options.');
      opts = {
        'encoding': 'binary',
        'max': Number.POSITIVE_INFINITY,
        'min': Number.NEGATIVE_INFINITY,
        'nGrams': [2, 3],
        'output': 'lex',
        'places': 9,
        'sortBy': 'freq',
        'wcGrams': false,
      };
    }
    opts.encoding = opts.encoding || 'binary';
    opts.max = opts.max || Number.POSITIVE_INFINITY;
    opts.min = opts.min || Number.NEGATIVE_INFINITY;
    opts.nGrams = opts.nGrams || [2, 3];
    opts.output = opts.output || 'lex';
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
      console.warn('bigFive: no tokens found. Returning null.');
      return null;
    }
    // get wordcount before we add ngrams
    let wordcount = tokens.length;
    // get n-grams
    if (opts.nGrams && wordcount > 2) {
      async.each(opts.nGrams, function(n, callback) {
        if (n < wordcount) {
          tokens = tokens.concat(
            arr2string(simplengrams(str, n))
          );
        } else {
          console.warn('bigFive: wordcount less than n-gram value "' + n +
              '". Ignoring.');
        }
        callback();
      }, function(err) {
        if (err) console.error(err);
      });
    }
    // recalculate wordcount if wcGrams is true
    if (opts.wcGrams) wordcount = tokens.length;
    // reduce tokens to count item
    tokens = itemCount(tokens);
    // get matches from array
    const matches = getMatches(tokens, lexicon, opts.min, opts.max);
    // define intercept values
    const ints = {
      O: 0,
      C: 0,
      E: 0,
      A: 0,
      N: 0,
    };
    // returns
    if (output === 'full') {
      // return matches and values in one object
      let full;
      async.parallel({
        matches: function(callback) {
          callback(null, doMatches(matches, sortBy, wordcount, places, 
              encoding));
        },
        values: function(callback) {
          callback(null, doLex(matches, ints, places, encoding, wordcount));
        },
      }, function(err, results) {
        if (err) console.error(err);
        full = results;
      });
      return full;
    } else if (output === 'matches') {
      // return match object if requested
      return doMatches(matches, sortBy, wordcount, places, encoding);
    } else {
      // return lexical useage
      if (output !== 'lex') {
        console.warn('bigFive: output option ("' + output +
            '") is invalid, defaulting to "lex".');
      }
      return doLex(matches, places, encoding, wordcount);
    }
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
