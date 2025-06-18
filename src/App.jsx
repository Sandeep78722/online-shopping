import React, { useState, useEffect } from "react";
import "./App.css";

const categories = [
  "All",
  "T-shirts",
  "Ornaments",
  "Jewelry",
  "Electronics",
  "Kids Wears",
  "Gadgets",
];

function App() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [view, setView] = useState("shop");
  const [orders, setOrders] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Product data fetched from API
  const [productsData, setProductsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

const API_URL = import.meta.env.MODE === 'development'
  ? 'http://localhost:3000/products'
  : '/products.json';

useEffect(() => {
  fetch(API_URL)
    .then(res => res.json())
    .then(data => setProducts(data))
    .catch(err => console.error('Failed to load products', err));
}, []);


  const filteredProducts =
    selectedCategory === "All"
      ? productsData.filter((p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : productsData.filter(
          (p) =>
            p.category === selectedCategory &&
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

  function addToCart(product) {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setCartOpen(true);
  }

  function removeFromCart(id) {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }

  function changeQuantity(id, delta) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const [address, setAddress] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
  });
  const [orderPlaced, setOrderPlaced] = useState(false);

  function handleAddressChange(e) {
    setAddress({ ...address, [e.target.name]: e.target.value });
  }

  function handlePlaceOrder() {
    const filled = Object.values(address).every((v) => v.trim() !== "");
    if (!filled) {
      alert("Please fill all address fields.");
      return;
    }
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }
    const newOrder = {
      id: Date.now(),
      items: cart,
      total: totalPrice,
      address,
      status: "Order Placed",
      date: new Date().toLocaleString(),
    };
    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setCartOpen(false);
    setOrderPlaced(true);
    setView("orders");
  }

  const user = {
    name: "John Doe",
    avatar:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=40&q=80",
  };

  function handleLogout() {
    alert("Logged out!");
  }

  return (
    <div className="app-container">
      <header>
        <h1
          onClick={() => {
            setView("shop");
            setProfileOpen(false);
            setSearchTerm("");
          }}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setView("shop");
              setProfileOpen(false);
              setSearchTerm("");
            }
          }}
          aria-label="Go to home"
        >
          E-Kart
        </h1>

        {/* Search Bar */}
        <div className="search-bar">
          <input
            type="search"
            aria-label="Search products"
            placeholder="Search for products, brands and more"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <nav>
          <button
            onClick={() => {
              setView("shop");
              setProfileOpen(false);
              setSearchTerm("");
            }}
            aria-current={view === "shop" ? "page" : undefined}
          >
            Shop
          </button>
          <button
            onClick={() => {
              setView("orders");
              setProfileOpen(false);
              setSearchTerm("");
            }}
            aria-current={view === "orders" ? "page" : undefined}
          >
            Orders
          </button>
          <button
            onClick={() => {
              setCartOpen(true);
              setProfileOpen(false);
            }}
            aria-label="Open cart"
          >
            Cart ({cart.reduce((sum, i) => sum + i.quantity, 0)})
          </button>

          <div
            className="profile-section"
            onClick={() => setProfileOpen((open) => !open)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") setProfileOpen((open) => !open);
            }}
            aria-haspopup="true"
            aria-expanded={profileOpen}
            aria-label="User profile menu"
            style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
          >
            <img
              src={user.avatar}
              alt={`${user.name}'s avatar`}
              style={{ width: 30, height: 30, borderRadius: "50%" }}
            />
            <span>{user.name}</span>
            {profileOpen && (
              <div
                className="profile-dropdown"
                style={{
                  position: "absolute",
                  right: 20,
                  top: 50,
                  background: "white",
                  color: "black",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  borderRadius: 4,
                  padding: 10,
                  display: "flex",
                  flexDirection: "column",
                  zIndex: 1000,
                }}
              >
                <button
                  onClick={() => {
                    setView("orders");
                    setProfileOpen(false);
                  }}
                >
                  My Orders
                </button>
                <button
                  onClick={() => {
                    alert("Profile page not implemented.");
                    setProfileOpen(false);
                  }}
                >
                  My Account
                </button>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </nav>
      </header>

      <main className="main-content" aria-live="polite">
        {loading && <p>Loading products...</p>}
        {error && <p style={{ color: "red" }}>Error: {error}</p>}

        {!loading && !error && view === "shop" && (
          <>
            {/* Category filter */}
            <div className="categories" role="list" aria-label="Product categories">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={selectedCategory === cat ? "selected" : ""}
                  aria-current={selectedCategory === cat ? "true" : undefined}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Product grid */}
            <div className="product-grid" role="list">
              {filteredProducts.length === 0 && <p>No products found.</p>}
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="product-card"
                  role="listitem"
                  tabIndex={0}
                  onClick={() => setSelectedProduct(product)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setSelectedProduct(product);
                  }}
                  aria-label={`View details for ${product.name}`}
                >
                  <img src={product.image} alt={product.name} />
                  <h3>{product.name}</h3>
                  <p>${product.price}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product);
                    }}
                    aria-label={`Add ${product.name} to cart`}
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {view === "orders" && (
          <>
            <h2>My Orders</h2>
            {orders.length === 0 && <p>You have no orders yet.</p>}
            <ul>
              {orders.map((order) => (
                <li key={order.id} style={{ marginBottom: 20 }}>
                  <strong>Order ID:</strong> {order.id} <br />
                  <strong>Date:</strong> {order.date} <br />
                  <strong>Status:</strong> {order.status} <br />
                  <strong>Total:</strong> ${order.total.toFixed(2)} <br />
                  <details>
                    <summary>Items</summary>
                    <ul>
                      {order.items.map((item) => (
                        <li key={item.id}>
                          {item.name} × {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              ))}
            </ul>
          </>
        )}

        {view === "checkout" && (
          <div
            style={{
              padding: 20,
              maxWidth: 500,
              margin: "20px auto",
              background: "white",
              boxShadow: "0 0 10px rgba(0,0,0,0.1)",
              borderRadius: 6,
            }}
          >
            <h2>Shipping Address</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlePlaceOrder();
              }}
            >
              <label>
                Name:
                <input
                  type="text"
                  name="name"
                  value={address.name}
                  onChange={handleAddressChange}
                  required
                />
              </label>
              <label>
                Street:
                <input
                  type="text"
                  name="street"
                  value={address.street}
                  onChange={handleAddressChange}
                  required
                />
              </label>
              <label>
                City:
                <input
                  type="text"
                  name="city"
                  value={address.city}
                  onChange={handleAddressChange}
                  required
                />
              </label>
              <label>
                State:
                <input
                  type="text"
                  name="state"
                  value={address.state}
                  onChange={handleAddressChange}
                  required
                />
              </label>
              <label>
                Zip:
                <input
                  type="text"
                  name="zip"
                  value={address.zip}
                  onChange={handleAddressChange}
                  required
                />
              </label>
              <label>
                Phone:
                <input
                  type="tel"
                  name="phone"
                  value={address.phone}
                  onChange={handleAddressChange}
                  required
                />
              </label>
              <button type="submit">Place Order</button>
              <button
                type="button"
                onClick={() => setView("shop")}
                style={{ marginLeft: 10 }}
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* Product detail modal */}
        {selectedProduct && (
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-title"
            tabIndex={-1}
            onClick={() => setSelectedProduct(null)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setSelectedProduct(null);
            }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "white",
                padding: 20,
                borderRadius: 8,
                maxWidth: 600,
                width: "90%",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >
              <button
                onClick={() => setSelectedProduct(null)}
                aria-label="Close product details"
                style={{ float: "right", fontSize: 18, background: "none", border: "none" }}
              >
                &times;
              </button>
              <h2 id="product-title">{selectedProduct.name}</h2>
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                style={{ maxWidth: "100%", height: "auto" }}
              />
              <p>{selectedProduct.description}</p>
              <p>
                Price: <strong>${selectedProduct.price}</strong>
              </p>
              <button onClick={() => addToCart(selectedProduct)}>
                Add to Cart
              </button>
            </div>
          </div>
        )}

        {/* Cart sidebar */}
        {cartOpen && (
          <aside
            className="cart-sidebar"
            aria-label="Shopping cart"
            role="region"
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              width: 320,
              height: "100vh",
              background: "white",
              boxShadow: "-2px 0 8px rgba(0,0,0,0.15)",
              padding: 20,
              zIndex: 1000,
              overflowY: "auto",
            }}
          >
            <button
              onClick={() => setCartOpen(false)}
              aria-label="Close cart"
              style={{ float: "right", fontSize: 18, background: "none", border: "none" }}
            >
              &times;
            </button>
            <h2>Your Cart</h2>
            {cart.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                {cart.map((item) => (
                  <li
                    key={item.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <div>
                      <strong>{item.name}</strong> <br />
                      ${item.price} × {item.quantity}
                    </div>
                    <div>
                      <button
                        onClick={() => changeQuantity(item.id, -1)}
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        -
                      </button>
                      <button
                        onClick={() => changeQuantity(item.id, 1)}
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {cart.length > 0 && (
              <>
                <p>
                  <strong>Total: ${totalPrice.toFixed(2)}</strong>
                </p>
                <button
                  onClick={() => {
                    setView("checkout");
                    setCartOpen(false);
                  }}
                >
                  Proceed to Checkout
                </button>
              </>
            )}
          </aside>
        )}
      </main>
    </div>
  );
}

export default App;
