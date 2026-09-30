const { app } = require("./app");

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Mini Device Fleet Monitor running on port ${PORT}`);
});

module.exports = server;