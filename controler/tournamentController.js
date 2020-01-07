//const util = require('utils');
const database = require('../utils/db');

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
            "SELECT * " +
            "FROM TranDau " +
            "WHERE GiaiDau='"+id+"';";
        const listMatchOnDB = await database.execute(queryGetAllMatch);

        const listMatchForView = [];

        const queryGetNameOfTeam =
            "SELECT TenDoiBong " +
            "FROM DoiBong " +
            "WHERE MaDoiBong='";

        for(const item of listMatchOnDB){
                const nameTeam1 = await database.execute(queryGetNameOfTeam + item.DoiChuNha + "';");
                const nameTeam2 = await database.execute(queryGetNameOfTeam + item.DoiKhach + "'");


                let resultOfMatch;
                if(item.DiemChuNha == -1){
                        resultOfMatch = "0-0";
                }else {
                        resultOfMatch = item.DiemChuNha + "-" + item.DiemKhach;
                }

                const dateStart = new Date(item.NgayThiDau);
                const day = dateStart.getDate();
                const month = dateStart.getMonth() + 1;
                const year = dateStart.getFullYear();

                const newItem = {
                        idMatch: item.MaTranDau,
                        nameTeam1: nameTeam1[0].TenDoiBong,
                        nameTeam2: nameTeam2[0].TenDoiBong,
                        result: resultOfMatch,
                        date: day + "/" + month + "/" + year,
                        stadium: item.SanThiDau,
                        urlUpdate: "tournament_management/update?id="+item.MaTranDau
                };

                listMatchForView.push(newItem);

        };

        //res.send(listMatchForView);
        res.render('list_match_of_tournament', {title: "Danh sách trận đấu", listMatch: listMatchForView});
};
