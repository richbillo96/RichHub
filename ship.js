const SUPABASE_URL =
            "https://tdrelswytmscpnkxmcgw.supabase.co";

        const SUPABASE_KEY =
            "sb_publishable_t09l4fnt9ZGfnsc5bzxSdA_s64P1y_q";


function getSupabaseHeaders() {
  const token = localStorage.getItem("supabase_access_token");
  return {
    "apikey": SUPABASE_KEY,
    "Authorization": token ? `Bearer ${token}` : `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
  };
}


// ===============================
// AUTHENTICATION
// ===============================

async function signUp() {
    const email = document.getElementById("auth-email").value.trim();
    const password = document.getElementById("auth-password").value;

    if (!email || !password) {
        showAuthMessage("Please enter your email and password.");
        return;
    }

    try {
        const response = await fetch(
            SUPABASE_URL + "/auth/v1/signup",
            {
                method: "POST",
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.msg || data.message || data.error_description || "Sign up failed");
        }

        if (data.access_token) {
            localStorage.setItem("supabase_access_token", data.access_token);
            
            localStorage.setItem("supabase_user", JSON.stringify(data.user))
            
            document.getElementById("auth-section").style.display = "none";
document.getElementById("hub-section").style.display = "block";

            showAuthMessage("Account created successfully! You are logged in.");
        } else {
            showAuthMessage("Account created. Please check your email to confirm your account.");
        }

    } catch (error) {
        console.error("Sign up error:", error);
        showAuthMessage(error.message);
    }
}


async function logIn() {
    const email = document.getElementById("auth-email").value.trim();
    const password = document.getElementById("auth-password").value;

    if (!email || !password) {
        showAuthMessage("Please enter your email and password.");
        return;
    }

    try {
        const response = await fetch(
            SUPABASE_URL + "/auth/v1/token?grant_type=password",
            {
                method: "POST",
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error_description || data.msg || "Login failed");
        }

        localStorage.setItem("supabase_access_token", data.access_token);
        localStorage.setItem("supabase_user", JSON.stringify(data.user));

document.getElementById("auth-section").style.display = "none";
document.getElementById("hub-section").style.display = "block";

        showAuthMessage("Login successful! ✅");

    } catch (error) {
        console.error("Login error:", error);
        showAuthMessage(error.message);
    }
}


function showAuthMessage(message) {
    const messageBox = document.getElementById("auth-message");

    if (messageBox) {
        messageBox.textContent = message;
    }
}


function isLoggedIn() {
    return !!localStorage.getItem("supabase_access_token");
}


function logout() {
    localStorage.removeItem("supabase_access_token");
    localStorage.removeItem("supabase_user");

    document.getElementById("auth-section").style.display = "flex";
    document.getElementById("hub-section").style.display = "none";

    showAuthMessage("You have been logged out.");
}


// Check login status when page opens
function checkLoginStatus() {
    if (isLoggedIn()) {
        showAuthMessage("You are logged in ✅");
    } else {
        showAuthMessage("Please log in before placing an order.");
    }
}

checkLoginStatus();

        async function loadProducts() {

            const productsList =
                document.getElementById("products-list");

            try {

                const response = await fetch(
                    SUPABASE_URL +
                    "/rest/v1/Products?select=*",
                    {
                        method: "GET",

                        headers: {
                            "apikey": SUPABASE_KEY,
                            "Authorization":
                                "Bearer " + SUPABASE_KEY
                        }
                    }
                );


                if (!response.ok) {

                    throw new Error(
                        "Supabase returned " +
                        response.status
                    );

                }


                const products =
                    await response.json();


                if (!products || products.length === 0) {

                    productsList.innerHTML =
                        "<p>No products available yet.</p>";

                    return;
                }


                productsList.innerHTML =
                    products.map(product => {


                        let image =
                            product.image_url;


                        /*
                         * If image_url is empty,
                         * use an automatic image.
                         */

                        if (
                            !image &&
                            product.name &&
                            product.name
                                .toLowerCase()
                                .includes("earbud")
                        ) {

                            image =
                                "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=800&q=80";

                        }


                        if (
                            !image &&
                            product.name &&
                            product.name
                                .toLowerCase()
                                .includes("nike")
                        ) {

                            image =
                                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80";

                        }


                        return `

                            <div class="product-card">

                                ${
                                    image
                                    ? `
                                        <img
                                            class="product-image"
                                            src="${image}"
                                            alt="${product.name || "Product"}"
                                        >
                                      `
                                    : ""
                                }


                                <h3>
                                    ${product.name || "Unnamed Product"}
                                </h3>


                                <p>
                                    ${product.description || ""}
                                </p>


                                <div class="product-price">
                                    $${product.price || 0}
                                </div>


                                <div class="stock">
                                    Stock: ${product.stock || 0}
                                </div>


                                <button
                                    class="buy-btn"
                                    onclick="buyProduct(
                                        '${product.name || "Product"}',
                                        ${product.price || 0}
                                    )"
                                >
                                    Buy Now
                                </button>

                            </div>

                        `;

                    }).join("");


            } catch (error) {

                console.error(
                    "Product loading error:",
                    error
                );

                productsList.innerHTML =
                    "<p>Could not load products.</p>";

            }

        }


        /*
         * Load products when page opens
         */

        loadProducts();


        async function buyProduct(name, price) {
    const accessToken = localStorage.getItem("supabase_access_token");

  if (!accessToken) {
    alert("Please log in or sign up before placing an order.");

    const authSection = document.getElementById("auth-section");

    authSection.style.display = "block";
    authSection.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    return;
}

    try {
        
        // Get customer information
        const customerName = prompt("Enter your full name:");
        if (!customerName) return;

        const customerPhone = prompt("Enter your phone number:");
        if (!customerPhone) return;

        const shippingAddress = prompt("Enter your delivery address:");
        if (!shippingAddress) return;

        const quantityInput = prompt("How many do you want?", "1");
        const quantity = Number(quantityInput);

        if (!Number.isInteger(quantity) || quantity < 1) {
            alert("Please enter a valid quantity.");
            return;
        }

        const totalAmount = Number(price) * quantity;

        // Send order to Supabase
        const response = await fetch(
            SUPABASE_URL + "/rest/v1/Orders",
            {
                method: "POST",
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": "Bearer " + accessToken,
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal"
                },
                body: JSON.stringify({
                    product_name: name,
                    quantity: quantity,
                    customer_name: customerName,
                    customer_phone: customerPhone,
                    shipping_address: shippingAddress,
                    total_amount: totalAmount,
                    status: "pending"
                })
            }
        );

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error);
        }

        alert(
            "Order placed successfully! 🎉\n\n" +
            "Product: " + name + "\n" +
            "Quantity: " + quantity + "\n" +
            "Total: $" + totalAmount + "\n\n" +
            "Thank you, " + customerName + "!"
        );

    } catch (error) {
        console.error("Order error:", error);
        alert("Order failed ❌\n\n" + error.message);
    }
}
window.addEventListener("DOMContentLoaded", () => {
    const accessToken = localStorage.getItem("supabase_access_token");

    if (accessToken) {
        document.getElementById("auth-section").style.display = "none";
        document.getElementById("hub-section").style.display = "block";
    } else {
        document.getElementById("auth-section").style.display = "flex";
        document.getElementById("hub-section").style.display = "none";
    }
});



function togglePassword() {
  const password = document.getElementById("auth-password");

  if (password.type === "password") {
    password.type = "text";
  } else {
    password.type = "password";
  }
}


async function loginWithGoogle() {
    const redirectTo = window.location.origin + window.location.pathname;

    window.location.href =
        SUPABASE_URL +
        "/auth/v1/authorize?provider=google&redirect_to=" +
        encodeURIComponent(redirectTo);
}

function showDashboard(section) {
    const sections = [
        "overview",
        "store",
        "products",
        "orders",
        "customers",
        "revenue",
        "ads",
        "settings"
    ];

    sections.forEach(name => {
        const element = document.getElementById(name);

        if (element) {
            element.style.display = name === section ? "block" : "none";
        }
        });
}

function editStore() {
    const storeName = document.getElementById("storeName").value.trim();
    const storeDescription = document.getElementById("storeDescription").value.trim();
    const storeBanner = document.getElementById("storeBanner");

    if (storeName === "") {
        alert("Please enter your store name.");
        return;
    }

    if (storeDescription === "") {
        alert("Please enter a store description.");
        return;
    }

    localStorage.setItem("storeName", storeName);
    localStorage.setItem("storeDescription", storeDescription);

    // Save the selected banner
    if (storeBanner.files && storeBanner.files[0]) {
        const reader = new FileReader();

        reader.onload = function(event) {
            localStorage.setItem("storeBanner", event.target.result);

            alert("✅ Store information saved successfully!");
            document.querySelector(".store-info button").textContent = "✅ Store Saved";
        };

        reader.readAsDataURL(storeBanner.files[0]);
    } else {
        alert("✅ Store information saved successfully!");
        document.querySelector(".store-info button").textContent = "✅ Store Saved";
    }
}

function previewBanner(input) {
    const preview = document.getElementById("bannerPreview");

    if (!input.files || !input.files[0]) {
        preview.innerHTML = "<span>No image selected</span>";
        return;
    }

    const file = input.files[0];

    if (!file.type.startsWith("image/")) {
        preview.innerHTML = "<span>Please select an image.</span>";
        return;
    }

    const reader = new FileReader();

    reader.onload = function(event) {
        preview.innerHTML =
            '<img src="' + event.target.result + '" alt="Store Banner">';
    };

    reader.readAsDataURL(file);
                }



window.addEventListener("DOMContentLoaded", function () {
    const savedBanner = localStorage.getItem("storeBanner");
    const preview = document.getElementById("bannerPreview");

    if (savedBanner && preview) {
        preview.innerHTML =
            '<img src="' + savedBanner + '" alt="Saved Store Banner">';
    }
});

// =========================================
// ADD PRODUCT
// =========================================

async function addProduct() {
  const name = prompt("Enter product name:");
  if (!name || !name.trim()) return;

  const price = prompt("Enter product price:");
  if (!price || isNaN(price)) {
    alert("Please enter a valid price.");
    return;
  }

  const description = prompt("Enter product description:");
  if (!description) return;

  // Get the store_id you created in Supabase
  const storeId = localStorage.getItem("store_id");
  if (!storeId) {
    alert("No store found. Go to your Store tab and save your store first.");
    return;
  }

  const productPayload = {
    store_id: storeId,
    name: name.trim(),
    price: Number(price),
    description: description.trim(),
    image_url: null,
    stock: 10
  };

  try {
    const response = await fetch(
      SUPABASE_URL + "/rest/v1/products",
      {
        method: "POST",
        headers: getSupabaseHeaders(),
        body: JSON.stringify(productPayload)
      }
    );

    if (!response.ok) {
      const err = await response.json();
      console.error("Supabase error:", err);
      alert("Failed to save product to Supabase.");
      return;
    }

    const saved = await response.json();
    const product = saved[0] || { ...productPayload, id: Date.now() };

    // Keep localStorage as backup/cache
    let products = JSON.parse(localStorage.getItem("richhub_products") || "[]");
    products.push(product);
    localStorage.setItem("richhub_products", JSON.stringify(products));

    displayProducts();
    alert("✅ Product added successfully!");
  } catch (err) {
    console.error(err);
    alert("Network error. Product not saved.");
  }
}



// =========================================
// DISPLAY PRODUCTS
// =========================================

function displayProducts() {
    const productsGrid = document.getElementById("products-grid");

    if (!productsGrid) {
        return;
    }

    const products = JSON.parse(
        localStorage.getItem("richhub_products") || "[]"
    );

    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div class="products-empty">
                <div>📦</div>
                <h3>No products yet</h3>
                <p>Add your first product to start selling.</p>

                <button onclick="addProduct()">
                    ＋ Add Your First Product
                </button>
            </div>
        `;

        return;
    }

    productsGrid.innerHTML = "";

    products.forEach(product => {

        const card = document.createElement("div");

        card.className = "product-card";

        card.innerHTML = `
            <div class="product-image">
                📦
            </div>

            <h3>${product.name}</h3>

            <p>${product.description}</p>

            <strong>$${product.price.toFixed(2)}</strong>

            <button onclick="deleteProduct(${product.id})">
                🗑️ Delete
            </button>
        `;

        productsGrid.appendChild(card);
    });
}


// =========================================
// DELETE PRODUCT
// =========================================

function deleteProduct(id) {

    let products = JSON.parse(
        localStorage.getItem("richhub_products") || "[]"
    );

    products = products.filter(product => product.id !== id);

    localStorage.setItem(
        "richhub_products",
        JSON.stringify(products)
    );

    displayProducts();
}


// =========================================
// LOAD PRODUCTS WHEN PAGE OPENS
// =========================================

window.addEventListener("DOMContentLoaded", function () {
    displayProducts();
    loadStoreId();        
});

// Auto-fetch store_id when page loads
async function loadStoreId() {
  const user = JSON.parse(localStorage.getItem("supabase_user") || "{}");
  if (!user.id) return;

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/stores?user_id=eq.${user.id}&select=id`,
      { headers: getSupabaseHeaders() }
    );
    const stores = await res.json();
    if (stores[0]) {
      localStorage.setItem("store_id", stores[0].id);
      console.log("Store ID loaded:", stores[0].id);
      alert(stores[0].id);          
    }
  } catch (e) {
    console.error("Could not load store:", e);
    alert(`error${e}`);        
  }
}



async function saveStoreToSupabase() {
  const user = JSON.parse(localStorage.getItem("supabase_user") || "{}");
  if (!user.id) {
    alert("You must be logged in.");
    return;
  }

  // Get store info from your existing localStorage
  const name = localStorage.getItem("storeName") || "My Store";
  const description = localStorage.getItem("storeDescription") || "";
  const banner = localStorage.getItem("storeBanner") || null;

  const payload = {
    user_id: user.id,
    name: name,
    description: description,
    banner_url: banner
  };

  try {
    const response = await fetch(
      SUPABASE_URL + "/rest/v1/stores",
      {
        method: "POST",
        headers: getSupabaseHeaders(),
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const err = await response.json();
      console.error(err);
      alert("Failed to save store.");
      return;
    }

    const data = await response.json();
    const storeId = data[0].id;
    localStorage.setItem("store_id", storeId);

    alert("✅ Store saved! Now you can add products.");
  } catch (e) {
    console.error(e);
    alert("Error saving store.");
  }
}
// ==========================================
// AUTO-ADD "SAVE STORE" BUTTON TO STORE TAB
// ==========================================

function injectStoreSaveButton() {
  // Only add if not already there
  if (document.getElementById("supabase-save-store-btn")) return;

  const storeSection = document.getElementById("store-section");
  if (!storeSection) return;

  const btn = document.createElement("button");
  btn.id = "supabase-save-store-btn";
  btn.innerText = "💾 Save Store to Database";
  btn.style.cssText = "margin-top:15px;padding:12px 20px;background:#4CAF50;color:white;border:none;border-radius:8px;cursor:pointer;font-size:16px;";
  btn.onclick = saveStoreToSupabase;
  
  storeSection.appendChild(btn);
}

// Check every second for the Store tab to appear
setInterval(injectStoreSaveButton, 1000);

async function saveStoreToSupabase() {
  const user = JSON.parse(localStorage.getItem("supabase_user") || "{}");
  if (!user.id) {
    alert("You must be logged in.");
    return;
  }

  const name = localStorage.getItem("storeName") || prompt("Enter store name:");
  const description = localStorage.getItem("storeDescription") || prompt("Enter store description:");
  const banner = localStorage.getItem("storeBanner") || null;

  if (!name) {
    alert("Store name is required.");
    return;
  }

  const payload = {
    user_id: user.id,
    name: name,
    description: description,
    banner_url: banner
  };

  try {
    const response = await fetch(
      SUPABASE_URL + "/rest/v1/stores",
      {
        method: "POST",
        headers: getSupabaseHeaders(),
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const err = await response.json();
      console.error(err);
      alert("Failed to save store. Check console.");
      return;
    }

    const data = await response.json();
    const storeId = data[0].id;
    localStorage.setItem("store_id", storeId);

    alert("✅ Store saved to Supabase! Now you can add products.");
  } catch (e) {
    console.error(e);
    alert("Error saving store.");
  }
}

