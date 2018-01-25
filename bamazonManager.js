

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
				"\n                      Manager Tools   					 " +
				"\n==========================================================" +
				"\n"); 

	managerPrompt();

});

function managerPrompt() {

inquirer.prompt({
	  type: "rawlist",
	  name: "action",
	  message: "Select the action you want to perform:",
	  choices: ["View products for sale", "View low inventory", "Add to inventory", "Add new product"]

	}).then(function(select) {

		var selection = select.action;

		switch(selection) {
			case "View products for sale": viewProducts(); break;
			case "View low inventory": viewLowInventory(); break;
			case "Add to inventory": addToInventory(); break;
			case "Add new product": addNewProduct(); break;
			default: 
				console.log("Enter a number 1-4 to indicate the action you want to perform");
				managerPrompt();
			}

		});

}

function viewProducts() {

	var query = connection.query("SELECT item_id AS ID, item_name AS PRODUCT, department_name AS DEPARTMENT, FORMAT(price, 2) AS PRICE, stock_quantity AS QUANTITY, FORMAT(product_sales, 2) AS TOTAL_SALES " + 
		"FROM products ORDER BY DEPARTMENT", function(err, res) {
		if (err) throw err;

		console.log("\nDisplaying all products:");
		console.table(res);

		managerPrompt();
	});
}

function viewLowInventory() {

	var query = connection.query("SELECT item_id AS ID, item_name AS PRODUCT, department_name AS DEPARTMENT, FORMAT(price, 2) as PRICE, stock_quantity AS QUANTITY " + 
		"FROM products WHERE (stock_quantity < 10) ORDER BY ID", function(err, res) {
		if (err) throw err;

		console.log("\nDisplaying products with inventory count less than 10 units:");
		console.table(res);

		managerPrompt();
	});
}

function addToInventory() {

	inquirer.prompt([
	{ 
		type: "input",
		name: "id",
		message: "\nWhich product do you wish to add more of (enter product id)?  "
	},

	{ 
		type: "input",
		name: "quantity",
		message: "What amount should the inventory be increased by?  "
	}

	]).then(function(input) {

		var productId = input.id;
		var increaseQuantity = parseInt(input.quantity);

		var query = connection.query("SELECT stock_quantity, item_name FROM products WHERE ?", 
			[
				{ item_id: productId }
			],
			function(err, res) {
				if (err) throw err;

				var data = res[0];
				var newStockQuantity = data.stock_quantity + increaseQuantity;

				var query = connection.query("UPDATE products SET ? WHERE ?",
					[
						{ stock_quantity: newStockQuantity},
						{ item_id: productId }
					],
					function(err, res) {
						if (err) throw err;

						console.log("\nInventory successfully updated. \nStock of " + data.item_name + " increased by " + input.quantity + " to " + newStockQuantity + "\n");
						managerPrompt();
					}
				);
			}
		);

	});

}

function addNewProduct() {

	inquirer.prompt([
	{ 
		type: "input",
		name: "name",
		message: "\nProduct name: "
	},

	{ 
		type: "input",
		name: "department",
		message: "department: "
	},

	{ 
		type: "input",
		name: "price",
		message: "Price of product: "
	},

	{ 
		type: "input",
		name: "units",
		message: "Number of units "
	}

	]).then(function(input) {

				var query = connection.query("INSERT INTO products SET ?",
					
					{ 
						item_name: input.name,
					 	department_name: input.department,
						price: input.price,
						stock_quantity: input.units
					},
					function(err, res) {
						if (err) throw err;

						console.log("\nInventory successfully updated with new product: " + input.name+ "\n");
						managerPrompt();
					}
		
		);

	});

}
