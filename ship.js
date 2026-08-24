const SUPABASE_URL =
    "https://tdrelswytmscpnkxmcgw.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_t09l4fnt9ZGfnsc5bzxSdA_s64P1y_q";

// =========================================
// SUPABASE HELPERS
// =========================================

function getSupabaseHeaders() {
    const token = localStorage.getItem("supabase_access_token");

    return {
        "apikey": SUPABASE_KEY,
        "Authorization": token
            ? `Bearer ${token}`
            : `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    };
}

function getCurrentUser() {
    return JSON.parse(
        localStorage.getItem("supabase_user") || "{}"
    );
}


// =========================================
// AUTHENTICATION
// =========================================

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
                    email,
                    password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.msg ||
                data.message ||
                data.error_description ||
                "Sign up failed"
            );
        }

        if (data.access_token) {
            localStorage.setItem(
                "supabase_access_token",
                data.access_token
            );

            localStorage.setItem(
                "supabase_user",
                JSON.stringify(data.user)
            );

            document.getElementById("auth-section").style.display = "none";
            document.getElementById("hub-section").style.display = "block";

            await loadStoreId();
            await displayProducts();

            showAuthMessage(
                "Account created successfully! You are logged in."
            );
        } else {
            showAuthMessage(
                "Account created. Please check your email."
            );
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
            SUPABASE_URL +
            "/auth/v1/token?grant_type=password",
            {
                method: "POST",
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error_description ||
                data.msg ||
                "Login failed"
            );
        }

        localStorage.setItem(
            "supabase_access_token",
            data.access_token
        );

        localStorage.setItem(
            "supabase_user",
            JSON.stringify(data.user)
        );

        document.getElementById("auth-section").style.display = "none";
        document.getElementById("hub-section").style.display = "block";

        await loadStoreId();
        await displayProducts();

        showAuthMessage("Login successful! ✅");

    } catch (error) {
        console.error("Login error:", error);
        showAuthMessage(error.message);
    }
}


function showAuthMessage(message) {
    const messageBox =
        document.getElementById("auth-message");

    if (messageBox) {
        messageBox.textContent = message;
    }
}


function isLoggedIn() {
    return !!localStorage.getItem(
        "supabase_access_token"
    );
}


function logout() {
    localStorage.removeItem(
        "supabase_access_token"
    );

    localStorage.removeItem(
        "supabase_user"
    );

    localStorage.removeItem(
        "store_id"
    );

    document.getElementById("auth-section").style.display = "flex";
    document.getElementById("hub-section").style.display = "none";

    showAuthMessage("You have been logged out.");
}


function checkLoginStatus() {
    if (isLoggedIn()) {
        showAuthMessage("You are logged in ✅");
    } else {
        showAuthMessage(
            "Please log in before placing an order."
        );
    }
}


// =========================================
// PASSWORD / GOOGLE LOGIN
// =========================================

function togglePassword() {
    const password =
        document.getElementById("auth-password");

    if (password.type === "password") {
        password.type = "text";
    } else {
        password.type = "password";
    }
}


async function loginWithGoogle() {
    const redirectTo =
        window.location.origin +
        window.location.pathname;

    window.location.href =
        SUPABASE_URL +
        "/auth/v1/authorize?provider=google&redirect_to=" +
        encodeURIComponent(redirectTo);
}


// =========================================
// DASHBOARD
// =========================================

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
        const element =
            document.getElementById(name);

        if (element) {
            element.style.display =
                name === section
                    ? "block"
                    : "none";
        }
    });

    if (section === "products") {
        displayProducts();
    }
}


// =========================================
// STORE
// =========================================

async function editStore() {
    const storeName =
        document.getElementById("storeName").value.trim();

    const storeDescription =
        document.getElementById("storeDescription")
            .value.trim();

    const storeBanner =
        document.getElementById("storeBanner");

    if (!storeName) {
        alert("Please enter your store name.");
        return;
    }

    if (!storeDescription) {
        alert("Please enter a store description.");
        return;
    }

    // Save locally too
    localStorage.setItem(
        "storeName",
        storeName
    );

    localStorage.setItem(
        "storeDescription",
        storeDescription
    );

    // Save banner locally
    if (
        storeBanner &&
        storeBanner.files &&
        storeBanner.files[0]
    ) {
        const reader = new FileReader();

        reader.onload = async function(event) {

            localStorage.setItem(
                "storeBanner",
                event.target.result
            );

            await saveStoreToSupabase(
                storeName,
                storeDescription,
                event.target.result
            );
        };

        reader.readAsDataURL(
            storeBanner.files[0]
        );

    } else {

        const banner =
            localStorage.getItem("storeBanner") || null;

        await saveStoreToSupabase(
            storeName,
            storeDescription,
            banner
        );
    }
}


async function saveStoreToSupabase(
    name,
    description,
    banner
) {
    const user = getCurrentUser();

    if (!user.id) {
        alert("Please log in first.");
        return null;
    }

    try {

        // Look for an existing store
        const findResponse = await fetch(
            SUPABASE_URL +
            "/rest/v1/stores?user_id=eq." +
            encodeURIComponent(user.id) +
            "&select=*",
            {
                method: "GET",
                headers: getSupabaseHeaders()
            }
        );

        if (!findResponse.ok) {
            throw new Error(
                await findResponse.text()
            );
        }

        const stores =
            await findResponse.json();

        let store;

        // UPDATE existing store
        if (stores.length > 0) {

            store = stores[0];

            const updateResponse =
                await fetch(
                    SUPABASE_URL +
                    "/rest/v1/stores?id=eq." +
                    encodeURIComponent(store.id),
                    {
                        method: "PATCH",
                        headers: getSupabaseHeaders(),
                        body: JSON.stringify({
                            name,
                            description,
                            banner_url: banner
                        })
                    }
                );

            if (!updateResponse.ok) {
                throw new Error(
                    await updateResponse.text()
                );
            }

        }

        // CREATE new store
        else {

            const createResponse =
                await fetch(
                    SUPABASE_URL +
                    "/rest/v1/stores",
                    {
                        method: "POST",
                        headers: getSupabaseHeaders(),
                        body: JSON.stringify({
                            user_id: user.id,
                            name,
                            description,
                            banner_url: banner
                        })
                    }
                );

            if (!createResponse.ok) {
                throw new Error(
                    await createResponse.text()
                );
            }

            const created =
                await createResponse.json();

            store = created[0];
        }

        if (!store || !store.id) {
            throw new Error(
                "Store was saved but no store ID was returned."
            );
        }

        // THIS IS THE IMPORTANT PART
        localStorage.setItem(
            "store_id",
            store.id
        );

        alert(
            "✅ Store saved to Supabase!\n\n" +
            "Your store ID is ready.\n" +
            "You can now add products."
        );

        return store.id;

    } catch (error) {

        console.error(
            "Store save error:",
            error
        );

        alert(
            "❌ Store could not be saved.\n\n" +
            error.message
        );

        return null;
    }
}


// =========================================
// LOAD STORE ID
// =========================================

async function loadStoreId() {

    const user = getCurrentUser();

    if (!user.id) {
        return null;
    }

    try {

        const response = await fetch(
            SUPABASE_URL +
            "/rest/v1/stores?user_id=eq." +
            encodeURIComponent(user.id) +
            "&select=id",
            {
                method: "GET",
                headers: getSupabaseHeaders()
            }
        );

        if (!response.ok) {
            console.error(
                "Store lookup failed:",
                await response.text()
            );
            return null;
        }

        const stores =
            await response.json();

        if (stores.length > 0) {

            localStorage.setItem(
                "store_id",
                stores[0].id
            );

            console.log(
                "Store ID loaded:",
                stores[0].id
            );

            return stores[0].id;
        }

        return null;

    } catch (error) {

        console.error(
            "Could not load store:",
            error
        );

        return null;
    }
}


// =========================================
// BANNER PREVIEW
// =========================================

function previewBanner(input) {

    const preview =
        document.getElementById("bannerPreview");

    if (!preview) return;

    if (
        !input.files ||
        !input.files[0]
    ) {
        preview.innerHTML =
            "<span>No image selected</span>";
        return;
    }

    const file =
        input.files[0];

    if (!file.type.startsWith("image/")) {

        preview.innerHTML =
            "<span>Please select an image.</span>";

        return;
    }

    const reader =
        new FileReader();

    reader.onload =
        function(event) {

            preview.innerHTML =
                '<img src="' +
                event.target.result +
                '" alt="Store Banner">';
        };

    reader.readAsDataURL(file);
}


// =========================================
// ADD PRODUCT → SUPABASE
// =========================================

async function addProduct() {

    const name =
        prompt("Enter product name:");

    if (!name || !name.trim()) {
        return;
    }

    const price =
        prompt("Enter product price:");

    if (
        !price ||
        isNaN(price) ||
        Number(price) < 0
    ) {
        alert("Please enter a valid price.");
        return;
    }

    const description =
        prompt("Enter product description:");

    if (
        !description ||
        !description.trim()
    ) {
        return;
    }

    const stockInput =
        prompt(
            "Enter product stock:",
            "10"
        );

    if (
        stockInput === null ||
        isNaN(stockInput) ||
        Number(stockInput) < 0
    ) {
        alert("Please enter a valid stock amount.");
        return;
    }

    // Try existing store ID first
    let storeId =
        localStorage.getItem("store_id");

    // If missing, find it from Supabase
    if (!storeId) {
        storeId =
            await loadStoreId();
    }

    // If still missing, tell the user to save store
    if (!storeId) {

        alert(
            "⚠️ Your store has not been saved to Supabase yet.\n\n" +
            "Go to your Store tab and click Edit Store first."
        );

        return;
    }

    const productPayload = {

        store_id: storeId,

        name: name.trim(),

        description:
            description.trim(),

        price:
            Number(price),

        image_url: null,

        stock:
            Number(stockInput)
    };

    try {

        const response =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/product",
                {
                    method: "POST",
                    headers: getSupabaseHeaders(),
                    body:
                        JSON.stringify(
                            productPayload
                        )
                }
            );

        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "Supabase product error:",
                errorText
            );

            alert(
                "❌ Product could not be saved.\n\n" +
                errorText
            );

            return;
        }

        const saved =
            await response.json();

        console.log(
            "Product saved:",
            saved
        );

        alert(
            "✅ Product added to Supabase!"
        );

        await displayProducts();

    } catch (error) {

        console.error(
            "Product error:",
            error
        );

        alert(
            "❌ Something went wrong.\n\n" +
            error.message
        );
    }
}


// =========================================
// DISPLAY PRODUCTS FROM SUPABASE
// =========================================

async function displayProducts() {

    const productsGrid =
        document.getElementById(
            "products-grid"
        );

    if (!productsGrid) {
        return;
    }

    let storeId =
        localStorage.getItem("store_id");

    if (!storeId) {
        storeId =
            await loadStoreId();
    }

    if (!storeId) {

        productsGrid.innerHTML = `
            <div class="products-empty">
                <div>📦</div>
                <h3>No store connected</h3>
                <p>Save your store first.</p>
            </div>
        `;

        return;
    }

    try {

        const response =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/product?store_id=eq." +
                encodeURIComponent(storeId) +
                "&select=*",
                {
                    method: "GET",
                    headers: getSupabaseHeaders()
                }
            );

        if (!response.ok) {

            throw new Error(
                await response.text()
            );
        }

        const products =
            await response.json();

        if (
            !products ||
            products.length === 0
        ) {

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

            const card =
                document.createElement("div");

            card.className =
                "product-card";

            card.innerHTML = `

                ${
                    product.image_url
                    ? `
                        <img
                            class="product-image"
                            src="${product.image_url}"
                            alt="${product.name}"
                        >
                    `
                    : `
                        <div class="product-image">
                            📦
                        </div>
                    `
                }

                <h3>
                    ${product.name}
                </h3>

                <p>
                    ${product.description || ""}
                </p>

                <strong>
                    $${Number(product.price).toFixed(2)}
                </strong>

                <p>
                    Stock: ${product.stock}
                </p>

                <button
                    onclick="deleteProduct('${product.id}')"
                >
                    🗑️ Delete
                </button>
            `;

            productsGrid.appendChild(card);
        });

    } catch (error) {

        console.error(
            "Display products error:",
            error
        );

        productsGrid.innerHTML =
            "<p>Could not load products.</p>";
    }
}


// =========================================
// DELETE PRODUCT FROM SUPABASE
// =========================================

async function deleteProduct(id) {

    if (!id) return;

    const confirmed =
        confirm(
            "Are you sure you want to delete this product?"
        );

    if (!confirmed) {
        return;
    }

    try {

        const response =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/product?id=eq." +
                encodeURIComponent(id),
                {
                    method: "DELETE",
                    headers: getSupabaseHeaders()
                }
            );

        if (!response.ok) {

            throw new Error(
                await response.text()
            );
        }

        alert(
            "✅ Product deleted."
        );

        await displayProducts();

    } catch (error) {

        console.error(
            "Delete product error:",
            error
        );

        alert(
            "❌ Product could not be deleted.\n\n" +
            error.message
        );
    }
}


// =========================================
// PUBLIC PRODUCTS / SHOP
// =========================================

async function loadProducts() {

    const productsList =
        document.getElementById(
            "products-list"
        );

    if (!productsList) {
        return;
    }

    try {

        const response =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/product?select=*",
                {
                    method: "GET",
                    headers: getSupabaseHeaders()
                }
            );

        if (!response.ok) {
            throw new Error(
                await response.text()
            );
        }

        const products =
            await response.json();

        if (
            !products ||
            products.length === 0
        ) {

            productsList.innerHTML =
                "<p>No products available yet.</p>";

            return;
        }

        productsList.innerHTML =
            products.map(product => {

                let image =
                    product.image_url;

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
                            $${Number(product.price || 0).toFixed(2)}
                        </div>

                        <div class="stock">
                            Stock: ${product.stock || 0}
                        </div>

                        <button
                            class="buy-btn"
                            onclick="buyProduct(
                                '${String(product.name || "Product").replace(/'/g, "\\'")}',
                                ${Number(product.price || 0)}
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


// =========================================
// BUY PRODUCT
// =========================================

async function buyProduct(
    name,
    price
) {

    const accessToken =
        localStorage.getItem(
            "supabase_access_token"
        );

    if (!accessToken) {

        alert(
            "Please log in or sign up before placing an order."
        );

        const authSection =
            document.getElementById(
                "auth-section"
            );

        if (authSection) {

            authSection.style.display =
                "block";

            authSection.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }

        return;
    }

    try {

        const customerName =
            prompt(
                "Enter your full name:"
            );

        if (!customerName) return;

        const customerPhone =
            prompt(
                "Enter your phone number:"
            );

        if (!customerPhone) return;

        const shippingAddress =
            prompt(
                "Enter your delivery address:"
            );

        if (!shippingAddress) return;

        const quantityInput =
            prompt(
                "How many do you want?",
                "1"
            );

        const quantity =
            Number(quantityInput);

        if (
            !Number.isInteger(quantity) ||
            quantity < 1
        ) {
            alert(
                "Please enter a valid quantity."
            );
            return;
        }

        const totalAmount =
            Number(price) * quantity;

        const response =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/Orders",
                {
                    method: "POST",
                    headers: {
                        ...getSupabaseHeaders(),
                        "Authorization":
                            "Bearer " +
                            accessToken
                    },
                    body: JSON.stringify({
                        product_name: name,
                        quantity,
                        customer_name:
                            customerName,
                        customer_phone:
                            customerPhone,
                        shipping_address:
                            shippingAddress,
                        total_amount:
                            totalAmount,
                        status:
                            "pending"
                    })
                }
            );

        if (!response.ok) {

            throw new Error(
                await response.text()
            );
        }

        alert(
            "Order placed successfully! 🎉\n\n" +
            "Product: " + name + "\n" +
            "Quantity: " + quantity + "\n" +
            "Total: $" + totalAmount + "\n\n" +
            "Thank you, " +
            customerName +
            "!"
        );

    } catch (error) {

        console.error(
            "Order error:",
            error
        );

        alert(
            "Order failed ❌\n\n" +
            error.message
        );
    }
}


// =========================================
// PAGE STARTUP
// =========================================

window.addEventListener(
    "DOMContentLoaded",
    async function() {

        const accessToken =
            localStorage.getItem(
                "supabase_access_token"
            );

        if (accessToken) {

            const authSection =
                document.getElementById(
                    "auth-section"
                );

            const hubSection =
                document.getElementById(
                    "hub-section"
                );

            if (authSection)
                authSection.style.display =
                    "none";

            if (hubSection)
                hubSection.style.display =
                    "block";

            await loadStoreId();
            await displayProducts();

        } else {

            const authSection =
                document.getElementById(
                    "auth-section"
                );

            const hubSection =
                document.getElementById(
                    "hub-section"
                );

            if (authSection)
                authSection.style.display =
                    "flex";

            if (hubSection)
                hubSection.style.display =
                    "none";
        }

        // Restore banner preview
        const savedBanner =
            localStorage.getItem(
                "storeBanner"
            );

        const preview =
            document.getElementById(
                "bannerPreview"
            );

        if (
            savedBanner &&
            preview
        ) {

            preview.innerHTML =
                '<img src="' +
                savedBanner +
                '" alt="Saved Store Banner">';
        }

        await loadProducts();
    }
);


// Initial login check
checkLoginStatus();
