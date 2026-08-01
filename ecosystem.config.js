module.exports = {
  apps: [
    {
      name: "edupresent",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000, // Ubah angka 3000 jika ingin menggunakan port lain
      },
    },
  ],
};
