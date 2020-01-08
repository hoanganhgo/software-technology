function CheckInput() {
    const name = document.getElementById('tournamentName').value;
    const quantity=document.getElementById('teamQuantity').value;
    const min=document.getElementById('minimumPlayers').value;
    const max=document.getElementById('maximumPlayers').value;
    const lim=document.getElementById('ageLimit').value;
    const overAge=document.getElementById('overAgePlayers').value;
    const startDate=document.getElementById("startDate").value;
    let currentDay=new Date();
    let CurrentDay=Date.parse(currentDay);
    let StartDate=Date.parse(startDate);
    if (name==='')
    {
        document.getElementById('tournamentName').focus();
        return;
    }
    if (quantity==='')
    {
        document.getElementById('teamQuantity').focus();
        return;
    }
    if (min==='')
    {
        document.getElementById('minimumPlayers').focus();
        return;
    }
    if (max==='')
    {
        document.getElementById('maximumPlayers').focus();
        return;
    }
    if (lim==='')
    {
        document.getElementById('ageLimit').focus();
        return;
    }
    if (overAge==='')
    {
        document.getElementById('overAgePlayers').focus();
        return;
    }

    if (StartDate<=CurrentDay)
    {
        alert("Ngày bắt đầu thi đấu không hợp lệ");
        document.getElementById("startDate").focus();
        return;
    }

    document.getElementById("inputFile").disabled=false;
}

function checkListPlayer(data) {
    let n = data.length;
    let status=[];
    let team=[];
    let NumberOfTeams=document.getElementById("teamQuantity").value;
    let maxPlayers=document.getElementById("maximumPlayers").value;
    let minPlayers=document.getElementById("minimumPlayers").value;
    let agelimit=document.getElementById("ageLimit").value;
    let overAgePlayer=document.getElementById("overAgePlayers").value;
    let teams=0;
    let NumberOfPlayers=0;
    let overPlayer=0;
    let confirm1=false;
    let confirm2=0;
    let currentYear=(new Date()).getFullYear();
    let i=0;
    let start=true;

    for (i=0;i<n;i++)
    {
        if (start)
        {
            team.push(data[i][0]);
            start=false;
            i=i+1;
            continue;
        }
        if (!isNaN(data[i][0]) && i!==(n-1))
        {
            NumberOfPlayers++;
            let age=currentYear - data[i][3].getFullYear();
            if (age>agelimit)
            {
                overPlayer++;
            }
        }else{
            if (i===(n-1)){
                NumberOfPlayers++;
                let age=currentYear - data[i][3].getFullYear();
                if (age>agelimit)
                {
                    overPlayer++;
                }
            }
            if (NumberOfPlayers<minPlayers)
            {
                team.push("min");
            }
            else if (NumberOfPlayers>maxPlayers)
            {
                team.push("max");
            }

            if (overPlayer>overAgePlayer)
            {
                team.push("over");
            }
            else {
                team.push("ok");
            }
           // alert("Length: "+NumberOfPlayers);
            //alert(team);
            teams++;
            status.push(team);
            team=[];
            NumberOfPlayers=0;
            overPlayer=0;
            i--;
            start=true;
        }
    }

    if (teams<NumberOfTeams)
    {
        document.getElementById("notify").textContent="Số đội tham dự không đủ!";
    }
    else if (teams>NumberOfTeams)
    {
        document.getElementById("notify").textContent="Số đội tham vượt quá quy định!"+teams;
    }
    else {
        confirm1=true;
    }

    let html="<table border=1>";
    for (i=0;i<status.length;i++)
    {
        html+="<tr><td>";
        html+=status[i][0]+"</td>";
        if (status[i][1]==="ok")
        {
            html+="<td style=\"color: mediumspringgreen;\">OK</td></tr>";
            confirm2++;
        }
        else if (status[i][1]==="over")
        {
            html+="<td style=\"color: red;\">Số cầu thủ vượt tuổi nhiều hơn quy định</td></tr>";
        } else if (status[i][1]==="min")
        {
            html+="<td style=\"color: red;\">Số cầu thủ tham gia không đủ";
            if (status[i][2]==="over")
            {
                html+=" & Số cầu thủ vượt tuổi nhiều hơn quy định</td></tr>";
            }else{
                html+="</td></tr>";
            }
        }else if (status[i][1]==="max")
        {
            html+="<td style=\"color: red;\">Số cầu thủ tham gia nhiều hơn quy định";
            if (status[i][2]==="over")
            {
                html+=" & Số cầu thủ vượt tuổi nhiều hơn quy định</td></tr>";
            }else{
                html+="</td></tr>";
            }
        }
    }
    html+="</table>";

    document.getElementById("statusTable").innerHTML=html;

    if (confirm1)
    {
        if (confirm2===teams)
        {
            document.getElementById("createButton").disabled=false;
            return true;
        }
    }
    return false;
}

function countGold(input) {
    let countGold = 0;
    let flag = -1;
    for (let i = 0; i < input.length; i++) {
        //Nếu không phải là số hoặc ký tự đặc biệt thì báo lỗi
        if (isNaN(input[i]) && input[i] != ',' && input[i] != '-') {
            alert("Loi")
            break;
        }

        //Nếu là số hoặc những ký tự đặc biệt
        //Nếu gặp ký tự đặc biệt thì tiến hành kiểm tra phía trước có khoảng trắng hay không (VD: "1-" là flag bật, " -" là flag tắt)
        if(flag == -1){
            if (input[i] == '-' && (i > 0)) {
                if (input[i - 1] != ' ') {
                    flag = i;
                }
            }
        } else {
            //Nếu không phải là ký tự đặc biệt, tiến hành kiểm tra cờ có bật hay không (cờ bật có nghĩa là đang ở đúng định dạng và có thể đếm bàn thằng)
            //Nếu cờ đang bật nhưng có khoảng trắng đồng nghĩa có ký tự không hợp lệ xen
            if ((input[i] == ' ' || input[i] == ',') && flag != -1 && (i > 0)) {
                if (isNaN(input[i - 1]) == false) {
                    countGold++;
                }
                flag = -1;
            }
        }
    }


    if (flag != -1 && flag >= 1 && ((flag + 1) < input.length)) {
        if (isNaN(input[flag - 1]) == false && isNaN(input[flag + 1]) == false)
            countGold++;
    }

    return countGold;
}
function updateTeamA() {
    const input = document.getElementById("input-team-a").value;
    document.getElementById("team-a").value = countGold(input);
}

function updateTeamB() {
    const input = document.getElementById("input-team-b").value;
    document.getElementById("team-b").value = countGold(input);
}
function loadUserName() {
    let username = localStorage.getItem("username");
    if (username===null)
    {
        return;
    }

    document.getElementById("btnLogin").hidden=true;
    document.getElementById("btnRegister").hidden=true;
    document.getElementById("btnLogout").hidden=false;
    document.getElementById("avatar").hidden=false;
    document.getElementById("welcome").innerText="Xin chào "+username;
}

function logout() {
    localStorage.removeItem("username");
    location.href="/";
}

