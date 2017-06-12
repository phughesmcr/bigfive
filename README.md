# bigfive - Node.js based Big Five Personality Assessment

Analyse the Big Five personality traits from strings.

## Usage
```Javascript
const b5 = require('bigfive');
const text = "A big long string of text...";
const opts = {
  "encoding": 'binary', // 'binary' (default) or 'frequency'
  "bigrams": true,      // match against bigrams in lexicon (not recommended for large strings)
  "trigrams": true      // match against trigrams in lexicon (not recommended for large strings)
}
let personality = b5(text, opts);
console.log(personality)
```

Errors return null

## Options

### "encoding"
"binary" (default), or "frequency" - type of word encoding to use.

Binary counts matches as booleans, i.e. 1 = matched at least once, 0 = not matched.

Binary is simply a sum of weights from the lexicon, i.e. weight[1] + weight[2] + .... etc.

Frequency takes into account the numbers of times a word is matched, i.e. "X" was matched 9 times.

Frequecy uses the equation ((word[1] frequency / total wordcount) * word[1] weight) + ((word[2]..... )) etc.

Unless you have a specific use for frequency encoding, we recommend you use binary only.

## Output Example
```Javascript
{
  O: 0.5491229166666666,
  C: 0.017221874999999998,
  E: -0.3090625,
  A: 0.015628124999999998,
  N: 0.00849375
}
```
Errors return null

## Acknowledgements

### Lexicon
Using the Big Five lexica from http://www.wwbp.org/data.html

Used under the Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported licence

## Licence
(C) 2017 [P. Hughes](www.phugh.es)

[Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported](http://creativecommons.org/licenses/by-nc-sa/3.0/)
