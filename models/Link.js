class Link {
  constructor(db) {
    this.db = db;
  }

  generateShortCode(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch (err) {
      return false;
    }
  }

  isValidShortCode(code) {
    const regex = /^[A-Za-z0-9]{6,8}$/;
    return regex.test(code);
  }

  async create(longUrl, customCode = null) {
    if (!this.isValidUrl(longUrl)) {
      throw new Error('Invalid URL format');
    }

    if (customCode && !this.isValidShortCode(customCode)) {
      throw new Error('Invalid shortcode format. Must be 6-8 alphanumeric characters.');
    }

    if (customCode) {
      const existing = await this.findByCode(customCode);
      if (existing) {
        throw new Error('Shortcode already exists');
      }
    }

    const code = customCode || this.generateShortCode();

    const query = `
      INSERT INTO links (code, long_url, total_clicks, created_at, last_clicked)
      VALUES ($1, $2, 0, NOW(), NULL)
      RETURNING *
    `;

    const result = await this.db.query(query, [code, longUrl]);
    return result.rows[0];
  }

  async findByCode(code) {
    const query = 'SELECT * FROM links WHERE code = $1';
    const result = await this.db.query(query, [code]);
    return result.rows[0];
  }

  async findAll() {
    const query = 'SELECT * FROM links ORDER BY created_at DESC';
    const result = await this.db.query(query);
    return result.rows;
  }

  async updateClicks(code) {
    const query = `
      UPDATE links 
      SET total_clicks = total_clicks + 1, last_clicked = NOW()
      WHERE code = $1
      RETURNING *
    `;
    const result = await this.db.query(query, [code]);
    return result.rows[0];
  }

  async deleteByCode(code) {
    const query = 'DELETE FROM links WHERE code = $1 RETURNING *';
    const result = await this.db.query(query, [code]);
    return result.rows[0];
  }

  async getStats(code) {
    const query = `
      SELECT code, long_url, total_clicks, created_at, last_clicked
      FROM links 
      WHERE code = $1
    `;
    const result = await this.db.query(query, [code]);
    return result.rows[0];
  }
}

module.exports = Link;