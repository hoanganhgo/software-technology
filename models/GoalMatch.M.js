const db = require("../utils/db");
const tbName = 'BanThang';

module.exports = {
    AllGoalOfMatch: async id => {
        const sql = `SELECT COUNT(*) as total FROM ${tbName} WHERE TranDau=${id}`;
        const rows = await db.execute(sql);
        if (rows.length > 0) {
            return rows[0].total;
        }
        return 0;
    },

    AllGoalsOfGuestTeam: async (match_id, team_id) => {
        const sql = `SELECT COUNT(*) as total FROM ${tbName} WHERE TranDau=${match_id} AND DoiThungLuoi=${team_id}`;
        const rows = await db.execute(sql);
        if (rows.length > 0) {
            return rows[0].total;
        }
        return 0;
    }
};