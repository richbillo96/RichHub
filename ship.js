const SUPABASE_URL =
            "https://tdrelswytmscpnkxmcgw.supabase.co";

        const SUPABASE_KEY =
            "sb_publishable_t09l4fnt9ZGfnsc5bzxSdA_s64P1y_q";

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


function logOut() {
    localStorage.removeItem("supabase_access_token");
    localStorage.removeItem("supabase_user");

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
    }
});

localStorage.removeItem("supabase_access_token");
localStorage.removeItem("supabase_user");

function togglePassword() {
  const password = document.getElementById("auth-password");

  if (password.type === "password") {
    password.type = "text";
  } else {
    password.type = "password";
  }
}

