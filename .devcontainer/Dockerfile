FROM node:20.14.0

# 创建并配置清华源
RUN echo "deb https://mirrors.tuna.tsinghua.edu.cn/debian/ bookworm main contrib non-free non-free-firmware" > /etc/apt/sources.list && \
    echo "deb https://mirrors.tuna.tsinghua.edu.cn/debian/ bookworm-updates main contrib non-free non-free-firmware" >> /etc/apt/sources.list && \
    echo "deb https://mirrors.tuna.tsinghua.edu.cn/debian/ bookworm-backports main contrib non-free non-free-firmware" >> /etc/apt/sources.list && \
    echo "deb https://mirrors.tuna.tsinghua.edu.cn/debian-security bookworm-security main contrib non-free non-free-firmware" >> /etc/apt/sources.list

# 设置 npm 镜像
RUN npm config set registry https://registry.npmmirror.com

# 安装工具
RUN apt-get update && apt-get install -y \
    git \
    curl \
    vim \
    && rm -rf /var/lib/apt/lists/*

# 安装pnpm
RUN npm install -g pnpm

# 设置工作目录
WORKDIR /workspace

# 设置默认 shell
ENV SHELL=/bin/bash

# 使用已存在的 node 用户
USER node
