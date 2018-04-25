/**
 * bigFive
 * v3.0.0
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
 *  'locale': 'US',
 *  'logs': 3,
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

  // Lexicon data
  const lexicon = require('./data/lexicon.json');

  // External modules
  const async = require('async');
  const trans = require('british_american_translate');
  const simplengrams = require('simplengrams');
  const tokenizer = require('happynodetokenizer');
  const lexHelpers = require('lex-helpers');
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
  const bigFive = (str, opts = {}) => {
    // default options
    opts.encoding = (typeof opts.encoding !== 'undefined') ? opts.encoding : 'binary';
    opts.locale = (typeof opts.locale !== 'undefined') ? opts.locale : 'US';
    opts.logs = (typeof opts.logs !== 'undefined') ? opts.logs : 3;
    if (opts.suppressLog) opts.logs = 0;
    opts.max = (typeof opts.max !== 'undefined') ? opts.max : Number.POSITIVE_INFINITY;
    opts.min = (typeof opts.min !== 'undefined') ? opts.min : Number.NEGATIVE_INFINITY;
    if (typeof opts.max !== 'number' || typeof opts.min !== 'number') {
      // try to convert to a number
      opts.min = Number(opts.min);
      opts.max = Number(opts.max);
      // check it worked, or else default to infinity
      opts.max = (typeof opts.max !== 'number') ? opts.max : Number.POSITIVE_INFINITY;
      opts.min = (typeof opts.min !== 'number') ? opts.min : Number.NEGATIVE_INFINITY;
    }
    opts.nGrams = (typeof opts.nGrams !== 'undefined') ? opts.nGrams : [2, 3];
    if (!Array.isArray(opts.nGrams)) {
      if (opts.logs > 1) {
        console.warn('bigFive: nGrams option must be an array! ' + 
            'Defaulting to [2, 3].');
      }
      opts.nGrams = [2, 3];
    }
    opts.output = (typeof opts.output !== 'undefined') ? opts.output : 'lex';
    opts.places = (typeof opts.places !== 'undefined') ? opts.places : 9;
    opts.sortBy = (typeof opts.sortBy !== 'undefined') ? opts.sortBy : 'freq';
    opts.wcGrams = (typeof opts.wcGrams !== 'undefined') ? opts.wcGrams : false;
    // cache frequently used options
    const encoding = opts.encoding;
    const logs = opts.logs;
    const nGrams = opts.nGrams;
    const output = opts.output;
    const places = opts.places;
    const sortBy = opts.sortBy;
    // no string return null
    if (!str) {
      if (logs > 1) console.warn('bigFive: no string found. Returning null.');
      return null;
    }
    // if str isn't a string, make it into one
    if (typeof str !== 'string') str = str.toString();
    // convert to lowercase and trim whitespace 
    str = str.toLowerCase().trim();
    // translalte US English to UK English if selected
    if (opts.locale === 'GB') str = trans.uk2us(str);
    // convert our string to tokens
    let tokens = tokenizer(str, {logs: opts.logs});
    // if there are no tokens return null
    if (!tokens) {
      if (logs > 1) console.warn('bigFive: no tokens found. Returned null.');
      return null;
    }
    // get wordcount before we add ngrams
    let wordcount = tokens.length;
    // get n-grams
    if (nGrams) {
      async.each(nGrams, function(n, callback) {
        if (wordcount < n) {
          callback(`bigFive: wordcount (${wordcount}) less than n-gram value (${n}). Ignoring.`);
        } else {
          tokens = [...arr2string(simplengrams(str, n, {logs: logs})), ...tokens];
          callback();
        }
      }, function(err) {
        if (err && logs > 0) console.error('bigFive: nGram error: ', err);        
      });
    }
    // recalculate wordcount if wcGrams is true
    if (opts.wcGrams) wordcount = tokens.length;
    // get matches from array
    const matches = getMatches(itemCount(tokens), lexicon, opts.min, opts.max);
    // define intercept values
    const ints = {
      O: 0,
      C: 0,
      E: 0,
      A: 0,
      N: 0,
    };
    // returns
    if (output.match(/full/gi)) {
      // return matches and values in one object
      async.parallel({
        matches: function(callback) {
          callback(null, doMatches(matches, sortBy, wordcount, places, 
              encoding));
        },
        values: function(callback) {
          callback(null, doLex(matches, ints, places, encoding, wordcount));
        },
      }, function(err, results) {
        if (err && logs > 0) console.error(err);
        return results;
      });
    } else if (output.match(/matches/gi)) {
      // return match object if requested
      return doMatches(matches, sortBy, wordcount, places, encoding);
    } else {
      // default to lexical values
      if (!output.match(/lex/gi) && logs > 1) {
        console.warn('bigFive: output option ("' + output +
            '") is invalid, defaulting to "lex".');
      }
      return doLex(matches, ints, places, encoding, wordcount);
    }
  };

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = bigFive;
    }
    exports.bigFive = bigFive;
  } else {
    global.bigFive = bigFive;
  }
})();
