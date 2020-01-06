const test=require('../utils/db');

exports.getHome = async (req,res,next)=>{
    //Cập nhật tin tức các trận đấu
    var list = await test.execute("select* from NguoiDung");

    for(const item of list){
        console.log(item.TenTaiKhoan);
    }

    //console.log(list);

    res.render('index', { title: 'Trang chủ' });
};
