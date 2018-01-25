
// require modules

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
				"\n    Your favorite online store for the stuff you want!    " +
				"\n==========================================================" +
				"\n"); 

	// call function to display all products from database
	displayAllProducts();


});

function displayAllProducts() {

	console.log("Products in stock:\n");

	connection.query("SELECT item_id AS ID, item_name AS PRODUCT, department_name AS DEPARTMENT, FORMAT(price, 2) as PRICE, stock_quantity AS QUANTITY " + 
		"FROM products ORDER BY ID", function(err, res) {
		if (err) throw err;

		//console.log(res);
		console.table(res);

		// then call a function to prompt for customer input
		customerPrompt("");
	});
}

function customerPrompt(msg) {

	inquirer.prompt([
	{ 
		type: "input",
		name: "id",
		message: "Enter the ID of the " + msg + "product you would like to buy: ",
		validate: function(value) {
			var pass = value.match(/^[0-9]*$/gm);
			if (pass) { return true; }

			return "Please enter a valid ID number";
		}
	},

	{ 
		type: "input",
		name: "quantity",
		message: "How many of your chosen product would like to buy: ",
		validate: function(value) {
			var pass = value.match(/^[0-9]*$/gm);
			if (pass) { return true; }

			return "Please enter a valid quantity";
		}
	}

	]).then(function(input) {
 
		var productId = input.id; 
		var productQuantity = input.quantity;

		// check both are numbers and print error if not. 
		// Check id is in range of product Ids

		var query = connection.query("SELECT * FROM products WHERE ?",
			[
				{ item_id: productId }
			],
			function(err, res) {
				if (err) throw err;

				var data = res[0];
				if (productQuantity > data.stock_quantity) {

					console.log("\nSorry, we only have " + data.stock_quantity + " in stock." +
						"\nPlease make another selection or reduce the number of units.\n");
					customerPrompt("");

					} else {

					console.log("\nWe have " + data.stock_quantity + " of " + data.item_name + " in stock. " + 
						"\nThe total cost of your purchase is $" + productQuantity * parseInt(data.price));

					inquirer.prompt([
					{ 
						type: "confirm",
						name: "confirm",
						message: "Complete order?  "
					}

					]).then(function(input) {

						if (input.confirm) {

							var newStockQuantity = parseInt(data.stock_quantity - productQuantity);
							var newTotalSales = parseInt(data.product_sales + (data.price * productQuantity));
							var query = connection.query("UPDATE products SET ? WHERE ?",
								[
									{ stock_quantity: newStockQuantity, product_sales: newTotalSales },
									{ item_id: productId }
								],
								function(err, res) {
									if (err) throw err;

									console.log("\nCongratulations! You item(s) will be dispatched shortly!\n");
									customerPrompt("next ");

								}

							);

						} else {

							console.log("\nPurchase cancelled. Try again.\n");
							customerPrompt("");
						}

					});

				}

			}

		);			

	});

}

