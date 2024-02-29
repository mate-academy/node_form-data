const categoriesElement = document.getElementById('category');
const categoryInput = document.getElementById('category-input');
const addCategoryButton = document.getElementById('add-category');

function addCategory() {
  const newCategory = categoryInput.value.trim();

  if (newCategory) {
    const newCategoryElement = document.createElement('option');

    newCategoryElement.textContent = newCategory;
    newCategoryElement.value = newCategory;
    categoriesElement.appendChild(newCategoryElement);
    categoriesElement.value = newCategory;
    categoryInput.value = '';

    try {
      const categories = JSON.parse(localStorage.getItem('categories'));

      categories.push(newCategory);
      localStorage.setItem('categories', JSON.stringify(new Set(categories)));
    } catch (err) {
      localStorage.setItem('categories', '[]');
    }
  }
}

export function enableAddCategory() {
  addCategoryButton.addEventListener('click', addCategory);
}
