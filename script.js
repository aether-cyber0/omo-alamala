/* =========================================
   OMO ALAMALA - WEBSITE JAVASCRIPT
========================================= */

/* FOOD MENU
   These are demonstration prices.
   Update them when the restaurant confirms
   its official menu and prices.
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
   SETTINGS
========================================= */

// Example delivery fee. Replace with the
// restaurant's actual delivery pricing later.
const DELIVERY_FEE = 1000;

let cart = [];
let selectedFulfilment = "Pickup";
let accountMode = "login";
let registeredUser = null;


/* =========================================
   ELEMENTS
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


/* =========================================
   CURRENCY FORMAT
========================================= */

function formatMoney(amount) {
    return "₦" + amount.toLocaleString("en-NG");
}


/* =========================================
   DISPLAY FOOD MENU
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

                    <button class="add-btn" data-food-id="${food.id}">
                        + Add
                    </button>
                </div>
            </div>
        `;

        foodGrid.appendChild(foodCard);

    });

}


/* =========================================
   MENU FILTERS
========================================= */

document.querySelectorAll(".filter-btn").forEach(button => {

    button.addEventListener("click", function() {

        document.querySelectorAll(".filter-btn").forEach(btn => {
            btn.classList.remove("active");
        });

        this.classList.add("active");

        displayFoods(this.dataset.category);

    });

});


/* =========================================
   ADD FOOD TO CART
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

};


/* =========================================
   CART CALCULATIONS
========================================= */

function calculateSubtotal() {

    return cart.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);

}


function calculateTotal() {

    const subtotal = calculateSubtotal();

    const delivery = selectedFulfilment === "Delivery" && cart.length
        ? DELIVERY_FEE
        : 0;

    return subtotal + delivery;

}


/* =========================================
   DISPLAY CART
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
                <small>${formatMoney(item.price)} each</small>
                <br>
                <strong>${formatMoney(item.price * item.quantity)}</strong>
            </div>

            <div class="quantity-controls">
                <button data-action="decrease" data-id="${item.id}"
                    aria-label="Decrease quantity">−</button>

                <span>${item.quantity}</span>

                <button data-action="increase" data-id="${item.id}"
                    aria-label="Increase quantity">+</button>
            </div>
        `;

        cartItems.appendChild(row);

    });

    const itemCount = cart.reduce((sum, item) => {
        return sum + item.quantity;
    }, 0);

    cartCount.textContent = itemCount;

    cartSubtotal.textContent = formatMoney(calculateSubtotal());

    cartDelivery.textContent = formatMoney(
        selectedFulfilment === "Delivery" && cart.length
            ? DELIVERY_FEE
            : 0
    );

    cartTotal.textContent = formatMoney(calculateTotal());

    document.getElementById("checkoutTotal").textContent =
        formatMoney(calculateTotal());

}


/* =========================================
   CHANGE CART QUANTITY
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
   OPEN AND CLOSE CART
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
   CHECKOUT
========================================= */

document.getElementById("checkoutBtn")
    .addEventListener("click", function() {

        if (cart.length === 0) {

            alert("Your cart is empty. Add a meal first.");

            return;

        }

        closeCart();

        updateCart();

        checkoutModal.classList.add("active");

    });


document.getElementById("closeCheckout")
    .addEventListener("click", function() {

        checkoutModal.classList.remove("active");

    });


/* =========================================
   PICKUP OR DELIVERY
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
   PLACE ORDER
========================================= */

document.getElementById("checkoutForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();

        if (cart.length === 0) {

            alert("Your cart is empty.");

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

        // Preserve a copy of the order before clearing the cart.
        const order = {
            reference: "OMA-" + Date.now(),
            customer: name,
            phone: phone,
            fulfilment: selectedFulfilment,
            address: selectedFulfilment === "Delivery" ? address : "Restaurant pickup",
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

        cart = [];

        updateCart();

        this.reset();

        selectedFulfilment = "Pickup";

        document.getElementById("deliveryAddressGroup")
            .classList.add("hidden");

        checkoutModal.classList.remove("active");

    });


/* =========================================
   GENERATE ORDER RECEIPT
========================================= */

function showReceipt(order) {

    const receiptDetails =
        document.getElementById("receiptDetails");

    receiptDetails.innerHTML = "";

    const reference = document.createElement("p");
    reference.className = "receipt-line";
    reference.textContent = "Order reference: " + order.reference;

    const customer = document.createElement("p");
    customer.className = "receipt-line";
    customer.textContent = "Customer: " + order.customer;

    const phone = document.createElement("p");
    phone.className = "receipt-line";
    phone.textContent = "Phone: " + order.phone;

    const fulfilment = document.createElement("p");
    fulfilment.className = "receipt-line";
    fulfilment.textContent = "Fulfilment: " + order.fulfilment;

    const address = document.createElement("p");
    address.className = "receipt-line";
    address.textContent = "Address: " + order.address;

    const date = document.createElement("p");
    date.className = "receipt-line";
    date.textContent = "Date: " + order.date;

    receiptDetails.append(
        reference,
        customer,
        phone,
        fulfilment,
        address,
        date
    );

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

    const subtotal = document.createElement("p");
    subtotal.className = "receipt-line";
    subtotal.textContent = "Subtotal: " + formatMoney(order.subtotal);

    const delivery = document.createElement("p");
    delivery.className = "receipt-line";
    delivery.textContent = "Delivery: " + formatMoney(order.deliveryFee);

    const total = document.createElement("p");
    total.className = "receipt-total";
    total.textContent = "Order total: " + formatMoney(order.total);

    const status = document.createElement("p");
    status.className = "receipt-status";
    status.textContent = "Payment: " + order.paymentStatus;

    receiptDetails.append(subtotal, delivery, total, status);

    receiptModal.classList.add("active");

}


/* =========================================
   PRINT ORDER SUMMARY
========================================= */

document.getElementById("printReceipt")
    .addEventListener("click", function() {

        const receiptContent =
            document.getElementById("receiptDetails").innerHTML;

        const printWindow = window.open("", "_blank");

        if (!printWindow) {

            alert("Please allow pop-ups to print your order summary.");

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
                        border-bottom: 1px solid #ddd;
                        padding: 8px 0;
                    }

                    .receipt-total {
                        font-size: 20px;
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
   DEMONSTRATION CUSTOMER ACCOUNT
========================================= */

document.getElementById("accountBtn")
    .addEventListener("click", function() {

        accountModal.classList.add("active");

    });

document.getElementById("closeAccount")
    .addEventListener("click", function() {

        accountModal.classList.remove("active");

    });


function setAccountMode(mode) {

    accountMode = mode;

    const heading = document.getElementById("accountHeading");
    const nameField = document.getElementById("nameField");
    const nameInput = document.getElementById("accountName");
    const submit = document.getElementById("accountSubmit");
    const switchText = document.getElementById("switchAccount");
    const message = document.getElementById("accountMessage");

    message.textContent = "";

    if (mode === "signup") {

        heading.textContent = "Create Your Account";
        nameField.classList.remove("hidden");
        nameInput.required = true;
        submit.textContent = "Create Account";

        switchText.innerHTML =
            `Already have an account?
            <button type="button" id="switchAccountBtn">Sign in</button>`;

    } else {

        heading.textContent = "Customer Sign In";
        nameField.classList.add("hidden");
        nameInput.required = false;
        submit.textContent = "Sign In";

        switchText.innerHTML =
            `Don't have an account?
            <button type="button" id="switchAccountBtn">Sign up</button>`;

    }

}


document.getElementById("switchAccount")
    .addEventListener("click", function(event) {

        if (event.target.id === "switchAccountBtn") {

            setAccountMode(
                accountMode === "login" ? "signup" : "login"
            );

        }

    });


document.getElementById("accountForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();

        const email =
            document.getElementById("accountEmail").value.trim().toLowerCase();

        const password =
            document.getElementById("accountPassword").value;

        const message =
            document.getElementById("accountMessage");

        if (accountMode === "signup") {

            const name =
                document.getElementById("accountName").value.trim();

            registeredUser = {
                name: name,
                email: email,
                password: password
            };

            message.textContent =
                "Demo account created. You can now sign in.";

            setAccountMode("login");

            return;

        }

        if (!registeredUser) {

            message.textContent =
                "No demo account exists yet. Please sign up first.";

            return;

        }

        if (
            email === registeredUser.email &&
            password === registeredUser.password
        ) {

            message.textContent =
                "Welcome back, " + registeredUser.name + "!";

            document.getElementById("accountBtn").textContent =
                registeredUser.name.split(" ")[0];

            setTimeout(() => {

                accountModal.classList.remove("active");

            }, 1200);

        } else {

            message.textContent =
                "Incorrect email or password.";

        }

    });


/* =========================================
   MOBILE NAVIGATION
========================================= */

document.getElementById("mobileMenuBtn")
    .addEventListener("click", function() {

        document.getElementById("navLinks")
            .classList.toggle("active");

    });


document.querySelectorAll(".nav-links a").forEach(link => {

    link.addEventListener("click", function() {

        document.getElementById("navLinks")
            .classList.remove("active");

    });

});


/* =========================================
   CLOSE MODALS WHEN BACKGROUND IS CLICKED
========================================= */

[checkoutModal, accountModal, receiptModal].forEach(modal => {

    modal.addEventListener("click", function(event) {

        if (event.target === modal) {

            modal.classList.remove("active");

        }

    });

});


/* =========================================
   CURRENT YEAR
========================================= */

document.getElementById("currentYear").textContent =
    new Date().getFullYear();


/* =========================================
   INITIALISE WEBSITE
========================================= */

displayFoods();

updateCart();