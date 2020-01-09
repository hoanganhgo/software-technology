const mysql = require('mysql');

// lien ket voi mysql tuy may local
function createConnnection() {
    return mysql.createConnection({
     //Kết nối tới server thực tế.
     //    host: '37.59.55.185',
     //    port: '3306',
     //    user: 'rb5YHmRcsc',
     //    password: 'tZqSHg4ISv',
     //    database: 'rb5YHmRcsc',

    //Kết nối với server local
        host: 'localhost',
        port: '3306',
        user: 'admin',
        password: 'admin',
        database: 'qlbd',
    });
};

exports.execute = sql => {
    return new Promise((resole, reject) => {
        const con = createConnnection();
        con.connect(err => {
            if (err) {
                reject(err);
            }
        });

        con.query(sql, (error, results, fields) => {
            if(error){
                reject(error);
            }
            resole(results);
        });
        con.end();
    });
};

