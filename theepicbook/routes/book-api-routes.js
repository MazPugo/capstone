const db = require("../models");

module.exports = function(app) {

  // GET /api/books — return all books as JSON
  app.get("/api/books", async (req, res) => {
    try {
      const books = await db.Book.findAll({
        include: db.Author
      });
      res.json(books);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch books" });
    }
  });

};
