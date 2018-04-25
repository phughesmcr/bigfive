# bigFive - Node.js based Big Five personality assessment!

Analyse the Five Factor Model ("Big Five") personality traits from strings.

Find matches in text for the top 100 correlated words from each of the five domains (see ./data/lexicon.json) and output a weighted lexical value for each.

## Usage
```javascript
const bf = require('bigfive');
const opts = {   // These are the default options
 'encoding': 'binary',
 'locale': 'US',
 'logs': 3,
 'max': Number.POSITIVE_INFINITY,
 'min': Number.NEGATIVE_INFINITY,
 'nGrams': 'true',
 'output': 'lex',
 'places': 9,
 'sortBy': 'lex',
 'wcGrams': 'false',
};
const str = 'A big long string of text...';
const personality = bf(str, opts);
console.log(personality)
```

## Default Output
By default, bigFive outputs an object with O,C,E,A,N keys and lexical values:
```Javascript
{
  O: 0.54912291,
  C: 0.01722187,
  E: -0.3090625,
  A: 0.01562812,
  N: 0.00849375
}
```
Errors return null

## The Options Object

The options object is optional and provides a number of controls to allow you to tailor the output to your needs. However, for general use it is recommended that all options are left to their defaults.

### 'encoding'

**String - valid options: 'binary' (default), 'freq', or 'percent**

Controls how the lexical value is calculated. **You probably shouldn't change this!**

Binary is simply the addition of lexical weights, i.e. word1 + word2 + word3.

Frequency encoding takes the overall wordcount and word frequency into account, i.e. (word frequency / word count) * weight.

Percent returns the percentage of token matches in each category as a decimal, i.e. 0.48 - 48%.

### 'max' and 'min'

**Float**

Exclude words that have weights above the max threshold or below the min threshold.

By default these are set to infinity, ensuring that no words from the lexicon are excluded.

### 'nGrams'

**Array - [2, 3] (default)**

n-Grams are contiguous pieces of text, bi-grams being chunks of 2, tri-grams being chunks of 3, etc.

[2, 3] the default option, means "include bi-grams and trigrams", if you only wanted to inclue bi-grams for example, you would use [2].

Use the nGrams option to control the n-gram lengths included. For accuracy it is recommended that n-grams are set to the default of [2, 3], however including n-grams for very long strings can detrement performance.

### 'locale'
**String - valid options: 'US' (default), 'GB'**
The lexicon data is in American English (US), if the string(s) you want to analyse are in British English set the locale option to 'GB'.

### 'logs'
**Number - valid options: 0, 1, 2, 3 (default)**
Used to control console.log, console.warn, and console.error outputs.
* 0 = suppress all logs
* 1 = print errors only
* 2 = print errors and warnings
* 3 = print all console logs

### 'output'

**String - valid options: 'lex' (default), 'matches', 'full'**

'lex' (default) returns an object with O,C,E,A,N keys and lexical value properties - see 'default output example' above.

'matches' returns an object with O,C,E,A,N keys, each with an array of lexical match information within. See 'matches output example' below.

'full' returns both of the above in one object with two keys, 'values' and 'matches'. 'values' = the 'ocean' object above. 'matches' = the matches object above.

### 'places'

**Number**

Number of decimal places to limit outputted values to.

The default is 9 decimal places.

### 'sortBy'

**String - valid options: 'freq' (default), 'weight', or 'lex'**

If 'output' = 'matches', this option can be used to control how the outputted array is sorted.

'lex' (default) sorts by final lexical value, (N.B. when using binary encoding [see 'encoding' above] the lexical value and the weight are identical).

'weight' sorts the array by the matched words initial weight.

'freq' sorts by word frequency, i.e. the most used words appear first.

### 'wcGrams'

**String - valid options: 'true' or 'false' (default)**

When set to true, the output from the nGrams option will be added to the word count.

For accuracy it is recommended that this is set to false.

## {output: 'matches'} output example

```javascript
{
  O:
    [
      [ 'magnificent', 1, -192.0206116, -1.3914537072463768 ],
      [ 'capital', 1, -133.9311307, -0.9705154398550726 ],
      [ 'note', 3, -34.83417005, -0.7572645663043478 ],
      [ 'america', 2, -49.21227355, -0.7132213557971014 ],
      [ 'republic', 1, -75.5720402, -0.5476234797101449 ]
    ],
  C:
    [
      ...
    ],
  ...
};
```
The items in each array represent: [0] - the word, [1] - number of appearances in string (frequency), [2] - the word's weight, [3] - its final lexical value.


## Acknowledgements

### References
Based on [Schwartz, H. A., Eichstaedt, J. C., Kern, M. L., Dziurzynski, L., Ramones, S. M., Agrawal, M., Shah, A., Kosinski, M., Stillwell, D., Seligman, M. E., & Ungar, L. H. (2013). Personality, Gender, and Age in the Language of Social Media: The Open-Vocabulary Approach. PLOS ONE, 8(9), e73791.](http://journals.plos.org/plosone/article/file?id=10.1371/journal.pone.0073791&type=printable)

### Lexicon
Using the Big Five lexicon data from [WWBP](http://www.wwbp.org/lexica.html) under the [Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported](http://creativecommons.org/licenses/by-nc-sa/3.0/).

## License
(C) 2017-18 [P. Hughes](https://www.phugh.es). All rights reserved.

Shared under the [Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported](http://creativecommons.org/licenses/by-nc-sa/3.0/) license.

