// State stores the current app data.
// render() updates the product grid, summary, filters, and cart UI.




// ----- data (the same for everyone) -----
const products = [
  { id: 101, name: "Teak Sofa", category: "living", price: 45000, inStock: true },
  { id: 102, name: "Oak Table", category: "dining", price: 12000, inStock: false },
  { id: 103, name: "Cane Chair", category: "living", price: 8500, inStock: true },
  { id: 104, name: "Brass Lamp", category: "decor", price: 3200, inStock: true },
  { id: 105, name: "Jute Rug", category: "decor", price: 6400, inStock: false },
  { id: 106, name: "Study Desk", category: "study", price: 27600, inStock: true },
  { id: 107, name: "Bookshelf", category: "study", price: 18750, inStock: true },
  { id: 108, name: "Cushion Set", category: "decor", price: 1800, inStock: true }
];

// ----- state: everything that can change -----
const state = {
  query: "",
  category: "all",
  sort: "default",
  cart: [],          // e.g. [{ id: 101, qty: 1 }]
  discount: 0        // 0.1 after the HIT10 coupon
};

// ----- grab the elements once -----
const grid = document.querySelector("#grid");
const summary = document.querySelector("#summary");
const search = document.querySelector("#search");
const sortSelect = document.querySelector("#sort");
const chips = document.querySelector("#chips");
const cartList = document.querySelector("#cart-list");
const cartTotal = document.querySelector("#cart-total");
const cartCount = document.querySelector("#cart-count");
const couponForm = document.querySelector("#coupon-form");
const couponInput = document.querySelector("#coupon");
const couponMsg = document.querySelector("#coupon-msg");

// ----- template -----
const cardHTML = p => `
  <li class="card" data-id="${p.id}">
    <h3>${p.name}</h3>
    <p class="cat">${p.category}</p>
    <p class="price">₹${p.price}</p>
    <button class="add" ${p.inStock ? "" : "disabled"}>
      <span class="plus">+</span> ${p.inStock ? "Add to cart" : "Out of stock"}
    </button>
  </li>`;

// ----- work out what to show, from state -----
function visibleProducts() {
  const q = state.query.trim().toLowerCase();
  const list = products
    .filter(p => state.category === "all" || p.category === state.category)
    .filter(p => p.name.toLowerCase().includes(q));
  if (state.sort === "low") return [...list].sort((a, b) => a.price - b.price);
  if (state.sort === "high") return [...list].sort((a, b) => b.price - a.price);
  return list;
}

// ----- small render functions -----
function renderGrid(list) {
  if (list.length === 0) {
    grid.innerHTML = `<p class="empty">No products found.</p>`;
    return;
  }
  grid.innerHTML = list.map(cardHTML).join("");
}

function renderSummary(list) {
  const inStock = list.filter(p => p.inStock).length;
  const total = list.reduce((sum, p) => sum + p.price, 0);
  summary.textContent = `${list.length} products · ${inStock} in stock · Total ₹${total}`;
}

function renderCart() {
  cartList.innerHTML = state.cart.map(item => {
    const p = products.find(p => p.id === item.id);
    return `<li data-id="${p.id}"><span>${p.name} × ${item.qty}</span><button class="remove">✕</button></li>`;
  }).join("");
  const subtotal = state.cart.reduce((sum, item) =>
    sum + products.find(p => p.id === item.id).price * item.qty, 0);
  cartTotal.textContent = `₹${Math.round(subtotal * (1 - state.discount))}`;
  cartCount.textContent = state.cart.reduce((n, item) => n + item.qty, 0);
}

// ----- render: state -> screen -----
function render() {
  const list = visibleProducts();
  renderGrid(list);
  renderSummary(list);
  chips.querySelectorAll(".chip").forEach(b =>
    b.classList.toggle("active", b.dataset.cat === state.category));
  renderCart();
}

// ----- events: change state, then render -----
search.addEventListener("input", e => {
  state.query = e.target.value;
  render();
});

chips.addEventListener("click", e => {
  const btn = e.target.closest(".chip");
  if (!btn) return;
  state.category = btn.dataset.cat;
  render();
});

sortSelect.addEventListener("change", e => {
  state.sort = e.target.value;
  render();
});

grid.addEventListener("click", e => {
  const btn = e.target.closest(".add");
  if (!btn) return;
  const id = Number(btn.closest(".card").dataset.id);
  const item = state.cart.find(i => i.id === id);
  if (item) item.qty++;
  else state.cart.push({ id, qty: 1 });
  render();
});

cartList.addEventListener("click", e => {
  const btn = e.target.closest(".remove");
  if (!btn) return;
  const id = Number(btn.closest("li").dataset.id);
  state.cart = state.cart.filter(i => i.id !== id);
  render();
});

couponForm.addEventListener("submit", e => {
  e.preventDefault();
  const code = couponInput.value.trim().toUpperCase();
  if (code === "HIT10") {
    state.discount = 0.1;
    couponMsg.textContent = "10% off applied";
  } else {
    state.discount = 0;
    couponMsg.textContent = "Invalid coupon";
  }
  render();
});

render(); // first paint