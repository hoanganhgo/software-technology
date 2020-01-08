const Database=require('../utils/db');

exports.postRegister= async (req,res,next)=>{
    let name=req.body.name;
    let email=req.body.email;
    let dateOfBirth=req.body.dateOfBirth;
    let userName=req.body.userName;
    let passWord=req.body.passWord;

    //Kiem tra su ton tai
    let checkQuery="SELECT TenTaiKhoan FROM NguoiDung WHERE TenTaiKhoan='"+userName+"';";
    let checkResult = await Database.execute(checkQuery);
    if (checkResult.length>0)
    {
        res.render('register',{title: "Đăng ký", exist: true});
        return;
    }

    //hash password
    let passWordHash="";
    for (let i=0;i<passWord.length;i++)
    {
        passWordHash+=passWord.charCodeAt(i);
    }

    let query="INSERT INTO NguoiDung (TenTaiKhoan,MatKhau,HoTen,Email,NgaySinh) VALUES ('"+userName+"','"+
    passWordHash+"','"+name+"','"+email+"','"+dateOfBirth+"');";
    let result = await Database.execute(query);
    res.render('account',{title: "Trang chủ", username: name});
};

exports.getAcount = (req,res,next)=>{

    res.render('account',{title: "Tài khoản", username: " bạn"});
};

exports.login=async (req,res, next)=>{
    let userName=req.body.userName;
    let passWord=req.body.passWord;

    //Kiem tra su ton tai
    let checkQuery="SELECT* FROM NguoiDung WHERE TenTaiKhoan='"+userName+"';";
    let checkResult = await Database.execute(checkQuery);

    if (checkResult.length===0)
    {
        res.render('login',{title: "Đăng nhập", exist: false});
        return;
    }

    //hash password
    let passWordHash="";
    for (let i=0;i<passWord.length;i++)
    {
        passWordHash+=passWord.charCodeAt(i);
    }

    if (checkResult[0].MatKhau!==passWordHash)
    {
        res.render('login',{title: "Đăng nhập", wrong: false});
        return;
    }

    res.render('account',{title: "Tài khoản", username: checkResult[0].HoTen});
};