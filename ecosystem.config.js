const fs = require('fs');
const path = require('path');

const logDir = path.resolve('./logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

module.exports = {
  apps: [{
    name: "fast-qjs",           // 应用名称
    script: "pnpm",             // 使用npm启动
    args: "start",              // 运行 npm start
    instances: "max",           // 启动进程数量，max表示根据CPU核心数
    exec_mode: "cluster",       // 集群模式
    watch: true,                // 启用监听
    ignore_watch: [             // 忽略监听的文件/目录
      "node_modules",
      "logs",
      ".git"
    ],
    max_memory_restart: "2G",    // 内存超过1G自动重启
    env: {
      NODE_ENV: "production",
      QJS_ROOTDIR: "functions",
      QJS_PORT: "5173",
      QJS_PREFIX: "/api",
      QJS_STATIC: "public"
    },
    log_date_format: "YYYY-MM-DD HH:mm:ss",  // 日志时间格式
    error_file: "./logs/error.log",  // 错误日志
    out_file: "./logs/out.log",      // 输出日志
    log_file: "./logs/combined.log"  // 综合日志
  }]
};