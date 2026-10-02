'use strict';

const toggle = (element) => element?.classList.toggle('active');

const sidebar = document.querySelector('[data-sidebar]');
document.querySelector('[data-sidebar-btn]')?.addEventListener('click', () => toggle(sidebar));

const filterItems = document.querySelectorAll('[data-filter-item]');
const filterSelect = document.querySelector('[data-select]');
const filterValue = document.querySelector('[data-selecct-value]');
const filterButtons = document.querySelectorAll('[data-filter-btn]');

const filterProjects = (category) => {
  filterItems.forEach((item) => {
    item.classList.toggle('active', category === 'all' || item.dataset.category === category);
  });
};

const selectCategory = (button) => {
  const category = button.textContent.trim().toLowerCase();
  if (filterValue) filterValue.textContent = button.textContent;
  filterProjects(category);
};

filterSelect?.addEventListener('click', () => toggle(filterSelect));
document.querySelectorAll('[data-select-item]').forEach((item) => {
  item.addEventListener('click', () => {
    selectCategory(item);
    toggle(filterSelect);
  });
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    selectCategory(button);
    filterButtons.forEach((filterButton) => filterButton.classList.toggle('active', filterButton === button));
  });
});

const form = document.querySelector('[data-form]');
const formButton = document.querySelector('[data-form-btn]');
form?.addEventListener('input', () => {
  if (formButton) formButton.disabled = !form.checkValidity();
});

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const formData = new FormData(form);
  const subject = `Portfolio contact from ${formData.get('fullname')}`;
  const body = [
    `Name: ${formData.get('fullname')}`,
    `Email: ${formData.get('email')}`,
    '',
    formData.get('message'),
  ].join('\n');
  const mailtoUrl = `mailto:james.clarke.mail@icloud.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const status = document.querySelector('[data-form-status]');
  const fallbackLink = document.querySelector('[data-form-mailto]');

  if (fallbackLink) fallbackLink.href = mailtoUrl;
  if (status) status.textContent = 'Your email app should open with your message ready. Review it, then send.';
  window.location.href = mailtoUrl;
});

const pages = document.querySelectorAll('[data-page]');
document.querySelectorAll('[data-nav-link]').forEach((link) => {
  link.addEventListener('click', () => {
    const page = link.textContent.trim().toLowerCase();
    pages.forEach((section) => section.classList.toggle('active', section.dataset.page === page));
    document.querySelectorAll('[data-nav-link]').forEach((navLink) => {
      navLink.classList.toggle('active', navLink === link);
    });
    history.replaceState(null, '', `${window.location.pathname}#${page}`);
    window.scrollTo(0, 0);
  });
});

const initialPage = window.location.hash.slice(1);
if (window.location.search) {
  history.replaceState(null, '', `${window.location.pathname}${window.location.hash}`);
}

if ([...pages].some((page) => page.dataset.page === initialPage)) {
  document.querySelector(`[data-nav-link]`)?.click();
  document.querySelectorAll('[data-nav-link]').forEach((link) => {
    const isActive = link.textContent.trim().toLowerCase() === initialPage;
    link.classList.toggle('active', isActive);
  });
  pages.forEach((page) => page.classList.toggle('active', page.dataset.page === initialPage));
}