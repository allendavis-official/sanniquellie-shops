// Global variables
let currentShop = {};
const shopName = window.location.pathname.split("/").pop();

// Initialize based on page
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname === "/") {
    loadShopList();
  } else {
    loadShopData();
  }
});

// ======================
// HOMEPAGE FUNCTIONALITY
// ======================

async function loadShopList() {
  try {
    const response = await fetch("/shops/shops.json");
    const shops = await response.json();

    const shopList = document.getElementById("shops-list");
    shopList.innerHTML = shops
      .map(
        (shop) => `
            <div class="shop-card" onclick="window.location='/${shop.slug}'">
                <h3>${shop.businessName}</h3>
                <p>${shop.address}</p>
                <small>View menu →</small>
            </div>
        `
      )
      .join("");
  } catch (error) {
    console.error("Error loading shops:", error);
  }
}

// ======================
// SHOP PAGE FUNCTIONALITY
// ======================

async function loadShopData() {
  try {
    // 1. Load shop metadata
    const shopsResponse = await fetch("/shops/shops.json");
    const shops = await shopsResponse.json();
    currentShop = shops.find((s) => s.slug === shopName);

    if (!currentShop) {
      document.getElementById("shop-name").textContent = "Shop not found";
      return;
    }

    // 2. Update shop info
    document.getElementById("shop-name").textContent = currentShop.businessName;
    document.getElementById("shop-address").textContent = currentShop.address;
    document.getElementById("shop-hours").textContent = `🕒 ${
      currentShop.hours || "8AM - 8PM"
    }`;

    // 3. Set WhatsApp link
    document.getElementById("whatsapp-btn").href = `https://wa.me/${
      currentShop.whatsapp || "231000000000"
    }?text=Hi ${currentShop.businessName}, I saw your products online!`;

    // 4. Load products from Google Sheets
    await loadProducts();

    // 5. Setup search
    document.getElementById("search").addEventListener("input", searchProducts);
  } catch (error) {
    console.error("Error loading shop data:", error);
  }
}

async function loadProducts() {
  try {
    // Replace with your Google Sheet ID and tab name
    const sheetId = "12P5NB5EUoS-G8JHiAKfcbJhY4J9AGjXDt1Zqq3X-EXs";
    const sheetName = encodeURIComponent(
      currentShop.sheetName || currentShop.businessName
    );

    const url = `https://opensheet.elk.sh/${sheetId}/${sheetName}`;

    const response = await fetch(url);
    const products = await response.json();
    // const text = await response.text();
    // const json = JSON.parse(text.substr(47).slice(0, -2));

    renderProducts(products);
  } catch (error) {
    console.error("Error loading products:", error);
    document.getElementById("product-list").innerHTML = `
            <div class="error">Failed to load products. Please try again later.</div>
        `;
  }
}

function renderProducts(products) {
  if (!products || products.length === 0) {
    productList.innerHTML =
      '<div class="no-results">No products available</div>';
    return;
  }

  productList.innerHTML = products
    .map(
      (product) => `
        <div class="product">
            <span class="product-name">${product["Product Name"]}</span>
            <span>$${parseFloat(product.Price).toFixed(2)}</span>
        </div>
    `
    )
    .join("");
}

function searchProducts() {
  const term = document.getElementById("search").value.toLowerCase();
  const products = document.querySelectorAll(".product");

  products.forEach((product) => {
    const name = product
      .querySelector(".product-name")
      .textContent.toLowerCase();
    product.style.display = name.includes(term) ? "flex" : "none";
  });
}
