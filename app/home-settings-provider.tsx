import { getSetting } from "@/lib/settings"

export async function getHomeSettings() {
  try {
    const alphabetLettersCount = await getSetting("ALPHABET_LETTERS_COUNT")
    const submissionsHalted = await getSetting("SUBMISSIONS_HALTED")
    return {
      ALPHABET_LETTERS_COUNT: alphabetLettersCount,
      SUBMISSIONS_HALTED: submissionsHalted,
    }
  } catch (error) {
    console.error("Error fetching home settings:", error)
    return {
      ALPHABET_LETTERS_COUNT: 8,
      SUBMISSIONS_HALTED: false,
    }
  }
}

