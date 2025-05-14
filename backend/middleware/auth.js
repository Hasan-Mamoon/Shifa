import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded); // Debug log

    req.user = {
      id: decoded.id || decoded._id || decoded.userId, // Check all possible ID fields
      email: decoded.email,
      role: decoded.role
    };

    console.log('User object set:', req.user); // Debug log

    if (!req.user.id) {
      console.error('No user ID found in token:', decoded);
      return res.status(401).json({ error: 'Invalid token format - no user ID found' });
    }

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}; 