let seq = 0

export const makeId = (prefix: string): string => {
  seq += 1
  return `${prefix}-${seq.toString(36)}-${Math.floor(performance.now()).toString(36)}`
}
