const USERS = [
    {
        email: "email",
        password: "pw"
    }
];

const ITEMS = [
    {
        id: 247,
        name: "Jell-O Berry Blue",
        description: "Notre gelée la plus plébiscitée !",
        img: "../public/images/blueberry.webp",
        price: 2.25,
        quantity: 5,
        category: "blue"
    },
    {
        id: 356,
        name: "Jell-O Cherry",
        description: "Le Jell-O de Saint Valentin à la cerise.",
        img: "../public/images/cherry.webp",
        price: 1.99,
        quantity: 2,
        category: "red"
    },
    {
        id: 645,
        name: "Jell-O Raspberry",
        description: "Le Jell-O trop rigolo !",
        img: "../public/images/raspberry.webp",
        price: 2,
        quantity: 0,
        category: "red"
    }
];

const mainContent = document.getElementById("main-content");
const itemsContainer = document.getElementById("items-container");
const allNavButtons = document.querySelectorAll("nav li a");
const basketElement = document.querySelector("#basket-label");
const tableRef = document.getElementById("basket-table");
const basketItemsCounter = document.querySelector("#basket-items-counter");
const counterBadge = document.querySelector("#counter-badge");
const buyBtn = document.querySelector("#buy-btn");

//stringify and parse map in localeStorage
function replacer(key, value) {
    if (value instanceof Map) {
        return {
            dataType: "Map",
            value: Array.from(value.entries()) // or with spread: value: [...value]
        };
    } else {
        return value;
    }
}
function reviver(key, value) {
    if (typeof value === "object" && value !== null) {
        if (value.dataType === "Map") {
            return new Map(value.value);
        }
    }
    return value;
}
let basket = new Map();
if (window.localStorage.getItem("basket") != null) {
    basket = JSON.parse(localStorage.getItem("basket"), reviver);
}

console.log(basket);
generateCards(ITEMS);
console.log(document.querySelector("#basket-table tbody").innerHTML);
generateBasket();
refreshBadgesAndCounters();

const logo = document.querySelector("#logo");
logo.addEventListener("click", () => handleNavBtnClick(homeButtons));

buyBtn.addEventListener("click", () => validateCart());

const homeButtons = document.querySelectorAll(".home-btn");
for (element of homeButtons) {
    element.addEventListener("click", () => handleNavBtnClick(homeButtons));
}

const blue = document.querySelectorAll(".blue-jello-btn");
for (element of blue) {
    element.addEventListener("click", () => handleNavBtnClick(blue));
}

const red = document.querySelectorAll(".red-jello-btn");
for (element of red) {
    element.addEventListener("click", () => handleNavBtnClick(red));
}

function handleNavBtnClick(concernedElements) {
    for (element of allNavButtons) {
        element.classList.remove("font-bold", "underline");
    }
    for (element of concernedElements) {
        element.classList.add("font-bold", "underline");
    }
    if (concernedElements[0].classList.contains("blue-jello-btn"))
        generateCards(ITEMS, "blue");
    else if (concernedElements[0].classList.contains("red-jello-btn"))
        generateCards(ITEMS, "red");
    else generateCards(ITEMS);
}

function generateCards(items, category) {
    itemsContainer.innerHTML = items
        .filter(
            (item) =>
                item.category ===
                (category !== undefined ? category : item.category)
        )
        .map(
            (item) =>
                `
        <div class="card w-96 bg-base-100 shadow-xl  mx-auto my-4 button-pop">
            <figure class="cursor-pointer scale">
                <img src="${item.img}" alt="photo de ${
                    item.name
                }" class="hover:scale-105 ease-in-out duration-300 overflow-hidden"/>
            </figure>
            <div class="card-body pt-0">
                <h2 class="card-title">
                ${item.name}
                    <div class="badge badge-secondary ml-auto">${
                        item.price
                    }€</div>
                </h2>
                <p>${item.description}</p>
                <div class="card-actions justify-end">
                    <button onclick="addToBasket(${
                        item.id
                    })" class="btn btn-primary ${
                    item.quantity < 1 ? "btn-disabled" : ""
                }">
                    ${
                        item.quantity < 1
                            ? "Rupture de stock"
                            : "Ajouter au panier"
                    }
                    </button>
                </div>
            </div>
        </div>`
        )
        .join("<br>");
}

function generateBasket() {
    const myNode = document.querySelector("#basket-table tbody");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.lastChild);
    }
    for (const objectItem of basket.keys()) {
        myNode.insertAdjacentHTML(
            "beforeend",
            `
            <tr id="basket-tr-${objectItem.id}">
            <td >
                <div
                    class="flex items-center space-x-3"
                >
                    <div class="avatar">
                        <div
                            class="mask mask-squircle h-12 w-12"
                        >
                            <img
                                src="${objectItem.img}"
                                alt="Avatar Tailwind CSS Component"
                            />
                        </div>
                    </div>
                </div>
            </td>
            
            <td>
            ${objectItem.name}
            </td>
            <td>${new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "EUR"
            }).format(objectItem.price)}</td>
            <td><label for=" id="select-${objectItem.id}"">Qté:</label>
            <select id="select-${
                objectItem.id
            }" class="select select-sm select-bordered max-w-xs h-12" onchange="
            updateQuantity(${objectItem.id}, this.value)
            ">
                
                <option selected value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
              </select></td>
            <td id="subtotal-${objectItem.id}">
                ${new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "EUR"
                }).format(objectItem.price * basket.get(objectItem))}
            </td>
            
            
            <td>
                <button
                    class="btn-ghost btn-xs btn outline"
                    onclick="updateQuantity(${objectItem.id}, 0)"
                >
                    Supprimer
                </button>
            </td>
        </tr>`
        );

        /*  const selectedVal = document.getElementById(
                `select-${objectItem.id}`
            ).selectedIndex; */
        document.getElementById(`select-${objectItem.id}`).selectedIndex =
            basket.get(objectItem) - 1;
    }
    refreshBadgesAndCounters();
}

function addToBasket(itemId) {
    const objectItem = ITEMS.find((x) => x.id === itemId);
    let indexx = 0;
    for (key of basket.keys()) {
        if (_.isEqual(key, objectItem)) {
            console.log(basket.get(key));
            const oldval = basket.get(key);
            basket.delete(key);
            const arr = Array.from(basket);
            console.log(arr.flat().toString());
            arr.splice(indexx, 0, [objectItem, +oldval]);
            console.log(arr.toString());
            basket = new Map(arr);
            break;
        }
        indexx++;
    }

    if (basket.has(objectItem)) {
        console.log("hiiii");
        const newQty = basket.get(objectItem) + 1;

        if (newQty < 11) {
            console.log(typeof newQty);
            basket.set(objectItem, newQty);
            const selectedVal = document.getElementById(
                `select-${objectItem.id}`
            ).selectedIndex;
            document.getElementById(`select-${objectItem.id}`).selectedIndex =
                newQty - 1;
        }
    } else {
        basket.set(objectItem, 1);
    }

    generateBasket();
    basketElement.focus();
}

function updateQuantity(itemId, newQty) {
    const objectItem = ITEMS.find((x) => x.id === itemId);
    let indexx = 0;
    for (key of basket.keys()) {
        if (_.isEqual(key, objectItem)) {
            console.log(basket.get(key));
            const oldval = basket.get(key);
            basket.delete(key);
            const arr = Array.from(basket);
            console.log(arr.flat().toString());
            arr.splice(indexx, 0, [objectItem, +oldval]);
            console.log(arr.toString());
            basket = new Map(arr);
            break;
        }
        indexx++;
    }
    if (newQty == 0) {
        console.log(basket);
        basket.delete(objectItem);
        console.log(basket);
        document.getElementById(`basket-tr-${objectItem.id}`).remove();
    } else {
        basket.set(objectItem, newQty);
        document.getElementById(`select-${objectItem.id}`).selectedIndex =
            +newQty - 1;
        document.getElementById(
            `subtotal-${objectItem.id}`
        ).innerHTML = `${new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "EUR"
        }).format(objectItem.price * newQty)}`;
    }
    generateBasket();
    basketElement.focus();
}

function refreshBadgesAndCounters() {
    //mettre à jour badge sur l'icone panier
    let totalArticles = 0;
    for (const value of basket.values()) {
        totalArticles += +value;
    }
    counterBadge.textContent = `${totalArticles}`;
    //mettre à jour phrase quantité d'articles dans le panier
    basketItemsCounter.textContent = `${totalArticles} ${
        totalArticles < 2 ? "article, " : "articles, "
    }`;
    //mettre à jour le sous-total
    const subtotalDiv = document.querySelector("#subtotal");
    let subtotal = 0;
    for (const item of basket.keys()) {
        subtotal += item.price * basket.get(item);
    }
    //ça ou .toFixed(2) ou tout stocker en centimes puis /100 pour la vraie somme. Mais ne pas utiliser de float
    subtotalDiv.textContent = `Total: ${new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR"
    }).format(subtotal)}`; //textContent ? meilleure manière TODO ?

    window.localStorage.setItem("basket", JSON.stringify(basket, replacer));
}

function validateCart() {
    console.log("validateCart() called");
    document.activeElement.blur();
    for (element of allNavButtons) {
        element.classList.remove("font-bold", "underline");
    }
    itemsContainer.innerHTML = `<form class="mx-auto">
<div class="mt-10 space-y-24 pb-px">

  <div class="border-b border-gray-900/10 pb-12">
    <h2 class="text-base font-semibold leading-7 text-gray-900">Entrez vos coordonées pour la commande :</h2>

    <div class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
      <div class="sm:col-span-3">
        <label for="first-name" class="block text-sm font-medium leading-6 text-gray-900">Prénom</label>
        <div class="mt-2">
          <input type="text" name="first-name" id="first-name" autocomplete="given-name" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
        </div>
      </div>

      <div class="sm:col-span-3">
        <label for="last-name" class="block text-sm font-medium leading-6 text-gray-900">Nom</label>
        <div class="mt-2">
          <input type="text" name="last-name" id="last-name" autocomplete="family-name" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
        </div>
      </div>

      <div class="sm:col-span-4">
        <label for="email" class="block text-sm font-medium leading-6 text-gray-900">Email</label>
        <div class="mt-2">
          <input id="email" name="email" type="email" autocomplete="email" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
        </div>
      </div>

      <div class="col-span-full">
        <label for="street-address" class="block text-sm font-medium leading-6 text-gray-900">Adresse</label>
        <div class="mt-2">
          <input type="text" name="street-address" id="street-address" autocomplete="street-address" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
        </div>
      </div>

      <div class="sm:col-span-2 sm:col-start-1">
        <label for="city" class="block text-sm font-medium leading-6 text-gray-900">Ville</label>
        <div class="mt-2">
          <input type="text" name="city" id="city" autocomplete="address-level2" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
        </div>
      </div>

      <div class="sm:col-span-2">
      <label for="postal-code" class="block text-sm font-medium leading-6 text-gray-900">Code Postal</label>
      <div class="mt-2">
        <input type="text" name="postal-code" id="postal-code" autocomplete="postal-code" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
      </div>
    </div>

      <div class="sm:col-span-2">
        <label for="country" class="block text-sm font-medium leading-6 text-gray-900">Pays</label>
        <div class="mt-2">
          <input type="text" name="country" id="country" autocomplete="country" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
        </div>
      </div>

    
    </div>
  </div>
</div>

<div class="mt-6 flex items-center justify-end gap-x-6">
  <button onclick="confirmOrderValidated()" type="submit" class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Passer la commande</button>
</div>
</form>`;
}

function confirmOrderValidated() {
    itemsContainer.innerHTML = `<h5 class="mx-auto mt-56 underline text-xl">Félicitations votre commande a été validée<h5>`
}
