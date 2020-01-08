const db = require("../utils/db");
const tbName = 'GiaiDau';

module.exports = {
    GetByID: async id => {
        const sql = `SELECT * FROM ${tbName} WHERE MaGiaiDau = ${id}`;
        const rows = await db.execute(sql);
        if (rows.length > 0) {
            return rows[0];
        }
        return null;
    },

    GetAll: async () => {
        const sql = `SELECT * FROM ${tbName}`;
        const rows = await db.execute(sql);
        return rows;
    }
};