/* =========================================
   OMO ALAMALA - WEBSITE JAVASCRIPT
   Supabase Authentication + Shopping Cart
========================================= */


/* =========================================
   1. FOOD MENU
========================================= */

const foods = [
    {
        id: 1,
        name: "Amala",
        category: "Swallow",
        price: 2500,
        description: "Soft, freshly prepared amala.",
        image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=600"
    },
    {
        id: 2,
        name: "Semo",
        category: "Swallow",
        price: 2000,
        description: "Smooth and delicious semovita.",
        image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=600"
    },
    {
        id: 3,
        name: "Eba",
        category: "Swallow",
        price: 1500,
        description: "Freshly prepared garri swallow.",
        image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=600"
    },
    {
        id: 4,
        name: "Jollof Rice",
        category: "Rice",
        price: 1000,
        description: "A tasty serving of Nigerian jollof.",
        image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600"
    },
    {
        id: 5,
        name: "Fried Rice",
        category: "Rice",
        price: 1000,
        description: "Delicious fried rice with vegetables.",
        image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600"
    },
    {
        id: 6,
        name: "Goat Meat",
        category: "Protein",
        price: 1500,
        description: "A tasty portion of goat meat.",
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600"
    },
    {
        id: 7,
        name: "Cow Meat",
        category: "Protein",
        price: 2000,
        description: "Well-seasoned beef portion.",
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600"
    },
    {
        id: 8,
        name: "Beef",
        category: "Protein",
        price: 1000,
        description: "A delicious serving of beef.",
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600"
    }
];


/* =========================================
   2. SUPABASE CONFIGURATION
========================================= */

const SUPABASE_URL =
    "https://aqcrcuvptxpewlqnzzpt.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_z1nK0e9Rqi_C7xFOoVfuZw_XeBUiUNP";

let supabaseClient = null;

if (window.supabase && window.supabase.createClient) {

    supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );

} else {

    console.error(
        "Supabase could not load. Check your internet connection and Supabase CDN script."
    );

}


/* =========================================
   3. WEBSITE SETTINGS
========================================= */

const DELIVERY_FEE = 1000;

let cart = [];
let selectedFulfilment = "Pickup";
let currentUser = null;

// Determines whether successful login should
// take the customer directly to checkout.
let checkoutAfterAuth = false;


/* =========================================
   4. HTML ELEMENTS
========================================= */

const foodGrid = document.getElementById("foodGrid");

const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const cartItems = document.getElementById("cartItems");

const cartCount = document.getElementById("cartCount");
const cartSubtotal = document.getElementById("cartSubtotal");
const cartDelivery = document.getElementById("cartDelivery");
const cartTotal = document.getElementById("cartTotal");

const checkoutModal = document.getElementById("checkoutModal");
const accountModal = document.getElementById("accountModal");
const receiptModal = document.getElementById("receiptModal");

const accountBtn = document.getElementById("accountBtn");

const authCard = document.getElementById("authCard");
const authMessage = document.getElementById("authMessage");

const signInForm = document.getElementById("signInForm");
const signUpForm = document.getElementById("signUpForm");

const signInSubmit = document.getElementById("signInSubmit");
const signUpSubmit = document.getElementById("signUpSubmit");


/* =========================================
   5. CURRENCY FORMAT
========================================= */

function formatMoney(amount) {

    return "₦" + Number(amount).toLocaleString("en-NG");

}


/* =========================================
   6. AUTHENTICATION HELPERS
========================================= */

function setAuthMessage(message, type = "error") {

    if (!authMessage) return;

    authMessage.textContent = message;

    authMessage.classList.remove("success", "error");

    authMessage.classList.add(type);

}


function clearAuthMessage() {

    if (!authMessage) return;

    authMessage.textContent = "";
    authMessage.classList.remove("success", "error");

}


function setButtonLoading(button, loading, normalText) {

    if (!button) return;

    button.disabled = loading;

    button.textContent = loading
        ? "Please wait..."
        : normalText;

}


function openAccountModal() {

    clearAuthMessage();

    if (authCard) {
        authCard.classList.remove("flipped");
    }

    accountModal.classList.add("active");

}


function closeAccountModal() {

    accountModal.classList.remove("active");

    if (authCard) {
        authCard.classList.remove("flipped");
    }

    checkoutAfterAuth = false;

    clearAuthMessage();

}


function updateAccountButton() {

    if (!accountBtn) return;

    if (currentUser) {

        accountBtn.textContent = "Sign Out";

        accountBtn.setAttribute(
            "aria-label",
            "Sign out of your account"
        );

    } else {

        accountBtn.textContent = "Account";

        accountBtn.setAttribute(
            "aria-label",
            "Open customer account"
        );

    }

}


async function getCurrentSession() {

    if (!supabaseClient) return null;

    const { data, error } =
        await supabaseClient.auth.getSession();

    if (error) {

        console.error("Session error:", error);

        return null;

    }

    currentUser = data.session?.user || null;

    updateAccountButton();

    return data.session;

}


function openCheckout() {

    if (!cart.length) {

        alert("Your cart is empty. Add a meal first.");

        return;

    }

    closeCart();

    updateCart();

    // Fill in the customer's saved name if available.
    const customerName = document.getElementById("customerName");

    if (
        customerName &&
        !customerName.value &&
        currentUser
    ) {

        customerName.value =
            currentUser.user_metadata?.full_name || "";

    }

    checkoutModal.classList.add("active");

}


async function handleSuccessfulAuthentication(user) {

    currentUser = user;

    updateAccountButton();

    const shouldContinueToCheckout = checkoutAfterAuth;

    checkoutAfterAuth = false;

    closeAccountModal();

    if (shouldContinueToCheckout) {

        openCheckout();

    }

}


/* =========================================
   7. SUPABASE AUTHENTICATION STATE
========================================= */

if (supabaseClient) {

    supabaseClient.auth.onAuthStateChange(
        (event, session) => {

            currentUser = session?.user || null;

            updateAccountButton();

        }
    );

    // Restore an existing login when the website
    // is opened or refreshed.
    getCurrentSession();

}


/* =========================================
   8. SIGN IN / SIGN UP CARD SWITCHING
========================================= */

document.getElementById("showSignUp")
    .addEventListener("click", function() {

        authCard.classList.add("flipped");

        clearAuthMessage();

    });


document.getElementById("showSignIn")
    .addEventListener("click", function() {

        authCard.classList.remove("flipped");

        clearAuthMessage();

    });


/* =========================================
   9. CUSTOMER SIGN UP
========================================= */

signUpForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    if (!supabaseClient) {

        setAuthMessage(
            "Authentication is unavailable. Please refresh the page and try again."
        );

        return;

    }

    const name =
        document.getElementById("signUpName").value.trim();

    const email =
        document.getElementById("signUpEmail").value.trim().toLowerCase();

    const password =
        document.getElementById("signUpPassword").value;

    if (!name || !email || !password) {

        setAuthMessage("Please complete all the fields.");

        return;

    }

    if (password.length < 6) {

        setAuthMessage(
            "Your password must contain at least 6 characters."
        );

        return;

    }

    setButtonLoading(
        signUpSubmit,
        true,
        "Create Account"
    );

    clearAuthMessage();

    try {

        const { data, error } =
            await supabaseClient.auth.signUp({

                email: email,

                password: password,

                options: {

                    data: {
                        full_name: name
                    },

                    emailRedirectTo: "https://omo-alamala.github.io/omo-alamala/"

                }

            });

        if (error) throw error;

        if (data.session && data.user) {

            setAuthMessage(
                "Your account has been created successfully!",
                "success"
            );

            await handleSuccessfulAuthentication(data.user);

            signUpForm.reset();

        } else {

            authCard.classList.remove("flipped");

            setAuthMessage(
                "Account created! Please check your email and verify your address before signing in.",
                "success"
            );

            signUpForm.reset();

        }

    } catch (error) {

        console.error("Sign-up error:", error);

        setAuthMessage(
            error.message || "Unable to create your account. Please try again."
        );

    } finally {

        setButtonLoading(
            signUpSubmit,
            false,
            "Create Account"
        );

    }

});


/* =========================================
   10. CUSTOMER SIGN IN
========================================= */

signInForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    if (!supabaseClient) {

        setAuthMessage(
            "Authentication is unavailable. Please refresh the page and try again."
        );

        return;

    }

    const email =
        document.getElementById("signInEmail").value.trim().toLowerCase();

    const password =
        document.getElementById("signInPassword").value;

    if (!email || !password) {

        setAuthMessage("Please enter your email and password.");

        return;

    }

    setButtonLoading(
        signInSubmit,
        true,
        "Sign In"
    );

    clearAuthMessage();

    try {

        const { data, error } =
            await supabaseClient.auth.signInWithPassword({

                email: email,

                password: password

            });

        if (error) throw error;

        setAuthMessage(
            "Welcome back!",
            "success"
        );

        await handleSuccessfulAuthentication(data.user);

        signInForm.reset();

    } catch (error) {

        console.error("Sign-in error:", error);

        setAuthMessage(
            error.message || "Sign in failed. Check your details and try again."
        );

    } finally {

        setButtonLoading(
            signInSubmit,
            false,
            "Sign In"
        );

    }

});


/* =========================================
   11. ACCOUNT BUTTON / SIGN OUT
========================================= */

accountBtn.addEventListener("click", async function() {

    if (!currentUser) {

        openAccountModal();

        return;

    }

    if (!supabaseClient) return;

    const shouldSignOut = confirm(
        "Are you sure you want to sign out?"
    );

    if (!shouldSignOut) return;

    const { error } =
        await supabaseClient.auth.signOut();

    if (error) {

        console.error("Sign-out error:", error);

        alert("Unable to sign out. Please try again.");

        return;

    }

    currentUser = null;

    updateAccountButton();

    alert("You have been signed out successfully.");

});


document.getElementById("closeAccount")
    .addEventListener("click", closeAccountModal);


/* =========================================
   12. DISPLAY FOOD MENU
========================================= */

function displayFoods(category = "All") {

    foodGrid.innerHTML = "";

    const filteredFoods = category === "All"
        ? foods
        : foods.filter(food => food.category === category);

    filteredFoods.forEach(food => {

        const foodCard = document.createElement("article");

        foodCard.className = "food-card";

        foodCard.innerHTML = `

            <img
                class="food-image"
                src="${food.image}"
                alt="${food.name}"
                loading="lazy"
            >

            <div class="food-info">

                <h3>${food.name}</h3>

                <p>${food.description}</p>

                <div class="food-bottom">

                    <span class="food-price">
                        ${formatMoney(food.price)}
                    </span>

                    <button
                        class="add-btn"
                        data-food-id="${food.id}"
                    >
                        + Add
                    </button>

                </div>

            </div>

        `;

        foodGrid.appendChild(foodCard);

    });

}


/* =========================================
   13. MENU FILTERS
========================================= */

document.querySelectorAll(".filter-btn")
    .forEach(button => {

        button.addEventListener("click", function() {

            document.querySelectorAll(".filter-btn")
                .forEach(btn => {
                    btn.classList.remove("active");
                });

            this.classList.add("active");

            displayFoods(this.dataset.category);

        });

    });


/* =========================================
   14. ADD FOOD TO CART
========================================= */

foodGrid.addEventListener("click", function(event) {

    const button = event.target.closest(".add-btn");

    if (!button) return;

    const foodId = Number(button.dataset.foodId);

    addToCart(foodId);

});


function addToCart(foodId) {

    const food = foods.find(item => item.id === foodId);

    if (!food) return;

    const existingItem = cart.find(item => item.id === foodId);

    if (existingItem) {

        existingItem.quantity++;

    } else {

        cart.push({

            ...food,

            quantity: 1

        });

    }

    updateCart();

}


/* =========================================
   15. CART CALCULATIONS
========================================= */

function calculateSubtotal() {

    return cart.reduce((sum, item) => {

        return sum + (item.price * item.quantity);

    }, 0);

}


function calculateTotal() {

    const subtotal = calculateSubtotal();

    const delivery =
        selectedFulfilment === "Delivery" && cart.length
            ? DELIVERY_FEE
            : 0;

    return subtotal + delivery;

}


/* =========================================
   16. DISPLAY CART
========================================= */

function updateCart() {

    cartItems.innerHTML = "";

    if (cart.length === 0) {

        cartItems.innerHTML = `

            <p class="empty-cart">
                Your cart is empty. Add something delicious!
            </p>

        `;

    }

    cart.forEach(item => {

        const row = document.createElement("div");

        row.className = "cart-row";

        row.innerHTML = `

            <div>

                <h4>${item.name}</h4>

                <small>
                    ${formatMoney(item.price)} each
                </small>

                <br>

                <strong>
                    ${formatMoney(item.price * item.quantity)}
                </strong>

            </div>

            <div class="quantity-controls">

                <button
                    data-action="decrease"
                    data-id="${item.id}"
                    aria-label="Decrease quantity"
                >
                    −
                </button>

                <span>${item.quantity}</span>

                <button
                    data-action="increase"
                    data-id="${item.id}"
                    aria-label="Increase quantity"
                >
                    +
                </button>

            </div>

        `;

        cartItems.appendChild(row);

    });

    const itemCount = cart.reduce((sum, item) => {

        return sum + item.quantity;

    }, 0);

    cartCount.textContent = itemCount;

    cartSubtotal.textContent =
        formatMoney(calculateSubtotal());

    cartDelivery.textContent = formatMoney(

        selectedFulfilment === "Delivery" && cart.length
            ? DELIVERY_FEE
            : 0

    );

    cartTotal.textContent =
        formatMoney(calculateTotal());

    document.getElementById("checkoutTotal").textContent =
        formatMoney(calculateTotal());

}


/* =========================================
   17. CHANGE CART QUANTITY
========================================= */

cartItems.addEventListener("click", function(event) {

    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = Number(button.dataset.id);

    const item = cart.find(food => food.id === id);

    if (!item) return;

    if (button.dataset.action === "increase") {

        item.quantity++;

    }

    if (button.dataset.action === "decrease") {

        item.quantity--;

        if (item.quantity <= 0) {

            cart = cart.filter(food => food.id !== id);

        }

    }

    updateCart();

});


/* =========================================
   18. OPEN AND CLOSE CART
========================================= */

function openCart() {

    cartDrawer.classList.add("active");

    cartOverlay.classList.add("active");

}


function closeCart() {

    cartDrawer.classList.remove("active");

    cartOverlay.classList.remove("active");

}


document.getElementById("cartToggle")
    .addEventListener("click", openCart);


document.getElementById("closeCart")
    .addEventListener("click", closeCart);


cartOverlay.addEventListener("click", closeCart);


/* =========================================
   19. CHECKOUT - LOGIN REQUIRED
========================================= */

document.getElementById("checkoutBtn")
    .addEventListener("click", async function() {

        if (cart.length === 0) {

            alert("Your cart is empty. Add a meal first.");

            return;

        }

        if (!supabaseClient) {

            alert(
                "Customer authentication is currently unavailable. Please refresh the page and try again."
            );

            return;

        }

        const session = await getCurrentSession();

        // Customers must sign in before checkout.
        if (!session) {

            checkoutAfterAuth = true;

            closeCart();

            openAccountModal();

            return;

        }

        openCheckout();

    });


document.getElementById("closeCheckout")
    .addEventListener("click", function() {

        checkoutModal.classList.remove("active");

    });


/* =========================================
   20. PICKUP OR DELIVERY
========================================= */

document.querySelectorAll('input[name="fulfilment"]')
    .forEach(radio => {

        radio.addEventListener("change", function() {

            selectedFulfilment = this.value;

            const addressGroup =
                document.getElementById("deliveryAddressGroup");

            const addressInput =
                document.getElementById("deliveryAddress");

            if (selectedFulfilment === "Delivery") {

                addressGroup.classList.remove("hidden");

                addressInput.required = true;

            } else {

                addressGroup.classList.add("hidden");

                addressInput.required = false;

                addressInput.value = "";

            }

            updateCart();

        });

    });


/* =========================================
   21. PLACE ORDER / GENERATE SUMMARY
========================================= */

document.getElementById("checkoutForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();

        if (cart.length === 0) {

            alert("Your cart is empty.");

            return;

        }

        // Check authentication again before accepting checkout.
        const session = await getCurrentSession();

        if (!session) {

            checkoutAfterAuth = true;

            checkoutModal.classList.remove("active");

            openAccountModal();

            return;

        }

        const name =
            document.getElementById("customerName").value.trim();

        const phone =
            document.getElementById("customerPhone").value.trim();

        const address =
            document.getElementById("deliveryAddress").value.trim();

        const note =
            document.getElementById("orderNote").value.trim();

        if (!name || !phone) {

            alert("Please enter your name and phone number.");

            return;

        }

        if (selectedFulfilment === "Delivery" && !address) {

            alert("Please enter your delivery address.");

            return;

        }

        const order = {

            reference: "OMA-" + Date.now(),

            customer: name,

            phone: phone,

            email: currentUser?.email || "",

            fulfilment: selectedFulfilment,

            address: selectedFulfilment === "Delivery"
                ? address
                : "Restaurant pickup",

            note: note,

            items: cart.map(item => ({ ...item })),

            subtotal: calculateSubtotal(),

            deliveryFee: selectedFulfilment === "Delivery"
                ? DELIVERY_FEE
                : 0,

            total: calculateTotal(),

            date: new Date().toLocaleString(),

            paymentStatus: "Pending verification",

            orderStatus: "Awaiting payment verification"

        };

        showReceipt(order);

        // Clear the cart after generating the summary.
        cart = [];

        updateCart();

        this.reset();

        selectedFulfilment = "Pickup";

        // Restore pickup as the default selection.
        const pickupOption =
            document.querySelector('input[name="fulfilment"][value="Pickup"]');

        if (pickupOption) {
            pickupOption.checked = true;
        }

        const addressGroup =
            document.getElementById("deliveryAddressGroup");

        const addressInput =
            document.getElementById("deliveryAddress");

        addressGroup.classList.add("hidden");

        addressInput.required = false;

        checkoutModal.classList.remove("active");

    });


/* =========================================
   22. GENERATE ORDER RECEIPT
========================================= */

function showReceipt(order) {

    const receiptDetails =
        document.getElementById("receiptDetails");

    receiptDetails.innerHTML = "";

    function addReceiptText(text, className = "receipt-line") {

        const element = document.createElement("p");

        element.className = className;

        element.textContent = text;

        receiptDetails.appendChild(element);

    }

    addReceiptText(
        "Order reference: " + order.reference
    );

    addReceiptText(
        "Customer: " + order.customer
    );

    addReceiptText(
        "Phone: " + order.phone
    );

    addReceiptText(
        "Fulfilment: " + order.fulfilment
    );

    addReceiptText(
        "Address: " + order.address
    );

    addReceiptText(
        "Date: " + order.date
    );

    if (order.note) {

        addReceiptText(
            "Order note: " + order.note
        );

    }

    order.items.forEach(item => {

        const line = document.createElement("div");

        line.className = "receipt-line";

        const itemName = document.createElement("span");

        itemName.textContent =
            `${item.name} × ${item.quantity}`;

        const itemPrice = document.createElement("strong");

        itemPrice.textContent =
            formatMoney(item.price * item.quantity);

        line.append(itemName, itemPrice);

        receiptDetails.appendChild(line);

    });

    addReceiptText(
        "Subtotal: " + formatMoney(order.subtotal)
    );

    addReceiptText(
        "Delivery: " + formatMoney(order.deliveryFee)
    );

    addReceiptText(
        "Order total: " + formatMoney(order.total),
        "receipt-total"
    );

    addReceiptText(
        "Payment: " + order.paymentStatus,
        "receipt-status"
    );

    addReceiptText(
        "This is an order summary only. Your order has not yet been sent to the restaurant."
    );

    receiptModal.classList.add("active");

}


/* =========================================
   23. PRINT ORDER SUMMARY
========================================= */

document.getElementById("printReceipt")
    .addEventListener("click", function() {

        const receiptContent =
            document.getElementById("receiptDetails").innerHTML;

        const printWindow = window.open("", "_blank");

        if (!printWindow) {

            alert(
                "Please allow pop-ups to print your order summary."
            );

            return;

        }

        printWindow.document.write(`

            <!DOCTYPE html>

            <html>

            <head>

                <title>OMO ALAMALA Order Summary</title>

                <style>

                    body {
                        font-family: Arial, sans-serif;
                        padding: 30px;
                        color: #173D2D;
                    }

                    h1 {
                        text-align: center;
                    }

                    p, div {
                        margin: 12px 0;
                    }

                    .receipt-line {
                        display: flex;
                        justify-content: space-between;
                        gap: 20px;
                        border-bottom: 1px solid #ddd;
                        padding: 8px 0;
                    }

                    .receipt-total {
                        font-size: 20px;
                        font-weight: bold;
                    }

                    .receipt-status {
                        font-weight: bold;
                    }

                </style>

            </head>

            <body>

                <h1>OMO ALAMALA</h1>

                <h3>Order Summary</h3>

                ${receiptContent}

                <p>Thank you for ordering with us!</p>

            </body>

            </html>

        `);

        printWindow.document.close();

        printWindow.focus();

        printWindow.print();

    });


document.getElementById("closeReceipt")
    .addEventListener("click", function() {

        receiptModal.classList.remove("active");

    });


/* =========================================
   24. MOBILE NAVIGATION
========================================= */

document.getElementById("mobileMenuBtn")
    .addEventListener("click", function() {

        const navLinks =
            document.getElementById("navLinks");

        navLinks.classList.toggle("active");

        this.setAttribute(
            "aria-expanded",
            navLinks.classList.contains("active")
        );

    });


document.querySelectorAll(".nav-links a")
    .forEach(link => {

        link.addEventListener("click", function() {

            document.getElementById("navLinks")
                .classList.remove("active");

            document.getElementById("mobileMenuBtn")
                .setAttribute("aria-expanded", "false");

        });

    });


/* =========================================
   25. CLOSE MODALS WHEN BACKGROUND IS CLICKED
========================================= */

[checkoutModal, receiptModal].forEach(modal => {

    modal.addEventListener("click", function(event) {

        if (event.target === modal) {

            modal.classList.remove("active");

        }

    });

});


accountModal.addEventListener("click", function(event) {

    if (event.target === accountModal) {

        closeAccountModal();

    }

});


/* =========================================
   26. CURRENT YEAR
========================================= */

document.getElementById("currentYear").textContent =
    new Date().getFullYear();


/* =========================================
   27. INITIALISE WEBSITE
========================================= */

displayFoods();

updateCart();

updateAccountButton();

console.log("OMO ALAMALA website is ready.");