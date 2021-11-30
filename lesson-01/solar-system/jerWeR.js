// https://gist.github.com/BonsaiDen/5897243

function NameGenerator(state) {

    // Syllables shamelessly stolen from elite
    var syllables = 'folexegezacebisousesarmaindirea.eratenberalavetiedorquanteisrion',
    vocals = 'aeiou';
  
    // Some improvements
    var vocalMustFollow = 'tdbr',
    notFollowdBySelf = 'rstie',
    onlyAtStart = 'xyz',
    badSoundStart = ['xc', 'rc', 'bf', 'qc', 'fc', 'vr', 'vc'],
    badSoundMiddle = ['eo', 'ou', 'ae', 'ea', 'sr', 'sg', 'sc', 'nv', 'ng', 'sb', 'sv'];
  
    function isValid(previous, next) {
  
      var pa = previous[0],
      pb = previous[1],
      na = next[0];
  
      if (
      // Block out eveything that's too similar by comparing the initial
      // characters
      Math.abs(pa.charCodeAt(0) - na.charCodeAt(0)) === 1 ||
  
      // Prevent specific letter doubles in the middle of the "word"
      notFollowdBySelf.indexOf(pb) !== -1 && pb === na
  
      // A vocal must follow the last character of the previous syllable
      || vocalMustFollow.indexOf(pb) !== -1 && vocals.indexOf(na) === -1
  
      // Block the second syllable in case it's initial character can only
      // occur at the start
      || onlyAtStart.indexOf(na) !== -1
  
      // Block other combinations which simply do not sound very well
      || badSoundStart.indexOf(pa + na) !== -1
  
      // Block other combinations which simply do not sound very well
      || badSoundMiddle.indexOf(pb + na) !== -1
  
      // Block double syllable pairs
      || previous === next) {
  
        return false;
  
      } else {
        return true;
      }
  
    }
  
    // LCG
    state = state || 0;
    function nextInt() {
      state = (214013 * state + 2531011) % 0x80000; // Loops after 262144
      return state;
    }
  
    // Name generator
    return function () {
  
      var bitIndex = 0;
      while (true) {
  
        bitIndex = 0;
  
        // We have 18 bits of "randomness"
        var seed = nextInt(),
        l = seed >> 15;
  
        // take the last 3 bytes for the length of the name
        // 0123456
        // 2223213
        l = l <= 2 || l === 4 ? 2 : l === 5 && (seed & 0xfff) < 100 ? 1 : 3;
  
        var str = '',
        previous = null,
        next,
        syllableIndex = 0,
        split = l === 2 && (seed & 0x7fff) > 32000,
        i = 0;
  
        while (i < l) {
  
          syllableIndex = seed >> bitIndex & 0x1f;
          next = syllables.substr(syllableIndex * 2, 2);
  
          if (!previous || isValid(previous, next)) {
            str += next;
            previous = next;
            i++;
  
          } else {
            break;
          }
  
          if (split && bitIndex === 5) {
            previous = '.';
            str += previous;
          }
  
          bitIndex += 5;
  
        }
  
        if (bitIndex === 5 * l) {
          break;
        }
  
      }
  
      return str.replace(/\.+/g, '.').replace(/^.|\../g, function (c) {
        return c.toUpperCase();
  
      }).replace(/\./g, ' ');
  
    };
  
  }