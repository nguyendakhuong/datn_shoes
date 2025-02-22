export const ParseValid = (validString) => {
  if (!validString) return {};
  const arrayError = validString.split("|");
  return arrayError.reduce((pre, cur) => {
    const [key, value = true] = cur.split(":");
    return { ...pre, [key]: value };
  }, {});
};
