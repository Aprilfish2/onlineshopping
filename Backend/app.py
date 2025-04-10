from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import requests
import os
API_HOST = os.environ.get('API_HOST', '0.0.0.0')  # 默认是 0.0.0.0
app.run(debug=True, host=API_HOST, port=5000)

app = Flask(__name__)
# 允许跨域请求
CORS(app)


@app.route('/')
def index():
    return render_template('index.html')


# PayPal配置
PAYPAL_CLIENT_ID = "AeBKHK1dVEjRzDyotOZ6M4QKSDYzEdZUp_3Lxi15v5Rv6NolvnUq0BnngIZsAT7volLfhgtX5o0SQybN"
PAYPAL_CLIENT_SECRET = "EJ0fogAJ7tu4OZAeACAr0ctZznwYNXIWlCVCU9YMxfj9WU20UzMXtdDfeOqBni1VY-bMeasoHecG402E"
PAYPAL_URL = "https://api-m.sandbox.paypal.com"  # 沙箱环境


# 获取access_token
def get_access_token():
    auth_url = f"{PAYPAL_URL}/v1/oauth2/token"
    headers = {
        "Accept": "application/json",
        "Accept-Language": "en_US"
    }
    data = {"grant_type": "client_credentials"}
    auth = (PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET)

    response = requests.post(auth_url, headers=headers, data=data, auth=auth)
    return response.json()["access_token"]

# 创建订单
@app.route('/create-order', methods=['POST'])
def create_order():
    try:
        # 获取前端传过来的参数
        data = request.json
        buyer_info = data.get('buyerInfo')
        amount = data.get('amount')
        access_token = get_access_token()
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}"
        }

        order_data = {
            "intent": "CAPTURE",
            "purchase_units": [{
                "amount": {
                    "currency_code": "USD",
                    "value": str(amount)
                },
                "shipping": {
                    "name": {
                        "full_name": f"{buyer_info['firstName']} {buyer_info['lastName']}"
                    },
                    "address": {
                        "address_line_1": buyer_info['address1'],
                        "address_line_2": buyer_info['address2'],
                        "admin_area_2": buyer_info['city'],
                        "admin_area_1": buyer_info['state'],
                        "postal_code": buyer_info['zipCode'],
                        "country_code": buyer_info['country']
                    }
                }
            }]
        }

        response = requests.post(
            f"{PAYPAL_URL}/v2/checkout/orders",
            headers=headers,
            json=order_data
        )
#这个要发送回给前端，让前端跳转到paypal的页面
        return jsonify(response.json())

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 捕获订单
@app.route('/capture-order', methods=['POST'])
def capture_order():
    try:
        # 获取前端传过来的参数
        order_id = request.json.get('orderID')
        access_token = get_access_token()

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}"
        }

        response = requests.post(
            f"{PAYPAL_URL}/v2/checkout/orders/{order_id}/capture",
            headers=headers
        )

        return jsonify(response.json())

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True,host='0.0.0.0',port=5000)
