

var mysql = require("mysql");
var inquirer = require("inquirer");
var cTable = require("console.table");

var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,

	// username
	user: 'root',

	// password
	password: '',

	database: 'bamazonDB'
});

connection.connect(function(err) {
	if (err) throw err;
	console.log("connected as id" + connection.threadId + "\n");

	// display shop logo
	console.log("==========================================================" +
				"\n                       BAMAZON.COM                        " +
				"\n                      Supervisor Tools 					 " +
				"\n==========================================================" +
				"\n");

	supervisorPrompt();

});

function supervisorPrompt() {

inquirer.prompt({
	  type: "rawlist",
	  name: "action",
	  message: "Select the action you want to perform:",
	  choices: ["View product sales by department", "Create new department"]

	}).then(function(select) {

		var selection = select.action;

		switch(selection) {
			case "View product sales by department": viewSalesByDept(); break;
			case "Create new department": newDept(); break;
			default: 
				console.log("Enter a number 1-2 to indicate the action you want to perform");
				supervisorPrompt();
			}

		});
}


function viewSalesByDept() {

	var query = connection.query(
			"SELECT d.department_id AS ID, d.department_name AS DEPARTMENT, FORMAT(d.over_head_costs, 2) AS OVER_HEAD_COSTS, " + 
				"FORMAT(SUM(p.product_sales), 2) AS PRODUCT_SALES, FORMAT((SUM(p.product_sales) - d.over_head_costs), 2) AS TOTAL_PROFIT " + 
			"FROM departments AS d INNER JOIN products AS p USING (department_name) " + 
			"GROUP BY (d.department_name) " + 
			"ORDER BY (d.department_id)", function(err, res) {
		if (err) throw err;

		console.log("\n");
		console.table(res);

		supervisorPrompt();


	});

}

function newDept() {
	inquirer.prompt([
	{ 
		type: "input",
		name: "name",
		message: "Enter a name for the new department: "
	},

	{ 
		type: "input",
		name: "overheads",
		message: "What are the over head costs of ther new department: "
	},

	]).then(function(input) {

				var query = connection.query("INSERT INTO departments SET ?",
					
					{ 
						department_name: input.name,
					 	over_head_costs: input.overheads,
					},
					function(err, res) {
						if (err) throw err;

						console.log("\nDatabase successfully updated with new department: " + input.name+ "\n");
						supervisorPrompt();
					}
		
		);

	});
}



