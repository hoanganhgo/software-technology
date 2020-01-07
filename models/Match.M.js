const db = require("../utils/db");
const tbName = 'TranDau';

module.exports = {
    ThreeMatchCurrently: async () => {
        const sql = `SELECT * FROM ${tbName} ORDER BY NgayThiDau DESC LIMIT 3`;
        const rows = await db.execute(sql);
        if (rows.length > 0) {
            return rows;
        }
        return null;
    },

    AllByTournamentID: async id => {
        const sql = `SELECT * FROM ${tbName} WHERE GiaiDau = ${id}`;
        const rows = await db.execute(sql);
        if (rows.length > 0) {
            return rows;
        }
        return null;
    }
};