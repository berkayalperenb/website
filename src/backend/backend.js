const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const {Pool} = require('pg');
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'gali',
    password: 'admin',
    port: 5432,
});
app.post('/signup', async (req, res) => {
    const { firstname,lastname, email, password } = req.body;
    try {
        const query = 'INSERT INTO users (firstname,lastname, email, password) VALUES ($1, $2, $3, $4)';
        await pool.query(query, [firstname,lastname, email, password]);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error registering user' });
    }
});
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const query = 'SELECT * FROM users WHERE email = $1 AND password = $2';
        const result = await pool.query(query, [email, password]);
        if (result.rows.length > 0) {
            res.status(200).json({ message: 'Login successful' });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging in' });
    }
});


// Ürün detaylarını getiren API
app.get('/api/products/:id', async (req, res) => {
  const productId = req.params.id;

  try {
    // Ürün bilgilerini al
    const productQuery = 'SELECT * FROM products WHERE id = $1';
    const productResult = await pool.query(productQuery, [productId]);

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ürün bulunamadı.' });
    }

    const product = productResult.rows[0];

    // Ürün yorumlarını al
    const reviewsQuery = 'SELECT * FROM reviews WHERE product_id = $1';
    const reviewsResult = await pool.query(reviewsQuery, [productId]);

    // Ürün resimlerini al
    const imagesQuery = 'SELECT * FROM product_images WHERE product_id = $1';
    const imagesResult = await pool.query(imagesQuery, [productId]);

    // Verileri birleştir ve gönder
    res.json({
      product,
      reviews: reviewsResult.rows,
      images: imagesResult.rows,
    });
  } catch (error) {
    console.error('Hata:', error);
    res.status(500).json({ error: 'Bir şeyler yanlış gitti.' });
  }
});

// Sunucuyu başlat
app.listen(port, () => {
  console.log(`Sunucu http://localhost:${port} adresinde çalışıyor.`);
});