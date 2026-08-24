// =========================================
// SUPABASE CONNECTION
// =========================================

// PUT YOUR REAL SUPABASE VALUES HERE

const SUPABASE_URL =
    "https://tdrelswytmscpnkxmcgw.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_t09l4fnt9ZGfnsc5bzxSdA_s64P1y_q";


// =========================================
// SUPABASE HEADERS
// =========================================

function getSupabaseHeaders() {

    const token =
        localStorage.getItem(
            "supabase_access_token"
        );

    return {

        "apikey":
            SUPABASE_KEY,

        "Authorization":
            token
                ? "Bearer " + token
                : "Bearer " + SUPABASE_KEY,

        "Content-Type":
            "application/json",

        "Prefer":
            "return=representation"
    };
}


// =========================================
// CURRENT USER
// =========================================

function getCurrentUser() {

    return JSON.parse(
        localStorage.getItem(
            "supabase_user"
        ) || "{}"
    );
}


// =========================================
// AUTH MESSAGE
// =========================================

function showAuthMessage(message) {

    const box =
        document.getElementById(
            "auth-message"
        );

    if (box) {
        box.textContent = message;
    }
}


// =========================================
// SIGN UP
// =========================================

async function signUp() {

    const email =
        document
            .getElementById("auth-email")
            .value
            .trim();

    const password =
        document
            .getElementById("auth-password")
            .value;

    if (!email || !password) {

        showAuthMessage(
            "Please enter your email and password."
        );

        return;
    }

    try {

        const response =
            await fetch(
                SUPABASE_URL +
                "/auth/v1/signup",
                {
                    method: "POST",

                    headers: {
                        "apikey":
                            SUPABASE_KEY,

                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            email,
                            password
                        })
                }
            );

        const data =
            await response.json();

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

            openHub();

            await loadStore();

            await displayProducts();

        } else {

            showAuthMessage(
                "Account created. Please check your email."
            );
        }

    } catch (error) {

        console.error(
            "Sign up error:",
            error
        );

        showAuthMessage(
            error.message
        );
    }
}


// =========================================
// LOGIN
// =========================================

async function logIn() {

    const email =
        document
            .getElementById("auth-email")
            .value
            .trim();

    const password =
        document
            .getElementById("auth-password")
            .value;

    if (!email || !password) {

        showAuthMessage(
            "Please enter your email and password."
        );

        return;
    }

    try {

        const response =
            await fetch(
                SUPABASE_URL +
                "/auth/v1/token?grant_type=password",
                {
                    method: "POST",

                    headers: {
                        "apikey":
                            SUPABASE_KEY,

                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            email,
                            password
                        })
                }
            );

        const data =
            await response.json();

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

        openHub();

        await loadStore();

        await displayProducts();

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        showAuthMessage(
            error.message
        );
    }
}


// =========================================
// OPEN HUB
// =========================================

function openHub() {

    document.getElementById(
        "auth-section"
    ).style.display = "none";

    document.getElementById(
        "hub-section"
    ).style.display = "block";

    showDashboard(
        "overview"
    );
}


// =========================================
// LOGOUT
// =========================================

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

    document.getElementById(
        "auth-section"
    ).style.display = "flex";

    document.getElementById(
        "hub-section"
    ).style.display = "none";
}


// =========================================
// PASSWORD
// =========================================

function togglePassword() {

    const password =
        document.getElementById(
            "auth-password"
        );

    password.type =
        password.type === "password"
            ? "text"
            : "password";
}


// =========================================
// GOOGLE LOGIN
// =========================================

function loginWithGoogle() {

    const redirectTo =
        window.location.origin +
        window.location.pathname;

    window.location.href =
        SUPABASE_URL +
        "/auth/v1/authorize?provider=google&redirect_to=" +
        encodeURIComponent(
            redirectTo
        );
}


// =========================================
// DASHBOARD NAVIGATION
// =========================================

function showDashboard(section) {

    const sections = [

        "overview",
        "store",
        "store-editor",
        "products",
        "orders",
        "customers",
        "revenue",
        "ads",
        "settings"

    ];

    sections.forEach(
        function(name) {

            const element =
                document.getElementById(
                    name
                );

            if (element) {

                element.style.display =
                    name === section
                        ? "block"
                        : "none";
            }
        }
    );

    if (section === "products") {

        displayProducts();
    }

    if (section === "store") {

        loadStore();
    }
}


// =========================================
// EDIT STORE
// =========================================

function editStore() {
    const user = getCurrentUser();

    if (!user.id) {
        alert("Please log in first.");
        return;
    }

    showDashboard("store-editor");
    loadStore();
}
  await lstore-editor
    showDashboard(
        "store-editor"
    );
}


// =========================================
// LOAD STORE
// =========================================

async function loadStore() {

    const user =
        getCurrentUser();

    if (!user.id) {
        return;
    }

    try {

        const response =
            await fetch(

                SUPABASE_URL +
                "/rest/v1/stores?user_id=eq." +
                encodeURIComponent(user.id) +
                "&select=*",

                {
                    method: "GET",

                    headers:
                        getSupabaseHeaders()
                }
            );

        if (!response.ok) {

            console.error(
                await response.text()
            );

            return;
        }

        const stores =
            await response.json();

        if (!stores.length) {

            return;
        }

        const store =
            stores[0];

        localStorage.setItem(
            "store_id",
            store.id
        );

        const nameInput =
            document.getElementById(
                "storeName"
            );

        const descriptionInput =
            document.getElementById(
                "storeDescription"
            );

        if (nameInput) {

            nameInput.value =
                store.name || "";
        }

        if (descriptionInput) {

            descriptionInput.value =
                store.description || "";
        }

        const nameDisplay =
            document.getElementById(
                "storeNameDisplay"
            );

        const descriptionDisplay =
            document.getElementById(
                "storeDescriptionDisplay"
            );

        if (nameDisplay) {

            nameDisplay.textContent =
                store.name ||
                "RichHub Store";
        }

        if (descriptionDisplay) {

            descriptionDisplay.textContent =
                store.description ||
                "Your trusted online store for quality products.";
        }

        if (store.banner_url) {

            const preview =
                document.getElementById(
                    "bannerPreview"
                );

            if (preview) {

                preview.innerHTML =
                    `<img
                        src="${store.banner_url}"
                        alt="Store Banner"
                    >`;
            }
        }

    } catch (error) {

        console.error(
            "Load store error:",
            error
        );
    }
}


// =========================================
// SAVE EDITED STORE
// =========================================

async function saveEditedStore() {

    const storeName =
        document
            .getElementById(
                "storeName"
            )
            .value
            .trim();

    const storeDescription =
        document
            .getElementById(
                "storeDescription"
            )
            .value
            .trim();

    const bannerInput =
        document.getElementById(
            "storeBanner"
        );

    if (!storeName) {

        alert(
            "Please enter your store name."
        );

        return;
    }

    if (!storeDescription) {

        alert(
            "Please enter a store description."
        );

        return;
    }


    let banner =
        localStorage.getItem(
            "storeBanner"
        ) || null;


    if (
        bannerInput &&
        bannerInput.files &&
        bannerInput.files[0]
    ) {

        const file =
            bannerInput.files[0];

        if (
            !file.type.startsWith(
                "image/"
            )
        ) {

            alert(
                "Please select an image."
            );

            return;
        }

        banner =
            await readFileAsDataURL(
                file
            );

        localStorage.setItem(
            "storeBanner",
            banner
        );
    }


    const storeId =
        localStorage.getItem(
            "store_id"
        );

    const user =
        getCurrentUser();


    if (!user.id) {

        alert(
            "Please log in first."
        );

        return;
    }


    try {

        let response;


        // UPDATE EXISTING STORE

        if (storeId) {

            response =
                await fetch(

                    SUPABASE_URL +
                    "/rest/v1/stores?id=eq." +
                    encodeURIComponent(
                        storeId
                    ),

                    {
                        method: "PATCH",

                        headers:
                            getSupabaseHeaders(),

                        body:
                            JSON.stringify({

                                name:
                                    storeName,

                                description:
                                    storeDescription,

                                banner_url:
                                    banner
                            })
                    }
                );

        }


        // CREATE STORE

        else {

            response =
                await fetch(

                    SUPABASE_URL +
                    "/rest/v1/stores",

                    {
                        method: "POST",

                        headers:
                            getSupabaseHeaders(),

                        body:
                            JSON.stringify({

                                user_id:
                                    user.id,

                                name:
                                    storeName,

                                description:
                                    storeDescription,

                                banner_url:
                                    banner
                            })
                    }
                );
        }


        if (!response.ok) {

            throw new Error(
                await response.text()
            );
        }


        const result =
            await response.json();


        if (
            !storeId &&
            result.length &&
            result[0].id
        ) {

            localStorage.setItem(
                "store_id",
                result[0].id
            );
        }


        // UPDATE DISPLAY

        document.getElementById(
            "storeNameDisplay"
        ).textContent =
            storeName;

        document.getElementById(
            "storeDescriptionDisplay"
        ).textContent =
            storeDescription;


        alert(
            "✅ Your store has been saved!"
        );


        showDashboard(
            "store"
        );


    } catch (error) {

        console.error(
            "Save store error:",
            error
        );

        alert(
            "❌ Store could not be saved.\n\n" +
            error.message
        );
    }
}


// =========================================
// FILE READER
// =========================================

function readFileAsDataURL(file) {

    return new Promise(
        function(resolve, reject) {

            const reader =
                new FileReader();

            reader.onload =
                function(event) {

                    resolve(
                        event.target.result
                    );
                };

            reader.onerror =
                function() {

                    reject(
                        new Error(
                            "Could not read image."
                        )
                    );
                };

            reader.readAsDataURL(
                file
            );
        }
    );
}


// =========================================
// BANNER PREVIEW
// =========================================

function previewBanner(input) {

    const preview =
        document.getElementById(
            "bannerPreview"
        );

    if (!preview) {
        return;
    }

    if (
        !input.files ||
        !input.files[0]
    ) {

        return;
    }

    const file =
        input.files[0];

    if (
        !file.type.startsWith(
            "image/"
        )
    ) {

        preview.innerHTML =
            "<span>Please select an image.</span>";

        return;
    }

    const reader =
        new FileReader();

    reader.onload =
        function(event) {

            preview.innerHTML =
                `<img
                    src="${event.target.result}"
                    alt="Store Banner"
                >`;
        };

    reader.readAsDataURL(
        file
    );
}


// =========================================
// LOAD STORE ID
// =========================================

async function loadStoreId() {

    const user =
        getCurrentUser();

    if (!user.id) {
        return null;
    }

    try {

        const response =
            await fetch(

                SUPABASE_URL +
                "/rest/v1/stores?user_id=eq." +
                encodeURIComponent(user.id) +
                "&select=id",

                {
                    method: "GET",

                    headers:
                        getSupabaseHeaders()
                }
            );

        if (!response.ok) {

            console.error(
                await response.text()
            );

            return null;
        }

        const stores =
            await response.json();

        if (stores.length) {

            localStorage.setItem(
                "store_id",
                stores[0].id
            );

            return stores[0].id;
        }

        return null;

    } catch (error) {

        console.error(
            "Load store ID error:",
            error
        );

        return null;
    }
}


// =========================================
// ADD PRODUCT
// =========================================

async function addProduct() {

    const name =
        prompt(
            "Enter product name:"
        );

    if (!name || !name.trim()) {
        return;
    }


    const price =
        prompt(
            "Enter product price:"
        );

    if (
        !price ||
        isNaN(price) ||
        Number(price) < 0
    ) {

        alert(
            "Please enter a valid price."
        );

        return;
    }


    const description =
        prompt(
            "Enter product description:"
        );

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

        alert(
            "Please enter a valid stock amount."
        );

        return;
    }


    let storeId =
        localStorage.getItem(
            "store_id"
        );


    if (!storeId) {

        storeId =
            await loadStoreId();
    }


    if (!storeId) {

        alert(
            "⚠️ Please create your store first."
        );

        return;
    }


    try {

        const response =
            await fetch(

                SUPABASE_URL +
                "/rest/v1/product",

                {
                    method: "POST",

                    headers:
                        getSupabaseHeaders(),

                    body:
                        JSON.stringify({

                            store_id:
                                storeId,

                            name:
                                name.trim(),

                            description:
                                description.trim(),

                            price:
                                Number(price),

                            image_url:
                                null,

                            stock:
                                Number(
                                    stockInput
                                )
                        })
                }
            );


        if (!response.ok) {

            throw new Error(
                await response.text()
            );
        }


        alert(
            "✅ Product added!"
        );


        await displayProducts();

    } catch (error) {

        console.error(
            "Product error:",
            error
        );

        alert(
            "❌ Product could not be saved.\n\n" +
            error.message
        );
    }
}


// =========================================
// DISPLAY PRODUCTS
// =========================================

async function displayProducts() {

    const grid =
        document.getElementById(
            "products-grid"
        );

    if (!grid) {
        return;
    }


    let storeId =
        localStorage.getItem(
            "store_id"
        );


    if (!storeId) {

        storeId =
            await loadStoreId();
    }


    if (!storeId) {

        grid.innerHTML = `
            <div class="products-empty">
                <div>📦</div>
                <h3>No store connected</h3>
                <p>Create your store first.</p>
            </div>
        `;

        return;
    }


    try {

        const response =
            await fetch(

                SUPABASE_URL +
                "/rest/v1/product?store_id=eq." +
                encodeURIComponent(
                    storeId
                ) +
                "&select=*",

                {
                    method: "GET",

                    headers:
                        getSupabaseHeaders()
                }
            );


        if (!response.ok) {

            throw new Error(
                await response.text()
            );
        }


        const products =
            await response.json();


        if (!products.length) {

            grid.innerHTML = `
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


        grid.innerHTML = "";


        products.forEach(
            function(product) {

                const card =
                    document.createElement(
                        "div"
                    );

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
                        $${Number(
                            product.price
                        ).toFixed(2)}
                    </strong>

                    <p>
                        Stock:
                        ${product.stock}
                    </p>

                    <button
                        onclick="deleteProduct('${product.id}')"
                    >
                        🗑️ Delete
                    </button>
                `;


                grid.appendChild(
                    card
                );
            }
        );

    } catch (error) {

        console.error(
            "Display products error:",
            error
        );

        grid.innerHTML =
            "<p>Could not load products.</p>";
    }
}


// =========================================
// DELETE PRODUCT
// =========================================

async function deleteProduct(id) {

    if (!id) {
        return;
    }


    if (
        !confirm(
            "Are you sure you want to delete this product?"
        )
    ) {

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

                    headers:
                        getSupabaseHeaders()
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
// PAGE STARTUP
// =========================================

window.addEventListener(
    "DOMContentLoaded",
    async function() {

        if (isLoggedIn()) {

            openHub();

            await loadStore();

            await displayProducts();

        } else {

            document.getElementById(
                "auth-section"
            ).style.display =
                "flex";

            document.getElementById(
                "hub-section"
            ).style.display =
                "none";
        }
    }
);


// =========================================
// LOGIN CHECK
// =========================================

function isLoggedIn() {

    return !!localStorage.getItem(
        "supabase_access_token"
    );
                            }
