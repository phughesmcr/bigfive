# bigfive - Node.js based Big Five Personality Assessment

Analyse Big Five personality traits from strings.

## Usage
```Javascript
const b5 = require('bigfive');
const text = "A big long string of text...";
const encoding = 'binary' // 'binary' or 'frequency'
let personality = b5(text, encoding);
console.log(personality)
```

Errors return null

## Options

### "encoding"
"binary" (default), or "frequency" - type of word encoding to use.

Binary counts matches as booleans, i.e. 1 = matched at least once, 0 = not matched.

Frequency takes into account the numbers of times a word is matched, i.e. "X" was matched 9 times.

## Output Example
```Javascript
{ O: 0.005491229166666666,
  C: 0.00017221874999999998,
  E: -0.003090625,
  A: 0.00015628124999999998,
  N: 0.0000849375
}
```
Errors output null

## Acknowledgements

### Lexicon
Using the Big Five lexica from http://www.wwbp.org/data.html

Used under the Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported licence

## Licence
(C) 2017 P. Hughes
[Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported](http://creativecommons.org/licenses/by-nc-sa/3.0/)
