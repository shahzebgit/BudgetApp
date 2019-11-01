//budgte control
var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;

    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };


    return {
        addItem: function (type, des, val) {
            var newItem, ID;

            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // Push it into our data structure
            data.allItems[type].push(newItem);

            // Return the new element
            return newItem;
        },

        deleteItem: function (type, id) {
            var ids, index;
            //
            ids = data.allItems[type].map(function (current) {
                return current.id;

            });
            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function () {
            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //calculate the percentage
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                toatlExp: data.totals.exp,
                percent: data.percentage
            }


        },


        testing: function () {
            console.log(data);

        }
    };


})();



//User Interface control
var UIController = (function () {
    var DOMStrings = {
        inputType: '.add__type',
        inputDescrip: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container'
    };
    return {
        getInput: function () {
            return {
                //Will be either Inc or Exp
                type: document.querySelector(DOMStrings.inputType).value,
                descrip: document.querySelector(DOMStrings.inputDescrip).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };

        },

        addListItems: function (obj, type) {
            var html, newHtml, element;

            //Create HTML string with placeholder text
            if (type === 'inc') {

                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMStrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            //Replcae the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);


            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        deleteList : function (selectorID) {
          

            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);


        },

        clearFields: function () {
            var fields, fieldsArray;
            fields = document.querySelectorAll(DOMStrings.inputDescrip + ',' + DOMStrings.inputValue);

            fieldsArray = Array.prototype.slice.call(fields);
            fieldsArray.forEach(function (current, index, array) {
                current.value = "";
            });
            //TO move focus on first element
            fieldsArray[0].focus();
        },

        displayBudget: function (obj) {
            document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMStrings.expenseLabel).textContent = obj.toatlExp;


            if (obj.percent > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percent + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }

        },

        getDOMstrings: function () {
            return DOMStrings
        }
    };

})();


//GLobal app control
var appController = (function (budgetCtl, UICtl) {

    var setupEventListeners = function () {
        var DOM = UICtl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItems);

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItems();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    };


    var updateBudget = function () {
        //1.calculate the budget
        budgetCtl.calculateBudget();

        //2 return the budget
        var budget = budgetCtl.getBudget();

        //3.Display the budget in the UI
        UICtl.displayBudget(budget);
    };


    var ctrlAddItems = function () {

        var input, newItem;
        //1.Get the input data 
        var input = UICtl.getInput();

        //This is for Descp and Value should not be empty or Zero
        if (input.descrip !== "" && !isNaN(input.value) && input.value > 0) {
            //2. add the item to the budget controller
            var newItem = budgetCtl.addItem(input.type, input.descrip, input.value);

            //3. add the item in the UI
            UICtl.addListItems(newItem, input.type);

            //4 Clear Fields
            UICtl.clearFields();

            //5.Calculate and Update budget 
            updateBudget();

        }

    };

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            //Split the items
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseFloat(splitID[1]);

            //1. Delete the item from the data structure
            budgetCtl.deleteItem(type, ID);

            //2.Delete the item from UI
            UICtl.deleteList(itemID);

            //3. Update and show the new budget
            updateBudget();

        }

    };

    return {
        init: function () {
            console.log('Application is started');
            UICtl.displayBudget({
                budget: 0,
                totalInc: 0,
                toatlExp: 0,
                percent: -1
            });
            setupEventListeners();
        }
    };

})(budgetController, UIController);

appController.init();