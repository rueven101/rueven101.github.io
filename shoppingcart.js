// load cart from localStorage
let cart = JSON.parse(localStorage.getItem('bbc_cart') || '[]');

//cart-related elements
const toggleBtn = document.getElementById('cartToggle');
const badge = document.getElementById('cartCount');
const amountEl = document.getElementById('cartAmount');
const panel = document.getElementById('cartPanel');
const itemsEl = document.getElementById('cartItems');
const totalEl = document.getElementById('cartTotal');
const addBtn = document.getElementById('addToCart');
const closeCartBtn = document.querySelector('.close-cart');

// Save cart to localStorage
function saveCart() {
  localStorage.setItem('bbc_cart', JSON.stringify(cart));
}

//for addons
function addonsKey(addons) {
  return addons.map(a => `${a.name}:${a.price}`).sort().join('|');
}

//cart UI asdasd
function updateCart() {
  itemsEl.innerHTML = '';
  let total = 0, count = 0;

  cart.forEach(item => {
    const wrapper = document.createElement('div');
    wrapper.className = 'cart-item';
    
    const main = document.createElement('div');
    main.className = 'item-main';

    const addonTotal = item.addons?.reduce((sum, a) => sum + a.price, 0) || 0;
    const itemTotal = (item.price + addonTotal) * item.qty;

    main.innerHTML = `
      <span>${item.name} ${item.size ? `(${item.size})` : ''} x${item.qty}</span>
      <span>
        ₱${itemTotal}
        <button class="qty-btn" data-key="${item.key}" data-action="decrease">➖</button>
        <button class="qty-btn" data-key="${item.key}" data-action="increase">➕</button>
      </span>
    `;

    wrapper.appendChild(main);

    const ul = document.createElement('ul');
    ul.className = 'sub-items';

    // Show size as sub-item 
    if (item.size) {
      const li = document.createElement('li');
      li.textContent = `Size: ${item.size}`;
      ul.appendChild(li);
    }

    // Show add-ons
    if (item.addons?.length) {
      item.addons.forEach(a => {
        const li = document.createElement('li');
        li.textContent = `${a.name} (₱${a.price})`;
        ul.appendChild(li);
      });
    }

    if (ul.children.length) {
      wrapper.appendChild(ul);
    }

    itemsEl.appendChild(wrapper);
    total += itemTotal;
    count += item.qty;
  });

  totalEl.textContent = `Total: ₱${total}`;
  badge.textContent = count;
  if (amountEl) amountEl.textContent = `₱${total}`;
  saveCart();
}

// Add item to cart
function addToCart() {
  const prodInfo = document.querySelector('.product-info');
  if (!prodInfo) return;

  const name = prodInfo.dataset.name;
  const basePrice = parseFloat(prodInfo.dataset.price);
  const qty = Math.max(1, parseInt(document.getElementById('qty').value, 10) || 1);

  const selectedAddons = Array.from(document.querySelectorAll('.addon-checkbox:checked')).map(cb => ({
    name: cb.dataset.name,
    price: parseFloat(cb.dataset.price)
  }));

  // Check if size is selected
  const sizeRadio = document.querySelector('input[name="size"]:checked');
  const size = sizeRadio ? sizeRadio.value : null;
  const sizePrice = sizeRadio ? parseFloat(sizeRadio.dataset.price) : basePrice;

  // Clear checkboxes after adding
  document.querySelectorAll('.addon-checkbox:checked').forEach(cb => cb.checked = false);

  // Generate unique cart key
  const key = `${name}|${size || 'default'}|${addonsKey(selectedAddons)}`;

  // Check for existing item
  const existing = cart.find(i => i.key === key);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ key, name, size, price: sizePrice, qty, addons: selectedAddons });
  }

  updateCart();
}

// Handle quantity changes in cart
function handleCartClick(e) {
  const btn = e.target;
  if (btn.classList.contains('qty-btn')) {
    const key = btn.dataset.key;
    const action = btn.dataset.action;
    const item = cart.find(i => i.key === key);
    
    if (item) {
      if (action === 'increase') {
        item.qty++;
      } else if (action === 'decrease') {
        item.qty--;
        if (item.qty < 1) {
          cart = cart.filter(i => i.key !== key);
        }
      }
      updateCart();
    }
  }
}

// Event listeners
if (toggleBtn) toggleBtn.addEventListener('click', e => {
  e.preventDefault();
  panel.classList.toggle('active');
});
if (closeCartBtn) closeCartBtn.addEventListener('click', () => panel.classList.remove('active'));
if (addBtn) addBtn.addEventListener('click', addToCart);
if (itemsEl) itemsEl.addEventListener('click', handleCartClick);


updateCart();

//size selection in menu.html
const sizeRadios = document.querySelectorAll('input[name="size"]');
const priceDisplay = document.getElementById('priceDisplay');
const productInfo = document.querySelector('.product-info');

sizeRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    const selected = document.querySelector('input[name="size"]:checked');
    priceDisplay.textContent = `₱${selected.dataset.price}`;
    productInfo.setAttribute('data-price', selected.dataset.price);
    productInfo.setAttribute('data-size', selected.value);
  });
});


//side-nav in menu
const toggleButton = document.querySelector('#menuToggle');
const sideNav = document.querySelector('.side-nav');

toggleButton.addEventListener('click', () => {
  sideNav.classList.toggle('active');
});



