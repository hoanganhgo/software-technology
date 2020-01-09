const Database = require('../utils/db');
const matchM = require("../models/Match.M");
const goalM = require("../models/GoalMatch.M");
const teamM = require("../models/Team.M");
const tournamentM = require("../models/Tournament.M");

exports.getHome = async (req, res, next) => {
    //Cập nhật tin tức các trận đấu

    // const news_match = await matchM.ThreeMatchCurrently();
    // if (news_match===null)
    // {
    //     res.render('index', {
    //         title: 'Trang chủ',
    //         matchs: [],
    //     });
    //     return;
    // }
    // let list_match = [];
    //
    // for (var i = 0; i < parseInt(news_match.length); i++) {
    //     let id = news_match[i].MaTranDau;
    //     let totalGoals = parseInt(await goalM.AllGoalOfMatch(id));
    //     let totalGoalsOfGuestTeam = parseInt(await goalM.AllGoalsOfGuestTeam(id, news_match[i].DoiChuNha));
    //     ///////////////
    //     let temp = {};
    //     temp.Tournament = "V-League";
    //     temp.HomeTeam = await teamM.GetNameTeam(news_match[i].DoiChuNha);
    //     temp.GuestTeam = await teamM.GetNameTeam(news_match[i].DoiKhach);
    //     temp.HomeGoal = totalGoals - totalGoalsOfGuestTeam;
    //     temp.GuestGoal = totalGoalsOfGuestTeam;
    //     var date = new Date(news_match[i].NgayThiDau);
    //     var dd = String(date.getDate()).padStart(2, '0');
    //     var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    //     var yyyy = date.getFullYear();
    //
    //     date = mm + '/' + dd + '/' + yyyy;
    //     temp.Date = date;
    //     list_match.push(temp);
    // }

    //New code
    let query="Select* from TranDau WHERE DiemChuNha>='0';";
    let TranDau = await Database.execute(query);
    let list_match=[];

    for (let i=TranDau.length-1;i>=0;i--)
    {
        query="SELECT TenGiaiDau FROM GiaiDau WHERE MaGiaiDau='"+TranDau[i].GiaiDau+"';";
        let TenGiaiDau=await Database.execute(query);

        query="Select TenDoiBong FROM DoiBong WHERE MaDoiBong='"+TranDau[i].DoiChuNha+"';";
        let DoiChuNha=await Database.execute(query);

        query="Select TenDoiBong FROM DoiBong WHERE MaDoiBong='"+TranDau[i].DoiKhach+"';";
        let DoiKhach=await Database.execute(query);

        let day = TranDau[i].NgayThiDau.getDate();
        let month = TranDau[i].NgayThiDau.getMonth()+1;
        let year = TranDau[i].NgayThiDau.getFullYear();
        let date=day+"/"+month+"/"+year;
        let news="Giải đấu: "+TenGiaiDau[0].TenGiaiDau+" :=: "+" Trận đấu: "+DoiChuNha[0].TenDoiBong+" vs "
            +DoiKhach[0].TenDoiBong+" :=: Kết quả: "
            +TranDau[i].DiemChuNha+" - "+TranDau[i].DiemKhach+" :=: "+"Thời gian: "+date;
        console.log(news);
        list_match.push(news);
    }
    //console.log(list);
    res.render('index', {
        title: 'Trang chủ',
        matchs: list_match,
    });

    //console.log(list);
};
