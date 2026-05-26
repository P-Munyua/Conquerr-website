// Product Category Page Handler
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    
    if (category && productCategories[category]) {
        displayProductCategory(category);
    } else {
        redirectToHome();
    }
    
    // Setup quote modal
    setupQuoteModal();
});

function displayProductCategory(categoryKey) {
    const category = productCategories[categoryKey];
    
    // Update breadcrumb
    document.getElementById('breadcrumbCategory').textContent = category.name;
    
    // Update page title
    document.title = `${category.name} - Conquerr Healthcare`;
    
    // Update header
    document.getElementById('categoryTitle').textContent = category.name;
    document.getElementById('categoryDescription').textContent = category.description;
    
    // Display products
    const productsList = document.getElementById('productsList');
    productsList.innerHTML = '';
    
    category.products.forEach(product => {
        const productHTML = `
            <div class="product-item">
                <div class="product-item-header">
                    <h3>${product.name}</h3>
                    <span class="product-sku">SKU: ${product.sku}</span>
                </div>
                <div class="product-item-info">
                    <span class="product-unit"><i class="fas fa-cube"></i> ${product.unit}</span>
                </div>
                <div class="product-item-footer">
                    <button class="btn btn-small" onclick="addToQuote('${product.name}', '${product.sku}')">
                        <i class="fas fa-plus"></i> Add to Quote
                    </button>
                </div>
            </div>
        `;
        productsList.innerHTML += productHTML;
    });
}

function addToQuote(productName, productSKU) {
    // Get existing quote items from localStorage
    let quoteItems = JSON.parse(localStorage.getItem('quoteItems')) || [];
    
    // Add new item
    quoteItems.push({
        name: productName,
        sku: productSKU,
        quantity: 1,
        timestamp: new Date().getTime()
    });
    
    // Save to localStorage
    localStorage.setItem('quoteItems', JSON.stringify(quoteItems));
    
    // Show notification
    showNotification(`"${productName}" added to quote!`);
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function setupQuoteModal() {
    const quoteButtons = document.querySelectorAll('#quoteBtn, #quoteBtn2, #quoteBtn3');
    const closeModal = document.getElementById('closeModal');
    const quoteModal = document.getElementById('quoteModal');
    const emailQuoteBtn = document.getElementById('emailQuoteBtn');
    const whatsappQuoteBtn = document.getElementById('whatsappQuoteBtn');
    
    if (quoteButtons) {
        quoteButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                quoteModal.classList.add('active');
            });
        });
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            quoteModal.classList.remove('active');
        });
    }
    
    if (quoteModal) {
        quoteModal.addEventListener('click', (e) => {
            if (e.target === quoteModal) {
                quoteModal.classList.remove('active');
            }
        });
    }
    
    if (emailQuoteBtn) {
        emailQuoteBtn.addEventListener('click', () => {
            sendEmailQuote();
        });
    }
    
    if (whatsappQuoteBtn) {
        whatsappQuoteBtn.addEventListener('click', () => {
            sendWhatsappQuote();
        });
    }
}

function sendEmailQuote() {
    const quoteItems = JSON.parse(localStorage.getItem('quoteItems')) || [];
    
    let emailBody = 'Hello Conquerr Healthcare,\n\n';
    emailBody += 'I would like to request a quote for the following products:\n\n';
    
    if (quoteItems.length > 0) {
        quoteItems.forEach((item, index) => {
            emailBody += `${index + 1}. ${item.name} (SKU: ${item.sku}) - Quantity: ${item.quantity}\n`;
        });
    } else {
        emailBody += 'Please provide me with product information and pricing.\n';
    }
    
    emailBody += '\n\nThank you,\nLooking forward to your response.';
    
    // Open email client
    const mailtoLink = `mailto:sales@conquerrhealthcare.com?subject=Product Quote Request&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoLink;
    
    // Clear quote items after sending
    setTimeout(() => {
        localStorage.removeItem('quoteItems');
    }, 500);
}

function sendWhatsappQuote() {
    const quoteItems = JSON.parse(localStorage.getItem('quoteItems')) || [];
    
    let whatsappMessage = 'Hello Conquerr Healthcare,%0A%0A';
    whatsappMessage += 'I would like to request a quote for the following products:%0A%0A';
    
    if (quoteItems.length > 0) {
        quoteItems.forEach((item, index) => {
            whatsappMessage += `${index + 1}. ${item.name} (SKU: ${item.sku}) - Qty: ${item.quantity}%0A`;
        });
    } else {
        whatsappMessage += 'Please provide me with product information and pricing.%0A';
    }
    
    whatsappMessage += '%0AThank you!';
    
    // Open WhatsApp
    const whatsappLink = `https://wa.me/254743642093?text=${whatsappMessage}`;
    window.open(whatsappLink, '_blank');
    
    // Clear quote items after sending
    setTimeout(() => {
        localStorage.removeItem('quoteItems');
    }, 500);
}

function redirectToHome() {
    window.location.href = 'index.html';
}