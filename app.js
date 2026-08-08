const WHATSAPP_NUMBER = "526645812107";
const CRM_API_URL = "https://cataleya-production.up.railway.app";

const CATEGORY_IMAGES = {
  "Café": "./assets/menu/cafe.jpg",
  "Pan": "./assets/menu/pan.jpg",
  "Licuados": "./assets/menu/licuados.jpg",
  "Mariscos": "./assets/menu/mariscos.jpg",
  "Desayunos": "./assets/menu/desayunos.jpg",
  "Bebidas": "./assets/menu/bebidas.jpg"
};

let products = [];
let cart = JSON.parse(localStorage.getItem("cataleya-cart") || "[]");
let activeCategory = "Todos";
let searchTerm = "";

const money = value => new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN"
}).format(value);

const productGrid = document.querySelector("#product-grid");
const categoriesNode = document.querySelector("#categories");
const cartItemsNode = document.querySelector("#cart-items");
const emptyResults = document.querySelector("#empty-results");
const cartDrawer = document.querySelector("#cart-drawer");
const drawerBackdrop = document.querySelector("#drawer-backdrop");
const orderForm = document.querySelector("#order-form");
const cartEmpty = document.querySelector("#cart-empty");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadProducts() {
  productGrid.innerHTML = '<p class="loading-menu">Cargando el menú...</p>';
  try {
    const response = await fetch("./products.json", { cache: "no-store" });
    if (!response.ok) throw new Error("No fue posible cargar el catálogo");
    const catalog = await response.json();
    products = catalog
      .filter(product => product.active !== false)
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    cart = cart.filter(item => products.some(product => product.id === item.id));
    saveCart();
    renderCategories();
    renderProducts();
    renderCart();
  } catch (error) {
    if (Array.isArray(window.CATALEYA_CATALOG_BACKUP) && window.CATALEYA_CATALOG_BACKUP.length) {
      products = structuredClone(window.CATALEYA_CATALOG_BACKUP)
        .filter(product => product.active !== false)
        .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
      cart = cart.filter(item => products.some(product => product.id === item.id));
      saveCart();
      renderCategories();
      renderProducts();
      renderCart();
    } else {
      productGrid.innerHTML = `
        <div class="menu-error">
          <b>No pudimos cargar el menú.</b>
          <span>Actualiza la página en unos momentos.</span>
        </div>
      `;
      console.error(error);
    }
  }
}

function renderCategories() {
  const categories = ["Todos", ...new Set(products.map(product => product.category))];
  categoriesNode.innerHTML = categories.map(category => `
    <button class="category-button ${category === activeCategory ? "active" : ""}"
      type="button" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>
  `).join("");
}

function productVisual(product) {
  const image = product.image || CATEGORY_IMAGES[product.category];
  if (image) {
    return `<img src="${escapeHtml(image)}" alt="" role="presentation" loading="lazy" />`;
  }
  return `<span>${escapeHtml(product.emoji || "🍽️")}</span>`;
}

function renderProducts() {
  const normalizedSearch = searchTerm.toLocaleLowerCase("es");
  const filtered = products.filter(product => {
    const matchesCategory = activeCategory === "Todos" || product.category === activeCategory;
    const matchesSearch = `${product.name} ${product.description} ${product.category}`
      .toLocaleLowerCase("es").includes(normalizedSearch);
    return matchesCategory && matchesSearch;
  });

  productGrid.innerHTML = filtered.map(product => `
    <article class="product-card">
      <div class="product-visual">${productVisual(product)}</div>
      <div class="product-content">
        <div class="product-top">
          <h3>${escapeHtml(product.name)}</h3>
          <span class="price">${money(product.price)}</span>
        </div>
        <p>${escapeHtml(product.description)}</p>
        <button class="add-button" type="button" data-add="${product.id}">
          Agregar al pedido
        </button>
      </div>
    </article>
  `).join("");
  emptyResults.hidden = filtered.length > 0;
}

function saveCart() {
  localStorage.setItem("cataleya-cart", JSON.stringify(cart));
}

function addToCart(productId) {
  const existing = cart.find(item => item.id === productId);
  if (existing) existing.quantity += 1;
  else cart.push({ id: productId, quantity: 1 });
  saveCart();
  renderCart();
  showToast("Platillo agregado a tu pedido");
}

function updateQuantity(productId, change) {
  const item = cart.find(entry => entry.id === productId);
  if (!item) return;
  item.quantity += change;
  if (item.quantity <= 0) cart = cart.filter(entry => entry.id !== productId);
  saveCart();
  renderCart();
}

function removeItem(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  renderCart();
}

function getTotals() {
  return cart.reduce((summary, item) => {
    const product = products.find(entry => entry.id === item.id);
    if (!product) return summary;
    summary.quantity += item.quantity;
    summary.total += product.price * item.quantity;
    return summary;
  }, { quantity: 0, total: 0 });
}

function renderCart() {
  const { quantity, total } = getTotals();
  document.querySelector("#cart-count").textContent = quantity;
  document.querySelector("#floating-count").textContent = quantity;
  document.querySelector("#floating-total").textContent = money(total);
  document.querySelector("#subtotal").textContent = money(total);
  document.querySelector("#grand-total").textContent = money(total);
  document.querySelector("#floating-cart").classList.toggle("visible", quantity > 0);
  cartEmpty.hidden = quantity > 0;
  orderForm.classList.toggle("visible", quantity > 0);

  cartItemsNode.innerHTML = cart.map(item => {
    const product = products.find(entry => entry.id === item.id);
    if (!product) return "";
    return `
      <article class="cart-item">
        <div>
          <h4>${escapeHtml(product.name)}</h4>
          <span class="item-price">${money(product.price * item.quantity)}</span>
        </div>
        <span>${escapeHtml(product.emoji || "🍽️")}</span>
        <div class="quantity">
          <button type="button" data-change="-1" data-id="${product.id}" aria-label="Quitar uno">-</button>
          <b>${item.quantity}</b>
          <button type="button" data-change="1" data-id="${product.id}" aria-label="Agregar uno">+</button>
          <button class="remove-item" type="button" data-remove="${product.id}">Eliminar</button>
        </div>
      </article>
    `;
  }).join("");
}

function openCart() {
  drawerBackdrop.hidden = false;
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("drawer-open");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("drawer-open");
  window.setTimeout(() => { drawerBackdrop.hidden = true; }, 250);
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 1800);
}

function handleDeliveryChange() {
  const delivery = document.querySelector('input[name="delivery"]:checked').value;
  const addressField = document.querySelector("#address-field");
  const address = document.querySelector("#customer-address");
  const needsAddress = delivery === "A domicilio";
  addressField.hidden = !needsAddress;
  address.required = needsAddress;
}

function handlePaymentChange() {
  document.querySelector("#cash-field").hidden =
    document.querySelector("#payment-method").value !== "Efectivo";
}

async function submitOrderToCrm({ phone, name, delivery, address, payment, cash, notes }) {
  try {
    const response = await fetch(`${CRM_API_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone,
        name,
        items: cart.map(item => ({ id: item.id, quantity: item.quantity })),
        delivery,
        address: delivery === "A domicilio" ? address : undefined,
        payment,
        cashAmount: cash || undefined,
        notes: notes || undefined
      })
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      console.error("CRM rechazó el pedido:", body);
    }
  } catch (error) {
    console.error("No se pudo registrar el pedido en el CRM:", error);
  }
}

function sendOrder(event) {
  event.preventDefault();
  if (!cart.length) return;
  if (!WHATSAPP_NUMBER) {
    showToast("Configura el número de WhatsApp de Cataleya");
    return;
  }

  const name = document.querySelector("#customer-name").value.trim();
  const phone = document.querySelector("#customer-phone").value.trim();
  const delivery = document.querySelector('input[name="delivery"]:checked').value;
  const address = document.querySelector("#customer-address").value.trim();
  const payment = document.querySelector("#payment-method").value;
  const cash = document.querySelector("#cash-amount").value.trim();
  const notes = document.querySelector("#order-notes").value.trim();
  const total = getTotals().total;

  if (!name || !phone || (delivery === "A domicilio" && !address)) {
    showToast("Completa los datos obligatorios");
    return;
  }

  submitOrderToCrm({ phone, name, delivery, address, payment, cash, notes });

  const productLines = cart.map(item => {
    const product = products.find(entry => entry.id === item.id);
    return `- ${item.quantity} x ${product.name} - ${money(product.price * item.quantity)}`;
  }).join("\n");

  const message = [
    "*NUEVO PEDIDO - CATALEYA RESTAURANTE*",
    "",
    productLines,
    "",
    `*Total estimado:* ${money(total)}`,
    "",
    `*Nombre:* ${name}`,
    `*Teléfono:* ${phone}`,
    `*Entrega:* ${delivery}`,
    delivery === "A domicilio" ? `*Dirección:* ${address}` : null,
    `*Pago:* ${payment}`,
    payment === "Efectivo" && cash ? `*Paga con:* $${cash}` : null,
    notes ? `*Notas:* ${notes}` : null,
    "",
    "¡Gracias! Quedo pendiente de la confirmación."
  ].filter(Boolean).join("\n");

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
}

categoriesNode.addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  renderCategories();
  renderProducts();
});

productGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (button) addToCart(Number(button.dataset.add));
});

cartItemsNode.addEventListener("click", event => {
  const changeButton = event.target.closest("[data-change]");
  const removeButton = event.target.closest("[data-remove]");
  if (changeButton) updateQuantity(Number(changeButton.dataset.id), Number(changeButton.dataset.change));
  if (removeButton) removeItem(Number(removeButton.dataset.remove));
});

document.querySelector("#search-input").addEventListener("input", event => {
  searchTerm = event.target.value.trim();
  renderProducts();
});

["#open-cart", "#floating-cart"].forEach(selector =>
  document.querySelector(selector).addEventListener("click", openCart)
);
document.querySelector("#close-cart").addEventListener("click", closeCart);
drawerBackdrop.addEventListener("click", closeCart);
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && cartDrawer.classList.contains("open")) closeCart();
});
document.querySelectorAll('input[name="delivery"]').forEach(input =>
  input.addEventListener("change", handleDeliveryChange)
);
document.querySelector("#payment-method").addEventListener("change", handlePaymentChange);
orderForm.addEventListener("submit", sendOrder);

handleDeliveryChange();
handlePaymentChange();
loadProducts();
