const db = require("../utils/db");
const tbName = 'DoiBong';

module.exports = {
    GetNameTeam: async id => {
        const sql = `SELECT * FROM ${tbName} WHERE MaDoiBong = ${id}`;
        const rows = await db.execute(sql);
        if (rows.length > 0) {
            return rows[0].TenDoiBong
        }
        return null;
    },

    GetByID: async id => {
        const sql = `SELECT * FROM ${tbName} WHERE MaDoiBong = ${id}`;
        const rows = await db.execute(sql);
        if (rows.length > 0) {
            return rows[0];
        }
        return null;
    }
};