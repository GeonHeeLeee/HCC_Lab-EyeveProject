export function isJson(str: string) {
  try {
    const json = JSON.parse(str);
    return (typeof json === 'object');
  } catch (e) {
    return false;
  }
}