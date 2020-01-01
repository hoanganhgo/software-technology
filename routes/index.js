var express = require('express');
const Home=require('../controler/Home');
const tournament=require('../controler/tournament_create');
var router = express.Router();

/* GET home page. */
router.get('/', Home.getHome);

/*GET login page*/
router.get('/login',function(req,res,next){
  res.render('login', {title: 'Đăng nhập'});
});

/*GET register page*/
router.get('/register',function(req,res,next){
  res.render('register', {title: 'Đăng ký'});
})

/*GET ranking table page*/
router.get('/ranking_table', function(req, res, next){
  res.render('ranking_table', {title: 'Bảng xếp hạng'});
});

/*GET goal leader list page*/
router.get('/goal_leader_list', function(req, res, next){
  res.render('goal_leader_list', {title: 'Vua phá lưới'});
});

/*GET tournament create page*/
router.get('/tournament_create', tournament.createTournament);

/*GET create league*/
//router.get('/create_league', tournament.createLeague);
router.post('/create_league', tournament.createLeague);

/*GET tournament management page*/
router.get('/tournament_management', function(req, res, next){
  res.render('tournament_management', {title: 'Quản lí giải đấu'});
});

/*GET match result update page*/
router.get('/match_result_update', function(req, res, next){
  res.render('match_result_update', {title: 'Cập nhật tỷ số'});
});

module.exports = router;
