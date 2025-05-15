function calculateAccuracy(wordsCorrect, wordsSubmitted) {
  if (wordsSubmitted === 0) return 0;
  return Math.round((wordsCorrect / wordsSubmitted) * 100);
}

if (typeof module !== 'undefined') {
  module.exports = { calculateAccuracy };
}
