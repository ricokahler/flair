/**
 * abusing throw for better control flow 🤷‍♀️
 */
function seek<T>(traverse: (report: (t: T) => never) => void): T {
  const found = Symbol();
  let result: T;

  const report = (t: T) => {
    result = t;
    throw found;
  };

  try {
    traverse(report);
  } catch (e) {
    if (e !== found) throw e;
    return result!;
  }

  throw new Error(
    'seek report was never called. This is probably a bug in react-style-system',
  );
}

export default seek;
