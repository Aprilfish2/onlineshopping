# 使用官方 Python 镜像
FROM python:3.9-slim

# 设置工作目录
WORKDIR /onlineshopping

# 复制要求和应用代码
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

# 暴露后端应用所需的端口
EXPOSE 5000

# 启动 Flask 应用
CMD ["python", "app.py"]
