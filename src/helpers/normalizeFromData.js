function normalizeFromData(fields) {
  const formData = { ...fields };

  // Object.keys(formData).forEach((key) => {
  //   formData[key] = formData[key];
  // });

  return formData;
}

module.exports = normalizeFromData;
