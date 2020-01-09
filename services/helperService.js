const database = require('../utils/db');

exports.countGold = (string) => {
    const listPayer = [];

    for(let i = 0; i < string.length; i++) {
        if (string[i] == "-") {

            let start = i - 1;
            let end = i + 1;

            let player = "";
            let minute = "";

            while (start >= 0) {
                //Nếu gặp ký tự không phải số thì dừng lại
                if (isNaN(string[start]) || string[start] == " ") {
                    start++;
                    break;
                }

                player = player.concat(string[start]);
                start--;
            }

            while (end < string.length) {
                //Nếu gặp ký tự không phải số thì dừng lại
                if (isNaN(string[end]) || string[end] == " ") {
                    end--;
                    break;
                }

                minute = minute.concat(string[end]);
                end++;
            }

            let temp = "";
            for (let k = player.length - 1; k >= 0; k--) {
                temp = temp.concat(player[k]);
            }
            player = temp;

            const newGold = {number: player, minute: minute};
            listPayer.push(newGold);
        }
    }
    return listPayer;
};

exports.upDateResultOfMatch = async (listGold, idTeam1, idTeam2, idMatch) => {
    for(const player of listGold)
    {
        const queryUpdateTableCauThu = "UPDATE CauThu SET SoBanThang = SoBanThang + 1 WHERE SoAo = '" + player.number +
            "' AND DoiBongThiDau = '" + idTeam1 + "'; ";

        const MaCauThu = (await database.execute("SELECT MaCauThu AS id FROM CauThu WHERE SoAo = " + player.number + " AND DoiBongThiDau = " + idTeam1 + ";"))[0].id;

        const queryInsertTableBanThang =
            "INSERT INTO BanThang (MaCauThu, DoiThungLuoi, TranDau, ThoiGian) " +
            "VALUES('"+MaCauThu+"','"+idTeam2+"','"+idMatch+"','"+player.minute+"'); ";

        //Thực thi câu lệnh không sử dụng await. Chỉ khi nào cần nhận dữ liệu về mới cần await
        database.execute(queryUpdateTableCauThu);
        database.execute(queryInsertTableBanThang);
    }
};

exports.getAllTournamentOnDB = async (userName) => {
    let query =
        "SELECT * " +
        "FROM GiaiDau ";

    if(userName !==""){
        query = query.concat("WHERE QuanLy='"+userName+"';");
    }

    const listTournamentOnDB = await database.execute(query);

    return listTournamentOnDB;
};

exports.getAllMatchPlayedByIdTournament = async (idTournament) =>{
    const query = "SELECT * FROM TranDau WHERE GiaiDau = '" + idTournament + "' AND DiemChuNha != '-1'; ";
    const listMatch = await database.execute(query);

    return listMatch;
};

exports.getAllTeamByIdTournament = () =>{

};