const BLOCKED = ['fuck', 'shit', 'ass', 'bitch', 'cunt', 'dick', 'cock', 'pussy', 'bastard', 'damn', 'crap']

export function filterText(text: string): string {
  let result = text
  for (const word of BLOCKED) {
    const re = new RegExp(`\\b${word}\\b`, 'gi')
    result = result.replace(re, '*'.repeat(word.length))
  }
  return result
}

export function containsProfanity(text: string): boolean {
  return BLOCKED.some(word => new RegExp(`\\b${word}\\b`, 'gi').test(text))
}
