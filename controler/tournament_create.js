const database=require('../utils/db');
const xlsx = require('node-xlsx');
const Formidable = require('formidable');

exports.createTournament=(req,res,next)=>{
    res.render('tournament_create', {title: 'Quản lí giải đấu'});
};

exports.createLeague = (req,res,next)=> {
    const form = new Formidable();
    form.parse(req, async (err, fields, files) => {
        let username=fields.username;
        let league=fields.leagueName;
        let startDate=fields.startDate;
        startDate=Date.parse(startDate);
        //console.log(username+"  "+league);
        //console.log(startDate);
        let query=null;

        //upload Ten giai dau
        query="INSERT INTO GiaiDau (TenGiaiDau, QuanLy) VALUES ('"+league+"','"+username+"');";
        //console.log(query);
        await database.execute(query);

        //Lấy mã giải đấu đã được phát sinh tự động
        let Result = await database.execute("select MAX(MaGiaiDau) as id From GiaiDau;");
        let ID_GiaiDau = Result[0].id;
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
                query="INSERT INTO CauThu (HoTen,SoAo,NgaySinh,DoiBongThiDau,SoBanThang,GiaiDau) VALUES('"+data[i][1]+"','"+data[i][2]+"','"+data[i][3]+"','"+ID_DoiBong+"',0,'"+ID_GiaiDau+"');";
                //console.log(query);
                //Lưu ý ngày sinh tính theo từng ngày với ngày bắt đầu là 01/01/1900
                await database.execute(query);
            }else{
                i--;
                start=true;
            }
        }

        //Lấy Mã đội bóng và tên đội bóng.
        query="SELECT MaDoiBong,TenDoiBong FROM DoiBong WHERE GiaiDau="+ID_GiaiDau+";";
        let temp = await database.execute(query);
        let team=[];
        let pitch=[];

        for (let i=0;i<temp.length;i++)
        {
            team.push(temp[i].MaDoiBong);
            pitch.push("Sân "+temp[i].TenDoiBong);
        }

        const sumTeam=team.length;
        let match=[];
        n=0;

        //Tạo mảng tất cả trận đấu
        for (let i=0;i<sumTeam-1;i++)
        {
            for (let j=i+1;j<sumTeam;j++)
            {
                match[n]=[];
                match[n][0]=team[i];
                match[n][1]=team[j];
                n++;
            }
        }

        for (let i=0;i<n;i++)
        {
            console.log(match[i][0]+" vs "+match[i][1]);
        }

        let group=[];
        for (let i=0;i<sumTeam-1;i++)
        {
            group[i]=[];
        }

        //Chia các vòng đấu
        let result=SeparateGroup(match,0,group);
        console.log(result);

        //Khởi tạo lịch thi đấu vòng 1
        for (let i=0;i<result.length;i++)
        {
            let round=result[i];
            let time=new Date(startDate+i*259200000);    //+3 ngày mỗi vòng đấu
            let StringTime=time.getFullYear()+"-"+(time.getMonth()+1)+"-"+time.getDate();
            for (let j=0;j<round.length;j++)
            {
                let place=GetPitch(team,pitch,round[j][0]);
                query="INSERT INTO TranDau (DoiChuNha,DoiKhach,NgayThiDau,SanThiDau,DiemChuNha,DiemKhach,GiaiDau) VALUES ('"+round[j][0]+"','"+round[j][1]+"','"+StringTime+"','"+place+"',-1,-1,'"+ID_GiaiDau+"');";
                console.log(query);
                await database.execute(query);
            }
        }

        //Khởi tạo lịch thi đấu vòng 2 - Sau 5 ngày kể từ sau vòng 1
        startDate=startDate+432000000;     //+5 ngày (5*86400000)
        for (let i=0;i<result.length;i++)
        {
            let round=result[i];
            let time=new Date(startDate+i*259200000);    //+3 ngày mỗi vòng đấu (3*86400000)
            let StringTime=time.getFullYear()+"-"+(time.getMonth()+1)+"-"+time.getDate();
            for (let j=0;j<round.length;j++)
            {
                let place=GetPitch(team,pitch,round[j][1]);
                query="INSERT INTO TranDau (DoiChuNha,DoiKhach,NgayThiDau,SanThiDau,DiemChuNha,DiemKhach,GiaiDau) VALUES ('"+round[j][0]+"','"+round[j][1]+"','"+StringTime+"','"+place+"',-1,-1,'"+ID_GiaiDau+"');";
                console.log(query);
                await database.execute(query);
            }
        }

    });

    res.render('create_League', {title: 'Tạo giải đấu'});
};

/**
 * @return {boolean}
 */
function MatchInGroup(match, group) {
    for (let t=0;t<group.length;t++)
    {
        if (match[0]===group[t][0] || match[1]===group[t][1] || match[0]===group[t][1] || match[1]===group[t][0])
        {
            return true;
        }
    }
    return false;
}

/**
 * @return {null}
 */
function SeparateGroup(match, index, group) {
    if (index===match.length)
    {
        return group;
    }
    for (let i=0;i<group.length;i++)
    {
        if (MatchInGroup(match[index],group[i])===false)
        {
            group[i].push(match[index]);
            let result = SeparateGroup(match,index+1,group);
            if (result!==null)
            {
                return result;
            }
            group[i].pop();
        }
    }
    return null;
}

/**
 * @return {null}
 */
function GetPitch(team, pitch, ID)
{
    let index=-1;
    for (let i=0;i<team.length;i++)
    {
        if (team[i]===ID)
        {
            index=i;
            break;
        }
    }

    if (index!==-1)
    {
        return pitch[index];
    }
    else
    {
        return null;
    }
}