//const util = require('utils');
const database = require('../utils/db');
const helper = require('../services/helperService');

exports.tournamentManagement = async (req, res, next) => {
    const userName = req.query.username;
    if(typeof userName === "undefined") {
        res.render('tournament_management', {title: 'Quản lí giải đấu'});
    }
    else
    {
        const query =
            "SELECT * " +
            "FROM GiaiDau " +
            "WHERE QuanLy='"+userName+"';";

        const listTournamentOnDB = await database.execute(query);

        const listTournamentForView = [];
        const count = 1;
        for(const item of listTournamentOnDB){
            const idTournament = item.MaGiaiDau;
            const nameTournament = item.TenGiaiDau;
            const newItem = {
                number: count,
                idTournament: idTournament,
                nameTournament: nameTournament,
                urlUpdate: "tournament_management/update?id="+idTournament
            };

            listTournamentForView.push(newItem);
        }

        //res.send(listTournamentForView);
        res.render('tournament_management', {title: 'Quản lí giải đấu', listMatch: listTournamentForView});
    }
};

exports.tournamentUpdate = async (req, res, next) => {
    //Lấy id của giải đấu
    const id = req.query.id;

    //Dựa theo id lấy hết tất cả các trận đấu của giải đấu đó
    const queryGetAllMatch =
        "SELECT TD.MaTranDau as MaTranDau, DB1.TenDoiBong as DoiNha, DB2.TenDoiBong as DoiKhach, GD.TenGiaiDau as TenGiaiDau, " +
        "TD.DiemChuNha as DiemChuNha, TD.DiemKhach as DiemKhach, TD.SanThiDau as SanThiDau, TD.NgayThiDau as NgayThiDau " +
        "FROM TranDau as TD, DoiBong as DB1, DoiBong as DB2, GiaiDau as GD " +
        "WHERE GD.MaGiaiDau = TD.GiaiDau AND TD.DoiChuNha = DB1.MaDoiBong AND TD.DoiKhach = DB2.MaDoiBong AND TD.GiaiDau='"+id+"' " +
        "ORDER BY TD.MaTranDau;";
    const listMatchOnDB = await database.execute(queryGetAllMatch);

    const listMatchForView = [];

    const nameTournament = listMatchOnDB[0].TenGiaiDau;

    for(const item of listMatchOnDB){
        let resultOfMatch;
        let linkUpdate = "/tournament_management/match?updateMatch="+item.MaTranDau;

        if(item.DiemChuNha == -1){
            resultOfMatch = "_ : _";
        }else {
            resultOfMatch = item.DiemChuNha + " : " + item.DiemKhach;
            linkUpdate = "";
        }

        const dateStart = new Date(item.NgayThiDau);
        const day = dateStart.getDate();
        const month = dateStart.getMonth() + 1;
        const year = dateStart.getFullYear();

        const newItem = {
            idMatch: item.MaTranDau,
            nameTeam1: item.DoiNha,
            nameTeam2: item.DoiKhach,
            result: resultOfMatch,
            date: day + "/" + month + "/" + year,
            stadium: item.SanThiDau,
            urlUpdate: linkUpdate,
        };
        listMatchForView.push(newItem);
    };

    res.render('list_match_of_tournament', {title: "Danh sách trận đấu", listMatch: listMatchForView, nameTournament: nameTournament});
};

exports.getTournamentUpdateMatch = async (req, res, next) => {
    //Lấy id của trận đấu
    const idMatch = req.query.updateMatch;

    //Lấy các thông tin cần thiết:
    const query = "SELECT TD.MaTranDau as MaTranDau, DB1.TenDoiBong as DoiNha, DB2.TenDoiBong as DoiKhach, DB1.MaDoiBong as MaDoiNha, DB2.MaDoiBong as MaDoiKhach, " +
        "TD.NgayThiDau as NgayThiDau, GD.TenGiaiDau, GD.MaGiaiDau, TD.DiemChuNha as Status " +
        "FROM TranDau as TD, DoiBong as DB1, DoiBong as DB2, GiaiDau as GD " +
        "WHERE TD.DoiChuNha = DB1.MaDoiBong AND TD.DoiKhach = DB2.MaDoiBong " +
        "AND TD.MaTranDau='"+idMatch+"' AND TD.GiaiDau = GD.MaGiaiDau;";

    const result = (await database.execute(query))[0];

    const status = result.Status;
    if(status != -1){
        res.redirect("/tournament_management/update?id=" + result.MaGiaiDau);
    }

    const dateStart = new Date(result.NgayThiDau);
    const day = dateStart.getDate();
    const month = dateStart.getMonth() + 1;
    const year = dateStart.getFullYear();

    const dataForView = {
        nameTournament: result.TenGiaiDau,
        idTournament: result.MaGiaiDau,
        idMatch: result.MaTranDau,
        idTeam1: result.MaDoiNha,
        nameTeam1: result.DoiNha,
        nameTeam2: result.DoiKhach,
        idTeam2: result.MaDoiKhach,
        date: day + "/" + month + "/" + year,
        urlCancel: "/tournament_management/update?id=" + result.MaGiaiDau,
    };
    res.render('update_result_match', {data: dataForView});
    //res.send(result);
};



exports.postTournamentUpdateMatch = async (req, res, next) => {
    //Cập nhật tỷ số trận đấu sẽ bao gồm:
    // - Cập nhật tỷ số cho bảng TranDau
    // - Thêm các bàn thắng vào bảng BanThang
    // - Cập nhật số bàn thắng của cầu thủ trong bảng CauThu


    const {idtournament, idmatch, idteam1, idteam2, goldteam1, goldteam2} = req.body;

    //Bóc tách chuỗi để tạo ra danh sách bàn thắng
    const listPlayerTeamA = helper.countGold(goldteam1);
    const listPlayerTeamB = helper.countGold(goldteam2);

    //Cập nhật tỷ số trận đấu cho bảng TranDau
    const queryUpdateTableTranDau = "UPDATE TranDau SET DiemChuNha = " +listPlayerTeamA.length + ", " +
        "DiemKhach = " + listPlayerTeamB.length + " WHERE MaTranDau = " + idmatch + "; ";
    database.execute(queryUpdateTableTranDau);


    //Cập nhật số bàn thắng cho cầu thủ
    //Thêm bàn thắng vào bảng BanThang
    helper.upDateResultOfMatch(listPlayerTeamA, idteam1, idteam2, idmatch);
    helper.upDateResultOfMatch(listPlayerTeamB, idteam2, idteam1, idmatch);


    res.redirect('/tournament_management/update?id=' + idtournament);
};