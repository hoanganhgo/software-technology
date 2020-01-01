const database=require('../utils/db');
const xlsx = require('node-xlsx');
const Formidable = require('formidable');
const util = require('util');
exports.createTournament=(req,res,next)=>{
    res.render('tournament_create', {title: 'Quản lí giải đấu'});
};

exports.createLeague = (req,res,next)=> {
    const form = new Formidable();
    form.parse(req, async (err, fields, files) => {
        let username=fields.username;
        let league=fields.leagueName;
        console.log(username+"  "+league);
        let query=null;

        //upload Ten giai dau
        query="INSERT INTO GiaiDau (TenGiaiDau, QuanLy) VALUES ('"+league+"','"+username+"');";
        //console.log(query);
        await database.execute(query);

        //Lấy mã giải đấu đã được phát sinh tự động
        let Result= await database.execute("select MAX(MaGiaiDau) as id From GiaiDau;");
        let ID_GiaiDau=Result[0].id;
        let obj = xlsx.parse(files.UploadFile.path);
        console.log(obj[0]);

        let start=true;
        let data=obj[0].data;
        let n=data.length;
        let ID_DoiBong=null;

        for (let i=0;i<n;i++)
        {
            if (data[i].length===0)
            {
                break;
            }
            if (start){
                //data[i][0] la ten doi bong
                query="INSERT INTO DoiBong (TenDoiBong, GiaiDau) VALUES('"+data[i][0]+"','"+ID_GiaiDau+"');";
                //console.log(query);
                await database.execute(query);
                i=i+1;
                start=false;

                //Lấy mã đội bóng đã được phát sinh tự động
                let Result= await database.execute("select MAX(MaDoiBong) as id From DoiBong;");
                ID_DoiBong=Result[0].id;
                continue;
            }

            if (!isNaN(data[i][0]))
            {
                query="INSERT INTO CauThu (HoTen,SoAo,NgaySinh,DoiBongThiDau) VALUES('"+data[i][1]+"','"+data[i][2]+"','"+data[i][3]+"','"+ID_DoiBong+"');";
                //console.log(query);
                //Lưu ý ngày sinh tính theo từng ngày với ngày bắt đầu là 01/01/1900
                database.execute(query);
            }else{
                i--;
                start=true;
            }
        }
    });

    res.render('create_League', {title: 'Tạo giải đấu'});
};