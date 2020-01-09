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
        const listTournamentOnDB = await helper.getAllTournamentOnDB(userName);

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

    const {idtournament, idmatch, idteam1, idteam2, goalTeam1, goalTeam2} = req.body;

    //Bóc tách chuỗi để tạo ra danh sách bàn thắng
    const listPlayerTeamA = helper.countGold(goalTeam1);
    const listPlayerTeamB = helper.countGold(goalTeam2);

    let error = false;

    //Kiểm tra tính hợp lệ của cầu thủ
    for(const player of listPlayerTeamA){
        if(await helper.checkPlayerIsExist(player.number, idteam1) == false)
        {
            res.redirect("/tournament_management/match?updateMatch=" + idmatch);
            error = true;
            break;
        }
    }

    if(!error){
        for(const player of listPlayerTeamB){
            if(await helper.checkPlayerIsExist(player.number, idteam2) == false)
            {
                res.redirect("/tournament_management/match?updateMatch=" + idmatch);
                error = true;
                break;
            }
        }
    }

    if(!error){
        //Cập nhật tỷ số trận đấu cho bảng TranDau
        const queryUpdateTableTranDau = "UPDATE TranDau SET DiemChuNha = " +listPlayerTeamA.length + ", " +
            "DiemKhach = " + listPlayerTeamB.length + " WHERE MaTranDau = " + idmatch + "; ";
        database.execute(queryUpdateTableTranDau);

        //Cập nhật số bàn thắng cho cầu thủ
        //Thêm bàn thắng vào bảng BanThang
        helper.upDateResultOfMatch(listPlayerTeamA, idteam1, idteam2, idmatch);
        helper.upDateResultOfMatch(listPlayerTeamB, idteam2, idteam1, idmatch);

        res.redirect('/tournament_management/update?id=' + idtournament);
    }
};

exports.getRankingTable = async (req, res, next) =>{
    const idTournament = req.query.idTournament;

    if(typeof idTournament !== "undefined"){
        const listMatch = await helper.getAllMatchPlayedByIdTournament(idTournament);
        const listTeam = await helper.getAllTeamByIdTournament(idTournament)

        const ranking = [];
        for(const team of listTeam){
            const nameTeam = team.TenDoiBong;
            const idTeam = team.MaDoiBong;
            const numberMatchPlayed = 0;
            const numberMatchWin = 0;
            const numberMatchLose = 0;
            const numberMatchDraw = 0;
            const numberOfGoal = 0;
            const numberOfGoalConceded = 0;
            const numberGoalsDifferent = 0;
            const totalScore = 0;

            const newItem = {
                nameTeam, idTeam, numberMatchPlayed, numberMatchWin, numberMatchLose,
                numberMatchDraw, numberOfGoal, numberOfGoalConceded, numberGoalsDifferent, totalScore };
            ranking.push(newItem);
        }

        for(const match of listMatch) {
            const goalsTeam1 = match.DiemChuNha;
            const goalsTeam2 = match.DiemKhach;
            const idTeam1 = match.DoiChuNha;
            const idTeam2 = match.DoiKhach;

            //Kết quả của trận đấu sẽ có 3 trạng thái: 0, 1, 2
            //0: 2 đội hòa
            //1: đội 1 thắng
            //2: đội 2 thắng
            let resultOfMatch = 0;

            if (goalsTeam1 > goalsTeam2) {
                resultOfMatch = 1;
            } else {
                if (goalsTeam1 < goalsTeam2) {
                    resultOfMatch = 2;
                }
            }

            for (const team of ranking) {
                //Nếu là đội 1 thì tiến hành cập nhật
                if (team.idTeam == idTeam1) {
                    //Cập nhật số trận đã đá
                    team.numberMatchPlayed++;
                    //Cập nhật bàn thắng, bàn thua, hiệu số
                    team.numberOfGoal += goalsTeam1;
                    team.numberOfGoalConceded += goalsTeam2;
                    team.numberGoalsDifferent += (goalsTeam1 - goalsTeam2);

                    switch (resultOfMatch) {
                        case 0:
                            team.numberMatchDraw++;
                            team.totalScore += 1;
                            break;
                        case 1:
                            team.numberMatchWin++;
                            team.totalScore += 3;
                            break;
                        case 2:
                            team.numberMatchLose++;
                            break;
                    }
                }

                //Nếu là đội 2 thì tiến hành cập nhật
                if (team.idTeam == idTeam2) {
                    team.numberMatchPlayed++;
                    //Cập nhật bàn thắng, bàn thua, hiệu số
                    team.numberOfGoal += goalsTeam2;
                    team.numberOfGoalConceded += goalsTeam1;
                    team.numberGoalsDifferent += (goalsTeam2 - goalsTeam1);

                    switch (resultOfMatch) {
                        case 0:
                            team.numberMatchDraw++;
                            team.totalScore += 1;
                            break;
                        case 1:
                            team.numberMatchLose++;
                            break;
                        case 2:
                            team.numberMatchWin++;
                            team.totalScore += 3;
                            break;
                    }
                }
            }
        }


        ranking.sort(function (a, b) {
            return b.totalScore - a.totalScore;
        });

        let listTeamEqualScore = [];
        let arrLocation = [];
        let scoreCur = 0;

        //Kiểm tra danh sách các đội có cùng điểm với nhau để xét thêm hiệu số
        for(let i = 0; i <ranking.length; i++) {
            if (scoreCur != ranking[i].totalScore) {
                if (listTeamEqualScore.length > 1) {
                    listTeamEqualScore.sort(function (a, b) {
                        return b.numberGoalsDifferent - a.numberGoalsDifferent;
                    });

                    for (let index = 0; index < arrLocation.length; index++) {
                        ranking[arrLocation[index]] = listTeamEqualScore[index];
                    }
                }
                listTeamEqualScore = [];
                arrLocation = [];
            }

            scoreCur = ranking[i].totalScore;
            listTeamEqualScore.push(ranking[i]);
            arrLocation.push(i);
        }

        let goalCur = 0;
        scoreCur = 0;
        listTeamEqualScore = [];
        arrLocation = [];

        //Tiến hành sắp xếp các vị trí có cùng điểm và cùng hiệu số (T-T)
        for(let i = 0; i < ranking.length; i++) {
            if (scoreCur != ranking[i].totalScore || goalCur != ranking[i].numberGoalsDifferent) {
                if (listTeamEqualScore.length > 1) {
                    listTeamEqualScore.sort(function (a, b) {
                        return b.numberOfGoal - a.numberOfGoal;
                    });

                    for (let index = 0; index < arrLocation.length; index++) {
                        ranking[arrLocation[index]] = listTeamEqualScore[index];
                    }
                }
                listTeamEqualScore = [];
                arrLocation = [];
            }

            scoreCur = ranking[i].totalScore;
            goalCur = ranking[i].numberGoalsDifferent;
            listTeamEqualScore.push(ranking[i]);
            arrLocation.push(i);
        }

        res.render('ranking_table', { title: 'Bảng xếp hạng', listTeam: ranking });
    }else{
        const listTournament = await helper.getAllTournamentOnDB("");
        const listTournamentForView = [];

        for(let i = 0; i< listTournament.length; i++){
            const stt = i + 1;
            const nameTournament = listTournament[i].TenGiaiDau;
            const urlRanking = "ranking_table?idTournament=" + listTournament[i].MaGiaiDau;

            const newItem = { stt, nameTournament, urlRanking };
            listTournamentForView.push(newItem);
        }

        res.render('list_tournament_for_ranking', { title: 'Bảng xếp hạng', listTournament: listTournamentForView });
    }
};

exports.getRankingPlayer = async (req, res, next) => {
    const idTournament = req.query.idTournament;

    if(typeof idTournament !== "undefined"){
        const list = await helper.getAllPlayerByIdTournament(idTournament);

        list.sort(function (a, b) {
            return b.SoBanThang - a.SoBanThang;
        });

        res.render('goal_leader_list', { title: 'Vua phá lưới', list: list });
    }else{
        const listTournament = await helper.getAllTournamentOnDB("");
        const listTournamentForView = [];

        for(let i = 0; i< listTournament.length; i++){
            const stt = i + 1;
            const nameTournament = listTournament[i].TenGiaiDau;
            const urlRanking = "goal_leader_list?idTournament=" + listTournament[i].MaGiaiDau;

            const newItem = { stt, nameTournament, urlRanking };
            listTournamentForView.push(newItem);
        }

        //res.send(listTournamentForView);
        res.render('list_tournament_for_ranking_player', { title: 'Bảng xếp hạng', listTournament: listTournamentForView });
    }
};