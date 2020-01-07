var express = require('express');
const Home = require('../controler/Home');
const tournament = require('../controler/tournament_create');
const tournamentM = require("../models/Tournament.M");
const matchM = require("../models/Match.M");
const teamM = require("../models/Team.M");
var router = express.Router();
const tournamentController = require('../controler/tournamentController');

/* GET home page. */
router.get('/', Home.getHome);

/*GET login page*/
router.get('/login', function (req, res, next) {
  res.render('login', { title: 'Đăng nhập' });
});

/*GET register page*/
router.get('/register', function (req, res, next) {
  res.render('register', { title: 'Đăng ký' });
})

/*GET ranking table page*/
router.get('/ranking_table', function (req, res, next) {
  res.render('ranking_table', { title: 'Bảng xếp hạng' });
});

/*GET goal leader list page*/
router.get('/goal_leader_list', function (req, res, next) {
  res.render('goal_leader_list', { title: 'Vua phá lưới' });
});

/*GET tournament create page*/
router.get('/tournament_create', tournament.createTournament);

/*GET create league*/
//router.get('/create_league', tournament.createLeague);
router.post('/create_league', tournament.createLeague);

/*GET tournament management page*/
router.get('/tournament_management', function (req, res, next) {
  res.render('tournament_management', { title: 'Quản lí giải đấu' });
});

router.get('/tournament_management', tournamentController.tournamentManagement);

router.get('/tournament_management/update', tournamentController.tournamentUpdate);


/*GET match result update page*/
router.get('/match_result_update', function (req, res, next) {
  res.render('match_result_update', { title: 'Cập nhật tỷ số' });
});

router.get('/tournament_list', async function (req, res, next) {
  const list = await tournamentM.GetAll();

  res.render('tournament_list', {
    list: list,
    title: 'Danh sách giải đấu'
  });
});

router.get('/:id/match_list', async function (req, res, next) {
    const id = parseInt(req.params.id);
    const tournament = await tournamentM.GetByID(id);
    const list = await matchM.AllByTournamentID(id);

    for(var i = 0; i < list.length; i++){
      list[i].TenChuNha = await teamM.GetNameTeam(list[i].DoiChuNha);
      list[i].TenKhach = await teamM.GetNameTeam(list[i].DoiKhach);

      var date = new Date(list[i].NgayThiDau);
      var dd = String(date.getDate()).padStart(2, '0');
      var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
      var yyyy = date.getFullYear();

      date = mm + '/' + dd + '/' + yyyy;
      list[i].NgayThiDauDate = date;
    }

    res.render('match_list', {
      list: list,
      tournament: tournament,
      title: 'Danh sách trận đấu của ' + tournament.TenGiaiDau,
    });
});

module.exports = router;
