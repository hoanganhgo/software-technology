var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Trang chủ' });
});
router.get('/login',function(req,res,next){
  res.render('login', {title: 'Đăng nhập'});
});
router.get('/register',function(req,res,next){
  res.render('register', {title: 'Đăng ký'});
})

router.get('/ranking_table', function(req, res, next){
  res.render('ranking_table', {title: 'Bảng xếp hạng'});
});
router.get('/goal_leader_list', function(req, res, next){
  res.render('goal_leader_list', {title: 'Vua phá lưới'});
});
router.get('/tournament_create', function(req, res, next){
  res.render('tournament_create', {title: 'Tạo giải đấu mới'});
});
router.get('/tournament_management', function(req, res, next){
  res.render('tournament_management', {title: 'Quản lí giải đấu'});
});

module.exports = router;
