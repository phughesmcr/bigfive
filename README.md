# bigfive - Node.js based Big Five Personality Assessment

Analyse the Big Five personality traits from strings.

## Usage
```Javascript
const b5 = require('bigfive');
const str = "A big long string of text...";
const personality = b5(str);
console.log(personality)
```

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

Used under the [Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported](http://creativecommons.org/licenses/by-nc-sa/3.0/)

## Licence
(C) 2017 [P. Hughes](www.phugh.es)

[Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported](http://creativecommons.org/licenses/by-nc-sa/3.0/)
