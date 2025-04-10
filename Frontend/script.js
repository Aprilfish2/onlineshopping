const API_URL = process.env.API_URL || 'http://localhost:5000';
return fetch(`${API_URL}/capture-order`);

// 商品数据，存两个商品
  const products = [
    { id: 1, name: "Red Pot", code: "P001", price: 0.01},
    { id: 2, name: "Blue Pot", code: "P002", price: 0.02}
]

// 购物车里面需要存id、name、code、price、quantity，等下需要计算总金额
let cart = [];

// 加载完成后
document.addEventListener('DOMContentLoaded', function() {
    renderProducts()
});

// 商品展示
function renderProducts() {
    const productsGrid = document.getElementById('products-grid');
    // 每个商品展示一个
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <h3>${product.name}</h3>
            <p>编号: ${product.code}</p>
            <p>价格: $${product.price.toFixed(2)}</p>
            <div class="quantity-control">
                <input type="number" min="1" value="1" id="qty-${product.id}">
            </div>

<!--选好后点击按钮加入购物车 -->
            <button onclick="addToCart(${product.id})">加入购物车</button>
        </div>
    `).join('');
}


// 添加到购物车
function addToCart(productId) {
    //先去找有没，有的就加数量，没有就新增
    const product = products.find(product => product.id === productId);
    const quantity = parseInt(document.getElementById(`qty-${productId}`).value);
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ ...product, quantity });
    }

    updateCartDisplay();
    alert('成功加入购物车！')
}

// 更新购物车
function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    //看买了哪些商品显示出来
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <span>${item.name}</span>
            <span>x${item.quantity}</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');

    //计算总金额
    updateTotal();
}

// 更新总金额
function updateTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('total-amount').textContent = `$${total.toFixed(2)}`;
}

// 添加一个检查购物车的函数
function isCartEmpty() {
    return cart.length === 0;
}


// PayPal按钮
paypal.Buttons({
    // 点击按钮后
    createOrder: async function(data, actions) {

        // 检查购物车是否为空
        if (isCartEmpty()) {
            alert('请先将商品加入购物车！');
            return;
        }

        // 获取买家信息
        const buyerInfo = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address1: document.getElementById('address1').value,
            address2: document.getElementById('address2').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            zipCode: document.getElementById('zipCode').value,
            country: document.getElementById('country').value
        };

        const amount= cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // 调用后端API创建订单
        return fetch(`${API_URL}/create-order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: amount,
                buyerInfo: buyerInfo
            })
        })
        .then(response => response.json())
        .then(orderData => {
            return orderData.id;
           // alert(`订单创建成功！订单ID: ${orderData.id}`);
        });
    },

    // 订单批准后
     onApprove: function(data, actions) {
        return fetch(`${API_URL}/capture-order` ,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                  orderID: data.orderID
            })
        })
        .then(response => response.json())
        .then(details => alert(`订单支付成功！订单ID: ${details.id}`))
    }
}).render('#paypal-button-container');
