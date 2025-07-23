const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: 'automax-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Accept any file type for now
        cb(null, true);
    }
});

// Serve static files
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize SQLite database
const db = new sqlite3.Database('./automax.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    // Create users table
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            fullName TEXT,
            phone TEXT,
            role TEXT DEFAULT 'user',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    // Create listings table
    db.exec(`
        CREATE TABLE IF NOT EXISTS listings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            make TEXT NOT NULL,
            model TEXT NOT NULL,
            year INTEGER NOT NULL,
            price REAL NOT NULL,
            mileage INTEGER,
            color TEXT,
            fuelType TEXT,
            transmission TEXT,
            engineSize REAL,
            doors INTEGER,
            description TEXT,
            features TEXT,
            images TEXT,
            status TEXT DEFAULT 'active',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES users (id)
        )
    `);
    
    // Create favorites table
    db.exec(`
        CREATE TABLE IF NOT EXISTS favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            listingId INTEGER NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES users (id),
            FOREIGN KEY (listingId) REFERENCES listings (id),
            UNIQUE(userId, listingId)
        )
    `);
    
    // Create test_drives table
    db.exec(`
        CREATE TABLE IF NOT EXISTS test_drives (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            carId TEXT NOT NULL,
            scheduledDate DATETIME NOT NULL,
            status TEXT DEFAULT 'pending',
            notes TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES users (id)
        )
    `);
    
    // Create default admin user
    db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, adminExists) => {
        if (err) {
            console.error('Error checking admin user:', err);
            return;
        }
        if (!adminExists) {
            const hashedPassword = bcrypt.hashSync('admin', 10);
            db.run(`
                INSERT INTO users (username, email, password, fullName, role)
                VALUES (?, ?, ?, ?, ?)
            `, ['admin', 'admin@automax.com', hashedPassword, 'Administrator', 'admin'], function(err) {
                if (err) {
                    console.error('Error creating admin user:', err);
                } else {
                    console.log('Default admin user created: admin/admin');
                }
            });
        }
    });
    
    console.log('Database tables initialized');
}

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

// API Routes

// User registration
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password, fullName, phone } = req.body;

        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        // Check if user already exists
        const existingUser = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, email);
        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert user
        const result = db.prepare(`
            INSERT INTO users (username, email, password, fullName, phone)
            VALUES (?, ?, ?, ?, ?)
        `).run(username, email, hashedPassword, fullName || null, phone || null);
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: result.lastInsertRowid, username, email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: { id: result.lastInsertRowid, username, email, fullName, phone }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update user profile
app.put('/api/profile', authenticateToken, async (req, res) => {
    try {
        const { fullName, phone } = req.body;
        const userId = req.user.userId;
        
        // Update user profile
        db.prepare(`
            UPDATE users SET fullName = ?, phone = ?, updatedAt = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(fullName || null, phone || null, userId);
        
        // Get updated user data
        const updatedUser = db.prepare('SELECT id, username, email, fullName, phone FROM users WHERE id = ?').get(userId);
        
        res.json(updatedUser);
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create listing
app.post('/api/listings', authenticateToken, upload.any(), async (req, res) => {
    try {
        const {
            make, model, year, price, mileage, color,
            fuelType, transmission, engineSize, doors,
            description, features
        } = req.body;
        
        const userId = req.user.userId;
        
        // Validate required fields
        if (!make || !model || !year || !price) {
            return res.status(400).json({ error: 'Make, model, year, and price are required' });
        }
        
        // Insert listing
        const result = db.prepare(`
            INSERT INTO listings (
                userId, make, model, year, price, mileage, color,
                fuelType, transmission, engineSize, doors,
                description, features
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            userId, make, model, parseInt(year), parseFloat(price),
            mileage ? parseInt(mileage) : null, color,
            fuelType, transmission,
            engineSize ? parseFloat(engineSize) : null,
            doors ? parseInt(doors) : null,
            description, features
        );
        
        res.status(201).json({
            message: 'Listing created successfully',
            listingId: result.lastInsertRowid
        });
    } catch (error) {
        console.error('Listing creation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user listings
app.get('/api/listings/user', authenticateToken, (req, res) => {
    try {
        const userId = req.user.userId;
        const listings = db.prepare(`
            SELECT * FROM listings WHERE userId = ? ORDER BY createdAt DESC
        `).all(userId);
        
        res.json(listings);
    } catch (error) {
        console.error('Get user listings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all listings
app.get('/api/listings', (req, res) => {
    try {
        db.all(`
            SELECT l.*, u.username as ownerUsername
            FROM listings l
            JOIN users u ON l.userId = u.id
            ORDER BY l.createdAt DESC
        `, [], (err, listings) => {
            if (err) {
                console.error('Get listings error:', err);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.json(listings);
            }
        });
    } catch (error) {
        console.error('Get listings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single listing
app.get('/api/listings/:id', (req, res) => {
    try {
        const { id } = req.params;
        db.get(`
            SELECT l.*, u.username as ownerUsername
            FROM listings l
            JOIN users u ON l.userId = u.id
            WHERE l.id = ?
        `, [id], (err, listing) => {
            if (err) {
                console.error('Get listing error:', err);
                res.status(500).json({ error: 'Internal server error' });
            } else if (!listing) {
                res.status(404).json({ error: 'Listing not found' });
            } else {
                res.json(listing);
            }
        });
    } catch (error) {
        console.error('Get listing error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login endpoint
app.post('/api/login', (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Find user
        db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, username], async (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Check password
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Generate JWT token
            const token = jwt.sign(
                { userId: user.id, username: user.username, email: user.email, role: user.role },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role
                }
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user profile
app.get('/api/profile', authenticateToken, (req, res) => {
    db.get('SELECT id, username, email, full_name, phone, created_at FROM users WHERE id = ?', [req.user.id], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    });
});

// Add to favorites
app.post('/api/favorites', authenticateToken, (req, res) => {
    const { carId } = req.body;
    const userId = req.user.id;

    // Check if already in favorites
    db.get('SELECT * FROM favorites WHERE user_id = ? AND car_id = ?', [userId, carId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (row) {
            return res.status(400).json({ error: 'Car already in favorites' });
        }

        // Add to favorites
        db.run('INSERT INTO favorites (user_id, car_id) VALUES (?, ?)', [userId, carId], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to add to favorites' });
            }

            res.json({ message: 'Added to favorites', favoriteId: this.lastID });
        });
    });
});

// Get user favorites
app.get('/api/favorites', authenticateToken, (req, res) => {
    db.all('SELECT car_id FROM favorites WHERE user_id = ?', [req.user.id], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        const favoriteCarIds = rows.map(row => row.car_id);
        res.json({ favorites: favoriteCarIds });
    });
});

// Remove from favorites
app.delete('/api/favorites/:carId', authenticateToken, (req, res) => {
    const { carId } = req.params;
    const userId = req.user.id;

    db.run('DELETE FROM favorites WHERE user_id = ? AND car_id = ?', [userId, carId], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Favorite not found' });
        }

        res.json({ message: 'Removed from favorites' });
    });
});

// Schedule test drive
app.post('/api/test-drive', authenticateToken, (req, res) => {
    const { carId, carName, preferredDate, preferredTime, phone, message } = req.body;
    const userId = req.user.id;

    if (!carId || !carName || !preferredDate || !preferredTime) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    db.run(
        'INSERT INTO test_drives (user_id, car_id, car_name, preferred_date, preferred_time, phone, message) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, carId, carName, preferredDate, preferredTime, phone || '', message || ''],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to schedule test drive' });
            }

            res.json({ message: 'Test drive scheduled successfully', testDriveId: this.lastID });
        }
    );
});

// Get user test drives
app.get('/api/test-drives', authenticateToken, (req, res) => {
    db.all(
        'SELECT * FROM test_drives WHERE user_id = ? ORDER BY created_at DESC',
        [req.user.id],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            res.json({ testDrives: rows });
        }
    );
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve car detail page
app.get('/car-detail.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'car-detail.html'));
});

// Start server
// Favorites API
app.post('/api/favorites', authenticateToken, (req, res) => {
    try {
        const { listingId } = req.body;
        const userId = req.user.userId;
        
        db.run(
            'INSERT INTO favorites (userId, listingId) VALUES (?, ?)',
            [userId, listingId],
            function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ error: 'Already in favorites' });
                    }
                    return res.status(500).json({ error: 'Database error' });
                }
                res.json({ message: 'Added to favorites', id: this.lastID });
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/favorites/:listingId', authenticateToken, (req, res) => {
    try {
        const { listingId } = req.params;
        const userId = req.user.userId;
        
        db.run(
            'DELETE FROM favorites WHERE userId = ? AND listingId = ?',
            [userId, listingId],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }
                res.json({ message: 'Removed from favorites' });
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/favorites', authenticateToken, (req, res) => {
    try {
        const userId = req.user.userId;
        
        db.all(
            `SELECT l.* FROM listings l 
             INNER JOIN favorites f ON l.id = f.listingId 
             WHERE f.userId = ? AND l.status = 'active'`,
            [userId],
            (err, rows) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }
                res.json(rows);
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin middleware
function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
}

// Admin API - Get all listings
app.get('/api/admin/listings', authenticateToken, requireAdmin, (req, res) => {
    try {
        db.all(
            `SELECT l.*, u.username as ownerUsername 
             FROM listings l 
             LEFT JOIN users u ON l.userId = u.id 
             ORDER BY l.createdAt DESC`,
            [],
            (err, rows) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }
                res.json(rows);
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin API - Delete listing
app.delete('/api/admin/listings/:id', authenticateToken, requireAdmin, (req, res) => {
    try {
        const { id } = req.params;
        
        db.run(
            'DELETE FROM listings WHERE id = ?',
            [id],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }
                if (this.changes === 0) {
                    return res.status(404).json({ error: 'Listing not found' });
                }
                res.json({ message: 'Listing deleted successfully' });
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin API - Update listing status
app.put('/api/admin/listings/:id/status', authenticateToken, requireAdmin, (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        db.run(
            'UPDATE listings SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
            [status, id],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }
                if (this.changes === 0) {
                    return res.status(404).json({ error: 'Listing not found' });
                }
                res.json({ message: 'Listing status updated successfully' });
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
});