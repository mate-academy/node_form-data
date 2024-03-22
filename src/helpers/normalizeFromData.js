function normalizeFromData(fields) {
  const formData = { ...fields };

  Object.keys(formData).forEach((key) => {
    formData[key] = formData[key][0];
  });

  return formData;
}

module.exports = normalizeFromData;
