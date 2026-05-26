// ===================================================================
// CONQUERR HEALTHCARE - script.js
// Shared across index.html and products.html
// ===================================================================

// ====== SHARED QUOTE ITEMS STATE ======
// In a real deployment this would use sessionStorage. Here we use a module-level array.
var quoteItems = [];

// ====== ADD TO QUOTE (shared function) ======
function addToQuote(product) {
    var existing = quoteItems.find(function(q) { return q.sku === product.sku; });
    if (existing) {
        existing.quantity += 1;
    } else {
        quoteItems.push({
            name: product.name,
            sku: product.sku,
            unit: product.unit,
            price: product.price,
            quantity: 1
        });
    }
    renderQuoteModal();
    updateNavBadge();
}

// ====== REMOVE FROM QUOTE ======
function removeFromQuote(sku) {
    quoteItems = quoteItems.filter(function(q) { return q.sku !== sku; });
    renderQuoteModal();
    updateNavBadge();
    if (typeof updateFloatingBtn === 'function') updateFloatingBtn();
    // Refresh button on products page if applicable
    refreshProductCardButtons();
}

// ====== UPDATE QUANTITY ======
function updateQuoteQty(sku, qty) {
    var item = quoteItems.find(function(q) { return q.sku === sku; });
    if (item) {
        var n = parseInt(qty);
        if (isNaN(n) || n < 1) n = 1;
        item.quantity = n;
    }
    updateNavBadge();
}

// ====== REFRESH PRODUCT CARD BUTTONS (products page) ======
function refreshProductCardButtons() {
    document.querySelectorAll('.add-quote-btn').forEach(function(btn) {
        var card = btn.closest('.product-card');
        if (!card) return;
        var sku = card.getAttribute('data-sku');
        var inQuote = quoteItems.some(function(q) { return q.sku === sku; });
        if (!inQuote) {
            btn.classList.remove('added');
            btn.innerHTML = '<i class="fas fa-plus"></i> Add to Quote';
        }
    });
}

// ====== UPDATE NAV BADGE ======
function updateNavBadge() {
    var count = quoteItems.length;
    var badges = document.querySelectorAll('#quoteBadge');
    badges.forEach(function(badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-flex' : 'none';
    });
}

// ====== RENDER QUOTE MODAL ITEMS ======
function renderQuoteModal() {
    var listEl = document.getElementById('quoteItemsList');
    var countEl = document.getElementById('quoteItemCount');
    if (!listEl) return;

    countEl.textContent = quoteItems.length > 0 ? '(' + quoteItems.length + ' item' + (quoteItems.length !== 1 ? 's' : '') + ')' : '';

    if (quoteItems.length === 0) {
        listEl.innerHTML = '<div class="quote-empty"><i class="fas fa-cart-plus"></i><p>No products added yet.<br>Browse and add products from the left panel.</p></div>';
        return;
    }

    listEl.innerHTML = quoteItems.map(function(item) {
        return '<div class="quote-item" data-sku="' + item.sku + '">' +
            '<div class="quote-item-info">' +
                '<div class="name">' + item.name + '</div>' +
                '<div class="sku">' + item.sku + ' &bull; ' + item.unit + '</div>' +
            '</div>' +
            '<div class="qty-control">' +
                '<button class="qty-btn" onclick="changeQty(\'' + item.sku + '\', -1)">&#8722;</button>' +
                '<input class="qty-input" type="number" min="1" value="' + item.quantity + '" onchange="updateQuoteQty(\'' + item.sku + '\', this.value)">' +
                '<button class="qty-btn" onclick="changeQty(\'' + item.sku + '\', 1)">&#43;</button>' +
            '</div>' +
            '<button class="remove-item-btn" onclick="removeFromQuote(\'' + item.sku + '\')" title="Remove"><i class="fas fa-trash-alt"></i></button>' +
        '</div>';
    }).join('');
}

function changeQty(sku, delta) {
    var item = quoteItems.find(function(q) { return q.sku === sku; });
    if (item) {
        item.quantity = Math.max(1, item.quantity + delta);
        renderQuoteModal();
    }
}

// ====== POPULATE MODAL CATEGORY DROPDOWN ======
function populateModalCategories() {
    var select = document.getElementById('modalCategorySelect');
    if (!select || typeof productCategories === 'undefined') return;

    Object.keys(productCategories).forEach(function(key) {
        var opt = document.createElement('option');
        opt.value = key;
        opt.textContent = productCategories[key].name;
        select.appendChild(opt);
    });
}

// ====== RENDER MODAL PRODUCT LIST ======
function renderModalProducts(categoryKey, searchQuery) {
    var listEl = document.getElementById('modalProductsList');
    var searchEl = document.getElementById('productSearchInput');
    if (!listEl || typeof productCategories === 'undefined') return;

    if (!categoryKey) {
        listEl.innerHTML = '<div style="padding:20px;text-align:center;color:#94a3b8;font-size:13px"><i class="fas fa-list" style="font-size:28px;margin-bottom:8px;display:block"></i>Select a category to browse products</div>';
        if (searchEl) searchEl.style.display = 'none';
        return;
    }

    var cat = productCategories[categoryKey];
    if (!cat) return;

    if (searchEl) searchEl.style.display = 'block';

    var products = cat.products;
    if (searchQuery) {
        var q = searchQuery.toLowerCase();
        products = products.filter(function(p) {
            return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
        });
    }

    if (products.length === 0) {
        listEl.innerHTML = '<div style="padding:16px;text-align:center;color:#94a3b8;font-size:13px">No products match your search</div>';
        return;
    }

    listEl.innerHTML = products.map(function(p) {
        return '<div class="product-list-item">' +
            '<div>' +
                '<div style="font-weight:600;color:#001a4d;margin-bottom:2px">' + p.name + '</div>' +
                '<div class="sku">' + p.sku + ' &bull; ' + p.unit + '</div>' +
            '</div>' +
            '<button class="add-to-quote-btn" onclick="addToQuote(' + JSON.stringify(p).replace(/"/g, '&quot;') + ');renderModalProducts(document.getElementById(\'modalCategorySelect\').value, document.getElementById(\'productSearchInput\').value);this.innerHTML=\'<i class=&quot;fas fa-check&quot;></i> Added\';this.style.background=\'#16a34a\'">+&nbsp;Add</button>' +
        '</div>';
    }).join('');
}

// ====== SEND VIA EMAIL ======
function sendEmailQuote() {
    var name = (document.getElementById('quoteContactName') || {}).value || '';
    var phone = (document.getElementById('quoteContactPhone') || {}).value || '';
    var notes = (document.getElementById('quoteNotes') || {}).value || '';

    var body = 'Hello Conquerr Healthcare,\n\n';
    body += 'I would like to request a quote for the following products:\n\n';

    if (quoteItems.length > 0) {
        quoteItems.forEach(function(item, i) {
            body += (i + 1) + '. ' + item.name + '\n';
            body += '   SKU: ' + item.sku + ' | Unit: ' + item.unit + ' | Quantity: ' + item.quantity + '\n';
        });
    } else {
        body += 'Please provide me with product information and pricing.\n';
    }

    if (name || phone) {
        body += '\n--- Contact Details ---\n';
        if (name) body += 'Name / Organisation: ' + name + '\n';
        if (phone) body += 'Phone: ' + phone + '\n';
    }

    if (notes) {
        body += '\n--- Additional Notes ---\n' + notes + '\n';
    }

    body += '\nThank you,\nLooking forward to your response.';

    var subject = 'Product Quote Request - Conquerr Healthcare';
    window.location.href = 'mailto:sales@conquerrhealthcare.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);

    setTimeout(function() {
        document.getElementById('quoteModal').classList.remove('active');
    }, 800);
}

// ====== SEND VIA WHATSAPP ======
function sendWhatsappQuote() {
    var name = (document.getElementById('quoteContactName') || {}).value || '';
    var phone = (document.getElementById('quoteContactPhone') || {}).value || '';
    var notes = (document.getElementById('quoteNotes') || {}).value || '';

    var msg = 'Hello Conquerr Healthcare,%0A%0A';
    msg += 'I would like to request a quote for the following products:%0A%0A';

    if (quoteItems.length > 0) {
        quoteItems.forEach(function(item, i) {
            msg += (i + 1) + '. ' + encodeURIComponent(item.name) + '%0A';
            msg += '   SKU: ' + item.sku + ' | Unit: ' + encodeURIComponent(item.unit) + ' | Qty: ' + item.quantity + '%0A';
        });
    } else {
        msg += 'Please provide me with product information and pricing.%0A';
    }

    if (name || phone) {
        msg += '%0AContact: ';
        if (name) msg += encodeURIComponent(name);
        if (phone) msg += ' | ' + encodeURIComponent(phone);
        msg += '%0A';
    }

    if (notes) {
        msg += '%0ANotes: ' + encodeURIComponent(notes) + '%0A';
    }

    msg += '%0AThank you!';

    window.open('https://wa.me/254743642093?text=' + msg, '_blank');

    setTimeout(function() {
        document.getElementById('quoteModal').classList.remove('active');
    }, 500);
}

// ====== MOBILE MENU ======
function setupHamburger() {
    var hamburger = document.getElementById('hamburger');
    var navMenu = document.getElementById('navMenu');
    if (!hamburger || !navMenu) return;

    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
    });

    navMenu.querySelectorAll('a').forEach(function(link) {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
        });
    });
}

// ====== ACTIVE LINK HIGHLIGHTING (index.html) ======
function setupScrollSpy() {
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav-link:not(.btn-quote)');
    if (sections.length === 0) return;

    window.addEventListener('scroll', function() {
        var current = '';
        sections.forEach(function(section) {
            if (window.pageYOffset >= section.offsetTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(function(link) {
            link.classList.remove('active');
            var href = link.getAttribute('href');
            if (href && href.slice(1) === current) {
                link.classList.add('active');
            }
        });
    });
}

// ====== SCROLL TO TOP ======
function setupScrollToTop() {
    var btn = document.getElementById('scrollToTop');
    if (!btn) return;

    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            btn.classList.add('show');
        } else {
            btn.classList.remove('show');
        }
    });

    btn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ====== NAVBAR SHADOW ON SCROLL ======
function setupNavbarShadow() {
    var navbar = document.querySelector('.navbar');
    if (!navbar) return;
    window.addEventListener('scroll', function() {
        navbar.style.boxShadow = window.pageYOffset > 50
            ? '0 4px 12px rgba(0,0,0,0.15)'
            : '0 2px 8px rgba(0,0,0,0.1)';
    });
}

// ====== SCROLL-IN ANIMATION ======
function setupScrollAnimations() {
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -80px 0px' });

    document.querySelectorAll('.product-card, .partner-card, .stat-card').forEach(function(el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// ====== COUNTER ANIMATION (index.html) ======
function animateCounter(el, target, suffix) {
    var duration = 1800;
    var start = 0;
    var step = target / (duration / 16);
    var timer = setInterval(function() {
        start += step;
        if (start >= target) {
            el.textContent = target.toLocaleString() + (suffix || '');
            clearInterval(timer);
        } else {
            el.textContent = Math.floor(start).toLocaleString() + (suffix || '');
        }
    }, 16);
}

function setupCounterAnimation() {
    var aboutSection = document.querySelector('.about-section');
    if (!aboutSection) return;

    var started = false;
    var counterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting && !started) {
                started = true;
                document.querySelectorAll('.stat-number').forEach(function(el) {
                    var text = el.textContent.trim();
                    if (text.includes('+')) {
                        animateCounter(el, parseInt(text.replace(/[^0-9]/g, '')), '+');
                    } else if (text.includes('%')) {
                        animateCounter(el, parseInt(text.replace(/[^0-9]/g, '')), '%');
                    } else if (text.includes(',')) {
                        animateCounter(el, parseInt(text.replace(/[^0-9]/g, '')), '+');
                    }
                });
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counterObserver.observe(aboutSection);
}

// ====== RIPPLE EFFECT ======
function setupRipple() {
    document.querySelectorAll('.btn, .btn-quote').forEach(function(button) {
        button.addEventListener('click', function(e) {
            var ripple = document.createElement('span');
            var rect = this.getBoundingClientRect();
            var size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
            ripple.classList.add('ripple');
            this.appendChild(ripple);
            setTimeout(function() { ripple.remove(); }, 600);
        });
    });
}

// ====== SMOOTH SCROLL ======
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            var href = this.getAttribute('href');
            if (href !== '#' && document.querySelector(href)) {
                e.preventDefault();
                document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// ====== QUOTE MODAL SETUP ======
function setupQuoteModal() {
    // Populate category dropdown in modal
    populateModalCategories();

    // Open modal triggers
    ['quoteBtn', 'quoteBtn2', 'quoteBtn3'].forEach(function(id) {
        var btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                document.getElementById('quoteModal').classList.add('active');
                renderQuoteModal();
            });
        }
    });

    // Close modal
    var closeBtn = document.getElementById('closeModal');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            document.getElementById('quoteModal').classList.remove('active');
        });
    }

    // Click overlay to close
    var overlay = document.getElementById('quoteModal');
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    }

    // Escape key to close
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            var modal = document.getElementById('quoteModal');
            if (modal) modal.classList.remove('active');
        }
    });

    // Category selector inside modal
    var catSelect = document.getElementById('modalCategorySelect');
    if (catSelect) {
        catSelect.addEventListener('change', function() {
            renderModalProducts(this.value, '');
            var searchEl = document.getElementById('productSearchInput');
            if (searchEl) searchEl.value = '';
        });
    }

    // Search inside modal
    var searchEl = document.getElementById('productSearchInput');
    if (searchEl) {
        searchEl.addEventListener('input', function() {
            var catSelect = document.getElementById('modalCategorySelect');
            renderModalProducts(catSelect ? catSelect.value : '', this.value);
        });
    }

    // Send buttons
    var emailBtn = document.getElementById('sendEmailBtn');
    if (emailBtn) emailBtn.addEventListener('click', sendEmailQuote);

    var waBtn = document.getElementById('sendWhatsappBtn');
    if (waBtn) waBtn.addEventListener('click', sendWhatsappQuote);
}

// ====== INIT ON DOM READY ======
document.addEventListener('DOMContentLoaded', function() {
    setupHamburger();
    setupScrollSpy();
    setupScrollToTop();
    setupNavbarShadow();
    setupScrollAnimations();
    setupCounterAnimation();
    setupRipple();
    setupSmoothScroll();
    setupQuoteModal();

    // Fade in page
    document.body.style.opacity = '1';
});
// Make modal accessible globally
window.openQuoteModal = function() {
    const modal = document.getElementById('quoteModal');
    if (modal) modal.classList.add('active');
};
// Fade in
document.body.style.opacity = '0.95';
document.body.style.transition = 'opacity 0.3s ease';