# Gunakan image web server Nginx Alpine yang super ringan (~25MB)
FROM nginx:alpine

# Salin folder hasil build statis React (dist) ke direktori web Nginx
COPY dist /usr/share/nginx/html

# Salin konfigurasi Nginx khusus React Router (SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Port Nginx standar
EXPOSE 80

# Jalankan Nginx di foreground
CMD ["nginx", "-g", "daemon off;"]
