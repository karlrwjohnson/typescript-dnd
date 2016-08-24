export function trimChar(string: string, char: string) {
  let start, end;
  for (start = 0; string[start] !== char && start < string.length; start++) {
    // no op
  }
  for (end = string.length - 1; string[end] !== char && end >= start; end--) {
    // no op
  }
  return string.substring(start, end + 1);
}
