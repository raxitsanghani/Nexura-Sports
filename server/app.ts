import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'nexura_secret_key_2026';

// Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Admin Middleware
export const authenticateAdmin = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        (req as any).admin = decoded;
        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid or expired token.' });
    }
};

// Admin Authentication Route
app.post('/api/admin/login', async (req, res) => {
    const { email, password } = req.body;

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!adminEmail || !adminPasswordHash) {
        return res.status(500).json({ message: 'Admin configuration error' });
    }

    if (email === adminEmail) {
        const isMatch = await bcrypt.compare(password, adminPasswordHash);
        if (isMatch) {
            const token = jwt.sign({ email: adminEmail, role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
            return res.status(200).json({
                message: 'Login successful',
                token
            });
        }
    }

    res.status(401).json({ message: 'Invalid admin credentials' });
});

// Admin Verify Route
app.get('/api/admin/verify', authenticateAdmin, (req, res) => {
    res.status(200).json({ success: true, admin: (req as any).admin });
});

// Set View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Static Files
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.get('/', (req, res) => {
    res.render('index', { title: 'Nexura Sports - Home' });
});

app.get('/login', (req, res) => {
    res.render('login', { title: 'Nexura Sports - Login' });
});

app.get('/signup', (req, res) => {
    res.render('signup', { title: 'Nexura Sports - Signup' });
});

app.get('/woman', (req, res) => {
    res.render('category', { title: 'Nexura Sports - Woman', category: 'Woman' });
});

app.get('/man', (req, res) => {
    res.render('category', { title: 'Nexura Sports - Man', category: 'Man' });
});

app.get('/kids', (req, res) => {
    res.render('category', { title: 'Nexura Sports - Kids', category: 'Kids' });
});

app.get('/sports', (req, res) => {
    res.render('category', { title: 'Nexura Sports - Sports', category: 'Sports' });
});

app.get('/sale', (req, res) => {
    res.render('category', { title: 'Nexura Sports - Sale', category: 'Sale' });
});

app.get('/favorites', (req, res) => {
    res.render('favorites', { title: 'My Favorites' });
});

app.get('/checkout', (req, res) => {
    res.render('checkout', { title: 'Checkout' });
});

app.get('/order-confirmation', (req, res) => {
    res.render('order-confirmation', { title: 'Order Confirmed' });
});

app.get('/product/:id', (req, res) => {
    res.render('product', { title: 'Product Details', id: req.params.id });
});

app.get('/cart', (req, res) => {
    res.render('cart', { title: 'My Cart' });
});

app.get('/profile', (req, res) => {
    res.render('profile', { title: 'My Profile' });
});

// Admin Routes (Placeholder)
app.get('/admin', (req, res) => {
    res.render('admin/dashboard', { title: 'Admin Dashboard' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
