const categoriesElement = document.getElementById('category');

export function setCategories() {
  try {
    const categories = JSON.parse(localStorage.getItem('categories'));

    categories.forEach(category => {
      const newCategoryElement = document.createElement('option');

      newCategoryElement.textContent = category;
      newCategoryElement.value = category;

      categoriesElement.appendChild(newCategoryElement);
    });
  } catch (err) {
    localStorage.setItem('categories', '[]');
  }
}
