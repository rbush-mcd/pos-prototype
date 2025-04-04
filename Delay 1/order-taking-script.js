document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');

    var longTimeout = 50; // long timeout for more complex operations
    var shortimeout = 250; // short timeout for simple operations
    var firstClick = true;

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    let approvalModalDisplayed = false;

    // Observer for ingredient-embed elements
    function createObserver() {
        let observer;
    
        let options = {
            root: null, // Use the viewport as the root
            rootMargin: '0px',
            threshold: 0.1 // Trigger when 10% of the element is visible
        };
    
        observer = new IntersectionObserver(handleIntersect, options);
    
        document.querySelectorAll('.ingredient-embed').forEach(embed => {
            observer.observe(embed);
        });
    }
    
    // Intersect handling for ingredient-embed elements
    function handleIntersect(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Element is visible, run the script
                runScript(entry.target);
                // Optionally, unobserve the element after running the script
                observer.unobserve(entry.target);
            }
        });
    }
    
    // Run script for ingredient-embed elements
    function runScript(element) {
        // Your script logic here
        const script = element.querySelector('script');
        if (script) {
            eval(script.innerHTML);
        }
    }

    // Debounce function to limit the rate of function calls
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Customization data object
    const customizationData = {};

    // Function to save customization state
    function saveCustomizationState(itemName, customizationData) {
        localStorage.setItem(itemName, JSON.stringify(customizationData));
    }

    // Function to load customization state
    function loadCustomizationState(itemName) {
        const data = localStorage.getItem(itemName);
        return data ? JSON.parse(data) : null;
    }

    let selectedItemName = null;
    let preselectedQuantity = '';

    // Function to hide all cart items initially
    function hideAllCartItems() {
        const cartItems = document.querySelectorAll('.cart-list .cart-item');
        cartItems.forEach(item => {
            item.style.display = 'none';
            item.classList.remove('focused');
            console.log('Hiding cart item:', item);
        });
    }

    // Function to hide all customization contents initially
    function hideAllCustomizationContents() {
        const customizationContentsTab1 = document.querySelectorAll('.customization-list .customization-content');
        const customizationContentsTab2 = document.querySelectorAll('#drink-selection .customization-list .customization-content');
        const customizationContentsTab3 = document.querySelectorAll('#meal-review .customization-list .customization-content');
        
        customizationContentsTab1.forEach(item => {
            item.style.display = 'none';
            console.log('Hiding customization content for Tab 1:', item);
        });
        customizationContentsTab2.forEach(item => {
            item.style.display = 'none';
            console.log('Hiding customization content for Tab 2:', item);
        });
        customizationContentsTab3.forEach(item => {
            item.style.display = 'none';
            console.log('Hiding customization content for Tab 3:', item);
        });
    }

    // Function to hide all item customizations initially
    function hideAllItemCustomizations() {
        const itemCustomizationsTab1 = document.querySelectorAll('.item-customization');
        const itemCustomizationsTab2 = document.querySelectorAll('#drink-selection .item-customization');
        const itemCustomizationsTab3 = document.querySelectorAll('#meal-review .item-customization');
        
        itemCustomizationsTab1.forEach(item => {
            item.style.display = 'none';
            console.log('Hiding item customization for Tab 1:', item);
        });
        itemCustomizationsTab2.forEach(item => {
            item.style.display = 'none';
            console.log('Hiding item customization for Tab 2:', item);
        });
        itemCustomizationsTab3.forEach(item => {
            item.style.display = 'none';
            console.log('Hiding item customization for Tab 3:', item);
        });
    }

    // Function to show only the selected item in item-customization-list
    function showSelectedItemCustomization(itemName) {
        hideAllItemCustomizations();
        const selectedItemCustomizationTab1 = document.querySelector(`.item-customization[data-cart-customization="${itemName}"]`);
        const selectedItemCustomizationTab2 = document.querySelector(`#drink-selection .item-customization[data-cart-customization="${itemName}"]`);
        const selectedItemCustomizationTab3 = document.querySelector(`#meal-review .item-customization[data-cart-customization="${itemName}"]`);
        
        if (selectedItemCustomizationTab1) {
            selectedItemCustomizationTab1.style.display = 'block';
            console.log('Showing item customization for Tab 1:', itemName);
        } else {
            console.log('No item customization found for Tab 1:', itemName);
        }
        
        if (selectedItemCustomizationTab2) {
            selectedItemCustomizationTab2.style.display = 'block';
            console.log('Showing item customization for Tab 2:', itemName);
        } else {
            console.log('No item customization found for Tab 2:', itemName);
        }
        
        if (selectedItemCustomizationTab3) {
            selectedItemCustomizationTab3.style.display = 'block';
            console.log('Showing item customization for Tab 3:', itemName);
        } else {
            console.log('No item customization found for Tab 3:', itemName);
        }
    }

    // Function to move the most recently selected item to the bottom of the cart list
    function moveToBottom(cartItem) {
        const cartList = document.querySelector('.cart-list');
        cartList.appendChild(cartItem);
        console.log('Moved cart item to bottom:', cartItem);
    }

    // Function to increment the amount of cart items by a specific quantity
    async function incrementCartItem(itemName, quantity = 1) {

        await delay(shortimeout);
        const correspondingCartItem = document.querySelector(`.cart-list .cart-item[data-cart-item="${itemName}"]`);
        if (correspondingCartItem) {
            const amountElement = correspondingCartItem.querySelector('[data-cart-amount]');
            let currentAmount = parseInt(amountElement.getAttribute('amount'), 10);
            currentAmount = isNaN(currentAmount) ? 0 : currentAmount;
            currentAmount += quantity;
            amountElement.setAttribute('amount', currentAmount);
            amountElement.textContent = currentAmount;
            console.log('Updated cart item amount:', currentAmount);
            updateSubCartItems(itemName, currentAmount); // Update sub-cart-item amounts
            updateQuantityControl(itemName, currentAmount); // Update quantity control amount for both tabs
            customizationData[itemName] = customizationData[itemName] || {};
            customizationData[itemName].amount = currentAmount;
            saveCustomizationState(itemName, customizationData[itemName]);
            updateCartItemPrice(itemName);
            updateCartSubtotal();
            return currentAmount;
        } else {
            console.log('No corresponding cart item found for data-cart-item:', itemName);
            return null;
        }
    }

    // Function to decrement the amount of cart items
    async function decrementCartItem(itemName) {
        await delay(shortimeout);

        const correspondingCartItem = document.querySelector(`.cart-list .cart-item[data-cart-item="${itemName}"]`);
        if (correspondingCartItem) {
            const amountElement = correspondingCartItem.querySelector('[data-cart-amount]');
            let currentAmount = parseInt(amountElement.getAttribute('amount'), 10);
            currentAmount = isNaN(currentAmount) ? 1 : currentAmount;
            currentAmount = Math.max(1, currentAmount - 1);
            amountElement.setAttribute('amount', currentAmount);
            amountElement.textContent = currentAmount;
            console.log('Updated cart item amount:', currentAmount);
            updateSubCartItems(itemName, currentAmount); // Update sub-cart-item amounts
            updateQuantityControl(itemName, currentAmount); // Update quantity control amount for both tabs
            customizationData[itemName] = customizationData[itemName] || {};
            customizationData[itemName].amount = currentAmount;
            saveCustomizationState(itemName, customizationData[itemName]);
            updateCartItemPrice(itemName);
            updateCartSubtotal();
            return currentAmount;
        } else {
            console.log('No corresponding cart item found for data-cart-item:', itemName);
            return null;
        }
    }

    // Function to update sub-cart-item amounts
    function updateSubCartItems(itemName, currentAmount) {
        const subCartItems = document.querySelectorAll(`.sub-cart-item[data-cart-item="${itemName}"] .order-item-quantity.is--small`);
        subCartItems.forEach(subCartItem => {
            subCartItem.textContent = currentAmount;
            console.log('Updated sub-cart-item amount to:', currentAmount);
        });
    }

    // Function to update the quantity-control amount field for the corresponding customization-content
    function updateQuantityControl(itemName, currentAmount) {
        const quantityControlAmountElements = document.querySelectorAll(`.customization-content[data-cart-customization-content="${itemName}"] .quantity-control .amount`);
        quantityControlAmountElements.forEach(amountElement => {
            if (amountElement) {
                amountElement.setAttribute('amount', currentAmount);
                amountElement.textContent = currentAmount;
                console.log('Updated quantity control amount:', currentAmount);
            }
        });
    }

    // Function to update the price based on quantity
    function updateCartItemPrice(itemName, basePrice = null) {
        const correspondingCartItem = document.querySelector(`.cart-list .cart-item[data-cart-item="${itemName}"]`);
        if (correspondingCartItem) {
            const amountElement = correspondingCartItem.querySelector('[data-cart-amount]');
            const priceElement = correspondingCartItem.querySelector('[data-cart-price]');
            if (amountElement && priceElement) {
                const price = basePrice !== null ? basePrice : parseFloat(priceElement.getAttribute('data-cart-price'));
                const quantity = parseInt(amountElement.getAttribute('amount'), 10);
                console.log('Price:', price);
                console.log('Quantity:', quantity);
                if (!isNaN(price) && !isNaN(quantity)) {
                    const totalPrice = (price * quantity).toFixed(2);
                    priceElement.textContent = totalPrice;
                    console.log(`Updated price for ${itemName}: ${totalPrice}`);
                } else {
                    console.log('Invalid price or quantity for', itemName);
                }
            } else {
                console.log('Amount or price element not found for', itemName);
            }
        } else {
            console.log('No corresponding cart item found for data-cart-item:', itemName);
        }
    }

    // Function to update the cart subtotal
    function updateCartSubtotal() {
        const cartItems = document.querySelectorAll('.cart-list .cart-item');
        let subtotal = 0;
    
        cartItems.forEach(item => {
            const priceElement = item.querySelector('[data-cart-price]');
            if (priceElement && item.style.display !== 'none') {
                const price = parseFloat(priceElement.textContent);
                if (!isNaN(price)) {
                    subtotal += price;
                }
            }
        });
    
        const subtotalElement = document.getElementById('cart-subtotal');
            if (subtotalElement) {
                subtotalElement.textContent = subtotal.toFixed(2);
            }
        
        // Update the cart tax based on the new subtotal
        updateCartTax(subtotal);
    
        // Check if the subtotal is 50 or greater and display the approval modal
        if (subtotal >= 50 && !approvalModalDisplayed) {
            const approvalModal = document.getElementById('approval-modal');
            if (approvalModal) {
                approvalModal.style.display = 'flex';
                console.log('Approval modal displayed');
                approvalModalDisplayed = true;
            } else {
                console.log('Approval modal element not found');
            }
        }
    }

    // Open rewards modal
    document.getElementById('rewards-button').addEventListener('click', async function() {
        await delay(longTimeout);
        const rewardsModal = document.getElementById('rewards-modal');
        if (rewardsModal) {
            rewardsModal.style.display = 'flex';
            console.log('Rewards modal displayed');
        }
    });

    // Close rewards modal
    document.querySelectorAll('#enter-loyalty').forEach(function(element) {
        element.addEventListener('click', async function() {
            await delay(longTimeout);
            const rewardsModal = document.getElementById('rewards-modal');
            if (rewardsModal) {
                rewardsModal.style.display = 'none';
                console.log('Rewards modal hidden');
            }
        });
    });
    
    document.querySelectorAll('.mobile-order').forEach(function(element) {
        element.addEventListener('click', function() {
            const rewardsModal = document.getElementById('rewards-modal');
            if (rewardsModal) {
                rewardsModal.style.display = 'none';
                console.log('Rewards modal hidden');
            }
        });
    });

    // Function to update the cart tax
    function updateCartTax(subtotal) {
        const taxRate = 0.10; // 10% tax rate
        const tax = subtotal * taxRate;
        const taxElement = document.getElementById('cart-tax');
        if (taxElement) {
            taxElement.textContent = tax.toFixed(2);
        }
    }

    // Function to update the menu-list grid columns for all menu-list elements
    function updateMenuListGrid(isPanelOpen) {
        const menuLists = document.querySelectorAll('.menu-list');
        const screenWidth = window.innerWidth;
        let columns;
        if (screenWidth < 1920) {
            columns = isPanelOpen ? 3 : 3;
        } else {
            columns = isPanelOpen ? 3 : 3;
        }
        if (menuLists.length > 0) {
            menuLists.forEach(menuList => {
                menuList.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
                console.log(`Updated menu-list grid to ${columns} columns for menu list: ${menuList}`);
            });
        } else {
            console.log('Menu lists not found');
        }
    }

    // Function to update the min-width of cart-customizations based on screen size and panel state
    function updateCartCustomizationsWidth(isPanelOpen) {
        const cartCustomizations = document.querySelector('.cart-customizations');
        if (cartCustomizations) {
            const screenWidth = window.innerWidth;
            if (screenWidth < 1920) {
                cartCustomizations.style.minWidth = isPanelOpen ? '448px' : '448px';
            } else {
                cartCustomizations.style.minWidth = isPanelOpen ? '752px' : '752px';
            }
            console.log(`Updated cart-customizations min-width to ${cartCustomizations.style.minWidth}`);
        } else {
            console.log('Cart customizations not found');
        }
    }

    // Function to update the customization panel
    function updateCustomizationPanel(itemName) {
        const customizationPanel = document.querySelector('.customization-panel');
        if (customizationPanel) {
            customizationPanel.style.display = 'flex';
            updateMenuListGrid(true);
            hideAllCustomizationContents();
            const correspondingCustomizationContentTab1 = document.querySelector(`.customization-list .customization-content[data-cart-customization-content="${itemName}"]`);
            const correspondingCustomizationContentTab2 = document.querySelector(`#drink-selection .customization-list .customization-content[data-cart-customization-content="${itemName}"]`);
            const correspondingCustomizationContentTab3 = document.querySelector(`#meal-review .customization-list .customization-content[data-cart-customization-content="${itemName}"]`);
            
            if (correspondingCustomizationContentTab1) {
                correspondingCustomizationContentTab1.style.display = 'flex';
                console.log('Showing customization content for Tab 1:', itemName);
            } else {
                console.log('No corresponding customization content found for Tab 1:', itemName);
            }
            if (correspondingCustomizationContentTab2) {
                correspondingCustomizationContentTab2.style.display = 'flex';
                console.log('Showing customization content for Tab 2:', itemName);
            } else {
                console.log('No corresponding customization content found for Tab 2:', itemName);
            }
            if (correspondingCustomizationContentTab3) {
                correspondingCustomizationContentTab3.style.display = 'flex';
                console.log('Showing customization content for Tab 3:', itemName);
            } else {
                console.log('No corresponding customization content found for Tab 3:', itemName);
            }

            // Retrieve the customization data
            const customization = customizationData[itemName] || loadCustomizationState(itemName) || {};
            const amount = customization.amount || 1;
            const customizationText = customization.customizationText || '';

            // Update the quantity control amount for all tabs
            const quantityControlTabs = document.querySelectorAll(`.customization-content[data-cart-customization-content="${itemName}"] .quantity-control .amount`);
            quantityControlTabs.forEach(amountElement => {
                if (amountElement) {
                    amountElement.setAttribute('amount', amount);
                    amountElement.textContent = amount;
                    console.log('Updated quantity control amount:', amount);
                }
            });

            // Update the customization text for all tabs
            const descriptionElements = document.querySelectorAll(`.customization-content[data-cart-customization-content="${itemName}"] .order-item-description:not(.is--meal-side)`);
            descriptionElements.forEach(descriptionElement => {
                if (descriptionElement) {
                    descriptionElement.textContent = customizationText;
                    descriptionElement.style.display = customizationText ? 'block' : 'none';
                }
            });

            // Ensure the description remains visible when switching tabs
            if (descriptionElements[0] && descriptionElements[0].style.display === 'block') {
                descriptionElements.forEach(descriptionElement => {
                    descriptionElement.style.display = 'block';
                });
            }

            // Update the state of customization ingredients for all tabs
            const ingredients = customization.ingredients || {};
            const customizationIngredientsTabs = document.querySelectorAll(`.customization-content[data-cart-customization-content="${itemName}"] .customization-ingredient`);
            customizationIngredientsTabs.forEach(ingredient => {
                const ingredientName = ingredient.getAttribute('ingredient-name');
                if (ingredients[ingredientName]) {
                    ingredient.classList.add('focused');
                } else {
                    ingredient.classList.remove('focused');
                }
            });

            // Add event listeners to quantity control buttons for all tabs
            addQuantityControlListeners();

            // Add event listeners to remove buttons in tab 3
            const removeButtonsTab3 = document.querySelectorAll(`#meal-review .item-customization-wrapper #remove-button`);
            removeButtonsTab3.forEach(button => {
                button.removeEventListener('click', removeSelectedItem); // Remove existing listener
                button.addEventListener('click', removeSelectedItem); // Add new listener
            });
        } else {
            console.log('Customization panel not found');
        }
    }

    // Function to add event listeners to quantity control buttons
    function addQuantityControlListeners() {
        const quantityAddButtons = document.querySelectorAll('#quantity-add');
        const quantitySubtractButtons = document.querySelectorAll('#quantity-subtract');
        quantityAddButtons.forEach(button => {
            button.removeEventListener('click', handleQuantityAddClick); // Remove existing listener
            button.addEventListener('click', handleQuantityAddClick); // Add new listener
        });
        quantitySubtractButtons.forEach(button => {
            button.removeEventListener('click', handleQuantitySubtractClick); // Remove existing listener
            button.addEventListener('click', handleQuantitySubtractClick); // Add new listener
        });
    }

    // Event handler for quantity add button click
    const handleQuantityAddClick = debounce(function(event) {
        const itemName = event.target.closest('.customization-content').getAttribute('data-cart-customization-content');
        incrementCartItem(itemName);
    }, 300); // Adjust the debounce wait time as needed

    // Event handler for quantity subtract button click
    const handleQuantitySubtractClick = debounce(function(event) {
        const itemName = event.target.closest('.customization-content').getAttribute('data-cart-customization-content');
        decrementCartItem(itemName);
    }, 300); // Adjust the debounce wait time as needed

    // Object to store the tab state for each item
    const itemTabState = {};

 // Function to switch tabs
function switchTab(tabIndex) {
    console.log(`Switching to tab index: ${tabIndex}`);
    const customizationPanel = document.querySelector('.customization-panel');
    if (customizationPanel) {
        const tabId = tabIndex === 1 ? 'drink-selection' : tabIndex === 2 ? 'meal-review' : tabIndex === 3 ? 'sub-item-customization' : 'item-customization';
        
        if (tabIndex + 1 == 4) {
            tabIndex = 2;
        }
        
        customizationPanel.setAttribute('data-current', `Tab ${tabIndex + 1}`);
        console.log(`Set customization-panel data-current to: Tab ${tabIndex + 1}`);
        const tabs = customizationPanel.querySelectorAll('.customization-step');
        tabs.forEach(tab => {
            tab.style.display = tab.id === tabId ? 'block' : 'none';
            console.log(`Tab ${tab.id} display: ${tab.style.display}`);
        });
        // Save the current tab index for the selected item
        if (selectedItemName) {
            itemTabState[selectedItemName] = tabIndex;
        }
        // Show the customization-content for the corresponding item in tab 3
        if (tabIndex === 2) {
            const customizationContentTab3 = document.querySelector(`#meal-review .customization-content[data-cart-customization-content="${selectedItemName}"]`);
            if (customizationContentTab3) {
                customizationContentTab3.style.display = 'flex';
                console.log('Showing customization content for Tab 3:', selectedItemName);
            } else {
                console.log('No corresponding customization content found for Tab 3:', selectedItemName);
            }
        }
    } else {
        console.log('Customization panel not found');
    }
}

    async function makeItAMeal(event) {
        var cartItem = event.currentTarget.getAttribute('data-cart-item');
        if(!cartItem) {
            cartItem = event.currentTarget.getAttribute('data-name');
        }

        //change drink
        if(!cartItem) {
            cartItem = event.currentTarget.closest('.item-customization').getAttribute('data-cart-customization');
        }
        
        var itemName = event.currentTarget.getAttribute('data-name');

        if(!itemName) {
            itemName = event.currentTarget.closest('.item-customization').getAttribute('data-cart-customization');
        }
        
            console.log(`"make-meal" button clicked for item: ${cartItem}`);
            await delay(shortimeout);

            // Get the current amount of the item
            const correspondingCartItem = document.querySelector(`.cart-list .cart-item[data-cart-item="${cartItem}"]`);
            const amountElement = correspondingCartItem.querySelector('[data-cart-amount]');
            const currentAmount = amountElement ? parseInt(amountElement.getAttribute('amount'), 10) : 1;

            // Set the amount in the Tab 2 quantity-control
            const quantityControlAmountElementTab2 = document.querySelector(`#drink-selection .customization-content[data-cart-customization-content="${itemName}"] .quantity-control .amount`);
            if (quantityControlAmountElementTab2) {
                quantityControlAmountElementTab2.setAttribute('amount', currentAmount);
                quantityControlAmountElementTab2.textContent = currentAmount;
                console.log('Updated quantity control amount for Tab 2:', currentAmount);
            }

            // Show the meal-info section and set the amount for sub-cart-item elements
            const mealInfoSection = correspondingCartItem.querySelector('.meal-info');
            if (mealInfoSection) {
                mealInfoSection.style.display = 'flex';
                console.log('Displayed meal-info section for item:', cartItem);

                // Set the amount for sub-cart-item elements
                const subCartItems = mealInfoSection.querySelectorAll('.sub-cart-item .order-item-quantity.is--small');
                subCartItems.forEach(subCartItem => {
                    subCartItem.textContent = currentAmount;
                    console.log('Updated sub-cart-item amount to:', currentAmount);
                });

                // Show meal-side and drink-selection, hide meal-drink and side-selection
                const mealSide = mealInfoSection.querySelector('#meal-side');
                const drinkSelection = mealInfoSection.querySelector('#drink-selection');
                const mealDrink = mealInfoSection.querySelector('#meal-drink');
                const sideSelection = mealInfoSection.querySelector('#side-selection');
                if (mealSide) mealSide.style.display = 'flex';
                if (drinkSelection) drinkSelection.style.display = 'flex';
                if (mealDrink) mealDrink.style.display = 'none';
                if (sideSelection) sideSelection.style.display = 'none';
            }

            // Show the meal-tag element
            const mealTagElement = correspondingCartItem.querySelector('.cart-item-info .item-content .order-item-price-container .meal-tag');
            if (mealTagElement) {
                mealTagElement.style.display = 'block';
                console.log('Displayed meal-tag element for item:', cartItem);
            }

            // Set default size control button
            setDefaultSizeControl();

            // Restore the saved state of the size control buttons
            const customization = customizationData[cartItem] || loadCustomizationState(cartItem) || {};
            const selectedSize = customization.selectedSize || 'M';
            const sizeControlButton = document.querySelector(`.customization-content[data-cart-customization-content="${cartItem}"] .button.is--size-control[data-size="${selectedSize}"]`);
            if (sizeControlButton) {
                sizeControlButton.classList.add('focused');
            }

            itemTabState[cartItem] = 1; // Store the tab state as tab 2 (index 1)
            switchTab(1); // Switch to tab 2 (index 1)
    }
    
    // Event listener for the "make-meal" button
    document.querySelectorAll('#make-meal').forEach(button => {
        button.addEventListener('click', function(event) {
            makeItAMeal(event);
        });
    });

    document.querySelectorAll('#change-drink').forEach(button => {
        button.addEventListener('click', function(event) {
            makeItAMeal(event);
        });
    });

    // Function to handle item selection and restore tab state
    function handleItemSelection(itemName) {
        const tabIndex = itemTabState[itemName] !== undefined ? itemTabState[itemName] : 0; // Default to tab 1 (index 0)
        console.log(`Item selected: ${itemName}, restoring tab index: ${tabIndex}`);
        switchTab(tabIndex);
    }

    // Function to handle cart item click
    function handleCartItemClick(itemName) {
        console.log('handleCartItemClick called with:', itemName);
        const customizationPanel = document.querySelector('.customization-panel');
        const correspondingCartItem = document.querySelector(`.cart-list .cart-item[data-cart-item="${itemName}"]`);

        selectedItemName = itemName;
        console.log('Selected item name set to:', selectedItemName);
        const cartItems = document.querySelectorAll('.cart-list .cart-item');
        cartItems.forEach(item => item.classList.remove('focused'));
        correspondingCartItem.classList.add('focused');
        // Update the customization panel with the stored customization data
        updateCustomizationPanel(itemName);
        showSelectedItemCustomization(itemName);

        // Restore the tab state for the selected item
        handleItemSelection(itemName);

        // Update the quantity-control amount field
        const amountElement = correspondingCartItem.querySelector('[data-cart-amount]');
        const quantityControlAmountElement = document.querySelector(`.customization-content[data-cart-customization-content="${itemName}"] .quantity-control .amount`);
        if (amountElement && quantityControlAmountElement) {
            const currentAmount = amountElement.getAttribute('amount');
            quantityControlAmountElement.setAttribute('amount', currentAmount);
            quantityControlAmountElement.textContent = currentAmount;
            console.log('Updated quantity control amount:', currentAmount);
        }
    }

    // Helper function to check if an element is visible
    function isElementVisible(element) {
        return element && element.style.display !== 'none' && element.style.visibility !== 'hidden';
    }

    // Function to handle menu item click
    const handleMenuItemClick = debounce(async function(itemName) {
        console.log('handleMenuItemClick called with:', itemName);

        if(firstClick){
            await delay(longTimeout);
            firstClick = false;
        } else {
            await delay(shortimeout);
        }

        let correspondingCartItem = document.querySelector(`.cart-item[data-cart-item="${itemName}"]`);
        let quantityToAdd = preselectedQuantity ? parseInt(preselectedQuantity, 10) : 1;
        preselectedQuantity = ''; // Reset preselected quantity after adding to cart
        updatePreselectedQuantityDisplay();

        const drinkSelectionElement = document.querySelector('#drink-selection');
        const selectedCartItem = document.querySelector('.cart-item.focused');
        const clickedMenuItem = document.querySelector(`.menu-item[data-name="${itemName}"]`);
        const category = clickedMenuItem ? clickedMenuItem.getAttribute('data-category') : '';
    
        if (isElementVisible(drinkSelectionElement) && selectedCartItem && (category === 'Drinks' || category === 'McCafé')) {
            handleDrinkSelectionClick({ target: clickedMenuItem });
            return;
        }

        if (correspondingCartItem && correspondingCartItem.style.display !== 'none') {
            // If the cart item is already visible, increment the amount
            const newAmount = incrementCartItem(itemName, quantityToAdd);
            // Update the quantity-control amount field
            const quantityControlAmountElement = document.querySelector('.quantity-control .amount');
            if (quantityControlAmountElement) {
                quantityControlAmountElement.setAttribute('amount', newAmount);
                quantityControlAmountElement.textContent = newAmount;
                console.log('Updated quantity control amount:', newAmount);
            }
        } else {
            if (!correspondingCartItem) {
                // Create a new cart item if it doesn't exist
                correspondingCartItem = document.createElement('div');
                correspondingCartItem.classList.add('cart-item');
                correspondingCartItem.setAttribute('data-cart-item', itemName);
                correspondingCartItem.innerHTML = `
                    <div class="amount" data-cart-amount="0">0</div>
                    <div class="order-item-description is--cart-description" data-cart-description="item-description" style="display: none;">-</div>
                    <!-- Add other necessary elements for the cart item -->
                `;
                document.querySelector('.cart-list').appendChild(correspondingCartItem);
                console.log('Added new cart item:', correspondingCartItem);
            } else {
                // Reset the cart item if it already exists but was hidden
                correspondingCartItem.style.display = 'flex';
                const amountElement = correspondingCartItem.querySelector('[data-cart-amount]');
                if (amountElement) {
                    amountElement.setAttribute('amount', 0);
                    amountElement.textContent = 0;
                }
                const cartItemDescription = correspondingCartItem.querySelector('[data-cart-description]');
                if (cartItemDescription) {
                    cartItemDescription.textContent = '-';
                    cartItemDescription.style.display = 'none';
                }
            }
            const cartItems = document.querySelectorAll('.cart-list .cart-item');
            cartItems.forEach(item => item.classList.remove('focused'));
            correspondingCartItem.classList.add('focused');
            console.log('Focused cart item:', correspondingCartItem);
            const newAmount = incrementCartItem(itemName, quantityToAdd);
            // Update the quantity-control amount field
            const quantityControlAmountElement = document.querySelector('.quantity-control .amount');
            if (quantityControlAmountElement) {
                quantityControlAmountElement.setAttribute('amount', newAmount);
                quantityControlAmountElement.textContent = newAmount;
                console.log('Updated quantity control amount:', newAmount);
            }
            updateCustomizationPanel(itemName, parseInt(correspondingCartItem.querySelector('[data-cart-amount]').getAttribute('amount'), 10));
            updateCartItemPrice(itemName);
            showSelectedItemCustomization(itemName);
            selectedItemName = itemName;
            console.log('Selected item name set to:', selectedItemName);
            // Restore the tab state for the selected item
            handleItemSelection(itemName);
        }
    }, 300); // Adjust the debounce wait time as needed

    // Add click event listener to each menu item and remove button
    function addClickListeners() {
        const menuItems = document.querySelectorAll('.menu-list .menu-item');
        if (menuItems.length === 0) {
            console.log('No menu items found');
        } else {
            menuItems.forEach(item => {
                item.addEventListener('click', function() {
                    const itemName = this.getAttribute('data-name');
                    console.log('Clicked menu item with data-name:', itemName);
                    handleMenuItemClick(itemName);
                });
            });
        }

        const cartItems = document.querySelectorAll('.cart-list .cart-item');
        if (cartItems.length === 0) {
            console.log('No cart items found');
        } else {
            cartItems.forEach(item => {
                item.addEventListener('click', function() {
                    const itemName = this.getAttribute('data-name');
                    console.log('Clicked cart item with data-name:', itemName);
                    handleCartItemClick(itemName);
                });
            });
        }

        // Add event listeners to remove buttons in all tabs
        const removeButtons = document.querySelectorAll('#remove-button');
        removeButtons.forEach(button => {
            button.removeEventListener('click', removeSelectedItem); // Remove existing listener
            button.addEventListener('click', removeSelectedItem); // Add new listener
        });

        // Add event listeners for item-content clicks within meal-item
        const itemContents = document.querySelectorAll('.meal-item:not(.is--meal-side) .item-content');
        itemContents.forEach(content => {
            content.addEventListener('click', handleMealItemClick);
        });

        const drinkItemContents = document.querySelectorAll('#meal-item-drink .item-content');
        drinkItemContents.forEach(content => {
            content.addEventListener('click', handleItemContentClick);
        });

    }

    // Initial call to add click listeners and hide all cart items and customization contents
    hideAllCartItems();
    hideAllCustomizationContents();
    hideAllItemCustomizations();
    addClickListeners();

    // Function to handle menu category click
    function handleMenuCategoryClick(event) {
        const target = event.target.closest('.menu-category');
        if (!target) return;
        const categoryId = target.id.replace('menu-category-', 'category-');
        if (!categoryId) {
            console.error('Category ID not found.');
            return;
        }
        const categorySection = document.getElementById(categoryId);
        if (categorySection) {
            categorySection.scrollIntoView({ behavior: 'smooth' });
        } else {
            console.error('Category section with ID', categoryId, 'not found.');
        }
    }

    // Add click event listeners to all menu-category elements
    document.querySelectorAll('.menu-category').forEach(item => {
        item.addEventListener('click', handleMenuCategoryClick);
    });

    // Function to update the preselected quantity display
    function updatePreselectedQuantityDisplay() {
        const preselectedQuantityElement = document.getElementById('preselected-quantity');
        const clearButton = document.getElementById('quantity-clear');
        if (preselectedQuantityElement) {
            preselectedQuantityElement.textContent = preselectedQuantity || '-';
            if (preselectedQuantity) {
                clearButton.style.display = 'block';
            } else {
                clearButton.style.display = 'none';
            }
        } else {
            console.error('Element with ID "preselected-quantity" not found.');
        }
    }

    // Function to handle quantity number click
    async function handleQuantityNumberClick(event) {

        await delay(shortimeout); // Wait for certain time before executing the function
        const target = event.target.closest('.quantity-number');
        if (!target) {
            console.error('Quantity number element not found.');
            return;
        }
        const number = target.id.split('-').pop();
        console.log('Quantity number clicked:', number); // Debugging log
        if (number === '0' && preselectedQuantity === '') {
            console.log('Cannot add 0 as the first digit');
            return; // Do not allow 0 as the first digit
        }
        if (preselectedQuantity.length < 2) {
            preselectedQuantity += number;
        } else {
            preselectedQuantity = number;
        }
        console.log('Updated preselectedQuantity:', preselectedQuantity); // Debugging log
        updatePreselectedQuantityDisplay();
    }

    // Add click event listeners to quantity numbers
    document.querySelectorAll('.quantity-number').forEach(item => {
        item.addEventListener('click', handleQuantityNumberClick);
    });

    // Function to handle clear button click
    function handleClearButtonClick() {
        preselectedQuantity = '';
        updatePreselectedQuantityDisplay();
    }

    // Add click event listener to clear button
    const clearButton = document.getElementById('quantity-clear');
    if (clearButton) {
        clearButton.addEventListener('click', handleClearButtonClick);
    } else {
        console.error('Element with ID "quantity-clear" not found.');
    }

    // Use MutationObserver to detect when new menu items are added to the DOM
    const observer = new MutationObserver(addClickListeners);
    const config = { childList: true, subtree: true };
    const menuList = document.querySelector('.menu-list');
    if (menuList) {
        observer.observe(menuList, config);
    } else {
        console.log('Menu list not found');
    }

    // Initial call to update the cart subtotal and tax
    updateCartSubtotal();

    // Function to display the current date
    function formatDate(date) {
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: '2-digit' };
        return date.toLocaleDateString('en-US', options);
    }

    const currentDate = new Date();
    const formattedDate = formatDate(currentDate);
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        dateElement.textContent = formattedDate;
    } else {
        console.error('Element with ID "current-date" not found.');
    }

    // Function to display the current time
    function formatTime(date) {
        return date.toTimeString().split(' ')[0]; // Extracts the time portion in HH:MM:SS format
    }

    const currentTime = new Date();
    const formattedTime = formatTime(currentTime);
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        timeElement.textContent = formattedTime;
    } else {
        console.error('Element with ID "current-time" not found.');
    }

    // Function to update the time every second
    function updateTime() {
        const currentTime = new Date();
        const formattedTime = formatTime(currentTime);
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            timeElement.textContent = formattedTime;
        } else {
            console.error('Element with ID "current-time" not found.');
        }
    }

    // Initial call to display the time immediately
    updateTime();

    // Set interval to update the time every second
    setInterval(updateTime, 1000);

    // Function to update size text blocks
    function updateSizeTextBlocks(item, size, cartItem, customItem) {
        const mealItemSizeElement = cartItem.querySelector('#side-item-size[data-size="meal-item-size"]');
        const mealSideSizeElement = cartItem.querySelector('#meal-side-size[data-size="cart-item-size"][data-side-size="meal-side-size"]');
        const mealDrinkSizeElement = cartItem.querySelector('#meal-drink-size[data-size="cart-item-size"][data-drink-size="meal-drink-size"]');

        const customSideSizeElement = customItem.querySelectorAll('#meal-item-side .meal-item-size')[0];
        const customDrinkSizeElement = customItem.querySelectorAll('#meal-item-drink .meal-item-size')[0];
     
        if (mealItemSizeElement) {
            mealItemSizeElement.textContent = size;
            console.log('Updated meal-item-size to:', size);
        }

        if ((item == 'meal-item-side') && mealSideSizeElement) {
            mealSideSizeElement.textContent = size;
            customSideSizeElement.textContent = size;
            console.log('Updated meal-side-size to:', size);
        }
        
        if ((item == 'meal-item-drink') && mealDrinkSizeElement) {
            mealDrinkSizeElement.textContent = size;
            customDrinkSizeElement.textContent = size;
            console.log('Updated meal-drink-size to:', size);
        }
    }

    function updateMealSize(size, cartItem, headerItem) {
        const sideCartItem = cartItem.querySelector("#meal-side-size")
        const sideCustomItem = headerItem.querySelector('#meal-item-side [data-size="meal-item-size"]')

        if (sideCartItem) {
            sideCartItem.textContent = size;
            console.log("Updated meal size in cart to:", size);
        }

        if (sideCustomItem) {
            sideCustomItem.textContent = size;
            console.log("Updated meal size in custom panel to:", size);
        }
    }

    function updateSize(itemName, size, cartItem, customItem) {
        const itemElementCart = cartItem.querySelector('#cart-item-size[data-size=cart-item-size][data-cart-size=cart-item-size]');
        const itemElementCustom = customItem.querySelector(`#meal-item-size[data-name="${itemName}"]`);
        
        if (itemElementCart) {
            itemElementCart.textContent = size;
            console.log('Updated drink-size in cart to:', size);
        }

        if (itemElementCustom) {
            itemElementCustom.textContent = size;
            console.log('Updated drink-size in custom panel to:', size);
        }
    }

    // Function to handle size control button click
    function handleSizeControlClick(event) {
        const sizeControlButton = event.target;
        const size = sizeControlButton.getAttribute('data-size');
        var customizationContent = sizeControlButton.closest('.customization-content');
        var itemName = customizationContent?.getAttribute('data-cart-customization-content');
        var isItem = false;

        if(!itemName) {
            customizationContent = sizeControlButton.closest('.item-customization')
            itemName = customizationContent.getAttribute('data-cart-customization');
            isItem = true;
        }
        
        const correspondingCartItem = document.querySelector(`.cart-item[data-cart-item="${itemName}"]`);
        const itemSelector = sizeControlButton.parentElement.parentElement.parentElement.id;

        console.log("Item Selector: " + itemSelector);
        
        if (!correspondingCartItem) return;

        // Update size control button states
        const sizeControlContainer = sizeControlButton.closest('.size-control-container');
        if (!sizeControlContainer) return;

        const sizeControlButtons = sizeControlContainer.querySelectorAll('.button.is--size-control');
        sizeControlButtons.forEach(button => button.classList.remove('focused'));
        sizeControlButton.classList.add('focused');

        if (customizationContent.childNodes.length == 2 && !customizationContent.classList.contains('is--meal-review')){
            console.log("Just a drink!");
            updateSize(itemName, size, correspondingCartItem, customizationContent);
        } else if (customizationContent.childNodes.length == 3){
            console.log("Meal seclection!");
            updateMealSize(size, correspondingCartItem, customizationContent);
        } else {
            // Update text elements based on selected size
            updateSizeTextBlocks(itemSelector, size, correspondingCartItem, customizationContent);
        }

        // Save the state of the size control buttons
        customizationData[itemName] = customizationData[itemName] || {};
        customizationData[itemName].selectedSize = size;
        saveCustomizationState(itemName, customizationData[itemName]);
    }

    // Function to add event listeners to size control buttons
    function addSizeControlListeners() {
        const sizeControlButtons = document.querySelectorAll('.size-control .button.is--size-control');
        sizeControlButtons.forEach(button => {
            button.removeEventListener('click', handleSizeControlClick); // Remove existing listener
            button.addEventListener('click', handleSizeControlClick); // Add new listener
        });
    }

    // Function to set the default focused size control button
    function setDefaultSizeControl() {
        const defaultButton = document.querySelector('.customization-content[data-cart-customization-content="' + selectedItemName + '"] #size-control-medium');
        if (defaultButton) {
            defaultButton.classList.add('focused');
        }
    }

    // Initial setup for size control buttons
    setDefaultSizeControl();
    addSizeControlListeners();

    // Function to add event listeners to customization ingredients
    function addCustomizationIngredientListeners() {
        document.querySelectorAll('.customization-ingredient').forEach(item => {
            item.addEventListener('click', function() {
                const ingredientName = this.getAttribute('ingredient-name');
                const customizationType = this.closest('.customization-ingredient-list')?.id.split('-').pop().toUpperCase();
                const customizationText = customizationType === 'REQUIRED' ? ingredientName : `${customizationType} ${ingredientName}`;
                updateItemDescription(customizationText);
            });
        });
    }

    // Function to handle customization ingredient click
    async function handleCustomizationIngredientClick(event) {

        await delay(shortimeout); // Wait for certain time before executing the function
        const target = event.target.closest('.customization-ingredient');
        if (!target) return;
    
        const ingredientName = target.getAttribute('ingredient-name');
        const customizationType = target.closest('.customization-ingredient-list')?.id.split('-').pop().toUpperCase();
        let customizationText = customizationType === 'REQUIRED' ? ingredientName : `${customizationType} ${ingredientName}`;
    
        console.log('Customization ingredient clicked:', customizationText);
    
        // Check if the customization type is "ADD"
        if (customizationType === 'ADD') {
            // Update the description with incrementing amounts
            customizationText = updateIncrementingDescription(target, ingredientName, customizationType);
        } else {
            // Toggle the focused class on the clicked element
            target.classList.toggle('focused');
        }
    
        // Save the state of the customization ingredient for the selected item
        customizationData[selectedItemName] = customizationData[selectedItemName] || {};
        customizationData[selectedItemName].ingredients = customizationData[selectedItemName].ingredients || {};
        customizationData[selectedItemName].ingredients[ingredientName] = target.classList.contains('focused');
        saveCustomizationState(selectedItemName, customizationData[selectedItemName]);
    
        // Check if the quantity of the selected item is greater than 1
        const correspondingCartItem = document.querySelector(`.cart-item[data-cart-item="${selectedItemName}"]`);
        const amountElement = correspondingCartItem.querySelector('[data-cart-amount]');
        let currentAmount = parseInt(amountElement.getAttribute('amount'), 10);
    
        if (currentAmount > 1) {
            // Calculate the base price of the item
            const priceElement = correspondingCartItem.querySelector('[data-cart-price]');
            const basePrice = parseFloat(priceElement.textContent) / currentAmount;
    
            // Decrement the quantity of the original item
            currentAmount -= 1;
            amountElement.setAttribute('amount', currentAmount);
            amountElement.textContent = currentAmount;
    
            // Update the price of the original item
            updateCartItemPrice(selectedItemName, basePrice);
    
            // Clone the existing cart item and update it with the customization
            cloneAndCustomizeCartItem(correspondingCartItem, customizationText, basePrice);
        } else {
            // Update the item description
            updateItemDescription(customizationText);
        }
    }
    
    // Function to clone and customize the cart item
    function cloneAndCustomizeCartItem(originalCartItem, customizationText, basePrice) {
        const cartList = document.querySelector('.cart-list');
        const newCartItem = originalCartItem.cloneNode(true);
        const uniqueId = `${originalCartItem.getAttribute('data-cart-item')}-${Date.now()}`;
        newCartItem.setAttribute('data-cart-item', uniqueId);
        // Ensure the meal-item has the correct data-meal-item attribute
        const originalMealItem = document.querySelector(`.meal-item[data-meal-item="${originalCartItem.getAttribute('data-cart-item')}"]`);
        if (originalMealItem) {
            const newMealItem = originalMealItem.cloneNode(true);
            newMealItem.setAttribute('data-meal-item', uniqueId);
            const customizationContent = document.querySelector(`.customization-content[data-cart-customization-content="${uniqueId}"] .meal-item-container`);
            if (customizationContent) {
                customizationContent.appendChild(newMealItem);
            }
        }
        // Update the cloned item with the customization details
        const amountElement = newCartItem.querySelector('[data-cart-amount]');
        if (amountElement) {
            amountElement.setAttribute('amount', 1);
            amountElement.textContent = '1';
        }
        const descriptionElement = newCartItem.querySelector('[data-cart-description]');
        if (descriptionElement) {
            descriptionElement.textContent = customizationText;
            descriptionElement.style.display = 'block';
        }
        const priceElement = newCartItem.querySelector('[data-cart-price]');
        if (priceElement) {
            priceElement.textContent = basePrice.toFixed(2);
        }
        // Ensure the new cart item is visible and clickable
        newCartItem.style.display = 'flex';
        newCartItem.classList.add('focused');
        newCartItem.addEventListener('click', function() {
            handleCartItemClick(uniqueId);
        });
        cartList.appendChild(newCartItem);
        // Update the quantity-control amount field
        const quantityControlAmountElement = document.querySelector(`.customization-content[data-cart-customization-content="${uniqueId}"] .quantity-control .amount`);
        if (quantityControlAmountElement) {
            quantityControlAmountElement.setAttribute('amount', 1);
            quantityControlAmountElement.textContent = '1';
        }
        // Clone the corresponding item-customization element
        const originalItemCustomization = document.querySelector(`.item-customization[data-cart-customization="${originalCartItem.getAttribute('data-cart-item')}"]`);
        if (originalItemCustomization) {
            const newItemCustomization = originalItemCustomization.cloneNode(true);
            newItemCustomization.setAttribute('data-cart-customization', uniqueId);
            document.querySelector('.item-customization-list').appendChild(newItemCustomization);
        }
        // Clone the corresponding customization-content element
        const originalCustomizationContent = document.querySelector(`.customization-content[data-cart-customization-content="${originalCartItem.getAttribute('data-cart-item')}"]`);
        if (originalCustomizationContent) {
            const newCustomizationContent = originalCustomizationContent.cloneNode(true);
            newCustomizationContent.setAttribute('data-cart-customization-content', uniqueId);
            document.querySelector('.customization-list').appendChild(newCustomizationContent);
        }

        //Clone the meal item selections
        const mealItemSelectionContent = document.querySelector(`#drink-selection .customization-wrapper .customization-content[data-cart-customization-content="${originalCartItem.getAttribute('data-cart-item')}"]`);
        if (mealItemSelectionContent) {
            const newMealItemSelectionContent = mealItemSelectionContent.cloneNode(true);
            newMealItemSelectionContent.setAttribute('data-cart-customization-content', uniqueId);
            document.querySelector('#drink-selection .customization-wrapper .customization-list').appendChild(newMealItemSelectionContent);
        }

        const reviewItemCustomization = document.querySelector(`#meal-review .customization-section .item-customization[data-cart-customization="${originalCartItem.getAttribute('data-cart-item')}"]`);
        if (reviewItemCustomization) {
            const newReviewItemCustomization = reviewItemCustomization.cloneNode(true);
            newReviewItemCustomization.setAttribute('data-cart-customization', uniqueId);
            newReviewItemCustomization.setAttribute('data-name', uniqueId);
            newReviewItemCustomization.setAttribute('data-cart-customization-content', uniqueId);
            document.querySelector('#meal-review .customization-section .item-customization-list').appendChild(newReviewItemCustomization);
        }

        const reviewCustomizationContent = document.querySelector(`#meal-review .customization-wrapper .customization-content[data-cart-customization-content="${originalCartItem.getAttribute('data-cart-item')}"]`);
        if (reviewCustomizationContent) {
            const newReviewCustomizationContent = reviewCustomizationContent.cloneNode(true);
            newReviewCustomizationContent.setAttribute('data-cart-customization', uniqueId);
            newReviewCustomizationContent.setAttribute('data-name', uniqueId);
            newReviewCustomizationContent.setAttribute('data-cart-customization-content', uniqueId);
            document.querySelector('#meal-review .customization-wrapper .customization-list').appendChild(newReviewCustomizationContent);
        }
        
        // Reset customization states for the original item
        const originalCustomizationIngredients = document.querySelectorAll(`.customization-content[data-cart-customization-content="${originalCartItem.getAttribute('data-cart-item')}"] .customization-ingredient`);
        originalCustomizationIngredients.forEach(ingredient => {
            ingredient.classList.remove('focused');
        });

        // Update the cart subtotal and tax
        updateCartSubtotal();

        // Select the new cart item
        const cartItems = document.querySelectorAll('.cart-list .cart-item');
        cartItems.forEach(item => item.classList.remove('focused'));
        newCartItem.classList.add('focused');
        selectedItemName = uniqueId;

        // Store the customization data for the new item
        customizationData[uniqueId] = { customizationText: customizationText, amount: 1, ingredients: {} };
        saveCustomizationState(uniqueId, customizationData[uniqueId]);

        // Update the customization panel for the new item
        updateCustomizationPanel(uniqueId);

        // Ensure the meal-item description is updated
        const mealItemDescription = document.querySelector(`.meal-item[data-meal-item="${uniqueId}"] .order-item-description`);
        if (mealItemDescription) {
            mealItemDescription.textContent = customizationText;
            mealItemDescription.style.display = 'block';
        }

        var makeMealButton = $('[data-cart-customization="' + uniqueId +'"] #make-meal').get(0);
        var deleteButton = $('[data-cart-customization="' + uniqueId +'"] #remove-button').get(0);
        $(makeMealButton).attr('data-cart-customization', uniqueId);
        $(makeMealButton).attr('data-cart-item', uniqueId);
        $(deleteButton).attr('data-cart-customization', uniqueId);
        $(deleteButton).attr('data-cart-item', uniqueId);
        $(makeMealButton).on('click', function(event) { makeItAMeal(event) });
    }

    // Function to update item description based on customization ingredient click
    function updateItemDescription(customizationText) {
        console.log('updateItemDescription called with:', customizationText);
        if (!selectedItemName) {
            console.log('No selected item name');
            return;
        }
    
        const cartItemDescription = document.querySelector(`.cart-item[data-cart-item="${selectedItemName}"] .order-item-description.is--cart-description`);
        if (cartItemDescription) {
            let currentDescription = cartItemDescription.textContent.trim();
            if (currentDescription === '-') currentDescription = '';
    
            // Check if the customization type is "ADD"
            if (customizationText.startsWith('ADD')) {
                const baseText = customizationText.replace(/ \d+$/, ''); // Remove any existing number
                let match = currentDescription.match(new RegExp(`${baseText}( \\d+)?`));
                if (match) {
                    let currentAmount = match[1] ? parseInt(match[1].trim()) : 1;
                    currentAmount += 1;
                    currentDescription = currentDescription.replace(match[0], `${baseText} ${currentAmount}`);
                } else {
                    currentDescription = currentDescription ? `${currentDescription}, ${customizationText}` : customizationText;
                }
            } else {
                if (currentDescription.includes(customizationText)) {
                    currentDescription = currentDescription.replace(customizationText, '').replace(/,\s*,/g, ',').replace(/^,|,$/g, '').trim();
                } else {
                    currentDescription = currentDescription ? `${currentDescription}, ${customizationText}` : customizationText;
                }
            }
    
            cartItemDescription.textContent = currentDescription || '-';
            console.log('Updated cart item description:', currentDescription);
    
            // Show the cart item description if it has customizations
            cartItemDescription.style.display = currentDescription ? 'block' : 'none';
    
            // Update the meal-item description to match the cart-item description for both tabs
            const mealItemDescriptionTab1 = document.querySelector(`.meal-item[data-meal-item="${selectedItemName}"] .order-item-description`);
            const mealItemDescriptionTab2 = document.querySelector(`#drink-selection .meal-item[data-meal-item="${selectedItemName}"] .order-item-description`);
            if (mealItemDescriptionTab1) {
                mealItemDescriptionTab1.textContent = currentDescription;
                mealItemDescriptionTab1.style.display = 'block';
                console.log('Updated meal item description for Tab 1 to match cart item description:', currentDescription);
            } else {
                console.log('Meal item description element not found for Tab 1:', selectedItemName);
            }
            if (mealItemDescriptionTab2) {
                mealItemDescriptionTab2.textContent = currentDescription;
                mealItemDescriptionTab2.style.display = 'block';
                console.log('Updated meal item description for Tab 2 to match cart item description:', currentDescription);
            } else {
                console.log('Meal item description element not found for Tab 2:', selectedItemName);
            }
        } else {
            console.log('Cart item description element not found for:', selectedItemName);
        }
    }

    // Function to update description with incrementing amounts for "ADD" customization type
    function updateIncrementingDescription(target, ingredientName, customizationType) {
        console.log('Updating incrementing description for:', ingredientName);
        const customizationTextBase = `${customizationType} ${ingredientName}`;
        let currentDescription = target.textContent.trim();
        let match = currentDescription.match(new RegExp(`${customizationTextBase}( \\d+)?`));
        if (match) {
            let currentAmount = match[1] ? parseInt(match[1].trim()) : 1;
            currentAmount += 1;
            currentDescription = currentDescription.replace(match[0], `${customizationTextBase} ${currentAmount}`);
        } else {
            currentDescription = `${customizationTextBase}`;
        }
        console.log('Updated description:', currentDescription);
        return currentDescription;
    }

    // Event listener for the reset button
    document.querySelectorAll('#reset-customizations').forEach(button => {
        button.addEventListener('click', function(event) {
            resetCustomizations(event);
        });
    });

    // Function to reset item customization
    function resetCustomizations(event) {
        var cartItem = event.currentTarget.getAttribute('data-cart-item');
        if (!cartItem) {
            cartItem = event.currentTarget.getAttribute('data-name');
        }
        if (!cartItem) return;
    
        const cartItemElement = document.querySelector(`.cart-item[data-cart-item="${cartItem}"]`);
        if (!cartItemElement) return;
    
        // Reset cart item description
        const cartItemDescription = cartItemElement.querySelector('.order-item-description.is--cart-description');
        if (cartItemDescription) {
            cartItemDescription.textContent = '-';
            cartItemDescription.style.display = 'none';
        }
    
        // Reset meal item description
        const mealItemDescription = document.querySelector(`.meal-item[data-name="${cartItem}"] .order-item-description`);
        if (mealItemDescription) {
            mealItemDescription.textContent = '-';
        }
    
        console.log('Customizations reset for item:', cartItem);
    }
    
    // Function to handle drink selection click
    async function handleDrinkSelectionClick(event) {

        await delay(shortimeout); // Wait for certain time before executing the function

        let panelDrinkItem = event.target.closest('#panel-drink-item');
        const drinkNameMenu = event.target.id;
        const panelDrinkMenuItem = document.querySelector(`#panel-drink-item[data-drink-name="${drinkNameMenu}"]`);
        
        if (!panelDrinkItem && !panelDrinkMenuItem) return;
        if(!panelDrinkItem){
            panelDrinkItem = panelDrinkMenuItem;
        }
        
        const drinkName = panelDrinkItem.getAttribute('drink-name');
        const drinkId = panelDrinkItem.getAttribute('data-drink-name');
        const drinkImageSrc = panelDrinkItem.querySelector('.menu-item-image').src;
    
        if (!drinkName || !drinkImageSrc || !drinkId) return;
    
        const correspondingCartItem = document.querySelector(`.cart-item[data-cart-item="${selectedItemName}"]`);
        if (!correspondingCartItem) return;
    
        // Hide the drink-selection element
        const drinkSelectionElement = correspondingCartItem.querySelector('#drink-selection');
        if (drinkSelectionElement) {
            drinkSelectionElement.style.display = 'none';
            console.log('Hid drink-selection element for item:', selectedItemName);
        }
    
        // Display the meal-drink element
        const mealDrinkElement = correspondingCartItem.querySelector('#meal-drink');
        if (mealDrinkElement) {
            mealDrinkElement.style.display = 'flex';
            console.log('Displayed meal-drink element for item:', selectedItemName);
        }
    
        // Update the meal-drink-item text in the cart item
        const mealDrinkItemElement = correspondingCartItem.querySelector('#meal-drink-item');
        if (mealDrinkItemElement) {
            mealDrinkItemElement.innerText = drinkName;
            mealDrinkItemElement.setAttribute('data-meal-drink-title', drinkName);
            console.log('Updated meal-drink-item text to:', drinkName);
        }
    
        // Store the selected drink name and ID as custom attributes
        correspondingCartItem.setAttribute('data-selected-drink', drinkName);
        correspondingCartItem.setAttribute('data-drink-id', drinkId);
    
        // Update the meal-drink-item text in the meal-review customization step
        const mealReviewDrinkItemElement = document.querySelector(`.customization-content[data-cart-customization-content="${selectedItemName}"] #meal-item-drink .menu-item-name#meal-drink-item`);
        if (mealReviewDrinkItemElement) {
            mealReviewDrinkItemElement.innerText = drinkName;
            console.log('Updated meal-review drink item text to:', drinkName);
    
            // Force repaint
            mealReviewDrinkItemElement.style.display = 'none';
            mealReviewDrinkItemElement.offsetHeight; // Trigger reflow
            mealReviewDrinkItemElement.style.display = 'block';
        } else {
            console.log('mealReviewDrinkItemElement not found');
        }
    
        // Update the menu-item-image in the meal-review customization step
        const mealReviewDrinkImageElement = document.querySelector(`.customization-content[data-cart-customization-content="${selectedItemName}"] #meal-item-drink .menu-item-image`);
        if (mealReviewDrinkImageElement) {
            mealReviewDrinkImageElement.src = drinkImageSrc;
            console.log('Updated meal-review drink item image to:', drinkImageSrc);
        } else {
            console.log('mealReviewDrinkImageElement not found');
        }

        const mealReviewDrinkItem = document.querySelector(`.customization-content[data-cart-customization-content="${selectedItemName}"] #meal-item-drink`);
        if (mealReviewDrinkItem) {
            mealReviewDrinkItem.setAttribute('data-selected-drink', drinkName);
            mealReviewDrinkItem.setAttribute('data-drink-id', drinkId);
        } else {
            console.log('mealReviewDrinkItem not found');
        }
        
        // Switch to the meal-review tab
        switchTab(2);
        updateSizeAfterMeal(correspondingCartItem, mealReviewDrinkItemElement);
    }

    function updateSizeAfterMeal(cartItem, drinkItem) {
        const size = cartItem.querySelector("#meal-side #meal-side-size").textContent;
        const cartDrink = cartItem.querySelector("#meal-drink #meal-drink-size");

        if (cartDrink) {
            cartDrink.textContent = size;
            console.log("Updated drink meal size in cart to: ", size);
        }

        const customCartItem = drinkItem.parentElement.parentElement.parentElement.parentElement.parentElement;

        const sideCustomItem = customCartItem.querySelector("#meal-item-side #meal-item-size");
        const drinkCustomItem = customCartItem.querySelector("#meal-item-drink #meal-item-size");

        if (sideCustomItem) {
            sideCustomItem.textContent = size;
            console.log("Updated side size in custom cart to: ", size);
        }

        if (drinkCustomItem) {
            drinkCustomItem.textContent = size;
            console.log("updated drink size in custom cart to: ", size);
        }

        const buttonElement = customCartItem.querySelectorAll(".size-control")

        if (size === 'M') {
            buttonElement.forEach((button) => {
                const mediumButton = button.querySelector("#size-control-medium");
                mediumButton.classList.add("focused");
            })
        }

        if (size === 'L') {
            buttonElement.forEach((button) => {
                const LargeButton = button.querySelector("#size-control-large");
                LargeButton.classList.add("focused");
            })
        }
    }

    // Function to add event listeners to drink selection items
    function addDrinkSelectionListeners() {
        const panelDrinkItems = document.querySelectorAll('#panel-drink-item.customization-ingredient.is--drink-selection');
        panelDrinkItems.forEach(item => {
            item.removeEventListener('click', handleDrinkSelectionClick); // Remove existing listener
            item.addEventListener('click', handleDrinkSelectionClick); // Add new listener
        });
    }

    // Function to handle meal item click using item-content as the click area
    function handleMealItemClick(event) {
        const itemContent = event.currentTarget.closest('.item-content');
        if (!itemContent) return;
        const mealItem = itemContent.closest('.meal-item');
        const itemName = mealItem.getAttribute('data-name');
        console.log(`Meal item clicked: ${itemName}`);
        selectedItemName = itemName;
        switchTab(0); // Navigate to item-customization tab
        updateCustomizationPanel(itemName);
        showSelectedItemCustomization(itemName);
    }

    // Function to handle item content click within #meal-item-drink
    function handleItemContentClick(event) {
        const itemContent = event.currentTarget;

        //detect side or drink
        const side = itemContent.closest('.meal-item.is--meal-side');
        if(side) {
            
        }

        const drink = itemContent.closest('#meal-item-drink.meal-item');
        if(drink) {
            const itemName = drink.getAttribute('data-name');
            const drinkId = drink.getAttribute('data-drink-id');
            console.log(`Item content clicked: ${itemName}, Drink ID: ${drinkId}`);
            selectedItemName = itemName;
            switchTab(3); // Navigate to sub-item-customization tab
            updateSubItemCustomizationPanel(itemName, drinkId);
        }
    }

    // Function to update sub-item-customization panel
    function updateSubItemCustomizationPanel(itemName, drinkId) {
        const primaryCustomizationContent = document.querySelector(`sub-item-customization .customization-content[data-cart-customization-content="${itemName}"]`);
        //const subItemCustomizationContent = document.querySelector(`#sub-item-customization #customization-section .customization-content`);
        const drinkCustomizationContent = document.querySelector(`#sub-item-customization #customization-section .item-customization[data-cart-customization="${drinkId}"]`);

        $(primaryCustomizationContent).show();
        $(drinkCustomizationContent).show();
    }

    // Function to remove the selected item from the cart and reset customizations
    async function removeSelectedItem() {

        await delay(shortimeout); // Wait for certain time before executing the function
        if (!selectedItemName) {
            console.log('No selected item to remove');
            return;
        }
        // Find the selected cart item
        const cartItem = document.querySelector(`.cart-item[data-name="${selectedItemName}"]`);
        if (cartItem) {
            // Hide the cart item instead of removing it
            cartItem.style.display = 'none';
            console.log('Hid cart item:', selectedItemName);
            
            // Reset the amount and description
            const amountElement = cartItem.querySelector('.amount');
            if (amountElement) {
                amountElement.setAttribute('amount', 0);
                amountElement.textContent = 0;
            }
            const cartItemDescription = cartItem.querySelector('.order-item-description.is--cart-description');
            if (cartItemDescription) {
                cartItemDescription.textContent = '-';
                cartItemDescription.style.display = 'none';
            }

            // Reset customizations
            const mealItemDescription = document.querySelector(`.meal-item[data-name="${selectedItemName}"] .order-item-description`);
            if (mealItemDescription) {
                mealItemDescription.textContent = '-';
            }
            const mealItemAmountElement = document.querySelector(`.meal-item[data-name="${selectedItemName}"] .amount`);
            if (mealItemAmountElement) {
                mealItemAmountElement.setAttribute('amount', 0);
                mealItemAmountElement.textContent = 0;
            }

            // Reset customization ingredients
            const customizationIngredients = document.querySelectorAll('.customization-ingredient.focused');
            customizationIngredients.forEach(ingredient => {
                ingredient.classList.remove('focused');
            });

            // Hide the meal-info section
            const mealInfoSection = cartItem.querySelector('.meal-info');
            if (mealInfoSection) {
                mealInfoSection.style.display = 'none';
                console.log('Hid meal-info section for item:', selectedItemName);
            }

            // Hide the meal-tag element
            const mealTagElement = cartItem.querySelector('.cart-item-info .item-content .order-item-price-container .meal-tag');
            if (mealTagElement) {
                mealTagElement.style.display = 'none';
                console.log('Hid meal-tag element for item:', selectedItemName);
            }

            // Reset the amount for sub-cart-item elements
            const subCartItems = mealInfoSection ? mealInfoSection.querySelectorAll('.sub-cart-item .order-item-quantity.is--small') : [];
            subCartItems.forEach(subCartItem => {
                subCartItem.textContent = 0;
                console.log('Reset sub-cart-item amount to 0');
            });

            // Reset the size control buttons on tab 2 to the default states
            const sizeControlButtons = document.querySelectorAll(`#drink-selection .customization-content[data-cart-customization-content="${selectedItemName}"] .size-control .button.is--size-control`);
            sizeControlButtons.forEach(button => {
                button.classList.remove('focused');
            });
            const defaultSizeButton = document.querySelector(`#drink-selection .customization-content[data-cart-customization-content="${selectedItemName}"] .size-control .button.is--size-control[data-size="M"]`);
            if (defaultSizeButton) {
                defaultSizeButton.classList.add('focused');
            }

            // Reset the size text blocks to "M"
            // updateSizeTextBlocks('M', cartItem);

            // Clear the selected item name
            const oldItem = selectedItemName;
            selectedItemName = null;

            // Reset the tab back to 1
            switchTab(0);

            const firstItem = document.querySelectorAll('.cart-item-wrapper > [style="display: flex;"]');
            if (firstItem.length >= 1) {
                const customOldItemHeader = document.querySelector(`#item-customization .customization-wrapper [data-cart-customization-content="${oldItem}"]`);
                const customOldItemIngridients = document.querySelector(`#item-customization .customization-section [data-cart-customization="${oldItem}"]`);
                
                if (customOldItemHeader) {
                    customOldItemHeader.style.display = 'none';
                }

                if (customOldItemIngridients) {
                    customOldItemIngridients.style.display = 'none';
                }
            } else {
                const placeHolderPanel = document.querySelector('#panel-placeholder');
                if (placeHolderPanel) {
                    placeHolderPanel.style.display = 'block';
                }
            }
            console.log("Reset Customization panel");

            // Clear the tab state for the removed item
            delete itemTabState[cartItem.getAttribute('data-cart-item')];
        } else {
            console.log('Cart item not found for:', selectedItemName);
        }

        updateCartSubtotal();
    }

    // Event delegation for dynamically added items
    document.addEventListener('click', function(event) {
        if (event.target.closest('.customization-ingredient')) {
            handleCustomizationIngredientClick(event);
        }
        if (event.target.closest('#remove-button')) {
            removeSelectedItem();
        }
        if (event.target.textContent === 'Submit Order') {
            location.reload();
            console.log("Order submitted!");
        }
        if (event.target.closest('#save-drink')) {
            switchTab(2);
        }

    });

    // Function to handle Confirm Order display
    document.getElementById('confirm-order-button').addEventListener('click', async function() {
      
        await delay(longTimeout); // Wait for long timeout before executing the code

        // Update all .cart-item elements to be unselected
        document.querySelectorAll('.cart-item').forEach(item => {
            item.classList.remove('focused');
        });
    
        // Hide the element with the class .menu-wrap
        const menuWrap = document.querySelector('.menu-wrap');
        if (menuWrap) {
            menuWrap.style.display = 'none';
        }
    
        // Hide the element with the class .customization-panel
        const customizationPanel = document.querySelector('.customization-panel');
        if (customizationPanel) {
            customizationPanel.style.display = 'none';
        }
    
        // Update the width of the element .cart-customizations based on screen width
        const cartCustomizations = document.querySelector('.cart-customizations');
        if (cartCustomizations) {
            const screenWidth = window.innerWidth;
            if (screenWidth >= 1920) {
                cartCustomizations.style.minWidth = '352px';
                cartCustomizations.style.width = '352px';
            } else {
                cartCustomizations.style.minWidth = '200px';
                cartCustomizations.style.width = '200px';
            }
        }
    
        // Show the element with the class .cashier-wrap in Flex
        const cashierWrap = document.querySelector('.cashier-wrap');
        if (cashierWrap) {
            cashierWrap.style.display = 'flex';
        }
    
        // Hide the button element with the id #confirm-order-button
        const confirmOrderButton = document.getElementById('confirm-order-button');
        if (confirmOrderButton) {
            confirmOrderButton.style.display = 'none';
        }
    
        // Display the button element with the id #submit-order-button
        const submitOrderButton = document.getElementById('submit-order-button');
        if (submitOrderButton) {
            submitOrderButton.style.display = 'flex';
        }
    });

    // Function to handle Edit Order click
    document.getElementById('edit-order').addEventListener('click', function() {

        // Show the element with the class .menu-wrap
        const menuWrap = document.querySelector('.menu-wrap');
        if (menuWrap) {
            menuWrap.style.display = 'flex';
        }
    
        // Show the element with the class .customization-panel
        const customizationPanel = document.querySelector('.customization-panel');
        if (customizationPanel) {
            customizationPanel.style.display = 'flex';
        }
    
        // Update the width of the element .cart-customizations based on screen width
        const cartCustomizations = document.querySelector('.cart-customizations');
        if (cartCustomizations) {
            const screenWidth = window.innerWidth;
            if (screenWidth >= 1920) {
                cartCustomizations.style.minWidth = '752px';
                cartCustomizations.style.width = '752px';
            } else {
                cartCustomizations.style.minWidth = '448px';
                cartCustomizations.style.width = '448px';
            }
        }
    
        // Hide the element with the class .cashier-wrap
        const cashierWrap = document.querySelector('.cashier-wrap');
        if (cashierWrap) {
            cashierWrap.style.display = 'none';
        }
    
        // Show the button element with the id #confirm-order-button
        const confirmOrderButton = document.getElementById('confirm-order-button');
        if (confirmOrderButton) {
            confirmOrderButton.style.display = 'flex';
        }
    
        // Hide the button element with the id #submit-order-button
        const submitOrderButton = document.getElementById('submit-order-button');
        if (submitOrderButton) {
            submitOrderButton.style.display = 'none';
        }
    });

    // Event listener to close cashier page
    document.getElementById('close-cashier').addEventListener('click', function() {
        location.reload();
    });

    // Ensure content is fully loaded before attaching event listeners
    window.addEventListener('DOMContentLoaded', function() {
        jQuery(function() {
            // Content is loaded, event listeners are already attached via delegation
            addCustomizationIngredientListeners();
            addQuantityControlListeners();
            addDrinkSelectionListeners();
            setDefaultSizeControl(); 
            addSizeControlListeners();
        });
    });
})
