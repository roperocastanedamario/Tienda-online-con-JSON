const productHolder = document.getElementById('products');

const searchInput = document.getElementById('searchInput');
const sortProducts = document.getElementById('sortProducts');

const cartButton = document.getElementById('cartButton');
const cartCount = document.getElementById('cartCount');

const cartModal = document.getElementById('cartModal');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');

const clearCartButton = document.getElementById('clearCartButton');
const checkoutButton = document.getElementById('checkoutButton');

const toast = document.getElementById('toast');
const userInfo = document.getElementById('userInfo');

let products = [];
let userData = {};

// Recuperar carrito del LocalStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Cargar productos
fetch('productos.json')
    .then(response => response.json())
    .then(data => {
        products = data;
        showProducts();
    })
    .catch(error => {
        console.error('Error al cargar productos:', error);
    });

// Cargar datos del usuario
fetch('userData.json')
    .then(response => response.json())
    .then(data => {
        userData = data;
    })
    .catch(error => {
        console.error('Error al cargar usuario:', error);
    });

// Mostrar productos
function showProducts() {

    productHolder.innerHTML = '';

    let filteredProducts = products.filter(product => {

        const text = searchInput.value.toLowerCase();

        return (
            product.stock > 0 &&
            (
                product.name.toLowerCase().includes(text) ||
                product.description.toLowerCase().includes(text)
            )
        );
    });

    // Ordenar productos
    if (sortProducts.value === 'asc') {
        filteredProducts.sort((a, b) => a.price - b.price);
    }

    if (sortProducts.value === 'desc') {
        filteredProducts.sort((a, b) => b.price - a.price);
    }

    if (sortProducts.value === 'name') {
        filteredProducts.sort((a, b) =>
            a.name.localeCompare(b.name)
        );
    }

    if (sortProducts.value === 'stock') {
        filteredProducts.sort((a, b) => b.stock - a.stock);
    }

    filteredProducts.forEach(product => {

        const productDiv = document.createElement('div');

        const nameElement = document.createElement('h3');
        nameElement.innerText = product.name;

        const descriptionElement = document.createElement('p');
        descriptionElement.innerText = product.description;

        const priceElement = document.createElement('p');
        priceElement.innerText = 'Precio: ' + product.price + ' €';

        const stockElement = document.createElement('p');
        stockElement.innerText = 'Stock: ' + product.stock;

        const addButton = document.createElement('button');
        addButton.innerText = 'Añadir a la cesta';

        addButton.addEventListener('click', function() {
            addToCart(product.id);
        });

        productDiv.appendChild(nameElement);
        productDiv.appendChild(descriptionElement);
        productDiv.appendChild(priceElement);
        productDiv.appendChild(stockElement);
        productDiv.appendChild(addButton);

        productHolder.appendChild(productDiv);

    });

}

// Añadir producto a la cesta
function addToCart(productId) {

    const product = products.find(p => p.id === productId);

    if (!product) return;

    const quantity = cart.filter(id => id === productId).length;

    if (quantity >= product.stock) {
        showToast('No hay más unidades disponibles');
        return;
    }

    cart.push(productId);

    saveCart();
    showCart();

    showToast(product.name + ' añadido a la cesta');

}

// Guardar carrito en LocalStorage
function saveCart() {

    localStorage.setItem('cart', JSON.stringify(cart));

    updateCartCount();

}

// Contador de la cesta
function updateCartCount() {

    cartCount.innerText = cart.length;

}

// Mostrar cesta
function showCart() {

    cartItems.innerHTML = '';

    let total = 0;

    const quantities = {};

    cart.forEach(id => {
        quantities[id] = (quantities[id] || 0) + 1;
    });

    if (cart.length === 0) {
        cartItems.innerText = 'La cesta está vacía';
    }

    Object.keys(quantities).forEach(id => {

        const product = products.find(p => p.id === Number(id));

        if (!product) return;

        const quantity = quantities[id];

        const itemDiv = document.createElement('div');

        const name = document.createElement('p');
        name.innerText = product.name + ' x ' + quantity;

        const price = document.createElement('p');
        price.innerText = (product.price * quantity).toFixed(2) + ' €';

        const removeButton = document.createElement('button');
        removeButton.innerText = 'Eliminar una unidad';

        removeButton.addEventListener('click', function() {
            removeFromCart(product.id);
        });

        itemDiv.appendChild(name);
        itemDiv.appendChild(price);
        itemDiv.appendChild(removeButton);

        cartItems.appendChild(itemDiv);

        total += product.price * quantity;

    });

    cartTotal.innerText = total.toFixed(2);

    updateCartCount();

}

// Eliminar una unidad
function removeFromCart(productId) {

    const index = cart.indexOf(productId);

    if (index !== -1) {
        cart.splice(index, 1);
    }

    saveCart();
    showCart();

}

// Mostrar datos del usuario
function showUserInfo() {

    userInfo.innerHTML = '';

    const userElement = document.createElement('p');

    userElement.innerText =
        'Cliente: ' + (userData.nombre || '') + ' ' +
        (userData.apellidos || '') +
        ' | Dirección: ' + (userData.direccion || 'No indicada') +
        ' | Ciudad: ' + (userData.ciudad || '');

    userInfo.appendChild(userElement);

}

// Notificaciones Toast
function showToast(message) {

    toast.innerText = message;

    toast.classList.add('show');

    setTimeout(function() {
        toast.classList.remove('show');
    }, 3000);

}

// Abrir cesta
cartButton.addEventListener('click', function() {

    cartModal.style.display = 'flex';

    showCart();
    showUserInfo();

});

// Cerrar cesta
closeCart.addEventListener('click', function() {

    cartModal.style.display = 'none';

});

// Vaciar cesta
clearCartButton.addEventListener('click', function() {

    cart = [];

    saveCart();
    showCart();

    showToast('Cesta vaciada');

});

// Finalizar compra simulada
checkoutButton.addEventListener('click', function() {

    if (cart.length === 0) {
        showToast('La cesta está vacía');
        return;
    }

    cart.forEach(id => {

        const product = products.find(p => p.id === id);

        if (product && product.stock > 0) {
            product.stock--;
        }

    });

    cart = [];

    saveCart();
    showCart();
    showProducts();

    cartModal.style.display = 'none';

    showToast('Compra realizada correctamente');

});

// Buscador en tiempo real
searchInput.addEventListener('input', showProducts);

// Ordenación
sortProducts.addEventListener('change', showProducts);

// Inicializar contador y cesta
updateCartCount();
showCart();
