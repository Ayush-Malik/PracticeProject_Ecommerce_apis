const pick = (object, ...req_keys) => {
  let filtered = {};

  req_keys.forEach((key, idx) => {
    if (key in object) filtered[key] = object[key];
  });

  return filtered;
};

module.exports = {
  pick,
};
