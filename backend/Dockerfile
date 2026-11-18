FROM node:20-alpine

WORKDIR /app

# Copy seluruh source code backend beserta dependencies
COPY . .

# Buat folder penyimpanan uploads untuk transaksi, profil, dan ktp
RUN mkdir -p uploads/transaksi uploads/profil uploads/ktp

# Environment default
ENV PORT=5001

# Port yang dibuka container (sesuai port server.js)
EXPOSE 5001

# Perintah menjalankan server
CMD ["node", "server.js"]
