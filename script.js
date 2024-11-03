// Load categories
fetch('get_categories.php')
    .then(response => response.json())
    .then(categories => {
        const categoryList = document.getElementById('categoryList');
        categories.forEach(category => {
            const button = document.createElement('button');
            button.textContent = category;
            button.onclick = () => loadItems(category);
            categoryList.appendChild(button);
        });
        loadItems();
    })
    .catch(error => console.error('Error loading categories:', error));

// Load items for a selected category
function loadItems(category = '') {
    fetch('get_items.php?category=' + encodeURIComponent(category))
        .then(response => response.json())
        .then(items => {
            const itemList = document.getElementById('itemList');
            itemList.innerHTML = '';
            items.forEach(item => {
                const itemCard = document.createElement('div');
                itemCard.className = 'item-card';
                itemCard.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <p>${item.name}</p>
                    <p>Price: $${item.price}</p>
                    <button onclick="deleteItem(${item.id})">Delete</button>
                `;
                itemCard.onclick = () => addToBill(item);
                itemList.appendChild(itemCard);
            });
        })
        .catch(error => console.error('Error loading items:', error));
}

// Add item to the bill
function addToBill(item) {
    const billItems = document.getElementById('billItems');
    const billTotal = document.getElementById('billTotal');

    const billItem = document.createElement('div');
    billItem.className = 'bill-item';
    billItem.dataset.id = item.id;
    billItem.innerHTML = `
        <span>${item.name}</span>
        <span>$${item.price}</span>
        <button onclick="removeFromBill(this, ${item.price})">Remove</button>
    `;

    billItems.appendChild(billItem);

    // Update total
    const currentTotal = parseFloat(billTotal.textContent.replace('Total: $', ''));
    billTotal.textContent = `Total: $${(currentTotal + parseFloat(item.price)).toFixed(2)}`;
}

// Remove item from the bill
function removeFromBill(button, price) {
    const billItem = button.parentElement;
    const billItems = document.getElementById('billItems');
    const billTotal = document.getElementById('billTotal');

    // Remove the item from the bill list
    billItems.removeChild(billItem);

    // Update total
    const currentTotal = parseFloat(billTotal.textContent.replace('Total: $', ''));
    billTotal.textContent = `Total: $${(currentTotal - parseFloat(price)).toFixed(2)}`;
}

// Checkout and print receipt
document.getElementById('checkoutButton').onclick = printReceipt;

function printReceipt() {
    const billItems = document.getElementById('billItems').children;
    const billTotal = document.getElementById('billTotal').textContent;

    let receiptContent = "Receipt\n-------------------------\n";

    Array.from(billItems).forEach(item => {
        receiptContent += `${item.children[0].textContent} - ${item.children[1].textContent}\n`;
    });

    receiptContent += "-------------------------\n" + billTotal;

    // Open a new window and print the receipt
    const receiptWindow = window.open('', '_blank');
    receiptWindow.document.write(`<pre>${receiptContent}</pre>`);
    receiptWindow.document.close();
    receiptWindow.print();
}

// Add new product
function submitForm() {
    let formData = new FormData(document.getElementById("productForm"));

    $.ajax({
        url: 'insert.php',
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function(response) {
            alert(response);
            document.getElementById("productForm").reset();
            loadItems(); // Reload items
        },
        error: function(xhr, status, error) {
            alert("Error: " + error);
        }
    });
}

// Delete an item
function deleteItem(id) {
    if (confirm("Are you sure you want to delete this item?")) {
        $.ajax({
            url: 'delete_item.php',
            type: 'POST',
            data: { id: id },
            success: function(response) {
                alert(response);
                loadItems(); // Reload items
            },
            error: function(xhr, status, error) {
                alert("Error: " + error);
            }
        });
    }
}
