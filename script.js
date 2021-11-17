//Funções que mostram ou escondem o formulário
const Modal = {
    open(){
        //Abrir modal
        //Adicionar a classe "active" ao modal
        document.querySelector('.modal-overlay').classList.add('active');
    },
    close(){
        //Fechar o modal
        //Remover a classe "active" do modal
        document.querySelector('.modal-overlay').classList.remove('active');
    }
}

//Funções que armazenam no navegador ("memória")
const Storage = {
    get(){
        //console.log(localStorage);
        return JSON.parse(localStorage.getItem("devFinance: transactions")) || [];
    },
    set(transactions){
        localStorage.setItem("devFinance: transactions", JSON.stringify(transactions));
    }
}

//Funções que calculam entradas, saídas e saldo final
const Transaction = {
    all: Storage.get(),

    add(transaction){
        Transaction.all.push(transaction);
        //console.log(Transaction.all);
        App.reload();
        
    },
    
    remove(index){
        Transaction.all.splice(index, 1);
        //localStorage.splice(index, 1);
        App.reload();
    },

    incomes(){
        //verificar todas as transações
        //para cada transação maior que zero, 
        //somá-la a uma única variável e retornar a variável.
        let income = 0;
        Transaction.all.forEach(transaction => {
            if(transaction.amount > 0){
                income += transaction.amount;
            }
        })
        return income;
    },
    
    expenses(){
        //somar as saídas
        let expense = 0;
        Transaction.all.forEach(transaction => {
            if(transaction.amount < 0){
                expense += transaction.amount;
            }
        })
        return expense;
    },
    
    balance(){
        //somar as entradas e subtrair as saídas, tendo o total final
        return Transaction.incomes() + Transaction.expenses(); 
    }
}

//Funções que manipulam o DOM
const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),
    
    //Método que insere o trecho html construído no arquivo.html
    addTransaction(transaction, index){
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;

        DOM.transactionsContainer.appendChild(tr);
    },
    //Método que constrói o html à ser inserido, e verifica o sinal do valor
    innerHTMLTransaction(transaction, index){
        const CSSClass = transaction.amount > 0 ? "income" : "expense";
        const Amount = Utils.formatCurrency(transaction.amount);

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSClass}">${Amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="/../asset/minus.svg" 
                alt="Remover Transação">
            </td>
        `;
        return html;
    },

    //Método que atualiza o Display principal, já com dados em formato de moeda "BRL"
    updateBalance(){
        document.getElementById('incomeDisplay').innerHTML = 
            Utils.formatCurrency(Transaction.incomes());
        document.getElementById('expenseDisplay').innerHTML = 
            Utils.formatCurrency(Transaction.expenses());
        document.getElementById('totalDisplay').innerHTML = 
            Utils.formatCurrency(Transaction.balance());
    },

    //
    clearTransactions(){
        DOM.transactionsContainer.innerHTML = "";
    }
}

// Formatações
const Utils = {
    formatAmount(value){
        value = Number(value.replace(/\,\./g, "")) * 100; //replace ',' e '.' por '' /g = global
        //console.log("formatAmount()" + value);
        return value;
    },
    formatDate(date){
        const splittedDate = date.split("-");
        //console.log(`${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`);
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : "";

        value = String(value).replace(/\D/g, "");

        value = Number(value) / 100;

        value = value.toLocaleString("pt-BR", {
            style : "currency",
            currency : "BRL"
        })
        //console.log(signal + value);
        return signal + value;
    }
}

const Form = {
    //atributos que vão armazenar os dados preenchidos
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    //método que captura o valor dos atributos 
    getValues(){
        return {description: Form.description.value,
        amount: Form.amount.value,
        date: Form.date.value}
    },

    //método que valida se todos os campos foram preenchidos
    validateFields(){
        const {description, amount, date } = Form.getValues();
        if(description.trim() === "" ||
            amount.trim() === "" ||   
            date.trim() === ""){
                throw new Error("Preencha todos os campos");
        }
    },

    //método que formata os dados para salvar
    formatValues(){
        let {description, amount, date } = Form.getValues();
        amount = Utils.formatAmount(amount);
        date = Utils.formatDate(date);
        /* console.log(description);
        console.log(amount);
        console.log(date); */
        return{
            description: description,
            amount: amount,
            date: date
        }
    },

    //método que limpa os campos do formulário para nova transação
    clearForm(){
        Form.description.value = "";
        Form.amount.value = "";
        Form.date.value = "";
    },

    //método que implementa todos os outros, valida os campos, formata para salvar, salva, 
    //apaga o formulario para novo uso, fecha o modal e atualiza a aplicação
    sumbit(event){
        event.preventDefault();
        try{
            //verificar se todas as informações foram preenchidas
            Form.validateFields();
            //formatar os dados para salvar
            let transaction = Form.formatValues();
            //salvar
            Transaction.add(transaction);
            //apagar o formulário para novo uso
            Form.clearForm();
            //fechar o modal
            Modal.close();
        } catch(error){
            alert(error.message);
        }
    }
}

//Aplicação que manipula o DOM, lendo ou relendo o DOM após alterações
const App = {
    //Lê os dados epopula os campos
    init() {
        /* Transaction.all.forEach((transaction, index){
            DOM.addTransaction(transaction, index);
        });  O trecho acima pode ser feito da seguinte forma:*/
        Transaction.all.forEach(DOM.addTransaction);

        DOM.updateBalance();

        Storage.set(Transaction.all);
    },
    //Lê os dados novamente e repopula os campos com os dados atualizados
    reload() {
        DOM.clearTransactions();
        App.init();
    }
}

//Começo da aplicação
App.init();

