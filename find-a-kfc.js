document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('locationSearch');
  const cards = document.querySelectorAll('#restaurantList > div');

  if (!searchInput) return;

  searchInput.addEventListener('focus', () => {
    cards.forEach((card, index) => {
      card.style.transform = 'translateY(-4px)';
      card.style.transitionDelay = `${index * 50}ms`;
    });
  });

  searchInput.addEventListener('blur', () => {
    cards.forEach((card) => {
      card.style.transform = 'translateY(0)';
      card.style.transitionDelay = '0ms';
    });
  });
});
