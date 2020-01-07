const test = require('../utils/db');
const matchM = require("../models/Match.M");
const goalM = require("../models/GoalMatch.M");
const teamM = require("../models/Team.M");
const tournamentM = require("../models/Tournament.M");

exports.getHome = async (req, res, next) => {
    //Cập nhật tin tức các trận đấu
    var list = await test.execute("select* from NguoiDung");

    const news_match = await matchM.ThreeMatchCurrently();
    let list_match = [];

    for (var i = 0; i < parseInt(news_match.length); i++) {
        let id = news_match[i].MaTranDau;
        let totalGoals = parseInt(await goalM.AllGoalOfMatch(id));
        let totalGoalsOfGuestTeam = parseInt(await goalM.AllGoalsOfGuestTeam(id, news_match[i].DoiChuNha));
        ///////////////
        let temp = {};
        temp.Tournament = "V-League";
        temp.HomeTeam = await teamM.GetNameTeam(news_match[i].DoiChuNha);
        temp.GuestTeam = await teamM.GetNameTeam(news_match[i].DoiKhach);
        temp.HomeGoal = totalGoals - totalGoalsOfGuestTeam;
        temp.GuestGoal = totalGoalsOfGuestTeam;
        var date = new Date(news_match[i].NgayThiDau);
        var dd = String(date.getDate()).padStart(2, '0');
        var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = date.getFullYear();

        date = mm + '/' + dd + '/' + yyyy;
        temp.Date = date;
        list_match.push(temp);
    }

    console.log(list);
    res.render('index', {
        title: 'Trang chủ',
        matchs: list_match,
    });

    for(const item of list){
        console.log(item.TenTaiKhoan);
    }

    //console.log(list);
};
