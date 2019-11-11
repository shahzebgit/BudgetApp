//budgte control
var budgetController = (function() {
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };
  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };
  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var Savings = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(cur) {
      sum += cur.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: [],
      save: []
    },
    totals: {
      exp: 0,
      inc: 0,
      save:0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function(type, des, val) {
      var newItem, ID;

      if (data.allItems[type].length > 0) {
        ID = [data.allItems[type].length - 1] + 1;
      } else {
        ID = 0;
      }

      // Create new item based on 'inc' or 'exp'  or 'save' type
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      } else if (type === "save") {
        newItem = new Savings(ID, des, val);
      }

      // Push it into our data structure
      data.allItems[type].push(newItem);

      // Return the new element
      return newItem;
    },

    deleteItem: function(type, id) {
      var ids, index;
      //
      if (type=="save"){
        UIController.addListItems(data.allItems.save[id],'inc');
        delete data.allItems.save[id];
        calculateTotal("inc");
        console.log(data.allItems.save);
    }
    else{
      delete data.allItems.save[id];
      calculateTotal(type);

      ids = data.allItems[type].map(function(current) {
        return current.id;
      });
      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }

      
    }
    },

    calculateBudget: function() {

      //calculate total income ,expenses and savings
      calculateTotal("exp");
      calculateTotal("inc");
      calculateTotal("save");

      //Calculate the budget: income - expenses
       
          data.budget = data.totals.inc - data.totals.exp;
        

        
      // Calculate the budget: income - savings
       
        data.budget = data.budget - data.totals.save;
    
      //calculate the percentage
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentage: function() {
      data.allItems.exp.forEach(function(cur) {
        cur.calcPercentage(data.totals.inc);
      });
    },

    getPercentage: function() {
      var allPercentage = data.allItems.exp.map(function(cur) {
        return cur.getPercentage();
      });
      return allPercentage;
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        totalSave:data.totals.save,
        percent: data.percentage
      };
    },

    testing: function() {
      console.log(data);
    }
  };
})();

//User Interface control
var UIController = (function() {
  var DOMStrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expenseContainer: ".expenses__list",
    savingsContainer: ".savings__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expenseLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercLabel: ".item__percentage",
    dateLabel: ".budget__title--month"
  };
  var formatNumber = function(num, type) {
    var numSplit, int, dec;

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split(".");

    int = numSplit[0];
    if (int.length > 3) {
      //subtr take only a part of string so we take first part from 0 to length if the interger
      //and then add the ',' after that we take another subtr and we will take it from index position
      // if the integer is greater than 3(like 2310 = 2,310 and 23500 = 23,500)
      int =
        int.substr(0, int.length - 3) +
        "," +
        int.substr(int.length - 3, int.length);
    }
    dec = numSplit[1];

    return (type === "exp" ? "-" : "+") + "" + int + "." + dec;
  };

  var NodeListForEach = function(list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput: function() {
      return {
        //Will be either Inc or Exp or save
        type: document.querySelector(DOMStrings.inputType).value,
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
      };
    },

    addListItems: function(obj, type) {
      var html, newHtml, element;

      //Create HTML string with placeholder text
      if (type === "inc") {
        element = DOMStrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = DOMStrings.expenseContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "save") {
        element = DOMStrings.savingsContainer;
        html =
          '<div class="item clearfix" id="save-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      //Replcae the placeholder text with some actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    deleteList: function(selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields: function() {
      var fields, fieldsArray;
      fields = document.querySelectorAll(
        DOMStrings.inputDescription + "," + DOMStrings.inputValue
      );

      fieldsArray = Array.prototype.slice.call(fields);
      fieldsArray.forEach(function(current, index, array) {
        current.value = "";
      });
      //TO move focus on first element
      fieldsArray[0].focus();
    },

    displayBudget: function(obj) {
      var type;
      obj.budget > 0 ? (type = "inc") : (type = "exp");
      document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget,type);
      document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, "inc");
      document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp, "exp");

      if (obj.percent > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent =
          obj.percent + "%";
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = "---";
      }
    },

    displayPercentage: function(percentages) {
      var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

      NodeListForEach(fields, function(current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },

    displayMonth: function() {
      var now, year, month, months;
      now = new Date();

      year = now.getFullYear();
      months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November"
      ];
      month = now.getMonth();
      document.querySelector(DOMStrings.dateLabel).textContent =
        months[month] + " " + year;
    },

    changeType: function() {
      var fields = document.querySelectorAll(
        DOMStrings.inputType +
          "," +
          DOMStrings.inputDescription +
          "," +
          DOMStrings.inputValue
      );
        
      NodeListForEach(fields, function(cur) {
        cur.classList.add('red-focus');
      });
      document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
    },

    getDOMstrings: function() {
      return DOMStrings;
    }
  };
})();

//GLobal app control
var appController = (function(budgetCtl, UICtl) {
  var setupEventListeners = function() {
    var DOM = UICtl.getDOMstrings();
    document
      .querySelector(DOM.inputBtn)
      .addEventListener("click", ctrlAddItems);

    document.addEventListener("keypress", function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItems();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);
    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UICtl.changeType);
  };

  var updateBudget = function() {
    //1.calculate the budget
    budgetCtl.calculateBudget();

    //2 return the budget
    var budget = budgetCtl.getBudget();

    //3.Display the budget in the UI
    UICtl.displayBudget(budget);
    
  };

  var updatePercentage = function() {
    //1. Calculate percentages
    budgetCtl.calculatePercentage();

    //2. Read percentages from the budget controller
    var percentage = budgetCtl.getPercentage();

    //3. Update the UI with new percentages
    UICtl.displayPercentage(percentage);
  };

  var ctrlAddItems = function() {
    var input, newItem;
    //1.Get the input data
    var input = UICtl.getInput();

    //This is for Descp and Value should not be empty or Zero
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      //2. add the item to the budget controller
      var newItem = budgetCtl.addItem(
        input.type,
        input.description,
        input.value
      );

      //3. add the item in the UI
      UICtl.addListItems(newItem, input.type);

      //4 Clear Fields
      UICtl.clearFields();

      //5.Calculate and Update budget
      updateBudget();

      //6. Calculate and update percentages
      updatePercentage();
    }
  };

  var ctrlDeleteItem = function(event) {
    var itemID, splitID, type, ID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      //Split the items
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseFloat(splitID[1]);

      //1. Delete the item from the data structure
      budgetCtl.deleteItem(type, ID);

      //2.Delete the item from UI
      UICtl.deleteList(itemID);

      //3. Update and show the new budget
      updateBudget();

      //4. Calculate and update percentages
      updatePercentage();
    }
  };

  return {
    init: function() {
      console.log("Application is started");
      UICtl.displayMonth();
      UICtl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        totalSave:0,
        percent: -1
      });
      setupEventListeners();
    }
  };
})(budgetController, UIController);

appController.init();
