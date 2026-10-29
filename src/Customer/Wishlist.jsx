import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Common_navbar from '../components/Navbar/Common_navbar'
import Common_Footer from "../components/Footer/Common_Footer";
import { customer_card_product, categoryData } from "../components/All_Images/Images";
import "./Wishlist.css";


const WISHLIST_KEY = "nearshop-wishlist";
const CART_KEY = "nearshop-cart";

// Convert category names into URL-friendly slugs.
function makeSlug(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Keep the wishlist ID separate from the original product ID.
function getWishlistId(product) {
  return String(
    product?.wishlistId ??
    product?.id ??
    product?._id ??
    product?.slug ??
    makeSlug(product?.name || "product")
  );
}

function getOriginalProductId(product) {
  return String(
    product?.productId ??
    product?.id ??
    product?._id ??
    ""
  );
}

function getImage(product) {
  return (
    product?.image ||
    product?.img ||
    product?.src ||
    product?.thumbnail ||
    product?.imageUrl ||
    ""
  );
}

function getPrice(product) {
  return Math.max(0, Number(product?.price || 0));
}

function getOldPrice(product) {
  return Math.max(
    getPrice(product),
    Number(
      product?.oldPrice ??
      product?.old_price ??
      product?.mrp ??
      product?.price ??
      0
    )
  );
}

function readStorage(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function readWishlist() {
  return readStorage(WISHLIST_KEY);
}

function readCart() {
  return readStorage(CART_KEY);
}

// Match a recommendation against saved products.
// Prefer the original ID and category; use the image as a fallback.
function isSameProduct(first, second) {
  const firstId = getOriginalProductId(first);
  const secondId = getOriginalProductId(second);

  const firstCategory = makeSlug(
    first?.categorySlug ?? first?.category ?? ""
  );

  const secondCategory = makeSlug(
    second?.categorySlug ?? second?.category ?? ""
  );

  if (
    firstId &&
    secondId &&
    firstId === secondId &&
    firstCategory &&
    secondCategory &&
    firstCategory === secondCategory
  ) {
    return true;
  }

  const firstImage = getImage(first);
  const secondImage = getImage(second);

  return Boolean(firstImage && secondImage && firstImage === secondImage);
}


export default function Wishlist() {
  const navigate = useNavigate();

    const [wishlist, setWishlist] = useState(readWishlist);
  const [notice, setNotice] = useState("");

  const availableProducts = Array.isArray(customer_card_product)
    ? customer_card_product
    : [];

  // Synchronize wishlist changes from other pages and browser tabs.
  useEffect(() => {
    const syncWishlist = () => {
      setWishlist(readWishlist());
    };

    window.addEventListener(
      "nearshop-wishlist-updated",
      syncWishlist
    );

    window.addEventListener("storage", syncWishlist);

    return () => {
      window.removeEventListener(
        "nearshop-wishlist-updated",
        syncWishlist
      );

      window.removeEventListener("storage", syncWishlist);
    };
  }, []);

  // Save the updated wishlist and notify the other pages.
  function saveWishlist(updatedWishlist) {
    localStorage.setItem(
      WISHLIST_KEY,
      JSON.stringify(updatedWishlist)
    );

    setWishlist(updatedWishlist);

    window.dispatchEvent(
      new Event("nearshop-wishlist-updated")
    );
  }

  // Find the matching product in the real category data.
  function findProductDetails(product) {
    const image = getImage(product);
    const originalId = getOriginalProductId(product);

    const categorySlug = makeSlug(
      product?.categorySlug ?? product?.category ?? ""
    );

    const categories = Object.entries(categoryData || {});

    // Search the saved category first.
    const orderedCategories = [
      ...categories.filter(([slug]) => slug === categorySlug),
      ...categories.filter(([slug]) => slug !== categorySlug),
    ];

    for (const [slug, category] of orderedCategories) {
      const products = Array.isArray(category?.products)
        ? category.products
        : [];

      // Try matching the image first.
      const imageMatch = image
        ? products.find(
          (item) => getImage(item) === image
        )
        : null;

      if (imageMatch) {
        return { slug, product: imageMatch };
      }

      // Only match an ID within its saved category.
      if (slug === categorySlug && originalId) {
        const idMatch = products.find(
          (item) =>
            String(item.id ?? item._id ?? "") === originalId
        );

        if (idMatch) {
          return { slug, product: idMatch };
        }
      }
    }

    // Fallback for products that exist only in homepage data.
    const homeMatch = availableProducts.find((item) => {
      const sameCategory =
        makeSlug(item?.category ?? "") === categorySlug;

      const sameImage =
        image && getImage(item) === image;

      const sameId =
        originalId &&
        String(item?.id ?? item?._id ?? "") === originalId;

      return sameCategory && (sameImage || sameId);
    });

    if (homeMatch) {
      // Homepage-only products can be opened through the same
      // product-details route if Product_detail.jsx supports them.
      return {
        slug: categorySlug,
        product: homeMatch,
      };
    }

    return null;
  }

  // Open the product-details page using the application's route.
  function openProduct(product) {
    const match = findProductDetails(product);

    if (!match || !match.slug || !match.product?.id) {
      setNotice(
        "Product details could not be found. Please check the product data."
      );
      console.error("Product details not found:", product);
      return;
    }

    const selectedProduct = {
      ...match.product,
      image: getImage(match.product),
    };

    sessionStorage.setItem(
      "nearshop_selected_product",
      JSON.stringify(selectedProduct)
    );

    navigate(
      `/category/${match.slug}/product/${encodeURIComponent(
        match.product.id
      )}`,
      {
        state: { product: selectedProduct },
      }
    );
  }

  // Add a product to the wishlist.
  function addToWishlist(product) {
    const wishlistId = getWishlistId(product);

    const alreadySaved = wishlist.some(
      (item) =>
        getWishlistId(item) === wishlistId ||
        isSameProduct(item, product)
    );

    if (alreadySaved) {
      setNotice("This product is already in your Wishlist.");
      return;
    }

    const savedProduct = {
      ...product,
      id: wishlistId,
      wishlistId,
      productId: getOriginalProductId(product),
      category: product.categorySlug ?? product.category ?? "",
      image: getImage(product),
    };

    saveWishlist([...wishlist, savedProduct]);

    setNotice(
      `${product.name || "Product"} added to your Wishlist.`
    );
  }

  // Remove a saved product.
  function removeFromWishlist(product) {
    const wishlistId = getWishlistId(product);

    const updatedWishlist = wishlist.filter(
      (item) => getWishlistId(item) !== wishlistId
    );

    saveWishlist(updatedWishlist);

    setNotice("Product removed from your Wishlist.");
  }

  // Remove every saved product.
  function clearWishlist() {
    saveWishlist([]);
    setNotice("Your Wishlist has been cleared.");
  }

  // Add a wishlist product to the cart.

  function addToCart(product) {
    try {
      // 1. Read the existing cart
      const savedCart = localStorage.getItem("nearshop-cart");
      const cart = savedCart ? JSON.parse(savedCart) : [];

      // 2. Get product details
      const productId = String(
        product.productId ?? product.id ?? product._id ?? ""
      );

      const category = String(
        product.categorySlug ?? product.category ?? ""
      );

      const image =
        product.image ??
        product.images?.[0] ??
        product.img ??
        "";

      if (!productId) {
        console.error("Product ID is missing:", product);
        setNotice("Unable to add product: product ID is missing.");
        return;
      }

      // 3. Find whether the product already exists in the cart
      const existingIndex = cart.findIndex((item) => {
        const sameId = String(
          item.productId ?? item.id ?? item._id ?? ""
        ) === productId;

        const sameCategory =
          String(item.categorySlug ?? item.category ?? "").toLowerCase() ===
          category.toLowerCase();

        return sameId && sameCategory;
      });

      let updatedCart;

      // 4. Increase quantity or add a new product
      if (existingIndex !== -1) {
        updatedCart = cart.map((item, index) =>
          index === existingIndex
            ? {
              ...item,
              quantity: Math.max(1, Number(item.quantity) || 1) + 1,
            }
            : item
        );
      } else {
        const newProduct = {
          ...product,
          id: `${category}-${productId}`,
          productId,
          category,
          name: product.name ?? product.title ?? "Grocery Product",
          price: Number(
            product.price ?? product.sellingPrice ?? product.offerPrice ?? 0
          ),
          mrp: Number(
            product.mrp ?? product.originalPrice ?? product.price ?? 0
          ),
          image,
          quantity: 1,
        };

        updatedCart = [...cart, newProduct];
      }

      // 5. Save the updated cart
      localStorage.setItem("nearshop-cart", JSON.stringify(updatedCart));

      // 6. Notify other components that the cart changed
      window.dispatchEvent(new Event("nearshop-cart-updated"));
      window.dispatchEvent(new Event("storage"));

      // 7. Navigate to the cart page
      navigate("/Add_to_card");
    } catch (error) {
      console.error("Wishlist Add to Cart error:", error);
      setNotice("Could not add this product. Please try again.");
    }
  }

  // Do not recommend products that are already saved.
  const recommendations = availableProducts
    .filter(
      (product) =>
        !wishlist.some(
          (savedProduct) =>
            isSameProduct(savedProduct, product) ||
            getWishlistId(savedProduct) === getWishlistId(product)
        )
    )
    .slice(0, 8);

  function renderProduct(product, isSaved) {
    const productId = getWishlistId(product);
    const image = getImage(product);
    const price = getPrice(product);
    const oldPrice = getOldPrice(product);

    const discount =
      oldPrice > price && oldPrice > 0
        ? Math.round(
          ((oldPrice - price) / oldPrice) * 100
        )
        : 0;

    return (
      <article
        className="ns-wishlist-product"
        key={productId}
      >
        <div className="ns-wishlist-product-visual">
          <button
            type="button"
            className="wishlist-product-image"
            onClick={() => openProduct(product)}
            aria-label={`View ${product.name || "product"} details`}
          >
            {image ? (
              <img
                src={image}
                alt={product.name || "Grocery product"}
                loading="lazy"
              />
            ) : (
              <span>No image available</span>
            )}
          </button>

          {discount > 0 && (
            <span className="ns-wishlist-discount">
              {discount}% OFF
            </span>
          )}

          <button
            type="button"
            className={`ns-wishlist-heart ${isSaved ? "is-saved" : ""
              }`}
            onClick={() =>
              isSaved
                ? removeFromWishlist(product)
                : addToWishlist(product)
            }
            aria-label={
              isSaved
                ? `Remove ${product.name} from Wishlist`
                : `Add ${product.name} to Wishlist`
            }
            aria-pressed={isSaved}
            title={
              isSaved
                ? "Remove from Wishlist"
                : "Add to Wishlist"
            }
          >
            ♡
          </button>
        </div>

        <div className="ns-wishlist-product-info">
          <button
            type="button"
            className="ns-wishlist-product-name"
            onClick={() => openProduct(product)}
          >
            {product.name || "Grocery Product"}
          </button>

          <span className="ns-wishlist-unit">
            {product.weight || product.unit || "1 kg"}
          </span>

          <div className="ns-wishlist-price">
            <strong>₹{price.toFixed(0)}</strong>

            {oldPrice > price && (
              <del>₹{oldPrice.toFixed(0)}</del>
            )}
          </div>

          <div className="ns-wishlist-card-actions">

            <button
              type="button"
              className="ns-wishlist-add-button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                addToCart(product);
              }}
            >
              + Add to Cart
            </button>

            <button
              type="button"
              className="ns-wishlist-view-button"
              onClick={() => openProduct(product)}
            >
              View
            </button>
          </div>
          
        </div>
      </article>
    );
  }


  return (
    <div className="ns-wishlist-page">
    <Common_navbar />

      <main className="ns-wishlist-main">
        <header className="ns-wishlist-header">
          <div>
            <span className="ns-wishlist-eyebrow">
              YOUR NEARSHOP ACCOUNT
            </span>

            <h1>
              My Wishlist
              <span> ({wishlist.length})</span>
            </h1>

            <p>
              Keep your favourite groceries in one place
              and add them to your cart whenever you need them.
            </p>
          </div>

          <Link
            to="/customer"
            className="ns-wishlist-continue"
          >
            ← Continue Shopping
          </Link>
        </header>

        {notice && (
          <div
            className="ns-wishlist-notice"
            role="status"
          >
            <span>✓</span>
            {notice}

            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}

        <div className="ns-wishlist-layout">
          {/* Account navigation */}
          <aside className="ns-wishlist-sidebar">
            <div className="ns-wishlist-account-title">
              <div className="ns-wishlist-account-avatar">
                ♙
              </div>

              <div>
                <strong>My Account</strong>
                <span>Manage your account</span>
              </div>
            </div>

            <nav className="ns-wishlist-nav">
              <Link to="/profile">
                <span>♙</span> My Profile
              </Link>

              <Link to="/orders">
                <span>▤</span> My Orders
              </Link>

              <Link to="/profile#saved-address">
                <span>⌖</span> My Addresses
              </Link>

              <Link
                to="/wishlist"
                className="active"
              >
                <span>♡</span> Wishlist
                <b>{wishlist.length}</b>
              </Link>

              <Link to="/customer">
                <span>◇</span> Offers & Coupons
              </Link>
            </nav>

            <div className="ns-wishlist-side-banner">
              <span aria-hidden="true">🌿</span>

              <strong>Fresh choices, close to home</strong>

              <p>
                Support local shops while shopping for your
                daily essentials.
              </p>

              <Link to="/customer">
                Explore Products →
              </Link>
            </div>
          </aside>

          {/* Wishlist content */}
          <section className="ns-wishlist-content">
            <div className="ns-wishlist-section-heading">
              <div>
                <h2>Saved Products</h2>
                <p>
                  {wishlist.length} saved{" "}
                  {wishlist.length === 1 ? "item" : "items"}
                </p>
              </div>

              {wishlist.length > 0 && (
                <button
                  type="button"
                  className="ns-wishlist-clear"
                  onClick={clearWishlist}
                >
                  ♲ Clear Wishlist
                </button>
              )}
            </div>

            {wishlist.length > 0 ? (
              <div className="ns-wishlist-grid">
                {wishlist.map((product) =>
                  renderProduct(product, true)
                )}
              </div>
            ) : (
              <div className="ns-wishlist-empty">
                <div className="ns-wishlist-empty-icon">
                  ♡
                </div>

                <h2>Your Wishlist is empty</h2>

                <p>
                  Save the products you love by pressing
                  the heart icon on a product card.
                </p>

                <Link to="/customer">
                  Browse Groceries →
                </Link>
              </div>
            )}

          </section>
          
        </div>
      </main>

      <Common_Footer />
    </div>
  );
}