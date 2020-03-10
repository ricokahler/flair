import path from 'path';

/**
 * from here: https://stackoverflow.com/a/7616484/5776910
 */
function hashString(str: string) {
  let hash = 0,
    i,
    chr;

  if (str.length === 0) return hash;

  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

function createFilenameHash(filename: string) {
  const basename = path.basename(filename);
  const extension = path.extname(filename);

  const name = basename
    .substring(0, basename.length - extension.length)
    .replace(/\w/g, '');

  return `${name}-${hashString(filename).toString(16)}`;
}

export default createFilenameHash;
