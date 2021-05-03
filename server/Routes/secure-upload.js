const NodeClam = require('clamscan');
const ClamScan = new NodeClam().init();


function virus_check(files) {
    let promises = [];
    for (let i; i < files.length; i++){
        promises.push(ClamScan.is_infected(files[i].path));
    }
    return Promise.all(promises).then(results=>{
        let checkFiles = false;
			if (results.length >= 1) {
				checkFiles = notAffected.reduce(function (prev, curr) {
					return prev.is_infected && curr.is_infected;
				});
			}
        return !checkFiles;

    }).catch(err=>err)
        
};

module.exports = virus_check;