/*  Loop Subscription Bundle Snippet v1.9

Created and maintained by LOOP SUBSCRIPTIONS (https://apps.shopify.com/loop-subscriptions)
DO NOT modify source code of this file because
- It is an automatically generated file from LOOP SUBSCRIPTIONS backend.
- LOOP SUBSCRIPTIONS will keep releasing new versions of this file. You can check the latest version
  available by visiting Loop Admin > Bundles > Snippets > Install bundle snippet.
- Updating will replace the existing file implying that all the custom code on the existing file 
  (if any) will be lost. 
- If you need to make changes, please do it using our standard bundle style settings available inside each bundle details page on Loop admin portal.
If you need any help, please contact us at support@loopwork.co.
*/

const BUNDLE_LINK_PREFIX = "/a/loop_subscriptions/bundle";
const LOOP_BUNDLE_URL =
  "https://api-service.loopwork.co/bundleTransaction/getBundleCartDetails";
const LOOP_API_SERVICE_URL = "https://api-service.loopwork.co";
let BUNDLE_CONTAINER_CLASS = "BUNDLE_CONTAINER_CLASS";
let CART_SUBTOTAL_CLASS = "CART_SUBTOTAL_CLASS";

const getItemsHtml = (item) => {
  return `<p><span style="display:block;" class="data-cart-item-selling-plan-name">${
    item.title || ""
  } x ${item.quantity || ""}</span></p>`;
};

const getBundleCartItemsDiv = (bundleItem, index, bundleLink) => {
  return `
        <div style="display:flex; gap:20px; justify-content: space-between;" id="CartBundleItem-${index}">
          <div style="display:flex; gap:20px;">
            <div style="text-align:center;">
              <img
                src="${bundleItem.image || ""}" 
                alt="${bundleItem.label}" loading="lazy" width="75" height="75">
            </div>
            <div>
              <a href="${bundleLink}" 
                 style="font-weight:600">
                ${bundleItem.label || ""}
              </a>
              <div>
                ${bundleItem.items.map((item) => getItemsHtml(item)).join("")}
                  <br/>
                  <p><span>${bundleItem.sellingPlan || ""}</span></p>
              </div>
            </div>
          </div>
          <div>
            ${bundleItem.quantity}
          </div>
          <div>
            <div style="display: flex; gap: 10px;">
              <span style="text-decoration:line-through;"> ${
                bundleItem.priceWithoutDiscount
              } </span>
              <span style="font-weight: 600;">${bundleItem.amount}</span>
            </div>
            <div onclick="removeBundle('${
              bundleItem.bundleId
            }')" style="cursor:pointer; vertical-align: text-top; width: fit-content;height: 15px;display: inline-flex;flex-direction: row-reverse;">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" style="width: 1em; height: 1em;" aria-hidden="true" focusable="false" role="presentation" class="icon icon-remove">
                    <path d="M14 3h-3.53a3.07 3.07 0 00-.6-1.65C9.44.82 8.8.5 8 .5s-1.44.32-1.87.85A3.06 3.06 0 005.53 3H2a.5.5 0 000 1h1.25v10c0 .28.22.5.5.5h8.5a.5.5 0 00.5-.5V4H14a.5.5 0 000-1zM6.91 1.98c.23-.29.58-.48 1.09-.48s.85.19 1.09.48c.2.24.3.6.36 1.02h-2.9c.05-.42.17-.78.36-1.02zm4.84 11.52h-7.5V4h7.5v9.5z" fill="currentColor"></path>
                    <path d="M6.55 5.25a.5.5 0 00-.5.5v6a.5.5 0 001 0v-6a.5.5 0 00-.5-.5zM9.45 5.25a.5.5 0 00-.5.5v6a.5.5 0 001 0v-6a.5.5 0 00-.5-.5z" fill="currentColor"></path>
              </svg>
            </div>
          </div>
        </div>
    `;
};

const getBundleCartItemsTemplate = (bundleItem, index, bundleLink) => {
  return `
        <tr class="cart-item" id="CartBundleItem-${index}">
          <td class="cart-item__media" style="text-align:center;">
            <img class="cart-item__image" 
              src="${bundleItem.image || ""}" 
              alt="${bundleItem.label}" loading="lazy" width="75" height="75">
          </td>
          <td class="cart-item__details">
            <a href="${bundleLink}" 
              class="cart-item__name break">
              ${bundleItem.label || ""}
            </a>
            <dl>
              <div class="product-option">
                ${bundleItem.items.map((item) => getItemsHtml(item)).join("")}
                  <br/>
                  <p><span class="data-cart-item-selling-plan-name">${
                    bundleItem.sellingPlan || ""
                  }</span></p>
              </div>
            </dl>
          </td>
          <td class="cart-item__quantity small-hide">
            ${bundleItem.quantity}
          </td>
          <td class="right medium-hide large-up-hide">
            <div class="cart-item__price-wrapper" style="display: flex; gap: 10px;">
              <span class="price price--end" style="text-decoration:line-through;"> ${
                bundleItem.priceWithoutDiscount
              } </span>
              <span class="price price--end" style="font-weight: 600;">${
                bundleItem.amount
              }</span>
            </div>
            <div onclick="removeBundle('${
              bundleItem.bundleId
            }')" style="cursor:pointer; vertical-align: text-top; width: fit-content;height: 15px;display: inline-flex;flex-direction: row-reverse;">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" style="width: 1em; height: 1em;" aria-hidden="true" focusable="false" role="presentation" class="icon icon-remove">
                    <path d="M14 3h-3.53a3.07 3.07 0 00-.6-1.65C9.44.82 8.8.5 8 .5s-1.44.32-1.87.85A3.06 3.06 0 005.53 3H2a.5.5 0 000 1h1.25v10c0 .28.22.5.5.5h8.5a.5.5 0 00.5-.5V4H14a.5.5 0 000-1zM6.91 1.98c.23-.29.58-.48 1.09-.48s.85.19 1.09.48c.2.24.3.6.36 1.02h-2.9c.05-.42.17-.78.36-1.02zm4.84 11.52h-7.5V4h7.5v9.5z" fill="currentColor"></path>
                    <path d="M6.55 5.25a.5.5 0 00-.5.5v6a.5.5 0 001 0v-6a.5.5 0 00-.5-.5zM9.45 5.25a.5.5 0 00-.5.5v6a.5.5 0 001 0v-6a.5.5 0 00-.5-.5z" fill="currentColor"></path>
              </svg>
            </div>
          </td>
        </tr>
    `;
};

const getBundleCartDrawerTemplate = (bundleItem, index, bundleLink) => {
  return `
        <tr class="cart-item" id="CartBundleItem-${index}">
          <td class="cart-item__media" style="text-align:center;">
            <img class="cart-item__image" 
              src="${bundleItem.image || ""}" 
              alt="${bundleItem.label}" loading="lazy" width="75" height="75">
          </td>
          <td class="cart-item__details">
            <a href="${bundleLink}" 
              class="cart-item__name break">
              ${bundleItem.label || ""}
            </a>
            <dl>
              <div class="product-option">
                ${bundleItem.items.map((item) => getItemsHtml(item)).join("")}
                  <br/>
                  <p><span class="data-cart-item-selling-plan-name">${
                    bundleItem.sellingPlan || ""
                  }</span></p>
              </div>
            </dl>
          </td>
          <td class="cart-item__quantity small-hide">
            ${bundleItem.quantity}
          </td>
          <td class="right medium-hide large-up-hide">
            <div class="cart-item__price-wrapper medium-up" style="display: flex; gap: 10px;">
              <span class="price price--end" style="text-decoration:line-through;"> ${
                bundleItem.priceWithoutDiscount
              } </span>
              <span class="price price--end" style="font-weight: 600;">${
                bundleItem.amount
              }</span>
            </div>
            <div onclick="removeBundle('${
              bundleItem.bundleId
            }')" style="cursor:pointer; width: fit-content;height: 15px;display: inline-flex;flex-direction: row-reverse;">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" style="width: 1em; height: 1em;" aria-hidden="true" focusable="false" role="presentation" class="icon icon-remove">
                    <path d="M14 3h-3.53a3.07 3.07 0 00-.6-1.65C9.44.82 8.8.5 8 .5s-1.44.32-1.87.85A3.06 3.06 0 005.53 3H2a.5.5 0 000 1h1.25v10c0 .28.22.5.5.5h8.5a.5.5 0 00.5-.5V4H14a.5.5 0 000-1zM6.91 1.98c.23-.29.58-.48 1.09-.48s.85.19 1.09.48c.2.24.3.6.36 1.02h-2.9c.05-.42.17-.78.36-1.02zm4.84 11.52h-7.5V4h7.5v9.5z" fill="currentColor"></path>
                    <path d="M6.55 5.25a.5.5 0 00-.5.5v6a.5.5 0 001 0v-6a.5.5 0 00-.5-.5zM9.45 5.25a.5.5 0 00-.5.5v6a.5.5 0 001 0v-6a.5.5 0 00-.5-.5z" fill="currentColor"></path>
              </svg>
            </div>
          </td>
        </tr>
    `;
};

// returns cart item key of a bundleId
const getItemKeysByBundleId = (bundleId) => {
  const cartItems = window.Loop.bundleCartAllItems;
  const data = {
    updates: {},
  };
  for (const item of cartItems) {
    const _bundleId = item?.properties?.bundleId;
    if (!_bundleId || _bundleId !== bundleId) continue;
    data.updates[item.key] = 0;
  }
  return data;
};

// removes a bundleId from cart
const removeBundle = async (bundleId) => {
  const data = getItemKeysByBundleId(bundleId);
  const endpoint = `${window.Shopify.routes.root}cart/update.js`;
  await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  window.location.href = window.location.href;
};

// returns variants and quantity of item from a bundle
const _getSelectedBundleVariants = (bundleId) => {
  const _allBundleCartItems = window.Loop.bundleCartAllItems;
  let _selectedVariants = "";
  let _selectedQuantities = "";
  for (const _item of _allBundleCartItems) {
    const _bundleId = _item?.properties?.bundleId;
    if (!_bundleId || _bundleId !== bundleId) continue;
    _selectedVariants += `${_item.id},`;
    _selectedQuantities += `${_item.quantity},`;
  }
  return {
    selectedVariants: _selectedVariants.substring(
      0,
      _selectedVariants?.length - 1 //bcz we want to remove the last ","
    ),
    selectedQuantities: _selectedQuantities.substring(
      0,
      _selectedQuantities?.length - 1
    ),
  };
};

const _getLoopToken = async (shopifyDomain, bundleId) => {
  const _endpoint = `${LOOP_API_SERVICE_URL}/bundleTransaction/getToken?shopifyDomain=${shopifyDomain}&bundleTransactionId=${bundleId}`;
  const _response = await fetch(_endpoint);
  const _jsonRes = await _response.json();
  return _jsonRes?.token ?? "LOOP_TOKEN";
};

const editBundle = async (bundleId) => {
  console.log(`Editing bundle: ${bundleId}`);
  const { selectedVariants, selectedQuantities } = _getSelectedBundleVariants(
    bundleId
  );
  const _shopifyDomain = window?.Shopify?.shop;
  const _loopToken = await _getLoopToken(_shopifyDomain, bundleId);
  const _editBundleRef = `${BUNDLE_LINK_PREFIX}/change/${bundleId}?loop_token=${_loopToken}&selectedVariants=${selectedVariants}&selectedQuantities=${selectedQuantities}`;
  window.location.href = _editBundleRef;
};

const fetchBundleTransactionCartDetails = async (loopBundleGuid) => {
  const _endpoint = `${LOOP_BUNDLE_URL}/${loopBundleGuid}`;
  const _response = await fetch(_endpoint);
  return await _response.json();
};

const addExtraDetailsToBundleItems = async (bundleItems) => {
  let totalDiscount = 0;
  let currencySymbol = "";
  let currency = "";
  for (let i = 0; i < bundleItems.length; ++i) {
    const extraDetails = await fetchBundleTransactionCartDetails(
      bundleItems[i].bundleId
    );
    let price = bundleItems[i].price;
    bundleItems[i].label = extraDetails?.label;
    bundleItems[i].image = extraDetails?.image;
    bundleItems[i].sellingPlan = extraDetails?.name;
    bundleItems[i].priceWithoutDiscount = `${
      extraDetails.currencySymbol
    }${price.toFixed(2)}`;
    const totalBundleItemsQuantity = bundleItems[i]["items"].reduce(
      (acc, item) => {
        return acc + item.quantity;
      },
      0
    );

    if (extraDetails.discountType && extraDetails.discountValue) {
      if (extraDetails.discountType === "PERCENTAGE") {
        if (extraDetails.appliesOnEachItem) {
          // if discount in each item
          totalDiscount +=
            price *
            (parseFloat(extraDetails.discountValue) / 100) *
            totalBundleItemsQuantity;
          price =
            price -
            price *
              (parseFloat(extraDetails.discountValue) / 100) *
              totalBundleItemsQuantity;
        } else {
          totalDiscount +=
            price * (parseFloat(extraDetails.discountValue) / 100);
          price =
            price - price * (parseFloat(extraDetails.discountValue) / 100);
        }
      } else {
        if (extraDetails.appliesOnEachItem) {
          // if discount in each item
          totalDiscount +=
            parseFloat(extraDetails.discountValue) * totalBundleItemsQuantity;
          price =
            price -
            parseFloat(extraDetails.discountValue) * totalBundleItemsQuantity;
        } else {
          totalDiscount += parseFloat(extraDetails.discountValue);
          price = price - parseFloat(extraDetails.discountValue);
        }
      }
    }

    bundleItems[i].price = `${extraDetails.currencySymbol}${parseFloat(
      price.toFixed(2)
    )}`;
    bundleItems[i].amount = `${extraDetails.currencySymbol}${parseFloat(
      price.toFixed(2)
    )}`;
    bundleItems[i].loopBundleId = extraDetails.loopBundleId;
    currencySymbol = extraDetails.currencySymbol;
    currency = extraDetails.currency;
  }

  removeDiscountFromSubtotalInCart(totalDiscount, currencySymbol, currency);
};

const removeDiscountFromSubtotalInCart = (
  totalDiscount,
  currencySymbol,
  currency
) => {
  let targetNode = null;
  targetNode = document.querySelector(`.${CART_SUBTOTAL_CLASS}`);
  if (
    targetNode &&
    targetNode.firstChild &&
    targetNode.firstChild instanceof HTMLElement
  ) {
    if (
      targetNode.firstChild.firstChild &&
      !(targetNode.firstChild.firstChild instanceof HTMLElement)
    ) {
      targetNode = targetNode.firstChild;
    } else {
      return; // to handle NaN issue if child is actually an Html element and not text => 1 level child
    }
  }

  if (targetNode) {
    let innerHtml = targetNode.innerHTML;
    let priceWithoutCurrency = targetNode.innerHTML;
    let addCurrencyOnText = false;
    let addCurrencySymbol = false;

    if (innerHtml.includes(currency)) {
      addCurrencyOnText = true;
      priceWithoutCurrency = innerHtml.replace(currency, "");
    }

    if (priceWithoutCurrency.includes(currencySymbol)) {
      addCurrencySymbol = true;
      priceWithoutCurrency = priceWithoutCurrency.replace(currencySymbol, "");
    }

    priceWithoutCurrency.trim();
    let amount = Number(priceWithoutCurrency) - totalDiscount;
    let newText = `${addCurrencySymbol ? currencySymbol : ""}${amount.toFixed(
      2
    )} ${addCurrencyOnText ? currency : ""}`;
    targetNode.innerHTML = newText;
  }
};

const getBundleItems = (items) => {
  const bundleItemsMap = {};
  for (const item of items) {
    const bundleId = item?.properties?.bundleId;
    if (!bundleId) continue;
    if (!Object.hasOwn(bundleItemsMap, bundleId)) {
      bundleItemsMap[bundleId] = {
        bundleId,
        quantity: 1,
        price: (Number(item.price) * Number(item.quantity)) / 100,
        amount: (Number(item.price) * Number(item.quantity)) / 100,
        items: [item],
      };
    } else {
      bundleItemsMap[bundleId].price +=
        (Number(item.price) * Number(item.quantity)) / 100;
      bundleItemsMap[bundleId].amount +=
        (Number(item.price) * Number(item.quantity)) / 100;
      bundleItemsMap[bundleId].items.push(item);
    }
  }
  return Object.values(bundleItemsMap);
};

const renderBundleItems = (bundleItems, clientId) => {
  let _parent = document.querySelector(`.${clientId}`);
  if (!parent) {
    _parent = document.querySelector(`.${BUNDLE_CONTAINER_CLASS}`);
  }

  for (let i = 0; i < bundleItems.length; ++i) {
    const _bundleLink = `${BUNDLE_LINK_PREFIX}/${bundleItems[i].loopBundleId}`;
    let _template = undefined;
    let hasTable = document.getElementsByTagName("table");

    if (clientId.includes("drawer") && hasTable.length) {
      _template = getBundleCartDrawerTemplate(
        bundleItems[i],
        i + 1,
        _bundleLink
      );
    } else if (hasTable.length) {
      _template = getBundleCartItemsTemplate(
        bundleItems[i],
        i + 1,
        _bundleLink
      );
    } else {
      _template = getBundleCartItemsDiv(bundleItems[i], i + 1, _bundleLink);
    }
    _parent.innerHTML = `${_template} ${_parent.innerHTML}`;
  }
};

function setupMutationIfElementDelete() {
  let firstChange = true;
  let timeoutId;
  const handleChanges = () => {
      const subtotalValueElement = document.querySelector('.totals__subtotal-value'); //class which is getting deleted
      if (subtotalValueElement) {
          if (firstChange) {
              firstChange = false;
          } else {
              window.location.reload();
          }
      }
  };

  const targetNode = document.querySelector('.cart__blocks'); //parent class of getting deleted element
  if(!targetNode){
    return;
  }
  const observer = new MutationObserver(() => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleChanges, 1000);
  });
  const config = { childList: true, subtree: true };
  observer.observe(targetNode, config);
}

function setupMutation() {
  var firstChange = true;
  let targetNode = null;
  let observerNode = null;
  targetNode = document.querySelectorAll(`[data-cart-subtotal]`);
  if ((targetNode && targetNode.length > 1) || !targetNode.length) {
    observerNode = document.querySelector(`.${CART_SUBTOTAL_CLASS}`);
  } else {
    observerNode = targetNode[0];
  }

  if (!observerNode) {
    return;
  }

  const config = { attributes: true, childList: true, subtree: true };
  const callback = (mutationList, observer) => {
    if (firstChange) {
      firstChange = false;
      return;
    } else {
      firstChange = true;
      setTimeout(window.location.reload(), 1000);
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(observerNode, config);
}

const bootstrap = async (clientId) => {
  console.log(`Loop Bundle Initialized for ${clientId}`);

  try {
    let response = await fetch(
      `https://snippets.loopwork.co/bundle/${Shopify.shop}/${Shopify.theme.id}.json`
    );

    let data = (await response.json()) || {};
    // console.log("data", data);
    if (Object.keys(data).length) {
      BUNDLE_CONTAINER_CLASS = data.cartContainerClass;
      CART_SUBTOTAL_CLASS = data.cartSubtotalClass;
    }
  } catch (error) {
    console.log("Error fetching loop bundle classes");
  }

  // have to call any one of this two
  let targetNodes = document.querySelectorAll(`[data-cart-subtotal]`);
  if (targetNodes.length) {
    setupMutation();
  } else {
    setupMutationIfElementDelete();
  }

  const _cartItems = window.Loop.bundleCartAllItems;
  const _bundleItems = getBundleItems(_cartItems);
  await addExtraDetailsToBundleItems(_bundleItems);
  renderBundleItems(_bundleItems, clientId);
};
