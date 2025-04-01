export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

// Get the subset of the alphabet based on the configured count
export const getAlphabetSubset = (count = 4) => {
  return ALPHABET.slice(0, count).split("")
}

